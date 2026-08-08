import Link from "next/link";

import { Button } from "@/components/ui/button";
import { siteConfig } from "@/data/solaris";

export function CtaSection({
  title = "Welche Fläche wollen Sie überdachen?",
  body = "Schicken Sie uns Lageplan und Stellplatzanzahl. Sie erhalten eine Ersteinschätzung mit Belegungsvorschlag, Ertragsprognose und Kostenrahmen.",
  label = "Projekt anfragen",
  href = "/kontakt",
}: {
  title?: string;
  body?: string;
  label?: string;
  href?: string;
}) {
  return (
    <section className="relative overflow-hidden border-y border-white/10">
      <div className="bg-solar-glow absolute inset-0" aria-hidden />
      <div className="relative mx-auto flex max-w-7xl flex-col gap-8 px-4 py-20 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
        <div className="max-w-2xl">
          <h2 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            {title}
          </h2>
          <p className="mt-4 text-base leading-relaxed text-white/60">{body}</p>
        </div>
        <div className="flex shrink-0 flex-col gap-3 sm:flex-row lg:flex-col xl:flex-row">
          <Button asChild size="lg">
            <Link href={href}>{label}</Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <a href={`tel:${siteConfig.phoneHref}`}>{siteConfig.phone}</a>
          </Button>
        </div>
      </div>
    </section>
  );
}
