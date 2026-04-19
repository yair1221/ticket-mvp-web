import { ImageResponse } from "next/og";

export const runtime = "edge";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "TicketIL - כרטיסים לליגת העל";

async function loadAssistantFont(weight: 400 | 700 | 800) {
  const css = await fetch(
    `https://fonts.googleapis.com/css2?family=Assistant:wght@${weight}&display=swap`,
    {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      },
    },
  ).then((r) => r.text());

  const url = css.match(/src:\s*url\(([^)]+)\)\s*format\('(?:opentype|truetype)'\)/)?.[1];
  if (!url) throw new Error("Assistant font URL not found");
  const data = await fetch(url).then((r) => r.arrayBuffer());
  return data;
}

export default async function OGImage() {
  const [regular, bold, extraBold] = await Promise.all([
    loadAssistantFont(400),
    loadAssistantFont(700),
    loadAssistantFont(800),
  ]);

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
          backgroundColor: "#FFFFFF",
          fontFamily: "Assistant",
        }}
      >
        {/* Logo + brand (matches site header) */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 20,
            marginBottom: 56,
          }}
        >
          <div
            style={{
              width: 180,
              height: 180,
              borderRadius: 9999,
              backgroundColor: "#2563EB",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <svg width={112} height={112} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path
                fill="#FFFFFF"
                d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2m1 3.3 1.35-.95c1.82.56 3.37 1.76 4.38 3.34l-.39 1.34-1.35.46L13 6.7zm-3.35-.95L11 5.3v1.4L7.01 9.49l-1.35-.46-.39-1.34c1.01-1.57 2.56-2.77 4.38-3.34M7.08 17.11l-1.14.1C4.73 15.81 4 13.99 4 12c0-.12.01-.23.02-.35l1-.73 1.38.48 1.46 4.34zm7.42 2.48c-.79.26-1.63.41-2.5.41s-1.71-.15-2.5-.41l-.69-1.49.64-1.1h5.11l.64 1.11zM14.27 15H9.73l-1.35-4.02L12 8.44l3.63 2.54zm3.79 2.21-1.14-.1-.79-1.37 1.46-4.34 1.39-.47 1 .73c.01.11.02.22.02.34 0 1.99-.73 3.81-1.94 5.21"
              />
            </svg>
          </div>
          <div
            style={{
              fontSize: 160,
              fontWeight: 800,
              color: "#2563EB",
              letterSpacing: -3,
              lineHeight: 1,
            }}
          >
            TicketIL
          </div>
        </div>

        {/* Hebrew tagline — reversed manually because satori renders LTR */}
        <div
          style={{
            fontSize: 64,
            fontWeight: 700,
            color: "#1E293B",
            display: "flex",
          }}
        >
          {"כרטיסים לליגת העל".split(" ").reverse().map(w => w.split("").reverse().join("")).join(" ")}
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: "Assistant", data: regular, weight: 400, style: "normal" },
        { name: "Assistant", data: bold, weight: 700, style: "normal" },
        { name: "Assistant", data: extraBold, weight: 800, style: "normal" },
      ],
    },
  );
}
