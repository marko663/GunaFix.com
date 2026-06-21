import Link from "next/link";
import { Wrench } from "lucide-react";

import { mainNav, siteConfig } from "@/data/content";

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-white/10 bg-[#05070a]">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <Link href="/" className="flex items-center gap-2 font-semibold text-white">
              <span className="flex size-8 items-center justify-center rounded-lg bg-emerald-400/10 text-emerald-300">
                <Wrench className="size-4" />
              </span>
              {siteConfig.name}
            </Link>
            <p className="mt-3 max-w-xs text-sm text-white/50">
              {siteConfig.tagline} {siteConfig.description}
            </p>
          </div>

          <div>
            <p className="text-sm font-semibold text-white">Explore</p>
            <ul className="mt-4 space-y-2">
              {mainNav.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="text-sm text-white/50 hover:text-white">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="text-sm font-semibold text-white">Company</p>
            <ul className="mt-4 space-y-2">
              <li>
                <Link href="/contact" className="text-sm text-white/50 hover:text-white">
                  Contact
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-sm text-white/50 hover:text-white">
                  Privacy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-sm text-white/50 hover:text-white">
                  Terms
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <p className="text-sm font-semibold text-white">Get in touch</p>
            <ul className="mt-4 space-y-2">
              <li>
                <a
                  href={`mailto:${siteConfig.email}`}
                  className="text-sm text-white/50 hover:text-white"
                >
                  {siteConfig.email}
                </a>
              </li>
              <li className="text-sm text-white/50">EU-based · {siteConfig.timezone}</li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-6 sm:flex-row">
          <p className="text-xs text-white/40">
            © {year} {siteConfig.url.replace("https://", "")} · Built with AI.
          </p>
        </div>
      </div>
    </footer>
  );
}
