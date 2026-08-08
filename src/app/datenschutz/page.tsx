import type { Metadata } from "next";

import { PageHeader } from "@/components/site/section-heading";
import { siteConfig } from "@/data/solaris";

export const metadata: Metadata = {
  title: "Datenschutz",
  description: `Datenschutzerklärung von ${siteConfig.name}.`,
  robots: { index: false },
};

export default function DatenschutzPage() {
  return (
    <>
      <PageHeader
        title="Datenschutzerklärung"
        subtitle="Informationen zur Verarbeitung personenbezogener Daten nach Art. 13 DSGVO."
      />

      <section className="py-20">
        <div className="mx-auto max-w-3xl space-y-10 px-4 sm:px-6 lg:px-8">
          <div className="border border-solar/30 bg-solar/5 p-5 text-sm leading-relaxed text-white/70">
            Platzhalter: Diese Erklärung beschreibt den aktuellen technischen Stand der Website.
            Vor dem Livegang ist sie rechtlich zu prüfen und um alle tatsächlich eingesetzten
            Dienste, Auftragsverarbeiter und Speicherfristen zu ergänzen.
          </div>

          <div>
            <h2 className="text-xl font-semibold text-white">Verantwortlicher</h2>
            <address className="mt-4 leading-relaxed text-white/65 not-italic">
              {siteConfig.name}
              <br />
              {siteConfig.address.street}
              <br />
              {siteConfig.address.city}
              <br />
              {siteConfig.address.country}
              <br />
              <a href={`mailto:${siteConfig.email}`} className="text-solar hover:underline">
                {siteConfig.email}
              </a>
            </address>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-white">Aufruf der Website</h2>
            <p className="mt-4 leading-relaxed text-white/65">
              Beim Aufruf der Website verarbeitet der Hosting-Dienstleister technisch notwendige
              Verbindungsdaten wie IP-Adresse, Zeitpunkt der Anfrage, aufgerufene Ressource und
              übermittelte Datenmenge. Rechtsgrundlage ist Art. 6 Abs. 1 lit. f DSGVO; das
              berechtigte Interesse liegt im sicheren und stabilen Betrieb der Website.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-white">Kontakt- und Projektanfragen</h2>
            <p className="mt-4 leading-relaxed text-white/65">
              Wenn Sie das Anfrageformular nutzen, verarbeiten wir die von Ihnen angegebenen Daten
              (Name, E-Mail-Adresse, optional Unternehmen, Telefonnummer, Standort und
              Stellplatzanzahl sowie Ihre Nachricht) ausschließlich zur Bearbeitung der Anfrage.
              Rechtsgrundlage ist Art. 6 Abs. 1 lit. b DSGVO bei vorvertraglichen Maßnahmen,
              ansonsten Art. 6 Abs. 1 lit. f DSGVO.
            </p>
            <p className="mt-4 leading-relaxed text-white/65">
              Der Versand der Anfrage erfolgt über einen E-Mail-Dienstleister als
              Auftragsverarbeiter. Die Daten werden gelöscht, sobald sie für die Bearbeitung nicht
              mehr erforderlich sind und keine gesetzlichen Aufbewahrungspflichten entgegenstehen.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-white">Schriftarten</h2>
            <p className="mt-4 leading-relaxed text-white/65">
              Die verwendeten Schriftarten werden zum Zeitpunkt des Seitenaufbaus vom eigenen
              Server ausgeliefert. Eine Verbindung Ihres Browsers zu Servern Dritter findet dabei
              nicht statt.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-white">Cookies und Analyse</h2>
            <p className="mt-4 leading-relaxed text-white/65">
              Diese Website setzt keine Cookies zu Analyse- oder Marketingzwecken. Ein
              Einwilligungsbanner ist deshalb nicht erforderlich. Sollte künftig ein Analysedienst
              eingesetzt werden, wird diese Erklärung entsprechend ergänzt.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-white">Ihre Rechte</h2>
            <p className="mt-4 leading-relaxed text-white/65">
              Sie haben das Recht auf Auskunft, Berichtigung, Löschung, Einschränkung der
              Verarbeitung, Datenübertragbarkeit und Widerspruch. Zudem steht Ihnen ein
              Beschwerderecht bei einer Datenschutzaufsichtsbehörde zu.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
