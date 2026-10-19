import { fireEvent, render, screen } from "@testing-library/react";
import { Command, CommandDialog, CommandGroup, CommandItem, CommandSeparator, commandMatches } from "./command";

function Palette({ onRun = () => {} }: { onRun?: (name: string) => void }) {
  return (
    <>
      <CommandGroup heading="Repositories">
        <CommandItem onAction={() => onRun("cennge-ui")}>cennge-ui</CommandItem>
        <CommandItem onAction={() => onRun("ai-niche-scout")} keywords={["python", "startup"]}>
          ai-niche-scout
        </CommandItem>
      </CommandGroup>
      <CommandSeparator />
      <CommandGroup heading="Actions">
        <CommandItem onAction={() => onRun("new")}>New repository</CommandItem>
        <CommandItem onAction={() => onRun("archive")} isDisabled>
          Archive
        </CommandItem>
        <CommandItem onAction={() => onRun("résumé")}>Edit résumé</CommandItem>
      </CommandGroup>
    </>
  );
}

const input = () => screen.getByRole("combobox");
const options = () => screen.queryAllByRole("option");
const active = () => document.getElementById(input().getAttribute("aria-activedescendant") ?? "");
const type = (text: string) => fireEvent.change(input(), { target: { value: text } });
const press = (key: string) => fireEvent.keyDown(input(), { key });

describe("commandMatches", () => {
  it("needs every word, in the text or the keywords, ignoring case and accents", () => {
    expect(commandMatches("NEW repo", "New repository")).toBe(true);
    expect(commandMatches("resume", "Edit résumé")).toBe(true);
    expect(commandMatches("python", "ai-niche-scout", ["python"])).toBe(true);
    expect(commandMatches("new vue", "New repository")).toBe(false);
  });
});

describe("Command", () => {
  it("a combobox that controls a list, with the first item active", () => {
    render(
      <Command label="Commands">
        <Palette />
      </Command>,
    );
    expect(input()).toHaveAttribute("aria-controls", screen.getByRole("listbox").id);
    expect(active()).toHaveTextContent("cennge-ui");
    expect(active()).toHaveAttribute("aria-selected", "true");
    expect(screen.getByRole("group", { name: "Repositories" })).toBeInTheDocument();
  });

  it("typing filters the items and announces how many match", () => {
    render(
      <Command>
        <Palette />
      </Command>,
    );
    type("python");
    expect(options().map((option) => option.textContent)).toEqual(["ai-niche-scout"]);
    expect(active()).toHaveTextContent("ai-niche-scout");
    expect(document.querySelector('[aria-live="polite"]')).toHaveTextContent("1 results");
    type("zzz");
    expect(options()).toHaveLength(0);
    expect(screen.getByText("No results")).toBeInTheDocument();
  });

  it("arrows move over enabled items and wrap; Enter runs the active one", () => {
    const onRun = vi.fn();
    render(
      <Command>
        <Palette onRun={onRun} />
      </Command>,
    );
    press("ArrowDown");
    press("ArrowDown");
    expect(active()).toHaveTextContent("New repository");
    press("ArrowDown"); // skips the disabled Archive
    expect(active()).toHaveTextContent("Edit résumé");
    press("ArrowDown");
    expect(active()).toHaveTextContent("cennge-ui");
    press("ArrowUp");
    expect(active()).toHaveTextContent("Edit résumé");
    press("Enter");
    expect(onRun).toHaveBeenCalledWith("résumé");
  });

  it("a click runs an item; a disabled one does nothing", () => {
    const onRun = vi.fn();
    render(
      <Command>
        <Palette onRun={onRun} />
      </Command>,
    );
    fireEvent.click(screen.getByRole("option", { name: "Archive" }));
    fireEvent.click(screen.getByRole("option", { name: "New repository" }));
    expect(onRun.mock.calls).toEqual([["new"]]);
  });

  it("Escape clears a typed query first", () => {
    render(
      <Command>
        <Palette />
      </Command>,
    );
    type("new");
    press("Escape");
    expect(input()).toHaveValue("");
  });
});

describe("CommandDialog", () => {
  it("opens with Ctrl or ⌘ + K, runs an item and closes", () => {
    const onRun = vi.fn();
    render(
      <CommandDialog label="Command palette">
        <Palette onRun={onRun} />
      </CommandDialog>,
    );
    expect(screen.queryByRole("dialog")).toBeNull();
    fireEvent.keyDown(window, { key: "k", ctrlKey: true });
    expect(screen.getByRole("dialog", { name: "Command palette" })).toBeInTheDocument();
    expect(input()).toHaveFocus();
    press("Enter");
    expect(onRun).toHaveBeenCalledWith("cennge-ui");
    expect(screen.queryByRole("dialog")).toBeNull();
    fireEvent.keyDown(window, { key: "k", metaKey: true });
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });

  it("a custom shortcut, or none", () => {
    const { rerender } = render(
      <CommandDialog shortcut="mod+shift+p">
        <Palette />
      </CommandDialog>,
    );
    fireEvent.keyDown(window, { key: "k", ctrlKey: true });
    expect(screen.queryByRole("dialog")).toBeNull();
    fireEvent.keyDown(window, { key: "P", ctrlKey: true, shiftKey: true });
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    rerender(
      <CommandDialog shortcut={false} isOpen={false}>
        <Palette />
      </CommandDialog>,
    );
    fireEvent.keyDown(window, { key: "k", ctrlKey: true });
    expect(screen.queryByRole("dialog")).toBeNull();
  });
});
