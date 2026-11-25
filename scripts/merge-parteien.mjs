#!/usr/bin/env node
/**
 * Überträgt Parteizuordnungen (JSON, eine Datei pro Partei) in die Frage-Dateien.
 *
 *   node scripts/merge-parteien.mjs <ordner-mit-json>
 *
 * JSON-Format: { partei, quelle: {titel, herausgeber, jahr, url}, zuordnungen: [{frage, option, seite, beleg}] }
 * Bestehende Einträge derselben Partei werden ersetzt. Die Programm-Quelle wird je Frage-Datei ergänzt.
 */
import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { parseDocument } from 'yaml';

const dir = process.argv[2];
if (!dir) throw new Error('Ordner fehlt');
const fragenDir = new URL('../src/content/fragen/', import.meta.url).pathname;

const slugify = (s) =>
  s.toLowerCase().replace(/ü/g, 'ue').replace(/ö/g, 'oe').replace(/ä/g, 'ae').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

const docs = new Map();
const doc = (frage) => {
  if (!docs.has(frage)) docs.set(frage, parseDocument(readFileSync(join(fragenDir, `${frage}.yaml`), 'utf8')));
  return docs.get(frage);
};

let n = 0;
const geaendert = new Set();
const probleme = [];
for (const file of readdirSync(dir).filter((f) => f.endsWith('.json'))) {
  const data = JSON.parse(readFileSync(join(dir, file), 'utf8'));
  const quelleId = `wahlprogramm-2025-${slugify(data.partei)}`;
  // Zuerst alte Einträge dieser Partei überall entfernen
  for (const f of readdirSync(fragenDir).filter((f) => f.endsWith('.yaml'))) {
    const d = doc(f.replace('.yaml', ''));
    const arr = d.get('parteien');
    if (arr?.items) {
      const vorher = arr.items.length;
      arr.items = arr.items.filter((i) => i.get('partei') !== data.partei);
      if (arr.items.length !== vorher) geaendert.add(f.replace('.yaml', ''));
    }
  }
  for (const z of data.zuordnungen) {
    let d;
    try {
      d = doc(z.frage);
    } catch {
      probleme.push(`${data.partei}: Frage ${z.frage} existiert nicht`);
      continue;
    }
    const optionen = d.get('optionen').items.map((o) => o.get('id'));
    if (!optionen.includes(z.option)) {
      probleme.push(`${data.partei}: Option ${z.option} existiert nicht in ${z.frage}`);
      continue;
    }
    if (!d.has('parteien') || !d.get('parteien')?.items) d.set('parteien', d.createNode([]));
    d.get('parteien').flow = false;
    d.get('parteien').add(
      d.createNode({ partei: data.partei, option: z.option, beleg: z.beleg.trim(), seite: String(z.seite), quelle: quelleId }),
    );
    const quellen = d.get('quellen');
    if (!quellen.items.some((q) => q.get('id') === quelleId)) {
      quellen.add(
        d.createNode({
          id: quelleId,
          titel: data.quelle.titel,
          herausgeber: data.quelle.herausgeber,
          jahr: data.quelle.jahr,
          ...(data.quelle.url ? { url: data.quelle.url } : {}),
          art: 'partei',
        }),
      );
    }
    geaendert.add(z.frage);
    n++;
  }
}

// Quellen entfernen, die nach dem Ersetzen nicht mehr verwendet werden
for (const frage of geaendert) {
  const d = docs.get(frage);
  const used = new Set((d.get('parteien')?.items ?? []).map((i) => i.get('quelle')));
  const quellen = d.get('quellen');
  quellen.items = quellen.items.filter((q) => !String(q.get('id')).startsWith('wahlprogramm-2025-') || used.has(q.get('id')));
  writeFileSync(join(fragenDir, `${frage}.yaml`), d.toString({ lineWidth: 0, flowCollectionPadding: false }));
}

console.log(`✓ ${n} Zuordnungen übertragen`);
if (probleme.length) {
  console.error(probleme.map((p) => '  ✗ ' + p).join('\n'));
  process.exit(1);
}
