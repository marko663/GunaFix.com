import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Redaktion — Solaris Industrial",
  robots: { index: false, follow: false },
};

/**
 * The Studio ships its own styling and sits outside the localised site,
 * so it carries a bare root layout.
 */
export default function StudioLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de">
      <body style={{ margin: 0 }}>{children}</body>
    </html>
  );
}
