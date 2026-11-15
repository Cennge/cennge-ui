"use client";

import { useState } from "react";
import { Checkbox } from "cennge-ui";

const events = [
  { id: "pulls", label: "Pull requests", description: "Opened, reviewed and merged" },
  { id: "issues", label: "Issues", description: "New issues and replies" },
  { id: "releases", label: "Releases", description: "A new version on npm" },
  { id: "ci", label: "Failed CI runs", description: "On the main branch" },
];

export default function CheckboxPlate() {
  const [chosen, setChosen] = useState<string[]>(["pulls", "releases"]);
  const all = chosen.length === events.length;

  return (
    <fieldset className="flex w-full max-w-md flex-col gap-3">
      <legend className="mb-3 text-sm font-medium">Email me about cennge-ui</legend>
      <Checkbox
        isSelected={all}
        isIndeterminate={chosen.length > 0 && !all}
        onValueChange={(isSelected) => setChosen(isSelected ? events.map((event) => event.id) : [])}
      >
        Everything
      </Checkbox>
      <div className="flex flex-col gap-3 pl-7.5">
        {events.map((event) => (
          <Checkbox
            key={event.id}
            description={event.description}
            isSelected={chosen.includes(event.id)}
            onValueChange={(isSelected) =>
              setChosen((current) => (isSelected ? [...current, event.id] : current.filter((id) => id !== event.id)))
            }
          >
            {event.label}
          </Checkbox>
        ))}
      </div>
      <p className="mt-2 text-sm text-muted">
        {chosen.length === 0
          ? "No email from cennge-ui."
          : `${chosen.length} of ${events.length} events, sent to dev@example.com.`}
      </p>
    </fieldset>
  );
}
