import Link from "next/link";

export default function NotFound() {
  return (
    <div
      className="min-h-[calc(100vh-68px)] flex flex-col items-center justify-center px-6 text-center"
      style={{ backgroundColor: "#111111" }}
    >
      <p
        className="text-8xl md:text-9xl font-bold mb-4"
        style={{ fontFamily: "var(--font-heading)", color: "#D4881C" }}
      >
        404
      </p>

      <h1
        className="text-3xl md:text-4xl font-bold mb-4"
        style={{ fontFamily: "var(--font-heading)", color: "#F5F5F5" }}
      >
        Page Not Found
      </h1>

      <p
        className="text-lg max-w-md mb-8"
        style={{ color: "#9ca3af" }}
      >
        Sorry, we could not find the page you are looking for. It may have been
        moved or no longer exists.
      </p>

      <Link
        href="/"
        className="inline-flex items-center justify-center px-8 py-4 font-semibold rounded-lg transition-all duration-300 text-lg"
        style={{
          backgroundColor: "#D4881C",
          color: "#000",
          boxShadow: "0 0 20px rgba(212,136,28,0.3)",
        }}
      >
        Back to Home
      </Link>
    </div>
  );
}
