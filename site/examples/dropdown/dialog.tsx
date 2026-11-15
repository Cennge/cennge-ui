"use client";

import { useRef, useState } from "react";
import {
  Button,
  Dialog,
  DialogBody,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Dropdown,
  DropdownContent,
  DropdownItem,
  DropdownTrigger,
  Input,
  toast,
} from "cennge-ui";

export default function RenameFromMenu() {
  const [name, setName] = useState("payload-cache");
  const [draft, setDraft] = useState(name);
  const [isRenaming, setRenaming] = useState(false);
  const menuButton = useRef<HTMLButtonElement>(null);

  function rename() {
    setName(draft);
    setRenaming(false);
    toast.success(`Renamed to ${draft}`);
  }

  return (
    <>
      <Dropdown isModal={false}>
        <DropdownTrigger>
          <Button ref={menuButton} variant="flat">
            {name}
          </Button>
        </DropdownTrigger>
        <DropdownContent>
          <DropdownItem
            onAction={() => {
              setDraft(name);
              setRenaming(true);
            }}
          >
            Rename…
          </DropdownItem>
          <DropdownItem onAction={() => toast(`Opened ${name} settings`)}>Settings</DropdownItem>
        </DropdownContent>
      </Dropdown>

      <Dialog isOpen={isRenaming} onOpenChange={setRenaming}>
        <DialogContent
          size="sm"
          onCloseAutoFocus={(event) => {
            // The menu item that opened the dialog is gone: go back to the menu's button.
            event.preventDefault();
            menuButton.current?.focus();
          }}
        >
          <DialogHeader>
            <DialogTitle>Rename repository</DialogTitle>
            <DialogDescription>A new name for {name}.</DialogDescription>
          </DialogHeader>
          <form
            className="contents"
            onSubmit={(event) => {
              event.preventDefault();
              rename();
            }}
          >
            <DialogBody>
              <Input label="Name" value={draft} onValueChange={setDraft} isRequired />
            </DialogBody>
            <DialogFooter>
              <DialogClose>
                <Button variant="flat">Cancel</Button>
              </DialogClose>
              <Button type="submit" color="primary" isDisabled={!draft.trim() || draft === name}>
                Rename
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
