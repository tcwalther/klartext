/**
 * Antworten werden ausschließlich im Browser gespeichert (localStorage).
 * Es gibt keinen Server, der Meinungen sieht.
 */
import { useEffect, useState } from 'preact/hooks';

export type Wahl = string; // Options-ID, 'unentschieden' oder 'egal'
export type Antwort = { wahl: Wahl; zeit: number };
export type Antworten = Record<string, Antwort>;
/** Wie tief wurde eine Frage erkundet? (höchste geöffnete Ebene) */
export type Tiefen = Record<string, number>;

const KEY_A = 'klartext:antworten:v1';
const KEY_T = 'klartext:tiefe:v1';
const EVENT = 'klartext:change';

function read<T>(key: string): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : ({} as T);
  } catch {
    return {} as T;
  }
}
function write(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* privater Modus o. Ä. – dann eben nur für diese Sitzung im Speicher */
  }
  window.dispatchEvent(new Event(EVENT));
}

export const leseAntworten = () => read<Antworten>(KEY_A);
export const leseTiefen = () => read<Tiefen>(KEY_T);

export function setzeAntwort(frageId: string, wahl: Wahl | null) {
  const a = leseAntworten();
  if (wahl === null) delete a[frageId];
  else a[frageId] = { wahl, zeit: Date.now() };
  write(KEY_A, a);
}

export function merkeTiefe(frageId: string, ebene: number) {
  const t = leseTiefen();
  if ((t[frageId] ?? 0) >= ebene) return;
  t[frageId] = ebene;
  write(KEY_T, t);
}

export function allesLoeschen() {
  try {
    localStorage.removeItem(KEY_A);
    localStorage.removeItem(KEY_T);
  } catch {
    /* ignorieren */
  }
  window.dispatchEvent(new Event(EVENT));
}

/** Preact-Hook: aktueller Stand, aktualisiert sich bei Änderungen (auch aus anderen Tabs). */
export function useAntworten() {
  const [state, setState] = useState<{ antworten: Antworten; tiefen: Tiefen; geladen: boolean }>({
    antworten: {},
    tiefen: {},
    geladen: false,
  });
  useEffect(() => {
    const sync = () => setState({ antworten: leseAntworten(), tiefen: leseTiefen(), geladen: true });
    sync();
    window.addEventListener(EVENT, sync);
    window.addEventListener('storage', sync);
    return () => {
      window.removeEventListener(EVENT, sync);
      window.removeEventListener('storage', sync);
    };
  }, []);
  return state;
}
