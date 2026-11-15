"use client";

import { useRef, useState } from "react";
import {
  Button,
  Dropdown,
  DropdownContent,
  DropdownItem,
  DropdownLabel,
  DropdownSeparator,
  DropdownTrigger,
  toast,
} from "cennge-ui";

const all = [
  { name: "cennge-ui", description: "React UI library on Radix UI and Tailwind CSS v4" },
  { name: "payload-cache", description: "FastAPI cache service" },
  { name: "ai-niche-scout", description: "Finds niches worth building for" },
];

function Icon({ d, weight = 2 }: { d: string; weight?: number }) {
  return (
    <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth={weight} aria-hidden="true">
      <path d={d} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

const icons = {
  repository: "M5 18.5V5.5A2.5 2.5 0 0 1 7.5 3H19v14H7.5A2.5 2.5 0 0 0 5 19.5 1.5 1.5 0 0 0 6.5 21H19",
  import: "M12 3v12m0 0-4-4m4 4 4-4M5 21h14",
  release: "M20 12 12 20l-9-9V3h8l9 9ZM7.5 7.5h.01",
  more: "M5 12h.01M12 12h.01M19 12h.01",
  chevron: "m6 9 6 6 6-6",
  copy: "M9 9h11v11H9zM5 15H4V4h11v1",
  star: "m12 3 2.8 5.7 6.2.9-4.5 4.4 1 6.2L12 17.3 6.5 20.2l1-6.2L3 9.6l6.2-.9L12 3Z",
  archive: "M3 4h18v4H3zM5 8v12h14V8M10 12h4",
  trash: "M4 7h16M9 7V4h6v3m-8 0 1 13h8l1-13",
};

async function copyCloneUrl(name: string) {
  const url = `https://github.com/Cennge/${name}.git`;
  try {
    await navigator.clipboard.writeText(url);
    toast.success("Clone URL copied", { description: url });
  } catch {
    toast.danger("Could not copy", { description: url });
  }
}

export default function DropdownPlate() {
  const [repositories, setRepositories] = useState(all);
  const newButton = useRef<HTMLButtonElement>(null);

  function remove(name: string) {
    const before = repositories;
    setRepositories(before.filter((repository) => repository.name !== name));
    // The row's menu button goes with it: put focus on New rather than lose it.
    setTimeout(() => newButton.current?.focus());
    toast(`Deleted ${name}`, { action: { label: "Undo", onClick: () => setRepositories(before) } });
  }

  return (
    <div className="w-full max-w-md">
      <div className="flex items-center justify-between gap-3">
        <p className="font-semibold">Repositories</p>
        <Dropdown>
          <DropdownTrigger>
            <Button ref={newButton} size="sm" color="primary" endContent={<Icon d={icons.chevron} weight={2.5} />}>
              New
            </Button>
          </DropdownTrigger>
          <DropdownContent align="end" className="w-72">
            <DropdownItem
              startContent={<Icon d={icons.repository} />}
              description="Start with an empty main branch"
              onAction={() => toast("New repository")}
            >
              Repository
            </DropdownItem>
            <DropdownItem
              startContent={<Icon d={icons.import} />}
              description="Bring one over from another Git host"
              onAction={() => toast("Import a repository")}
            >
              Import
            </DropdownItem>
            <DropdownItem
              startContent={<Icon d={icons.release} />}
              description="Tag a version and publish it to npm"
              onAction={() => toast("New release")}
            >
              Release
            </DropdownItem>
          </DropdownContent>
        </Dropdown>
      </div>

      <ul className="mt-3 divide-y divide-border">
        {repositories.map((repository) => (
          <li key={repository.name} className="flex items-center gap-3 py-3">
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold">{repository.name}</p>
              <p className="truncate text-sm text-muted">{repository.description}</p>
            </div>
            <Dropdown>
              <DropdownTrigger>
                <Button isIconOnly size="sm" variant="light" aria-label={`Actions for ${repository.name}`}>
                  <Icon d={icons.more} weight={3.5} />
                </Button>
              </DropdownTrigger>
              <DropdownContent align="end">
                <DropdownLabel>{repository.name}</DropdownLabel>
                <DropdownItem startContent={<Icon d={icons.copy} />} onAction={() => copyCloneUrl(repository.name)}>
                  Copy clone URL
                </DropdownItem>
                <DropdownItem startContent={<Icon d={icons.star} />} onAction={() => toast(`Starred ${repository.name}`)}>
                  Star
                </DropdownItem>
                <DropdownItem startContent={<Icon d={icons.archive} />} description="Has open pull requests" isDisabled>
                  Archive
                </DropdownItem>
                <DropdownSeparator />
                <DropdownItem color="danger" startContent={<Icon d={icons.trash} />} onAction={() => remove(repository.name)}>
                  Delete
                </DropdownItem>
              </DropdownContent>
            </Dropdown>
          </li>
        ))}
      </ul>
    </div>
  );
}
