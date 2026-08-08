import type { Metadata } from "next";

import { PageHeader } from "@/components/site/section-heading";
import { ContactForm } from "@/components/site/contact-form";
import { FaqSection } from "@/components/site/faq-section";
import { contact, faq, siteConfig } from "@/data/solaris";

export const metadata: Metadata = {
  title: "Kontakt",
  description: contact.subtitle,
};

export default function ContactPage() {
  return (
    <>
      <PageHeader eyebrow="Kontakt" title={contact.title} subtitle={contact.subtitle} />

      <section className="border-b border-white/10 py-20">
        <div className="mx-auto grid max-w-7xl gap-14 px-4 sm:px-6 lg:grid-cols-[1.3fr_1fr] lg:px-8">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight text-white">
              Projektanfrage
            </h2>
            <p className="mt-3 text-sm text-white/50">
              Pflichtfelder sind mit * gekennzeichnet.
            </p>
            <div className="mt-10">
              <ContactForm />
            </div>
          </div>

          <div className="space-y-10">
            <div className="border border-white/10">
              <p className="border-b border-white/10 px-6 py-4 text-xs font-semibold tracking-[0.16em] text-solar uppercase">
                Direkter Kontakt
              </p>
              <dl className="divide-y divide-white/10">
                {contact.channels.map((channel) => (
                  <div key={channel.label} className="px-6 py-5">
                    <dt className="text-xs tracking-[0.12em] text-white/40 uppercase">
                      {channel.label}
                    </dt>
                    <dd className="mt-2 text-sm text-white/80">
                      {channel.href ? (
                        <a href={channel.href} className="hover:text-solar">
                          {channel.value}
                        </a>
                      ) : (
                        channel.value
                      )}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>

            <div className="border border-white/10 p-6">
              <p className="eyebrow">Das brauchen wir von Ihnen</p>
              <ul className="mt-5 space-y-3">
                {contact.needFromYou.map((item) => (
                  <li key={item} className="flex items-start gap-3 text-sm text-white/65">
                    <span className="mt-1.5 size-1 shrink-0 bg-solar" aria-hidden />
                    {item}
                  </li>
                ))}
              </ul>
              <p className="mt-6 text-xs leading-relaxed text-white/40">
                Fehlt eine Angabe? Kein Problem – schicken Sie, was vorliegt. Den Rest klären wir
                im Gespräch.
              </p>
            </div>

            <div className="border border-white/10 p-6">
              <p className="eyebrow">Anschrift</p>
              <address className="mt-5 text-sm leading-relaxed text-white/70 not-italic">
                {siteConfig.name}
                <br />
                {siteConfig.address.street}
                <br />
                {siteConfig.address.city}
                <br />
                {siteConfig.address.country}
              </address>
              <p className="mt-4 text-xs text-white/40">{siteConfig.openingHours}</p>
            </div>
          </div>
        </div>
      </section>

      <FaqSection
        items={faq}
        subtitle="Die Fragen, die uns am häufigsten vor einer Projektanfrage erreichen."
      />
    </>
  );
}
