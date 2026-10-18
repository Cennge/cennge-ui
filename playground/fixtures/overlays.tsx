import { useState } from "react";
import {
  Button,
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
  Dialog,
  DialogBody,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
  Dropdown,
  DropdownContent,
  DropdownItem,
  DropdownSeparator,
  DropdownTrigger,
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
  Input,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Tooltip,
} from "cennge-ui";

export default function OverlaysFixture() {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [log, setLog] = useState<string[]>([]);
  const record = (entry: string) => setLog((entries) => [...entries, entry]);

  return (
    <>
      <div className="flex flex-wrap gap-3">
        <Dialog>
          <DialogTrigger>
            <Button>Open dialog</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete project</DialogTitle>
              <DialogDescription>This cannot be undone.</DialogDescription>
            </DialogHeader>
            <DialogBody className="flex flex-col gap-3">
              <Input label="Type the name to confirm" />
              <Dropdown>
                <DropdownTrigger>
                  <Button variant="flat">More</Button>
                </DropdownTrigger>
                <DropdownContent>
                  <DropdownItem onAction={() => record("archive")}>Archive</DropdownItem>
                </DropdownContent>
              </Dropdown>
            </DialogBody>
            <DialogFooter>
              <DialogClose>
                <Button variant="flat">Cancel</Button>
              </DialogClose>
              <Button color="danger">Delete</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dropdown>
          <DropdownTrigger>
            <Button>Actions</Button>
          </DropdownTrigger>
          <DropdownContent>
            <DropdownItem onAction={() => record("edit")}>Edit</DropdownItem>
            <DropdownItem onAction={() => setSettingsOpen(true)}>Open settings</DropdownItem>
            <DropdownSeparator />
            <DropdownItem color="danger" onAction={() => record("delete")}>
              Delete
            </DropdownItem>
          </DropdownContent>
        </Dropdown>

        <Popover>
          <PopoverTrigger>
            <Button>Share</Button>
          </PopoverTrigger>
          <PopoverContent>
            <Input label="Link" defaultValue="github.com/Cennge/cennge-ui" />
          </PopoverContent>
        </Popover>

        <Tooltip content="Copy the link">
          <Button>Copy</Button>
        </Tooltip>

        <Drawer>
          <DrawerTrigger>
            <Button>Open drawer</Button>
          </DrawerTrigger>
          <DrawerContent>
            <DrawerHeader>
              <DrawerTitle>Repository settings</DrawerTitle>
              <DrawerDescription>cennge-ui</DrawerDescription>
            </DrawerHeader>
            <DrawerBody>
              <Input label="Name" defaultValue="cennge-ui" />
            </DrawerBody>
          </DrawerContent>
        </Drawer>
      </div>

      <Dialog isOpen={settingsOpen} onOpenChange={setSettingsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Settings</DialogTitle>
            <DialogDescription>Opened from a menu item.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose>
              <Button>Done</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <p>
        Made by{" "}
        <HoverCard>
          <HoverCardTrigger>
            <a href="#profile" className="font-semibold text-primary-text">
              @Cennge
            </a>
          </HoverCardTrigger>
          <HoverCardContent>20 repositories</HoverCardContent>
        </HoverCard>
      </p>

      <ContextMenu>
        <ContextMenuTrigger>
          <div data-testid="file-area" className="flex h-32 items-center justify-center rounded-large border-2 border-dashed border-border text-sm text-muted">
            button.tsx — right click
          </div>
        </ContextMenuTrigger>
        <ContextMenuContent>
          <ContextMenuItem onAction={() => record("rename")}>Rename</ContextMenuItem>
          <ContextMenuItem onAction={() => record("copy-path")}>Copy path</ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>

      <p>
        log: <span data-testid="log">{log.join(",")}</span>
      </p>
      {/* Tall page so scroll locking can be observed. */}
      <div aria-hidden="true" style={{ height: "150vh" }} />
    </>
  );
}
