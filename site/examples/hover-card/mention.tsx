"use client";

import { Avatar, HoverCard, HoverCardContent, HoverCardTrigger } from "cennge-ui";

export default function MentionCard() {
  return (
    <p className="text-sm">
      Reviewed by{" "}
      <HoverCard>
        <HoverCardTrigger>
          <a href="https://github.com/Cennge" className="font-semibold text-primary-text hover:underline">
            @Cennge
          </a>
        </HoverCardTrigger>
        <HoverCardContent>
          <div className="flex items-center gap-3">
            <Avatar name="Cennge" color="primary" />
            <div>
              <p className="font-semibold">Cennge</p>
              <p className="text-muted">Maintains cennge-ui and payload-cache</p>
            </div>
          </div>
        </HoverCardContent>
      </HoverCard>{" "}
      before the release.
    </p>
  );
}
