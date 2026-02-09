"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  MessageSquare,
  FileText,
  Truck,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronRight,
} from "lucide-react";

// ============================================
// Admin Shell - Client Component
// Sidebar + Top Bar wrapper for all admin pages
// ============================================

interface AdminShellProps {
  userName: string;
  userEmail: string;
  children: React.ReactNode;
}

const navItems = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/orders", label: "Orders", icon: ShoppingCart },
  { href: "/admin/inquiries", label: "Inquiries", icon: MessageSquare },
  { href: "/admin/content", label: "Content", icon: FileText },
  { href: "/admin/shipping", label: "Shipping", icon: Truck },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

export default function AdminShell({
  userName,
  userEmail,
  children,
}: AdminShellProps) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const isActive = (href: string) => {
    if (href === "/admin") return pathname === "/admin";
    return pathname.startsWith(href);
  };

  const handleLogout = async () => {
    const form = document.createElement("form");
    form.method = "POST";
    form.action = "/api/auth/signout";

    const csrfInput = document.createElement("input");
    csrfInput.type = "hidden";
    csrfInput.name = "csrfToken";

    try {
      const res = await fetch("/api/auth/csrf");
      const data = await res.json();
      csrfInput.value = data.csrfToken;
    } catch {
      // Fallback - try direct navigation
      window.location.href = "/login";
      return;
    }

    form.appendChild(csrfInput);
    document.body.appendChild(form);
    form.submit();
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex">
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 z-50 h-full w-64 bg-[#111111] border-r border-[#222]
          transform transition-transform duration-200 ease-in-out
          lg:translate-x-0 lg:static lg:z-auto
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        {/* Logo Area */}
        <div className="h-16 flex items-center justify-between px-6 border-b border-[#222]">
          <Link href="/admin" className="flex items-center gap-2">
            <span
              className="text-xl font-bold"
              style={{ color: "#D4881C", fontFamily: "'Playfair Display', serif" }}
            >
              423D
            </span>
            <span className="text-sm text-gray-400 font-medium">Admin</span>
          </Link>
          <button
            className="lg:hidden text-gray-400 hover:text-white"
            onClick={() => setSidebarOpen(false)}
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`
                  flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium
                  transition-all duration-150 group
                  ${
                    active
                      ? "text-black"
                      : "text-gray-400 hover:text-white hover:bg-[#1a1a1a]"
                  }
                `}
                style={
                  active
                    ? { backgroundColor: "#D4881C", color: "#000" }
                    : undefined
                }
              >
                <Icon
                  size={18}
                  className={active ? "text-black" : "text-gray-500 group-hover:text-white"}
                  style={active ? { color: "#000" } : undefined}
                />
                {item.label}
                {active && <ChevronRight size={14} className="ml-auto text-black/50" />}
              </Link>
            );
          })}
        </nav>

        {/* Sidebar Footer */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-[#222]">
          <div className="flex items-center gap-3 px-2 mb-3">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-black"
              style={{ backgroundColor: "#D4881C" }}
            >
              {userName.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">{userName}</p>
              <p className="text-xs text-gray-500 truncate">{userEmail}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-400 hover:text-red-400 hover:bg-[#1a1a1a] rounded-lg transition-colors"
          >
            <LogOut size={16} />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Top Bar */}
        <header className="h-16 bg-[#111111] border-b border-[#222] flex items-center justify-between px-6 sticky top-0 z-30">
          <button
            className="lg:hidden text-gray-400 hover:text-white"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu size={24} />
          </button>
          <div className="hidden lg:block">
            <h2 className="text-sm text-gray-400">
              Welcome back,{" "}
              <span className="text-white font-medium">{userName}</span>
            </h2>
          </div>
          <div className="flex items-center gap-4">
            <Link
              href="/"
              target="_blank"
              className="text-xs text-gray-500 hover:text-gray-300 transition-colors"
            >
              View Store
            </Link>
            <button
              onClick={handleLogout}
              className="hidden lg:flex items-center gap-2 text-sm text-gray-400 hover:text-red-400 transition-colors"
            >
              <LogOut size={16} />
              Logout
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-6 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
