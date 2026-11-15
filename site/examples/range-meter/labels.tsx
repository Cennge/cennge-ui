"use client";

import { RangeMeter } from "cennge-ui";

export default function ReviewQueue() {
  return (
    <RangeMeter
      label="Reviews this week"
      value={4}
      low={6}
      labels={{ toGo: (amount) => `${amount} more to reach the team goal` }}
      className="max-w-sm"
    />
  );
}
