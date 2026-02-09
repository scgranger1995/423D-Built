export default function Loading() {
  return (
    <div
      className="min-h-[calc(100vh-68px)] flex flex-col items-center justify-center"
      style={{ backgroundColor: "#111111" }}
    >
      <div
        className="w-12 h-12 rounded-full animate-spin mb-4"
        style={{
          border: "4px solid rgba(212,136,28,0.2)",
          borderTopColor: "#D4881C",
        }}
      />
      <p className="text-sm" style={{ color: "#9ca3af" }}>
        Loading...
      </p>
    </div>
  );
}
