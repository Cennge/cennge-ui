"use client";

import { Checkbox } from "cennge-ui";

export default function ProvenanceCheckbox() {
  return (
    <Checkbox defaultSelected description="npm links the package to the commit and the workflow that built it.">
      Publish with provenance
    </Checkbox>
  );
}
