import { test, expect } from "../../fixtures/login";
import { getMe, addMessage, addGroup } from "../../helpers/api";

test("upload photos or videos is disabled", async ({ authRequest, page }) => {
  await page.goto("/share");
  await expect(page.locator(".title-input")).toHaveAttribute("placeholder", "Title of your message (optional)");

  // Upload photo button not available
  await expect(page.getByRole("button", { name: "Add photos" })).not.toBeVisible();
  // Upload video
  await expect(page.getByRole("button", { name: "Add a video" })).not.toBeVisible();
});


test("creating public link", async ({ authRequest, page, browser }) => {
  const me = await getMe(authRequest);
  const group = await addGroup(authRequest, { name: "New group" });

  // Throw in a new post to test on
  const message = await addMessage(authRequest, { meId: me.id, groupId: group.id, title: "Test public message", content: "Test message shared publically" });
  await page.goto("/messages/" + message.id);

  // Check public link button is not visible
  let menu = page.locator(".message-footer .options.dropdown");
  await menu.click();
  await expect(menu.getByText("Public Link")).not.toBeVisible();

  // Check the public link URL shows an error
  await page.goto("/public/test-token");
  await expect(page.locator(".message-body")).toContainText("Public links are disabled");

  // Create a new, unauthenticated context
  const context = await browser.newContext();
  const anonPage = await context.newPage();

  // Check the public link URL shows an error when logged out
  await anonPage.goto("/public/test-token");
  await expect(anonPage.locator(".message-body")).toContainText("Public links are disabled");

  // Just test that the unauthenticated context is actually logged out, by trying to access the feed
  await anonPage.goto("/feed");
  await expect(anonPage).toHaveURL("/login");
});