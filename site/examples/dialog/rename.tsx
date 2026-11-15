"use client";

import { useState, type FormEvent } from "react";
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
  DialogTrigger,
  Input,
  toast,
} from "cennge-ui";

export default function RenameRepository() {
  const [isOpen, setOpen] = useState(false);
  const [name, setName] = useState("payload-cache");

  function rename(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const next = String(new FormData(event.currentTarget).get("name")).trim();
    if (!next) return;
    setName(next);
    setOpen(false);
    toast.success("Repository renamed", { description: `Cennge/${next}` });
  }

  return (
    <Dialog isOpen={isOpen} onOpenChange={setOpen}>
      <DialogTrigger>
        <Button variant="flat">Rename</Button>
      </DialogTrigger>
      <DialogContent size="sm">
        {/* "contents" keeps header, body and footer in the dialog's own layout. */}
        <form onSubmit={rename} className="contents">
          <DialogHeader>
            <DialogTitle>Rename repository</DialogTitle>
            <DialogDescription>Links to the old name keep working.</DialogDescription>
          </DialogHeader>
          <DialogBody>
            <Input label="Name" name="name" defaultValue={name} isRequired />
          </DialogBody>
          <DialogFooter>
            <DialogClose>
              <Button variant="flat">Cancel</Button>
            </DialogClose>
            <Button type="submit" color="primary">
              Rename
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
