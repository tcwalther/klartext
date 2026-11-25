# Klartext

**Politik verstehen, bevor man sie bewertet.**

Klartext liegt zwischen Wahl-O-Mat und Wikipedia. Man beginnt mit einfachen Entscheidungsfragen. Wer „kann ich nicht entscheiden“ sagt, kann Schicht für Schicht tiefer gehen: Erklärung → Argumente & Zielkonflikte → Daten → Geschichte → andere Länder → Quellen. Das erste Thema ist das deutsche Gesundheitssystem.

Grundsätze: politisch neutral, alle sehen dieselben Inhalte, Daten und Meinungen sind sichtbar getrennt, Antworten bleiben im Browser. Details stehen in [REDAKTIONSLEITFADEN.md](REDAKTIONSLEITFADEN.md).

## Loslegen

```sh
npm install
npm run dev        # http://localhost:4321
npm run build      # prüft Inhalte + Typen, baut nach dist/
npm test           # Playwright-Smoke-Test (Handy + Desktop) gegen den Build
```

Für `npm test` braucht Playwright einen Chromium. Entweder `npx playwright install chromium` ausführen oder einen vorhandenen Browser per `PW_CHROME=/pfad/zu/chrome npm test` angeben.

## Aufbau

```
src/
  content.config.ts      Inhaltsschema (Zod) – das Herzstück
  content/
    bereiche.yaml        die 8 Bereiche des Themas Gesundheit
    fragen/*.yaml        eine Datei pro Frage, mit allen Ebenen der Zwiebel
    spannungen/*.yaml    Antwortkombinationen, die sich gegenseitig unter Druck setzen
    system/gesundheit.yaml  Kennzahlen, Geldflüsse, Akteure für die Systemkarte
  pages/                 Start, Systemkarte, Fragen-Durchlauf, Detailseiten, Mein Bild, Methodik, Quellen
  islands/               interaktive Teile (Preact): Durchlauf, Antwortbox, Mein Bild
  components/            Aussage-Badges, Quellenverweise, Ebenen, Diagramme
scripts/check-refs.mjs   prüft Querverweise (Quellen, verknüpfte Fragen, Spannungen)
tests/                   Playwright-Smoke-Tests
```

## Inhalte bearbeiten

1. Eine Frage-Datei in `src/content/fragen/` öffnen oder anlegen. Der Dateiname ist die URL.
2. Jede Aussage hat einen `typ`: `fakt` und `schaetzung` brauchen eine Quelle, `position` braucht `wer`.
3. `npm run check:content` ausführen. Fehlende Quellen oder kaputte Verweise lassen den Build scheitern. Das ist Absicht.
4. Nach menschlicher Prüfung `status: entwurf` auf `status: geprueft` setzen und `stand` aktualisieren.

## Veröffentlichen

Die Seite ist komplett statisch (`dist/`). Sie läuft auf Cloudflare Pages, Netlify oder Vercel:
- Build-Befehl: `npm run build`
- Ausgabeordner: `dist`

Vorher in `astro.config.mjs` die echte Domain bei `site` eintragen und in `src/config.ts` optional einen `feedbackUrl` (z. B. ein Tally-Formular) setzen. Dann erscheint unter jeder Ebene ein Link „wirkt einseitig?“.

## Nächste Schritte (Ideen)

- Inhalte prüfen und freigeben, Parteipositionen mit Belegen ergänzen
- Weitere Bereiche in volle Tiefe bringen
- Anonymes, aggregiertes Meinungsbild (wo sind sich Menschen einig?) im Stil von Polis
- „Tiefer recherchieren“: Nutzer fragen nach, ein Sprachmodell schreibt einen Entwurf, die Redaktion prüft, alle sehen das Ergebnis
