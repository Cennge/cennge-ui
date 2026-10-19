"use client";

import { useEffect } from "react";

/** Marks the page once React has hydrated it: effects run only after their tree has committed. */
export function Hydrated() {
  useEffect(() => {
    document.documentElement.dataset.hydrated = "";
  }, []);
  return null;
}
