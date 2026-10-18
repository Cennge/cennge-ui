import { useState } from "react";
import { TagsInput } from "cennge-ui";

export default function TagsInputFixture() {
  const [topics, setTopics] = useState<string[]>(["react"]);
  const [submitted, setSubmitted] = useState("");

  return (
    <>
      <TagsInput
        label="Topics"
        value={topics}
        onValueChange={setTopics}
        isClearable
        placeholder="Add a topic"
        description="Enter or comma adds a topic"
      />
      <p>
        topics: <span data-testid="topics">{topics.join("|")}</span>
      </p>

      <form
        className="flex flex-col gap-3"
        onSubmit={(event) => {
          event.preventDefault();
          setSubmitted(JSON.stringify(new FormData(event.currentTarget).getAll("labels")));
        }}
      >
        <TagsInput
          label="Labels"
          name="labels"
          defaultValue={["bug"]}
          maxTags={3}
          validate={(tag) => /^[a-z-]+$/.test(tag)}
          description="Lowercase, up to 3"
        />
        <button type="submit" className="self-start rounded-small bg-surface-4 px-3 py-1.5 text-sm">
          Save
        </button>
      </form>
      <p>
        submitted: <span data-testid="submitted">{submitted}</span>
      </p>
    </>
  );
}
