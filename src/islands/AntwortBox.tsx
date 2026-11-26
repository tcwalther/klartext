import { setzeAntwort, useAntworten } from '../lib/antworten';
import type { FrageKurz } from '../lib/content';
import Antwortauswahl from './Antwortauswahl';
import Parteipositionen from './Parteipositionen';

type Props = {
  frage: Pick<FrageKurz, 'id' | 'optionen' | 'parteien'>;
  /** „unten“ = am Ende der Seite, ohne Kurztexte */
  variante?: 'oben' | 'unten';
};

export default function AntwortBox({ frage, variante = 'oben' }: Props) {
  const { antworten, geladen } = useAntworten();
  const wahl = antworten[frage.id]?.wahl;
  const titel = variante === 'oben' ? 'Deine Einschätzung' : 'Wie siehst du es jetzt?';

  return (
    <section class="card px-4 pt-4 pb-3 sm:px-6 sm:pt-5" aria-label={titel}>
      <div class="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-0.5 mb-2">
        <h2 class="serif text-lg font-semibold" aria-hidden="true">
          {titel}
        </h2>
        {geladen && wahl && <span class="text-xs text-muted">gespeichert in deinem Browser</span>}
      </div>
      <Antwortauswahl
        name={`antwort-${frage.id}-${variante}`}
        legende={titel}
        legendeVersteckt
        optionen={frage.optionen.map((o) => ({ id: o.id, titel: o.titel, kurz: variante === 'oben' ? o.kurz : undefined }))}
        wahl={wahl}
        onWahl={(id) => setzeAntwort(frage.id, id)}
        onZuruecksetzen={() => setzeAntwort(frage.id, null)}
      />
      {wahl === 'unentschieden' && variante === 'oben' && (
        <p class="mt-3 text-sm text-muted">
          Weiter unten findest du Erklärungen, Argumente und Zahlen zu dieser Frage. Deine Antwort kannst du jederzeit ändern.
        </p>
      )}
      {wahl && <Parteipositionen frage={frage} wahl={wahl} />}
    </section>
  );
}
