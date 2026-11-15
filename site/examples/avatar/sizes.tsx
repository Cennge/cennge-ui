"use client";

import { Avatar, type AvatarSize } from "cennge-ui";

const sizes: AvatarSize[] = ["sm", "md", "lg", "xl"];

export default function AvatarSizes() {
  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center gap-4">
        {sizes.map((size) => (
          <Avatar key={size} src="/avatar.svg" name="Cennge" size={size} />
        ))}
      </div>
      {/* Round for people, a softer square for projects. */}
      <div className="flex flex-wrap items-center gap-4">
        {sizes.map((size) => (
          <Avatar key={size} name="ai-niche-scout" color="info" radius="md" size={size} />
        ))}
      </div>
    </div>
  );
}
