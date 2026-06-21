import Link from "next/link";
import { ArrowRight } from "lucide-react";

import type { ContentItem } from "@/data/content";
import { ContentGrid } from "@/components/site/content-grid";
import { SectionHeading } from "@/components/site/section-heading";

export function ListingSection({
  eyebrow,
  title,
  description,
  items,
  basePath,
  limit,
  viewAllLabel,
  tinted,
  showFeatures,
}: {
  eyebrow: string;
  title: string;
  description?: string;
  items: ContentItem[];
  basePath: string;
  limit?: number;
  viewAllLabel: string;
  tinted?: boolean;
  showFeatures?: boolean;
}) {
  return (
    <section className={`border-b border-white/10 ${tinted ? "bg-white/[0.02]" : ""}`}>
      <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-end">
          <SectionHeading eyebrow={eyebrow} title={title} description={description} />
          <Link
            href={basePath}
            className="flex shrink-0 items-center gap-1.5 text-sm font-medium text-emerald-300 hover:text-emerald-200"
          >
            {viewAllLabel}
            <ArrowRight className="size-4" />
          </Link>
        </div>

        <div className="mt-10">
          <ContentGrid items={items} basePath={basePath} limit={limit} showFeatures={showFeatures} />
        </div>
      </div>
    </section>
  );
}
