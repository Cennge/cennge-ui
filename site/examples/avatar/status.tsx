"use client";

import { Avatar, Indicator } from "cennge-ui";

export default function AvatarStatus() {
  return (
    <div className="flex flex-wrap items-center gap-6">
      <Indicator shape="circle" color="success" label="Online">
        <Avatar src="/avatar.svg" name="Cennge" size="lg" />
      </Indicator>
      <Indicator shape="circle" content={3} label="3 failed CI runs">
        <Avatar name="payload-cache" color="success" size="lg" />
      </Indicator>
    </div>
  );
}
