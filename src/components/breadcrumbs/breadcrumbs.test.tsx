import { fireEvent, render, screen } from "@testing-library/react";
import { BreadcrumbItem, Breadcrumbs } from "./breadcrumbs";

function Path(props: { maxItems?: number }) {
  return (
    <Breadcrumbs {...props}>
      <BreadcrumbItem href="/Cennge">Cennge</BreadcrumbItem>
      <BreadcrumbItem href="/Cennge/cennge-ui">cennge-ui</BreadcrumbItem>
      <BreadcrumbItem href="/src">src</BreadcrumbItem>
      <BreadcrumbItem href="/src/components">components</BreadcrumbItem>
      <BreadcrumbItem>button.tsx</BreadcrumbItem>
    </Breadcrumbs>
  );
}

describe("Breadcrumbs", () => {
  it("is a labelled nav whose last item is the current page", () => {
    render(<Path />);
    expect(screen.getByRole("navigation", { name: "Breadcrumb" })).toBeInTheDocument();
    expect(screen.getByText("button.tsx")).toHaveAttribute("aria-current", "page");
    expect(screen.getByRole("link", { name: "cennge-ui" })).toHaveAttribute("href", "/Cennge/cennge-ui");
  });

  it("collapses the middle and expands it on demand", () => {
    render(<Path maxItems={3} />);
    expect(screen.queryByRole("link", { name: "src" })).toBeNull();
    expect(screen.getByRole("link", { name: "Cennge" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "components" })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Show all breadcrumbs" }));
    expect(screen.getByRole("link", { name: "src" })).toBeInTheDocument();
  });
});
