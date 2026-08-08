import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight } from "lucide-react";

import { PageHeader } from "@/components/site/section-heading";
import { CtaSection } from "@/components/site/cta-section";
import { FaqSection } from "@/components/site/faq-section";
import { getContent } from "@/data/content";
import { isLocale, localePath, locales } from "@/data/site";

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const c = getContent(locale);

  return {
    title: c.knowledgeIntro.title,
    description: c.knowledgeIntro.subtitle,
    alternates: {
      canonical: `/${locale}/wissensdatenbank`,
      languages: Object.fromEntries(
        locales.map((code) => [code, `/${code}/wissensdatenbank`])
      ),
    },
  };
}

export default async function KnowledgePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const c = getContent(locale);
  const { ui } = c;
  const categories = Array.from(new Set(c.articles.map((article) => article.category)));

  return (
    <>
      <PageHeader
        eyebrow={ui.eyebrowKnowledge}
        title={c.knowledgeIntro.title}
        subtitle={c.knowledgeIntro.subtitle}
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
            {c.articles.map((article) => (
              <Link
                key={article.slug}
                href={localePath(locale, `/wissensdatenbank/${article.slug}`)}
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
                  {ui.readArticle}
                  <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-1" />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <FaqSection items={c.faq} title={ui.faqTitle} eyebrow={ui.eyebrowFaq} />

      <CtaSection
        locale={locale}
        title={ui.knowledgeCtaTitle}
        body={ui.knowledgeCtaBody}
        label={ui.knowledgeCtaLabel}
      />
    </>
  );
}
