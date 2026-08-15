import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { IBM_Plex_Sans, IBM_Plex_Mono } from "next/font/google";

import "../globals.css";
import { Navbar } from "@/components/site/navbar";
import { Footer } from "@/components/site/footer";
import { getSiteContent } from "@/data/cms";
import {
  htmlLang,
  isLocale,
  locales,
  noIndex,
  ogLocale,
  siteConfig,
  type Locale,
} from "@/data/site";

/*
 * IBM Plex was drawn for an engineering company, and it shows: the letters
 * are precise without being anonymous, and the mono cut suits the spec
 * tables and part labels. latin-ext covers the accented characters in the
 * European place names alongside German ä ö ü ß.
 */
const plexSans = IBM_Plex_Sans({
  variable: "--font-plex-sans",
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500", "600"],
  display: "swap",
});

const plexMono = IBM_Plex_Mono({
  variable: "--font-plex-mono",
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500"],
  display: "swap",
});

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};

  const content = await getSiteContent(locale);
  const title = `${siteConfig.name} | ${content.meta.claim}`;

  return {
    metadataBase: new URL(siteConfig.url),
    title: { default: title, template: `%s | ${siteConfig.name}` },
    description: content.meta.description,
    // Icons and the share picture come from src/app/icon.svg and
    // opengraph-image.tsx, which Next wires up on its own. Naming them here
    // would override the generated PNG with an SVG, which the messaging apps
    // silently refuse to render.
    ...(noIndex ? { robots: { index: false, follow: false } } : {}),
    alternates: {
      canonical: `/${locale}`,
      languages: Object.fromEntries(locales.map((code) => [code, `/${code}`])),
    },
    openGraph: {
      title,
      description: content.meta.description,
      url: `${siteConfig.url}/${locale}`,
      siteName: siteConfig.name,
      locale: ogLocale[locale],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: content.meta.description,
    },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const typedLocale: Locale = locale;
  const content = await getSiteContent(typedLocale);

  return (
    <html
      lang={htmlLang[typedLocale]}
      className={`${plexSans.variable} ${plexMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              name: siteConfig.name,
              url: siteConfig.url,
              email: siteConfig.email,
              telephone: siteConfig.phone,
              description: content.meta.description,
              address: {
                "@type": "PostalAddress",
                streetAddress: siteConfig.address.street,
                addressLocality: siteConfig.address.city,
                addressCountry: "DE",
              },
            }),
          }}
        />
        <Navbar locale={typedLocale} content={content} />
        <main className="flex-1">{children}</main>
        <Footer locale={typedLocale} content={content} />
      </body>
    </html>
  );
}
