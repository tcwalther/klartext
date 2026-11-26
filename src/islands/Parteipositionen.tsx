import { PARTEIEN } from '../lib/parteien';
import { buchstabe } from '../lib/optionen';
import type { FrageKurz } from '../lib/content';

type Props = {
  frage: Pick<FrageKurz, 'optionen' | 'parteien'>;
  wahl: string;
};

/**
 * Zeigt alle Parteien – auch die ohne eindeutige Aussage – mit wörtlichem Beleg.
 * Wird erst nach der eigenen Antwort eingeblendet.
 */
export default function Parteipositionen({ frage, wahl }: Props) {
  const optionTitel = (id: string) => frage.optionen.find((o) => o.id === id)?.titel ?? id;
  const optionBuchstabe = (id: string) => buchstabe(frage.optionen.findIndex((o) => o.id === id));

  return (
    <details class="mt-4 pt-3 border-t border-line group/p">
      <summary class="cursor-pointer list-none flex items-center justify-between gap-3 text-sm font-semibold">
        <span>Was sagen die Parteien?</span>
        <span class="text-xs font-normal text-muted group-open/p:hidden">anzeigen</span>
      </summary>
      <p class="text-xs text-muted mt-2 mb-3">
        Wörtliche Zitate aus den Wahlprogrammen zur Bundestagswahl 2025. Eine Partei wird einer Antwort nur zugeordnet,
        wenn ihr Programm eindeutig ist. Die Reihenfolge ist alphabetisch.
      </p>
      <ul class="border-t border-line">
        {PARTEIEN.map((partei) => {
          const p = frage.parteien.find((x) => x.partei === partei);
          const gleich = p && p.option === wahl;
          return (
            <li key={partei} class="border-b border-line py-3 text-sm">
              <div class="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-0.5">
                <span class="font-semibold">{partei}</span>
                <span class={`inline-flex items-center gap-1.5 ${p ? (gleich ? 'font-semibold text-accent' : 'font-medium') : 'text-faint italic'}`}>
                  {p && <span class="opt opt-klein">{optionBuchstabe(p.option)}</span>}
                  {p ? optionTitel(p.option) : 'keine eindeutige Aussage im Programm'}
                  {gleich && ' (wie du)'}
                </span>
              </div>
              {p && (
                <blockquote class="mt-1.5 zitat text-[0.98rem] text-muted leading-snug border-l-[3px] pl-2.5" style={{ borderColor: 'var(--position)' }}>
                  „{p.beleg}“
                  <span class="block font-sans text-xs text-faint mt-1">
                    {p.url ? (
                      <a href={p.url} target="_blank" rel="noopener" class="underline underline-offset-2 hover:text-ink">
                        {p.titel}
                      </a>
                    ) : (
                      p.titel
                    )}
                    , S. {p.seite}
                  </span>
                </blockquote>
              )}
            </li>
          );
        })}
      </ul>
    </details>
  );
}
