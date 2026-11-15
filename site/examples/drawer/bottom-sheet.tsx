"use client";

import {
  Button,
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
  Snippet,
} from "cennge-ui";

export default function CloneSheet() {
  return (
    <Drawer>
      <DrawerTrigger>
        <Button color="primary">Clone</Button>
      </DrawerTrigger>
      <DrawerContent placement="bottom">
        <DrawerHeader className="mx-auto w-full max-w-xl">
          <DrawerTitle>Clone ai-niche-scout</DrawerTitle>
          <DrawerDescription>Paste both lines into a terminal.</DrawerDescription>
        </DrawerHeader>
        <DrawerBody className="mx-auto w-full max-w-xl">
          <Snippet variant="bordered" className="w-full">
            {"git clone https://github.com/Cennge/ai-niche-scout.git\ncd ai-niche-scout"}
          </Snippet>
        </DrawerBody>
      </DrawerContent>
    </Drawer>
  );
}
