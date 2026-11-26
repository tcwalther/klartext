/**
 * Inhaltsschema von Klartext.
 *
 * Das Schema ist bewusst streng: Jede Tatsachenbehauptung braucht eine Quelle,
 * jede Position braucht einen Absender. Verstöße lassen den Build scheitern.
 * Querverweise (Quellen-IDs, verknüpfte Fragen, Spannungen) werden zusätzlich
 * in src/lib/content.ts geprüft.
 */
import { defineCollection } from 'astro:content';
import { glob, file } from 'astro/loaders';
import { z } from 'astro/zod';
import { PARTEIEN } from './lib/parteien';

const slug = z.string().regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, 'nur a-z, 0-9 und Bindestriche');

/** Art einer Aussage – wird überall als Badge angezeigt. */
export const aussageTypen = ['fakt', 'schaetzung', 'wertung', 'position'] as const;

const quelle = z.object({
  id: slug,
  titel: z.string(),
  herausgeber: z.string(),
  jahr: z.number().int().min(1900).max(2100),
  url: z.url().optional(),
  art: z.enum(['amtlich', 'wissenschaft', 'gutachten', 'verband', 'partei', 'gesetz', 'presse', 'international']),
});

/**
 * Eine einzelne Aussage. Text ist Inline-Markdown.
 * - fakt / schaetzung: mindestens eine Quelle
 * - position: `wer` ist Pflicht (z. B. „Deutsche Krankenhausgesellschaft“)
 */
const aussage = z
  .object({
    typ: z.enum(aussageTypen),
    text: z.string().min(1),
    quellen: z.array(slug).default([]),
    wer: z.string().optional(),
    unsicherheit: z.string().optional(),
    // Exakte Zahlen zum Aufklappen. `text` bleibt verständlich und gerundet.
    genau: z.string().optional(),
  })
  .superRefine((a, ctx) => {
    if ((a.typ === 'fakt' || a.typ === 'schaetzung') && a.quellen.length === 0) {
      ctx.addIssue({ code: 'custom', message: `Aussage vom Typ „${a.typ}“ braucht eine Quelle: ${a.text.slice(0, 80)}` });
    }
    if (a.typ === 'position' && !a.wer) {
      ctx.addIssue({ code: 'custom', message: `Position braucht „wer“: ${a.text.slice(0, 80)}` });
    }
  });

const kennzahl = z.object({
  label: z.string(),
  wert: z.string(), // als Text, damit „ca. 1.870“ oder „7,8 je 1.000 EW“ möglich ist
  stand: z.string(), // z. B. „2023“
  quelle: slug,
  hinweis: z.string().optional(),
});

const diagramm = z.object({
  titel: z.string(),
  einheit: z.string(),
  stand: z.string(),
  quelle: slug,
  hinweis: z.string().optional(),
  werte: z.array(z.object({ label: z.string(), wert: z.number(), hervorheben: z.boolean().default(false) })).min(2),
});

const option = z.object({
  id: slug,
  titel: z.string(), // 2–5 Wörter
  kurz: z.string(), // ein Satz, Ebene 0
  pro: z.array(aussage).min(1),
  contra: z.array(aussage).min(1),
  // Kurzfassung (Stufe „Verstehen“): je eine Zeile dafür und dagegen, höchstens ~12 Wörter
  kurz_pro: z.string().max(120).optional(),
  kurz_contra: z.string().max(120).optional(),
  gewinnt: z.array(z.string()).default([]), // Wer/was profitiert (Stichworte)
  kostet: z.array(z.string()).default([]), // Wer/was trägt die Last (Stichworte)
});

