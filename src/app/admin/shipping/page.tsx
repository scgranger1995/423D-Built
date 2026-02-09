"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Save,
  Loader2,
  AlertCircle,
  Check,
  X,
  Truck,
  MapPin,
  Package,
  Wifi,
  DollarSign,
  Settings,
} from "lucide-react";

// ============================================
// Admin Shipping Settings Page
// GoShippo integration, flat-rate tiers, carrier prefs
// ============================================

interface ShippingSettings {
  shippo_api_key: string;
  return_name: string;
  return_street1: string;
  return_street2: string;
  return_city: string;
  return_state: string;
  return_zip: string;
  return_country: string;
  return_phone: string;
  default_parcel_length: string;
  default_parcel_width: string;
  default_parcel_height: string;
  default_parcel_weight: string;
  flat_rate_small: string;
  flat_rate_medium: string;
  flat_rate_large: string;
  free_shipping_threshold: string;
  local_pickup_enabled: string;
  local_pickup_location: string;
  carrier_usps: string;
  carrier_ups: string;
  carrier_fedex: string;
}

const DEFAULT_SETTINGS: ShippingSettings = {
  shippo_api_key: "",
  return_name: "423D Built",
  return_street1: "",
  return_street2: "",
  return_city: "Bristol",
  return_state: "TN",
  return_zip: "37620",
  return_country: "US",
  return_phone: "",
  default_parcel_length: "10",
  default_parcel_width: "8",
  default_parcel_height: "4",
  default_parcel_weight: "16",
  flat_rate_small: "5.99",
  flat_rate_medium: "9.99",
  flat_rate_large: "14.99",
  free_shipping_threshold: "75.00",
  local_pickup_enabled: "true",
  local_pickup_location: "Bristol, TN",
  carrier_usps: "true",
  carrier_ups: "false",
  carrier_fedex: "false",
};

