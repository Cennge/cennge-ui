"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger, type TabsVariant } from "cennge-ui";

const files = [
  { value: "readme", label: "README.md", text: "Tactile, dark-first React components on Radix UI and Tailwind CSS v4." },
  { value: "changelog", label: "CHANGELOG.md", text: "0.3.1: the README's map examples are set in New York." },
  { value: "license", label: "LICENSE", text: "MIT License, copyright 2026 Cennge." },
];

const variants: TabsVariant[] = ["solid", "underlined", "light"];

export default function TabsVariants() {
  return (
    <div className="flex w-full flex-col gap-8">
      {variants.map((variant) => (
        <Tabs key={variant} defaultValue="readme" variant={variant} color={variant === "solid" ? "default" : "primary"}>
          <TabsList aria-label={`Files, ${variant}`}>
            {files.map((file) => (
              <TabsTrigger key={file.value} value={file.value}>
                {file.label}
              </TabsTrigger>
            ))}
          </TabsList>
          {files.map((file) => (
            <TabsContent key={file.value} value={file.value} className="text-sm text-muted">
              {file.text}
            </TabsContent>
          ))}
        </Tabs>
      ))}
    </div>
  );
}
