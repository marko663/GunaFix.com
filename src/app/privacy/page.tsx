import type { Metadata } from "next";

import { siteConfig } from "@/data/content";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: `How ${siteConfig.name} collects, uses and protects your data.`,
};

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
      <h1 className="text-4xl font-semibold tracking-tight text-white">Privacy Policy</h1>
      <p className="mt-2 text-sm text-white/40">Last updated: {new Date().getFullYear()}</p>

      <div className="mt-10 space-y-8 text-sm leading-relaxed text-white/65">
        <section>
          <h2 className="text-lg font-semibold text-white">1. Who we are</h2>
          <p className="mt-2">
            {siteConfig.name} ({siteConfig.url}) is an EU-based web development studio. This
            policy explains what information we collect through this website, why we collect it,
            and how you can control it.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-white">2. Information we collect</h2>
          <p className="mt-2">
            When you submit our contact form or booking request, we collect your name, email
            address, and any details you choose to share about your project. We do not require an
            account to use this site and we do not sell your data to third parties.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-white">3. How we use it</h2>
          <p className="mt-2">
            We use the information you submit solely to respond to your inquiry, scope your
            project, or schedule a call. We may retain correspondence for our own records and to
            improve our services.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-white">4. Legal basis & your rights (GDPR)</h2>
          <p className="mt-2">
            We process your data based on your consent (submitting a form) and our legitimate
            interest in responding to business inquiries. Under the GDPR, you have the right to
            access, correct, or request deletion of your data at any time by emailing{" "}
            <a href={`mailto:${siteConfig.email}`} className="text-emerald-300 hover:text-emerald-200">
              {siteConfig.email}
            </a>
            .
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-white">5. Hosting & security</h2>
          <p className="mt-2">
            This site is served over HTTPS/SSL and hosted on EU-based infrastructure. We apply
            reasonable technical and organizational measures to protect submitted data against
            unauthorized access or disclosure.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-white">6. Contact</h2>
          <p className="mt-2">
            Questions about this policy can be sent to{" "}
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
