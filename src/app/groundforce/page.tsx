import type { Metadata } from "next";

import { PageHeader, SectionHeading } from "@/components/site/section-heading";
import { CtaSection } from "@/components/site/cta-section";
import { IconScrewPile } from "@/components/brand/illustrations";
import { groundForce } from "@/data/solaris";

export const metadata: Metadata = {
  title: "GroundForce Fundamente",
  description: groundForce.subtitle,
};

export default function GroundForcePage() {
  return (
    <>
      <PageHeader
        eyebrow="Technologie"
        title={groundForce.title}
        subtitle={groundForce.subtitle}
      />

      <section className="border-b border-white/10 py-20">
        <div className="mx-auto grid max-w-7xl gap-14 px-4 sm:px-6 lg:grid-cols-[1.3fr_1fr] lg:items-center lg:px-8">
          <div>
            <p className="text-lg leading-relaxed text-white/70">{groundForce.intro}</p>
          </div>
          <div className="flex items-center justify-center border border-white/10 bg-surface p-12 text-white/80">
            <IconScrewPile className="h-48 w-48" />
          </div>
        </div>
      </section>

      <section className="border-b border-white/10 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow="Vorteile"
            title="Warum GroundForce"
            subtitle="Die Gründung entscheidet über Bauzeit, Betriebsunterbrechung und einen erheblichen Teil der Bausumme."
          />
          <div className="mt-14 grid gap-px bg-white/10 md:grid-cols-2 lg:grid-cols-3">
            {groundForce.benefits.map((benefit) => (
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
          <SectionHeading
            eyebrow="Ablauf"
            title="In vier Schritten gegründet"
            subtitle="Vor der Serienmontage steht immer der Nachweis am konkreten Standort – nicht die Annahme aus dem Katalog."
          />
          <ol className="mt-14 grid gap-px bg-white/10 md:grid-cols-2 lg:grid-cols-4">
            {groundForce.process.map((step) => (
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
          <SectionHeading eyebrow="Vergleich" title={groundForce.comparison.caption} />

          <div className="mt-12 overflow-x-auto">
            <table className="w-full min-w-[42rem] border-collapse text-left">
              <thead>
                <tr className="border-b border-white/15">
                  <th className="py-4 pr-6 text-xs tracking-[0.14em] text-white/40 uppercase">
                    Kriterium
                  </th>
                  <th className="py-4 pr-6 text-xs tracking-[0.14em] text-solar uppercase">
                    GroundForce
                  </th>
                  <th className="py-4 text-xs tracking-[0.14em] text-white/40 uppercase">
                    Betongründung
                  </th>
                </tr>
              </thead>
              <tbody>
                {groundForce.comparison.rows.map((row) => (
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
          <SectionHeading eyebrow="Technische Daten" title="GroundForce Schraubfundament" />
          <dl className="mt-12 grid gap-px bg-white/10 sm:grid-cols-2 lg:grid-cols-3">
            {groundForce.specs.map((spec) => (
              <div key={spec.label} className="bg-black p-7">
                <dt className="text-xs tracking-[0.12em] text-white/40 uppercase">{spec.label}</dt>
                <dd className="mt-3 text-sm leading-relaxed text-white/80">{spec.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <CtaSection
        title={groundForce.cta.title}
        body={groundForce.cta.body}
        label={groundForce.cta.label}
        href={groundForce.cta.href}
      />
    </>
  );
}
