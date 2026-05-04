import { test, expect } from "../../fixtures/login";
import { getMe, addMessage, addGroup } from "../../helpers/api";
import { mockDefaultLang } from "../../helpers/api";

// Our default setup uses French as a default. But we don't want that for these tests,
// so capture the API response and modify it to English for each test in this file
test.beforeEach(async ({ page }) => {
  await mockDefaultLang(page);
});

test("upload photos or videos is disabled", async ({ page }) => {
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

test("adding and removing an emoji", async ({ authRequest, page }) => {
  const me = await getMe(authRequest);
  const group = await addGroup(authRequest, { name: "New group" });

  // Throw in a new post to test on
  const message = await addMessage(authRequest, { meId: me.id, groupId: group.id, title: "Test public message", content: "Test message shared publically" });
  await page.goto("/messages/" + message.id);

  // Add an emoji
  await page.locator(".message-footer").getByText("React").click();
  await page.getByRole("list", { name: "Reactions" }).getByRole("button", { name: /red heart/i }).click();
  const emoji = page.locator(".reaction-emoji");
  await expect(emoji).toContainText("❤️1");

  // Check it stays after a page reload
  await page.reload();
  await expect(emoji).toContainText("❤️1");

  // Very basic tooltip content check
  await emoji.hover();
  const tooltip = emoji.locator(".reaction-tooltip");
  await expect(tooltip).toHaveText("❤️ red heartzusam");

  // Check that clicking the emoji deletes it
  await emoji.click();
  await expect(emoji).not.toBeVisible();

  // Check it's still gone after a page reload
  await page.reload();
  await expect(page.locator(".message-footer").getByText("React")).toBeVisible();
  await expect(emoji).not.toBeVisible();
});