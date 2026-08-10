import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, Check } from "lucide-react";

import { Button } from "@/components/ui/button";
import { SectionHeading } from "@/components/site/section-heading";
import { CtaSection } from "@/components/site/cta-section";
import {
  CarportVisual,
  IconCarportCar,
  IconCarportTruck,
  IconScrewPile,
  IconStorageLeaf,
} from "@/components/brand/illustrations";
import { getSiteContent } from "@/data/cms";
import { isLocale, localePath } from "@/data/site";

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const c = await getSiteContent(locale);
  const { ui } = c;
  const L = (path: string) => localePath(locale, path);

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-white/10">
        <div className="bg-grid absolute inset-0 opacity-60" aria-hidden />
        <div className="bg-solar-glow absolute inset-0" aria-hidden />
        <div className="relative mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8 lg:py-32">
          <div className="grid items-center gap-16 lg:grid-cols-[1.05fr_1fr]">
            <div>
              <p className="eyebrow">{c.hero.eyebrow}</p>
              <h1 className="mt-5 text-4xl font-semibold tracking-tight text-balance text-white sm:text-5xl lg:text-6xl">
                {c.hero.title}
              </h1>
              <p className="mt-7 max-w-xl text-lg leading-relaxed text-white/60">
                {c.hero.subtitle}
              </p>

              <ul className="mt-8 space-y-3">
                {c.hero.highlights.map((item) => (
                  <li key={item} className="flex items-start gap-3 text-sm text-white/70">
                    <Check className="mt-0.5 size-4 shrink-0 text-solar" />
                    {item}
                  </li>
                ))}
              </ul>

              <div className="mt-10 flex flex-col gap-3 sm:flex-row">
                <Button asChild size="lg">
                  <Link href={L(c.hero.primaryCta.href)}>{c.hero.primaryCta.label}</Link>
                </Button>
                <Button asChild size="lg" variant="outline">
                  <Link href={L(c.hero.secondaryCta.href)}>{c.hero.secondaryCta.label}</Link>
                </Button>
              </div>
            </div>

            <div className="relative">
              <div className="border border-white/10 bg-surface p-8">
                <CarportVisual variant="double" className="h-auto w-full" />
              </div>
              <div className="mt-4 grid grid-cols-3 divide-x divide-white/10 border border-white/10 bg-surface">
                <div className="flex flex-col items-center gap-2 p-5 text-white/80">
                  <IconCarportCar />
                  <span className="text-[0.65rem] tracking-[0.14em] text-white/45 uppercase">
                    {ui.vehiclePkw}
                  </span>
                </div>
                <div className="flex flex-col items-center gap-2 p-5 text-white/80">
                  <IconCarportTruck />
                  <span className="text-[0.65rem] tracking-[0.14em] text-white/45 uppercase">
                    {ui.vehicleLkw}
                  </span>
                </div>
                <div className="flex flex-col items-center gap-2 p-5 text-white/80">
                  <IconStorageLeaf />
                  <span className="text-[0.65rem] tracking-[0.14em] text-white/45 uppercase">
                    {ui.vehicleStorage}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-b border-white/10">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-px bg-white/10 px-4 sm:px-6 lg:grid-cols-4 lg:px-8">
          {c.stats.map((stat) => (
            <div key={stat.label} className="bg-ground px-2 py-10 text-center lg:py-12">
              <p className="text-3xl font-semibold text-solar sm:text-4xl">{stat.value}</p>
              <p className="mt-2 text-xs tracking-[0.12em] text-white/45 uppercase">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Carport range */}
      <section className="border-b border-white/10 py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <SectionHeading
              eyebrow={c.carportsIntro.title}
              title={ui.homeCarportsTitle}
              subtitle={ui.homeCarportsSubtitle}
            />
            <Button asChild variant="outline">
              <Link href={L("/carports")}>{ui.allModels}</Link>
            </Button>
          </div>

          <div className="mt-14 grid gap-px bg-white/10 sm:grid-cols-2 lg:grid-cols-3">
            {c.carports.map((carport) => (
              <Link
                key={carport.slug}
                href={L(`/carports/${carport.slug}`)}
                className="group flex flex-col bg-ground p-8 transition-colors hover:bg-surface"
              >
                <div className="h-32">
                  <CarportVisual variant={carport.visual} />
                </div>
                <h3 className="mt-6 text-lg font-semibold tracking-[0.14em] text-white uppercase">
                  {carport.name}
                </h3>
                <p className="mt-3 flex-1 text-sm leading-relaxed text-white/55">
                  {carport.teaser}
                </p>
                <span className="mt-6 inline-flex items-center gap-2 text-xs font-semibold tracking-[0.14em] text-solar uppercase">
                  {ui.details}
                  <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-1" />
                </span>
              </Link>
            ))}

            <Link
              href={L("/kontakt")}
              className="group flex flex-col justify-between bg-ground p-8 transition-colors hover:bg-surface"
            >
              <div>
                <h3 className="text-lg font-semibold tracking-[0.14em] text-white uppercase">
                  {ui.customBuildTitle}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-white/55">{ui.customBuildBody}</p>
              </div>
              <span className="mt-6 inline-flex items-center gap-2 text-xs font-semibold tracking-[0.14em] text-solar uppercase">
                {ui.customBuildCta}
                <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-1" />
              </span>
            </Link>
          </div>
        </div>
      </section>

      {/* GroundForce */}
      <section className="border-b border-white/10 py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-16 lg:grid-cols-2 lg:items-center">
            <div>
              <SectionHeading
                eyebrow="GroundForce"
                title={ui.homeGroundForceTitle}
                subtitle={c.groundForce.subtitle}
              />
              <div className="mt-10 grid gap-6 sm:grid-cols-2">
                {c.groundForce.benefits.slice(0, 4).map((benefit) => (
                  <div key={benefit.title} className="border-l-2 border-solar/40 pl-5">
                    <h3 className="text-sm font-semibold text-white">{benefit.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-white/55">{benefit.body}</p>
                  </div>
                ))}
              </div>
              <Button asChild className="mt-10" variant="outline">
                <Link href={L("/groundforce")}>{ui.groundForceDetail}</Link>
              </Button>
            </div>

            <div className="border border-white/10 bg-surface">
              <div className="flex items-center justify-center border-b border-white/10 p-10 text-white/80">
                <IconScrewPile className="h-40 w-40" />
              </div>
              <dl className="divide-y divide-white/10">
                {c.groundForce.specs.slice(0, 4).map((spec) => (
                  <div key={spec.label} className="flex justify-between gap-6 px-6 py-4">
                    <dt className="text-xs tracking-[0.12em] text-white/40 uppercase">
                      {spec.label}
                    </dt>
                    <dd className="text-right text-sm text-white/75">{spec.value}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>
        </div>
      </section>

      {/* Why us */}
      <section className="border-b border-white/10 py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow={ui.eyebrowWhy}
            title={ui.homeWhyTitle}
            subtitle={ui.homeWhySubtitle}
          />
          <div className="mt-14 grid gap-px bg-white/10 md:grid-cols-2">
            {c.valueProps.map((prop) => (
              <div key={prop.title} className="bg-ground p-8">
                <h3 className="text-lg font-semibold text-white">{prop.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-white/55">{prop.body}</p>
              </div>
            ))}
          </div>

          <div className="mt-12 flex flex-wrap gap-4">
            {c.certifications.map((cert) => (
              <div key={cert.code} className="border border-white/10 px-5 py-3" title={cert.detail}>
                <p className="text-sm font-semibold tracking-[0.12em] text-solar uppercase">
                  {cert.code}
                </p>
                <p className="mt-1 text-xs text-white/40">{cert.detail}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Process */}
      <section className="border-b border-white/10 py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow={ui.eyebrowProcess}
            title={ui.homeProcessTitle}
            subtitle={ui.homeProcessSubtitle}
          />
          <ol className="mt-14 grid gap-px bg-white/10 lg:grid-cols-5">
            {c.processSteps.map((step) => (
              <li key={step.step} className="bg-ground p-7">
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

      {/* Projects */}
      <section className="border-b border-white/10 py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <SectionHeading
              eyebrow={c.projectsIntro.title}
              title={ui.homeProjectsTitle}
              subtitle={ui.homeProjectsSubtitle}
            />
            <Button asChild variant="outline">
              <Link href={L("/projekte")}>{ui.allProjects}</Link>
            </Button>
          </div>

          <div className="mt-14 grid gap-px bg-white/10 md:grid-cols-3">
            {c.projects.slice(0, 3).map((project) => (
              <Link
                key={project.slug}
                href={L(`/projekte/${project.slug}`)}
                className="group bg-ground p-8 transition-colors hover:bg-surface"
              >
                <p className="text-xs tracking-[0.14em] text-solar uppercase">{project.sector}</p>
                <h3 className="mt-4 text-lg font-semibold text-white">{project.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-white/55">{project.summary}</p>
                <dl className="mt-6 grid grid-cols-2 gap-4 border-t border-white/10 pt-5">
                  {project.metrics.slice(0, 2).map((metric) => (
                    <div key={metric.label}>
                      <dt className="text-[0.65rem] tracking-[0.12em] text-white/35 uppercase">
                        {metric.label}
                      </dt>
                      <dd className="mt-1 text-base font-semibold text-white">{metric.value}</dd>
                    </div>
                  ))}
                </dl>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Knowledge */}
      <section className="border-b border-white/10 py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <SectionHeading
              eyebrow={c.knowledgeIntro.title}
              title={ui.homeKnowledgeTitle}
              subtitle={ui.homeKnowledgeSubtitle}
            />
            <Button asChild variant="outline">
              <Link href={L("/wissensdatenbank")}>{ui.toKnowledgeBase}</Link>
            </Button>
          </div>

          <div className="mt-14 grid gap-px bg-white/10 md:grid-cols-3">
            {c.articles.slice(0, 3).map((article) => (
              <Link
                key={article.slug}
                href={L(`/wissensdatenbank/${article.slug}`)}
                className="group flex flex-col bg-ground p-8 transition-colors hover:bg-surface"
              >
                <div className="flex items-center gap-3 text-xs tracking-[0.12em] uppercase">
                  <span className="text-solar">{article.category}</span>
                  <span className="text-white/30">{article.readingTime}</span>
                </div>
                <h3 className="mt-4 text-lg font-semibold text-white">{article.title}</h3>
                <p className="mt-3 flex-1 text-sm leading-relaxed text-white/55">
                  {article.teaser}
                </p>
                <span className="mt-6 inline-flex items-center gap-2 text-xs font-semibold tracking-[0.14em] text-solar uppercase">
                  {ui.read}
                  <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-1" />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <CtaSection
        locale={locale}
        title={ui.ctaTitle}
        body={ui.ctaBody}
        label={ui.ctaLabel}
      />
    </>
  );
}
