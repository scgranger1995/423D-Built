import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { authConfig } from "@/lib/auth.config";

// Full auth config with Credentials provider (server-only, uses Prisma + bcrypt)
export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const email = credentials.email as string;
        const password = credentials.password as string;

        const user = await prisma.user.findUnique({
          where: { email },
        });

        if (!user) {
          return null;
        }

        const isValid = await bcrypt.compare(password, user.passwordHash);

        if (!isValid) {
          return null;
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        };
      },
    }),
  ],
});

/**
 * Server-side helper to get the current session and verify admin role.
 */
export async function requireAdmin() {
  const session = await auth();

  if (!session?.user) {
    return null;
  }

  const role = (session.user as unknown as { role?: string }).role;
  if (role !== "ADMIN" && role !== "EDITOR") {
    return null;
  }

  return session;
}

/**
 * Helper for API routes - returns a Response if not authorized.
 */
export async function requireAdminApi() {
  const session = await auth();

  if (!session?.user) {
    return {
      authorized: false as const,
      response: Response.json(
        { error: "Authentication required" },
        { status: 401 }
      ),
    };
  }

  const role = (session.user as unknown as { role?: string }).role;
  if (role !== "ADMIN" && role !== "EDITOR") {
    return {
      authorized: false as const,
      response: Response.json(
        { error: "Admin access required" },
        { status: 403 }
      ),
    };
  }

  return { authorized: true as const, session };
}
