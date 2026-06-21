import type { Metadata } from "next";
import { Mail } from "lucide-react";

import { ContactForm } from "@/components/site/contact-form";
import { BookingForm } from "@/components/site/booking-form";
import { SectionHeading } from "@/components/site/section-heading";
import { siteConfig } from "@/data/content";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Tell GunaFix what's broken or what you wish your site could do. We reply within one business day, or book a call directly.",
};

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="grid gap-16 lg:grid-cols-2">
        <div>
          <SectionHeading
            eyebrow="Contact"
            title="Let's fix your website."
            description="Tell us what's broken, or what you wish your site could do. We'll respond within one business day."
          />
          <div className="mt-8">
            <ContactForm />
          </div>
          <div className="mt-8 flex items-center gap-2 text-sm text-white/50">
            <Mail className="size-4" />
            Or email us directly at{" "}
            <a href={`mailto:${siteConfig.email}`} className="text-emerald-300 hover:text-emerald-200">
              {siteConfig.email}
            </a>
          </div>
        </div>

        <div className="border-t border-white/10 pt-12 lg:border-t-0 lg:border-l lg:pt-0 lg:pl-16">
          <SectionHeading
            eyebrow="Book a call"
            title="Pick a time that works for you."
            description={siteConfig.bookingHours + ". You'll get an email as soon as it's confirmed."}
          />
          <div className="mt-8">
            <BookingForm />
          </div>
        </div>
      </div>
    </div>
  );
}
