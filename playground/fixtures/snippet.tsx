import {
  Button,
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Snippet,
} from "cennge-ui";

export default function SnippetFixture() {
  return (
    <>
      <div data-testid="install">
        <Snippet>pnpm add cennge-ui</Snippet>
      </div>
      <div data-testid="clone">
        <Snippet variant="bordered" color="primary">
          {"git clone https://github.com/Cennge/ai-niche-scout.git\ncd ai-niche-scout"}
        </Snippet>
      </div>
      <div data-testid="long" className="w-64">
        <Snippet variant="faded" className="w-full">
          curl -fsSL https://raw.githubusercontent.com/Cennge/ai-niche-scout/main/scripts/install.sh | sh
        </Snippet>
      </div>
      <div className="flex flex-wrap gap-2">
        <Snippet variant="solid" color="primary" size="sm">
          pnpm dev
        </Snippet>
        <Snippet variant="solid" color="danger" size="sm">
          rm -rf dist
        </Snippet>
        <Snippet color="success" size="lg" radius="full">
          pnpm test
        </Snippet>
        <Snippet variant="bordered" color="warning" symbol=">">
          pnpm changeset
        </Snippet>
      </div>

      <Dialog>
        <DialogTrigger>
          <Button>Deploy instructions</Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Deploy</DialogTitle>
            <DialogDescription>Run this on the server.</DialogDescription>
          </DialogHeader>
          <DialogBody>
            <Snippet>docker compose up -d</Snippet>
          </DialogBody>
        </DialogContent>
      </Dialog>
    </>
  );
}
