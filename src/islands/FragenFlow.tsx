import { useEffect, useMemo, useRef, useState } from 'preact/hooks';
import { setzeAntwort, useAntworten } from '../lib/antworten';
import type { FrageKurz } from '../lib/content';
import Antwortauswahl, { type Art } from './Antwortauswahl';

type Props = {
  fragen: FrageKurz[];
  bereiche: { id: string; titel: string }[];
};

const label = { fakt: 'Fakt', schaetzung: 'Schätzung', wertung: 'Wertung', position: 'Position' } as const;

export default function FragenFlow({ fragen, bereiche }: Props) {
  const { antworten, geladen } = useAntworten();
  const [index, setIndex] = useState<number | null>(null);
  const [mehr, setMehr] = useState(false);
  const headingRef = useRef<HTMLHeadingElement>(null);

  // Startpunkt: ?frage=… oder ?bereich=… oder erste unbeantwortete Frage
  useEffect(() => {
    if (!geladen || index !== null) return;
    const p = new URLSearchParams(location.search);
    const byFrage = fragen.findIndex((f) => f.id === p.get('frage'));
    const byBereich = fragen.findIndex((f) => f.bereich === p.get('bereich'));
    const offen = fragen.findIndex((f) => !antworten[f.id]);
    setIndex(byFrage >= 0 ? byFrage : byBereich >= 0 ? byBereich : offen >= 0 ? offen : 0);
  }, [geladen]);

  const gehe = (i: number) => {
    setIndex(i);
    setMehr(false);
    if (i < fragen.length) history.replaceState(null, '', `?frage=${fragen[i]!.id}`);
    requestAnimationFrame(() => {
      headingRef.current?.focus({ preventScroll: true });
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  };

  const beantwortet = useMemo(() => fragen.filter((f) => antworten[f.id]).length, [antworten, fragen]);

  if (index === null) return <div class="card p-6 h-80 animate-pulse" aria-busy="true" />;

  // Abschluss
  if (index >= fragen.length) {
    const offen = fragen.filter((f) => antworten[f.id]?.wahl === 'unentschieden');
    const ohne = fragen.filter((f) => !antworten[f.id]);
    return (
      <div class="card p-6 sm:p-8">
        <h2 ref={headingRef} tabIndex={-1} class="serif text-2xl sm:text-3xl font-semibold">
          Ende der Fragen
        </h2>
        <p class="mt-3 text-muted max-w-prose">
          Du hast {beantwortet} von {fragen.length} Fragen beantwortet
          {offen.length > 0 && <>; bei {offen.length} bist du noch unentschieden. Gerade dort lohnt es sich, tiefer einzusteigen</>}.
        </p>
        <div class="mt-6 flex flex-wrap gap-2">
          <a href="/mein-bild/" class="btn btn-primary">
            Mein Bild ansehen →
          </a>
          {ohne.length > 0 && (
            <button type="button" class="btn btn-ghost" onClick={() => gehe(fragen.indexOf(ohne[0]!))}>
              Übersprungene Fragen ({ohne.length})
            </button>
          )}
        </div>
      </div>
    );
  }

  const f = fragen[index]!;
  const wahl = antworten[f.id]?.wahl;
  const bereich = bereiche.find((b) => b.id === f.bereich);

  const waehle = (id: string, art: Art = 'klick') => {
    setzeAntwort(f.id, id);
    if (id === 'unentschieden') {
      setMehr(true);
      return;
    }
    // Per Pfeiltaste nur die Auswahl wechseln, nicht sofort zur nächsten Frage springen
    if (art === 'klick') setTimeout(() => gehe(index + 1), 220);
  };

  return (
    <div>
      {/* Fortschritt: ein Segment pro Frage, gruppiert nach Bereich */}
      <div class="mb-4" aria-label={`Frage ${index + 1} von ${fragen.length}`}>
        <div class="flex items-baseline justify-between text-sm mb-2 gap-3">
          <span class="font-semibold truncate">{bereich?.titel}</span>
          <span class="text-muted tabular-nums shrink-0">
            {index + 1} / {fragen.length}
          </span>
        </div>
        <div class="flex gap-[3px]" aria-hidden="true">
          {fragen.map((q, i) => {
            const a = antworten[q.id]?.wahl;
            const neuerBereich = i > 0 && fragen[i - 1]!.bereich !== q.bereich;
            return (
              <button
                type="button"
                tabIndex={-1}
                onClick={() => gehe(i)}
                title={q.titel}
                class={`h-1.5 flex-1 rounded-full ${neuerBereich ? 'ml-1.5' : ''}`}
                style={{
                  background:
                    i === index ? 'var(--ink)' : a && a !== 'unentschieden' ? 'var(--accent)' : a ? 'var(--faint)' : 'var(--line)',
                }}
              />
            );
          })}
        </div>
      </div>

      <div class="card p-5 sm:p-7">
        {!f.kompakt && <div class="text-sm text-muted mb-1">{f.titel}</div>}
        <h2 ref={headingRef} tabIndex={-1} class="serif text-[1.4rem] sm:text-[1.7rem] font-semibold leading-snug outline-none">
          {f.kurzfrage ?? f.frage}
        </h2>

        <div class="mt-5">
          <Antwortauswahl
            key={f.id}
            name={`durchlauf-${f.id}`}
            legende={f.kurzfrage ?? f.frage}
            legendeVersteckt
            optionen={f.optionen.map((o) => ({ id: o.id, titel: o.titel }))}
            wahl={wahl}
            onWahl={waehle}
          />
          {wahl === 'unentschieden' && (
            <button type="button" class="mt-1 text-sm text-accent underline underline-offset-2" aria-expanded={mehr} onClick={() => setMehr(!mehr)}>
              {mehr ? 'Erklärung ausblenden' : 'Kurze Erklärung anzeigen'}
            </button>
          )}
        </div>

        {mehr && (
          <section class="mt-5 rounded-xl bg-surface-2 p-4 sm:p-5" aria-label={f.kompakt ? 'Kurz erklärt' : 'Worum geht’s?'}>
            <h3 class="serif text-lg font-semibold mb-3">{f.kompakt ? 'Kurz erklärt' : 'Worum geht’s?'}</h3>
            <ul class="space-y-4">
              {(f.kompakt ? f.kurzErklaert : f.erklaerung).map((a, i) => (
                <li key={i} class={`aussage aussage-${a.typ} leading-relaxed`} title={label[a.typ]}>
                  <span class="sr-only">{label[a.typ]}: </span>
                  <span class="aussage-text prose-k" dangerouslySetInnerHTML={{ __html: a.html }} />
                  {a.typ === 'position' && a.wer && <span class="aussage-wer">— {a.wer}</span>}
                  {a.genau && (
                    <details class="genau mt-1.5 text-sm">
                      <summary class="cursor-pointer text-accent select-none w-fit">Genaue Zahlen</summary>
                      <div class="mt-1 rounded-md bg-surface px-3 py-2 text-muted prose-k" dangerouslySetInnerHTML={{ __html: a.genau }} />
                    </details>
                  )}
                </li>
              ))}
            </ul>
            <a href={`${f.url}#${f.kompakt ? 'verstehen' : f.zusammenhaenge ? 'zusammenhaenge' : 'argumente'}`} class="btn btn-primary mt-4">
              {f.kompakt ? 'Verstehen in 10 Minuten →' : 'Ausführlich zu dieser Frage →'}
            </a>
            <p class="text-xs text-muted mt-2">Dort findest du auch die Quellen zu allen Aussagen.</p>
          </section>
        )}

        <div class="mt-6 grid grid-cols-2 sm:flex sm:items-center sm:justify-between gap-2 text-sm">
          <button type="button" class="btn btn-ghost whitespace-nowrap disabled:opacity-40" disabled={index === 0} onClick={() => gehe(index - 1)}>
            ← Zurück
          </button>
          <a href={f.url} class="order-last col-span-2 sm:order-none text-muted hover:text-ink underline underline-offset-2 text-center py-1">
            Alles zu dieser Frage
          </a>
          <button type="button" class="btn btn-ghost whitespace-nowrap" onClick={() => gehe(index + 1)}>
            {wahl ? 'Weiter' : 'Überspringen'} →
          </button>
        </div>
      </div>
    </div>
  );
}
