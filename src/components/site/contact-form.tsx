"use client";

import * as React from "react";
import { Loader2, Send } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { SiteContent } from "@/data/types";

type Status = "idle" | "submitting" | "success" | "error";

export function ContactForm({ t }: { t: SiteContent["form"] }) {
  const [status, setStatus] = React.useState<Status>("idle");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    // Hold the reference: `currentTarget` is cleared once the handler yields.
    const form = event.currentTarget;
    setStatus("submitting");

    const formData = new FormData(form);
    const detail = [
      ["Company", formData.get("company")],
      ["Phone", formData.get("phone")],
      ["Site location", formData.get("location")],
      ["Parking spaces", formData.get("spaces")],
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
        <p className="text-lg font-semibold text-solar">{t.successTitle}</p>
        <p className="mt-2 text-sm leading-relaxed text-white/60">{t.successBody}</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid gap-5 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="name">{t.name}</Label>
          <Input id="name" name="name" required placeholder={t.namePlaceholder} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="company">{t.company}</Label>
          <Input id="company" name="company" placeholder={t.companyPlaceholder} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">{t.email}</Label>
          <Input
            id="email"
            name="email"
            type="email"
            required
            placeholder={t.emailPlaceholder}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone">{t.phone}</Label>
          <Input id="phone" name="phone" type="tel" placeholder={t.phonePlaceholder} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="location">{t.location}</Label>
          <Input id="location" name="location" placeholder={t.locationPlaceholder} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="spaces">{t.spaces}</Label>
          <Input id="spaces" name="spaces" placeholder={t.spacesPlaceholder} />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="message">{t.message}</Label>
        <Textarea
          id="message"
          name="message"
          required
          rows={6}
          placeholder={t.messagePlaceholder}
        />
      </div>

      {status === "error" && (
        <p className="border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {t.errorMessage}
        </p>
      )}

      <p className="text-xs leading-relaxed text-white/40">{t.consent}</p>

      <Button type="submit" size="lg" disabled={status === "submitting"} className="w-full sm:w-auto">
        {status === "submitting" ? (
          <>
            <Loader2 className="size-4 animate-spin" />
            {t.submitting}
          </>
        ) : (
          <>
            {t.submit}
            <Send className="size-4" />
          </>
        )}
      </Button>
    </form>
  );
}
