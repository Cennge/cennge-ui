"use client";

import {
  Button,
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
  Dropdown,
  DropdownContent,
  DropdownItem,
  DropdownTrigger,
  toast,
} from "cennge-ui";

const deploy = "payload-cache · main · 4f2c9e1";

const actions = [
  { label: "Redeploy", run: () => toast("Redeploying 4f2c9e1") },
  { label: "View build log", run: () => toast("Opening the build log") },
  { label: "Roll back to this deploy", run: () => toast.warning("Rolled back to 4f2c9e1") },
];

export default function DeployRow() {
  return (
    <ContextMenu>
      <ContextMenuTrigger>
        <div className="flex w-full max-w-md items-center gap-3 rounded-medium bg-surface-3 py-2 pr-2 pl-4 text-sm">
          <span className="size-2 shrink-0 rounded-full bg-success" aria-hidden="true" />
          <span className="min-w-0 flex-1 truncate">{deploy}</span>
          <Dropdown>
            <DropdownTrigger>
              <Button size="sm" variant="light">
                Actions
              </Button>
            </DropdownTrigger>
            <DropdownContent align="end">
              {actions.map((action) => (
                <DropdownItem key={action.label} onAction={action.run}>
                  {action.label}
                </DropdownItem>
              ))}
            </DropdownContent>
          </Dropdown>
        </div>
      </ContextMenuTrigger>
      <ContextMenuContent>
        {actions.map((action) => (
          <ContextMenuItem key={action.label} onAction={action.run}>
            {action.label}
          </ContextMenuItem>
        ))}
      </ContextMenuContent>
    </ContextMenu>
  );
}
