import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { PageHeader, SectionHeading } from "@/components/site/section-heading";
import { CtaSection } from "@/components/site/cta-section";
import { IconScrewPile } from "@/components/brand/illustrations";
import { getContent } from "@/data/content";
import { isLocale, locales } from "@/data/site";

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
  const { groundForce } = getContent(locale);

  return {
    title: groundForce.title,
    description: groundForce.subtitle,
    alternates: {
      canonical: `/${locale}/groundforce`,
      languages: Object.fromEntries(locales.map((code) => [code, `/${code}/groundforce`])),
    },
  };
}

export default async function GroundForcePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const c = getContent(locale);
  const { ui, groundForce: gf } = c;

  return (
    <>
      <PageHeader eyebrow={ui.eyebrowTechnology} title={gf.title} subtitle={gf.subtitle} />

      <section className="border-b border-white/10 py-20">
        <div className="mx-auto grid max-w-7xl gap-14 px-4 sm:px-6 lg:grid-cols-[1.3fr_1fr] lg:items-center lg:px-8">
          <p className="text-lg leading-relaxed text-white/70">{gf.intro}</p>
          <div className="flex items-center justify-center border border-white/10 bg-surface p-12 text-white/80">
            <IconScrewPile className="h-48 w-48" />
          </div>
        </div>
      </section>

      <section className="border-b border-white/10 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow={ui.eyebrowAdvantages}
            title={ui.homeGroundForceTitle}
            subtitle={gf.subtitle}
          />
          <div className="mt-14 grid gap-px bg-white/10 md:grid-cols-2 lg:grid-cols-3">
            {gf.benefits.map((benefit) => (
              <div key={benefit.title} className="bg-black p-8">
                <h3 className="text-lg font-semibold text-white">{benefit.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-white/55">{benefit.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-b border-white/10 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading eyebrow={ui.eyebrowProcess} title={ui.homeProcessTitle} />
          <ol className="mt-14 grid gap-px bg-white/10 md:grid-cols-2 lg:grid-cols-4">
            {gf.process.map((step) => (
              <li key={step.step} className="bg-black p-8">
                <span className="text-xs font-semibold tracking-[0.2em] text-solar">
                  {step.step}
                </span>
                <h3 className="mt-4 text-base font-semibold text-white">{step.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-white/55">{step.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="border-b border-white/10 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading eyebrow={ui.eyebrowComparison} title={gf.comparison.caption} />

          <div className="mt-12 overflow-x-auto">
            <table className="w-full min-w-[42rem] border-collapse text-left">
              <thead>
                <tr className="border-b border-white/15">
                  <th className="py-4 pr-6 text-xs tracking-[0.14em] text-white/40 uppercase">
                    {gf.comparison.headers.criterion}
                  </th>
                  <th className="py-4 pr-6 text-xs tracking-[0.14em] text-solar uppercase">
                    {gf.comparison.headers.groundforce}
                  </th>
                  <th className="py-4 text-xs tracking-[0.14em] text-white/40 uppercase">
                    {gf.comparison.headers.concrete}
                  </th>
                </tr>
              </thead>
              <tbody>
                {gf.comparison.rows.map((row) => (
                  <tr key={row.criterion} className="border-b border-white/10">
                    <td className="py-4 pr-6 text-sm text-white/60">{row.criterion}</td>
                    <td className="py-4 pr-6 text-sm font-medium text-white">{row.groundforce}</td>
                    <td className="py-4 text-sm text-white/50">{row.concrete}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section className="border-b border-white/10 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading eyebrow={ui.eyebrowSpecs} title={gf.title} />
          <dl className="mt-12 grid gap-px bg-white/10 sm:grid-cols-2 lg:grid-cols-3">
            {gf.specs.map((spec) => (
              <div key={spec.label} className="bg-black p-7">
                <dt className="text-xs tracking-[0.12em] text-white/40 uppercase">{spec.label}</dt>
                <dd className="mt-3 text-sm leading-relaxed text-white/80">{spec.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <CtaSection
        locale={locale}
        title={gf.cta.title}
        body={gf.cta.body}
        label={gf.cta.label}
        href={gf.cta.href}
      />
    </>
  );
}
