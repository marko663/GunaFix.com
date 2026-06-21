import type { Metadata } from "next";

import { FaqSection } from "@/components/site/faq-section";
import { CtaSection } from "@/components/site/cta-section";

export const metadata: Metadata = {
  title: "FAQ",
  description:
    "Answers to common questions about GunaFix: timelines, pricing, platforms we support, SEO safety and ongoing maintenance.",
};

export default function FaqPage() {
  return (
    <>
      <FaqSection withJsonLd />
      <CtaSection />
    </>
  );
}
