#!/bin/bash
# ============================================
# 423D Built - Backup Script
# ============================================
# Creates timestamped backups of the PostgreSQL database
# and the uploads directory. Old backups are pruned after
# the retention period (default: 30 days).
#
# Usage:
#   ./scripts/backup.sh                # Run backup with defaults
#   ./scripts/backup.sh /path/to/dir   # Custom backup directory
#
# Recommended cron entry (daily at 2 AM):
#   0 2 * * * /path/to/423D-Built/scripts/backup.sh >> /var/log/423d-backup.log 2>&1
# ============================================

set -euo pipefail

# ---- Configuration ----
BACKUP_DIR="${1:-$HOME/backups/423d-built}"
RETENTION_DAYS=30
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")

# Docker container names (must match docker-compose.yml)
DB_CONTAINER="423d-db"

# PostgreSQL credentials (pulled from the running container's environment)
DB_USER="${POSTGRES_USER:-postgres}"
DB_NAME="${POSTGRES_DB:-fourtwentythree_d_built}"

# Uploads source (Docker volume mount path or local path)
UPLOADS_VOLUME="423d-uploads"

# ---- Color Output ----
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

log_info()  { echo -e "${GREEN}[INFO]${NC}  $(date '+%Y-%m-%d %H:%M:%S') $1"; }
log_warn()  { echo -e "${YELLOW}[WARN]${NC}  $(date '+%Y-%m-%d %H:%M:%S') $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $(date '+%Y-%m-%d %H:%M:%S') $1"; }

# ---- Create Backup Directories ----
log_info "Creating backup directories..."
mkdir -p "${BACKUP_DIR}/database"
mkdir -p "${BACKUP_DIR}/uploads"

# ---- Database Backup ----
log_info "Starting PostgreSQL backup..."
DB_BACKUP_FILE="${BACKUP_DIR}/database/423d_db_${TIMESTAMP}.sql.gz"

# Use pg_dump inside the running Docker container and pipe through gzip
if docker exec "${DB_CONTAINER}" pg_dump -U "${DB_USER}" -d "${DB_NAME}" --clean --if-exists | gzip > "${DB_BACKUP_FILE}"; then
    DB_SIZE=$(du -h "${DB_BACKUP_FILE}" | cut -f1)
    log_info "Database backup complete: ${DB_BACKUP_FILE} (${DB_SIZE})"
else
    log_error "Database backup FAILED!"
    exit 1
fi

# ---- Uploads Backup ----
log_info "Starting uploads directory backup..."
UPLOADS_BACKUP_FILE="${BACKUP_DIR}/uploads/423d_uploads_${TIMESTAMP}.tar.gz"

# Get the mount point of the Docker volume and create a tarball
UPLOADS_MOUNT=$(docker volume inspect "${UPLOADS_VOLUME}" --format '{{ .Mountpoint }}' 2>/dev/null || echo "")

if [ -n "${UPLOADS_MOUNT}" ]; then
    # Back up from Docker volume mount point (requires root or docker group)
    if sudo tar -czf "${UPLOADS_BACKUP_FILE}" -C "${UPLOADS_MOUNT}" . 2>/dev/null; then
        UPLOADS_SIZE=$(du -h "${UPLOADS_BACKUP_FILE}" | cut -f1)
        log_info "Uploads backup complete: ${UPLOADS_BACKUP_FILE} (${UPLOADS_SIZE})"
    else
        log_warn "Could not access Docker volume directly, trying docker cp..."
        # Fallback: copy from running container
        TEMP_DIR=$(mktemp -d)
        docker cp "${DB_CONTAINER}:/app/uploads" "${TEMP_DIR}/uploads" 2>/dev/null || true
        tar -czf "${UPLOADS_BACKUP_FILE}" -C "${TEMP_DIR}" uploads
        rm -rf "${TEMP_DIR}"
        UPLOADS_SIZE=$(du -h "${UPLOADS_BACKUP_FILE}" | cut -f1)
        log_info "Uploads backup complete (via docker cp): ${UPLOADS_BACKUP_FILE} (${UPLOADS_SIZE})"
    fi
else
    log_warn "Docker volume '${UPLOADS_VOLUME}' not found. Skipping uploads backup."
fi

# ---- Prune Old Backups ----
log_info "Pruning backups older than ${RETENTION_DAYS} days..."

DB_PRUNED=$(find "${BACKUP_DIR}/database" -name "423d_db_*.sql.gz" -type f -mtime +${RETENTION_DAYS} -print -delete | wc -l)
UPLOADS_PRUNED=$(find "${BACKUP_DIR}/uploads" -name "423d_uploads_*.tar.gz" -type f -mtime +${RETENTION_DAYS} -print -delete | wc -l)

if [ "${DB_PRUNED}" -gt 0 ] || [ "${UPLOADS_PRUNED}" -gt 0 ]; then
    log_info "Pruned ${DB_PRUNED} database backup(s) and ${UPLOADS_PRUNED} uploads backup(s)."
else
    log_info "No old backups to prune."
fi

# ---- Optional: Sync to S3 ----
# Uncomment and configure the following lines to sync backups to an S3 bucket.
# Requires AWS CLI to be installed and configured (aws configure).
#
# S3_BUCKET="s3://your-bucket-name/423d-built-backups"
# log_info "Syncing backups to S3: ${S3_BUCKET}..."
# aws s3 sync "${BACKUP_DIR}/database" "${S3_BUCKET}/database" --storage-class STANDARD_IA
# aws s3 sync "${BACKUP_DIR}/uploads" "${S3_BUCKET}/uploads" --storage-class STANDARD_IA
# log_info "S3 sync complete."

# ---- Summary ----
echo ""
log_info "============================================"
log_info "Backup complete!"
log_info "  Database: ${DB_BACKUP_FILE}"
if [ -f "${UPLOADS_BACKUP_FILE}" ]; then
    log_info "  Uploads:  ${UPLOADS_BACKUP_FILE}"
fi
log_info "  Retention: ${RETENTION_DAYS} days"
log_info "============================================"
