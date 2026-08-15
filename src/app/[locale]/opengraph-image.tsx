/**
 * The picture that appears when the site is shared in WhatsApp, iMessage,
 * LinkedIn or Slack.
 *
 * It is generated rather than stored, so it can never fall out of step with
 * the copy, and it comes out as a PNG — the messaging apps ignore SVG, which
 * is why an SVG here meant no preview picture at all.
 */
import { ImageResponse } from "next/og";

import { getSiteContent } from "@/data/cms";
import { isLocale, locales, siteConfig } from "@/data/site";

export const alt = "Solaris Industrial — Photovoltaik-Carports";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default async function Image({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  const locale = isLocale(raw) ? raw : "de";
  const content = await getSiteContent(locale);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#0a1017",
          padding: "72px 80px",
          fontFamily: "sans-serif",
        }}
      >
        {/* Mark and wordmark, matching the site header. */}
        <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
          <svg width="72" height="72" viewBox="0 0 200 200">
            <g fill="none" strokeWidth="25" strokeLinejoin="miter" strokeMiterlimit="6">
              <path d="M176 56 L100 12 L24 56 L24 101 L176 145" stroke="#ffffff" />
              <path d="M24 145 L100 189 L176 145" stroke="#f5c518" />
            </g>
          </svg>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ fontSize: 38, fontWeight: 600, color: "#fff", letterSpacing: 12 }}>
              SOLARIS
            </div>
            <div style={{ fontSize: 17, fontWeight: 500, color: "#f5c518", letterSpacing: 15 }}>
              INDUSTRIAL
            </div>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 26 }}>
          <div style={{ fontSize: 62, fontWeight: 600, color: "#fff", lineHeight: 1.12 }}>
            {content.meta.claim}
          </div>
          <div style={{ fontSize: 27, color: "rgba(232,237,242,0.62)", lineHeight: 1.45 }}>
            {content.hero.highlights.slice(0, 3).join("  ·  ")}
          </div>
        </div>

        {/* A rule in the brand yellow, so the card reads as one piece. */}
        <div style={{ display: "flex", alignItems: "center", gap: 28 }}>
          <div style={{ width: 96, height: 5, background: "#f5c518" }} />
          <div style={{ fontSize: 23, color: "rgba(232,237,242,0.5)" }}>
            {siteConfig.url.replace(/^https?:\/\//, "")}
          </div>
        </div>
      </div>
    ),
    size
  );
}
