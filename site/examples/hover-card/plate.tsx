"use client";

import { Avatar, HoverCard, HoverCardContent, HoverCardTrigger } from "cennge-ui";

const link =
  "rounded-small font-semibold underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary focus-visible:outline-solid";

const repositories: Record<string, string> = {
  "cennge-ui": "React UI library on Radix UI and Tailwind CSS v4",
  "payload-cache": "FastAPI cache service",
  "spredo-crypto-screener": "Crypto screener",
};

const activity = [
  { repository: "cennge-ui", action: "released", detail: "0.3.1", date: "Nov 1" },
  { repository: "payload-cache", action: "pushed to", detail: "main", date: "Oct 30" },
  { repository: "spredo-crypto-screener", action: "opened an issue in", date: "Oct 28" },
];

function RepositoryIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-4 shrink-0 text-muted" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path d="M5 18.5V5.5A2.5 2.5 0 0 1 7.5 3H19v14H7.5A2.5 2.5 0 0 0 5 19.5 1.5 1.5 0 0 0 6.5 21H19" strokeLinejoin="round" />
    </svg>
  );
}

function Profile() {
  return (
    <HoverCard>
      <HoverCardTrigger>
        <a href="https://github.com/Cennge" className={link}>
          Cennge
        </a>
      </HoverCardTrigger>
      <HoverCardContent align="start">
        <div className="flex items-center gap-3">
          <Avatar name="Cennge" color="primary" size="lg" />
          <div className="min-w-0">
            <p className="font-semibold">Cennge</p>
            <p className="text-muted">github.com/Cennge</p>
          </div>
        </div>
        <p className="mt-3 text-xs font-semibold text-muted">Repositories</p>
        <ul className="mt-1.5 grid gap-1">
          {Object.keys(repositories).map((name) => (
            <li key={name} className="flex items-center gap-2">
              <RepositoryIcon />
              {name}
            </li>
          ))}
        </ul>
      </HoverCardContent>
    </HoverCard>
  );
}

function Repository({ name }: { name: string }) {
  return (
    <HoverCard>
      <HoverCardTrigger>
        <a href={`https://github.com/Cennge/${name}`} className={`${link} whitespace-nowrap text-primary-text`}>
          {name}
        </a>
      </HoverCardTrigger>
      <HoverCardContent align="start">
        <p className="flex items-center gap-2 font-semibold">
          <RepositoryIcon />
          <span className="truncate">Cennge/{name}</span>
        </p>
        <p className="mt-1.5 text-muted">{repositories[name]}</p>
      </HoverCardContent>
    </HoverCard>
  );
}

export default function HoverCardPlate() {
  return (
    <div className="w-full max-w-md">
      <p className="text-sm font-semibold text-muted">Recent activity</p>
      <ul className="mt-2 divide-y divide-border">
        {activity.map((event) => (
          <li key={event.repository} className="flex items-start gap-3 py-3.5 text-sm leading-6">
            <Avatar name="Cennge" color="primary" size="sm" aria-hidden="true" />
            <p className="min-w-0 flex-1">
              <Profile /> {event.action} <Repository name={event.repository} />
              {event.detail ? <span className="text-muted"> {event.detail}</span> : null}
            </p>
            <span className="shrink-0 text-muted">{event.date}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
