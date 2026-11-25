/** Zentrale Einstellungen. */
export const SITE = {
  name: 'Klartext',
  claim: 'Politik verstehen, bevor man sie bewertet.',
  /**
   * Link zu einem Feedback-Formular (z. B. Tally oder Google Forms).
   * Der Abschnitt wird als Parameter `abschnitt` angehängt.
   * Leer lassen, dann werden keine Feedback-Links angezeigt.
   */
  feedbackUrl: '',
  version: '0.1',
};

export function feedbackLink(abschnitt: string) {
  if (!SITE.feedbackUrl) return null;
  const u = new URL(SITE.feedbackUrl);
  u.searchParams.set('abschnitt', abschnitt);
  return u.toString();
}
