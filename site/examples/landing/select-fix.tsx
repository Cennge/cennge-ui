"use client";

import { useState } from "react";
import { Accordion, AccordionItem, Select, SelectItem } from "cennge-ui";

export default function SelectFix() {
  const [branch, setBranch] = useState<string | null>("main");

  return (
    <Accordion defaultValue="deploy" className="w-full max-w-80">
      <AccordionItem value="deploy" title="Deploy ai-niche-scout">
        <Select label="Branch" value={branch} onValueChange={setBranch}>
          <SelectItem value="main">main</SelectItem>
          <SelectItem value="next">next</SelectItem>
          <SelectItem value="changeset-release/main">changeset-release/main</SelectItem>
        </Select>
      </AccordionItem>
    </Accordion>
  );
}
