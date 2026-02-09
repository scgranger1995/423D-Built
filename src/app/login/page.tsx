"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { motion } from "framer-motion";
import { Lock, Mail, Eye, EyeOff, AlertCircle } from "lucide-react";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError("Invalid email or password");
      } else {
        router.push("/admin");
        router.refresh();
      }
    } catch {
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#111111",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          width: "100%",
          maxWidth: 420,
        }}
      >
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div
            style={{
              width: 80,
              height: 80,
              borderRadius: "50%",
              border: "2px solid #D4881C",
              overflow: "hidden",
              margin: "0 auto 16px",
              position: "relative",
            }}
          >
            <Image
              src="/images/logo.jpg"
              alt="423D Built"
              fill
              style={{ objectFit: "cover" }}
            />
          </div>
          <h1
            style={{
              fontFamily: "var(--font-heading), serif",
              fontSize: "1.5rem",
              fontWeight: 700,
              color: "#F5F5F5",
            }}
          >
            Admin Dashboard
          </h1>
          <p style={{ color: "#666", fontSize: "0.9rem", marginTop: 4 }}>
            Sign in to manage your store
          </p>
        </div>

        {/* Form Card */}
        <div
          style={{
            backgroundColor: "#1a1a1a",
            borderRadius: 12,
            border: "1px solid #222",
            padding: 32,
          }}
        >
          <form onSubmit={handleSubmit}>
            {/* Error */}
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "12px 16px",
                  borderRadius: 8,
                  backgroundColor: "rgba(220,38,38,0.1)",
                  border: "1px solid rgba(220,38,38,0.3)",
                  color: "#ef4444",
                  fontSize: "0.85rem",
                  marginBottom: 20,
                }}
              >
                <AlertCircle size={16} />
                {error}
              </motion.div>
            )}

            {/* Email */}
            <div style={{ marginBottom: 20 }}>
              <label
                style={{
                  display: "block",
                  fontSize: "0.85rem",
                  fontWeight: 500,
                  color: "#D4881C",
                  marginBottom: 8,
                }}
              >
                Email
              </label>
              <div style={{ position: "relative" }}>
                <Mail
                  size={18}
                  style={{
                    position: "absolute",
                    left: 12,
                    top: "50%",
                    transform: "translateY(-50%)",
                    color: "#555",
                  }}
                />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@423dbuilt.com"
                  required
                  style={{
                    width: "100%",
                    padding: "12px 12px 12px 42px",
                    borderRadius: 8,
                    border: "1px solid #333",
                    backgroundColor: "#111",
                    color: "#F5F5F5",
                    fontSize: "0.95rem",
                    outline: "none",
                    transition: "border-color 0.2s",
                  }}
                  onFocus={(e) =>
                    (e.currentTarget.style.borderColor = "#D4881C")
                  }
                  onBlur={(e) =>
                    (e.currentTarget.style.borderColor = "#333")
                  }
                />
              </div>
            </div>

            {/* Password */}
            <div style={{ marginBottom: 28 }}>
              <label
                style={{
                  display: "block",
                  fontSize: "0.85rem",
                  fontWeight: 500,
                  color: "#D4881C",
                  marginBottom: 8,
                }}
              >
                Password
              </label>
              <div style={{ position: "relative" }}>
                <Lock
                  size={18}
                  style={{
                    position: "absolute",
                    left: 12,
                    top: "50%",
                    transform: "translateY(-50%)",
                    color: "#555",
                  }}
                />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                  style={{
                    width: "100%",
                    padding: "12px 42px 12px 42px",
                    borderRadius: 8,
                    border: "1px solid #333",
                    backgroundColor: "#111",
                    color: "#F5F5F5",
                    fontSize: "0.95rem",
                    outline: "none",
                    transition: "border-color 0.2s",
                  }}
                  onFocus={(e) =>
                    (e.currentTarget.style.borderColor = "#D4881C")
                  }
                  onBlur={(e) =>
                    (e.currentTarget.style.borderColor = "#333")
                  }
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: "absolute",
                    right: 12,
                    top: "50%",
                    transform: "translateY(-50%)",
                    background: "none",
                    border: "none",
                    color: "#555",
                    cursor: "pointer",
                    padding: 0,
                  }}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <motion.button
              type="submit"
              disabled={loading}
              whileHover={loading ? {} : { scale: 1.02 }}
              whileTap={loading ? {} : { scale: 0.98 }}
              style={{
                width: "100%",
                padding: "14px 24px",
                borderRadius: 8,
                border: "none",
                backgroundColor: loading
                  ? "rgba(212,136,28,0.5)"
                  : "#D4881C",
                color: "#000",
                fontWeight: 600,
                fontSize: "1rem",
                cursor: loading ? "not-allowed" : "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                transition: "background-color 0.2s",
              }}
            >
              {loading ? (
                <>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{
                      repeat: Infinity,
                      duration: 1,
                      ease: "linear",
                    }}
                    style={{
                      width: 20,
                      height: 20,
                      border: "2px solid transparent",
                      borderTopColor: "#000",
                      borderRadius: "50%",
                    }}
                  />
                  Signing in...
                </>
              ) : (
                <>
                  <Lock size={18} />
                  Sign In
                </>
              )}
            </motion.button>
          </form>
        </div>

        <p
          style={{
            textAlign: "center",
            marginTop: 24,
            fontSize: "0.8rem",
            color: "#444",
          }}
        >
          423D Built Admin Panel
        </p>
      </motion.div>
    </div>
  );
}
