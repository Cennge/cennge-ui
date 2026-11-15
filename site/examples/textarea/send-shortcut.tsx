"use client";

import { useState } from "react";
import { Button, Kbd, Textarea, toast } from "cennge-ui";

export default function CommentBox() {
  const [comment, setComment] = useState("");

  function send() {
    if (!comment.trim()) return;
    toast.success("Comment posted", { description: "On ai-niche-scout" });
    setComment("");
  }

  return (
    <div className="flex w-full max-w-md flex-col gap-3">
      <Textarea
        label="Comment"
        placeholder="Leave a comment"
        minRows={2}
        maxRows={6}
        value={comment}
        onValueChange={setComment}
        onKeyDown={(event) => {
          if (event.key === "Enter" && (event.ctrlKey || event.metaKey)) {
            event.preventDefault();
            send();
          }
        }}
        description={
          <>
            <Kbd size="sm" keys={["ctrl", "enter"]} /> or <Kbd size="sm" keys={["command", "enter"]} /> sends it
          </>
        }
      />
      <Button color="primary" className="self-end" isDisabled={!comment.trim()} onClick={send}>
        Comment
      </Button>
    </div>
  );
}
