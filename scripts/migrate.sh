#!/bin/bash
# ============================================
# 423D Built - Database Migration Script
# ============================================
# Runs Prisma migrations against the database.
# Waits for the database to be ready before proceeding.
#
# Usage:
#   ./scripts/migrate.sh              # Run migrations only
#   ./scripts/migrate.sh --seed       # Run migrations + seed
#   ./scripts/migrate.sh --status     # Show migration status
#   ./scripts/migrate.sh --reset      # Reset database (DESTRUCTIVE!)
#
# Environment:
#   DATABASE_URL must be set (or .env file must exist)
# ============================================

set -euo pipefail

# ---- Configuration ----
MAX_RETRIES=30
RETRY_INTERVAL=2
SEED=false
STATUS_ONLY=false
RESET=false

# ---- Color Output ----
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

log_info()  { echo -e "${GREEN}[INFO]${NC}  $(date '+%Y-%m-%d %H:%M:%S') $1"; }
log_warn()  { echo -e "${YELLOW}[WARN]${NC}  $(date '+%Y-%m-%d %H:%M:%S') $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $(date '+%Y-%m-%d %H:%M:%S') $1"; }

# ---- Parse Arguments ----
for arg in "$@"; do
    case $arg in
        --seed)
            SEED=true
            shift
            ;;
        --status)
            STATUS_ONLY=true
            shift
            ;;
        --reset)
            RESET=true
            shift
            ;;
        --help|-h)
            echo "Usage: $0 [--seed] [--status] [--reset]"
            echo ""
            echo "Options:"
            echo "  --seed     Run database seed after migration"
            echo "  --status   Show migration status and exit"
            echo "  --reset    Reset database and re-run all migrations (DESTRUCTIVE!)"
            echo "  --help     Show this help message"
            exit 0
            ;;
        *)
            log_error "Unknown argument: $arg"
            echo "Run '$0 --help' for usage information."
            exit 1
            ;;
    esac
done

# ---- Load Environment Variables ----
# Look for .env file in the project root (parent of scripts/)
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "${SCRIPT_DIR}")"

if [ -f "${PROJECT_ROOT}/.env" ]; then
    log_info "Loading environment from ${PROJECT_ROOT}/.env"
    set -a
    source "${PROJECT_ROOT}/.env"
    set +a
elif [ -f "${PROJECT_ROOT}/.env.local" ]; then
    log_info "Loading environment from ${PROJECT_ROOT}/.env.local"
    set -a
    source "${PROJECT_ROOT}/.env.local"
    set +a
fi

# ---- Validate DATABASE_URL ----
if [ -z "${DATABASE_URL:-}" ]; then
    log_error "DATABASE_URL is not set!"
    log_error "Set it in your .env file or export it as an environment variable."
    exit 1
fi

log_info "Database URL: ${DATABASE_URL%%@*}@****"

# ---- Wait for Database to be Ready ----
log_info "Waiting for database to be ready..."

# Extract host and port from DATABASE_URL
# Format: postgresql://user:password@host:port/dbname
DB_HOST=$(echo "${DATABASE_URL}" | sed -n 's|.*@\([^:]*\):.*|\1|p')
DB_PORT=$(echo "${DATABASE_URL}" | sed -n 's|.*:\([0-9]*\)/.*|\1|p')

if [ -z "${DB_HOST}" ] || [ -z "${DB_PORT}" ]; then
    log_warn "Could not parse host/port from DATABASE_URL. Skipping connectivity check."
else
    RETRIES=0
    until pg_isready -h "${DB_HOST}" -p "${DB_PORT}" -q 2>/dev/null || nc -z "${DB_HOST}" "${DB_PORT}" 2>/dev/null; do
        RETRIES=$((RETRIES + 1))
        if [ "${RETRIES}" -ge "${MAX_RETRIES}" ]; then
            log_error "Database at ${DB_HOST}:${DB_PORT} is not ready after $((MAX_RETRIES * RETRY_INTERVAL)) seconds."
            log_error "Make sure the database is running and accessible."
            exit 1
        fi
        log_info "Database not ready yet... retrying in ${RETRY_INTERVAL}s (attempt ${RETRIES}/${MAX_RETRIES})"
        sleep "${RETRY_INTERVAL}"
    done
    log_info "Database is ready!"
fi

# ---- Change to Project Root ----
cd "${PROJECT_ROOT}"

# ---- Status Only ----
if [ "${STATUS_ONLY}" = true ]; then
    log_info "Checking migration status..."
    npx prisma migrate status
    exit 0
fi

# ---- Reset (Destructive) ----
if [ "${RESET}" = true ]; then
    log_warn "============================================"
    log_warn "  WARNING: This will DESTROY all data!"
    log_warn "============================================"
    read -p "Are you sure you want to reset the database? (yes/no): " CONFIRM
    if [ "${CONFIRM}" != "yes" ]; then
        log_info "Reset cancelled."
        exit 0
    fi
    log_info "Resetting database..."
    npx prisma migrate reset --force
    log_info "Database reset complete."
    exit 0
fi

# ---- Run Migrations ----
log_info "Running Prisma migrations (deploy mode)..."

if npx prisma migrate deploy; then
    log_info "Migrations applied successfully."
else
    MIGRATE_EXIT=$?
    log_error "Migration failed with exit code ${MIGRATE_EXIT}"
    log_info "Checking migration status for details..."
    npx prisma migrate status || true
    exit ${MIGRATE_EXIT}
fi

# ---- Generate Prisma Client ----
log_info "Generating Prisma client..."
npx prisma generate

# ---- Run Seed (if requested) ----
if [ "${SEED}" = true ]; then
    log_info "Running database seed..."
    if npx prisma db seed; then
        log_info "Database seeded successfully."
    else
        log_warn "Seed failed. The database may already contain data."
        log_warn "Seed uses upsert operations, so re-running is generally safe."
    fi
fi

# ---- Done ----
echo ""
log_info "============================================"
log_info "Migration complete!"
log_info "============================================"
