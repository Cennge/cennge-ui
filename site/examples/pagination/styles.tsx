"use client";

import { Pagination } from "cennge-ui";

export default function PaginationStyles() {
  return (
    <div className="flex flex-col gap-5">
      <Pagination aria-label="Small, round" total={5} defaultPage={2} size="sm" radius="full" color="secondary" />
      <Pagination aria-label="Without arrows" total={5} defaultPage={2} showControls={false} />
      <Pagination aria-label="Disabled" total={5} defaultPage={2} isDisabled />
    </div>
  );
}
