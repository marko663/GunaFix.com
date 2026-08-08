import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { PageHeader } from "@/components/site/section-heading";
import { CtaSection } from "@/components/site/cta-section";
import { projects, projectsIntro, stats } from "@/data/solaris";

export const metadata: Metadata = {
  title: "Unsere Projekte",
  description: projectsIntro.subtitle,
};

export default function ProjectsPage() {
  return (
    <>
      <PageHeader
        eyebrow="Referenzen"
        title={projectsIntro.title}
        subtitle={projectsIntro.subtitle}
      />

      <section className="border-b border-white/10">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-px bg-white/10 px-4 sm:px-6 lg:grid-cols-4 lg:px-8">
          {stats.map((stat) => (
            <div key={stat.label} className="bg-black px-2 py-10 text-center">
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
          <div className="grid gap-px bg-white/10 md:grid-cols-2">
            {projects.map((project) => (
              <Link
                key={project.slug}
                href={`/projekte/${project.slug}`}
                className="group flex flex-col bg-black p-8 transition-colors hover:bg-surface lg:p-10"
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
                  Projekt ansehen
                  <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-1" />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <CtaSection
        title="Ein vergleichbares Projekt geplant?"
        body="Wir zeigen Ihnen gern Referenzen aus Ihrer Branche und stellen den Kontakt zu Betreibern her, die eine ähnliche Fläche überdacht haben."
        label="Referenzen anfragen"
      />
    </>
  );
}
