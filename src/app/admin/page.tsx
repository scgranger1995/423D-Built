import Link from "next/link";
import { prisma } from "@/lib/prisma";
import {
  ShoppingCart,
  DollarSign,
  MessageSquare,
  Package,
  Plus,
  Eye,
  Inbox,
  ArrowUpRight,
  TrendingUp,
} from "lucide-react";

// ============================================
// Admin Dashboard - Server Component
// Overview stats, recent orders, inquiries, quick actions
// ============================================

// Helpers
function formatCents(cents: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(cents / 100);
}

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(date));
}

const statusColors: Record<string, string> = {
  PENDING: "bg-yellow-500/20 text-yellow-400",
  PAID: "bg-blue-500/20 text-blue-400",
  PROCESSING: "bg-orange-500/20 text-orange-400",
  SHIPPED: "bg-purple-500/20 text-purple-400",
  DELIVERED: "bg-green-500/20 text-green-400",
  CANCELLED: "bg-red-500/20 text-red-400",
  REFUNDED: "bg-gray-500/20 text-gray-400",
};

export default async function AdminDashboard() {
  // Fetch all stats in parallel
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  let totalOrders = 0;
  let monthlyRevenue = 0;
  let pendingInquiries = 0;
  let activeProducts = 0;
  let recentOrders: {
    id: string;
    orderNumber: string;
    customerName: string;
    customerEmail: string;
    total: number;
    status: string;
    paymentStatus: string;
    createdAt: Date;
  }[] = [];
  let recentInquiries: {
    id: string;
    customerName: string;
    customerEmail: string;
    serviceType: string;
    status: string;
    createdAt: Date;
  }[] = [];

  try {
    const [
      ordersCount,
      revenueResult,
      inquiriesCount,
      productsCount,
      latestOrders,
      latestInquiries,
    ] = await Promise.all([
      prisma.order.count(),
      prisma.order.aggregate({
        _sum: { total: true },
        where: {
          createdAt: { gte: startOfMonth },
          paymentStatus: "PAID",
        },
      }),
      prisma.serviceInquiry.count({
        where: { status: { in: ["NEW", "REVIEWED"] } },
      }),
      prisma.product.count({ where: { active: true } }),
      prisma.order.findMany({
        take: 10,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          orderNumber: true,
          customerName: true,
          customerEmail: true,
          total: true,
          status: true,
          paymentStatus: true,
          createdAt: true,
        },
      }),
      prisma.serviceInquiry.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          customerName: true,
          customerEmail: true,
          serviceType: true,
          status: true,
          createdAt: true,
        },
      }),
    ]);

    totalOrders = ordersCount;
    monthlyRevenue = revenueResult._sum.total || 0;
    pendingInquiries = inquiriesCount;
    activeProducts = productsCount;
    recentOrders = latestOrders;
    recentInquiries = latestInquiries;
  } catch {
    // Database may not be connected yet - use placeholder data
  }

  const stats = [
    {
      label: "Total Orders",
      value: totalOrders.toString(),
      icon: ShoppingCart,
      color: "#D4881C",
      href: "/admin/orders",
    },
    {
      label: "Revenue (This Month)",
      value: formatCents(monthlyRevenue),
      icon: DollarSign,
      color: "#22c55e",
      href: "/admin/orders",
    },
    {
      label: "Pending Inquiries",
      value: pendingInquiries.toString(),
      icon: MessageSquare,
      color: "#3b82f6",
      href: "/admin/inquiries",
    },
    {
      label: "Active Products",
      value: activeProducts.toString(),
      icon: Package,
      color: "#a855f7",
      href: "/admin/products",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1
          className="text-3xl font-bold"
          style={{ fontFamily: "'Playfair Display', serif" }}
        >
          Dashboard
        </h1>
        <p className="text-gray-400 mt-1">
          Overview of your 423D Built store performance
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Link
              key={stat.label}
              href={stat.href}
              className="bg-[#111] border border-[#222] rounded-xl p-6 hover:border-[#333] transition-colors group"
            >
              <div className="flex items-center justify-between mb-4">
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: `${stat.color}20` }}
                >
                  <Icon size={20} style={{ color: stat.color }} />
                </div>
                <ArrowUpRight
                  size={16}
                  className="text-gray-600 group-hover:text-gray-400 transition-colors"
                />
              </div>
              <p className="text-2xl font-bold text-white">{stat.value}</p>
              <p className="text-sm text-gray-500 mt-1">{stat.label}</p>
            </Link>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-3">
        <Link
          href="/admin/products?action=new"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-black transition-colors"
          style={{ backgroundColor: "#D4881C" }}
        >
          <Plus size={16} />
          Add Product
        </Link>
        <Link
          href="/admin/orders"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border transition-colors text-gray-300 border-[#333] hover:bg-[#1a1a1a]"
        >
          <Eye size={16} />
          View Orders
        </Link>
        <Link
          href="/admin/inquiries"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border transition-colors text-gray-300 border-[#333] hover:bg-[#1a1a1a]"
        >
          <Inbox size={16} />
          Check Inquiries
        </Link>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Recent Orders Table */}
        <div className="xl:col-span-2 bg-[#111] border border-[#222] rounded-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-[#222] flex items-center justify-between">
            <h2 className="text-lg font-semibold">Recent Orders</h2>
            <Link
              href="/admin/orders"
              className="text-sm hover:underline"
              style={{ color: "#D4881C" }}
            >
              View All
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#222]">
                  <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3">
                    Order
                  </th>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3">
                    Customer
                  </th>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3">
                    Total
                  </th>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3">
                    Status
                  </th>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#222]">
                {recentOrders.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-6 py-12 text-center text-gray-500"
                    >
                      <ShoppingCart
                        size={32}
                        className="mx-auto mb-3 text-gray-600"
                      />
                      <p>No orders yet</p>
                      <p className="text-sm">
                        Orders will appear here once customers start purchasing
                      </p>
                    </td>
                  </tr>
                ) : (
                  recentOrders.map((order) => (
                    <tr
                      key={order.id}
                      className="hover:bg-[#1a1a1a] transition-colors"
                    >
                      <td className="px-6 py-4">
                        <Link
                          href={`/admin/orders?order=${order.id}`}
                          className="font-mono text-sm hover:underline"
                          style={{ color: "#D4881C" }}
                        >
                          {order.orderNumber}
                        </Link>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-white">
                          {order.customerName}
                        </p>
                        <p className="text-xs text-gray-500">
                          {order.customerEmail}
                        </p>
                      </td>
                      <td className="px-6 py-4 text-sm font-medium">
                        {formatCents(order.total)}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            statusColors[order.status] || "bg-gray-500/20 text-gray-400"
                          }`}
                        >
                          {order.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-400">
                        {formatDate(order.createdAt)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Inquiries */}
        <div className="bg-[#111] border border-[#222] rounded-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-[#222] flex items-center justify-between">
            <h2 className="text-lg font-semibold">Recent Inquiries</h2>
            <Link
              href="/admin/inquiries"
              className="text-sm hover:underline"
              style={{ color: "#D4881C" }}
            >
              View All
            </Link>
          </div>
          <div className="divide-y divide-[#222]">
            {recentInquiries.length === 0 ? (
              <div className="px-6 py-12 text-center text-gray-500">
                <MessageSquare
                  size={32}
                  className="mx-auto mb-3 text-gray-600"
                />
                <p>No inquiries yet</p>
                <p className="text-sm">
                  Customer inquiries will appear here
                </p>
              </div>
            ) : (
              recentInquiries.map((inquiry) => (
                <Link
                  key={inquiry.id}
                  href={`/admin/inquiries?inquiry=${inquiry.id}`}
                  className="block px-6 py-4 hover:bg-[#1a1a1a] transition-colors"
                >
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-sm font-medium text-white">
                      {inquiry.customerName}
                    </p>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full ${
                        inquiry.status === "NEW"
                          ? "bg-blue-500/20 text-blue-400"
                          : "bg-gray-500/20 text-gray-400"
                      }`}
                    >
                      {inquiry.status}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500">
                    {inquiry.serviceType.replace("_", " ")} &middot;{" "}
                    {formatDate(inquiry.createdAt)}
                  </p>
                </Link>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Performance Hint */}
      <div className="bg-[#111] border border-[#222] rounded-xl p-6">
        <div className="flex items-center gap-3 mb-2">
          <TrendingUp size={20} style={{ color: "#D4881C" }} />
          <h3 className="font-semibold">Quick Tip</h3>
        </div>
        <p className="text-sm text-gray-400">
          Keep your product catalog fresh and respond to inquiries promptly to
          maximize conversions. Products marked as &quot;Featured&quot; appear
          prominently on the storefront homepage.
        </p>
      </div>
    </div>
  );
}
