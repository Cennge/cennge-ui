import { Accordion, AccordionItem, Button, Input, Select, SelectItem } from "cennge-ui";

export default function AccordionFixture() {
  return (
    <Accordion defaultValue="deploy" className="w-full max-w-80">
      <AccordionItem value="deploy" title="Deploy ai-niche-scout">
        <div className="flex flex-col gap-3">
          <Select label="Branch" defaultValue="main">
            <SelectItem value="main">main</SelectItem>
            <SelectItem value="next">next</SelectItem>
          </Select>
          <Input label="Environment" defaultValue="production" />
          <Button>Deploy</Button>
        </div>
      </AccordionItem>
      <AccordionItem value="settings" title="Settings">
        Nothing to set yet.
      </AccordionItem>
    </Accordion>
  );
}
