import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { PageHeader } from "@/components/site/section-heading";
import { CtaSection } from "@/components/site/cta-section";
import { CarportVisual } from "@/components/brand/illustrations";
import { getContent } from "@/data/content";
import { isLocale, localePath, locales } from "@/data/site";

export function generateStaticParams() {
  return locales.flatMap((locale) =>
    getContent(locale).carports.map((carport) => ({ locale, slug: carport.slug }))
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  if (!isLocale(locale)) return {};

  const carport = getContent(locale).carports.find((c) => c.slug === slug);
  if (!carport) return {};

  return {
    title: { absolute: carport.seoTitle },
    description: carport.metaDescription,
    alternates: {
      canonical: `/${locale}/carports/${slug}`,
      languages: Object.fromEntries(
        locales.map((code) => [code, `/${code}/carports/${slug}`])
      ),
    },
    openGraph: { title: carport.seoTitle, description: carport.metaDescription },
  };
}

export default async function CarportDetailPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  if (!isLocale(locale)) notFound();

  const c = getContent(locale);
  const { ui } = c;
  const carport = c.carports.find((item) => item.slug === slug);
  if (!carport) notFound();

  const others = c.carports.filter((item) => item.slug !== carport.slug);

  return (
    <>
      <PageHeader eyebrow={carport.family} title={carport.name} subtitle={carport.intro} />

      <section className="border-b border-white/10 py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-10 lg:grid-cols-[1.3fr_1fr]">
            <div className="border border-white/10 bg-surface p-8">
              <CarportVisual variant={carport.visual} />
              <p className="mt-6 text-xs tracking-[0.12em] text-white/35 uppercase">
                {ui.elevationNote}
              </p>
            </div>

            <div className="border border-white/10">
              <p className="border-b border-white/10 px-6 py-4 text-xs font-semibold tracking-[0.16em] text-solar uppercase">
                {ui.technicalData}
              </p>
              <dl className="divide-y divide-white/10">
                {carport.specs.map((spec) => (
                  <div key={spec.label} className="flex justify-between gap-6 px-6 py-4">
                    <dt className="text-xs tracking-[0.1em] text-white/40 uppercase">
                      {spec.label}
                    </dt>
                    <dd className="text-right text-sm text-white/80">{spec.value}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-white/10 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
            {ui.roofTypes}
          </h2>
          <div className="mt-10 grid gap-px bg-white/10 sm:grid-cols-2 lg:grid-cols-4">
            {carport.types.map((type) => (
              <div key={type.code} className="bg-ground p-7">
                <p className="text-sm font-semibold tracking-[0.16em] text-solar uppercase">
                  {type.code}
                </p>
                <h3 className="mt-3 text-base font-semibold text-white">{type.name}</h3>
                <p className="mt-3 text-sm leading-relaxed text-white/55">{type.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-b border-white/10 py-20">
        <div className="mx-auto grid max-w-7xl gap-14 px-4 sm:px-6 lg:grid-cols-[1.4fr_1fr] lg:px-8">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
              {ui.inUse.replace("{model}", carport.name)}
            </h2>
            <div className="mt-8 space-y-5">
              {carport.body.map((paragraph) => (
                <p key={paragraph.slice(0, 40)} className="leading-relaxed text-white/60">
                  {paragraph}
                </p>
              ))}
            </div>
          </div>

          <div className="border border-white/10 p-8">
            <p className="eyebrow">{ui.typicalApplications}</p>
            <ul className="mt-6 space-y-4">
              {carport.applications.map((application) => (
                <li key={application} className="flex items-start gap-3 text-sm text-white/70">
                  <span className="mt-1.5 size-1 shrink-0 bg-solar" aria-hidden />
                  {application}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="border-b border-white/10 py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <h2 className="text-xl font-semibold text-white">{ui.otherModels}</h2>
            <Link
              href={localePath(locale, "/carports")}
              className="inline-flex items-center gap-2 text-sm text-white/50 hover:text-solar"
            >
              <ArrowLeft className="size-4" />
              {ui.overview}
            </Link>
          </div>
          <div className="mt-8 grid gap-px bg-white/10 sm:grid-cols-2 lg:grid-cols-4">
            {others.map((other) => (
              <Link
                key={other.slug}
                href={localePath(locale, `/carports/${other.slug}`)}
                className="bg-ground p-6 transition-colors hover:bg-surface"
              >
                <p className="text-sm font-semibold tracking-[0.14em] text-white uppercase">
                  {other.name}
                </p>
                <p className="mt-2 text-sm text-white/50">{other.teaser}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <CtaSection
        locale={locale}
        title={ui.modelCtaTitle.replace("{model}", carport.name)}
        body={ui.modelCtaBody}
        label={ui.requestProject}
      />
    </>
  );
}
