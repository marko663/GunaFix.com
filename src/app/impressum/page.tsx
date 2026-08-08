import type { Metadata } from "next";

import { PageHeader } from "@/components/site/section-heading";
import { siteConfig } from "@/data/solaris";

export const metadata: Metadata = {
  title: "Impressum",
  description: `Impressum und Anbieterkennzeichnung von ${siteConfig.name}.`,
  robots: { index: false },
};

export default function ImpressumPage() {
  return (
    <>
      <PageHeader title="Impressum" subtitle="Angaben gemäß § 5 DDG." />

      <section className="py-20">
        <div className="mx-auto max-w-3xl space-y-10 px-4 sm:px-6 lg:px-8">
          <div className="border border-solar/30 bg-solar/5 p-5 text-sm leading-relaxed text-white/70">
            Platzhalter: Die folgenden Angaben müssen vor dem Livegang durch die tatsächlichen
            Unternehmensdaten (Rechtsform, Registergericht, Handelsregisternummer,
            Umsatzsteuer-Identifikationsnummer, Vertretungsberechtigte) ersetzt werden.
          </div>

          <div>
            <h2 className="text-xl font-semibold text-white">Anbieter</h2>
            <address className="mt-4 leading-relaxed text-white/65 not-italic">
              {siteConfig.name}
              <br />
              {siteConfig.address.street}
              <br />
              {siteConfig.address.city}
              <br />
              {siteConfig.address.country}
            </address>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-white">Kontakt</h2>
            <p className="mt-4 leading-relaxed text-white/65">
              Telefon:{" "}
              <a href={`tel:${siteConfig.phoneHref}`} className="text-solar hover:underline">
                {siteConfig.phone}
              </a>
              <br />
              E-Mail:{" "}
              <a href={`mailto:${siteConfig.email}`} className="text-solar hover:underline">
                {siteConfig.email}
              </a>
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-white">Haftung für Inhalte</h2>
            <p className="mt-4 leading-relaxed text-white/65">
              Als Diensteanbieter sind wir für eigene Inhalte auf diesen Seiten nach den
              allgemeinen Gesetzen verantwortlich. Wir sind jedoch nicht verpflichtet,
              übermittelte oder gespeicherte fremde Informationen zu überwachen oder nach
              Umständen zu forschen, die auf eine rechtswidrige Tätigkeit hinweisen.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-white">Haftung für Links</h2>
            <p className="mt-4 leading-relaxed text-white/65">
              Unser Angebot enthält Links zu externen Websites Dritter, auf deren Inhalte wir
              keinen Einfluss haben. Für die Inhalte der verlinkten Seiten ist stets der jeweilige
              Anbieter oder Betreiber verantwortlich.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-white">Urheberrecht</h2>
            <p className="mt-4 leading-relaxed text-white/65">
              Die durch die Seitenbetreiber erstellten Inhalte und Werke auf diesen Seiten
              unterliegen dem deutschen Urheberrecht. Beiträge Dritter sind als solche
              gekennzeichnet.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