const fragen = defineCollection({
  loader: glob({ pattern: '**/*.yaml', base: './src/content/fragen' }),
  schema: z.object({
    bereich: slug,
    reihenfolge: z.number().int(),
    status: z.enum(['entwurf', 'geprueft']),
    stand: z.string(), // Datum der letzten inhaltlichen Prüfung, YYYY-MM-DD
    titel: z.string(), // Überschrift, neutral formuliert
    frage: z.string(), // Ebene 0: die Entscheidungsfrage
    // Kurzfassung nach Zeitbudget. Ist `kurz_erklaert` gesetzt, zeigt die Seite drei Stufen:
    // Kurz erklärt (30 Sekunden) → Verstehen (5 Minuten) → Genau wissen (alles Übrige).
    kurzfrage: z.string().max(90).optional(), // höchstens ~12 Wörter
    kurz_erklaert: z.array(aussage).min(1).max(3).optional(),
    // Erklärvideo: höchstens eines je Frage, vorher redaktionell freigegeben
    video: z
      .object({
        titel: z.string(),
        absender: z.string(),
        dauer: z.string(), // z. B. „4 Min.“
        jahr: z.number().int(),
        url: z.url(),
        youtube_id: z.string().regex(/^[A-Za-z0-9_-]{11}$/).optional(), // dann per Klick einbettbar
      })
      .optional(),
    optionen: z.array(option).min(2).max(4),

    // Ebene 1 – Worum geht's? (in zwei Minuten lesbar)
    erklaerung: z.array(aussage).min(2),
    // Ebene 2 – Wie hängt das zusammen? Mechanismen statt Positionen.
    zusammenhaenge: z
      .object({
        // Kernmechanismus in 2–4 Aussagen
        erklaerung: z.array(aussage).min(1),
        // Wirkungskette in Stufen, z. B. Treiber → Ausgabenblöcke → Folge → Stellschrauben
        kette: z
          .array(
            z.object({
              titel: z.string(),
              punkte: z.array(z.object({ label: z.string(), text: z.string() })).min(1),
            }),
          )
          .min(2)
          .max(5)
          .optional(),
        // Hebel-Rechner: Wie viel bringt welche Maßnahme? Alle Wirkungen belegt.
        rechner: z
          .object({
            titel: z.string(),
            einheit: z.string(), // z. B. „Mrd. € pro Jahr“
            ziel: z.object({ label: z.string(), wert: z.number().positive(), stand: z.string(), quelle: slug, hinweis: z.string().optional() }),
            massnahmen: z
              .array(
                z.object({
                  id: slug,
                  titel: z.string(),
                  option: slug.optional(), // zu welcher Antwortoption die Maßnahme gehört
                  wer_traegt: z.string(), // wer die Last trägt – in einfachen Worten
                  varianten: z
                    .array(z.object({ label: z.string(), wirkung: z.number().nonnegative() }))
                    .min(1),
                  typ: z.enum(['fakt', 'schaetzung']),
                  quelle: slug,
                  hinweis: z.string().optional(),
                }),
              )
              .min(2),
          })
          .optional(),
      })
      .optional(),
    // Ebene 3 – Zielkonflikte über alle Optionen hinweg
    zielkonflikte: z.array(aussage).min(1),
    // Ebene 4 – Fakten & Daten
    daten: z
      .object({
        kennzahlen: z.array(kennzahl).default([]),
        diagramme: z.array(diagramm).default([]),
        aussagen: z.array(aussage).default([]),
      })
      .optional(),
    // Ebene 5 – Geschichte: Was wurde schon versucht?
    geschichte: z
      .object({
        ereignisse: z.array(
          z.object({ jahr: z.string(), titel: z.string(), text: z.string(), quellen: z.array(slug).min(1) }),
        ),
        bilanz: z.array(aussage).default([]),
      })
      .optional(),
    // Ebene 6 – Andere Länder
    laender: z
      .object({
        beispiele: z.array(
          z.object({
            land: z.string(),
            ansatz: z.string(),
            text: z.string(),
            vergleichbarkeit: z.enum(['hoch', 'mittel', 'gering']),
            vergleichbarkeit_text: z.string(),
            quellen: z.array(slug).min(1),
          }),
        ),
        diagramme: z.array(diagramm).default([]),
        fazit: z.array(aussage).default([]),
      })
      .optional(),

    verknuepft: z.array(z.object({ frage: slug, grund: z.string() })).default([]),
    // Parteipositionen: nur mit Quelle (Wahlprogramm + Seite). Werden erst nach der eigenen Antwort gezeigt.
    parteien: z
      .array(
        z.object({
          partei: z.enum(PARTEIEN),
          option: slug,
          beleg: z.string().min(20), // wörtliches Zitat aus dem Programm
          seite: z.string(), // Seitenzahl im PDF
          quelle: slug,
        }),
      )
      .default([]),
    quellen: z.array(quelle).min(1),
  }),
});

/**
 * Spannungen: Antwortkombinationen, die sich gegenseitig unter Druck setzen.
 * Werden auf „Mein Bild“ angezeigt, wenn alle Antworten zutreffen.
 * Ton: erklärend, nie belehrend – Spannungen sind legitim auflösbar.
 */
const spannungen = defineCollection({
  loader: glob({ pattern: '**/*.yaml', base: './src/content/spannungen' }),
  schema: z.object({
    eintraege: z.array(
      z.object({
        id: slug,
        wenn: z.array(z.object({ frage: slug, option: slug })).min(2),
        titel: z.string(),
        text: z.string(),
        aufloesung: z.string(), // Wie man beides trotzdem zusammen wollen kann
      }),
    ),
  }),
});

const bereiche = defineCollection({
  loader: file('./src/content/bereiche.yaml'),
  schema: z.object({
    titel: z.string(),
    kurz: z.string(),
    reihenfolge: z.number().int(),
  }),
});

/** Systemkarte: Kennzahlen zum Gesamtsystem. */
const system = defineCollection({
  loader: glob({ pattern: '**/*.yaml', base: './src/content/system' }),
  schema: z.object({
    stand: z.string(),
    status: z.enum(['entwurf', 'geprueft']),
    // Das Wichtigste auf einen Blick: wenige merkbare Aussagen, genaue Zahlen in `genau`
    kernaussagen: z.array(aussage).max(6).default([]),
    // Wohin ein Euro geht – als ein gestapelter Balken
    ausgabenanteile: z
      .object({
        titel: z.string(),
        einheit: z.string(),
        stand: z.string(),
        quelle: slug,
        anteile: z.array(z.object({ label: z.string(), wert: z.number().positive(), text: z.string() })).min(2),
      })
      .optional(),
    // Wer entscheidet – grob in Ebenen
    steuerung: z.array(z.object({ titel: z.string(), text: z.string(), wer: z.string() })).default([]),
    kennzahlen: z.array(kennzahl.extend({ bereich: slug.optional() })),
    geldfluss: z.array(z.object({ von: z.string(), an: z.string(), betrag: z.string(), text: z.string(), quelle: slug })),
    akteure: z.array(z.object({ name: z.string(), rolle: z.string() })),
    quellen: z.array(quelle).min(1),
  }),
});

export const collections = { fragen, spannungen, bereiche, system };
