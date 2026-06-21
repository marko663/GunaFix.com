"use client";

import * as React from "react";
import { Loader2, CalendarCheck } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Status = "idle" | "submitting" | "success" | "error";

const TIME_SLOTS = Array.from({ length: 14 }, (_, i) => {
  const totalMinutes = 14 * 60 + i * 30;
  const hh = String(Math.floor(totalMinutes / 60)).padStart(2, "0");
  const mm = String(totalMinutes % 60).padStart(2, "0");
  return `${hh}:${mm}`;
});

export function BookingForm() {
  const [status, setStatus] = React.useState<Status>("idle");
  const todayIso = new Date().toISOString().split("T")[0];

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("submitting");

    const formData = new FormData(event.currentTarget);

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "booking",
          name: formData.get("name"),
          email: formData.get("email"),
          date: formData.get("date"),
          time: formData.get("time"),
          topic: formData.get("topic"),
        }),
      });

      if (!res.ok) throw new Error("Request failed");
      setStatus("success");
      event.currentTarget.reset();
    } catch {
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <div className="rounded-xl border border-emerald-400/30 bg-emerald-400/10 p-6 text-center">
        <p className="font-medium text-emerald-300">Appointment requested.</p>
        <p className="mt-1 text-sm text-white/60">
          You&apos;ll get an email as soon as it&apos;s confirmed.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="date">Pick a day</Label>
          <Input id="date" name="date" type="date" required min={todayIso} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="time">Pick a time (afternoon, Europe/Berlin)</Label>
          <select
            id="time"
            name="time"
            required
            defaultValue=""
            className="flex h-11 w-full rounded-lg border border-white/15 bg-white/5 px-4 text-sm text-white outline-none focus-visible:border-emerald-400/60 focus-visible:ring-2 focus-visible:ring-emerald-400/20"
          >
            <option value="" disabled>
              Choose a time
            </option>
            {TIME_SLOTS.map((slot) => (
              <option key={slot} value={slot} className="bg-[#0a0e14]">
                {slot}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="booking-name">Your name</Label>
          <Input id="booking-name" name="name" required placeholder="Jane Doe" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="booking-email">Email</Label>
          <Input id="booking-email" name="email" type="email" required placeholder="jane@company.com" />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="topic">What would you like to discuss? (optional)</Label>
        <Input id="topic" name="topic" placeholder="e.g. full redesign for our SaaS marketing site" />
      </div>

      {status === "error" && (
        <p className="text-sm text-red-400">
          Something went wrong sending your request. Please try again or email us directly.
        </p>
      )}

      <Button type="submit" size="lg" disabled={status === "submitting"} className="w-full sm:w-auto">
        {status === "submitting" ? (
          <>
            <Loader2 className="size-4 animate-spin" />
            Requesting...
          </>
        ) : (
          <>
            Request appointment
            <CalendarCheck className="size-4" />
          </>
        )}
      </Button>
    </form>
  );
}
