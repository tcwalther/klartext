import { useState } from 'preact/hooks';
import { allesLoeschen, useAntworten } from '../lib/antworten';
import type { FrageKurz, Spannung } from '../lib/content';
import { PARTEIEN } from '../lib/parteien';
import { buchstabe } from '../lib/optionen';
import TiefenringeKlein from './TiefenringeKlein';

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
        <h2 class="serif text-2xl font-semibold">Noch keine Antworten</h2>
        <p class="mt-2 text-muted max-w-prose">
          Sobald du einige Fragen beantwortet hast, erscheint hier eine Übersicht. Auch „Kann ich nicht entscheiden“ zählt
          als Antwort.
        </p>
        <a href="/gesundheit/fragen/" class="btn btn-primary mt-5">
          Mit den Fragen beginnen →
        </a>
      </div>
    );
  }

  const optionTitel = (f: FrageKurz, wahl: string) =>
    wahl === 'unentschieden' ? 'Noch unentschieden' : wahl === 'egal' ? 'Nicht wichtig' : (f.optionen.find((o) => o.id === wahl)?.titel ?? '–');

  const optionBuchstabe = (f: FrageKurz, wahl: string) => {
    const i = f.optionen.findIndex((o) => o.id === wahl);
    return i >= 0 ? buchstabe(i) : null;
  };
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
          <div class="border-t-2 border-ink pt-2" key={k.l}>
            <div class="serif text-3xl font-semibold tabular-nums">{k.n}</div>
            <div class="text-xs sm:text-sm text-muted leading-tight">{k.l}</div>
          </div>
        ))}
      </div>

      {/* Spannungen */}
      {aktiv.length > 0 && (
        <section>
          <h2 class="serif text-2xl font-semibold">Spannungen in deinem Bild</h2>
          <p class="text-muted mt-1 mb-4 max-w-prose">
            Manche deiner Antworten ziehen in verschiedene Richtungen. Das ist kein Fehler; fast jede politische Position
            muss solche Zielkonflikte auflösen.
          </p>
          <div class="grid gap-7">
            {aktiv.map((s) => (
              <article class="aussage aussage-wertung py-1" key={s.id}>
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
                  <span class="font-semibold text-ink">Wie sich beides verbinden lässt: </span>
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
          <h2 class="serif text-2xl font-semibold mb-4">Hier bist du noch unentschieden</h2>
          <ul class="border-t border-line">
            {offen.map((f) => (
              <li key={f.id} class="border-b border-line">
                <a href={`${f.url}#argumente`} class="group py-3 flex items-center gap-3 no-underline">
                  <span class="flex-1">
                    <span class="block font-semibold leading-snug group-hover:text-accent">{f.titel}</span>
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
        <div class="grid gap-7">
          {bereiche.map((b) => {
            const fs = fragen.filter((f) => f.bereich === b.id);
            return (
              <div key={b.id}>
                <h3 class="kicker mb-1">{b.titel}</h3>
                <ul class="border-t border-line">
                  {fs.map((f) => {
                    const a = antworten[f.id];
                    return (
                      <li key={f.id} class="border-b border-line">
                        <a href={f.url} class="group flex flex-col sm:flex-row sm:items-center gap-0.5 sm:gap-4 py-3 no-underline">
                          <span class="flex-1 flex items-start gap-2.5 text-[0.95rem] leading-snug group-hover:text-accent">
                            <span class="pt-0.5 shrink-0" title="Wie tief du gelesen hast">
                              <TiefenringeKlein anzahl={f.ringe} gelesen={Math.min(tiefen[f.id] ?? 0, f.ringe)} />
                            </span>
                            {f.titel}
                          </span>
                          <span
                            class={`inline-flex items-center gap-1.5 text-sm sm:justify-end sm:max-w-[45%] ${
                              !a ? 'text-faint' : a.wahl === 'unentschieden' || a.wahl === 'egal' ? 'text-muted italic' : 'font-semibold'
                            }`}
                          >
                            {a && optionBuchstabe(f, a.wahl) && <span class="opt opt-klein">{optionBuchstabe(f, a.wahl)}</span>}
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

      {/* Parteien-Abgleich: bewusst zurückhaltend und aufklappbar */}
      {(() => {
        const zeilen = PARTEIEN.map((partei) => {
          let gleich = 0;
          let vergleichbar = 0;
          for (const f of fragen) {
            const w = antworten[f.id]?.wahl;
            const p = f.parteien.find((x) => x.partei === partei);
            if (!w || w === 'unentschieden' || w === 'egal' || !p) continue;
            vergleichbar++;
            if (p.option === w) gleich++;
          }
          return { partei, gleich, vergleichbar };
        });
        if (zeilen.every((z) => z.vergleichbar === 0)) return null;
        return (
          <section>
            <details class="card p-4 sm:p-5 group/a">
              <summary class="cursor-pointer list-none flex items-center justify-between gap-3">
                <span class="serif text-lg font-semibold">Abgleich mit den Parteien</span>
                <span class="text-sm text-muted group-open/a:hidden">anzeigen</span>
              </summary>
              <p class="text-sm text-muted mt-2 mb-4">
                Gezählt werden nur Fragen, bei denen du eine Antwort gewählt hast und das Wahlprogramm 2025 einer Partei
                eindeutig ist. Das ist keine Wahlempfehlung. Die Programme äußern sich zu vielen Fragen gar nicht, und eine
                Wahlentscheidung hängt von weit mehr ab als vom Gesundheitssystem.
              </p>
              <ul class="grid gap-3">
                {zeilen.map((z) => (
                  <li key={z.partei} class="text-sm">
                    <div class="flex justify-between gap-3 mb-1">
                      <span class="font-semibold">{z.partei}</span>
                      <span class="text-muted tabular-nums">
                        {z.vergleichbar === 0 ? 'nicht vergleichbar' : `${z.gleich} von ${z.vergleichbar} übereinstimmend`}
                      </span>
                    </div>
                    <div class="h-2 rounded-full bg-surface-2 overflow-hidden" aria-hidden="true">
                      <div
                        class="h-full rounded-full"
                        style={{ width: z.vergleichbar ? `${(100 * z.gleich) / z.vergleichbar}%` : '0', background: 'var(--accent)' }}
                      />
                    </div>
                  </li>
                ))}
              </ul>
            </details>
          </section>
        );
      })()}

      <section class="card p-4 sm:p-5">
        <h2 class="serif text-lg font-semibold">Mit anderen vergleichen</h2>
        <p class="text-sm text-muted mt-1 mb-3">
          Kopiere deine Antworten als Text und vergleiche sie mit Freunden. Wo ihr unterschiedlicher Meinung seid, lohnt
          sich die Frage, ob ihr verschiedene Werte habt oder von unterschiedlichen Fakten ausgeht.
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
