"use client";

import { useState } from "react";
import { Badge, TagsInput } from "cennge-ui";

const maxTopics = 6;

export default function TagsInputPlate() {
  const [topics, setTopics] = useState(["react", "typescript", "tailwindcss"]);

  return (
    <div className="flex w-full max-w-xl flex-col gap-5">
      <TagsInput
        label="Topics"
        placeholder="Add a topic"
        value={topics}
        onValueChange={setTopics}
        validate={(topic) => /^[a-z0-9][a-z0-9-]*$/.test(topic)}
        maxTags={maxTopics}
        isClearable
        description={`${topics.length} of ${maxTopics}. Lowercase letters, digits and hyphens.`}
      />
      <section aria-label="Preview" className="flex flex-col gap-1 rounded-large bg-surface-3 px-4 py-3.5">
        <p className="text-sm">
          <span className="font-semibold">cennge-ui</span>
          <span className="text-muted"> · React UI library</span>
        </p>
        <div className="flex flex-wrap gap-1.5 pt-1.5">
          {topics.length ? (
            topics.map((topic) => (
              <Badge key={topic} color="primary" size="sm">
                {topic}
              </Badge>
            ))
          ) : (
            <span className="text-sm text-muted">No topics</span>
          )}
        </div>
      </section>
    </div>
  );
}
