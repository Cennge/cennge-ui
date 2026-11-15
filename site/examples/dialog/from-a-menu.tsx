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
  Textarea,
  toast,
} from "cennge-ui";

function MoreIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-4" fill="currentColor" aria-hidden="true">
      <circle cx="5" cy="12" r="1.75" />
      <circle cx="12" cy="12" r="1.75" />
      <circle cx="19" cy="12" r="1.75" />
    </svg>
  );
}

export default function RepositoryMenu() {
  const [isEditOpen, setEditOpen] = useState(false);
  const menuButton = useRef<HTMLButtonElement>(null);

  return (
    <div className="flex w-full max-w-sm items-center justify-between gap-3 rounded-large bg-surface-3 py-2 pr-2 pl-4">
      <span className="font-medium">ai-niche-scout</span>
      <Dropdown>
        <DropdownTrigger ref={menuButton}>
          <Button isIconOnly variant="light" aria-label="ai-niche-scout actions">
            <MoreIcon />
          </Button>
        </DropdownTrigger>
        <DropdownContent align="end">
          <DropdownItem onAction={() => toast("Starred ai-niche-scout")}>Star</DropdownItem>
          <DropdownItem onAction={() => setEditOpen(true)}>Edit description…</DropdownItem>
        </DropdownContent>
      </Dropdown>

      <Dialog isOpen={isEditOpen} onOpenChange={setEditOpen}>
        <DialogContent
          size="sm"
          // The menu item that opened the dialog is gone by now: go back to the menu's button.
          onCloseAutoFocus={(event) => {
            event.preventDefault();
            menuButton.current?.focus();
          }}
        >
          <DialogHeader>
            <DialogTitle>Edit description</DialogTitle>
            <DialogDescription>Shown under the name of ai-niche-scout.</DialogDescription>
          </DialogHeader>
          <DialogBody>
            <Textarea
              label="Description"
              minRows={2}
              defaultValue="Validate an AI startup idea: competitors and 54 AI niches"
            />
          </DialogBody>
          <DialogFooter>
            <DialogClose>
              <Button variant="flat">Cancel</Button>
            </DialogClose>
            <DialogClose>
              <Button color="primary" onClick={() => toast.success("Description saved")}>
                Save
              </Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
