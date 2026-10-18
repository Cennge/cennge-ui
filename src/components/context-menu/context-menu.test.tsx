import { fireEvent, render, screen } from "@testing-library/react";
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuSeparator, ContextMenuTrigger } from "./context-menu";

function FileMenu({ onRename, onDelete }: { onRename: () => void; onDelete: () => void }) {
  return (
    <ContextMenu>
      <ContextMenuTrigger>
        <div>button.tsx</div>
      </ContextMenuTrigger>
      <ContextMenuContent>
        <ContextMenuItem onAction={onRename} shortcut="F2">
          Rename
        </ContextMenuItem>
        <ContextMenuItem isDisabled>Move</ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuItem color="danger" onAction={onDelete}>
          Delete
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
}

describe("ContextMenu", () => {
  it("opens on right click with menu items", () => {
    render(<FileMenu onRename={vi.fn()} onDelete={vi.fn()} />);
    expect(screen.queryByRole("menu")).toBeNull();
    fireEvent.contextMenu(screen.getByText("button.tsx"));
    expect(screen.getByRole("menu")).toBeInTheDocument();
    expect(screen.getByRole("menuitem", { name: /Move/ })).toHaveAttribute("aria-disabled", "true");
  });

  it("runs the action of the chosen item and closes", () => {
    const onRename = vi.fn();
    render(<FileMenu onRename={onRename} onDelete={vi.fn()} />);
    fireEvent.contextMenu(screen.getByText("button.tsx"));
    fireEvent.click(screen.getByRole("menuitem", { name: /Rename/ }));
    expect(onRename).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole("menu")).toBeNull();
  });
});
