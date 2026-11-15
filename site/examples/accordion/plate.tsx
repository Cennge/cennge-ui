"use client";

import { Accordion, AccordionItem } from "cennge-ui";

const code = "rounded-small bg-surface-4 px-1.5 py-0.5 font-mono text-[0.85em] whitespace-nowrap text-foreground";

export default function AccordionPlate() {
  return (
    <Accordion defaultValue="install" className="w-full">
      <AccordionItem value="install" title="How do I install it?" subtitle="One package, two CSS imports">
        Run <code className={code}>npm install cennge-ui</code>, then import <code className={code}>tailwindcss</code> and{" "}
        <code className={code}>cennge-ui/styles.css</code> in your CSS. The stylesheet registers the package with Tailwind
        itself.
      </AccordionItem>
      <AccordionItem value="accent" title="Can I change the accent?">
        Set <code className={code}>data-accent</code> on <code className={code}>&lt;html&gt;</code>, or on any part of the
        page, to orange, blue, green, violet or red, or define your own <code className={code}>--cennge-primary-*</code>{" "}
        variables.
      </AccordionItem>
      <AccordionItem value="next" title="Does it work with the App Router?">
        Yes. The components ship with &quot;use client&quot;, and server code imports <code className={code}>cn</code> and{" "}
        <code className={code}>tv</code> from <code className={code}>cennge-ui/utils</code>.
      </AccordionItem>
      <AccordionItem value="react" title="Which React versions?">
        18 and 19, and 17 as well: CI runs the unit tests on each.
      </AccordionItem>
    </Accordion>
  );
}
