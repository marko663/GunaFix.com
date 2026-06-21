import type { Metadata } from "next";

import { ContentGrid } from "@/components/site/content-grid";
import { SectionHeading } from "@/components/site/section-heading";
import { CtaSection } from "@/components/site/cta-section";
import { technologies } from "@/data/content";

export const metadata: Metadata = {
  title: "Technologies",
  description:
    "A modern, battle-tested stack: React, Next.js, Tailwind CSS, shadcn/ui, Node.js, Supabase, OpenAI/Anthropic/Gemini, Shopify and WordPress.",
};

export default function TechnologiesPage() {
  return (
    <>
      <section className="border-b border-white/10">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow="Technologies"
            title="Technologies we work with"
            description="Chosen for speed, SEO and long-term maintainability."
          />
          <div className="mt-12">
            <ContentGrid items={technologies} basePath="/technologies" />
          </div>
        </div>
      </section>
      <CtaSection />
    </>
  );
}
