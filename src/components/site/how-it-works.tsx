import { howItWorks } from "@/data/content";
import { SectionHeading } from "@/components/site/section-heading";

export function HowItWorks() {
  return (
    <section className="border-b border-white/10 bg-white/[0.02]">
      <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="How it works"
          title="A simple, transparent process."
          description="From first message to launch, no sales calls required unless you want one."
        />

        <div className="mt-12 grid gap-8 lg:grid-cols-4">
          {howItWorks.map((item, i) => (
            <div key={item.step} className="relative">
              <div className="flex size-10 items-center justify-center rounded-full border border-emerald-400/30 bg-emerald-400/10 font-mono text-sm font-semibold text-emerald-300">
                {item.step}
              </div>
              <h3 className="mt-4 text-lg font-semibold text-white">{item.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-white/55">{item.body}</p>
              {i < howItWorks.length - 1 && (
                <div className="absolute top-5 left-[2.75rem] hidden h-px w-[calc(100%-2.75rem)] bg-white/10 lg:block" />
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
