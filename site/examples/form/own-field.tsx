"use client";

import { useState } from "react";
import { Button, Form, ToggleGroup, ToggleGroupItem, toast, useFormField } from "cennge-ui";

/** A ToggleGroup that takes part in a Form: its value is submitted, and errors for its name show under it. */
function ChannelField({ name }: { name: string }) {
  const [channel, setChannel] = useState<string | null>(null);
  const field = useFormField(name);

  return (
    // data-field-name lets the form find the field and focus it when it has an error.
    <div data-field-name={name} className="flex flex-col gap-1.5">
      <span className={field.isInvalid ? "text-sm font-medium text-danger-text" : "text-sm font-medium"}>Channel</span>
      <ToggleGroup
        aria-label="Channel"
        value={channel}
        onValueChange={(next) => {
          setChannel(next);
          field.markEdited();
        }}
      >
        <ToggleGroupItem value="latest">latest</ToggleGroupItem>
        <ToggleGroupItem value="next">next</ToggleGroupItem>
        <ToggleGroupItem value="beta">beta</ToggleGroupItem>
      </ToggleGroup>
      <input type="hidden" name={name} value={channel ?? ""} />
      {field.isInvalid ? (
        <p role="alert" className="text-xs text-danger-text">
          {field.errorMessage}
        </p>
      ) : null}
    </div>
  );
}

export default function PublishChannel() {
  const [errors, setErrors] = useState<Record<string, string>>();

  return (
    <Form
      validationErrors={errors}
      onSubmit={(event) => {
        event.preventDefault();
        const channel = new FormData(event.currentTarget).get("channel");
        setErrors(channel ? undefined : { channel: "Pick the tag to publish under" });
        if (channel) toast.success(`payload-cache@1.4.0 is on ${channel}`);
      }}
      className="flex flex-col items-start gap-4"
    >
      <ChannelField name="channel" />
      <Button type="submit" color="primary">
        Publish
      </Button>
    </Form>
  );
}
