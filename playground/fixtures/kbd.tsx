import { Kbd, type KbdKey } from "cennge-ui";

const keys: KbdKey[] = ["command", "shift", "option", "ctrl", "alt", "enter", "escape", "tab", "backspace", "delete", "space", "up", "down", "left", "right"];

export default function KbdFixture() {
  return (
    <div className="flex flex-col gap-4 text-sm text-muted">
      {(["md", "sm"] as const).map((size) => (
        <p key={size} data-testid={size} className="flex flex-wrap items-center gap-2">
          {keys.map((key) => (
            <Kbd key={key} keys={key} size={size} />
          ))}
        </p>
      ))}
      <p className="flex items-center gap-2">
        Search the repository <Kbd keys="command">K</Kbd>
      </p>
      <p className="flex items-center gap-2">
        New line in a comment <Kbd keys={["shift", "enter"]} />
      </p>
    </div>
  );
}
