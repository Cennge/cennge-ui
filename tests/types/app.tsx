// An app on React 17 or 18. CI compiles it against that React's types with skipLibCheck off, so the
// published declarations (dist/*.d.ts, through the package's own "exports") must hold up under each.
import * as React from "react";
import {
  Button,
  DatePicker,
  Dialog,
  DialogContent,
  DialogTrigger,
  Form,
  Input,
  Toaster,
  VirtualList,
  toast,
} from "cennge-ui";
import { cn } from "cennge-ui/utils";

const repositories = ["ai-niche-scout", "cennge-ui", "payload-cache", "spredo-crypto-screener"];

export function App() {
  const [release, setRelease] = React.useState<string | null>(null);
  const nameRef = React.useRef<HTMLInputElement>(null);
  return (
    <div className={cn("grid gap-4", release && "pt-2")}>
      <Form onSubmit={(event) => event.preventDefault()}>
        <Input ref={nameRef} name="repository" label="Repository" isRequired />
        <DatePicker label="Release date" value={release} onValueChange={setRelease} />
        <Button type="submit" color="primary" onClick={() => toast.success("Saved")}>
          Save
        </Button>
      </Form>
      <Dialog>
        <DialogTrigger>
          <Button variant="flat">Details</Button>
        </DialogTrigger>
        <DialogContent>cennge-ui</DialogContent>
      </Dialog>
      <VirtualList items={repositories} getKey={(name) => name} aria-label="Repositories" className="h-40">
        {(name, index) => <span>{`${index + 1}. ${name}`}</span>}
      </VirtualList>
      <Toaster placement="top-right" />
    </div>
  );
}
