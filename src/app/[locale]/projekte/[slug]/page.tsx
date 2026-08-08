import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { PageHeader } from "@/components/site/section-heading";
import { CtaSection } from "@/components/site/cta-section";
import { getContent } from "@/data/content";
import { isLocale, localePath, locales } from "@/data/site";

export function generateStaticParams() {
  return locales.flatMap((locale) =>
    getContent(locale).projects.map((project) => ({ locale, slug: project.slug }))
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  if (!isLocale(locale)) return {};

  const project = getContent(locale).projects.find((p) => p.slug === slug);
  if (!project) return {};

  return {
    title: project.title,
    description: project.summary,
    alternates: {
      canonical: `/${locale}/projekte/${slug}`,
      languages: Object.fromEntries(locales.map((code) => [code, `/${code}/projekte/${slug}`])),
    },
    openGraph: { title: project.title, description: project.summary },
  };
}

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  if (!isLocale(locale)) notFound();

  const c = getContent(locale);
  const { ui } = c;
  const project = c.projects.find((p) => p.slug === slug);
  if (!project) notFound();

  return (
    <>
      <PageHeader
        eyebrow={`${project.sector} · ${project.location} · ${project.year}`}
        title={project.title}
        subtitle={project.summary}
      />

      <section className="border-b border-white/10">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-px bg-white/10 px-4 sm:px-6 lg:grid-cols-4 lg:px-8">
          {project.metrics.map((metric) => (
            <div key={metric.label} className="bg-black px-2 py-10 text-center">
              <p className="text-2xl font-semibold text-solar sm:text-3xl">{metric.value}</p>
              <p className="mt-2 text-xs tracking-[0.12em] text-white/45 uppercase">
                {metric.label}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="border-b border-white/10 py-20">
        <div className="mx-auto grid max-w-5xl gap-12 px-4 sm:px-6 md:grid-cols-2 lg:px-8">
          <div>
            <p className="eyebrow">{ui.challenge}</p>
            <p className="mt-5 leading-relaxed text-white/65">{project.challenge}</p>
          </div>
          <div>
            <p className="eyebrow">{ui.solution}</p>
            <p className="mt-5 leading-relaxed text-white/65">{project.solution}</p>
          </div>
        </div>

        <div className="mx-auto mt-14 max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center justify-between gap-4 border border-white/10 px-6 py-5">
            <div>
              <p className="text-xs tracking-[0.12em] text-white/40 uppercase">{ui.modelUsed}</p>
              <p className="mt-1 text-lg font-semibold text-white">{project.model}</p>
            </div>
            <Link
              href={localePath(locale, "/carports")}
              className="text-sm font-semibold tracking-[0.12em] text-solar uppercase hover:underline"
            >
              {ui.viewModels}
            </Link>
          </div>
        </div>

        <div className="mx-auto mt-10 max-w-5xl px-4 sm:px-6 lg:px-8">
          <Link
            href={localePath(locale, "/projekte")}
            className="inline-flex items-center gap-2 text-sm text-white/50 hover:text-solar"
          >
            <ArrowLeft className="size-4" />
            {ui.allProjects}
          </Link>
        </div>
      </section>

      <CtaSection locale={locale} title={ui.ctaTitle} body={ui.ctaBody} label={ui.ctaLabel} />
    </>
  );
}
