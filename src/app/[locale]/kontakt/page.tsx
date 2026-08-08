import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { PageHeader } from "@/components/site/section-heading";
import { ContactForm } from "@/components/site/contact-form";
import { FaqSection } from "@/components/site/faq-section";
import { getContent } from "@/data/content";
import { isLocale, locales, siteConfig } from "@/data/site";

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const c = getContent(locale);

  return {
    title: c.contact.title,
    description: c.contact.subtitle,
    alternates: {
      canonical: `/${locale}/kontakt`,
      languages: Object.fromEntries(locales.map((code) => [code, `/${code}/kontakt`])),
    },
  };
}

export default async function ContactPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const c = getContent(locale);
  const { ui, contact } = c;

  const channels = [
    { label: contact.channelLabels.email, value: siteConfig.email, href: `mailto:${siteConfig.email}` },
    { label: contact.channelLabels.phone, value: siteConfig.phone, href: `tel:${siteConfig.phoneHref}` },
    {
      label: contact.channelLabels.address,
      value: `${siteConfig.address.street}, ${siteConfig.address.city}, ${c.meta.countryName}`,
    },
    { label: contact.channelLabels.hours, value: c.meta.openingHours },
  ];

  return (
    <>
      <PageHeader
        eyebrow={ui.eyebrowContact}
        title={contact.title}
        subtitle={contact.subtitle}
      />

      <section className="border-b border-white/10 py-20">
        <div className="mx-auto grid max-w-7xl gap-14 px-4 sm:px-6 lg:grid-cols-[1.3fr_1fr] lg:px-8">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight text-white">
              {contact.formTitle}
            </h2>
            <p className="mt-3 text-sm text-white/50">{contact.requiredNote}</p>
            <div className="mt-10">
              <ContactForm t={c.form} />
            </div>
          </div>

          <div className="space-y-10">
            <div className="border border-white/10">
              <p className="border-b border-white/10 px-6 py-4 text-xs font-semibold tracking-[0.16em] text-solar uppercase">
                {contact.directTitle}
              </p>
              <dl className="divide-y divide-white/10">
                {channels.map((channel) => (
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
              <p className="eyebrow">{contact.needFromYouTitle}</p>
              <ul className="mt-5 space-y-3">
                {contact.needFromYou.map((item) => (
                  <li key={item} className="flex items-start gap-3 text-sm text-white/65">
                    <span className="mt-1.5 size-1 shrink-0 bg-solar" aria-hidden />
                    {item}
                  </li>
                ))}
              </ul>
              <p className="mt-6 text-xs leading-relaxed text-white/40">
                {contact.needFromYouNote}
              </p>
            </div>

            <div className="border border-white/10 p-6">
              <p className="eyebrow">{contact.addressTitle}</p>
              <address className="mt-5 text-sm leading-relaxed text-white/70 not-italic">
                {siteConfig.name}
                <br />
                {siteConfig.address.street}
                <br />
                {siteConfig.address.city}
                <br />
                {c.meta.countryName}
              </address>
              <p className="mt-4 text-xs text-white/40">{c.meta.openingHours}</p>
            </div>
          </div>
        </div>
      </section>

      <FaqSection
        items={c.faq}
        title={ui.faqTitle}
        eyebrow={ui.eyebrowFaq}
        subtitle={ui.faqSubtitle}
      />
    </>
  );
}
