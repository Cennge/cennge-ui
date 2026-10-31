import { ThemeSwitch, initTheme, useTheme } from "cennge-ui";

// As an app without server rendering starts: the stored theme, kept in step with the system and other tabs.
initTheme();

function Readout() {
  const { theme, resolvedTheme } = useTheme();
  return (
    <p data-testid="theme" className="text-sm text-muted">
      chosen {theme ?? "unknown"}, shown {resolvedTheme ?? "unknown"}
    </p>
  );
}

export default function ThemeFixture() {
  return (
    <div className="flex flex-col items-start gap-3">
      <ThemeSwitch />
      <ThemeSwitch size="md" labels={{ group: "Тема", light: "Светлая", dark: "Тёмная", system: "Как в системе" }} />
      <Readout />
    </div>
  );
}
