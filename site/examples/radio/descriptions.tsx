"use client";

import { Radio, RadioGroup } from "cennge-ui";

export default function VisibilityPicker() {
  return (
    <RadioGroup label="Visibility" defaultValue="public">
      <Radio value="public" description="Anyone on the internet can see this repository">
        Public
      </Radio>
      <Radio value="private" description="Only you and the people you invite">
        Private
      </Radio>
      <Radio value="internal" description="Needs an organization" isDisabled>
        Internal
      </Radio>
    </RadioGroup>
  );
}
