import { useState } from "react";
import { Button, Pagination } from "cennge-ui";

export default function ButtonFixture() {
  const [clicks, setClicks] = useState(0);
  const count = () => setClicks((n) => n + 1);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-3">
        <Button color="primary" onClick={count}>
          Save
        </Button>
        <Button color="primary" isLoading onClick={count}>
          Saving
        </Button>
        <Button isDisabled onClick={count}>
          Archived
        </Button>
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <Button asChild variant="flat">
          <a href="#releases">Releases</a>
        </Button>
        <Button asChild variant="flat" isDisabled>
          <a href="#settings" onClick={count}>
            Settings
          </a>
        </Button>
        <Button asChild variant="flat" isLoading>
          <a href="#deploys" onClick={count}>
            Deploys
          </a>
        </Button>
      </div>
      <p data-testid="clicks" className="text-sm text-muted">
        clicks {clicks}
      </p>
      <Pagination total={5} aria-label="Pages" />
    </div>
  );
}
