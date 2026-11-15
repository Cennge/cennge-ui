"use client";

import { Pagination } from "cennge-ui";

export default function NarrowPagination() {
  return <Pagination aria-label="Release pages" total={40} defaultPage={20} siblings={0} />;
}
