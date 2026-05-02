import { test, expect } from "../fixtures/login";
import { getMe, addUser, addGroup, addMessage, getNotifications, bookmarkMessage } from "../helpers/api";
import { scrollFeedUntilVisible, createUserAndGetId } from "../helpers/common";

test("go to bookmarks page", async ({ authRequest, page }) => {
  // Start by adding a post and bookmarking it so we can be confident of the page contents
  const me = await getMe(authRequest);
  const group = await addGroup(authRequest, { name: "New group" });
  await page.goto("/groups/" + group.id);
  const message = await addMessage(authRequest, { meId: me.id, groupId: group.id, title: "Test this post is bookmarked", content: "To be bookmarked" });
  await bookmarkMessage(authRequest, { message_id: message.id });
  
  // Test the bookmark menu link works
  await page.locator("#profile-menu").click();
  await page.getByRole("link", { name: /Bookmarks/i }).click();
  await expect(page).toHaveURL("/bookmarks");
  await expect(page.locator("#group").locator("a[href=\"/messages/" + message.id + "\"]")).toBeVisible();
});

test("go to settings page", async ({ authRequest, page }) => {
  const me = await getMe(authRequest);

  await page.goto("/");
  await page.locator("#profile-menu").click();
  const settingsLink = page.getByRole("link", { name: /Settings/i });
  await expect(settingsLink).not.toHaveAttribute("href", /undefined/);
  await settingsLink.click();

  await expect(page).toHaveURL("/users/" + me.id + "/settings");
  await expect(page.getByRole("button", { name: /Delete your account/i })).toBeVisible();
});


test("Log out", async ({ page }) => {
  await page.goto("/");
  await page.locator("#profile-menu").click();
  await page.getByRole("link", { name: /Log Out/i }).click();
  await expect(page).toHaveURL("/login");
  await expect(page.getByRole("button", { name: /Connect/i })).toBeVisible();
});

test("Check notifications", async ({ authRequest, page, baseURL }) => {
  const me = await getMe(authRequest);
  const groupId = me.groups.find(g => g.name === "zusam")?.id;


  if (!groupId) {
    throw new Error("Group 'zusam' not found");
  }

  // Add a user to generate a notification
  const name = "new user " + Date.now();

  // Creating a user doesn't return a user ID so we need to do a /me request with the returned API key
  const user1 = await createUserAndGetId(
    authRequest,
    baseURL ?? "",
    { login: name, groupId }
  );
  // And a second one so we have multiple notificcations
  await addUser(authRequest, { login: name + " 2", groupId });

  // Wait for notifications to be added
  await expect.poll(async () => {
    const notifications = await getNotifications(authRequest);
    return notifications.some(n =>
      n.type === "user_joined_group" &&
      n.fromUser.id === user1.id &&
      n.target === groupId
    );
  }).toBe(true);

  await page.goto("/feed");
  await page.locator(".menu.dropdown:has(a.notification)").click();
  await expect(page.locator(".notifications-menu").getByText(name + " has joined zusam")).toBeVisible();
  await page.locator(".notifications-menu").getByText(name + " has joined zusam").click();
  await expect(page).toHaveURL("/groups/" + groupId);

  await expect(page.locator(".menu.dropdown:has(a.notification)")).toBeVisible();
  await page.getByTitle(/Notifications/i).click();
  await page.locator(".notifications-menu").getByText("Mark All As Read").click();

  await expect(page.locator(".menu.dropdown:has(a.notification)")).toBeVisible();
  await page.getByTitle(/Notifications/i).click();
  await expect(page.locator(".notifications-menu").getByText(name + " has joined zusam")).toBeVisible();
  await expect(page.locator(".notifications-menu").getByText("Mark All As Read")).toBeVisible();

  const notification = page.locator(".notifications-menu .notification", { hasText: `${name} has joined zusam` });
  await notification.locator(".options.dropdown").click();
  await notification.getByText("Delete").click();
  await expect(notification).not.toBeVisible();
});

test("Check feed button works", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveURL(/\/groups\/.*/);
  await page.getByTitle(/My Feed/i).click();
  await expect(page).toHaveURL("/feed");
  const post = page.getByRole("link", { name: /Welcome to Zusam !/i });
  await scrollFeedUntilVisible(page, post);
});


test("group list works", async ({ authRequest, page }) => {
  const me = await getMe(authRequest);
  const groupId = me.groups.find(g => g.name === "zusam")?.id;
  await page.goto("/groups/" + groupId);

  await page.locator(".nav-link.dropdown.groups .unselectable.pr-1").getByText(/Groups/i).click();

  await page.getByRole("link", { name: /Create a group/i }).click();

  await expect(page).toHaveURL("/create-group");
  await expect(page.getByRole("button", { name: /Create the group/i })).toBeVisible();

  await page.locator(".nav-link.dropdown.groups .unselectable.pr-1").getByText(/Groups/i).click();
  await page.getByRole("link", { name: /zusam/i }).click();

  await expect(page).toHaveURL("/groups/" + groupId);
});

test("search triggers", async ({ authRequest, page }) => {
  const me = await getMe(authRequest);
  const groupId = me.groups.find(g => g.name === "zusam")?.id;
  await page.goto("/groups/" + groupId);
  await expect(page.locator(".navbar-block .unselectable.pr-1")).toHaveText(/Groups/);
  await page.locator("#search").fill("Welcome");
  await expect(page.locator("#search")).toHaveValue("Welcome");
  await page.click("button[type=\"submit\"]");


  await expect(page).toHaveURL("/groups/" + groupId + "/search?q=Welcome");
  await expect(page.locator(".message-preview", { hasText: "This is a simple message" })).toBeVisible();
});

