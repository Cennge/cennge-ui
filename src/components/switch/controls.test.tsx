import { fireEvent, render, screen } from "@testing-library/react";
import { Switch } from "./switch";
import { Checkbox } from "../checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../tabs";
import { Avatar } from "../avatar";
import { Alert } from "../alert";

describe("Switch", () => {
  it("toggles through its label and reports the value", () => {
    const onValueChange = vi.fn();
    render(<Switch onValueChange={onValueChange}>Notifications</Switch>);
    const control = screen.getByRole("switch", { name: "Notifications" });
    fireEvent.click(screen.getByText("Notifications"));
    expect(control).toHaveAttribute("aria-checked", "true");
    expect(onValueChange).toHaveBeenCalledWith(true);
  });
});

describe("Checkbox", () => {
  it("checks and reports a boolean", () => {
    const onValueChange = vi.fn();
    render(<Checkbox onValueChange={onValueChange}>Accept terms</Checkbox>);
    fireEvent.click(screen.getByRole("checkbox", { name: "Accept terms" }));
    expect(onValueChange).toHaveBeenCalledWith(true);
  });

  it("indeterminate is exposed as aria-checked=mixed", () => {
    render(<Checkbox isIndeterminate aria-label="Select all" />);
    expect(screen.getByRole("checkbox", { name: "Select all" })).toHaveAttribute("aria-checked", "mixed");
  });
});

describe("Tabs", () => {
  it("shows the panel of the selected tab", () => {
    render(
      <Tabs defaultValue="code">
        <TabsList aria-label="Repository">
          <TabsTrigger value="code">Code</TabsTrigger>
          <TabsTrigger value="issues">Issues</TabsTrigger>
        </TabsList>
        <TabsContent value="code">Files</TabsContent>
        <TabsContent value="issues">Open issues</TabsContent>
      </Tabs>,
    );
    expect(screen.getByRole("tabpanel")).toHaveTextContent("Files");
    const issues = screen.getByRole("tab", { name: "Issues" });
    fireEvent.mouseDown(issues, { button: 0 });
    expect(issues).toHaveAttribute("aria-selected", "true");
    expect(screen.getByRole("tabpanel")).toHaveTextContent("Open issues");
  });
});

describe("Avatar", () => {
  it("falls back to initials from the name", () => {
    render(<Avatar name="Illia Gliba" />);
    expect(screen.getByText("IG")).toBeInTheDocument();
  });
});

describe("Alert", () => {
  it("danger alerts interrupt, info alerts are polite", () => {
    render(
      <>
        <Alert color="danger" title="Build failed" />
        <Alert color="info" title="New version" />
      </>,
    );
    expect(screen.getByRole("alert")).toHaveTextContent("Build failed");
    expect(screen.getByRole("status")).toHaveTextContent("New version");
  });
});
