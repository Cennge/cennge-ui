import { useState } from "react";
import { createPortal } from "react-dom";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogBody,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
  Button,
  Combobox,
  Dialog,
  DialogBody,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Select,
  SelectItem,
  type ComboboxItem,
} from "cennge-ui";

const items = (names: string[]): ComboboxItem[] => names.map((name) => ({ value: name, label: name }));

const branches = items(["main", "develop", ...Array.from({ length: 38 }, (_, i) => `feat/issue-${101 + i}`)]);
const labels = items(["bug", "enhancement", "documentation", ...Array.from({ length: 37 }, (_, i) => `area/${i + 1}`)]);
const owners = items(["Cennge", ...Array.from({ length: 39 }, (_, i) => `team-${i + 1}`)]);
const runners = ["ubuntu-24.04", "windows-2025", "macos-15", ...Array.from({ length: 27 }, (_, i) => `self-hosted-${i + 1}`)];

/**
 * A popup of another library: in a portal of its own, not a Radix layer. Like any such popup over a modal
 * Radix dialog, it takes pointer events back from the page.
 */
function ThirdPartyPopup() {
  const [isOpen, setOpen] = useState(false);
  return (
    <>
      <Button variant="flat" onClick={() => setOpen((open) => !open)}>
        Mentions
      </Button>
      {isOpen
        ? createPortal(
            <ul aria-label="Mentions" tabIndex={0} className="pointer-events-auto fixed bottom-4 left-4 z-[60] max-h-40 w-56 overflow-y-auto rounded-medium border border-border bg-surface-3 p-2 text-sm">
              {Array.from({ length: 30 }, (_, i) => (
                <li key={i} className="px-2 py-1.5">
                  @user-{i + 1}
                </li>
              ))}
            </ul>,
            document.body,
          )
        : null}
    </>
  );
}

/** Lists in portals, opened from inside dialogs: each must scroll with the wheel and with a finger (Radix #1159). */
export default function DialogScrollFixture() {
  return (
    // Taller than the screen, so a scroll that leaks out of a dialog would move the page.
    <div className="flex min-h-[200vh] flex-wrap items-start gap-3">
      <Dialog>
        <DialogTrigger>
          <Button>Move issues</Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Move issues</DialogTitle>
          </DialogHeader>
          <DialogBody className="flex flex-col gap-3">
            <Combobox label="Branch" items={branches} />
            <Select label="Runner" placeholder="Pick a runner">
              {runners.map((runner) => (
                <SelectItem key={runner} value={runner}>
                  {runner}
                </SelectItem>
              ))}
            </Select>
            <Popover>
              <PopoverTrigger>
                <Button variant="flat">Activity</Button>
              </PopoverTrigger>
              <PopoverContent className="w-64 p-2">
                <ul aria-label="Activity" tabIndex={0} className="max-h-40 overflow-y-auto rounded-small outline-none focus-visible:outline-2 focus-visible:outline-ring">
                  {Array.from({ length: 30 }, (_, i) => (
                    <li key={i} className="px-2 py-1.5">
                      cennge-ui: CI passed on #{120 - i}
                    </li>
                  ))}
                </ul>
              </PopoverContent>
            </Popover>
            <ThirdPartyPopup />
          </DialogBody>
        </DialogContent>
      </Dialog>

      <Drawer>
        <DrawerTrigger>
          <Button>Filters</Button>
        </DrawerTrigger>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Filters</DrawerTitle>
          </DrawerHeader>
          <DrawerBody>
            <Combobox label="Label" items={labels} />
          </DrawerBody>
        </DrawerContent>
      </Drawer>

      <AlertDialog>
        <AlertDialogTrigger>
          <Button color="danger">Transfer payload-cache</Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Transfer payload-cache</AlertDialogTitle>
          </AlertDialogHeader>
          <AlertDialogBody>
            <Combobox label="New owner" items={owners} />
          </AlertDialogBody>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction color="danger">Transfer</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
