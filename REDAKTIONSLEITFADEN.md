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

### Sprache: sachlich, genau, unaufgeregt

Klartext soll klingen wie ein gutes Sachbuch oder ein sorgfältiger Zeitungsartikel – nicht wie Werbung und nicht wie ein Chatbot. Maßstab: Ein Deutschlehrer liest den Text und hat nichts anzustreichen.

**Vermeiden – typische Muster maschinell geschriebener Texte:**
- Griffige Werbe-Untertitel, die nichts aussagen („Drei Bilder, die fast jede Debatte erklären.“). Ein Untertitel sagt, was folgt – oder er fällt weg.
- Der Gedankenstrich als Allzweckwerkzeug („X – und Y“, „Am Ende zahlt immer jemand – …“). Höchstens einer pro Absatz, und nur, wo ein Komma, Punkt oder Doppelpunkt schlechter wäre.
- Dreierreihen aus Gewohnheit („schnell, einfach, verständlich“), „nicht nur …, sondern auch …“, rhetorische Fragen, Pathos („entscheidend“, „zentral“, „Kernfrage“, „Spannungsfeld“, „im Fokus“).
- Doppelpunkt-Sätze mit Pointe („Die Antwort: …“), Sätze, die mit „Denn“ oder „Und“ beginnen, um Spannung zu erzeugen.
- Übertriebener Fettdruck. Fett nur für den einen Begriff, um den es in der Aussage geht – oder gar nicht.
- Anglizismen und Denglisch, wo es ein gängiges deutsches Wort gibt.
- Füllwörter und Weichmacher („durchaus“, „letztlich“, „im Grunde“, „quasi“, „ein Stück weit“).

**Stattdessen:**
- Vollständige, grammatisch saubere Sätze; Subjekt und Verb nah beieinander; ein Gedanke pro Satz.
- Konkrete Verben statt Substantivketten („Die Kassen zahlen weniger“ statt „Es kommt zu einer Reduktion der Ausgaben seitens der Kassen“).
- Korrekte Zeichensetzung (Kommas vor Nebensätzen und erweiterten Infinitiven), deutsche Anführungszeichen „…“, Gedankenstrich „–“ mit Leerzeichen, Bindestrich ohne.
- Positionen in indirekter Rede stehen im Konjunktiv I („Der Verband sagt, die Reform gehe zu weit“); Konjunktiv II nur, wo Konjunktiv I und Indikativ gleich lauten („…, die Kliniken hätten zu wenig Geld“).
- Einheitliche Anrede: Die Oberfläche duzt; Sachtexte sprechen niemanden an.
- Gleiche Dinge gleich benennen (nicht abwechselnd „Kassen“, „Krankenversicherungen“, „GKV“ ohne Grund).

## 5. Die Zwiebel – Ebenen einer Frage

0. **Frage** + Optionen in je einem Satz
1. **Worum geht’s?** 3–6 Aussagen, in zwei Minuten lesbar (Regeln unten)
2. **Wie hängt das zusammen?** Die Mechanismen hinter dem Streit: Ursachen, Wirkungen, Größenordnungen. Optional mit Wirkungskette (`kette`) und Hebel-Rechner (`rechner`)
3. **Argumente & Zielkonflikte**: pro/contra je Option, dazu Zielkonflikte über alle Optionen
4. **Fakten & Daten**: Kennzahlen, Diagramme
5. **Geschichte**: Was wurde schon versucht, was kam heraus?
6. **Andere Länder**: Ansatz, Ergebnis und **Vergleichbarkeit** (warum übertragbar oder nicht)
7. **Quellen**: wird automatisch aus allen Belegen erzeugt

Ebenen 2 und 4–6 sind optional, solange ein Bereich noch im Aufbau ist.

### Ebene 1: Verstehen statt merken

Ebene 1 soll ein **mentales Modell** vermitteln, keinen Datensatz. Niemand merkt sich beim Lesen fünf Zahlen, aber jeder merkt sich „etwa jeder dritte Euro geht ins Krankenhaus“.

- Höchstens **eine** Zahl pro Aussage, gerundet und möglichst als Verhältnis oder Vergleich: „jeder dritte“, „doppelt so viele wie in Frankreich“, „seit 20 Jahren steigend“.
- Exakte Zahlen, Jahresangaben und Spannbreiten gehören in das Feld `genau`. Sie werden auf Wunsch aufgeklappt. Die Quelle bleibt an der Aussage.
- Erkläre **warum**, nicht nur **was**: Jede Aussage sollte einen Zusammenhang sichtbar machen („Weil die Beiträge an den Löhnen hängen, …“).
- Positionen von Akteuren gehören nicht in Ebene 1, sondern in Ebene 3.

### Ebene 2: Mechanismen statt Phrasen

Talkshow-Argumente („die Lohnnebenkosten belasten die Wirtschaft“) sind Positionen. Ebene 2 erklärt, **was tatsächlich passiert**: Welche Treiber wirken, wie groß sie sind, welche Stellschraube wie viel bewegt und wer die Last trägt. Über die Arithmetik soll man sich einigen können, auch wenn man die Werte unterschiedlich gewichtet.

- `kette`: 2–5 Stufen, z. B. *Treiber → Wohin das Geld geht → Folge → Stellschrauben*. Kurze Stichworte, je ein Satz Erklärung.
- `rechner`: nur, wenn sich die Hebel in einer gemeinsamen Einheit vergleichen lassen (z. B. Mrd. € pro Jahr). Jede Wirkung braucht eine Quelle; Schätzungen sind als solche markiert. `wer_traegt` sagt in einfachen Worten, wer bezahlt.

## 6. Parteipositionen

Berücksichtigt werden die Parteien im aktuellen Bundestag (derzeit AfD, CDU/CSU, Die Linke, Grüne, SPD), in alphabetischer Reihenfolge. Grundlage ist das Wahlprogramm zur letzten Bundestagswahl. Zuordnungen nur mit wörtlichem Beleg aus dem Wahl- oder Grundsatzprogramm im Feld `beleg` und der Seitenzahl im Feld `seite`. Alle Parteien werden mit demselben Maßstab geprüft. Übertragen werden die Zuordnungen mit `npm run merge:parteien <ordner>`. Eine Partei wird nur dann einer Option zugeordnet, wenn das Programm eindeutig ist. Sonst lieber weglassen. Parteipositionen werden Nutzerinnen und Nutzern erst nach ihrer eigenen Antwort gezeigt.

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
