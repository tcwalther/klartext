import { useState } from 'preact/hooks';

type Massnahme = {
  id: string;
  titel: string;
  option: string | null;
  optionTitel: string | null;
  optionBuchstabe: string | null;
  wer_traegt: string;
  varianten: { label: string; wirkung: number }[];
  typ: 'fakt' | 'schaetzung';
  quelleNr: number;
  quelleId: string;
  hinweis: string | null;
};

type Props = {
  titel: string;
  einheit: string;
  ziel: { label: string; wert: number; stand: string; quelleNr: number; quelleId: string; hinweis: string | null };
  massnahmen: Massnahme[];
};

const fmt = new Intl.NumberFormat('de-DE', { maximumFractionDigits: 1 });
/** Ohne eigene Wahl zeigt der Balken die mittlere Variante. */
const standardVariante = (m: Massnahme) => Math.floor((m.varianten.length - 1) / 2);

/**
 * Hebel-Rechner als Balkengrafik: oben die Lücke, darunter je Maßnahme ein Balken.
 * Ein Klick auf eine Zeile nimmt die Maßnahme in die Summe auf. Bewertet wird nichts.
 */
export default function HebelRechner({ titel, einheit, ziel, massnahmen }: Props) {
  const [an, setAn] = useState<Record<string, boolean>>({});
  const [variante, setVariante] = useState<Record<string, number>>({});

  const v = (m: Massnahme) => m.varianten[variante[m.id] ?? standardVariante(m)]!;
  const skala = Math.max(ziel.wert, ...massnahmen.flatMap((m) => m.varianten.map((x) => x.wirkung)));
  const breite = (wert: number) => `${Math.max(1.5, (wert / skala) * 100)}%`;

  const aktiv = massnahmen.filter((m) => an[m.id]);
  const summe = aktiv.reduce((s, m) => s + v(m).wirkung, 0);
  const anteil = Math.min(1, summe / ziel.wert);
  const ueberschuss = summe - ziel.wert;

  const zeile = 'grid grid-cols-[minmax(0,1fr)_3.25rem] sm:grid-cols-[minmax(0,15rem)_minmax(0,1fr)_3.25rem] gap-x-3 gap-y-1 items-center';

  return (
    <section class="rounded-xl border border-line bg-surface p-3 sm:p-5" aria-label={titel}>
      <h3 class="serif text-lg font-semibold leading-snug">{titel}</h3>
      <p class="text-sm text-muted mt-1 mb-4">
        Tippe auf eine Maßnahme, um sie einzurechnen. Werte in {einheit}.
      </p>

      {/* Die Lücke als Bezugsgröße */}
      <div class={`${zeile} pb-3 border-b border-ink`}>
        <span class="col-span-2 sm:col-span-1 font-semibold leading-snug">
          {ziel.label}
          <a href={`#quelle-${ziel.quelleId}`} class="src-ref">
            [{ziel.quelleNr}]
          </a>
        </span>
        <span class="h-4 rounded-[3px] border-[1.5px] border-ink" style={{ width: breite(ziel.wert), background: 'repeating-linear-gradient(45deg, var(--ink) 0 1.5px, transparent 1.5px 6px)' }} />
        <span class="text-right tabular-nums font-semibold">{fmt.format(ziel.wert)}</span>
      </div>

      <ul>
        {massnahmen.map((m) => {
          const ist = !!an[m.id];
          const aktuell = v(m);
          return (
            <li key={m.id} class="border-b border-line py-2.5">
              <button
                type="button"
                class={`${zeile} w-full text-left cursor-pointer group/zeile`}
                aria-pressed={ist}
                onClick={() => setAn({ ...an, [m.id]: !ist })}
              >
                <span class="col-span-2 sm:col-span-1 flex items-start gap-2 leading-snug min-w-0">
                  {m.optionBuchstabe && (
                    <span class="opt opt-klein mt-0.5" title={m.optionTitel ?? undefined}>
                      {m.optionBuchstabe}
                    </span>
                  )}
                  <span class={`min-w-0 ${ist ? 'font-semibold text-accent' : 'font-medium group-hover/zeile:text-accent'}`}>{m.titel}</span>
                </span>
                <span
                  class="h-4 rounded-r-[3px] transition-[width,background] duration-200"
                  style={{
                    width: breite(aktuell.wirkung),
                    background: ist ? 'var(--accent)' : 'var(--accent-soft)',
                    boxShadow: ist ? 'none' : 'inset 0 0 0 1.5px color-mix(in srgb, var(--accent) 45%, transparent)',
                  }}
                />
                <span class={`text-right tabular-nums ${ist ? 'font-semibold' : 'text-muted'}`}>{fmt.format(aktuell.wirkung)}</span>
              </button>
              <div class="sm:pl-[calc(1.15rem+0.5rem)] mt-1 text-xs text-muted leading-snug">
                {m.varianten.length > 1 && (
                  <span class="inline-flex flex-wrap gap-1 mr-2 align-middle" role="group" aria-label={`${m.titel}: Umfang`}>
                    {m.varianten.map((x, i) => {
                      const gewaehlt = (variante[m.id] ?? standardVariante(m)) === i;
                      return (
                        <button
                          key={x.label}
                          type="button"
                          aria-pressed={gewaehlt}
                          class={`rounded-full border px-2 py-0.5 ${gewaehlt ? 'border-accent text-accent font-semibold' : 'border-line hover:border-faint'}`}
                          onClick={() => {
                            setVariante({ ...variante, [m.id]: i });
                            setAn({ ...an, [m.id]: true });
                          }}
                        >
                          {x.label}
                        </button>
                      );
                    })}
                  </span>
                )}
                <span>Trägt die Last: {m.wer_traegt}</span>
                <span class="block mt-0.5 text-faint">
                  {m.typ === 'fakt' ? 'Fakt' : 'Schätzung'}
                  {m.hinweis && <>. {m.hinweis}</>}
                  <a href={`#quelle-${m.quelleId}`} class="src-ref">
                    [{m.quelleNr}]
                  </a>
                </span>
              </div>
            </li>
          );
        })}
      </ul>

      {/* Summe */}
      <div class="mt-4" aria-live="polite">
        <div class="flex justify-between text-sm gap-3 mb-1.5">
          <span>
            Ausgewählt: <strong class="tabular-nums">{fmt.format(summe)}</strong> von {fmt.format(ziel.wert)} {einheit}
          </span>
          <span class="tabular-nums text-muted whitespace-nowrap">{Math.round((summe / ziel.wert) * 100)} %</span>
        </div>
        <div class="relative h-3 rounded-full overflow-hidden" style={{ background: 'var(--surface-2)' }}>
          <div class="absolute inset-y-0 left-0 rounded-full transition-[width] duration-200" style={{ width: `${anteil * 100}%`, background: 'var(--accent)' }} />
        </div>
        {ueberschuss > 0 && (
          <p class="text-sm text-muted mt-1.5">
            Das wären {fmt.format(ueberschuss)} {einheit} mehr als nötig; an anderer Stelle könnte entsprechend weniger
            geschehen.
          </p>
        )}
      </div>

      <div class="mt-4 flex flex-wrap items-center justify-between gap-2">
        <p class="text-xs text-faint max-w-prose">
          {ziel.hinweis ? `${ziel.hinweis} ` : ''}Weil sich manche Maßnahmen gegenseitig beeinflussen, lassen sich die
          Beträge nicht genau addieren.
        </p>
        {aktiv.length > 0 && (
          <button
            type="button"
            class="btn btn-ghost text-sm py-1.5"
            onClick={() => {
              setAn({});
              setVariante({});
            }}
          >
            Zurücksetzen
          </button>
        )}
      </div>
    </section>
  );
}
