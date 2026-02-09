import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import AdminShell from "@/components/admin/AdminShell";

// ============================================
// Admin Layout - Server Component
// Checks authentication and wraps admin pages
// ============================================

export const metadata = {
  title: "Admin Dashboard | 423D Built",
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const role = (session.user as { role?: string }).role;
  if (role !== "ADMIN" && role !== "EDITOR") {
    redirect("/login");
  }

  return (
    <AdminShell
      userName={session.user.name || session.user.email || "Admin"}
      userEmail={session.user.email || ""}
    >
      {children}
    </AdminShell>
  );
}
