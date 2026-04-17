import { getMe, addUser } from "./api";
import { fetchAuthRequest } from "../fixtures/login";
import type { RequestFn } from "./api";

export async function scrollFeedUntilVisible(page, locator, maxScrolls = 20) {
  for (let i = 0; i < maxScrolls; i++) {
    if (await locator.isVisible()) {
      return;
    }
    await page.mouse.wheel(0, 2000);
    await locator.waitFor({ state: "visible", timeout: 1000 }).catch(() => { });
  }

  throw new Error("Element not found after scrolling");
}



export async function createUserAndGetId(
  authRequest: RequestFn,
  baseURL: string,
  params: { login: string; groupId: string }
) {
  const { api_key } = await addUser(authRequest, params);

  const userRequest = fetchAuthRequest(api_key, baseURL);
  const me = await getMe(userRequest);

  return {
    apiKey: api_key,
    id: me.id,  
    me,
  };
}