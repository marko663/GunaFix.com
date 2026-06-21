import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-2xl flex-col items-center px-4 py-32 text-center sm:px-6 lg:px-8">
      <p className="font-mono text-sm uppercase tracking-[0.2em] text-emerald-400">404</p>
      <h1 className="mt-4 text-4xl font-semibold tracking-tight text-white sm:text-5xl">
        This page is broken. Fitting, really.
      </h1>
      <p className="mt-4 text-lg text-white/60">
        The page you&apos;re looking for doesn&apos;t exist. Let&apos;s get you back on track,
        or tell us and we&apos;ll fix it.
      </p>
      <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
        <Button asChild size="lg">
          <Link href="/">
            <ArrowLeft className="size-4" />
            Back home
          </Link>
        </Button>
        <Button asChild variant="outline" size="lg">
          <Link href="/contact">Report it</Link>
        </Button>
      </div>
    </div>
  );
}
