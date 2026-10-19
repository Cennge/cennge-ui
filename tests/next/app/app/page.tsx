import { Badge, Button, Card, CardBody, CardHeader } from "cennge-ui";
import { cn } from "cennge-ui/utils";
import { ActionForm } from "./action-form";
import { Hydrated } from "./hydrated";
// The playground, copied in by scripts/check-next.mjs: nearly every component, rendered on the server.
import { App } from "./playground/App";

// A Server Component. The library's components are client components and render from here as they are;
// cn comes from the server-safe entry.
export default function Page() {
  return (
    <>
      <section className={cn("mx-auto grid max-w-6xl gap-4 px-4 pt-10", "md:grid-cols-2")}>
        <Card>
          <CardHeader className="font-semibold">Rendered by a Server Component</CardHeader>
          <CardBody className="flex items-center gap-2">
            <Badge color="success">server</Badge>
            <Button color="primary" variant="shadow">
              Download
            </Button>
          </CardBody>
        </Card>
        <ActionForm />
      </section>
      <App />
      <Hydrated />
    </>
  );
}
