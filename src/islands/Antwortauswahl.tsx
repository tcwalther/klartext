import { useRef } from 'preact/hooks';
import { buchstabe } from '../lib/optionen';

export type Art = 'klick' | 'pfeiltaste';

type Props = {
  /** eindeutiger Name der Optionsgruppe auf der Seite */
  name: string;
  legende: string;
  /** Legende nur für Screenreader (wenn eine sichtbare Überschrift schon dasselbe sagt) */
  legendeVersteckt?: boolean;
  optionen: { id: string; titel: string }[];
  wahl: string | undefined;
  /** art = 'pfeiltaste', wenn die Auswahl nur per Pfeiltaste innerhalb der Gruppe gewechselt wurde */
  onWahl: (id: string, art: Art) => void;
  onZuruecksetzen?: () => void;
};

const NEBEN = [
  { id: 'unentschieden', titel: 'Ich kann mich noch nicht entscheiden' },
  { id: 'egal', titel: 'Ist mir nicht wichtig' },
];

/**
 * Antwortauswahl mit echten Optionsfeldern (fieldset/legend, input type=radio).
 * Pfeiltasten wechseln innerhalb der Gruppe, Screenreader erkennen die Gruppe als solche.
 */
export default function Antwortauswahl({ name, legende, legendeVersteckt, optionen, wahl, onWahl, onZuruecksetzen }: Props) {
  // Merkt sich, ob die nächste Änderung von einer Pfeiltaste kommt.
  const letzteTaste = useRef<Art>('klick');

  const feld = (id: string) => ({
    type: 'radio' as const,
    name,
    value: id,
    checked: wahl === id,
    class: 'sr-only',
    onKeyDown: (e: KeyboardEvent) => {
      letzteTaste.current = e.key.startsWith('Arrow') ? 'pfeiltaste' : 'klick';
    },
    onPointerDown: () => {
      letzteTaste.current = 'klick';
    },
    onChange: () => {
      onWahl(id, letzteTaste.current);
      letzteTaste.current = 'klick';
    },
  });

  return (
    <fieldset class="wahl-gruppe">
      <legend class={legendeVersteckt ? 'sr-only' : 'serif text-lg font-semibold mb-2'}>{legende}</legend>
      <div class="border-t border-line">
        {optionen.map((o, i) => (
          <label key={o.id} class="wahl">
            <input {...feld(o.id)} />
            <span class="wahl-kreis" aria-hidden="true">
              {buchstabe(i)}
            </span>
            <span class="wahl-text">
              <span class="wahl-titel">{o.titel}</span>
            </span>
          </label>
        ))}
      </div>
      <div class="text-sm text-muted pt-3 pb-1">oder</div>
      <div class="flex flex-col">
        {NEBEN.map((o) => (
          <label key={o.id} class="wahl wahl-klein">
            <input {...feld(o.id)} />
            <span class="wahl-kreis" aria-hidden="true" />
            <span class="wahl-text">
              <span class="wahl-titel">{o.titel}</span>
            </span>
          </label>
        ))}
      </div>
      {wahl && onZuruecksetzen && (
        <button type="button" class="mt-2 text-sm text-muted underline underline-offset-2 hover:text-ink" onClick={onZuruecksetzen}>
          Antwort zurücksetzen
        </button>
      )}
    </fieldset>
  );
}
