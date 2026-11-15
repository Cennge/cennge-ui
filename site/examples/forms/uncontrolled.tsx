"use client";

import { useState, type FormEvent } from "react";
import { Button, Checkbox, DatePicker, Form, Input, Select, SelectItem, TagsInput } from "cennge-ui";

export default function ReleaseForm() {
  const [entries, setEntries] = useState<[string, string][]>([]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    setEntries(Array.from(data, ([name, value]) => [name, String(value)]));
  }

  return (
    <div className="@container w-full">
      <div className="grid gap-6 @lg:grid-cols-[minmax(0,1fr)_minmax(0,14rem)]">
        <Form aria-label="New release" onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Select name="repository" label="Repository" defaultValue="cennge-ui" isRequired>
            <SelectItem value="cennge-ui">cennge-ui</SelectItem>
            <SelectItem value="payload-cache">payload-cache</SelectItem>
            <SelectItem value="ai-niche-scout">ai-niche-scout</SelectItem>
          </Select>
          <Input
            name="version"
            label="Version"
            defaultValue="0.4.0"
            isRequired
            pattern="\d+\.\d+\.\d+"
            description="major.minor.patch"
          />
          <DatePicker name="date" label="Release date" defaultValue="2026-11-20" />
          <TagsInput name="tags" label="Dist-tags" defaultValue={["latest"]} placeholder="Add a tag" />
          <Checkbox name="changelog" defaultSelected>
            Add to the changelog
          </Checkbox>
          <Button type="submit" color="primary" className="self-start">
            Publish
          </Button>
        </Form>
        <section aria-label="What the form sends" className="flex flex-col gap-3 self-start rounded-large bg-surface-3 p-4">
          <h3 className="text-sm font-semibold">FormData</h3>
          {entries.length ? (
            <dl className="grid grid-cols-[auto_minmax(0,1fr)] gap-x-4 gap-y-1.5 font-mono text-[13px]">
              {entries.map(([name, value], index) => (
                <div key={index} className="contents">
                  <dt className="text-muted">{name}</dt>
                  <dd className="break-words">{value}</dd>
                </div>
              ))}
            </dl>
          ) : (
            <p className="text-sm text-muted">Press Publish to see the entries.</p>
          )}
        </section>
      </div>
    </div>
  );
}
