import { useState } from 'preact/hooks';

type Massnahme = {
  id: string;
  titel: string;
  option: string | null;
  optionTitel: string | null;
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

/**
 * Hebel-Rechner: Welche Maßnahmen schließen wie viel der Lücke?
 * Bewusst ohne Bewertung – er zeigt nur Größenordnungen und wer die Last trägt.
 */
export default function HebelRechner({ titel, einheit, ziel, massnahmen }: Props) {
  // gewählte Variante je Maßnahme (-1 = aus)
  const [wahl, setWahl] = useState<Record<string, number>>({});
  const aktiv = massnahmen
    .filter((m) => (wahl[m.id] ?? -1) >= 0)
    .map((m) => ({ m, v: m.varianten[wahl[m.id]!]! }));
  const summe = aktiv.reduce((s, a) => s + a.v.wirkung, 0);
  const anteil = Math.min(1, summe / ziel.wert);
  const ueberschuss = summe - ziel.wert;

  return (
    <section class="rounded-xl border border-line bg-surface p-3 sm:p-5" aria-label={titel}>
      <h3 class="serif text-lg font-semibold leading-snug">{titel}</h3>
      <p class="text-sm text-muted mt-1">
        {ziel.label}: <strong class="text-ink">rund {fmt.format(ziel.wert)} {einheit}</strong> (Stand {ziel.stand})
        <a href={`#quelle-${ziel.quelleId}`} class="src-ref">
          [{ziel.quelleNr}]
        </a>
        {ziel.hinweis && <span class="block text-xs text-faint mt-0.5">{ziel.hinweis}</span>}
      </p>

      {/* Fortschrittsbalken */}
      <div class="mt-4" aria-live="polite">
        <div class="relative h-7 rounded-md overflow-hidden" style={{ background: 'var(--surface-2)' }}>
          <div class="absolute inset-y-0 left-0 flex" style={{ width: `${anteil * 100}%`, transition: 'width .25s ease' }}>
            {aktiv.map(({ m, v }, i) => (
              <div
                key={m.id}
                title={`${m.titel}: ${fmt.format(v.wirkung)} ${einheit}`}
                style={{
                  flex: v.wirkung,
                  background: 'var(--accent)',
                  opacity: 1 - (i % 3) * 0.22,
                  borderRight: '2px solid var(--surface)',
                }}
              />
            ))}
          </div>
        </div>
        <div class="flex justify-between text-sm mt-1.5 gap-3">
          <span>
            Geschlossen: <strong class="tabular-nums">{fmt.format(summe)}</strong> von {fmt.format(ziel.wert)} {einheit}
          </span>
          <span class="tabular-nums text-muted">{Math.round((summe / ziel.wert) * 100)} %</span>
        </div>
        {ueberschuss > 0 && (
          <p class="text-sm text-muted mt-1">
            Das wäre {fmt.format(ueberschuss)} {einheit} mehr als nötig – Spielraum, um an anderer Stelle weniger zu tun.
          </p>
        )}
      </div>

      {/* Maßnahmen */}
      <ul class="mt-5 grid gap-3">
        {massnahmen.map((m) => {
          const w = wahl[m.id] ?? -1;
          return (
            <li key={m.id} class="rounded-lg border border-line p-2.5 sm:p-3">
              <div class="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
                <span class="font-semibold leading-snug">{m.titel}</span>
                {m.optionTitel && (
                  <a href={`#option-${m.option}`} class="text-xs rounded-md bg-surface-2 px-1.5 py-0.5 no-underline hover:underline">
                    gehört zu: {m.optionTitel}
                  </a>
                )}
              </div>
              <p class="text-sm text-muted mt-0.5">
                <span class="font-medium text-ink">Wer trägt die Last?</span> {m.wer_traegt}
              </p>
              <div class="flex flex-wrap gap-1.5 mt-2" role="group" aria-label={`${m.titel}: Umfang wählen`}>
                <button
                  type="button"
                  class="choice w-auto py-1.5 px-2.5 text-sm"
                  aria-pressed={w === -1}
                  onClick={() => setWahl({ ...wahl, [m.id]: -1 })}
                >
                  nicht
                </button>
                {m.varianten.map((v, i) => (
                  <button
                    key={v.label}
                    type="button"
                    class="choice w-auto py-1.5 px-2.5 text-sm"
                    aria-pressed={w === i}
                    onClick={() => setWahl({ ...wahl, [m.id]: i })}
                  >
                    {v.label} <span class="text-muted tabular-nums">· {fmt.format(v.wirkung)}</span>
                  </button>
                ))}
              </div>
              <p class="text-xs text-faint mt-2">
                <span class={`badge badge-${m.typ} mr-1`}>{m.typ === 'fakt' ? 'Fakt' : 'Schätzung'}</span>
                {m.hinweis}
                <a href={`#quelle-${m.quelleId}`} class="src-ref">
                  [{m.quelleNr}]
                </a>
              </p>
            </li>
          );
        })}
      </ul>

      <div class="mt-4 flex flex-wrap items-center justify-between gap-2">
        <p class="text-xs text-faint max-w-prose">
          Grobe Größenordnungen pro Jahr. Maßnahmen beeinflussen sich teils gegenseitig und lassen sich nicht exakt
          addieren. Der Rechner bewertet nichts – er zeigt nur, wie groß welcher Hebel ist und wer ihn bezahlt.
        </p>
        {aktiv.length > 0 && (
          <button type="button" class="btn btn-ghost text-sm py-1.5" onClick={() => setWahl({})}>
            Zurücksetzen
          </button>
        )}
      </div>
    </section>
  );
}
