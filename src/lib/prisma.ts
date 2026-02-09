import { PrismaClient } from "@prisma/client";

/**
 * Singleton Prisma Client for Next.js
 *
 * In development, Next.js clears the Node.js module cache on every
 * hot-reload, which would create a new PrismaClient instance each time.
 * This leads to exhausting the database connection pool. By attaching
 * the client to the global object, we reuse the same instance across
 * hot-reloads.
 *
 * In production, this simply creates a single PrismaClient instance.
 */

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

export default prisma;
