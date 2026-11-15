"use client";

import { useState } from "react";
import { Accordion, AccordionItem } from "cennge-ui";

export default function RepositorySettings() {
  const [section, setSection] = useState("general");

  return (
    <div className="flex w-full max-w-lg flex-col gap-3">
      <Accordion variant="bordered" value={section} onValueChange={setSection} isCollapsible={false}>
        <AccordionItem value="general" title="General">
          Name, description and the default branch of payload-cache.
        </AccordionItem>
        <AccordionItem value="access" title="Access">
          Who can push to main, and who only opens pull requests.
        </AccordionItem>
        <AccordionItem value="danger" title="Danger zone" subtitle="Only the owner can open it" isDisabled>
          Transfer or delete the repository.
        </AccordionItem>
      </Accordion>
      <p className="text-sm text-muted">Open: {section}</p>
    </div>
  );
}
