"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
  Button,
  toast,
} from "cennge-ui";

export default function DiscardDraft() {
  return (
    <AlertDialog>
      <AlertDialogTrigger>
        <Button variant="flat">Discard draft</Button>
      </AlertDialogTrigger>
      <AlertDialogContent size="sm">
        <AlertDialogHeader>
          <AlertDialogTitle>Discard the draft?</AlertDialogTitle>
          <AlertDialogDescription>The title and notes of cennge-ui 0.3.2 are lost. Published releases stay as they are.</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Keep editing</AlertDialogCancel>
          <AlertDialogAction color="danger" onAction={() => toast("Draft discarded")}>
            Discard
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
