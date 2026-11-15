"use client";

import { TagsInput, type TagsInputEvent } from "cennge-ui";

const messages: Record<TagsInputEvent["type"], (tag: string) => string> = {
  added: (tag) => `Added ${tag}`,
  removed: (tag) => `Removed ${tag}`,
  duplicate: (tag) => `${tag} is already a label`,
  invalid: (tag) => `${tag}: use lowercase letters and hyphens`,
  limit: () => "Three labels at most",
};

export default function IssueLabels() {
  return (
    <TagsInput
      label="Labels"
      defaultValue={["bug"]}
      maxTags={3}
      validate={(label) => /^[a-z-]+$/.test(label)}
      formatAnnouncement={(event) => messages[event.type](event.tag)}
      description="Up to three, lowercase"
      className="w-full max-w-96"
    />
  );
}
