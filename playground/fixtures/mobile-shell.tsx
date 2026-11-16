import { useState } from "react";
import {
  BottomBar,
  BottomNavigation,
  BottomNavigationItem,
  Button,
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
  Dropdown,
  DropdownContent,
  DropdownItem,
  DropdownTrigger,
  FloatingActionButton,
  SwipeActions,
} from "cennge-ui";

const icon = (d: string) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d={d} />
  </svg>
);
const icons = {
  today: icon("M4 12h4l3-8 4 16 3-8h2"),
  log: icon("M5 4h14v16H5zM9 9h6M9 13h6"),
  progress: icon("M4 19V9M10 19V5M16 19v-7M22 19H2"),
  profile: icon("M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM4 21a8 8 0 0 1 16 0"),
  plus: icon("M12 5v14M5 12h14"),
  check: icon("M5 12.5l4.5 4.5L19 7.5"),
  copy: icon("M8 8h11v11H8zM5 16V5h11"),
  trash: icon("M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3"),
};

const runs = [
  { id: "e2e", name: "e2e (webkit), cennge-ui" },
  { id: "unit", name: "unit, payload-cache" },
  { id: "deploy", name: "deploy preview, ai-niche-scout" },
];

export default function MobileShellFixture() {
  const [tab, setTab] = useState("today");
  const [log, setLog] = useState("");
  const [rows, setRows] = useState(runs);
  const [snap, setSnap] = useState(0);

  return (
    <div className="flex flex-col gap-4 pb-48">
      <p data-testid="log">{log}</p>
      <ul className="flex flex-col divide-y divide-border overflow-hidden rounded-large border border-border">
        {rows.map((row) => (
          <li key={row.id}>
            <SwipeActions
              label={row.name}
              leadingActions={[{ key: "done", label: "Done", icon: icons.check, color: "success", onAction: () => setLog(`done ${row.id}`) }]}
              trailingActions={[
                { key: "copy", label: "Copy", icon: icons.copy, onAction: () => setLog(`copy ${row.id}`) },
                {
                  key: "delete",
                  label: "Delete",
                  icon: icons.trash,
                  color: "danger",
                  onAction: () => {
                    setRows((all) => all.filter((r) => r.id !== row.id));
                    setLog(`delete ${row.id}`);
                  },
                },
              ]}
            >
              <button type="button" className="w-full px-4 py-3 text-left text-sm outline-none focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-solid focus-visible:outline-ring" onClick={() => setLog(`open ${row.id}`)}>
                {row.name}
              </button>
            </SwipeActions>
          </li>
        ))}
      </ul>

      <Drawer>
        <DrawerTrigger>
          <Button className="self-start">Add a run</Button>
        </DrawerTrigger>
        <DrawerContent placement="bottom" snapPoints={[0.4, 0.9]} snapPoint={snap} onSnapPointChange={setSnap}>
          <DrawerHeader>
            <DrawerTitle>Add a run</DrawerTitle>
          </DrawerHeader>
          <DrawerBody>
            <p data-testid="snap">snap {snap}</p>
            {Array.from({ length: 30 }, (_, i) => (
              <button key={i} type="button" className="block w-full py-1.5 text-left" onClick={() => setLog(`workflow ${i + 1}`)}>
                Workflow {i + 1}
              </button>
            ))}
          </DrawerBody>
        </DrawerContent>
      </Drawer>

      <Drawer>
        <DrawerTrigger>
          <Button variant="flat" className="self-start">
            Filters
          </Button>
        </DrawerTrigger>
        <DrawerContent placement="bottom">
          <DrawerHeader>
            <DrawerTitle>Filters</DrawerTitle>
          </DrawerHeader>
          <DrawerBody>Only failed runs</DrawerBody>
        </DrawerContent>
      </Drawer>

      <Dropdown>
        <DropdownTrigger>
          <FloatingActionButton icon={icons.plus} label="Log" />
        </DropdownTrigger>
        <DropdownContent placement="top" align="end">
          <DropdownItem onAction={() => setLog("log run")}>Run</DropdownItem>
          <DropdownItem onAction={() => setLog("log deploy")}>Deploy</DropdownItem>
        </DropdownContent>
      </Dropdown>

      <BottomBar>
        <Button color="primary" fullWidth onClick={() => setLog("logged")}>
          Log set
        </Button>
      </BottomBar>

      <BottomNavigation aria-label="Main">
        {(["today", "log", "progress", "profile"] as const).map((key) => (
          <BottomNavigationItem
            key={key}
            icon={icons[key]}
            label={key[0]!.toUpperCase() + key.slice(1)}
            isActive={tab === key}
            badge={key === "log" ? 3 : key === "profile" ? true : undefined}
            onClick={() => setTab(key)}
          />
        ))}
      </BottomNavigation>
    </div>
  );
}
