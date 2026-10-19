import { useState } from "react";
import { Rating } from "cennge-ui";

const HEART = "M12 20.5s-7.5-4.6-7.5-10.1A4.4 4.4 0 0 1 12 7.6a4.4 4.4 0 0 1 7.5 2.8c0 5.5-7.5 10.1-7.5 10.1Z";

function Heart({ filled }: { filled?: boolean }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="block size-full">
      <path d={HEART} fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth={1.75} strokeLinejoin="round" />
    </svg>
  );
}

export default function RatingFixture() {
  const [repo, setRepo] = useState(0);
  const [docs, setDocs] = useState(3.5);
  const [submitted, setSubmitted] = useState("");

  return (
    <>
      <button type="button">Before</button>

      <Rating label="Rate ai-niche-scout" value={repo} onValueChange={setRepo} />
      <p>
        repo: <span data-testid="repo">{repo}</span>
      </p>

      <Rating label="Docs quality" allowHalf value={docs} onValueChange={setDocs} size="lg" />
      <p>
        docs: <span data-testid="docs">{docs}</span>
      </p>

      <div className="flex items-center gap-2 text-sm text-muted">
        <Rating isReadOnly value={4.3} aria-label="Average rating" size="sm" />
        4.3 · 128 reviews
      </div>

      <Rating aria-label="Favourite" count={3} icon={<Heart filled />} emptyIcon={<Heart />} color="danger" defaultValue={2} />

      <form
        onSubmit={(event) => {
          event.preventDefault();
          setSubmitted(new URLSearchParams(new FormData(event.currentTarget) as unknown as Record<string, string>).toString());
        }}
        className="flex flex-col gap-3"
      >
        <Rating label="Release review" name="rating" defaultValue={4} description="Your rating is public" />
        <button type="submit" className="self-start rounded-small bg-surface-4 px-3 py-1.5 text-sm">
          Submit
        </button>
      </form>
      <p>
        submitted: <span data-testid="submitted">{submitted}</span>
      </p>

      <Rating label="Archived (disabled)" defaultValue={2} isDisabled />
      <button type="button">After</button>
    </>
  );
}
