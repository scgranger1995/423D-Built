import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#111",
          borderRadius: "6px",
        }}
      >
        <div
          style={{
            fontSize: "14px",
            fontWeight: 800,
            color: "#D4881C",
            letterSpacing: "-0.5px",
            lineHeight: 1,
          }}
        >
          423D
        </div>
      </div>
    ),
    { ...size }
  );
}
