import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Geist, Geist_Mono } from "next/font/google";

import "../globals.css";
import { Navbar } from "@/components/site/navbar";
import { Footer } from "@/components/site/footer";
import { getSiteContent } from "@/data/cms";
import {
  htmlLang,
  isLocale,
  locales,
  ogLocale,
  siteConfig,
  type Locale,
} from "@/data/site";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
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
    icons: { icon: "/logo.svg" },
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
      images: ["/logo.svg"],
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
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
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
