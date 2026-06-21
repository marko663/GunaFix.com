import type { Metadata } from "next";

import { ContentGrid } from "@/components/site/content-grid";
import { SectionHeading } from "@/components/site/section-heading";
import { CtaSection } from "@/components/site/cta-section";
import { industries } from "@/data/content";

export const metadata: Metadata = {
  title: "Industries",
  description:
    "GunaFix has rebuilt and repaired websites for e-commerce, SaaS, local businesses, real estate, agencies, healthcare, finance and creators.",
};

export default function IndustriesPage() {
  return (
    <>
      <section className="border-b border-white/10">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow="Industries"
            title="Industries we serve"
            description="Whatever your niche, we've shipped for someone like you."
          />
          <div className="mt-12">
            <ContentGrid items={industries} basePath="/industries" />
          </div>
        </div>
      </section>
      <CtaSection />
    </>
  );
}
