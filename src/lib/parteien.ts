/**
 * Parteien im Bundestag (21. Wahlperiode), alphabetisch – bewusst ohne Rangfolge.
 * Grundlage der Zuordnungen: Wahlprogramme zur Bundestagswahl 2025.
 */
export const PARTEIEN = ['AfD', 'CDU/CSU', 'Die Linke', 'Grüne', 'SPD'] as const;
export type Partei = (typeof PARTEIEN)[number];
