import { Hero } from "@/components/site/hero";
import { WhyUs } from "@/components/site/why-us";
import { ListingSection } from "@/components/site/listing-section";
import { PipelineVisual } from "@/components/site/pipeline-visual";
import { HowItWorks } from "@/components/site/how-it-works";
import { FaqSection } from "@/components/site/faq-section";
import { CtaSection } from "@/components/site/cta-section";
import { services, industries, technologies } from "@/data/content";

export default function HomePage() {
  return (
    <>
      <Hero />
      <ListingSection
        eyebrow="Services"
        title="What we do"
        description="From quick fixes to full transformations, powered by AI."
        items={services}
        basePath="/services"
        limit={6}
        viewAllLabel="View all services"
        showFeatures
      />
      <WhyUs />
      <HowItWorks />
      <PipelineVisual />
      <ListingSection
        eyebrow="Industries"
        title="Industries we serve"
        description="GunaFix has rebuilt and repaired websites for businesses across dozens of industries. Whatever your niche, we've shipped for someone like you."
        items={industries}
        basePath="/industries"
        limit={6}
        viewAllLabel="View all industries"
        tinted
      />
      <ListingSection
        eyebrow="Technologies"
        title="Technologies we work with"
        description="A modern, battle-tested stack, chosen for speed, SEO and long-term maintainability."
        items={technologies}
        basePath="/technologies"
        limit={6}
        viewAllLabel="View all technologies"
      />
      <FaqSection withJsonLd />
      <CtaSection />
    </>
  );
}
