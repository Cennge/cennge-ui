"use client";

import { Button, Drawer, DrawerBody, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from "cennge-ui";

const workflows = ["ci.yml", "release.yml", "pages.yml", "nightly-scrape.yml", "deploy-preview.yml", "size.yml", "codeql.yml", "stale.yml"];

export default function PickWorkflow() {
  return (
    <Drawer>
      <DrawerTrigger>
        <Button>Run a workflow</Button>
      </DrawerTrigger>
      <DrawerContent placement="bottom" snapPoints={[0.45, 0.9]}>
        <DrawerHeader>
          <DrawerTitle>Run a workflow</DrawerTitle>
        </DrawerHeader>
        <DrawerBody>
          <ul className="flex flex-col">
            {workflows.map((workflow) => (
              <li key={workflow}>
                <button type="button" className="w-full rounded-medium px-2 py-3 text-left hover:bg-default-500/10">
                  {workflow}
                </button>
              </li>
            ))}
          </ul>
        </DrawerBody>
      </DrawerContent>
    </Drawer>
  );
}
