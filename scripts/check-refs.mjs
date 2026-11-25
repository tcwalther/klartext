#!/usr/bin/env node
/**
 * Prüft Querverweise in den Inhalten, die das Zod-Schema allein nicht sehen kann:
 * - jede verwendete Quellen-ID existiert in der Datei
 * - keine doppelten Quellen-IDs, Options-IDs oder Frage-Dateinamen
 * - verknüpfte Fragen existieren
 * - Spannungen verweisen auf existierende Fragen und Optionen
 * - Parteipositionen verweisen auf existierende Optionen
 *
 * Aufruf: node scripts/check-refs.mjs  (läuft auch automatisch vor dem Build)
 */
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join, basename } from 'node:path';
import { parse } from 'yaml';

const root = new URL('../src/content/', import.meta.url).pathname;
const errors = [];
const err = (file, msg) => errors.push(`${file}: ${msg}`);

const yamlFiles = (dir) =>
  existsSync(join(root, dir)) ? readdirSync(join(root, dir)).filter((f) => f.endsWith('.yaml')) : [];

const bereiche = new Set(parse(readFileSync(join(root, 'bereiche.yaml'), 'utf8')).map((b) => b.id));

/** Sammelt alle Quellen-IDs, die irgendwo im Objekt in `quellen: [...]` oder `quelle:` referenziert werden. */
function collectRefs(node, out = new Set(), key = '') {
  if (Array.isArray(node)) {
    for (const item of node) {
      if (key === 'quellen' && typeof item === 'string') out.add(item);
      else collectRefs(item, out);
    }
  } else if (node && typeof node === 'object') {
    for (const [k, v] of Object.entries(node)) {
      if (k === 'quelle' && typeof v === 'string') out.add(v);
      else collectRefs(v, out, k);
    }
  }
  return out;
}

function checkSources(file, data) {
  const defined = data.quellen ?? [];
  const ids = new Set();
  for (const q of defined) {
    if (typeof q !== 'object') continue;
    if (ids.has(q.id)) err(file, `Quelle doppelt definiert: ${q.id}`);
    ids.add(q.id);
  }
  // Referenzen ohne die Definitionsliste selbst prüfen
  const { quellen: _defs, ...rest } = data;
  const used = collectRefs(rest);
  for (const ref of used) if (!ids.has(ref)) err(file, `Quelle nicht definiert: ${ref}`);
  for (const id of ids) if (!used.has(id)) err(file, `Quelle definiert, aber nie verwendet: ${id}`);
}

// Fragen
const fragen = new Map();
for (const f of yamlFiles('fragen')) {
  const file = `fragen/${f}`;
  let data;
  try {
    data = parse(readFileSync(join(root, 'fragen', f), 'utf8'));
  } catch (e) {
    err(file, `YAML-Fehler: ${e.message}`);
    continue;
  }
  const id = basename(f, '.yaml');
  fragen.set(id, data);
  if (!bereiche.has(data.bereich)) err(file, `Unbekannter Bereich: ${data.bereich}`);
  const optIds = (data.optionen ?? []).map((o) => o.id);
  if (new Set(optIds).size !== optIds.length) err(file, 'Options-IDs doppelt');
  for (const reserved of ['unentschieden', 'egal']) if (optIds.includes(reserved)) err(file, `Options-ID „${reserved}“ ist reserviert`);
  for (const p of data.parteien ?? []) if (!optIds.includes(p.option)) err(file, `Partei ${p.partei}: unbekannte Option ${p.option}`);
  checkSources(file, data);
}
for (const [id, data] of fragen) {
  for (const v of data.verknuepft ?? []) {
    if (!fragen.has(v.frage)) err(`fragen/${id}.yaml`, `Verknüpfte Frage existiert nicht: ${v.frage}`);
    if (v.frage === id) err(`fragen/${id}.yaml`, 'Frage ist mit sich selbst verknüpft');
  }
}

// Spannungen
const spannungIds = new Set();
for (const f of yamlFiles('spannungen')) {
  const file = `spannungen/${f}`;
  const data = parse(readFileSync(join(root, 'spannungen', f), 'utf8'));
  for (const s of data.eintraege ?? []) {
    if (spannungIds.has(s.id)) err(file, `Spannung doppelt: ${s.id}`);
    spannungIds.add(s.id);
    for (const w of s.wenn ?? []) {
      const frage = fragen.get(w.frage);
      if (!frage) err(file, `${s.id}: Frage existiert nicht: ${w.frage}`);
      else if (!frage.optionen.some((o) => o.id === w.option)) err(file, `${s.id}: Option ${w.option} existiert nicht in ${w.frage}`);
    }
  }
}

// Systemkarte
for (const f of yamlFiles('system')) {
  const data = parse(readFileSync(join(root, 'system', f), 'utf8'));
  checkSources(`system/${f}`, data);
}

if (errors.length) {
  console.error(`✗ ${errors.length} Fehler in den Inhalten:\n` + errors.map((e) => '  - ' + e).join('\n'));
  process.exit(1);
}
console.log(`✓ Querverweise ok (${fragen.size} Fragen, ${spannungIds.size} Spannungen)`);
