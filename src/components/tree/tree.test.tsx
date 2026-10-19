import { act, fireEvent, render, screen } from "@testing-library/react";
import { Tree, type TreeItem } from "./tree";

const files: TreeItem[] = [
  {
    id: "src",
    label: "src",
    children: [
      { id: "src/components", label: "components", children: [{ id: "src/components/tree.tsx", label: "tree.tsx" }] },
      { id: "src/index.ts", label: "index.ts" },
    ],
  },
  { id: "docs", label: "docs", hasChildren: true },
  { id: "README.md", label: "README.md" },
  { id: "package.json", label: "package.json" },
];

const item = (name: string) => screen.getByRole("treeitem", { name });
const focused = () => document.activeElement as HTMLElement;
const press = (key: string) => fireEvent.keyDown(focused(), { key });

describe("Tree", () => {
  it("is a tree of items with their level, position and state; one Tab stop", () => {
    render(<Tree aria-label="Files" items={files} defaultExpandedKeys={["src"]} />);
    expect(screen.getByRole("tree", { name: "Files" })).toBeInTheDocument();
    expect(item("src")).toHaveAttribute("aria-expanded", "true");
    expect(item("components")).toHaveAttribute("aria-level", "2");
    expect(item("components")).toHaveAttribute("aria-expanded", "false");
    expect(item("index.ts")).toHaveAttribute("aria-posinset", "2");
    expect(item("index.ts")).toHaveAttribute("aria-setsize", "2");
    expect(item("README.md")).not.toHaveAttribute("aria-expanded");
    expect(screen.getAllByRole("treeitem").filter((node) => node.tabIndex === 0)).toEqual([item("src")]);
  });

  it("a click opens a folder or selects and opens a file", () => {
    const onAction = vi.fn();
    const onSelectionChange = vi.fn();
    render(<Tree aria-label="Files" items={files} onAction={onAction} onSelectionChange={onSelectionChange} />);
    fireEvent.click(item("src"));
    expect(item("src")).toHaveAttribute("aria-expanded", "true");
    fireEvent.click(item("index.ts"));
    expect(item("index.ts")).toHaveAttribute("aria-selected", "true");
    expect(onAction).toHaveBeenCalledWith(expect.objectContaining({ id: "src/index.ts" }));
    expect(onSelectionChange).toHaveBeenLastCalledWith("src/index.ts");
  });

  it("keyboard: arrows move, open and close; Home and End; Enter opens a file", () => {
    const onAction = vi.fn();
    render(<Tree aria-label="Files" items={files} onAction={onAction} />);
    item("src").focus();
    press("ArrowRight");
    expect(item("src")).toHaveAttribute("aria-expanded", "true");
    press("ArrowRight");
    expect(focused()).toBe(item("components"));
    press("ArrowDown");
    expect(focused()).toBe(item("index.ts"));
    press("ArrowLeft");
    expect(focused()).toBe(item("src"));
    press("ArrowLeft");
    expect(item("src")).toHaveAttribute("aria-expanded", "false");
    press("End");
    expect(focused()).toBe(item("package.json"));
    press("Enter");
    expect(onAction).toHaveBeenCalledWith(expect.objectContaining({ id: "package.json" }));
    press("Home");
    expect(focused()).toBe(item("src"));
  });

  it("typing jumps to an item by name; * opens every sibling folder", () => {
    render(<Tree aria-label="Files" items={files} loadChildren={() => new Promise(() => {})} />);
    item("src").focus();
    press("r");
    expect(focused()).toBe(item("README.md"));
    press("Home");
    press("*");
    expect(item("src")).toHaveAttribute("aria-expanded", "true");
    expect(item("docs")).toHaveAttribute("aria-expanded", "true");
  });

  it("loads children on first open, busy meanwhile; a failed load collapses for a retry", async () => {
    let finish!: (children: TreeItem[]) => void;
    let fail!: (error: Error) => void;
    const loadChildren = vi
      .fn()
      .mockImplementationOnce(() => new Promise<TreeItem[]>((_, reject) => (fail = reject)))
      .mockImplementationOnce(() => new Promise<TreeItem[]>((resolve) => (finish = resolve)));
    const onLoadError = vi.fn();
    render(<Tree aria-label="Files" items={files} loadChildren={loadChildren} onLoadError={onLoadError} />);

    fireEvent.click(item("docs"));
    expect(item("docs")).toHaveAttribute("aria-busy", "true");
    await act(async () => fail(new Error("offline")));
    expect(item("docs")).toHaveAttribute("aria-expanded", "false");
    expect(onLoadError).toHaveBeenCalledWith(expect.objectContaining({ id: "docs" }), expect.any(Error));

    fireEvent.click(item("docs"));
    await act(async () => finish([{ id: "docs/intro.md", label: "intro.md" }]));
    expect(item("docs")).not.toHaveAttribute("aria-busy");
    expect(item("intro.md")).toHaveAttribute("aria-level", "2");
    expect(loadChildren).toHaveBeenCalledTimes(2);
  });

  it("closing a branch with focus inside moves focus to the branch", () => {
    render(<Tree aria-label="Files" items={files} defaultExpandedKeys={["src", "src/components"]} />);
    item("tree.tsx").focus();
    fireEvent.click(item("src").querySelector("[data-chevron]") as HTMLElement);
    expect(screen.queryByRole("treeitem", { name: "tree.tsx" })).toBeNull();
    expect(focused()).toBe(item("src"));
  });

  it("works with controlled expanded keys and without selection", () => {
    const onExpandedChange = vi.fn();
    render(
      <Tree aria-label="Files" items={files} expandedKeys={[]} onExpandedChange={onExpandedChange} selectionMode="none" />,
    );
    fireEvent.click(item("src"));
    expect(onExpandedChange).toHaveBeenCalledWith(["src"]);
    expect(item("src")).toHaveAttribute("aria-expanded", "false"); // the parent did not apply it
    expect(item("src")).not.toHaveAttribute("aria-selected");
  });
});
