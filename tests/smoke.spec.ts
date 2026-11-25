import { test, expect } from '@playwright/test';

const seiten = ['/', '/gesundheit/', '/gesundheit/fragen/', '/mein-bild/', '/methodik/', '/quellen/'];

for (const pfad of seiten) {
  test(`${pfad} lädt ohne Fehler und ohne horizontales Scrollen`, async ({ page }) => {
    const fehler: string[] = [];
    page.on('pageerror', (e) => fehler.push(e.message));
    await page.goto(pfad);
    await expect(page.locator('h1, h2').first()).toBeVisible();
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    expect(overflow).toBeLessThanOrEqual(0);
    expect(fehler).toEqual([]);
  });
}

test('alle Fragen-Detailseiten laden, Ebene 1 ist offen', async ({ page }) => {
  await page.goto('/gesundheit/');
  const links = await page.locator('#bereiche a[href^="/gesundheit/"]:not([href*="fragen"])').evaluateAll((as) =>
    as.map((a) => a.getAttribute('href')!),
  );
  expect(links.length).toBeGreaterThan(0);
  for (const href of links) {
    await page.goto(href);
    await expect(page.locator('#worum-gehts')).toHaveAttribute('open', '');
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    expect(overflow, href).toBeLessThanOrEqual(0);
  }
});

test('Durchlauf: unentschieden → tiefer → entscheiden → Mein Bild', async ({ page }) => {
  await page.goto('/gesundheit/fragen/');
  const frage = await page.locator('h2').first().innerText();

  await page.getByRole('button', { name: /Kann ich nicht entscheiden/ }).click();
  await expect(page.getByRole('heading', { name: 'Worum geht’s?' })).toBeVisible();

  await page.getByRole('link', { name: /Tiefer einsteigen/ }).click();
  await expect(page).toHaveURL(/#argumente$/);
  await expect(page.locator('#argumente')).toHaveAttribute('open', '');

  // Quelle anklicken öffnet die Quellen-Ebene
  const ref = page.locator('#argumente .src-ref, #worum-gehts .src-ref').first();
  if (await ref.count()) {
    await ref.click();
    await expect(page.locator('#quellen')).toHaveAttribute('open', '');
  }

  // Entscheiden: erste echte Option in der oberen Antwortbox
  const box = page.getByRole('region', { name: 'Deine Einschätzung' }).first();
  const option = box.locator('button.choice').first();
  await option.click();
  await expect(option).toHaveAttribute('aria-pressed', 'true');

  await page.goto('/mein-bild/');
  await expect(page.getByText('mit Position')).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Deine Antworten' })).toBeVisible();
  expect(frage.length).toBeGreaterThan(0);
});
