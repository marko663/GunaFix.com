import Link from "next/link";
import { ArrowRight, ShieldCheck, Sparkles, Globe2, Lock } from "lucide-react";

import { Button } from "@/components/ui/button";
import { heroScores, stats, trustBadges } from "@/data/content";

const badgeIcons = [Lock, ShieldCheck, Sparkles, Globe2];

export function Hero() {
  return (
    <section className="bg-grid relative overflow-hidden border-b border-white/10">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-[-10rem] mx-auto h-[28rem] max-w-4xl rounded-full bg-emerald-500/10 blur-3xl"
      />
      <div className="relative mx-auto max-w-7xl px-4 pt-20 pb-16 sm:px-6 sm:pt-28 lg:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div className="animate-fade-up">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs font-medium text-white/70">
              <span className="size-1.5 rounded-full bg-emerald-400" />
              AI-accelerated web studio
            </div>

            <h1 className="mt-6 text-4xl font-semibold tracking-tight text-white sm:text-5xl lg:text-6xl">
              Your website,{" "}
              <span className="text-gradient">fixed by AI.</span>
            </h1>

            <p className="mt-6 max-w-xl text-lg text-white/65">
              We diagnose, repair, and reimagine business websites using
              proprietary AI agents, delivering blazing-fast experiences your
              customers will love.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Button asChild size="lg">
                <Link href="/contact">
                  Start Your Project
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="/services">See What We Do</Link>
              </Button>
            </div>

            <div className="mt-10 flex flex-wrap gap-x-6 gap-y-3">
              {trustBadges.map((badge, i) => {
                const Icon = badgeIcons[i % badgeIcons.length];
                return (
                  <div key={badge} className="flex items-center gap-2 text-sm text-white/50">
                    <Icon className="size-4 text-emerald-400" />
                    {badge}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="animate-fade-up [animation-delay:150ms]">
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 shadow-2xl shadow-emerald-500/5">
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <span className="font-mono text-xs text-white/40">gunafix.com/audit</span>
                <span className="flex items-center gap-1.5 text-xs text-emerald-400">
                  <span className="size-1.5 rounded-full bg-emerald-400" />
                  live
                </span>
              </div>
              <div className="grid grid-cols-3 gap-4 py-6">
                {heroScores.map((score) => (
                  <div key={score.label} className="text-center">
                    <div className="font-mono text-3xl font-semibold text-emerald-300">
                      {score.value}
                    </div>
                    <div className="mt-1 text-xs uppercase tracking-wide text-white/40">
                      {score.label}
                    </div>
                  </div>
                ))}
              </div>
              <p className="border-t border-white/10 pt-4 text-xs text-white/40">
                Our own homepage, scored with the same audit we run for clients.
              </p>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
              {stats.map((stat) => (
                <div key={stat.label} className="rounded-xl border border-white/10 bg-white/[0.02] p-4 text-center">
                  <div className="font-mono text-xl font-semibold text-white">{stat.value}</div>
                  <div className="mt-1 text-[11px] leading-tight text-white/40">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
