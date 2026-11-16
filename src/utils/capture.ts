import type * as React from "react";

/** Keeps the pointer on the element that follows it; a pointer the browser has already let go is left. */
export function capture(event: React.PointerEvent<HTMLElement>) {
  try {
    event.currentTarget.setPointerCapture(event.pointerId);
  } catch {
    // Not an active pointer any more (or a synthetic one): the moves still arrive while it stays over.
  }
}
