import { test, expect } from "../fixtures/login";
import { getMe, addMessage, addGroup } from "../helpers/api";
import { scrollFeedUntilVisible } from "../helpers/common";

test("welcome message shows in group", async ({ authRequest, page }) => {
  const me = await getMe(authRequest);
  const groupId = me.groups.find(g => g.name === "zusam")?.id;

  await page.goto("/groups/" + groupId);
  const post = page.getByRole("link", { name: /Welcome to Zusam !/i });
  await scrollFeedUntilVisible(page, post);
});

test("new message button shows in group", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveURL(/\/groups\/.*/);
  await expect(page.locator(".write-button").first()).toBeVisible();
});

test("searching title finds the appropriate message", async ({ authRequest, page }) => {
  const me = await getMe(authRequest);
  const group = await addGroup(authRequest, { name: "Search group" });
  await page.goto("/groups/" + group.id);

  // Throw in some new posts to test with
  for (let i = 0; i < 10; i++) {
    console.log(i);
    await addMessage(authRequest, { meId: me.id, groupId: group.id, title: "Test searching post" + i, content: "Body of post" });
  }

  // Now add the one we want to find
  const message = await addMessage(authRequest, { meId: me.id, groupId: group.id, title: "Test searching post find term", content: "This is the post you're looking for" });

  // Search for it
  await page.locator("#search").fill("find term");
  await expect(page.locator("#search")).toHaveValue("find term");
  await page.click("button[type=\"submit\"]");

  // Check the serch result is as expected
  const preview = page.locator(".message-preview", { hasText: "This is the post you're looking for" });
  await expect(preview).toBeVisible();
  await expect(preview.locator(".card-miniature")).toBeVisible();
  await expect(preview.locator(".title")).toHaveText(["zusam", "Test searching post find term"]);
  await expect(preview.locator(".card-text")).toHaveText("This is the post you're looking for");

  // Click it to make sure it opens
  await preview.click();
  await expect(page).toHaveURL("/messages/" + message.id);
  await expect(page.locator(".message-body .title")).toContainText("Test searching post find term");

});

test("searching body finds the appropriate message", async ({ authRequest, page }) => {
  const me = await getMe(authRequest);
  const group = await addGroup(authRequest, { name: "Search group" });
  await page.goto("/groups/" + group.id);

  // Throw in some new posts to test with
  for (let i = 0; i < 10; i++) {
    console.log(i);
    await addMessage(authRequest, { meId: me.id, groupId: group.id, title: "Test searching post" + i, content: "Body of post" });
  }

  // Now add the one we want to find
  const message = await addMessage(authRequest, { meId: me.id, groupId: group.id, title: "Test searching post find me", content: "This is the post you're looking for" });

  await page.locator("#search").fill("post you're");
  await expect(page.locator("#search")).toHaveValue("post you're");
  await page.click("button[type=\"submit\"]");


  await expect(page.locator(".message-preview", { hasText: "This is the post you're looking for" })).toBeVisible();
});
