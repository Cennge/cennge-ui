import { renderToString } from "react-dom/server";
import { act, render } from "@testing-library/react";
import { ThemeScript, ThemeSwitch } from "./theme";
import { useTheme } from "./use-theme";
import { themeScript } from "./script";

let systemIsDark = false;
const systemListeners = new Set<() => void>();

beforeEach(() => {
  localStorage.clear();
  document.documentElement.className = "";
  systemIsDark = false;
  systemListeners.clear();
  // jsdom has no matchMedia: a system setting the tests can flip.
  window.matchMedia = ((query: string) => ({
    get matches() {
      return query === "(prefers-color-scheme: dark)" && systemIsDark;
    },
    media: query,
    addEventListener: (_type: string, listener: () => void) => systemListeners.add(listener),
    removeEventListener: (_type: string, listener: () => void) => systemListeners.delete(listener),
  })) as unknown as typeof window.matchMedia;
});

/** The head script, run as the browser would run it. */
const runScript = (options?: Parameters<typeof themeScript>[0]) => new Function(themeScript(options))();
const isDark = () => document.documentElement.classList.contains("dark");

describe("the head script", () => {
  it("shows the stored theme, else the system's", () => {
    localStorage.setItem("cennge-theme", "dark");
    runScript();
    expect(isDark()).toBe(true);

    localStorage.setItem("cennge-theme", "light");
    systemIsDark = true;
    runScript();
    expect(isDark()).toBe(false);

    localStorage.removeItem("cennge-theme");
    runScript();
    expect(isDark()).toBe(true);
  });

  it("follows the system while the choice is 'system', and nothing else is stored", () => {
    localStorage.setItem("cennge-theme", "system");
    runScript();
    expect(isDark()).toBe(false);
    systemIsDark = true;
    systemListeners.forEach((listener) => listener());
    expect(isDark()).toBe(true);
  });

  it("takes its own key and default, and ignores a value it does not know", () => {
    localStorage.setItem("app-theme", "purple");
    runScript({ storageKey: "app-theme", defaultTheme: "dark" });
    expect(isDark()).toBe(true);
  });

  it("is one self-contained statement, so it can go in a <script> as it is", () => {
    // React 17 also marks the root element with data-reactroot.
    expect(renderToString(<ThemeScript />)).toMatch(/^<script[^>]*>\(function apply\(/);
  });
});

function Probe() {
  const { theme, resolvedTheme } = useTheme();
  return <output>{`${theme ?? "unknown"} ${resolvedTheme ?? "unknown"}`}</output>;
}

describe("useTheme and ThemeSwitch", () => {
  it("render the same on the server and in the first render, then show the theme", () => {
    const ui = (
      <>
        <Probe />
        <ThemeSwitch />
      </>
    );
    const html = renderToString(ui);
    expect(html).toContain("unknown unknown");
    expect(html).not.toContain('aria-checked="true"');

    localStorage.setItem("cennge-theme", "dark");
    runScript();
    const container = document.createElement("div");
    container.innerHTML = html;
    document.body.append(container);
    // Every React reports a hydration mismatch on console.error.
    const errors: unknown[] = [];
    const spy = vi.spyOn(console, "error").mockImplementation((...args) => errors.push(args));
    render(ui, { container, hydrate: true });
    spy.mockRestore();
    expect(errors).toEqual([]);
    expect(container.querySelector("output")).toHaveTextContent("dark dark");
    expect(container.querySelector('[aria-checked="true"]')).toHaveAccessibleName("Dark");
  });

  it("switches, remembers, and tells every hook in the page", () => {
    runScript();
    const { container } = render(
      <>
        <Probe />
        <Probe />
        <ThemeSwitch />
      </>,
    );
    expect(container.querySelectorAll("output")[1]).toHaveTextContent("system light");

    act(() => (container.querySelector('[aria-label="Dark"]') as HTMLElement).click());
    expect(localStorage.getItem("cennge-theme")).toBe("dark");
    expect(isDark()).toBe(true);
    for (const output of container.querySelectorAll("output")) expect(output).toHaveTextContent("dark dark");

    // Another tab chose light.
    act(() => {
      localStorage.setItem("cennge-theme", "light");
      document.documentElement.classList.remove("dark");
      window.dispatchEvent(new StorageEvent("storage", { key: "cennge-theme" }));
    });
    expect(container.querySelector("output")).toHaveTextContent("light light");
  });

  it("still switches where storage is blocked", () => {
    runScript();
    const setItem = vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new DOMException("blocked", "SecurityError");
    });
    let setTheme: ((theme: "dark") => void) | undefined;
    function Grab() {
      setTheme = useTheme().setTheme;
      return <Probe />;
    }
    const { container } = render(<Grab />);
    act(() => setTheme!("dark"));
    expect(isDark()).toBe(true);
    expect(container.querySelector("output")).toHaveTextContent("dark dark");
    setItem.mockRestore();
  });
});
