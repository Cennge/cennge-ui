"use client";

import { Button, type CenngeColor } from "cennge-ui";

const colors: CenngeColor[] = ["default", "primary", "secondary", "success", "warning", "danger", "info"];

export default function ButtonColors() {
  return (
    <div className="flex flex-wrap gap-3">
      {colors.map((color) => (
        <Button key={color} color={color}>
          {color[0]!.toUpperCase() + color.slice(1)}
        </Button>
      ))}
    </div>
  );
}
