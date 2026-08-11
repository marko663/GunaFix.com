# Livegang

## Wohin

| Anbieter | Kosten | Hinweis |
|---|---|---|
| **Netlify** | kostenlos | Kommerzielle Nutzung erlaubt. `netlify.toml` liegt bereits im Projekt. **Empfehlung.** |
| **Cloudflare Pages** | kostenlos | Kommerzielle Nutzung erlaubt, benötigt aber `@opennextjs/cloudflare` als Adapter. |
| **Vercel** | ab 20 $/Monat | Am bequemsten, aber der kostenlose Hobby-Tarif **verbietet kommerzielle Nutzung**. Für ein Kundenprojekt ist Pro nötig. |

Laufende Kosten bei Netlify: Domain ca. 15 €/Jahr, sonst nichts. Der
Formularversand über Resend ist bis 3.000 E-Mails/Monat kostenlos.

## Netlify in fünf Schritten

1. Auf <https://app.netlify.com> → **Add new site** → **Import an existing
   project** → GitHub → dieses Repository, Branch
   `claude/website-redesign-content-migration-y1id1m` (oder nach dem Merge `main`).
2. Build-Einstellungen werden aus `netlify.toml` übernommen — nichts ändern.
3. Unter **Site configuration → Environment variables** eintragen:

   | Variable | Wert |
   |---|---|
   | `NEXT_PUBLIC_SANITY_PROJECT_ID` | Projekt-ID aus Sanity |
   | `NEXT_PUBLIC_SANITY_DATASET` | `production` |
   | `RESEND_API_KEY` | Schlüssel von resend.com (für das Kontaktformular) |
   | `CONTACT_EMAIL` | Postfach, das die Anfragen empfangen soll |
   | `CONTACT_FROM_EMAIL` | z. B. `Solaris Industrial <kontakt@kundendomain.de>` |
   | `SITE_NOINDEX` | `true` **für die Demo**, später entfernen |

   Ohne `RESEND_API_KEY` nimmt das Formular Eingaben weiterhin an und
   protokolliert sie, versendet aber keine E-Mail.
4. **Deploy**. Die erste Testadresse lautet `https://<name>.netlify.app` —
   ideal, um sie dem Kunden vorab zu zeigen.
5. Domain verbinden: **Domain management → Add a domain**, danach die von
   Netlify angezeigten Nameserver beim Domain-Anbieter eintragen. Das
   SSL-Zertifikat wird automatisch ausgestellt.

## Demo-Version für den Kunden

Solange die Seite noch Platzhalter enthält, darf sie nicht in Suchmaschinen
auftauchen. Dafür beim Hoster setzen:

```
SITE_NOINDEX=true
```

Dann liefert `robots.txt` ein vollständiges `Disallow: /` und jede Seite trägt
`<meta name="robots" content="noindex, nofollow">`. Die Website funktioniert
normal — sie wird nur nicht indexiert.

**Vor dem echten Livegang die Variable wieder entfernen** und neu
veröffentlichen, sonst bleibt die Seite für Google unsichtbar.

## Nach dem Livegang prüfen

- [ ] `/` leitet je nach Browsersprache auf `/de` bzw. `/en` um
- [ ] Sprachumschalter oben rechts wechselt und bleibt auf derselben Seite
- [ ] `/studio` erreichbar, Login des Kunden funktioniert
- [ ] In Sanity unter **API → CORS origins** die Live-Domain eintragen
      (mit Credentials) — sonst bleibt `/studio` leer
- [ ] Kontaktformular abschicken und Zustellung prüfen
- [ ] `/sitemap.xml` liefert beide Sprachen
- [ ] Impressum und Datenschutz mit den echten Firmendaten gefüllt
- [ ] `SITE_NOINDEX` entfernt und `robots.txt` erlaubt wieder das Indexieren

## Vor dem Livegang unbedingt ersetzen

Diese Inhalte sind Platzhalter und dürfen so nicht online gehen:

- Anschrift, Telefonnummer und E-Mail im Sanity-Dokument **Allgemein**
- Impressum: Rechtsform, Registergericht, HR-Nummer, USt-IdNr.,
  Vertretungsberechtigte
- Datenschutzerklärung: rechtlich prüfen lassen
- Die sechs Projekte unter **Projekte** — durch echte Referenzen mit Freigabe
  des jeweiligen Kunden ersetzen
- Kennzahlen (700+, 60 MW, 20.000) und die Baureihe **NEXUS** prüfen: Beide
  stammen nicht vom Auftraggeber und müssen bestätigt oder entfernt werden.
