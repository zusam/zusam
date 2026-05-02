import { test as baseTest } from '@playwright/test';
import fs from 'fs';
import type { Page } from '@playwright/test';

export * from '@playwright/test';

const STORAGE_PATH = './tests/auth/storageState.json';

type Fixtures = {
  authRequest: ReturnType<typeof fetchAuthRequest>;
  apiKey: string;
  createUserPage: (apiKey: string) => Promise<Page>;
};

function getApiKey(storage: any): string | null {
  for (const origin of storage.origins || []) {
    const entry = origin.localStorage?.find((i: any) => i.name === 'apiKey');
    if (entry) {
      try {
        return JSON.parse(entry.value).data;
      } catch {
        return entry.value;
      }
    }
  }
  return null;
}

export function fetchAuthRequest(apiKey: string, baseURL: string) {
  return async function request(
    url: string,
    data?: any,
    method: string = 'GET'
  ) {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (apiKey) {
      headers['X-AUTH-TOKEN'] = apiKey;
    }

    const options: RequestInit = { method, headers };

    if (data) {
      options.body = JSON.stringify(data);
    }

    const res = await fetch(baseURL + url, options);

    if (!res.ok) {
      throw new Error(
        `${method} ${baseURL}${url} failed: ${res.status}`
      );
    }

    return res.status !== 204 ? res.json() : {};
  };
}

export const test = baseTest.extend<Fixtures>({
  page: async ({ browser }, use) => {
    const context = await browser.newContext({
      storageState: STORAGE_PATH,
    });

    const page = await context.newPage();
    await use(page);
    await context.close();
  },

  apiKey: async ({ }, use) => {
    const storage = JSON.parse(
      fs.readFileSync(STORAGE_PATH, 'utf-8')
    );

    const apiKey = getApiKey(storage);

    if (!apiKey) {
      throw new Error('No apiKey found in storageState');
    }

    await use(apiKey);
  },

  authRequest: async ({ baseURL, apiKey }, use) => {
    await use(fetchAuthRequest(apiKey, baseURL ?? ''));
  },

createUserPage: async ({ browser, baseURL }, use) => {
  await use(async (apiKey: string) => {
    const context = await browser.newContext({
      storageState: {
        cookies: [],
        origins: [
          {
            origin: baseURL!,
            localStorage: [
              {
                name: "apiKey",
                value: JSON.stringify({ data: apiKey }),
              },
            ],
          },
        ],
      },
    });

    const page = await context.newPage();
    return page;
  });
},
});