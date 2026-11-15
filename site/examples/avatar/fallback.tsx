"use client";

import { Avatar } from "cennge-ui";

function PersonIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <circle cx="12" cy="8.5" r="3.75" />
      <path d="M4.75 20c.9-3.6 3.75-5.75 7.25-5.75s6.35 2.15 7.25 5.75" strokeLinecap="round" />
    </svg>
  );
}

export default function AvatarFallback() {
  return (
    <div className="flex flex-wrap items-center gap-4">
      {/* The picture, once it loads; alt text from name. */}
      <Avatar src="/avatar.svg" name="Cennge" size="lg" />
      {/* No picture: the first two letters of a single word. */}
      <Avatar name="Cennge" size="lg" />
      {/* First and last word: payload-cache is PC. */}
      <Avatar name="payload-cache" color="success" size="lg" />
      {/* Your own fallback instead of initials, e.g. for a signed-out visitor. */}
      <Avatar fallback={<PersonIcon />} size="lg" />
    </div>
  );
}
