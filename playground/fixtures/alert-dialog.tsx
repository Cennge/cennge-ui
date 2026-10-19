import { useState } from "react";
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
} from "cennge-ui";

declare global {
  interface Window {
    /** Settles the pending delete from a test: true succeeds, false fails. */
    finishDelete?: (ok: boolean) => void;
  }
}

const repository = "Cennge/cennge-ui";

export default function AlertDialogFixture() {
  const [confirmation, setConfirmation] = useState("");
  const [log, setLog] = useState<string[]>([]);
  const record = (entry: string) => setLog((entries) => [...entries, entry]);

  const deleteRepository = () =>
    new Promise<void>((resolve, reject) => {
      window.finishDelete = (ok) => (ok ? resolve() : reject(new Error("Network error")));
    }).then(
      () => record("deleted"),
      (error: unknown) => {
        record("failed");
        throw error; // keeps the dialog open
      },
    );

  return (
    <>
      <div className="flex flex-wrap gap-3">
        <AlertDialog onOpenChange={(isOpen) => !isOpen && setConfirmation("")}>
          <AlertDialogTrigger>
            <Button color="danger" variant="flat">
              Delete repository
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete {repository}?</AlertDialogTitle>
              <AlertDialogDescription>Issues, releases and the wiki will be deleted for good.</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogBody>
              <Input label={`Type ${repository} to confirm`} value={confirmation} onValueChange={setConfirmation} />
            </AlertDialogBody>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction color="danger" isDisabled={confirmation !== repository} onAction={deleteRepository}>
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <AlertDialog>
          <AlertDialogTrigger>
            <Button>Sign out</Button>
          </AlertDialogTrigger>
          <AlertDialogContent size="sm">
            <AlertDialogHeader>
              <AlertDialogTitle>Sign out of all devices?</AlertDialogTitle>
              <AlertDialogDescription>You will need to sign in again everywhere.</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Stay signed in</AlertDialogCancel>
              <AlertDialogAction onAction={() => record("signed-out")}>Sign out everywhere</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
      <p>
        log: <span data-testid="log">{log.join(",")}</span>
      </p>
    </>
  );
}
