import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { PageHeader } from "@/components/site/section-heading";
import { getContent } from "@/data/content";
import { isLocale, locales, siteConfig } from "@/data/site";

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

  return {
    title: getContent(locale).legal.privacy.title,
    robots: { index: false },
  };
}

export default async function PrivacyPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const c = getContent(locale);
  const t = c.legal.privacy;

  return (
    <>
      <PageHeader title={t.title} subtitle={t.subtitle} />

      <section className="py-20">
        <div className="mx-auto max-w-3xl space-y-10 px-4 sm:px-6 lg:px-8">
          <div className="border border-solar/30 bg-solar/5 p-5 text-sm leading-relaxed text-white/70">
            {t.placeholder}
          </div>

          <div>
            <h2 className="text-xl font-semibold text-white">{t.controllerTitle}</h2>
            <address className="mt-4 leading-relaxed text-white/65 not-italic">
              {siteConfig.name}
              <br />
              {siteConfig.address.street}
              <br />
              {siteConfig.address.city}
              <br />
              {c.meta.countryName}
              <br />
              <a href={`mailto:${siteConfig.email}`} className="text-solar hover:underline">
                {siteConfig.email}
              </a>
            </address>
          </div>

          {t.sections.map((section) => (
            <div key={section.heading}>
              <h2 className="text-xl font-semibold text-white">{section.heading}</h2>
              {section.body.map((paragraph) => (
                <p key={paragraph.slice(0, 40)} className="mt-4 leading-relaxed text-white/65">
                  {paragraph}
                </p>
              ))}
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
