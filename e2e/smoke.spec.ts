import { test, expect } from "@playwright/test";

test.describe("Smoke — public pages load", () => {
  test("home loads with RTL + brand header", async ({ page }) => {
    await page.goto("/");
    const html = page.locator("html");
    await expect(html).toHaveAttribute("dir", "rtl");
    await expect(html).toHaveAttribute("lang", "he");
    await expect(page.getByText("TicketIL")).toBeVisible();
    await expect(page.getByRole("link", { name: /כל המשחקים/ })).toBeVisible();
  });

  test("games list page loads", async ({ page }) => {
    await page.goto("/games");
    await expect(page).toHaveURL(/\/games/);
  });

  test("how-it-works renders", async ({ page }) => {
    await page.goto("/how-it-works");
    await expect(page.locator("body")).toContainText(/איך זה עובד|קונה|מוכר/);
  });

  test("terms + privacy render", async ({ page }) => {
    await page.goto("/terms");
    await expect(page.getByRole("heading", { name: /תקנון/ })).toBeVisible();

    await page.goto("/privacy");
    await expect(page.getByRole("heading", { name: /פרטיות/ })).toBeVisible();
  });

  test("404 shows custom not-found page", async ({ page }) => {
    await page.goto("/does-not-exist-xyz");
    await expect(page.getByText("404")).toBeVisible();
    await expect(page.getByRole("link", { name: /לעמוד הבית/ })).toBeVisible();
  });

  test("robots.txt serves", async ({ request }) => {
    const res = await request.get("/robots.txt");
    expect(res.status()).toBe(200);
    const body = await res.text();
    expect(body).toContain("User-Agent");
    expect(body).toContain("Sitemap");
  });

  test("sitemap.xml serves valid XML", async ({ request }) => {
    const res = await request.get("/sitemap.xml");
    expect(res.status()).toBe(200);
    const body = await res.text();
    expect(body).toContain("<urlset");
  });
});
