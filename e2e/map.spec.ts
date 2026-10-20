import type { Locator, Page } from "@playwright/test";
import { expect, expectAccessible, openFixture, settleAnimations, test, type Theme } from "./test";

const moscow = [37.6173, 55.7558];
const kazan = [49.1088, 55.7963];

const map = (page: Page) => page.getByRole("region", { name: "Office map" });
const marker = (page: Page, name: string) => map(page).getByRole("button", { name, exact: true });

async function open(page: Page, theme: Theme = "dark") {
  await openFixture(page, "map", theme);
  // WebGL in a headless browser takes a moment to start.
  await expect(page.locator('[data-slot="map"]')).toHaveAttribute("data-state", "ready", { timeout: 20_000 });
}

const middle = (locator: Locator) =>
  locator.evaluate((node) => {
    const box = node.getBoundingClientRect();
    return { x: box.left + box.width / 2, y: box.top + box.height / 2, bottom: box.bottom };
  });

/** Where a point of the map is on the page, as MapLibre computes it. */
const pointOnPage = (page: Page, lngLat: number[]) =>
  page.evaluate((point) => {
    const instance = (window as unknown as { cenngeMap: import("maplibre-gl").Map }).cenngeMap;
    const box = instance.getContainer().getBoundingClientRect();
    const { x, y } = instance.project(point as [number, number]);
    return { x: box.left + x, y: box.top + y };
  }, lngLat);

const evaluateMap = <T,>(page: Page, run: string) =>
  page.evaluate((code) => new Function("map", code)((window as unknown as { cenngeMap: unknown }).cenngeMap) as T, run);

test("markers sit on their points, over the routes", async ({ page }) => {
  await open(page);
  const moscowPoint = await pointOnPage(page, moscow);
  const moscowDot = await middle(marker(page, "Moscow office"));
  expect(Math.abs(moscowDot.x - moscowPoint.x)).toBeLessThan(1.5);
  expect(Math.abs(moscowDot.y - moscowPoint.y)).toBeLessThan(1.5);
  // A marker anchored at its bottom stands on its point.
  const kazanPoint = await pointOnPage(page, kazan);
  const kazanPin = await middle(marker(page, "Kazan warehouse"));
  expect(Math.abs(kazanPin.x - kazanPoint.x)).toBeLessThan(1.5);
  expect(Math.abs(kazanPin.bottom - kazanPoint.y)).toBeLessThan(1.5);
  // Both routes, each with its outline underneath.
  const layers = await evaluateMap<string[]>(page, "return map.getStyle().layers.map((layer) => layer.id)");
  expect(layers.filter((id) => id.startsWith("cennge-route-"))).toHaveLength(4);
  // A marker without a popup or onClick is a picture, not a button.
  await expect(map(page).getByRole("img", { name: "Nizhny Novgorod" })).toBeVisible();
});

test("markers move with the map: arrow keys, and a drag with the mouse", async ({ page, isMobile }) => {
  await open(page);
  const before = await middle(marker(page, "Moscow office"));
  await page.locator('[data-slot="map"] canvas').focus();
  await expect(page.locator('[data-slot="map"] canvas')).toHaveAccessibleName("Map. Arrow keys move it, plus and minus zoom.");
  await page.keyboard.press("ArrowLeft");
  // The view moves right, so the marker goes right, and settles where MapLibre puts its point.
  await expect.poll(async () => (await middle(marker(page, "Moscow office"))).x - before.x).toBeGreaterThan(20);
  await expect(page.getByTestId("view")).not.toHaveText("not moved");
  const settled = await pointOnPage(page, moscow);
  expect(Math.abs((await middle(marker(page, "Moscow office"))).x - settled.x)).toBeLessThan(1.5);

  test.skip(isMobile, "A mouse drag; touch pans the same way inside MapLibre.");
  const start = await middle(marker(page, "Moscow office"));
  const box = (await map(page).boundingBox())!;
  await page.mouse.move(box.x + box.width / 2, box.y + box.height - 60);
  await page.mouse.down();
  await page.mouse.move(box.x + box.width / 2 + 90, box.y + box.height - 20, { steps: 8 });
  // Held still before letting go: a release while moving makes MapLibre glide on.
  await page.waitForTimeout(300);
  await page.mouse.up();
  const after = await middle(marker(page, "Moscow office"));
  expect(Math.abs(after.x - start.x - 90)).toBeLessThan(3);
  expect(Math.abs(after.y - start.y - 40)).toBeLessThan(3);
});

