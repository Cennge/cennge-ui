import { render, screen, waitFor } from "@testing-library/react";
import { Prose } from "./prose";

describe("Prose", () => {
  it("puts the prose class and the size on a div, or on your own element", () => {
    const { rerender } = render(
      <Prose data-testid="prose">
        <h2>Install</h2>
      </Prose>,
    );
    expect(screen.getByTestId("prose")).toHaveClass("cennge-prose");
    expect(screen.getByTestId("prose").tagName).toBe("DIV");
    rerender(
      <Prose size="lg" asChild className="max-w-prose">
        <article data-testid="prose">
          <h2>Install</h2>
        </article>
      </Prose>,
    );
    const article = screen.getByTestId("prose");
    expect(article.tagName).toBe("ARTICLE");
    expect(article).toHaveClass("cennge-prose", "cennge-prose-lg", "max-w-prose");
  });

  it("a code block that scrolls sideways becomes a tab stop, and stops being one when it fits", async () => {
    let wide = true;
    const scrollWidth = vi.spyOn(HTMLElement.prototype, "scrollWidth", "get").mockImplementation(function (this: HTMLElement) {
      return this.tagName === "PRE" && wide ? 900 : 0;
    });
    const clientWidth = vi.spyOn(HTMLElement.prototype, "clientWidth", "get").mockImplementation(function (this: HTMLElement) {
      return this.tagName === "PRE" ? 600 : 0;
    });
    const { container, rerender } = render(
      <Prose>
        <pre>
          <code>pnpm exec playwright test</code>
        </pre>
        <pre className="not-prose">
          <code>left alone</code>
        </pre>
      </Prose>,
    );
    const [styled, ignored] = Array.from(container.querySelectorAll("pre"));
    expect(styled).toHaveAttribute("tabindex", "0");
    expect(ignored).not.toHaveAttribute("tabindex");
    wide = false;
    rerender(
      <Prose>
        <pre>
          <code>pnpm test</code>
        </pre>
        <pre className="not-prose">
          <code>left alone</code>
        </pre>
      </Prose>,
    );
    // New content is noticed by a MutationObserver, which reports asynchronously.
    await waitFor(() => expect(container.querySelector("pre")).not.toHaveAttribute("tabindex"));
    scrollWidth.mockRestore();
    clientWidth.mockRestore();
  });

  it("keeps a tabindex the author set", () => {
    const { container } = render(
      <Prose>
        <pre tabIndex={-1}>
          <code>pnpm test</code>
        </pre>
      </Prose>,
    );
    expect(container.querySelector("pre")).toHaveAttribute("tabindex", "-1");
  });
});
