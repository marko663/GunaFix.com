# Redaktionszugang einrichten (Sanity)

Der Kunde bearbeitet Texte und Bilder unter `/studio`. Die Website läuft auch
**ohne** diesen Schritt — dann zeigt sie die fest hinterlegten Inhalte aus
`src/data/de.ts` und `src/data/en.ts`.

Einmalige Einrichtung, ca. 10 Minuten.

## 1. Projekt anlegen

1. Auf <https://sanity.io/manage> mit Google oder GitHub anmelden (kostenlos).
2. **Create new project** → Name z. B. `Solaris Industrial`, Dataset `production`.
3. Die **Project ID** kopieren (steht oben im Projekt, z. B. `a1b2c3d4`).

## 2. Zugangsdaten eintragen

Datei `.env.local` im Projektordner anlegen:

```bash
NEXT_PUBLIC_SANITY_PROJECT_ID=a1b2c3d4
NEXT_PUBLIC_SANITY_DATASET=production
```

Beim Hoster (Vercel / Netlify / Cloudflare) dieselben zwei Variablen
hinterlegen.

## 3. Inhalte übertragen

Ohne eigenen Rechner: **Actions → „Inhalte ins CMS laden" → Run workflow**
(setzt die Repository-Secrets `SANITY_PROJECT_ID` und `SANITY_WRITE_TOKEN`
voraus). Alternativ lokal:

Damit der Kunde nicht vor einem leeren System sitzt, werden die vorhandenen
Texte einmalig hochgeladen.

Unter **API → Tokens** im Sanity-Projekt einen Token mit der Rolle **Editor**
erzeugen, dann:

```bash
NEXT_PUBLIC_SANITY_PROJECT_ID=a1b2c3d4 \
SANITY_WRITE_TOKEN=sk... \
node scripts/sanity-seed.mjs
```

Das legt 19 Dokumente an: Allgemein, GroundForce, 5 Baureihen, 6 Projekte,
6 Fachbeiträge — jeweils mit deutschem **und** englischem Text.

Der Befehl ist beliebig oft wiederholbar; er ersetzt die Texte und rührt
hochgeladene Fotos nicht an.

## 4. CORS freischalten

Unter **API → CORS origins** hinzufügen:

- `http://localhost:3000` (mit Credentials)
- die spätere Live-Adresse, z. B. `https://www.kundendomain.de` (mit Credentials)

Ohne diesen Schritt bleibt `/studio` leer.

## 5. Kunden einladen

Unter **Members → Invite member** die E-Mail des Kunden eintragen, Rolle
**Editor**. Wie viele Plätze der kostenlose Tarif umfasst, steht im aktuellen
Tarifüberblick bei Sanity.

Der Kunde meldet sich anschließend unter `https://<domain>/studio` an.

---

## Was der Kunde bearbeiten kann

| Bereich | Bearbeitbar |
|---|---|
| Allgemein | Slogan, Kopfbereich der Startseite, Kennzahlen, Zertifizierungen, „Warum wir", Ablauf, Kontaktdaten, häufige Fragen |
| GroundForce | Titel, Einleitung, Vorteile, Ablauf, Vergleichstabelle, technische Daten |
| Carport-Baureihen | Name, Beschreibung, Dachtypen, technische Daten, Anwendungen, Fließtext, **Foto** |
| Projekte | Titel, Branche, Ort, Jahr, Kennzahlen, Aufgabenstellung, Lösung, **Foto und Bildergalerie** |
| Fachbeiträge | Titel, Kategorie, Abschnitte, Aufzählungen, **Titelbild** |

Jedes Textfeld hat zwei Spalten: **Deutsch** und **English**. Bleibt ein Feld
leer, zeigt die Website automatisch den hinterlegten Originaltext — die Seite
kann also nie leer erscheinen.

**Bilder:** Wo ein Foto hochgeladen wird, ersetzt es die technische Zeichnung.
Wird das Foto entfernt, erscheint wieder die Zeichnung. Eine Bildbeschreibung
ist Pflicht — sie wird für Barrierefreiheit und Suchmaschinen benötigt.

## Wie schnell Änderungen sichtbar sind

Die Seiten werden 60 Sekunden zwischengespeichert. Nach dem Veröffentlichen im
Studio ist eine Änderung also spätestens nach einer Minute live.

## Wenn Sanity nicht erreichbar ist

Fällt die Verbindung aus, protokolliert die Website den Fehler und zeigt die
hinterlegten Originaltexte weiter an. Die Seite geht dadurch nicht offline.
