import { ImageResponse } from "next/og";

export const runtime = "edge";

export const alt = "423D Built - Custom 3D Printing & Laser Engraving";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#111111",
          padding: "60px",
        }}
      >
        {/* Top decorative line */}
        <div
          style={{
            width: "120px",
            height: "4px",
            backgroundColor: "#D4881C",
            marginBottom: "40px",
            borderRadius: "2px",
          }}
        />

        {/* Main title */}
        <div
          style={{
            fontSize: "96px",
            fontWeight: 800,
            color: "#D4881C",
            letterSpacing: "-2px",
            lineHeight: 1,
            marginBottom: "24px",
          }}
        >
          423D Built
        </div>

        {/* Subtitle */}
        <div
          style={{
            fontSize: "32px",
            fontWeight: 400,
            color: "#F5F5F5",
            letterSpacing: "4px",
            textTransform: "uppercase" as const,
            marginBottom: "40px",
          }}
        >
          Custom 3D Printing & Laser Engraving
        </div>

        {/* Bottom decorative line */}
        <div
          style={{
            width: "120px",
            height: "4px",
            backgroundColor: "#D4881C",
            marginBottom: "40px",
            borderRadius: "2px",
          }}
        />

        {/* Location */}
        <div
          style={{
            fontSize: "22px",
            fontWeight: 400,
            color: "#9ca3af",
            letterSpacing: "6px",
            textTransform: "uppercase" as const,
          }}
        >
          Bristol, Tennessee
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
