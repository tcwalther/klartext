import { setzeAntwort, useAntworten } from '../lib/antworten';
import type { FrageKurz } from '../lib/content';
import Parteipositionen from './Parteipositionen';
import { buchstabe } from '../lib/optionen';

type Props = {
  frage: Pick<FrageKurz, 'id' | 'optionen' | 'parteien'>;
  /** kompakt = am Ende der Seite („Und jetzt?“) */
  variante?: 'oben' | 'unten';
};

export default function AntwortBox({ frage, variante = 'oben' }: Props) {
  const { antworten, geladen } = useAntworten();
  const wahl = antworten[frage.id]?.wahl;

  const Choice = ({ id, titel, kurz, index }: { id: string; titel: string; kurz?: string; index?: number }) => (
    <button
      type="button"
      class={`choice ${index === undefined ? 'py-2.5 text-[0.95rem]' : ''}`}
      aria-pressed={wahl === id}
      onClick={() => setzeAntwort(frage.id, wahl === id ? null : id)}
    >
      {index === undefined ? (
        <span class="block font-medium leading-snug text-muted">{titel}</span>
      ) : (
        <span class="flex items-start gap-3">
          <span class="opt mt-px">{buchstabe(index)}</span>
          <span class="min-w-0">
            <span class="block font-semibold leading-snug">{titel}</span>
            {kurz && <span class="block text-sm text-muted leading-snug mt-0.5">{kurz}</span>}
          </span>
        </span>
      )}
    </button>
  );

  return (
    <section class="card p-4 sm:p-5" aria-label="Deine Einschätzung">
      <div class="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-0.5 mb-3">
        <h2 class="serif text-lg font-semibold">{variante === 'oben' ? 'Deine Einschätzung' : 'Und jetzt – wie siehst du es?'}</h2>
        {geladen && wahl && (
          <span class="text-xs text-muted">gespeichert in deinem Browser</span>
        )}
      </div>
      <div class="grid gap-2">
        {frage.optionen.map((o, i) => (
          <Choice key={o.id} id={o.id} index={i} titel={o.titel} kurz={variante === 'oben' ? o.kurz : undefined} />
        ))}
      </div>
      <div class="grid grid-cols-2 gap-2 mt-2">
        <Choice id="unentschieden" titel="Kann ich nicht entscheiden" />
        <Choice id="egal" titel="Ist mir nicht wichtig" />
      </div>
      {wahl === 'unentschieden' && variante === 'oben' && (
        <p class="mt-3 text-sm text-muted">
          Völlig in Ordnung. Unten kannst du Schicht für Schicht tiefer einsteigen – und später wiederkommen.
        </p>
      )}
      {wahl && <Parteipositionen frage={frage} wahl={wahl} />}
    </section>
  );
}
