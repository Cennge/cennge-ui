"use client";

import { Button, Dropdown, DropdownContent, DropdownItem, DropdownSeparator, DropdownTrigger, toast } from "cennge-ui";

export default function IssueActions() {
  return (
    <Dropdown>
      <DropdownTrigger>
        <Button variant="faded">Actions</Button>
      </DropdownTrigger>
      <DropdownContent>
        <DropdownItem shortcut="E" onAction={() => toast("Editing issue #12")}>
          Edit
        </DropdownItem>
        <DropdownItem shortcut="L" onAction={() => toast("Copied the link to issue #12")}>
          Copy link
        </DropdownItem>
        <DropdownItem shortcut="P" onAction={() => toast("Pinned issue #12")}>
          Pin to the top
        </DropdownItem>
        <DropdownSeparator />
        <DropdownItem color="danger" onAction={() => toast.danger("Closed issue #12")}>
          Close issue
        </DropdownItem>
      </DropdownContent>
    </Dropdown>
  );
}
