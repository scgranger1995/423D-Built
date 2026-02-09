"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Save,
  Loader2,
  AlertCircle,
  Check,
  X,
  Building2,
  Receipt,
  Bell,
  Lock,
  Power,
} from "lucide-react";

// ============================================
// Admin General Settings Page
// Business info, Stripe, tax, email, password, maintenance
// ============================================

interface GeneralSettings {
  business_name: string;
  business_tagline: string;
  tax_rate: string;
  tax_label: string;
  email_notifications_orders: string;
  email_notifications_inquiries: string;
  email_notification_address: string;
  maintenance_mode: string;
}

const DEFAULT_SETTINGS: GeneralSettings = {
  business_name: "423D Built",
  business_tagline: "3D Printing & Laser Engraving - Bristol, TN",
  tax_rate: "9.75",
  tax_label: "TN Sales Tax (Bristol)",
  email_notifications_orders: "true",
  email_notifications_inquiries: "true",
  email_notification_address: "",
  maintenance_mode: "false",
};

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<GeneralSettings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  // Password change state
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [changingPassword, setChangingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");

  // Fetch settings
  const fetchSettings = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/content?section=settings");
      if (!res.ok) throw new Error("Failed to fetch settings");
      const data = await res.json();

      if (data.items && Array.isArray(data.items)) {
        const mapped: Record<string, string> = {};
        data.items.forEach((item: { key: string; value: string }) => {
          mapped[item.key] = item.value;
        });
        setSettings((prev) => ({ ...prev, ...mapped }));
      }
    } catch {
      // Use defaults if not yet configured
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  // Update setting
  const handleChange = (key: keyof GeneralSettings, value: string) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  // Toggle setting
  const handleToggle = (key: keyof GeneralSettings) => {
    setSettings((prev) => ({
      ...prev,
      [key]: prev[key] === "true" ? "false" : "true",
    }));
  };

  // Save settings
  const handleSave = async () => {
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      const items = Object.entries(settings).map(([key, value]) => ({
        key,
        value,
        section: "settings",
      }));

      const res = await fetch("/api/admin/content", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items }),
      });

      if (!res.ok) throw new Error("Failed to save settings");
      setSuccess("Settings saved successfully!");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  // Change password
  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError("");
    setPasswordSuccess("");

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError("New passwords do not match");
      return;
    }
    if (passwordForm.newPassword.length < 8) {
      setPasswordError("Password must be at least 8 characters");
      return;
    }

    setChangingPassword(true);
    try {
      const res = await fetch("/api/admin/orders", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "password",
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to change password");
      }

      setPasswordSuccess("Password changed successfully!");
      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      setTimeout(() => setPasswordSuccess(""), 3000);
    } catch (err) {
      setPasswordError(
        err instanceof Error ? err.message : "Failed to change password"
      );
    } finally {
      setChangingPassword(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 size={24} className="animate-spin text-gray-500" />
        <span className="ml-3 text-gray-500">Loading settings...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1
            className="text-3xl font-bold"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            General Settings
          </h1>
          <p className="text-gray-400 mt-1">
            Configure your store settings and integrations
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-black rounded-lg transition-colors disabled:opacity-50"
          style={{ backgroundColor: "#D4881C" }}
        >
          {saving ? (
            <Loader2 size={14} className="animate-spin" />
          ) : (
            <Save size={14} />
          )}
          Save Settings
        </button>
      </div>

      {/* Messages */}
      {error && (
        <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-sm text-red-400 flex items-center gap-2">
          <AlertCircle size={16} />
          {error}
          <button onClick={() => setError("")} className="ml-auto">
            <X size={14} />
          </button>
        </div>
      )}
      {success && (
        <div className="p-3 bg-green-500/10 border border-green-500/30 rounded-lg text-sm text-green-400 flex items-center gap-2">
          <Check size={16} />
          {success}
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Business Info */}
        <div className="bg-[#111] border border-[#222] rounded-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-[#222] flex items-center gap-3">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: "rgba(212,136,28,0.15)" }}
            >
              <Building2 size={16} style={{ color: "#D4881C" }} />
            </div>
            <h2 className="text-lg font-semibold">Business Info</h2>
          </div>
          <div className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Business Name
              </label>
              <input
                type="text"
                value={settings.business_name}
                onChange={(e) => handleChange("business_name", e.target.value)}
                className="w-full px-4 py-2.5 bg-[#0a0a0a] border border-[#333] rounded-lg text-sm text-white focus:outline-none focus:border-[#D4881C]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Tagline
              </label>
              <input
                type="text"
                value={settings.business_tagline}
                onChange={(e) =>
                  handleChange("business_tagline", e.target.value)
                }
                className="w-full px-4 py-2.5 bg-[#0a0a0a] border border-[#333] rounded-lg text-sm text-white focus:outline-none focus:border-[#D4881C]"
              />
            </div>
          </div>
        </div>

        {/* Tax Configuration */}
        <div className="bg-[#111] border border-[#222] rounded-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-[#222] flex items-center gap-3">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: "rgba(212,136,28,0.15)" }}
            >
              <Receipt size={16} style={{ color: "#D4881C" }} />
            </div>
            <h2 className="text-lg font-semibold">Tax Configuration</h2>
          </div>
          <div className="p-6 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Tax Rate (%)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.01"
                    value={settings.tax_rate}
                    onChange={(e) => handleChange("tax_rate", e.target.value)}
                    className="w-full px-4 py-2.5 pr-8 bg-[#0a0a0a] border border-[#333] rounded-lg text-sm text-white focus:outline-none focus:border-[#D4881C]"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">
                    %
                  </span>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Tax Label
                </label>
                <input
                  type="text"
                  value={settings.tax_label}
                  onChange={(e) => handleChange("tax_label", e.target.value)}
                  className="w-full px-4 py-2.5 bg-[#0a0a0a] border border-[#333] rounded-lg text-sm text-white focus:outline-none focus:border-[#D4881C]"
                />
              </div>
            </div>
            <p className="text-xs text-gray-500">
              Default rate is 9.75% for Bristol, TN (state 7% + local 2.75%).
              This rate is applied to all orders.
            </p>
          </div>
        </div>

        {/* Email Notifications */}
        <div className="bg-[#111] border border-[#222] rounded-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-[#222] flex items-center gap-3">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: "rgba(212,136,28,0.15)" }}
            >
              <Bell size={16} style={{ color: "#D4881C" }} />
            </div>
            <h2 className="text-lg font-semibold">Email Notifications</h2>
          </div>
          <div className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Notification Email
              </label>
              <input
                type="email"
                value={settings.email_notification_address}
                onChange={(e) =>
                  handleChange("email_notification_address", e.target.value)
                }
                placeholder="admin@423dbuilt.com"
                className="w-full px-4 py-2.5 bg-[#0a0a0a] border border-[#333] rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#D4881C]"
              />
            </div>
            <button
              type="button"
              onClick={() => handleToggle("email_notifications_orders")}
              className="flex items-center justify-between w-full p-3 bg-[#0a0a0a] border border-[#333] rounded-lg hover:border-[#444] transition-colors"
            >
              <span className="text-sm text-gray-300">
                New Order Notifications
              </span>
              <div
                className={`w-10 h-6 rounded-full relative transition-colors ${
                  settings.email_notifications_orders === "true"
                    ? ""
                    : "bg-gray-700"
                }`}
                style={
                  settings.email_notifications_orders === "true"
                    ? { backgroundColor: "#D4881C" }
                    : undefined
                }
              >
                <div
                  className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-transform ${
                    settings.email_notifications_orders === "true"
                      ? "translate-x-5"
                      : "translate-x-1"
                  }`}
                />
              </div>
            </button>
            <button
              type="button"
              onClick={() => handleToggle("email_notifications_inquiries")}
              className="flex items-center justify-between w-full p-3 bg-[#0a0a0a] border border-[#333] rounded-lg hover:border-[#444] transition-colors"
            >
              <span className="text-sm text-gray-300">
                New Inquiry Notifications
              </span>
              <div
                className={`w-10 h-6 rounded-full relative transition-colors ${
                  settings.email_notifications_inquiries === "true"
                    ? ""
                    : "bg-gray-700"
                }`}
                style={
                  settings.email_notifications_inquiries === "true"
                    ? { backgroundColor: "#D4881C" }
                    : undefined
                }
              >
                <div
                  className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-transform ${
                    settings.email_notifications_inquiries === "true"
                      ? "translate-x-5"
                      : "translate-x-1"
                  }`}
                />
              </div>
            </button>
          </div>
        </div>

        {/* Password Change */}
        <div className="bg-[#111] border border-[#222] rounded-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-[#222] flex items-center gap-3">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: "rgba(212,136,28,0.15)" }}
            >
              <Lock size={16} style={{ color: "#D4881C" }} />
            </div>
            <h2 className="text-lg font-semibold">Change Password</h2>
          </div>
          <form onSubmit={handlePasswordChange} className="p-6 space-y-4">
            {passwordError && (
              <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-sm text-red-400 flex items-center gap-2">
                <AlertCircle size={16} />
                {passwordError}
              </div>
            )}
            {passwordSuccess && (
              <div className="p-3 bg-green-500/10 border border-green-500/30 rounded-lg text-sm text-green-400 flex items-center gap-2">
                <Check size={16} />
                {passwordSuccess}
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Current Password
              </label>
              <input
                type="password"
                value={passwordForm.currentPassword}
                onChange={(e) =>
                  setPasswordForm((prev) => ({
                    ...prev,
                    currentPassword: e.target.value,
                  }))
                }
                required
                className="w-full px-4 py-2.5 bg-[#0a0a0a] border border-[#333] rounded-lg text-sm text-white focus:outline-none focus:border-[#D4881C]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                New Password
              </label>
              <input
                type="password"
                value={passwordForm.newPassword}
                onChange={(e) =>
                  setPasswordForm((prev) => ({
                    ...prev,
                    newPassword: e.target.value,
                  }))
                }
                required
                minLength={8}
                className="w-full px-4 py-2.5 bg-[#0a0a0a] border border-[#333] rounded-lg text-sm text-white focus:outline-none focus:border-[#D4881C]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Confirm New Password
              </label>
              <input
                type="password"
                value={passwordForm.confirmPassword}
                onChange={(e) =>
                  setPasswordForm((prev) => ({
                    ...prev,
                    confirmPassword: e.target.value,
                  }))
                }
                required
                minLength={8}
                className="w-full px-4 py-2.5 bg-[#0a0a0a] border border-[#333] rounded-lg text-sm text-white focus:outline-none focus:border-[#D4881C]"
              />
            </div>
            <button
              type="submit"
              disabled={changingPassword}
              className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-black rounded-lg transition-colors disabled:opacity-50"
              style={{ backgroundColor: "#D4881C" }}
            >
              {changingPassword ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <Lock size={14} />
              )}
              Change Password
            </button>
          </form>
        </div>

        {/* Maintenance Mode */}
        <div className="bg-[#111] border border-[#222] rounded-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-[#222] flex items-center gap-3">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: "rgba(212,136,28,0.15)" }}
            >
              <Power size={16} style={{ color: "#D4881C" }} />
            </div>
            <h2 className="text-lg font-semibold">Maintenance Mode</h2>
          </div>
          <div className="p-6">
            <button
              type="button"
              onClick={() => handleToggle("maintenance_mode")}
              className="flex items-center justify-between w-full p-4 bg-[#0a0a0a] border border-[#333] rounded-lg hover:border-[#444] transition-colors"
            >
              <div>
                <span className="text-sm font-medium text-gray-300 block">
                  Enable Maintenance Mode
                </span>
                <span className="text-xs text-gray-500 block mt-1">
                  When enabled, the storefront will show a maintenance page to
                  visitors. Admin dashboard remains accessible.
                </span>
              </div>
              <div
                className={`w-10 h-6 rounded-full relative transition-colors flex-shrink-0 ml-4 ${
                  settings.maintenance_mode === "true" ? "" : "bg-gray-700"
                }`}
                style={
                  settings.maintenance_mode === "true"
                    ? { backgroundColor: "#ef4444" }
                    : undefined
                }
              >
                <div
                  className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-transform ${
                    settings.maintenance_mode === "true"
                      ? "translate-x-5"
                      : "translate-x-1"
                  }`}
                />
              </div>
            </button>
            {settings.maintenance_mode === "true" && (
              <div className="mt-3 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-sm text-red-400 flex items-center gap-2">
                <AlertCircle size={16} />
                Maintenance mode is active. Your store is not visible to
                customers.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
