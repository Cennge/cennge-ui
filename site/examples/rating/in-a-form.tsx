"use client";

import { useState } from "react";
import { Button, Form, Rating, Textarea } from "cennge-ui";

export default function ReviewForm() {
  const [errors, setErrors] = useState<Record<string, string>>();
  const [sent, setSent] = useState<string | null>(null);

  return (
    <Form
      validationErrors={errors}
      onSubmit={(event) => {
        event.preventDefault();
        const rating = new FormData(event.currentTarget).get("rating");
        if (!rating) {
          setErrors({ rating: "Rate the release before sending" });
          return;
        }
        setErrors(undefined);
        setSent(String(rating));
      }}
      className="flex w-full max-w-96 flex-col gap-4"
    >
      <Rating name="rating" label="Rate payload-cache 1.4.0" isRequired />
      <Textarea name="review" label="What changed for you?" minRows={2} />
      <Button type="submit" color="primary" className="self-start">
        Send review
      </Button>
      <p aria-live="polite" className="text-sm text-muted">
        {sent === null ? "Nothing sent yet" : `Sent rating=${sent}`}
      </p>
    </Form>
  );
}
