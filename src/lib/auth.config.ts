import type { NextAuthConfig } from "next-auth";

/**
 * Edge-compatible auth config (no Prisma, no bcrypt).
 * Used by middleware for route protection.
 * The full auth config with providers is in auth.ts.
 */
export const authConfig: NextAuthConfig = {
  providers: [], // Providers added in auth.ts (server-only)
  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60, // 24 hours
  },
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as unknown as { role: string }).role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        (session.user as unknown as { role: string }).role = token.role as string;
      }
      return session;
    },
    async authorized({ auth, request }) {
      const { pathname } = request.nextUrl;

      // Allow login page without auth
      if (pathname === "/login") {
        return true;
      }

      // Protect admin routes
      if (pathname.startsWith("/admin")) {
        if (!auth?.user) {
          return false; // Redirects to signIn page
        }
        const role = (auth.user as unknown as { role?: string }).role;
        return role === "ADMIN" || role === "EDITOR";
      }

      return true;
    },
  },
  trustHost: true,
};
