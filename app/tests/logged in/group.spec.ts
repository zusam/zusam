import { test, expect } from "../fixtures/login";
import { getMe, addMessage, addGroup, getGroup } from "../helpers/api";
import { scrollFeedUntilVisible, createTestUser } from "../helpers/common";

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
    await addMessage(authRequest, { meId: me.id, groupId: group.id, title: "Test searching post" + i, content: "Body of post" });
  }

  // Now add the one we want to find
  const message = await addMessage(authRequest, { meId: me.id, groupId: group.id, title: "Test searching post find me", content: "This is the post you're looking for" });

  await page.locator("#search").fill("post you're");
  await expect(page.locator("#search")).toHaveValue("post you're");
  await page.click("button[type=\"submit\"]");


  await expect(page.locator(".message-preview", { hasText: "This is the post you're looking for" })).toBeVisible();
});


test("inviting to a group", async ({ authRequest, page, createUserPage, baseURL }) => {
  const me = await getMe(authRequest);
  const group = await addGroup(authRequest, { name: "Inviting test" });
  // Creating group doesn't return invite key, so need to request full group data to get it
  const { inviteKey } = await getGroup(authRequest, { groupId: group.id });
  const message = await addMessage(authRequest, { meId: me.id, groupId: group.id, title: "Invite group post", content: "Post body" });

  // Setup is done, now test with a new user
  const user = await createTestUser(authRequest, baseURL ?? "");
  const userPage = await createUserPage(user.apiKey);
  await userPage.goto(baseURL + "/invitation/" + inviteKey);

  await expect(userPage).toHaveURL("/groups/" + group.id);
  await expect(userPage.locator("a[href=\"/messages/" + message.id + "\"]")).toBeVisible();
});