import { setzeAntwort, useAntworten } from '../lib/antworten';
import type { FrageKurz } from '../lib/content';

type Props = {
  frage: Pick<FrageKurz, 'id' | 'optionen' | 'parteien'>;
  /** kompakt = am Ende der Seite („Und jetzt?“) */
  variante?: 'oben' | 'unten';
};

export default function AntwortBox({ frage, variante = 'oben' }: Props) {
  const { antworten, geladen } = useAntworten();
  const wahl = antworten[frage.id]?.wahl;
  const gewaehlteOption = frage.optionen.find((o) => o.id === wahl);

  const Choice = ({ id, titel, kurz }: { id: string; titel: string; kurz?: string }) => (
    <button
      type="button"
      class="choice"
      aria-pressed={wahl === id}
      onClick={() => setzeAntwort(frage.id, wahl === id ? null : id)}
    >
      <span class="block font-semibold leading-snug">{titel}</span>
      {kurz && <span class="block text-sm text-muted leading-snug mt-0.5">{kurz}</span>}
    </button>
  );

  return (
    <section class="card p-4 sm:p-5" aria-label="Deine Einschätzung">
      <div class="flex items-baseline justify-between gap-3 mb-3">
        <h2 class="serif text-lg font-semibold">{variante === 'oben' ? 'Deine Einschätzung' : 'Und jetzt – wie siehst du es?'}</h2>
        {geladen && wahl && (
          <span class="text-xs text-muted">gespeichert in deinem Browser</span>
        )}
      </div>
      <div class="grid gap-2">
        {frage.optionen.map((o) => (
          <Choice key={o.id} id={o.id} titel={o.titel} kurz={variante === 'oben' ? o.kurz : undefined} />
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
      {gewaehlteOption && frage.parteien.length > 0 && (
        <div class="mt-4 pt-3 border-t border-line text-sm">
          <div class="font-semibold mb-1">Parteien mit dieser Position</div>
          <p class="text-muted">
            {frage.parteien.filter((p) => p.option === wahl).map((p) => p.partei).join(', ') || 'Keine eindeutige Zuordnung.'}
          </p>
        </div>
      )}
    </section>
  );
}
