import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight } from "lucide-react";

import { PageHeader } from "@/components/site/section-heading";
import { CtaSection } from "@/components/site/cta-section";
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
    title: c.projectsIntro.title,
    description: c.projectsIntro.subtitle,
    alternates: {
      canonical: `/${locale}/projekte`,
      languages: Object.fromEntries(locales.map((code) => [code, `/${code}/projekte`])),
    },
  };
}

export default async function ProjectsPage({
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
        eyebrow={ui.eyebrowReferences}
        title={c.projectsIntro.title}
        subtitle={c.projectsIntro.subtitle}
      />

      <section className="border-b border-white/10">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-px bg-white/10 px-4 sm:px-6 lg:grid-cols-4 lg:px-8">
          {c.stats.map((stat) => (
            <div key={stat.label} className="bg-ground px-2 py-10 text-center">
              <p className="text-3xl font-semibold text-solar sm:text-4xl">{stat.value}</p>
              <p className="mt-2 text-xs tracking-[0.12em] text-white/45 uppercase">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <p className="mb-10 border border-solar/30 bg-solar/5 px-5 py-4 text-sm leading-relaxed text-white/70">
            {c.projectsIntro.disclaimer}
          </p>

          <div className="grid gap-px bg-white/10 md:grid-cols-2">
            {c.projects.map((project) => (
              <Link
                key={project.slug}
                href={localePath(locale, `/projekte/${project.slug}`)}
                className="group flex flex-col bg-ground p-8 transition-colors hover:bg-surface lg:p-10"
              >
                <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs tracking-[0.12em] uppercase">
                  <span className="text-solar">{project.sector}</span>
                  <span className="text-white/30">{project.location}</span>
                  <span className="text-white/30">{project.year}</span>
                </div>

                <h2 className="mt-5 text-2xl font-semibold tracking-tight text-white">
                  {project.title}
                </h2>
                <p className="mt-4 flex-1 leading-relaxed text-white/55">{project.summary}</p>

                <dl className="mt-8 grid grid-cols-2 gap-6 border-t border-white/10 pt-6 sm:grid-cols-4">
                  {project.metrics.map((metric) => (
                    <div key={metric.label}>
                      <dt className="text-[0.65rem] tracking-[0.12em] text-white/35 uppercase">
                        {metric.label}
                      </dt>
                      <dd className="mt-1 text-base font-semibold text-white">{metric.value}</dd>
                    </div>
                  ))}
                </dl>

                <span className="mt-8 inline-flex items-center gap-2 text-xs font-semibold tracking-[0.14em] text-solar uppercase">
                  {ui.viewProject}
                  <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-1" />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <CtaSection
        locale={locale}
        title={ui.projectsCtaTitle}
        body={ui.projectsCtaBody}
        label={ui.projectsCtaLabel}
      />
    </>
  );
}
