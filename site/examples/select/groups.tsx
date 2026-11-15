"use client";

import { Select, SelectGroup, SelectItem, SelectSeparator } from "cennge-ui";

export default function RegionPicker() {
  return (
    <Select label="Region" placeholder="Pick a region" defaultValue="eu-central-1" className="w-full max-w-80">
      <SelectGroup label="Europe">
        <SelectItem value="eu-central-1" description="Frankfurt">
          eu-central-1
        </SelectItem>
        <SelectItem value="eu-west-1" description="Ireland">
          eu-west-1
        </SelectItem>
      </SelectGroup>
      <SelectSeparator />
      <SelectGroup label="North America">
        <SelectItem value="us-east-1" description="N. Virginia">
          us-east-1
        </SelectItem>
        <SelectItem value="us-west-2" description="Oregon">
          us-west-2
        </SelectItem>
        <SelectItem value="ca-central-1" description="Not enabled for this account" isDisabled>
          ca-central-1
        </SelectItem>
      </SelectGroup>
    </Select>
  );
}
