/*
 * Test page for Playwright: /fixture.html?name=<file in ./fixtures>&theme=dark|light
 * Each fixture renders one component in isolation, so e2e tests do not depend on the demo copy.
 */
import { StrictMode, Suspense, lazy, type ComponentType } from "react";
import { createRoot } from "react-dom/client";
import { CenngeProvider, Toaster } from "cennge-ui";
import "./fonts";
import "./styles.css";

const fixtures = import.meta.glob<{ default: ComponentType }>("./fixtures/*.tsx");

const params = new URLSearchParams(window.location.search);
const name = params.get("name") ?? "";
document.documentElement.classList.toggle("dark", params.get("theme") !== "light");

const load = fixtures[`./fixtures/${name}.tsx`];

function Missing() {
  return <p>Unknown fixture “{name}”. Available: {Object.keys(fixtures).join(", ")}</p>;
}

const Fixture = load ? lazy(load) : Missing;

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <CenngeProvider>
      <main className="mx-auto flex max-w-3xl flex-col gap-6 p-6">
        <Suspense fallback={null}>
          <Fixture />
          {/* Rendered once the fixture module has loaded. */}
          <span data-testid="fixture-ready" hidden />
        </Suspense>
      </main>
      <Toaster />
    </CenngeProvider>
  </StrictMode>,
);
