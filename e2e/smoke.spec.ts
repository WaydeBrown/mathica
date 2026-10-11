import { test, expect } from '@playwright/test';

test('child onboarding on iPad and first question flow without menus', async ({ page }) => {
  await page.route('**/api/tutor', async (route) => {
    const body = route.request().postDataJSON();
    const json = body.action === 'question' ? { question: 'Vad är 3 + 4?', answer: '7' } : { correct: true, feedback: 'Bra!' };
    await route.fulfill({ json });
  });
  await page.goto('/');
  await page.getByLabel('Vad heter du?').fill('Elsa');
  await page.getByRole('button', { name: 'Kör!' }).click();
  await expect(page.getByText('Vad är 3 + 4?')).toBeVisible();
  await page.getByLabel('Ditt svar').fill('7');
  await page.getByRole('button', { name: 'Svara' }).click();
  await expect(page.getByText('Bra!')).toBeVisible();
});
