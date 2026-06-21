import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";

import type { ContentItem } from "@/data/content";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function ContentGrid({
  items,
  basePath,
  limit,
  showFeatures = false,
}: {
  items: ContentItem[];
  basePath: string;
  limit?: number;
  showFeatures?: boolean;
}) {
  const list = limit ? items.slice(0, limit) : items;

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {list.map((item) => (
        <Link key={item.slug} href={`${basePath}/${item.slug}`} className="group block">
          <Card className="h-full transition-colors duration-200 group-hover:border-emerald-400/40 group-hover:bg-white/[0.06]">
            <CardHeader>
              <CardTitle className="flex items-center justify-between gap-2 text-lg">
                {item.title}
                <ArrowRight className="size-4 shrink-0 text-white/30 transition-transform group-hover:translate-x-1 group-hover:text-emerald-300" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="line-clamp-3 text-sm text-white/60">{item.teaser}</p>
              {showFeatures && (
                <ul className="mt-4 space-y-2 border-t border-white/10 pt-4">
                  {item.features.slice(0, 4).map((feature) => (
                    <li key={feature} className="flex items-center gap-2 text-xs text-white/50">
                      <Check className="size-3.5 shrink-0 text-emerald-400" />
                      {feature}
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  );
}
