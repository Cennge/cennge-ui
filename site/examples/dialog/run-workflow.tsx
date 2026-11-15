"use client";

import { useState } from "react";
import {
  Button,
  Combobox,
  Dialog,
  DialogBody,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Select,
  SelectItem,
  toast,
} from "cennge-ui";

const branches = [
  "main",
  "feat/charts",
  "feat/sparkline",
  "feat/theme-switch",
  "feat/map",
  "feat/map-clusters",
  "fix/dialog-backdrop",
  "fix/dialog-popup-scroll",
  "fix/select-chevron",
  "fix/button-cursor",
  "fix/kbd-symbols",
  "fix/carousel-controls",
  "test/next-time-zones",
  "ci/firefox-xvfb",
].map((branch) => ({ value: branch, label: branch }));

const runners = ["ubuntu-24.04", "windows-2025", "macos-15"];

export default function RunWorkflow() {
  const [branch, setBranch] = useState<string | null>("main");
  const [runner, setRunner] = useState<string | null>("ubuntu-24.04");

  return (
    <Dialog>
      <DialogTrigger>
        <Button color="primary">Run workflow</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Run workflow</DialogTitle>
          <DialogDescription>ci.yml in Cennge/cennge-ui</DialogDescription>
        </DialogHeader>
        <DialogBody className="flex flex-col gap-4">
          <Combobox label="Branch" items={branches} value={branch} onValueChange={setBranch} />
          <Select label="Runner" value={runner} onValueChange={setRunner}>
            {runners.map((name) => (
              <SelectItem key={name} value={name}>
                {name}
              </SelectItem>
            ))}
          </Select>
        </DialogBody>
        <DialogFooter>
          <DialogClose>
            <Button variant="flat">Cancel</Button>
          </DialogClose>
          <DialogClose>
            <Button
              color="primary"
              isDisabled={!branch || !runner}
              onClick={() => toast.success("Run queued", { description: `${branch} on ${runner}` })}
            >
              Run
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
