import { ImageResponse } from "next/og";

export const OG_SIZE = { width: 1200, height: 630 };

/** Shared Open Graph card renderer — brand colours, no external assets. */
export function renderOgImage({ eyebrow, title, description }: { eyebrow: string; title: string; description?: string }) {
  return new ImageResponse(
    (
      <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", width: "100%", height: "100%", padding: 72, background: "#090D18", color: "#F1F5F9", fontFamily: "sans-serif" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16, fontSize: 30, fontWeight: 600 }}>
          <svg width="52" height="52" viewBox="0 0 32 32">
            <rect width="32" height="32" rx="8" fill="#141E30" />
            <path d="M16 6 25 13 16 26 7 13Z" fill="none" stroke="#7C5CFC" strokeWidth="1.75" strokeLinejoin="round" />
            <path d="M16 6 20 13 25 13Z" fill="#00D4FF" />
          </svg>
          <span>Code</span>
          <span style={{ color: "#7C5CFC", marginLeft: -16 }}>Quarry</span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div style={{ fontSize: 26, color: "#00D4FF", textTransform: "uppercase", letterSpacing: 2 }}>{eyebrow}</div>
          <div style={{ fontSize: 72, fontWeight: 700, lineHeight: 1.05, letterSpacing: -2 }}>{title}</div>
          {description && <div style={{ fontSize: 30, color: "#94A3B8", lineHeight: 1.35, maxWidth: 1000 }}>{description}</div>}
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 24, color: "#94A3B8", borderTop: "1px solid #253248", paddingTop: 28 }}>
          <span>Dig Deeper. Build Smarter.</span>
          <span>codequarry.vercel.app</span>
        </div>
      </div>
    ),
    OG_SIZE,
  );
}
