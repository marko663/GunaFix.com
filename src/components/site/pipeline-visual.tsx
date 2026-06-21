"use client";

import * as React from "react";

import { buildLog, pipelineStages, pipelineStats } from "@/data/content";

export function PipelineVisual() {
  const [activeLine, setActiveLine] = React.useState(0);

  React.useEffect(() => {
    const id = window.setInterval(() => {
      setActiveLine((line) => (line + 1) % (buildLog.length + 1));
    }, 1800);
    return () => window.clearInterval(id);
  }, []);

  return (
    <section className="border-b border-white/10 bg-[#05070a]">
      <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="mb-12 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="mb-3 font-mono text-xs font-medium uppercase tracking-[0.2em] text-emerald-400">
              Live automation
            </p>
            <h2 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
              Websites built by autonomous AI agents.
            </h2>
            <p className="mt-4 max-w-xl text-lg text-white/60">
              Watch how we ship, design, code, deploy. Zero human bottlenecks,
              fully observable, end-to-end automated.
            </p>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <span className="font-mono text-xs text-white/40">
                gunafix.com · build pipeline · live
              </span>
              <span className="flex items-center gap-1.5 text-xs text-emerald-400">
                <span className="size-1.5 animate-pulse-soft rounded-full bg-emerald-400" />
                running
              </span>
            </div>
            <ul className="mt-5 space-y-5">
              {pipelineStages.map((stage) => (
                <li key={stage.name}>
                  <div className="flex items-center justify-between font-mono text-xs">
                    <span className="text-white/80">{stage.name}</span>
                    <span className="text-white/40">{stage.description}</span>
                  </div>
                  <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-white/10">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-sky-400 transition-all duration-700"
                      style={{ width: `${stage.progress}%` }}
                    />
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-2xl border border-white/10 bg-black/40 p-6 font-mono text-xs leading-relaxed">
            <div className="flex items-center justify-between border-b border-white/10 pb-4 text-white/40">
              <span>~/gunafix · build.log</span>
              <span>main · pushed</span>
            </div>
            <div className="mt-4 space-y-3">
              {buildLog.map((line, i) => (
                <div
                  key={line.cmd}
                  className="transition-opacity duration-500"
                  style={{ opacity: i <= activeLine ? 1 : 0.25 }}
                >
                  <p className="text-sky-300">→ {line.cmd}</p>
                  <p className="text-emerald-300">✓ {line.result}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {pipelineStats.map((stat) => (
            <div
              key={stat.label}
              className="rounded-xl border border-white/10 bg-white/[0.02] p-4 text-center"
            >
              <div className="font-mono text-2xl font-semibold text-white">{stat.value}</div>
              <div className="mt-1 text-[11px] uppercase tracking-wide text-white/40">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
