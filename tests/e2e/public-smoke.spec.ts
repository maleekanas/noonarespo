import { test, expect } from "@playwright/test";

test.describe("public production-critical journeys", () => {
  test("homepage exposes registration and login without demo-only assumptions", async ({ page }) => {
    await page.goto("/en");
    await expect(page).toHaveTitle(/Arabic|Academy/i);
    await page.goto("/en/login");
    await expect(page.getByRole("textbox", { name: /email/i })).toBeVisible();
    await expect(page.getByRole("link", { name: /register|sign up|create/i })).toBeVisible();
  });

  test("registration page is publicly reachable", async ({ page }) => {
    const response = await page.goto("/en/register");
    expect(response?.ok()).toBeTruthy();
    await expect(page.locator("form")).toBeVisible();
  });

  test("admin export is not anonymously downloadable", async ({ request }) => {
    const response = await request.get("/api/admin/export");
    expect([401, 403]).toContain(response.status());
  });

  test("health endpoint does not expose a mock database claim", async ({ request }) => {
    const response = await request.get("/api/health");
    expect(response.ok()).toBeTruthy();
    const body = JSON.stringify(await response.json());
    expect(body).not.toMatch(/in-memory mock|mock store/i);
  });

  test("unknown protected parent route does not grant anonymous dashboard access", async ({ page }) => {
    await page.goto("/en/parent");
    await expect(page).toHaveURL(/\/en\/login/);
  });
});
