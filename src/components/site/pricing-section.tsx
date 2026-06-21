import Link from "next/link";
import { Check } from "lucide-react";

import { carePlanNote, pricingTiers } from "@/data/content";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function PricingSection() {
  return (
    <div className="grid gap-6 lg:grid-cols-3">
      {pricingTiers.map((tier) => (
        <Card
          key={tier.name}
          className={cn(
            "flex flex-col",
            tier.highlight && "border-emerald-400/50 bg-emerald-400/[0.06] ring-1 ring-emerald-400/30"
          )}
        >
          <CardHeader>
            {tier.highlight && (
              <span className="mb-2 inline-flex w-fit items-center rounded-full bg-emerald-400/15 px-3 py-1 text-xs font-medium text-emerald-300">
                Most popular
              </span>
            )}
            <h3 className="text-xl font-semibold text-white">{tier.name}</h3>
            <p className="text-sm text-white/55">{tier.description}</p>
            <div className="mt-4 flex items-baseline gap-2">
              <span className="text-4xl font-semibold tracking-tight text-white">
                {tier.price}
              </span>
              <span className="text-sm text-white/40">{tier.cadence}</span>
            </div>
          </CardHeader>
          <CardContent className="flex flex-1 flex-col">
            <ul className="flex-1 space-y-3">
              {tier.features.map((feature) => (
                <li key={feature} className="flex items-start gap-2 text-sm text-white/70">
                  <Check className="mt-0.5 size-4 shrink-0 text-emerald-400" />
                  {feature}
                </li>
              ))}
            </ul>
            <Button
              asChild
              className="mt-6 w-full"
              variant={tier.highlight ? "default" : "outline"}
            >
              <Link href="/contact">{tier.cta}</Link>
            </Button>
          </CardContent>
        </Card>
      ))}

      <p className="col-span-full mx-auto max-w-2xl text-center text-sm text-white/50">
        {carePlanNote}
      </p>
    </div>
  );
}
