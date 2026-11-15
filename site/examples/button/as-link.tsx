"use client";

import Link from "next/link";
import { Button } from "cennge-ui";

export default function ButtonAsLink() {
  return (
    <div className="flex flex-wrap gap-3">
      {/* The Link renders the <a>; the Button gives it its look and its disabled and loading states. */}
      <Button asChild variant="flat" color="primary">
        <Link href="/docs/installation/">Install</Link>
      </Button>
      <Button asChild variant="flat" isDisabled>
        <Link href="/docs/theming/">Theming</Link>
      </Button>
    </div>
  );
}
