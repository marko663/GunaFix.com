import Link from "next/link";

import { Logo } from "@/components/brand/logo";
import { siteConfig, localePath, type Locale } from "@/data/site";
import type { SiteContent } from "@/data/types";

export function Footer({ locale, content }: { locale: Locale; content: SiteContent }) {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-white/10 bg-black">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-4">
          <div>
            <Logo withTagline />
            <p className="mt-6 max-w-xs text-sm leading-relaxed text-white/50">
              {content.meta.description}
            </p>
          </div>

          <div>
            <p className="eyebrow">{content.ui.footerNav}</p>
            <ul className="mt-5 space-y-3">
              {content.nav.map((item) => (
                <li key={item.href}>
                  <Link
                    href={localePath(locale, item.href)}
                    className="text-sm text-white/60 hover:text-solar"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="eyebrow">{content.ui.footerModels}</p>
            <ul className="mt-5 space-y-3">
              {content.carports.map((carport) => (
                <li key={carport.slug}>
                  <Link
                    href={localePath(locale, `/carports/${carport.slug}`)}
                    className="text-sm text-white/60 hover:text-solar"
                  >
                    {carport.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="eyebrow">{content.ui.footerContact}</p>
            <ul className="mt-5 space-y-3 text-sm text-white/60">
              <li>
                <a href={`mailto:${siteConfig.email}`} className="hover:text-solar">
                  {siteConfig.email}
                </a>
              </li>
              <li>
                <a href={`tel:${siteConfig.phoneHref}`} className="hover:text-solar">
                  {siteConfig.phone}
                </a>
              </li>
              <li className="pt-1 leading-relaxed">
                {siteConfig.address.street}
                <br />
                {siteConfig.address.city}
                <br />
                {content.meta.countryName}
              </li>
              <li className="text-white/40">{content.meta.openingHours}</li>
            </ul>
          </div>
        </div>

        <div className="mt-14 flex flex-wrap gap-x-8 gap-y-3 border-t border-white/10 pt-8">
          {content.certifications.map((cert) => (
            <span key={cert.code} className="text-xs tracking-[0.16em] text-white/35 uppercase">
              {cert.code}
            </span>
          ))}
        </div>

        <div className="mt-8 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <p className="text-xs text-white/35">
            © {year} {siteConfig.name}. {content.ui.rightsReserved}
          </p>
          <div className="flex gap-6">
            {content.legalNav.map((item) => (
              <Link
                key={item.href}
                href={localePath(locale, item.href)}
                className="text-xs text-white/35 hover:text-white"
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
