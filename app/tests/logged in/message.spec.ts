import { test, expect } from "../fixtures/login";
import { getMe, addMessage, addGroup } from "../helpers/api";

test("posting a new message to a group from share page", async ({ authRequest, page }) => {
  const group = await addGroup(authRequest, { name: "New group" });

  await page.goto("/share");
  await expect(page.locator(".title-input")).toHaveAttribute("placeholder", "Title of your message (optional)");
  await expect(page.locator(".ql-editor")).toHaveAttribute("data-placeholder", "Write your message here");

  await page.locator("select[name=\"group_share_choice\"]").selectOption({ value: group.id });
  await page.locator(".title-input").fill("Title test");

  // Change format in body to Header 1. This is a smoke check to test QuillJS is working, but
  // we don't extensively check the QuillJS component
  await page.locator(".ql-header .ql-picker-label").click();
  await page.locator(".ql-header .ql-picker-item[data-value=\"1\"]").click();

  await page.locator(".ql-editor").pressSequentially("Body test");
  await expect(page.locator(".ql-editor")).toContainText("Body test");

  // Upload photo
  let [fileChooser] = await Promise.all([
    page.waitForEvent("filechooser"),
    await page.getByRole("button", { name: "Add photos" }).click(),
  ]);
  await fileChooser.setFiles("tests/fixtures/media/image.jpg");
  await expect(page.locator(".img-fluid")).toBeVisible();

  // Upload video
  [fileChooser] = await Promise.all([
    page.waitForEvent("filechooser"),
    await page.getByRole("button", { name: "Add a video" }).click(),
  ]);
  await fileChooser.setFiles("tests/fixtures/media/video.mp4");
  await expect(page.locator("video")).toBeVisible();

  // Upload pdf
  [fileChooser] = await Promise.all([
    page.waitForEvent("filechooser"),
    await page.getByRole("button", { name: "Add PDF" }).click(),
  ]);

  await fileChooser.setFiles("tests/fixtures/media/pdf.pdf");
  await expect(page.locator(".pdf-outline")).toBeVisible();

  await page.getByRole("button", { name: /Submit/i }).click();
  await expect(page).toHaveURL(/\/messages\/.*/);

  // Check that message displays the things we submitted
  await expect(page.locator(".author")).toBeVisible();
  await expect(page.locator(".author")).toContainText("zusam");
  await expect(page.locator(".title")).toBeVisible();
  await expect(page.locator(".title")).toContainText("Title test");
  await expect(page.locator(".ql-editor").first()).toHaveAttribute("contenteditable", "false");
  await expect(page.locator(".ql-editor h1")).toHaveText("Body test");

  const files = page.locator("#file-grid");
  await expect(files.locator("video")).toHaveCount(1);
  await expect(files.locator("a.pdf-outline")).toHaveCount(1);
  await expect(files.locator("a.image:not(.pdf-outline)")).toHaveCount(1);
});


// Basic test that message works starting from a group
test("posting new message from group page", async ({ authRequest, page }) => {
  const me = await getMe(authRequest);
  const group = await addGroup(authRequest, { name: "New group" });
  await page.goto("/groups/" + group.id);

  await page.locator(".write-button").click();
  await expect(page).toHaveURL("/groups/" + group.id + "/write");

  await page.locator(".title-input").fill("Title test");
  await page.locator(".ql-editor").click();
  await page.locator(".ql-editor").fill("Body test");
  await expect(page.locator(".ql-editor")).toContainText("Body test");
  await page.getByRole("button", { name: /Submit/i }).click();
  await expect(page).toHaveURL(/\/messages\/.*/);

  await page.goto("/groups/" + group.id);
  await expect(page.getByRole("link", { name: /Title test/i }).first()).toBeVisible();

});


