import { expect, expectAccessible, openFixture, test } from "./test";
import type { Page } from "@playwright/test";

const signUp = (page: Page) => page.getByRole("form", { name: "Sign up" });
const submit = (page: Page) => page.getByRole("button", { name: "Create account" });

test.beforeEach(async ({ page }) => {
  await openFixture(page, "form");
});

/** Fill everything the browser checks, so the "server" gets to answer. */
async function fillValid(page: Page, username = "cennge") {
  const form = signUp(page);
  await form.getByLabel("Email").fill("dev@example.com");
  await form.getByLabel("Username").fill(username);
  await form.getByLabel("Password", { exact: true }).fill("correct horse");
  await form.getByRole("combobox", { name: "Plan" }).click();
  await page.getByRole("option", { name: "Pro" }).click();
  await form.getByRole("radio", { name: "Public" }).click();
  await form.getByRole("checkbox", { name: "I agree to the terms" }).click();
}

test("an empty submit shows each field's message in its place and focuses the first", async ({ page }) => {
  // The browser's own tooltip is replaced: every "invalid" event is cancelled.
  await page.evaluate(() => {
    (window as unknown as { shown: number }).shown = 0;
    document.addEventListener("invalid", (event) => !event.defaultPrevented && (window as unknown as { shown: number }).shown++, true);
  });
  await submit(page).click();
  const form = signUp(page);
  const email = form.getByLabel("Email");
  await expect(email).toBeFocused();
  await expect(email).toHaveAttribute("aria-invalid", "true");
  const message = await email.evaluate((node) => (node as HTMLInputElement).validationMessage);
  expect(message.length).toBeGreaterThan(0);
  await expect(email).toHaveAccessibleDescription(message);
  for (const field of [form.getByLabel("Password", { exact: true }), form.getByRole("combobox", { name: "Plan" })]) {
    await expect(field).toHaveAttribute("aria-invalid", "true");
  }
  await expect(form.getByRole("radiogroup", { name: "Visibility" })).toHaveAttribute("aria-invalid", "true");
  await expect(form.getByRole("checkbox", { name: "I agree to the terms" })).toHaveAttribute("aria-invalid", "true");
  await expect(page.getByTestId("result")).toHaveText(""); // the submit was blocked
});

test("a message follows the field as it is fixed", async ({ page }) => {
  await submit(page).click();
  const email = signUp(page).getByLabel("Email");
  await email.pressSequentially("dev@");
  await expect(email).toHaveAttribute("aria-invalid", "true"); // still not an address, with its new reason
  await email.pressSequentially("example.com");
  await expect(email).not.toHaveAttribute("aria-invalid");
  const terms = signUp(page).getByRole("checkbox", { name: "I agree to the terms" });
  await terms.click();
  await expect(terms).not.toHaveAttribute("aria-invalid");
});

test("server errors land under their fields, the first gets focus, an edit clears its own", async ({ page }) => {
  await fillValid(page, "admin");
  await submit(page).click();
  await expect(page.getByTestId("result")).toHaveText("rejected");
  const form = signUp(page);
  const username = form.getByLabel("Username");
  await expect(username).toHaveAccessibleDescription("This username is taken");
  await expect(username).toBeFocused(); // the first error in the form
  await expect(form.getByRole("textbox", { name: "Launch date" })).toHaveAccessibleDescription("Pick a launch date");
  const stars = form.getByRole("radiogroup", { name: "Rate the release" });
  await expect(stars).toHaveAccessibleDescription("Rate the release before saving");

  await username.fill("cennge");
  await expect(username).not.toHaveAttribute("aria-invalid");
  await expect(username).toHaveAccessibleDescription("Letters and digits");
  await expect(stars).toHaveAttribute("aria-invalid", "true"); // others stay
  await stars.getByRole("radio", { name: "4 stars" }).click();
  await expect(stars).not.toHaveAttribute("aria-invalid");
  await form.getByRole("textbox", { name: "Launch date" }).fill("2026-11-02");
  await form.getByRole("textbox", { name: "Launch date" }).press("Enter");
  await expect(form.getByRole("textbox", { name: "Launch date" })).not.toHaveAttribute("aria-invalid");

  await submit(page).click();
  await expect(page.getByTestId("result")).toHaveText("saved");
});

test("a React 19 action: the error stays after React resets the form, next to the value", async ({ page }) => {
  const rename = page.getByRole("form", { name: "Rename" });
  const field = rename.getByLabel("Repository name");
  await rename.getByRole("button", { name: "Rename" }).click();
  await expect(field).toHaveAccessibleDescription("A repository with this name already exists");
  await expect(field).toHaveValue("cennge-ui");
  await field.fill("cennge-ui-next");
  await expect(field).not.toHaveAttribute("aria-invalid");
  await rename.getByRole("button", { name: "Rename" }).click();
  await expect(page.getByTestId("renamed")).toHaveText("cennge-ui-next");
});

for (const theme of ["dark", "light"] as const) {
  test(`passes axe with errors shown in the ${theme} theme`, async ({ page }) => {
    await openFixture(page, "form", theme);
    await submit(page).click();
    await expect(signUp(page).getByLabel("Email")).toHaveAttribute("aria-invalid", "true");
    await expectAccessible(page);
  });
}
