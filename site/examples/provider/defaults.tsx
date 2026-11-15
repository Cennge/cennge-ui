"use client";

import { useState } from "react";
import {
  Button,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  CenngeProvider,
  Checkbox,
  Input,
  Select,
  SelectItem,
  ToggleGroup,
  ToggleGroupItem,
  type CenngeColor,
  type CenngeRadius,
  type CenngeSize,
} from "cennge-ui";

const sizes: CenngeSize[] = ["sm", "md", "lg"];
const radii: CenngeRadius[] = ["none", "sm", "md", "lg", "full"];
const colors: CenngeColor[] = ["default", "primary", "secondary", "success", "warning", "danger", "info"];

export default function ProviderDefaults() {
  const [size, setSize] = useState<CenngeSize>("md");
  const [radius, setRadius] = useState<CenngeRadius>("md");
  const [color, setColor] = useState<CenngeColor>("primary");

  return (
    <div className="@container w-full">
      <div className="grid gap-6 @xl:grid-cols-[minmax(0,13rem)_minmax(0,1fr)]">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <span className="text-sm font-medium">size</span>
            <ToggleGroup
              aria-label="size"
              size="sm"
              value={size}
              onValueChange={(value) => value && setSize(value as CenngeSize)}
            >
              {sizes.map((item) => (
                <ToggleGroupItem key={item} value={item}>
                  {item}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
          </div>
          <div className="flex flex-col gap-1.5">
            <span className="text-sm font-medium">radius</span>
            <ToggleGroup
              aria-label="radius"
              size="sm"
              value={radius}
              onValueChange={(value) => value && setRadius(value as CenngeRadius)}
            >
              {radii.map((item) => (
                <ToggleGroupItem key={item} value={item}>
                  {item}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
          </div>
          <Select
            label="color"
            size="sm"
            value={color}
            onValueChange={(value) => value && setColor(value as CenngeColor)}
          >
            {colors.map((item) => (
              <SelectItem key={item} value={item}>
                {item}
              </SelectItem>
            ))}
          </Select>
        </div>

        <CenngeProvider size={size} radius={radius} color={color}>
          <Card variant="bordered" className="bg-surface-1">
            <CardHeader className="font-semibold">Invite to payload-cache</CardHeader>
            <CardBody className="flex flex-col gap-4">
              <Input label="Email" type="email" defaultValue="dev@example.com" />
              <Select label="Role" defaultValue="maintain">
                <SelectItem value="read">Read</SelectItem>
                <SelectItem value="write">Write</SelectItem>
                <SelectItem value="maintain">Maintain</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
              </Select>
              <Checkbox defaultSelected>Can publish to npm</Checkbox>
            </CardBody>
            <CardFooter className="justify-end gap-2">
              <Button variant="light">Cancel</Button>
              <Button variant="solid">Send invite</Button>
            </CardFooter>
          </Card>
        </CenngeProvider>
      </div>
    </div>
  );
}
