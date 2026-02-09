"use client";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div
      className="min-h-[calc(100vh-68px)] flex flex-col items-center justify-center px-6 text-center"
      style={{ backgroundColor: "#111111" }}
    >
      <div
        className="w-16 h-16 rounded-full flex items-center justify-center mb-6"
        style={{ backgroundColor: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)" }}
      >
        <svg
          width="32"
          height="32"
          viewBox="0 0 24 24"
          fill="none"
          stroke="rgb(248,113,113)"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
      </div>

      <h1
        className="text-3xl md:text-4xl font-bold mb-4"
        style={{ fontFamily: "var(--font-heading)", color: "#F5F5F5" }}
      >
        Something Went Wrong
      </h1>

      <p
        className="text-lg max-w-md mb-8"
        style={{ color: "#9ca3af" }}
      >
        An unexpected error occurred. Please try again, or contact us if the
        problem persists.
      </p>

      <button
        onClick={() => reset()}
        className="inline-flex items-center justify-center px-8 py-4 font-semibold rounded-lg transition-all duration-300 text-lg"
        style={{
          backgroundColor: "#D4881C",
          color: "#000",
          boxShadow: "0 0 20px rgba(212,136,28,0.3)",
        }}
      >
        Try Again
      </button>
    </div>
  );
}
