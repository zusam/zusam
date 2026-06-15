import { test, expect } from "../../fixtures/login";
import { scrollFeedUntilVisible } from "../../helpers/common";

test("welcome message shows in feed", async ({ page }) => {
  await page.goto("/feed");

  const post = page.getByRole("link", { name: /Welcome to Zusam !/i });
  await scrollFeedUntilVisible(page, post);
  await post.click();
  await page.waitForURL("**/messages/*");

  await expect(page.locator(".message-body .title").getByText("Welcome to Zusam !")).toBeVisible();
});

test("new message button shows in feed", async ({ page }) => {
  await page.goto("/feed");
  await expect(page.locator(".write-button").first()).toBeVisible();
});