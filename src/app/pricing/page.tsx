import type { Metadata } from "next";

import { SectionHeading } from "@/components/site/section-heading";
import { PricingSection } from "@/components/site/pricing-section";
import { CtaSection } from "@/components/site/cta-section";

export const metadata: Metadata = {
  title: "Pricing",
  description:
    "Transparent, fixed-price audits starting at €349, plus Care plans from €199/month. No hourly billing, no surprise invoices.",
};

export default function PricingPage() {
  return (
    <>
      <section className="border-b border-white/10">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow="Pricing"
            title="Transparent pricing, fixed up front."
            description="Pick the audit that matches your site. Bigger fixes, redesigns and integrations are quoted as a fixed price after scoping, never hourly."
            align="center"
            className="mx-auto"
          />
          <div className="mt-12">
            <PricingSection />
          </div>
        </div>
      </section>
      <CtaSection
        title="Not sure which one you need?"
        description="Tell us your URL and goals. We'll point you to the right starting point, no pressure."
        primaryLabel="Ask Us"
      />
    </>
  );
}
