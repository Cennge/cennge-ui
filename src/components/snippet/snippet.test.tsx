import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { Snippet } from "./snippet";

const copyButton = () => screen.getByRole("button", { name: "Copy" });
const announced = () => document.querySelector('[aria-live="polite"]')?.textContent;

let writeText: ReturnType<typeof vi.fn>;

beforeEach(() => {
  writeText = vi.fn().mockResolvedValue(undefined);
  Object.defineProperty(navigator, "clipboard", { value: { writeText }, configurable: true });
});

afterEach(() => {
  Object.defineProperty(navigator, "clipboard", { value: undefined, configurable: true });
});

describe("Snippet", () => {
  it("shows the command after a symbol that screen readers skip", () => {
    render(<Snippet>pnpm add cennge-ui</Snippet>);
    expect(screen.getByText("$")).toHaveAttribute("aria-hidden", "true");
    expect(copyButton()).toHaveAccessibleDescription("pnpm add cennge-ui");
  });

  it("copies the text without the symbol, shows a check and announces it", async () => {
    const onCopy = vi.fn();
    render(
      <Snippet onCopy={onCopy} timeout={60}>
        pnpm add cennge-ui
      </Snippet>,
    );
    fireEvent.click(copyButton());
    await waitFor(() => expect(copyButton()).toHaveAttribute("data-copied", "true"));
    expect(writeText).toHaveBeenCalledWith("pnpm add cennge-ui");
    expect(onCopy).toHaveBeenCalledWith("pnpm add cennge-ui");
    expect(announced()).toBe("Copied");
    await waitFor(() => expect(copyButton()).not.toHaveAttribute("data-copied"));
    expect(announced()).toBe("");
  });

  it("puts every line of a multi-line string on its own row and copies them all", async () => {
    render(<Snippet>{"git clone https://github.com/Cennge/ai-niche-scout.git\ncd ai-niche-scout\n"}</Snippet>);
    expect(screen.getAllByText("$")).toHaveLength(2);
    fireEvent.click(copyButton());
    await waitFor(() =>
      expect(writeText).toHaveBeenCalledWith("git clone https://github.com/Cennge/ai-niche-scout.git\ncd ai-niche-scout"),
    );
  });

  it("copies codeString instead of the visible text; symbol={false} hides the symbol", async () => {
    render(
      <Snippet symbol={false} codeString="npx cennge-ui@latest init">
        <span>npx cennge-ui init</span>
      </Snippet>,
    );
    expect(screen.queryByText("$")).toBeNull();
    fireEvent.click(copyButton());
    await waitFor(() => expect(writeText).toHaveBeenCalledWith("npx cennge-ui@latest init"));
  });

  it("falls back to a selected textarea where the Clipboard API is missing (plain http)", async () => {
    Object.defineProperty(navigator, "clipboard", { value: undefined, configurable: true });
    const selected: string[] = [];
    const execCommand = vi.fn(() => {
      selected.push((document.activeElement as HTMLTextAreaElement).value);
      return true;
    });
    Object.defineProperty(document, "execCommand", { value: execCommand, configurable: true });
    render(<Snippet>pnpm dev --host</Snippet>);
    copyButton().focus();
    fireEvent.click(copyButton());
    await waitFor(() => expect(copyButton()).toHaveAttribute("data-copied", "true"));
    expect(execCommand).toHaveBeenCalledWith("copy");
    expect(selected).toEqual(["pnpm dev --host"]);
    expect(document.querySelector("textarea")).toBeNull();
    expect(copyButton()).toHaveFocus();
  });

  it("shows no check when copying fails", async () => {
    writeText.mockRejectedValue(new Error("denied"));
    Object.defineProperty(document, "execCommand", { value: () => false, configurable: true });
    const onCopy = vi.fn();
    render(<Snippet onCopy={onCopy}>pnpm build</Snippet>);
    fireEvent.click(copyButton());
    await new Promise((resolve) => setTimeout(resolve, 20));
    expect(copyButton()).not.toHaveAttribute("data-copied");
    expect(onCopy).not.toHaveBeenCalled();
  });

  it("can hide the copy button and translate its labels", () => {
    const { rerender } = render(<Snippet hideCopyButton>pnpm test</Snippet>);
    expect(screen.queryByRole("button")).toBeNull();
    rerender(<Snippet copyLabel="Скопировать">pnpm test</Snippet>);
    expect(screen.getByRole("button", { name: "Скопировать" })).toBeInTheDocument();
  });
});
