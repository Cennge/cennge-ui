"use client";

import { Card, CardBody, ThemeSwitch, useTheme } from "cennge-ui";

// The same options everywhere: ThemeScript in the layout, this switch, every useTheme.
const themeOptions = { defaultTheme: "dark" } as const;

export default function Appearance() {
  const { theme, resolvedTheme } = useTheme(themeOptions);

  return (
    <Card className="w-full max-w-md">
      <CardBody className="gap-4 py-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="font-semibold">Appearance</p>
            <p className="text-sm text-muted">Light, dark, or as your device is set.</p>
          </div>
          <ThemeSwitch {...themeOptions} size="md" />
        </div>
        <dl className="grid grid-cols-2 gap-2 text-sm">
          <div className="rounded-medium bg-surface-2 px-3 py-2">
            <dt className="text-xs text-muted">theme</dt>
            <dd className="font-mono">{String(theme)}</dd>
          </div>
          <div className="rounded-medium bg-surface-2 px-3 py-2">
            <dt className="text-xs text-muted">resolvedTheme</dt>
            <dd className="font-mono">{String(resolvedTheme)}</dd>
          </div>
        </dl>
      </CardBody>
    </Card>
  );
}
