import type { Metadata } from "next";

import { siteConfig } from "@/data/content";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: `The terms that govern use of the ${siteConfig.name} website and services.`,
};

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
      <h1 className="text-4xl font-semibold tracking-tight text-white">Terms of Service</h1>
      <p className="mt-2 text-sm text-white/40">Last updated: {new Date().getFullYear()}</p>

      <div className="mt-10 space-y-8 text-sm leading-relaxed text-white/65">
        <section>
          <h2 className="text-lg font-semibold text-white">1. Overview</h2>
          <p className="mt-2">
            These terms govern your use of {siteConfig.url} and any audit, fix, redesign,
            integration or care-plan service (&quot;Services&quot;) provided by {siteConfig.name}. By
            contacting us or engaging our Services, you agree to these terms.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-white">2. Quotes & engagements</h2>
          <p className="mt-2">
            Pricing shown on this site is indicative. Every engagement begins with a written,
            fixed-price scope sent after you contact us or complete an audit. Work begins only
            after you approve that scope.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-white">3. Warranty on fixes</h2>
          <p className="mt-2">
            Rapid Website Fixes include a 30-day warranty: if a fix we shipped breaks within 30
            days of deployment, we repair it at no additional charge.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-white">4. Client responsibilities</h2>
          <p className="mt-2">
            You are responsible for providing accurate access credentials, timely feedback and
            content needed to complete a project. Delays in providing these may extend agreed
            timelines.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-white">5. Limitation of liability</h2>
          <p className="mt-2">
            {siteConfig.name} is not liable for indirect, incidental or consequential damages
            arising from use of our Services, to the maximum extent permitted by applicable law.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-white">6. Contact</h2>
          <p className="mt-2">
            Questions about these terms can be sent to{" "}
            <a href={`mailto:${siteConfig.email}`} className="text-emerald-300 hover:text-emerald-200">
              {siteConfig.email}
            </a>
            .
          </p>
        </section>
      </div>
    </div>
  );
}