test("posting a reply to an existing message", async ({ authRequest, page }) => {
  const me = await getMe(authRequest);
  const group = await addGroup(authRequest, { name: "New group" });
  await page.goto("/groups/" + group.id);

  // Throw in a new post to test on
  const message = await addMessage(authRequest, { meId: me.id, groupId: group.id, title: "Test replies", content: "" });
  await page.goto("/messages/" + message.id);

  let replyBox = page.locator(".message.child");
  // Check for avatar
  await expect(replyBox.locator(".message-head img")).toBeVisible();

  // Check QuillJS loaded by setting text format
  await replyBox.locator(".ql-header .ql-picker-label").click();
  await replyBox.locator(".ql-header .ql-picker-item[data-value=\"1\"]").click();

  // Post content
  await replyBox.locator(".ql-editor").pressSequentially("Reply test");
  await expect(replyBox.locator(".ql-editor h1")).toHaveText("Reply test");
  await replyBox.getByRole("button", { name: /Submit/i }).click();
  

  // Check reply is added
  let reply = page.locator(".children .message.child");
  await expect(reply.locator(".ql-editor")).toHaveAttribute("contenteditable", "false");
  await expect(reply.locator(".ql-editor h1")).toHaveText("Reply test");
});



test("deleting a message", async ({ authRequest, page }) => {
  const me = await getMe(authRequest);
  const group = await addGroup(authRequest, { name: "New group" });

  await page.goto("/groups/" + group.id);

  // Throw in a new post to test on
  await addMessage(authRequest, { meId: me.id, groupId: group.id, title: "Test delete post", content: "" });


  // Check it shows in the group
  await page.goto("/groups/" + group.id);
  await page.locator("#group").getByText("Test delete post").click();

  const menu = page.locator(".message-footer .options.dropdown");
  await menu.click();
  await menu.getByText("Delete").click();
  await expect(page.locator(".modal-content")).toBeVisible();
  await page.locator(".modal-footer").getByRole("button", { name: /Delete/i }).click();
  await expect(page).toHaveURL("/groups/" + group.id);

  // Check it doesn't show in the group
  await expect(page.locator("#group").getByText("Test delete")).not.toBeVisible();
});


test("bookmarking a message", async ({ authRequest, page }) => {
  const me = await getMe(authRequest);
  const group = await addGroup(authRequest, { name: "New group" });
  await page.goto("/groups/" + group.id);

  // Throw in a new post to test on
  const message = await addMessage(authRequest, { meId: me.id, groupId: group.id, title: "Test post 1", content: "" });

  // Bookmark the post
  await page.goto("/messages/" + message.id);
  const menu = page.locator(".message-footer .options.dropdown");
  await menu.click();
  await menu.getByText("Bookmark message").click();
  await expect(page.locator(".global-alert")).toHaveText("Message bookmarked.");
  await menu.click();
  await expect(menu).toContainText("Unbookmark message");

  // Check bookmark worked
  await page.goto("/bookmarks");
  await expect(page.locator("#group").locator("a[href=\"/messages/" + message.id + "\"]")).toBeVisible();
});



test("pinning message", async ({ authRequest, page }) => {
  const me = await getMe(authRequest);
  const group = await addGroup(authRequest, { name: "New group" });
  await page.goto("/groups/" + group.id);

  // Throw in a couple of new posts to test on
  const message1 = await addMessage(authRequest, { meId: me.id, groupId: group.id, title: "Test post 1", content: "" });
  const message2 = await addMessage(authRequest, { meId: me.id, groupId: group.id, title: "Test post 2", content: "" });

  // Pin the second post
  await page.goto("/messages/" + message2.id);
  let menu = page.locator(".message-footer .options.dropdown");
  await menu.click();
  await menu.getByText("Pin in group").click();

  // Check pin worked
  await expect(page).toHaveURL("/groups/" + group.id);
  const post1tile = page.locator("#group").locator("a[href=\"/messages/" + message1.id + "\"]");
  await expect(post1tile).toBeVisible();
  await expect(post1tile.locator(".pinned-icon")).not.toBeVisible();

  await expect(page).toHaveURL("/groups/" + group.id);
  const post2tile = page.locator("#group").locator("a[href=\"/messages/" + message2.id + "\"]");
  await expect(post2tile.locator(".pinned-icon")).toBeVisible();

  // Check unpin option
  await post2tile.click();

  menu = page.locator(".message-footer .options.dropdown");
  await menu.click();
  await expect(menu).toContainText("unpin");
});



