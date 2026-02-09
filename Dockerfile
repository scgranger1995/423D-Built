# ============================================
# 423D Built - Production Dockerfile
# Multi-stage build for Next.js standalone output
# ============================================

# ---- Stage 1: Install dependencies ----
FROM node:20-alpine AS deps

# Install libc6-compat for Alpine Node.js compatibility
RUN apk add --no-cache libc6-compat

WORKDIR /app

# Copy dependency manifests
COPY package.json package-lock.json* yarn.lock* pnpm-lock.yaml* ./

# Copy prisma schema so we can generate the client in this stage
COPY prisma ./prisma/

# Install dependencies based on the available lockfile
RUN \
  if [ -f yarn.lock ]; then yarn --frozen-lockfile; \
  elif [ -f package-lock.json ]; then npm ci; \
  elif [ -f pnpm-lock.yaml ]; then corepack enable pnpm && pnpm i --frozen-lockfile; \
  else echo "No lockfile found." && npm install; \
  fi

# Generate Prisma Client (must happen after node_modules are installed)
RUN npx prisma generate


# ---- Stage 2: Build the application ----
FROM node:20-alpine AS builder

WORKDIR /app

# Copy node_modules and generated Prisma client from deps stage
COPY --from=deps /app/node_modules ./node_modules

# Copy the full source code
COPY . .

# Set build-time environment variables
# DATABASE_URL is required at build time for Prisma but won't be used at runtime
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

# Build the Next.js application (standalone output)
RUN npm run build


# ---- Stage 3: Production runner ----
FROM node:20-alpine AS runner

WORKDIR /app

# Set production environment
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Create a non-root user for security
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy the public directory (static assets like images, favicon, etc.)
COPY --from=builder /app/public ./public

# Create the uploads directory and set ownership
RUN mkdir -p ./uploads && chown nextjs:nodejs ./uploads

# Copy the standalone server output from the build stage
# The standalone output includes a minimal server.js and required node_modules
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Copy Prisma schema and migrations for runtime migration support
# This allows running `prisma migrate deploy` inside the container
COPY --from=builder /app/prisma ./prisma

# Copy the generated Prisma client into the standalone node_modules
# The standalone output may not include all of node_modules, so we ensure
# the Prisma client and engine binaries are available at runtime
COPY --from=deps /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=deps /app/node_modules/@prisma ./node_modules/@prisma

# Switch to non-root user
USER nextjs

# Expose the application port
EXPOSE 3000

# Health check endpoint - adjust path if you have a custom health route
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/ || exit 1

# Start the standalone Next.js server
CMD ["node", "server.js"]
