# Redaktionsleitfaden

Klartext ist eine politisch neutrale Plattform. Sie soll Menschen helfen, sich eine **eigene** Meinung zu bilden und konstruktiv darüber zu sprechen. Sie wirbt für keine Position und keine Partei. Dieser Leitfaden gilt für alle Inhalte, egal ob von Menschen oder mit Hilfe eines Sprachmodells geschrieben.

## 1. Grundsätze

1. **Alle sehen dasselbe.** Inhalte liegen versioniert in diesem Repository. Es gibt keine personalisierten Antworten.
2. **Daten und Meinungen sind sichtbar getrennt.** Jede Aussage hat einen Typ (siehe unten).
3. **Fairness zwischen Optionen.** Jede Option bekommt die stärkste Version ihrer Argumente („steelmanning“), ungefähr gleich viel Platz und die gleiche sprachliche Sorgfalt. Testfrage: *Würde ein überzeugter Anhänger dieser Option sagen, dass sie hier fair dargestellt ist?*
4. **Keine Empfehlung.** Klartext sagt nie, welche Option richtig ist. Auch Formulierungen wie „Experten sind sich einig“ sind nur zulässig, wenn das belegt ist, und dann als Fakt mit Quelle.
5. **Unsicherheit benennen.** Wenn die Datenlage dünn oder umstritten ist, wird das gesagt (`unsicherheit`).
6. **Entwurf bleibt Entwurf.** Neue oder mit Sprachmodellen erstellte Inhalte haben `status: entwurf`, bis ein Mensch sie geprüft hat. Entwürfe werden auf der Seite als solche gekennzeichnet.

## 2. Aussage-Typen

| Typ | Bedeutung | Pflicht |
|---|---|---|
| `fakt` | Überprüfbare Tatsache: Zahl, Gesetzeslage, Ereignis | mindestens eine Quelle |
| `schaetzung` | Prognose, Modellrechnung, Hochrechnung, Studienergebnis mit Spannbreite | mindestens eine Quelle, möglichst `unsicherheit` |
| `wertung` | Argument, das auf einer Abwägung oder einem Wert beruht | keine Quelle nötig, aber sachlich formuliert |
| `position` | Was ein bestimmter Akteur fordert oder behauptet | `wer` (z. B. „GKV-Spitzenverband“), möglichst Quelle |

Argumente (`pro`/`contra`) sind meistens `wertung` oder `position`. Enthält ein Argument eine Zahl, wird diese Zahl als eigener `fakt` belegt oder das Argument selbst wird zur Aussage mit Quelle.

## 3. Quellenhierarchie

Bevorzugt, in dieser Reihenfolge:
1. Amtliche Statistik und Gesetze: Destatis, BMG, Bundesgesetzblatt, gesetze-im-internet.de, Bundestag-Drucksachen
2. Wissenschaftliche Gutachten: Sachverständigenrat Gesundheit & Pflege, Regierungskommission Krankenhaus, IGES, RWI, WIdO, Zi
3. Internationale Organisationen: OECD (Health at a Glance, Health Statistics), WHO, European Observatory on Health Systems and Policies
4. Selbstverwaltung und Verbände (immer als Interessenträger kenntlich): GKV-Spitzenverband, DKG, KBV, PKV-Verband, Deutscher Pflegerat
5. Qualitätsjournalismus nur für Ereignisse, nicht für Zahlen

Jede Quelle braucht `id`, `titel`, `herausgeber`, `jahr`, `art` und möglichst eine `url`. **Nie eine Quelle oder URL erfinden.** Wenn sich eine Zahl nicht belegen lässt, wird sie weggelassen.

## 4. Formulierungsregeln

- Kurze Sätze, Alltagssprache, Fachbegriffe beim ersten Auftreten erklären.
- Neutral benennen: „Bündelung von Leistungen“ statt „Kliniksterben“ oder „Strukturbereinigung“. Wenn Akteure eigene Kampfbegriffe nutzen, als Zitat einer `position` kennzeichnen.
- Optionen sind echte Alternativen, keine Strohmänner. Wo es sinnvoll ist, gibt es eine Mitte oder eine dritte Option.
- `gewinnt` / `kostet`: konkrete Gruppen oder Güter in Stichworten, z. B. „Beitragszahler“, „Patienten auf dem Land“, „Versorgungsqualität bei komplexen Eingriffen“.
- Zahlen mit Stand-Jahr angeben. Deutsche Schreibweise: 1.234,5.

## 5. Die Zwiebel – Ebenen einer Frage

0. **Frage** + Optionen in je einem Satz
1. **Worum geht’s?** 3–6 Aussagen, in zwei Minuten lesbar
2. **Argumente & Zielkonflikte**: pro/contra je Option, dazu Zielkonflikte über alle Optionen
3. **Fakten & Daten**: Kennzahlen, Diagramme
4. **Geschichte**: Was wurde schon versucht, was kam heraus?
5. **Andere Länder**: Ansatz, Ergebnis und **Vergleichbarkeit** (warum übertragbar oder nicht)
6. **Quellen**: wird automatisch aus allen Belegen erzeugt

Ebenen 3–5 sind optional, solange ein Bereich noch im Aufbau ist.

## 6. Parteipositionen

Nur mit wörtlichem oder eng paraphrasiertem Beleg aus dem Wahl- oder Grundsatzprogramm (mit Seitenzahl) im Feld `beleg`. Eine Partei wird nur dann einer Option zugeordnet, wenn das Programm eindeutig ist. Sonst lieber weglassen. Parteipositionen werden Nutzerinnen und Nutzern erst nach ihrer eigenen Antwort gezeigt.

## 7. Spannungen

Spannungen beschreiben Antwortkombinationen, die sich gegenseitig unter Druck setzen (z. B. mehr Leistungen *und* niedrigere Beiträge). Sie sind **keine** Widersprüche, die man jemandem vorhält. Jede Spannung erklärt in `aufloesung`, wie man beides trotzdem zusammen wollen kann.

## 8. Beispiel (gekürzt)

```yaml
bereich: krankenhaeuser
reihenfolge: 1
status: entwurf
stand: "2026-11-25"
titel: Wo sollen Operationen stattfinden?
frage: Sollen komplizierte Eingriffe auf weniger, spezialisierte Kliniken konzentriert werden?
optionen:
  - id: konzentrieren
    titel: Stärker konzentrieren
    kurz: Komplexe Eingriffe nur noch in Kliniken mit viel Erfahrung und Ausstattung.
    pro:
      - typ: wertung
        text: Wer einen Eingriff häufig macht, macht ihn im Schnitt besser.
    contra:
      - typ: wertung
        text: Längere Anfahrtswege belasten Patienten und Angehörige.
    gewinnt: [Behandlungsqualität bei komplexen Eingriffen]
    kostet: [Wohnortnähe]
  - id: ...
erklaerung:
  - typ: fakt
    text: In Deutschland gibt es rund … Krankenhäuser.
    quellen: [destatis-krankenhaeuser-2023]
zielkonflikte:
  - typ: wertung
    text: Qualität durch Spezialisierung steht gegen Erreichbarkeit.
quellen:
  - id: destatis-krankenhaeuser-2023
    titel: Grunddaten der Krankenhäuser 2023
    herausgeber: Statistisches Bundesamt
    jahr: 2024
    url: https://www.destatis.de/...
    art: amtlich
```

Das vollständige Schema steht in `src/content.config.ts`.
