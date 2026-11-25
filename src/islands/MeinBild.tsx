import { useState } from 'preact/hooks';
import { allesLoeschen, useAntworten } from '../lib/antworten';
import type { FrageKurz, Spannung } from '../lib/content';

type Props = {
  fragen: FrageKurz[];
  bereiche: { id: string; titel: string }[];
  spannungen: Spannung[];
};

export default function MeinBild({ fragen, bereiche, spannungen }: Props) {
  const { antworten, tiefen, geladen } = useAntworten();
  const [kopiert, setKopiert] = useState(false);

  if (!geladen) return <div class="card p-6 h-64 animate-pulse" aria-busy="true" />;

  const beantwortet = fragen.filter((f) => antworten[f.id]);
  if (beantwortet.length === 0) {
    return (
      <div class="card p-6 sm:p-8">
        <h2 class="serif text-2xl font-semibold">Noch leer</h2>
        <p class="mt-2 text-muted max-w-prose">
          Hier entsteht dein Bild, sobald du ein paar Fragen beantwortet hast – auch „kann ich nicht entscheiden“ zählt.
        </p>
        <a href="/gesundheit/fragen/" class="btn btn-primary mt-5">
          Mit den Fragen beginnen →
        </a>
      </div>
    );
  }

  const optionTitel = (f: FrageKurz, wahl: string) =>
    wahl === 'unentschieden' ? 'Noch unentschieden' : wahl === 'egal' ? 'Nicht wichtig' : (f.optionen.find((o) => o.id === wahl)?.titel ?? '–');

  const offen = fragen.filter((f) => antworten[f.id]?.wahl === 'unentschieden');
  const aktiv = spannungen.filter((s) => s.wenn.every((w) => antworten[w.frage]?.wahl === w.option));
  const vertieft = fragen.filter((f) => (tiefen[f.id] ?? 0) >= 2).length;
  const fragenById = new Map(fragen.map((f) => [f.id, f]));

  const alsText = () => {
    const zeilen = ['Mein Bild zum Gesundheitssystem (Klartext)', ''];
    for (const b of bereiche) {
      const fs = fragen.filter((f) => f.bereich === b.id && antworten[f.id]);
      if (!fs.length) continue;
      zeilen.push(`${b.titel}:`);
      for (const f of fs) zeilen.push(`- ${f.titel} → ${optionTitel(f, antworten[f.id]!.wahl)}`);
      zeilen.push('');
    }
    if (aktiv.length) {
      zeilen.push('Spannungen, über die ich nachdenke:');
      for (const s of aktiv) zeilen.push(`- ${s.titel}`);
    }
    return zeilen.join('\n');
  };

  const kopieren = async () => {
    try {
      await navigator.clipboard.writeText(alsText());
      setKopiert(true);
      setTimeout(() => setKopiert(false), 2000);
    } catch {
      /* Zwischenablage nicht verfügbar */
    }
  };

  return (
    <div class="grid gap-8">
      {/* Überblick */}
      <div class="grid grid-cols-3 gap-2 sm:gap-3">
        {[
          { n: beantwortet.length - offen.length, l: 'mit Position' },
          { n: offen.length, l: 'noch offen' },
          { n: vertieft, l: 'vertieft gelesen' },
        ].map((k) => (
          <div class="card p-3 sm:p-4" key={k.l}>
            <div class="serif text-2xl sm:text-3xl font-semibold tabular-nums">{k.n}</div>
            <div class="text-xs sm:text-sm text-muted leading-tight">{k.l}</div>
          </div>
        ))}
      </div>

      {/* Spannungen */}
      {aktiv.length > 0 && (
        <section>
          <h2 class="serif text-2xl font-semibold">Spannungen in deinem Bild</h2>
          <p class="text-muted mt-1 mb-4 max-w-prose">
            Manche Antworten ziehen in verschiedene Richtungen. Das ist normal – fast jede politische Position muss
            solche Spannungen auflösen. Genau hier lohnt sich das Gespräch.
          </p>
          <div class="grid gap-3">
            {aktiv.map((s) => (
              <article class="card p-4 sm:p-5" key={s.id}>
                <h3 class="serif text-lg font-semibold leading-snug">{s.titel}</h3>
                <ul class="mt-2 mb-3 flex flex-wrap gap-1.5 text-xs">
                  {s.wenn.map((w) => {
                    const f = fragenById.get(w.frage);
                    return f ? (
                      <li key={w.frage}>
                        <a href={f.url} class="inline-block rounded-md bg-surface-2 px-2 py-1 no-underline hover:underline">
                          {f.titel}: <strong>{optionTitel(f, w.option)}</strong>
                        </a>
                      </li>
                    ) : null;
                  })}
                </ul>
                <p class="leading-relaxed">{s.text}</p>
                <p class="mt-2 text-sm text-muted leading-relaxed">
                  <span class="font-semibold text-ink">Wie beides zusammengehen kann: </span>
                  {s.aufloesung}
                </p>
              </article>
            ))}
          </div>
        </section>
      )}

      {/* Offene Fragen */}
      {offen.length > 0 && (
        <section>
          <h2 class="serif text-2xl font-semibold">Hier bist du noch unentschieden</h2>
          <p class="text-muted mt-1 mb-4">Guter Startpunkt, um tiefer einzusteigen.</p>
          <ul class="grid gap-2">
            {offen.map((f) => (
              <li key={f.id}>
                <a href={`${f.url}#argumente`} class="card p-4 flex items-center gap-3 no-underline hover:border-faint">
                  <span class="flex-1">
                    <span class="block font-semibold leading-snug">{f.titel}</span>
                    <span class="block text-sm text-muted">
                      {(tiefen[f.id] ?? 0) >= 2 ? `Bis Ebene ${tiefen[f.id]} gelesen` : 'Noch nicht vertieft'}
                    </span>
                  </span>
                  <span class="text-accent" aria-hidden="true">
                    →
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Alle Antworten nach Bereich */}
      <section>
        <h2 class="serif text-2xl font-semibold mb-4">Deine Antworten</h2>
        <div class="grid gap-5">
          {bereiche.map((b) => {
            const fs = fragen.filter((f) => f.bereich === b.id);
            return (
              <div key={b.id}>
                <h3 class="text-sm font-semibold uppercase tracking-wide text-faint mb-2">{b.titel}</h3>
                <ul class="card divide-y divide-[var(--line)]">
                  {fs.map((f) => {
                    const a = antworten[f.id];
                    return (
                      <li key={f.id}>
                        <a href={f.url} class="flex flex-col sm:flex-row sm:items-center gap-0.5 sm:gap-4 p-3 sm:px-4 no-underline hover:bg-surface-2/60">
                          <span class="flex-1 text-[0.95rem] leading-snug">{f.titel}</span>
                          <span
                            class={`text-sm sm:text-right sm:max-w-[45%] ${
                              !a ? 'text-faint' : a.wahl === 'unentschieden' || a.wahl === 'egal' ? 'text-muted italic' : 'font-semibold'
                            }`}
                          >
                            {a ? optionTitel(f, a.wahl) : 'nicht beantwortet'}
                          </span>
                        </a>
                      </li>
                    );
                  })}
                </ul>
              </div>
            );
          })}
        </div>
      </section>

      <section class="card p-4 sm:p-5">
        <h2 class="serif text-lg font-semibold">Ins Gespräch bringen</h2>
        <p class="text-sm text-muted mt-1 mb-3">
          Kopiere dein Bild als Text und vergleiche es mit Freunden: Wo liegt ihr auseinander – und liegt es an
          unterschiedlichen Werten oder an unterschiedlichen Annahmen über die Fakten?
        </p>
        <div class="flex flex-wrap gap-2">
          <button type="button" class="btn btn-primary" onClick={kopieren}>
            {kopiert ? 'Kopiert ✓' : 'Als Text kopieren'}
          </button>
          <button
            type="button"
            class="btn btn-ghost"
            onClick={() => confirm('Alle Antworten in diesem Browser löschen?') && allesLoeschen()}
          >
            Antworten löschen
          </button>
        </div>
      </section>
    </div>
  );
}
