"use client";

import {
  Button,
  Drawer,
  DrawerBody,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
  Input,
  Switch,
  Textarea,
  toast,
} from "cennge-ui";

export default function RepositorySettings() {
  return (
    <Drawer>
      <DrawerTrigger>
        <Button variant="flat">Settings</Button>
      </DrawerTrigger>
      <DrawerContent size="lg">
        <DrawerHeader>
          <DrawerTitle>Repository settings</DrawerTitle>
          <DrawerDescription>Cennge/spredo-crypto-screener</DrawerDescription>
        </DrawerHeader>
        <DrawerBody className="flex flex-col gap-5">
          <Input label="Name" defaultValue="spredo-crypto-screener" />
          <Textarea label="Description" minRows={2} defaultValue="Crypto project screener: FastAPI and CoinGecko behind, Next.js in front" />
          <Switch defaultSelected>Issues</Switch>
          <Switch>Discussions</Switch>
          <Switch defaultSelected>Deploy previews for pull requests</Switch>
        </DrawerBody>
        <DrawerFooter>
          <DrawerClose>
            <Button variant="flat">Cancel</Button>
          </DrawerClose>
          <DrawerClose>
            <Button color="primary" onClick={() => toast.success("Settings saved")}>
              Save
            </Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
