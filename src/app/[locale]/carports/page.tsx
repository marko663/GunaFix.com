import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight } from "lucide-react";

import { PageHeader } from "@/components/site/section-heading";
import { CtaSection } from "@/components/site/cta-section";
import { CarportVisual } from "@/components/brand/illustrations";
import { getContent } from "@/data/content";
import { isLocale, localePath, locales } from "@/data/site";

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
  const c = getContent(locale);

  return {
    title: c.carportsIntro.title,
    description: c.carportsIntro.subtitle,
    alternates: {
      canonical: `/${locale}/carports`,
      languages: Object.fromEntries(locales.map((code) => [code, `/${code}/carports`])),
    },
  };
}

export default async function CarportsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const c = getContent(locale);
  const { ui } = c;

  return (
    <>
      <PageHeader
        eyebrow={ui.eyebrowProducts}
        title={c.carportsIntro.title}
        subtitle={c.carportsIntro.subtitle}
      >
        <p className="mt-8 max-w-2xl border-l-2 border-solar/50 pl-5 text-sm text-white/50">
          {c.carportsIntro.note}
        </p>
      </PageHeader>

      <section className="py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="space-y-px bg-white/10">
            {c.carports.map((carport, index) => (
              <article
                key={carport.slug}
                className="grid gap-10 bg-black p-8 lg:grid-cols-[1fr_1.2fr] lg:items-start lg:p-12"
              >
                <div className="order-1 border border-white/10 bg-surface p-6 lg:order-none lg:sticky lg:top-32">
                  <CarportVisual variant={carport.visual} />
                </div>

                <div>
                  <p className="text-xs font-semibold tracking-[0.2em] text-solar">
                    {String(index + 1).padStart(2, "0")}
                  </p>
                  <h2 className="mt-3 text-3xl font-semibold tracking-[0.14em] text-white uppercase">
                    {carport.name}
                  </h2>
                  <p className="mt-4 text-base leading-relaxed text-white/60">{carport.teaser}</p>

                  <ul className="mt-6 grid gap-2 sm:grid-cols-2">
                    {carport.highlights.map((highlight) => (
                      <li key={highlight} className="flex items-start gap-2 text-sm text-white/55">
                        <span className="mt-1.5 size-1 shrink-0 bg-solar" aria-hidden />
                        {highlight}
                      </li>
                    ))}
                  </ul>

                  <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3">
                    <Link
                      href={localePath(locale, `/carports/${carport.slug}`)}
                      className="group inline-flex items-center gap-2 text-sm font-semibold tracking-[0.12em] text-solar uppercase"
                    >
                      {ui.technicalData}
                      <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
                    </Link>
                    <span className="text-xs tracking-[0.12em] text-white/35 uppercase">
                      {carport.types.map((type) => type.code).join(" · ")}
                    </span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <CtaSection
        locale={locale}
        title={ui.carportsCtaTitle}
        body={ui.carportsCtaBody}
        label={ui.carportsCtaLabel}
      />
    </>
  );
}
