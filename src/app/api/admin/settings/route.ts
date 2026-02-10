import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminApi, auth } from "@/lib/auth";
import bcrypt from "bcryptjs";

// ============================================
// Admin Settings API
// PATCH: Change admin password
// ============================================

export async function PATCH(request: NextRequest) {
  const authResult = await requireAdminApi();
  if (!authResult.authorized) return authResult.response;

  try {
    const body = await request.json();
    const { currentPassword, newPassword } = body;

    if (!currentPassword || !newPassword) {
      return Response.json(
        { error: "Current and new passwords are required" },
        { status: 400 }
      );
    }

    if (typeof newPassword !== "string" || newPassword.length < 8) {
      return Response.json(
        { error: "New password must be at least 8 characters" },
        { status: 400 }
      );
    }

    const session = await auth();
    if (!session?.user?.id) {
      return Response.json({ error: "Not authenticated" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    });
    if (!user) {
      return Response.json({ error: "User not found" }, { status: 404 });
    }

    const isValid = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isValid) {
      return Response.json(
        { error: "Current password is incorrect" },
        { status: 400 }
      );
    }

    const newHash = await bcrypt.hash(newPassword, 12);
    await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash: newHash },
    });

    return Response.json({ success: true, message: "Password updated" });
  } catch (error) {
    console.error("Error changing password:", error);
    return Response.json(
      { error: "Failed to change password" },
      { status: 500 }
    );
  }
}
