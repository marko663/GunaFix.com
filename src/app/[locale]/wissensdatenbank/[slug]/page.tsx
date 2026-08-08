import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { PageHeader } from "@/components/site/section-heading";
import { CtaSection } from "@/components/site/cta-section";
import { getContent } from "@/data/content";
import { isLocale, localePath, locales } from "@/data/site";

export function generateStaticParams() {
  return locales.flatMap((locale) =>
    getContent(locale).articles.map((article) => ({ locale, slug: article.slug }))
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  if (!isLocale(locale)) return {};

  const article = getContent(locale).articles.find((a) => a.slug === slug);
  if (!article) return {};

  return {
    title: { absolute: article.seoTitle },
    description: article.metaDescription,
    alternates: {
      canonical: `/${locale}/wissensdatenbank/${slug}`,
      languages: Object.fromEntries(
        locales.map((code) => [code, `/${code}/wissensdatenbank/${slug}`])
      ),
    },
    openGraph: {
      title: article.seoTitle,
      description: article.metaDescription,
      type: "article",
    },
  };
}

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  if (!isLocale(locale)) notFound();

  const c = getContent(locale);
  const { ui } = c;
  const article = c.articles.find((a) => a.slug === slug);
  if (!article) notFound();

  const related = c.articles.filter((a) => a.slug !== article.slug).slice(0, 3);

  return (
    <>
      <PageHeader
        eyebrow={`${article.category} · ${article.readingTime} ${ui.readingTime}`}
        title={article.title}
        subtitle={article.teaser}
      />

      <article className="border-b border-white/10 py-20">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          {article.sections.map((section) => (
            <section key={section.heading} className="mb-14 last:mb-0">
              <h2 className="text-2xl font-semibold tracking-tight text-white">
                {section.heading}
              </h2>
              {section.paragraphs.map((paragraph) => (
                <p key={paragraph.slice(0, 40)} className="mt-5 leading-relaxed text-white/65">
                  {paragraph}
                </p>
              ))}
              {section.bullets && (
                <ul className="mt-6 space-y-3">
                  {section.bullets.map((bullet) => (
                    <li key={bullet} className="flex items-start gap-3 text-white/65">
                      <span className="mt-2.5 size-1 shrink-0 bg-solar" aria-hidden />
                      <span className="leading-relaxed">{bullet}</span>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          ))}

          <Link
            href={localePath(locale, "/wissensdatenbank")}
            className="mt-16 inline-flex items-center gap-2 text-sm text-white/50 hover:text-solar"
          >
            <ArrowLeft className="size-4" />
            {ui.backToKnowledge}
          </Link>
        </div>
      </article>

      <section className="border-b border-white/10 py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-xl font-semibold text-white">{ui.moreArticles}</h2>
          <div className="mt-8 grid gap-px bg-white/10 md:grid-cols-3">
            {related.map((other) => (
              <Link
                key={other.slug}
                href={localePath(locale, `/wissensdatenbank/${other.slug}`)}
                className="bg-black p-7 transition-colors hover:bg-surface"
              >
                <p className="text-xs tracking-[0.12em] text-solar uppercase">{other.category}</p>
                <p className="mt-3 font-semibold text-white">{other.title}</p>
                <p className="mt-2 text-sm text-white/50">{other.teaser}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <CtaSection locale={locale} title={ui.ctaTitle} body={ui.ctaBody} label={ui.ctaLabel} />
    </>
  );
}
