import { handlers } from "@/lib/auth";

// ============================================
// NextAuth v5 Route Handler
// Handles all /api/auth/* routes (signIn, signOut, session, etc.)
// ============================================

export const { GET, POST } = handlers;
