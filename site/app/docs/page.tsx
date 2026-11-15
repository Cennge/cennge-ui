import { redirect } from "next/navigation";

// A static export has no server to redirect: this renders a page that sends the browser on.
export default function DocsIndex() {
  redirect("/docs/introduction/");
}
