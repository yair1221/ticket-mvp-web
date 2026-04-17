import { ImageResponse } from "next/og";

export const runtime = "edge";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "TicketIL - כרטיסים לליגת העל";

export default function OGImage() {
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
          background:
            "linear-gradient(135deg, #7C5CFC 0%, #5B3FDB 100%)",
          color: "white",
          fontFamily: "sans-serif",
          padding: 80,
          textAlign: "center",
        }}
      >
        <div
          style={{
            fontSize: 120,
            fontWeight: 900,
            letterSpacing: -4,
            marginBottom: 30,
          }}
        >
          TicketIL
        </div>
        <div
          style={{
            fontSize: 48,
            fontWeight: 700,
            opacity: 0.95,
            marginBottom: 20,
          }}
        >
          כרטיסים לליגת העל
        </div>
        <div style={{ fontSize: 32, opacity: 0.8 }}>
          מוכרים מאומתים · ללא עמלות
        </div>
      </div>
    ),
    { ...size },
  );
}
