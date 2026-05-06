import { chromium } from '@playwright/test';

const STORAGE_PATH = './tests/auth/storageState.json';

export default async function globalSetup(config: any) {
  const browser = await chromium.launch();
  const context = await browser.newContext({
    baseURL: config.projects[0].use.baseURL,
  });

  const page = await context.newPage();

  const account = {
    username: 'zusam',
    password: 'zusam',
  };

  await page.goto('/login');
  await page.fill('#login', account.username);
  await page.fill('#password', account.password);
  await page.getByRole('button', { name: /Connect/i }).click();

  await page.waitForURL('**/groups/*');

  await context.storageState({ path: STORAGE_PATH });

  await browser.close();
}