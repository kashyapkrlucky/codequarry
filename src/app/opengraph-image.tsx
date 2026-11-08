import { OG_SIZE, renderOgImage } from "@/lib/seo/og";

export const alt = "CodeQuarry — Dig Deeper. Build Smarter.";
export const size = OG_SIZE;
export const contentType = "image/png";

export default function Image() {
  return renderOgImage({
    eyebrow: "Developer reference",
    title: "Everything You Need to Know. One Developer Reference.",
  });
}
