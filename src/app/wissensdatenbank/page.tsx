import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { PageHeader } from "@/components/site/section-heading";
import { CtaSection } from "@/components/site/cta-section";
import { FaqSection } from "@/components/site/faq-section";
import { articles, faq, knowledgeIntro } from "@/data/solaris";

export const metadata: Metadata = {
  title: "Wissensdatenbank",
  description: knowledgeIntro.subtitle,
};

export default function KnowledgePage() {
  const categories = Array.from(new Set(articles.map((article) => article.category)));

  return (
    <>
      <PageHeader
        eyebrow="Wissen"
        title={knowledgeIntro.title}
        subtitle={knowledgeIntro.subtitle}
      >
        <div className="mt-8 flex flex-wrap gap-2">
          {categories.map((category) => (
            <span
              key={category}
              className="border border-white/15 px-4 py-1.5 text-xs tracking-[0.12em] text-white/55 uppercase"
            >
              {category}
            </span>
          ))}
        </div>
      </PageHeader>

      <section className="border-b border-white/10 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-px bg-white/10 md:grid-cols-2 lg:grid-cols-3">
            {articles.map((article) => (
              <Link
                key={article.slug}
                href={`/wissensdatenbank/${article.slug}`}
                className="group flex flex-col bg-black p-8 transition-colors hover:bg-surface"
              >
                <div className="flex items-center gap-3 text-xs tracking-[0.12em] uppercase">
                  <span className="text-solar">{article.category}</span>
                  <span className="text-white/30">{article.readingTime}</span>
                </div>
                <h2 className="mt-5 text-xl font-semibold tracking-tight text-white">
                  {article.title}
                </h2>
                <p className="mt-4 flex-1 text-sm leading-relaxed text-white/55">
                  {article.teaser}
                </p>
                <span className="mt-6 inline-flex items-center gap-2 text-xs font-semibold tracking-[0.14em] text-solar uppercase">
                  Artikel lesen
                  <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-1" />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <FaqSection items={faq} />

      <CtaSection
        title="Frage nicht beantwortet?"
        body="Schreiben Sie uns Ihre konkrete Fragestellung. Sie erhalten eine fachliche Antwort von den Kolleginnen und Kollegen aus Konstruktion oder Projektierung – nicht aus dem Vertrieb."
        label="Frage stellen"
      />
    </>
  );
}
