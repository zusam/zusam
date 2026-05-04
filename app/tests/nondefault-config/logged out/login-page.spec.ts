import { test, expect } from "@playwright/test";

test("forgot password", async ({ page }) => {
  await page.goto("/login");
  await page.getByText("Forgot your password?").click();
  await expect(page.locator("#login")).toBeVisible();
  await page.locator("#login").fill("zusam");
  await page.click("button[type=\"submit\"]");
  // "zusam" isn't a valid email, just check for the error, we don't check email is sent
  await expect(page.locator(".global-alert")).toContainText(
    "An error occurred",
  );
  // Check for invalid user
  await page.goto("/login");
  await page.getByText("Forgot your password?").click();
  await page.locator("#login").fill("not_a_user");
  await page.click("button[type=\"submit\"]");
  await expect(page.locator(".global-alert")).toContainText(
    "User not found",
  );
});

