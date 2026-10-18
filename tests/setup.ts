import "@testing-library/jest-dom/vitest";

// jsdom has no ResizeObserver; Radix uses it to measure thumbs and popups. Every real browser has it.
if (typeof globalThis.ResizeObserver === "undefined") {
  globalThis.ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
}
