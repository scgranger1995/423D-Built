import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "423D Built",
    short_name: "423D",
    description:
      "Professional 3D printing and laser engraving services in Bristol, Tennessee.",
    start_url: "/",
    display: "standalone",
    theme_color: "#D4881C",
    background_color: "#0a0a0a",
    icons: [
      {
        src: "/icon",
        sizes: "32x32",
        type: "image/png",
      },
    ],
  };
}
