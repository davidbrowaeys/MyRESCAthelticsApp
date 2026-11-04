// _______________This Code was generated using GenAI tool : Codify, Please check for accuracy_______________
import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "My RESC Athletics",
    short_name: "RESC Athl.",
    description: "Compagnon d'athlétisme privé pour le RESC",
    lang: "fr",
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#f4f7fd",
    theme_color: "#0a3d91",
    // Placeholder SVG icons. Replace with approved RESC assets (PNG 192/512 + maskable) when supplied.
    icons: [
      { src: "/icons/icon.svg", sizes: "any", type: "image/svg+xml", purpose: "any" },
      { src: "/icons/icon-maskable.svg", sizes: "any", type: "image/svg+xml", purpose: "maskable" },
    ],
  };
}
// __________________________GenAI: Generated code ends here______________________________
