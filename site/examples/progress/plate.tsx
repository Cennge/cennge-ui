"use client";

import { useEffect, useState } from "react";
import { Button, CircularProgress, Progress } from "cennge-ui";

export default function ProgressPlate() {
  const [uploaded, setUploaded] = useState(64);
  const [isUploading, setUploading] = useState(false);

  useEffect(() => {
    if (!isUploading) return;
    // Stands in for upload events.
    const timer = setInterval(() => setUploaded((value) => Math.min(value + 9, 100)), 350);
    return () => clearInterval(timer);
  }, [isUploading]);

  useEffect(() => {
    if (uploaded === 100) setUploading(false);
  }, [uploaded]);

  function upload() {
    setUploaded(0);
    setUploading(true);
  }

  return (
    <div className="flex w-full flex-col gap-7">
      <div className="flex flex-col gap-3">
        <Progress label="payload-cache-1.4.0.tgz" value={uploaded} />
        <Button size="sm" variant="flat" isLoading={isUploading} onClick={upload} className="self-start">
          {isUploading ? "Uploading" : "Upload again"}
        </Button>
      </div>
      <Progress label="Cloning spredo-crypto-screener" color="secondary" size="sm" />
      <div className="flex flex-wrap items-end gap-8">
        <CircularProgress
          label="CI jobs"
          value={3}
          max={5}
          formatValue={(value, max) => `${value} of ${max}`}
          showValue
          size="lg"
          color="success"
        />
        <CircularProgress label="Waiting for a runner" size="lg" color="default" />
      </div>
    </div>
  );
}
