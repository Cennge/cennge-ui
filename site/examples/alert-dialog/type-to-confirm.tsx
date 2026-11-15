"use client";

import { useRef, useState } from "react";
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

const repository = "Cennge/playwright-msi-scraper";

export default function DeleteRepository() {
  const [confirmation, setConfirmation] = useState("");
  const field = useRef<HTMLInputElement>(null);

  return (
    <AlertDialog onOpenChange={(isOpen) => !isOpen && setConfirmation("")}>
      <AlertDialogTrigger>
        <Button color="danger">Delete repository</Button>
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
          <AlertDialogAction
            color="danger"
            isDisabled={confirmation !== repository}
            onAction={() => toast.success("Repository deleted", { description: repository })}
          >
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
