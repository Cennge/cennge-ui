"use client";

import { Avatar, Indicator, type CenngeColor } from "cennge-ui";

const people: { name: string; status: string; color: CenngeColor }[] = [
  { name: "Ann Lee", status: "Online", color: "success" },
  { name: "Max Hart", status: "Away", color: "warning" },
  { name: "Ira Cole", status: "Busy", color: "danger" },
];

export default function AvatarStatus() {
  return (
    <ul className="flex flex-wrap gap-x-8 gap-y-4">
      {people.map((person) => (
        <li key={person.name} className="flex items-center gap-3">
          {/* The status is written beside the avatar, so the dot needs no label of its own. */}
          <Indicator color={person.color} shape="circle" placement="bottom-right" size="lg">
            <Avatar name={person.name} size="lg" />
          </Indicator>
          <span className="flex flex-col text-sm">
            <span className="font-medium">{person.name}</span>
            <span className="text-muted">{person.status}</span>
          </span>
        </li>
      ))}
    </ul>
  );
}
