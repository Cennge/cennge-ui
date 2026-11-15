"use client";

import { Accordion, AccordionItem } from "cennge-ui";

function WorkflowIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-5 text-muted" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <circle cx="6" cy="6" r="2.5" />
      <circle cx="18" cy="18" r="2.5" />
      <path d="M6 8.5V13a5 5 0 0 0 5 5h4.5" strokeLinecap="round" />
    </svg>
  );
}

export default function Workflows() {
  return (
    <Accordion selectionMode="multiple" variant="splitted" defaultValue={["ci"]} className="max-w-lg">
      <AccordionItem value="ci" title="CI" subtitle="On every push and pull request" startContent={<WorkflowIcon />}>
        Typecheck, unit tests, build, publint and are-the-types-wrong; the unit tests run on React 17, 18 and 19.
      </AccordionItem>
      <AccordionItem value="e2e" title="End-to-end" subtitle="Playwright" startContent={<WorkflowIcon />}>
        Chromium, Firefox and WebKit, on desktop and phone profiles, with axe in both themes.
      </AccordionItem>
      <AccordionItem value="release" title="Release" subtitle="changesets" startContent={<WorkflowIcon />}>
        Versions and the changelog come from changeset files; npm trusted publishing does the rest.
      </AccordionItem>
    </Accordion>
  );
}
