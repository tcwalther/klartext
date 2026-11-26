/**
 * Geometrie der Tiefenringe: ein Ring je Ebene, außen Ebene 1, innen die tiefste.
 * Bild für die Schichten der Zwiebel. viewBox 0 0 24 24.
 */
export function ringe(anzahl: number) {
  const R = 11.25;
  const schritt = R / anzahl;
  return Array.from({ length: anzahl }, (_, i) => {
    const innen = i === anzahl - 1;
    return innen
      ? { i, r: schritt * 0.62, breite: 0, scheibe: true }
      : { i, r: R - i * schritt - schritt / 2, breite: schritt * 0.62, scheibe: false };
  });
}