test("a tooltip on hover and on keyboard focus, not after a click", async ({ page, isMobile }) => {
  await open(page);
  const tooltip = map(page).getByRole("tooltip", { name: "Moscow" });
  await expect(tooltip).toBeHidden();
  await expect(marker(page, "Moscow office")).toHaveAccessibleDescription("Moscow");
  if (!isMobile) {
    await marker(page, "Moscow office").hover();
    await expect(tooltip).toBeVisible();
    await page.mouse.move(5, 5);
    await expect(tooltip).toBeHidden();
  }
  // From the map, Tab goes through the controls to the markers.
  await page.locator('[data-slot="map"] canvas').focus();
  for (let step = 0; step < 8 && !(await marker(page, "Moscow office").evaluate((node) => node === document.activeElement)); step++) {
    await page.keyboard.press("Tab");
  }
  await expect(marker(page, "Moscow office")).toBeFocused();
  await expect(tooltip).toBeVisible();
});

test("a marker's popup: opens with focus in it, Escape closes it back to the marker", async ({ page }) => {
  await open(page);
  const moscowMarker = marker(page, "Moscow office");
  await expect(moscowMarker).toHaveAttribute("aria-expanded", "false");
  await moscowMarker.click();
  const popup = page.getByRole("dialog", { name: "Moscow office" });
  await expect(popup).toBeVisible();
  await expect(popup).toBeFocused();
  await expect(moscowMarker).toHaveAttribute("aria-expanded", "true");
  await expect(page.getByTestId("opened")).toHaveText("opened 1");
  // Its controls work like any other.
  await expect(popup.getByRole("button", { name: "Directions" })).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(popup).toBeHidden();
  await expect(moscowMarker).toBeFocused();
  // And from the keyboard: Enter opens, the close button closes.
  await page.keyboard.press("Enter");
  await expect(popup).toBeFocused();
  await popup.getByRole("button", { name: "Close" }).click();
  await expect(popup).toBeHidden();
  // A marker with only onClick is a button too.
  await marker(page, "Kazan warehouse").click();
  await expect(page.getByTestId("opened")).toHaveText("opened 3");
});

test("a click on the map closes a marker's popup; a MapPopup shows the clicked point", async ({ page, isMobile }) => {
  await open(page);
  await marker(page, "Moscow office").click();
  await expect(page.getByRole("dialog", { name: "Moscow office" })).toBeVisible();
  const box = (await map(page).boundingBox())!;
  const spot = { x: box.width / 2, y: box.height - 50 };
  if (isMobile) await map(page).tap({ position: spot });
  else await map(page).click({ position: spot });
  await expect(page.getByRole("dialog", { name: "Moscow office" })).toBeHidden();
  const clicked = page.getByRole("dialog", { name: "Clicked point" });
  await expect(clicked).toBeVisible();
  await expect(clicked).toContainText(/^\d+\.\d{2}, \d+\.\d{2}/);
  // Its arrow points at the place clicked.
  await settleAnimations(page);
  const card = (await clicked.boundingBox())!;
  expect(Math.abs(card.x + card.width / 2 - (box.x + spot.x))).toBeLessThan(2);
  expect(Math.abs(card.y + card.height + 12 - (box.y + spot.y))).toBeLessThan(3);
  await clicked.getByRole("button", { name: "Close" }).click();
  await expect(clicked).toBeHidden();
});

test("a popup that would leave the map pans the map to show it whole", async ({ page }) => {
  await open(page);
  // Moscow 20px under the map's top edge: its popup, above it, would be cut off.
  await evaluateMap(page, `const p = map.project([${moscow}]); map.panBy([0, p.y - 20], { animate: false });`);
  await marker(page, "Moscow office").click();
  const popup = page.getByRole("dialog", { name: "Moscow office" });
  await expect(popup).toBeVisible();
  await settleAnimations(page);
  const frame = (await map(page).boundingBox())!;
  await expect.poll(async () => (await popup.boundingBox())!.y - frame.y).toBeGreaterThanOrEqual(11);
  // The marker came along: the arrow still points at it.
  const card = (await popup.boundingBox())!;
  const dot = await middle(marker(page, "Moscow office"));
  expect(Math.abs(card.x + card.width / 2 - dot.x)).toBeLessThan(2);
});

