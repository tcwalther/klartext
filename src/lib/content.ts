import { getCollection, type CollectionEntry } from 'astro:content';
import { marked } from 'marked';

export type Frage = CollectionEntry<'fragen'>;
export type Bereich = CollectionEntry<'bereiche'>;
export type Aussage = Frage['data']['erklaerung'][number];
export type Quelle = Frage['data']['quellen'][number];
export type AussageTyp = Aussage['typ'];

export const typLabel: Record<AussageTyp, string> = {
  fakt: 'Fakt',
  schaetzung: 'Schätzung',
  wertung: 'Wertung',
  position: 'Position',
};

export const typErklaerung: Record<AussageTyp, string> = {
  fakt: 'Überprüfbare Tatsache mit Quelle',
  schaetzung: 'Prognose, Modellrechnung oder Studienergebnis mit einer gewissen Unsicherheit',
  wertung: 'Argument, das auf einer Abwägung oder einem Wert beruht',
  position: 'Forderung oder Einschätzung eines bestimmten Verbands, einer Partei oder einer Behörde',
};

/** Inline-Markdown → HTML (Inhalte stammen aus dem Repo, nicht von Nutzern). */
export const md = (s: string) => marked.parseInline(s, { async: false }) as string;

export async function getBereiche() {
  const b = await getCollection('bereiche');
  return b.sort((a, c) => a.data.reihenfolge - c.data.reihenfolge);
}

/** Alle Fragen in Anzeige-Reihenfolge: nach Bereich, dann nach `reihenfolge`. */
export async function getFragen() {
  const bereiche = await getBereiche();
  const order = new Map(bereiche.map((b, i) => [b.id, i]));
  const fragen = await getCollection('fragen');
  return fragen.sort(
    (a, b) => (order.get(a.data.bereich) ?? 99) - (order.get(b.data.bereich) ?? 99) || a.data.reihenfolge - b.data.reihenfolge,
  );
}

export const frageUrl = (id: string) => `/gesundheit/${id}/`;

/**
 * Nummeriert Quellen in der Reihenfolge ihres ersten Auftretens in der Frage,
 * damit Fußnoten [1], [2] … von oben nach unten aufsteigen.
 */
export function quellenNummern(frage: Frage) {
  const nums = new Map<string, number>();
  const visit = (node: unknown, key = ''): void => {
    if (Array.isArray(node)) {
      for (const item of node) {
        if (key === 'quellen' && typeof item === 'string') {
          if (!nums.has(item)) nums.set(item, nums.size + 1);
        } else visit(item);
      }
    } else if (node && typeof node === 'object') {
      for (const [k, v] of Object.entries(node)) {
        if (k === 'quellen' && v === frage.data.quellen) continue;
        if (k === 'quelle' && typeof v === 'string') {
          if (!nums.has(v)) nums.set(v, nums.size + 1);
        } else visit(v, k);
      }
    }
  };
  visit(frage.data);
  for (const q of frage.data.quellen) if (!nums.has(q.id)) nums.set(q.id, nums.size + 1);
  return nums;
}

/** Hat die Frage eine Kurzfassung? Dann zeigt die Seite drei Stufen nach Zeitbudget. */
export const istKompakt = (frage: Frage) => !!frage.data.kurz_erklaert?.length;

/** Die drei Stufen einer Frage mit Kurzfassung. */
export const STUFEN = [
  { n: 1, id: 'worum-gehts', titel: 'Kurz erklärt', sub: '30 Sekunden', da: true },
  { n: 2, id: 'verstehen', titel: 'Verstehen', sub: '10 Minuten', da: true },
  { n: 3, id: 'genau', titel: 'Genau wissen', sub: 'so lange du willst', da: true },
];

/** Gliederung, nach der die Seite aufgebaut ist: drei Stufen (Kurzfassung) oder die Inhaltsebenen. */
export function ebenenVon(frage: Frage) {
  return istKompakt(frage) ? STUFEN : inhaltsEbenen(frage);
}

/** Welche Inhaltsebenen hat eine Frage? (1 und 3 immer, 2 und 4–6 optional, 7 = Quellen) */
export function inhaltsEbenen(frage: Frage) {
  const d = frage.data;
  const hatDaten = !!d.daten && (d.daten.kennzahlen.length + d.daten.diagramme.length + d.daten.aussagen.length > 0);
  const z = d.zusammenhaenge;
  return [
    { n: 1, id: 'worum-gehts', titel: 'Worum geht’s?', sub: 'Das Wichtigste in zwei Minuten', da: true },
    { n: 2, id: 'zusammenhaenge', titel: 'Wie hängt das zusammen?', sub: 'Ursachen, Wirkungen und Größenordnungen', da: !!z },
    { n: 3, id: 'argumente', titel: 'Argumente und Zielkonflikte', sub: 'Was für jede Antwort spricht und was sie kostet', da: true },
    { n: 4, id: 'daten', titel: 'Fakten und Daten', sub: 'Zahlen mit Quelle und Stand', da: hatDaten },
    { n: 5, id: 'geschichte', titel: 'Was wurde schon versucht?', sub: 'Frühere Reformen und ihre Ergebnisse', da: !!d.geschichte?.ereignisse.length },
    { n: 6, id: 'andere-laender', titel: 'Wie machen es andere Länder?', sub: 'Beispiele und ob sie sich übertragen lassen', da: !!d.laender?.beispiele.length },
    { n: 7, id: 'quellen', titel: 'Quellen', sub: 'Alle Belege dieser Frage', da: true },
  ];
}

/** Serialisierbare Kurzform einer Frage für die interaktiven Inseln. */
export function frageKurz(f: Frage) {
  return {
    id: f.id,
    bereich: f.data.bereich,
    titel: f.data.titel,
    frage: f.data.frage,
    kurzfrage: f.data.kurzfrage ?? null,
    kompakt: istKompakt(f),
    kurzErklaert: (f.data.kurz_erklaert ?? []).map((a) => ({ typ: a.typ, html: md(a.text), wer: a.wer ?? null, genau: a.genau ? md(a.genau) : null })),
    status: f.data.status,
    url: frageUrl(f.id),
    optionen: f.data.optionen.map((o) => ({ id: o.id, titel: o.titel })),
    erklaerung: f.data.erklaerung.map((a) => ({ typ: a.typ, html: md(a.text), wer: a.wer ?? null, genau: a.genau ? md(a.genau) : null })),
    parteien: f.data.parteien.map((p) => {
      const q = f.data.quellen.find((q) => q.id === p.quelle);
      return { partei: p.partei, option: p.option, beleg: p.beleg, seite: p.seite, titel: q?.titel ?? '', url: q?.url ?? null };
    }),
    zusammenhaenge: !!f.data.zusammenhaenge,
    tiefe: inhaltsEbenen(f).filter((e) => e.da && e.n < 7).length,
    ringe: ebenenVon(f).filter((e) => e.da).length,
  };
}
export type FrageKurz = ReturnType<typeof frageKurz>;

export async function getSpannungen() {
  const files = await getCollection('spannungen');
  return files.flatMap((f) => f.data.eintraege);
}
export type Spannung = Awaited<ReturnType<typeof getSpannungen>>[number];
