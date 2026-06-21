import { CheckCircle2 } from "lucide-react";

import { whyUs } from "@/data/content";

export function WhyUs() {
  return (
    <section className="border-b border-white/10 bg-white/[0.02]">
      <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div>
            <h2 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
              Built for the AI era.
            </h2>
            <p className="mt-4 text-lg text-white/60">
              Old agencies bill hours. We ship results, using AI to move
              faster, code cleaner, and deliver experiences that feel alive.
            </p>
          </div>
          <ul className="grid gap-4 sm:grid-cols-2">
            {whyUs.map((item) => (
              <li
                key={item}
                className="flex items-start gap-3 rounded-xl border border-white/10 bg-white/[0.03] p-4"
              >
                <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-emerald-400" />
                <span className="text-sm text-white/75">{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
