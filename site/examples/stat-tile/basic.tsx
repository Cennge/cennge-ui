"use client";

import { StatTile } from "cennge-ui";

export default function Downloads() {
  return <StatTile label="npm downloads, last 7 days" value={1284} delta={212} deltaLabel="vs the week before" className="w-full max-w-64" />;
}
