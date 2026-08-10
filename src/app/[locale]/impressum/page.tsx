import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { PageHeader } from "@/components/site/section-heading";
import { getSiteContent } from "@/data/cms";
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
    title: (await getSiteContent(locale)).legal.impressum.title,
    robots: { index: false },
  };
}

export default async function ImpressumPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const c = await getSiteContent(locale);
  const t = c.legal.impressum;

  return (
    <>
      <PageHeader title={t.title} subtitle={t.subtitle} />

      <section className="py-20">
        <div className="mx-auto max-w-3xl space-y-10 px-4 sm:px-6 lg:px-8">
          <div className="border border-solar/30 bg-solar/5 p-5 text-sm leading-relaxed text-white/70">
            {t.placeholder}
          </div>

          <div>
            <h2 className="text-xl font-semibold text-white">{t.providerTitle}</h2>
            <address className="mt-4 leading-relaxed text-white/65 not-italic">
              {siteConfig.name}
              <br />
              {siteConfig.address.street}
              <br />
              {siteConfig.address.city}
              <br />
              {c.meta.countryName}
            </address>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-white">{t.contactTitle}</h2>
            <p className="mt-4 leading-relaxed text-white/65">
              {c.contact.channelLabels.phone}:{" "}
              <a href={`tel:${siteConfig.phoneHref}`} className="text-solar hover:underline">
                {siteConfig.phone}
              </a>
              <br />
              {c.contact.channelLabels.email}:{" "}
              <a href={`mailto:${siteConfig.email}`} className="text-solar hover:underline">
                {siteConfig.email}
              </a>
            </p>
          </div>

          {t.sections.map((section) => (
            <div key={section.heading}>
              <h2 className="text-xl font-semibold text-white">{section.heading}</h2>
              <p className="mt-4 leading-relaxed text-white/65">{section.body}</p>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
