import Link from "next/link";
import { ArrowLeft, Check } from "lucide-react";

import type { ContentItem } from "@/data/content";
import { CtaSection } from "@/components/site/cta-section";

export function DetailPage({
  item,
  basePath,
  backLabel,
}: {
  item: ContentItem;
  basePath: string;
  backLabel: string;
}) {
  return (
    <>
      <section className="border-b border-white/10">
        <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
          <Link
            href={basePath}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-white/50 hover:text-white"
          >
            <ArrowLeft className="size-4" />
            {backLabel}
          </Link>

          <h1 className="mt-6 text-4xl font-semibold tracking-tight text-white sm:text-5xl">
            {item.title}
          </h1>
          <p className="mt-5 text-lg text-white/65">{item.teaser}</p>

          {item.tags && item.tags.length > 0 && (
            <div className="mt-6 flex flex-wrap gap-2">
              {item.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3 py-1 font-mono text-xs uppercase tracking-wide text-emerald-300"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          <div className="mt-10 grid gap-4 sm:grid-cols-2">
            {item.features.map((feature) => (
              <div
                key={feature}
                className="flex items-start gap-3 rounded-xl border border-white/10 bg-white/[0.03] p-4"
              >
                <Check className="mt-0.5 size-5 shrink-0 text-emerald-400" />
                <span className="text-sm text-white/80">{feature}</span>
              </div>
            ))}
          </div>

          <p className="mt-10 text-base leading-relaxed text-white/60">{item.body}</p>
        </div>
      </section>

      <CtaSection
        title={`Ready to talk about ${item.title.toLowerCase()}?`}
        description="Tell us about your site and goals. We'll reply within one business day with a clear scope and fixed price."
      />
    </>
  );
}