test("sharing message from one group to another", async ({ authRequest, page }) => {
  const me = await getMe(authRequest);
  const fromGroup = await addGroup(authRequest, { name: "From group" });
  const toGroup = await addGroup(authRequest, { name: "To group" });
  await page.goto("/groups/" + fromGroup.id);

  // Throw in a new post to test with
  const message = await addMessage(authRequest, { meId: me.id, groupId: fromGroup.id, title: "Test sharing post", content: "Body of sharing post" });

  // Share the message
  await page.goto("/messages/" + message.id);
  let menu = page.locator(".message-footer .options.dropdown");
  await menu.click();
  await menu.getByText("Share the message").click();

  await expect(page).toHaveURL("/share?message=" + message.id);
  await page.locator("select[name=\"group_share_choice\"]").selectOption({ value: toGroup.id });

  const [response] = await Promise.all([
    page.waitForResponse("**/api/messages"),
    page.getByRole("button", { name: /Submit/i }).click()
  ]);

  const message2 = await response.json();
  await expect(page).toHaveURL("/messages/" + message2.id);

  // Check message content
  await expect(page.locator(".author")).toContainText("zusam");
  await expect(page.locator(".message-body .title")).toContainText("Test sharing post");
  await expect(page.locator(".message-body .card-text")).toHaveText("Body of sharing post");

  await page.goto("/groups/" + toGroup.id);
  await expect(page.locator("#group").locator("a[href=\"/messages/" + message2.id + "\"]")).toBeVisible();
});

test("editing a message", async ({ authRequest, page }) => {
  const me = await getMe(authRequest);
  const group = await addGroup(authRequest, { name: "New group" });

  // Throw in a new post to test on
  const message = await addMessage(authRequest, { meId: me.id, groupId: group.id, title: "Test post title not edited", content: "Test post body not edited" });
  await page.goto("/messages/" + message.id);

  // Check pre-edit content
  await expect(page.locator(".author")).toContainText("zusam");
  await expect(page.locator(".message-body .title")).toContainText("Test post title not edited");
  await expect(page.locator(".message-body .card-text")).toHaveText("Test post body not edited");

  // Edit message
  let menu = page.locator(".message-footer .options.dropdown");
  await menu.click();
  await menu.getByText("Edit").click();
  await page.locator(".title-input").fill("Test post title has been edited");
  await page.locator(".ql-editor").fill("Test post body has been edited");
  await expect(page.locator(".message .title-input")).toHaveValue("Test post title has been edited");
  await expect(page.locator(".ql-editor")).toHaveText("Test post body has been edited");
  await page.getByRole("button", { name: /Submit/i }).click();

  // Check content after editing
  await expect(page.locator(".message-body .title")).toHaveText("Test post title has been edited");
  await expect(page.locator(".message-body .card-text")).toHaveText("Test post body has been edited");
});

test("creating public link", async ({ authRequest, page, browser }) => {
  const me = await getMe(authRequest);
  const group = await addGroup(authRequest, { name: "New group" });

  // Throw in a new post to test on
  const message = await addMessage(authRequest, { meId: me.id, groupId: group.id, title: "Test public message", content: "Test message shared publically" });
  await page.goto("/messages/" + message.id);

  // Create public link
  let menu = page.locator(".message-footer .options.dropdown");
  await menu.click();

  // Opens in new tab so we need to capture this new page (still authenticated)
  const [sharedPage] = await Promise.all([
    page.context().waitForEvent("page"),
    menu.getByText("Public Link").click()
  ]);

  await expect(sharedPage).toHaveURL(/\/public\/.*/);
  await expect(sharedPage.locator(".message-body .title")).toHaveText("Test public message");
  await expect(sharedPage.locator(".message-body .card-text")).toHaveText("Test message shared publically");
  
  // Check we can get there when not logged in
  const publicUrl = sharedPage.url();

  // Create a new, unauthenticated context
  const context = await browser.newContext();
  const anonPage = await context.newPage();

  // Visit the public link
  await anonPage.goto(publicUrl);
  await expect(anonPage.locator(".message-body .title")).toHaveText("Test public message");
  await expect(anonPage.locator(".message-body .card-text")).toHaveText("Test message shared publically");

  // Just test that the unauthenticated context is actually logged out, by trying to access the feed
  await anonPage.goto("/feed");
  await expect(anonPage).toHaveURL("/login");
});