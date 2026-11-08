"use client";

export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="en">
      <body style={{ background: "#090D18", color: "#F1F5F9", fontFamily: "system-ui, sans-serif", display: "grid", placeItems: "center", minHeight: "100vh", margin: 0 }}>
        <div style={{ textAlign: "center" }}>
          <h1 style={{ fontSize: 24 }}>CodeQuarry is temporarily unavailable</h1>
          <button onClick={reset} style={{ marginTop: 16, padding: "8px 16px", borderRadius: 8, border: "1px solid #253248", background: "#141E30", color: "inherit", cursor: "pointer" }}>
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
