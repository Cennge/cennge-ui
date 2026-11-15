"use client";

import { useState } from "react";
import { Avatar, Button, Indicator, type CenngeColor } from "cennge-ui";

const deploys: { name: string; status: string; color: CenngeColor }[] = [
  { name: "payload-cache", status: "Live", color: "success" },
  { name: "ai-niche-scout", status: "Building", color: "warning" },
  { name: "spredo-crypto-screener", status: "Failed", color: "danger" },
];

function BellIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path d="M6 8a6 6 0 1 1 12 0c0 7 3 9 3 9H3s3-2 3-9M10.3 21a1.94 1.94 0 0 0 3.4 0" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function InboxIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path d="M22 12h-6l-2 3h-4l-2-3H2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z" strokeLinejoin="round" />
    </svg>
  );
}

export default function IndicatorPlate() {
  const [unread, setUnread] = useState(3);

  return (
    <div className="flex w-full flex-col gap-5">
      <div className="flex items-center gap-4 rounded-large bg-surface-3 py-3 pr-4 pl-5">
        <span className="font-semibold">cennge-ui</span>
        <div className="ml-auto flex items-center gap-4">
          <Indicator content={128} color="primary" label="128 unread messages" className="ring-surface-3">
            <Button isIconOnly variant="flat" aria-label="Inbox">
              <InboxIcon />
            </Button>
          </Indicator>
          <Indicator
            content={unread}
            isInvisible={unread === 0}
            label={`${unread} unread notifications`}
            className="ring-surface-3"
          >
            <Button isIconOnly variant="flat" aria-label="Notifications" onClick={() => setUnread(0)}>
              <BellIcon />
            </Button>
          </Indicator>
          <Indicator color="success" shape="circle" placement="bottom-right" label="Online" className="ring-surface-3">
            <Avatar name="Cennge" color="primary" />
          </Indicator>
        </div>
      </div>
      <div className="flex items-center gap-4 px-1">
        <span className="text-sm text-muted">Deploys</span>
        {deploys.map((deploy) => (
          <Indicator key={deploy.name} color={deploy.color} size="sm" label={deploy.status} className="ring-surface-2">
            <Avatar name={deploy.name} radius="md" size="sm" />
          </Indicator>
        ))}
      </div>
      <Button size="sm" variant="flat" onClick={() => setUnread((count) => count + 1)} className="self-start">
        Send a notification
      </Button>
    </div>
  );
}
