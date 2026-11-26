import { ringe } from '../lib/ringe';

/** Kleine Tiefenringe für Listen: die äußeren `gelesen` Ringe sind gefüllt. */
export default function TiefenringeKlein({ anzahl, gelesen, groesse = 18 }: { anzahl: number; gelesen: number; groesse?: number }) {
  const geo = ringe(Math.max(1, anzahl));
  return (
    <svg width={groesse} height={groesse} viewBox="0 0 24 24" role="img" aria-label={`${Math.min(gelesen, anzahl)} von ${anzahl} Ebenen gelesen`}>
      {geo.map((g) => {
        const farbe = g.i < gelesen ? 'var(--ink)' : 'var(--line)';
        return g.scheibe ? (
          <circle key={g.i} cx="12" cy="12" r={g.r} fill={farbe} />
        ) : (
          <circle key={g.i} cx="12" cy="12" r={g.r} fill="none" stroke={farbe} stroke-width={g.breite} />
        );
      })}
    </svg>
  );
}
