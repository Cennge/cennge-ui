"use client";

import { useRef, useState } from "react";
import {
  Alert,
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
  toast,
} from "cennge-ui";

export default function DeletePreview() {
  const [error, setError] = useState<string | null>(null);
  const attempts = useRef(0);

  // Stands in for the real request: every other attempt fails.
  function requestDelete() {
    attempts.current += 1;
    const fails = attempts.current % 2 === 1;
    return new Promise<void>((resolve, reject) =>
      setTimeout(() => (fails ? reject(new Error("The deploy service did not answer.")) : resolve()), 1500),
    );
  }

  async function deletePreview() {
    setError(null);
    try {
      await requestDelete();
      toast.success("Preview deleted", { description: "spredo-crypto-screener" });
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Something went wrong.");
      throw reason; // a rejected promise keeps the dialog open
    }
  }

  return (
    <AlertDialog onOpenChange={(isOpen) => !isOpen && setError(null)}>
      <AlertDialogTrigger>
        <Button variant="flat" color="danger">
          Delete preview
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete the preview of spredo-crypto-screener?</AlertDialogTitle>
          <AlertDialogDescription>Its link stops working. The branch and its commits stay.</AlertDialogDescription>
        </AlertDialogHeader>
        {error ? (
          <AlertDialogBody>
            <Alert color="danger" title="The preview is still there" description={`${error} Try again or cancel.`} />
          </AlertDialogBody>
        ) : null}
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction color="danger" onAction={deletePreview}>
            {error ? "Try again" : "Delete preview"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