export default function AdminShippingPage() {
  const [settings, setSettings] = useState<ShippingSettings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [testResult, setTestResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);

  // Fetch settings
  const fetchSettings = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/shipping");
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
      // Use defaults if no settings exist yet
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  // Update setting
  const handleChange = (key: keyof ShippingSettings, value: string) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  // Toggle boolean settings
  const handleToggle = (key: keyof ShippingSettings) => {
    setSettings((prev) => ({
      ...prev,
      [key]: prev[key] === "true" ? "false" : "true",
    }));
  };

  // Save all settings
  const handleSave = async () => {
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      const items = Object.entries(settings).map(([key, value]) => ({
        key,
        value,
      }));

      const res = await fetch("/api/admin/shipping", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items }),
      });

      if (!res.ok) throw new Error("Failed to save settings");
      setSuccess("Shipping settings saved!");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to save settings"
      );
    } finally {
      setSaving(false);
    }
  };

  // Test Shippo connection
  const handleTestConnection = async () => {
    setTesting(true);
    setTestResult(null);
    try {
      const res = await fetch("/api/admin/shipping", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "testConnection",
          apiKey: settings.shippo_api_key,
        }),
      });
      const data = await res.json();
      setTestResult({
        success: res.ok,
        message: data.message || (res.ok ? "Connection successful!" : "Connection failed"),
      });
    } catch {
      setTestResult({
        success: false,
        message: "Failed to test connection",
      });
    } finally {
      setTesting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 size={24} className="animate-spin text-gray-500" />
        <span className="ml-3 text-gray-500">Loading shipping settings...</span>
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
            Shipping Settings
          </h1>
          <p className="text-gray-400 mt-1">
            Configure shipping rates, carriers, and label printing
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
          Save All Settings
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
        {/* GoShippo API */}
        <div className="bg-[#111] border border-[#222] rounded-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-[#222] flex items-center gap-3">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: "rgba(212,136,28,0.15)" }}
            >
              <Settings size={16} style={{ color: "#D4881C" }} />
            </div>
            <h2 className="text-lg font-semibold">GoShippo API</h2>
          </div>
          <div className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Shippo API Key
              </label>
              <input
                type="password"
                value={settings.shippo_api_key}
                onChange={(e) => handleChange("shippo_api_key", e.target.value)}
                placeholder="shippo_live_..."
                className="w-full px-4 py-2.5 bg-[#0a0a0a] border border-[#333] rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#D4881C]"
              />
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={handleTestConnection}
                disabled={testing || !settings.shippo_api_key}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium border border-[#333] rounded-lg text-gray-300 hover:bg-[#1a1a1a] transition-colors disabled:opacity-50"
              >
                {testing ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <Wifi size={14} />
                )}
                Test Connection
              </button>
              {testResult && (
                <span
                  className={`text-sm ${
                    testResult.success ? "text-green-400" : "text-red-400"
                  }`}
                >
                  {testResult.message}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Return Address */}
        <div className="bg-[#111] border border-[#222] rounded-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-[#222] flex items-center gap-3">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: "rgba(212,136,28,0.15)" }}
            >
              <MapPin size={16} style={{ color: "#D4881C" }} />
            </div>
            <h2 className="text-lg font-semibold">Return Address</h2>
          </div>
          <div className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Business Name
              </label>
              <input
                type="text"
                value={settings.return_name}
                onChange={(e) => handleChange("return_name", e.target.value)}
                className="w-full px-4 py-2.5 bg-[#0a0a0a] border border-[#333] rounded-lg text-sm text-white focus:outline-none focus:border-[#D4881C]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Street Address
              </label>
              <input
                type="text"
                value={settings.return_street1}
                onChange={(e) => handleChange("return_street1", e.target.value)}
                placeholder="123 Main St"
                className="w-full px-4 py-2.5 bg-[#0a0a0a] border border-[#333] rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#D4881C]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Street Address 2
              </label>
              <input
                type="text"
                value={settings.return_street2}
                onChange={(e) => handleChange("return_street2", e.target.value)}
                placeholder="Suite, Apt, etc."
                className="w-full px-4 py-2.5 bg-[#0a0a0a] border border-[#333] rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#D4881C]"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  City
                </label>
                <input
                  type="text"
                  value={settings.return_city}
                  onChange={(e) => handleChange("return_city", e.target.value)}
                  className="w-full px-4 py-2.5 bg-[#0a0a0a] border border-[#333] rounded-lg text-sm text-white focus:outline-none focus:border-[#D4881C]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  State
                </label>
                <input
                  type="text"
                  value={settings.return_state}
                  onChange={(e) => handleChange("return_state", e.target.value)}
                  className="w-full px-4 py-2.5 bg-[#0a0a0a] border border-[#333] rounded-lg text-sm text-white focus:outline-none focus:border-[#D4881C]"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  ZIP Code
                </label>
                <input
                  type="text"
                  value={settings.return_zip}
                  onChange={(e) => handleChange("return_zip", e.target.value)}
                  className="w-full px-4 py-2.5 bg-[#0a0a0a] border border-[#333] rounded-lg text-sm text-white focus:outline-none focus:border-[#D4881C]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Phone
                </label>
                <input
                  type="text"
                  value={settings.return_phone}
                  onChange={(e) => handleChange("return_phone", e.target.value)}
                  placeholder="(423) 555-0123"
                  className="w-full px-4 py-2.5 bg-[#0a0a0a] border border-[#333] rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#D4881C]"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Default Parcel Dimensions */}
        <div className="bg-[#111] border border-[#222] rounded-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-[#222] flex items-center gap-3">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: "rgba(212,136,28,0.15)" }}
            >
              <Package size={16} style={{ color: "#D4881C" }} />
            </div>
            <h2 className="text-lg font-semibold">Default Parcel Dimensions</h2>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Length (in)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={settings.default_parcel_length}
                  onChange={(e) =>
                    handleChange("default_parcel_length", e.target.value)
                  }
                  className="w-full px-4 py-2.5 bg-[#0a0a0a] border border-[#333] rounded-lg text-sm text-white focus:outline-none focus:border-[#D4881C]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Width (in)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={settings.default_parcel_width}
                  onChange={(e) =>
                    handleChange("default_parcel_width", e.target.value)
                  }
                  className="w-full px-4 py-2.5 bg-[#0a0a0a] border border-[#333] rounded-lg text-sm text-white focus:outline-none focus:border-[#D4881C]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Height (in)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={settings.default_parcel_height}
                  onChange={(e) =>
                    handleChange("default_parcel_height", e.target.value)
                  }
                  className="w-full px-4 py-2.5 bg-[#0a0a0a] border border-[#333] rounded-lg text-sm text-white focus:outline-none focus:border-[#D4881C]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Weight (oz)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={settings.default_parcel_weight}
                  onChange={(e) =>
                    handleChange("default_parcel_weight", e.target.value)
                  }
                  className="w-full px-4 py-2.5 bg-[#0a0a0a] border border-[#333] rounded-lg text-sm text-white focus:outline-none focus:border-[#D4881C]"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Flat-Rate Shipping Tiers */}
        <div className="bg-[#111] border border-[#222] rounded-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-[#222] flex items-center gap-3">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: "rgba(212,136,28,0.15)" }}
            >
              <DollarSign size={16} style={{ color: "#D4881C" }} />
            </div>
            <h2 className="text-lg font-semibold">Flat-Rate Shipping Tiers</h2>
          </div>
          <div className="p-6 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Small Package
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                    $
                  </span>
                  <input
                    type="number"
                    step="0.01"
                    value={settings.flat_rate_small}
                    onChange={(e) =>
                      handleChange("flat_rate_small", e.target.value)
                    }
                    className="w-full pl-8 pr-4 py-2.5 bg-[#0a0a0a] border border-[#333] rounded-lg text-sm text-white focus:outline-none focus:border-[#D4881C]"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Medium Package
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                    $
                  </span>
                  <input
                    type="number"
                    step="0.01"
                    value={settings.flat_rate_medium}
                    onChange={(e) =>
                      handleChange("flat_rate_medium", e.target.value)
                    }
                    className="w-full pl-8 pr-4 py-2.5 bg-[#0a0a0a] border border-[#333] rounded-lg text-sm text-white focus:outline-none focus:border-[#D4881C]"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Large Package
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                    $
                  </span>
                  <input
                    type="number"
                    step="0.01"
                    value={settings.flat_rate_large}
                    onChange={(e) =>
                      handleChange("flat_rate_large", e.target.value)
                    }
                    className="w-full pl-8 pr-4 py-2.5 bg-[#0a0a0a] border border-[#333] rounded-lg text-sm text-white focus:outline-none focus:border-[#D4881C]"
                  />
                </div>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Free Shipping Threshold
              </label>
              <div className="relative w-48">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                  $
                </span>
                <input
                  type="number"
                  step="0.01"
                  value={settings.free_shipping_threshold}
                  onChange={(e) =>
                    handleChange("free_shipping_threshold", e.target.value)
                  }
                  className="w-full pl-8 pr-4 py-2.5 bg-[#0a0a0a] border border-[#333] rounded-lg text-sm text-white focus:outline-none focus:border-[#D4881C]"
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Orders above this amount get free shipping
              </p>
            </div>
          </div>
        </div>

        {/* Local Pickup */}
        <div className="bg-[#111] border border-[#222] rounded-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-[#222] flex items-center gap-3">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: "rgba(212,136,28,0.15)" }}
            >
              <MapPin size={16} style={{ color: "#D4881C" }} />
            </div>
            <h2 className="text-lg font-semibold">Local Pickup</h2>
          </div>
          <div className="p-6 space-y-4">
            <button
              type="button"
              onClick={() => handleToggle("local_pickup_enabled")}
              className="flex items-center justify-between w-full p-3 bg-[#0a0a0a] border border-[#333] rounded-lg hover:border-[#444] transition-colors"
            >
              <span className="text-sm text-gray-300">
                Enable Local Pickup
              </span>
              <div
                className={`w-10 h-6 rounded-full relative transition-colors ${
                  settings.local_pickup_enabled === "true"
                    ? ""
                    : "bg-gray-700"
                }`}
                style={
                  settings.local_pickup_enabled === "true"
                    ? { backgroundColor: "#D4881C" }
                    : undefined
                }
              >
                <div
                  className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-transform ${
                    settings.local_pickup_enabled === "true"
                      ? "translate-x-5"
                      : "translate-x-1"
                  }`}
                />
              </div>
            </button>
            {settings.local_pickup_enabled === "true" && (
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Pickup Location
                </label>
                <input
                  type="text"
                  value={settings.local_pickup_location}
                  onChange={(e) =>
                    handleChange("local_pickup_location", e.target.value)
                  }
                  placeholder="Bristol, TN"
                  className="w-full px-4 py-2.5 bg-[#0a0a0a] border border-[#333] rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#D4881C]"
                />
              </div>
            )}
          </div>
        </div>

        {/* Carrier Preferences */}
        <div className="bg-[#111] border border-[#222] rounded-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-[#222] flex items-center gap-3">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: "rgba(212,136,28,0.15)" }}
            >
              <Truck size={16} style={{ color: "#D4881C" }} />
            </div>
            <h2 className="text-lg font-semibold">Carrier Preferences</h2>
          </div>
          <div className="p-6 space-y-3">
            {[
              { key: "carrier_usps" as const, label: "USPS" },
              { key: "carrier_ups" as const, label: "UPS" },
              { key: "carrier_fedex" as const, label: "FedEx" },
            ].map((carrier) => (
              <button
                key={carrier.key}
                type="button"
                onClick={() => handleToggle(carrier.key)}
                className="flex items-center justify-between w-full p-3 bg-[#0a0a0a] border border-[#333] rounded-lg hover:border-[#444] transition-colors"
              >
                <span className="text-sm text-gray-300">{carrier.label}</span>
                <div
                  className={`w-10 h-6 rounded-full relative transition-colors ${
                    settings[carrier.key] === "true" ? "" : "bg-gray-700"
                  }`}
                  style={
                    settings[carrier.key] === "true"
                      ? { backgroundColor: "#D4881C" }
                      : undefined
                  }
                >
                  <div
                    className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-transform ${
                      settings[carrier.key] === "true"
                        ? "translate-x-5"
                        : "translate-x-1"
                    }`}
                  />
                </div>
              </button>
            ))}
            <p className="text-xs text-gray-500 pt-2">
              Selected carriers will be used when fetching real-time rates from
              Shippo. If none selected, all available carriers will be shown.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
