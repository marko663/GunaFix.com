"use client";

import * as React from "react";
import { Loader2, Send } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type Status = "idle" | "submitting" | "success" | "error";

export function ContactForm() {
  const [status, setStatus] = React.useState<Status>("idle");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    // Hold the reference: `currentTarget` is cleared once the handler yields.
    const form = event.currentTarget;
    setStatus("submitting");

    const formData = new FormData(form);
    const detail = [
      ["Unternehmen", formData.get("company")],
      ["Telefon", formData.get("phone")],
      ["Standort der Fläche", formData.get("location")],
      ["Stellplätze", formData.get("spaces")],
    ]
      .filter(([, value]) => typeof value === "string" && value.trim() !== "")
      .map(([label, value]) => `${label}: ${value}`)
      .join("\n");

    const message = [detail, formData.get("message")].filter(Boolean).join("\n\n");

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "contact",
          name: formData.get("name"),
          email: formData.get("email"),
          message,
        }),
      });

      if (!res.ok) throw new Error("Request failed");
      setStatus("success");
      form.reset();
    } catch {
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <div className="border border-solar/40 bg-solar/10 p-8">
        <p className="text-lg font-semibold text-solar">Anfrage übermittelt.</p>
        <p className="mt-2 text-sm leading-relaxed text-white/60">
          Vielen Dank. Wir melden uns innerhalb eines Werktags mit einer ersten Einschätzung
          zu Ihrer Fläche.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid gap-5 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="name">Name *</Label>
          <Input id="name" name="name" required placeholder="Vor- und Nachname" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="company">Unternehmen</Label>
          <Input id="company" name="company" placeholder="Firmenname" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">E-Mail *</Label>
          <Input
            id="email"
            name="email"
            type="email"
            required
            placeholder="name@unternehmen.de"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone">Telefon</Label>
          <Input id="phone" name="phone" type="tel" placeholder="+49 …" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="location">Standort der Fläche</Label>
          <Input id="location" name="location" placeholder="PLZ und Ort" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="spaces">Anzahl Stellplätze</Label>
          <Input id="spaces" name="spaces" placeholder="z. B. 120" />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="message">Ihr Projekt *</Label>
        <Textarea
          id="message"
          name="message"
          required
          rows={6}
          placeholder="Beschreiben Sie kurz die Fläche, die Fahrzeugtypen und den gewünschten Fertigstellungstermin."
        />
      </div>

      {status === "error" && (
        <p className="border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          Die Anfrage konnte nicht gesendet werden. Bitte versuchen Sie es erneut oder schreiben
          Sie uns direkt per E-Mail.
        </p>
      )}

      <p className="text-xs leading-relaxed text-white/40">
        Mit dem Absenden stimmen Sie der Verarbeitung Ihrer Angaben zur Bearbeitung der Anfrage
        zu. Details finden Sie in unserer Datenschutzerklärung.
      </p>

      <Button type="submit" size="lg" disabled={status === "submitting"} className="w-full sm:w-auto">
        {status === "submitting" ? (
          <>
            <Loader2 className="size-4 animate-spin" />
            Wird gesendet …
          </>
        ) : (
          <>
            Anfrage senden
            <Send className="size-4" />
          </>
        )}
      </Button>
    </form>
  );
}
