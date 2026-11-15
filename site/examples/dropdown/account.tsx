"use client";

import {
  Avatar,
  Dropdown,
  DropdownContent,
  DropdownGroup,
  DropdownItem,
  DropdownLabel,
  DropdownSeparator,
  DropdownTrigger,
  toast,
} from "cennge-ui";

export default function AccountMenu() {
  return (
    <Dropdown>
      <DropdownTrigger>
        <button
          type="button"
          className="cursor-pointer rounded-full focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary focus-visible:outline-solid"
        >
          <Avatar name="Dev" color="primary" aria-hidden="true" />
          <span className="sr-only">Account</span>
        </button>
      </DropdownTrigger>
      <DropdownContent align="end">
        <DropdownLabel>dev@example.com</DropdownLabel>
        <DropdownGroup>
          <DropdownItem onAction={() => toast("Your profile")}>Profile</DropdownItem>
          <DropdownItem onAction={() => toast("Your repositories")}>Repositories</DropdownItem>
          <DropdownItem onAction={() => toast("Settings")}>Settings</DropdownItem>
        </DropdownGroup>
        <DropdownSeparator />
        <DropdownItem onAction={() => toast("Signed out")}>Sign out</DropdownItem>
      </DropdownContent>
    </Dropdown>
  );
}
