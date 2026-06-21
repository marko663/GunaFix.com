import type { Metadata } from "next";

import { ContentGrid } from "@/components/site/content-grid";
import { SectionHeading } from "@/components/site/section-heading";
import { CtaSection } from "@/components/site/cta-section";
import { services } from "@/data/content";

export const metadata: Metadata = {
  title: "Services",
  description:
    "AI website audits, rapid fixes, performance optimization, AI integrations, full redesigns and ongoing care, all from one accountable team.",
};

export default function ServicesPage() {
  return (
    <>
      <section className="border-b border-white/10">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow="Services"
            title="What we do"
            description="From quick fixes to full transformations, powered by AI."
          />
          <div className="mt-12">
            <ContentGrid items={services} basePath="/services" showFeatures />
          </div>
        </div>
      </section>
      <CtaSection />
    </>
  );
}
