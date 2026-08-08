import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-2xl flex-col items-center px-4 py-32 text-center sm:px-6 lg:px-8">
      <p className="font-mono text-sm tracking-[0.2em] text-solar uppercase">404</p>
      <h1 className="mt-4 text-4xl font-semibold tracking-tight text-white sm:text-5xl">
        Diese Seite gibt es nicht.
      </h1>
      <p className="mt-4 text-lg text-white/60">
        Der aufgerufene Inhalt wurde verschoben oder existiert nicht mehr. Von der Startseite aus
        finden Sie alle Baureihen, Projekte und Fachbeiträge.
      </p>
      <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
        <Button asChild size="lg">
          <Link href="/">
            <ArrowLeft className="size-4" />
            Zur Startseite
          </Link>
        </Button>
        <Button asChild variant="outline" size="lg">
          <Link href="/kontakt">Kontakt aufnehmen</Link>
        </Button>
      </div>
    </div>
  );
}
