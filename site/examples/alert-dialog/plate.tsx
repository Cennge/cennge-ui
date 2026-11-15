"use client";

import { useRef, useState, type ReactNode } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogBody,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
  Button,
  Input,
  toast,
} from "cennge-ui";

const repository = "Cennge/payload-cache";

function Row({ title, detail, action }: { title: string; detail: string; action: ReactNode }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3 px-5 py-4">
      <div className="min-w-0 flex-1 basis-56">
        <p className="font-medium">{title}</p>
        <p className="mt-0.5 text-sm text-muted">{detail}</p>
      </div>
      {action}
    </div>
  );
}

function Archive() {
  const [isArchived, setArchived] = useState(false);
  const [isAsking, setAsking] = useState(false);

  return (
    <Row
      title={isArchived ? "Unarchive this repository" : "Archive this repository"}
      detail={isArchived ? "payload-cache is read-only now." : "Read-only until you unarchive it."}
      action={
        <>
          <Button variant="flat" color={isArchived ? "default" : "warning"} onClick={() => (isArchived ? setArchived(false) : setAsking(true))}>
            {isArchived ? "Unarchive" : "Archive"}
          </Button>
          <AlertDialog isOpen={isAsking} onOpenChange={setAsking}>
            <AlertDialogContent size="sm">
              <AlertDialogHeader>
                <AlertDialogTitle>Archive payload-cache?</AlertDialogTitle>
                <AlertDialogDescription>Issues, pull requests and the wiki become read-only until you unarchive it.</AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction color="warning" onAction={() => setArchived(true)}>
                  Archive
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </>
      }
    />
  );
}

function Delete() {
  const [confirmation, setConfirmation] = useState("");
  const field = useRef<HTMLInputElement>(null);

  // Stands in for the real request.
  const deleteRepository = () =>
    new Promise<void>((resolve) => setTimeout(resolve, 2000)).then(() =>
      toast.success("Repository deleted", { description: repository }),
    );

  return (
    <Row
      title="Delete this repository"
      detail="Issues, releases and the wiki go with it."
      action={
        <AlertDialog onOpenChange={(isOpen) => !isOpen && setConfirmation("")}>
          <AlertDialogTrigger>
            <Button variant="flat" color="danger">
              Delete
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent
            onOpenAutoFocus={(event) => {
              event.preventDefault();
              field.current?.focus();
            }}
          >
            <AlertDialogHeader>
              <AlertDialogTitle>Delete {repository}?</AlertDialogTitle>
              <AlertDialogDescription>Issues, releases and the wiki will be deleted for good.</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogBody>
              <Input ref={field} label={`Type ${repository} to confirm`} value={confirmation} onValueChange={setConfirmation} />
            </AlertDialogBody>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction color="danger" isDisabled={confirmation !== repository} onAction={deleteRepository}>
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      }
    />
  );
}

export default function AlertDialogPlate() {
  return (
    <section aria-labelledby="danger-zone" className="w-full max-w-lg rounded-large border border-border bg-surface-3">
      <p id="danger-zone" className="border-b border-border px-5 py-3 text-sm font-semibold text-danger-text">
        Danger zone
      </p>
      <div className="divide-y divide-border">
        <Archive />
        <Delete />
      </div>
    </section>
  );
}