test("zoom buttons, the compass and full screen", async ({ page, browserName, isMobile }) => {
  await open(page);
  const controls = map(page);
  // The opening zoom fits the area to the screen; each button moves it by one.
  const zoom = () => evaluateMap<number>(page, "return map.getZoom()");
  const start = await zoom();
  const zoomed = (by: number) => new RegExp(`^zoom ${(start + by).toFixed(1).replace(".", "\\.")},`);
  await controls.getByRole("button", { name: "Zoom in" }).click();
  await expect(page.getByTestId("view")).toHaveText(zoomed(1));
  await controls.getByRole("button", { name: "Zoom out" }).click();
  await expect(page.getByTestId("view")).toHaveText(zoomed(0));
  await controls.getByRole("button", { name: "Zoom out" }).click();
  await expect(page.getByTestId("view")).toHaveText(zoomed(-1));

  // The needle shows the rotation; a click turns the map back to north.
  await evaluateMap(page, "map.setBearing(60)");
  const needle = controls.getByRole("button", { name: "Point north" }).locator("g");
  await expect(needle).toHaveCSS("transform", /matrix/);
  await controls.getByRole("button", { name: "Point north" }).click();
  await expect(page.getByTestId("view")).toHaveText(/bearing 0$/);

  test.skip(browserName !== "chromium" || isMobile, "Headless WebKit and Firefox do not enter full screen.");
  const fullscreen = controls.getByRole("button", { name: "Full screen" });
  await fullscreen.click();
  await expect(controls.getByRole("button", { name: "Exit full screen" })).toHaveAttribute("aria-pressed", "true");
  await expect.poll(() => page.evaluate(() => document.fullscreenElement?.getAttribute("data-slot"))).toBe("map");
  await controls.getByRole("button", { name: "Exit full screen" }).click();
  await expect(controls.getByRole("button", { name: "Full screen" })).toHaveAttribute("aria-pressed", "false");
});

test("locate: the user's dot, or a message when the location is not available", async ({ page, context, browserName }) => {
  test.skip(browserName === "firefox", "Firefox's Playwright build has no geolocation permission to grant.");
  await context.grantPermissions(["geolocation"]);
  await context.setGeolocation({ latitude: 55.75, longitude: 37.62 });
  await open(page);
  await map(page).getByRole("button", { name: "Show my location" }).click();
  await expect(map(page).getByRole("img", { name: "Your location" })).toBeVisible();
  // The map flies there; then the dot is on the point.
  await expect.poll(async () => {
    const here = await pointOnPage(page, [37.62, 55.75]);
    const dot = await middle(map(page).getByRole("img", { name: "Your location" }));
    return Math.max(Math.abs(dot.x - here.x), Math.abs(dot.y - here.y));
  }).toBeLessThan(1.5);
  await expect(page.getByTestId("view")).toHaveText(/^zoom 14\.0/);

  test.skip(browserName === "webkit", "WebKit keeps the granted location after the permission is cleared.");
  await context.clearPermissions();
  await map(page).getByRole("button", { name: "Show my location" }).click();
  await expect(map(page).getByRole("button", { name: "Your location is not available" })).toBeVisible();
  await expect(map(page).getByRole("status")).toHaveText("Your location is not available");
});

test("the theme's style, and routes in the theme's and the accent's colour", async ({ page }) => {
  await open(page, "dark");
  const lineColor = () =>
    evaluateMap<string>(page, 'return map.getPaintProperty(map.getStyle().layers.find((l) => l.id.endsWith("-line")).id, "line-color")');
  const token = (name: string) =>
    page.evaluate((property) => getComputedStyle(document.documentElement).getPropertyValue(property).trim(), name);
  const background = () => evaluateMap<string>(page, 'return map.getPaintProperty("background", "background-color")');

  expect(await lineColor()).toBe(await token("--cennge-primary"));
  expect(await background()).toBe("#1b1e24");
  await page.evaluate(() => document.documentElement.classList.remove("dark"));
  await expect.poll(background).toBe("#e4e7ec");
  // The new style starts without the routes: they are added again, in the light theme's colours.
  await expect.poll(lineColor).toBe(await token("--cennge-primary"));
  await page.evaluate(() => document.documentElement.setAttribute("data-accent", "blue"));
  await expect.poll(lineColor).toBe(await token("--cennge-primary"));
  expect(await token("--cennge-primary")).not.toBe("");
});

for (const theme of ["dark", "light"] as const) {
  test(`passes axe in the ${theme} theme, with a popup open`, async ({ page }) => {
    await open(page, theme);
    await marker(page, "Moscow office").click();
    await expect(page.getByRole("dialog", { name: "Moscow office" })).toBeVisible();
    await expectAccessible(page);
  });
}
