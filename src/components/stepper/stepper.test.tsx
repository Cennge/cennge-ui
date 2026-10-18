import { fireEvent, render, screen, within } from "@testing-library/react";
import { Step, Stepper } from "./stepper";

function Wizard(props: { active: number; onStepClick?: (i: number) => void; vertical?: boolean; errorAt?: number }) {
  return (
    <Stepper
      activeStep={props.active}
      onStepClick={props.onStepClick}
      orientation={props.vertical ? "vertical" : "horizontal"}
      completedContent={<p>All set</p>}
      aria-label="Create repository"
    >
      <Step title="Name" description="Owner and name">
        <p>name form</p>
      </Step>
      <Step title="Settings" isError={props.errorAt === 1}>
        <p>settings form</p>
      </Step>
      <Step title="Access">
        <p>access form</p>
      </Step>
    </Stepper>
  );
}

const items = () => within(screen.getByRole("list", { name: "Create repository" })).getAllByRole("listitem");

describe("Stepper", () => {
  it("is a labelled list; the active step is aria-current and states are announced", () => {
    render(<Wizard active={1} />);
    const [first, second, third] = items();
    expect(second).toHaveAttribute("aria-current", "step");
    expect(first).toHaveTextContent("Name, completed");
    expect(second).toHaveTextContent("Settings, current step");
    expect(third).toHaveTextContent("Access, not started");
  });

  it("shows only the active step's content, then the completed content", () => {
    const { rerender } = render(<Wizard active={1} />);
    expect(screen.getByText("settings form")).toBeInTheDocument();
    expect(screen.queryByText("name form")).toBeNull();
    rerender(<Wizard active={3} />);
    expect(screen.getByText("All set")).toBeInTheDocument();
  });

  it("finished steps become buttons when onStepClick is set; upcoming ones do not", () => {
    const onStepClick = vi.fn();
    render(<Wizard active={1} onStepClick={onStepClick} />);
    fireEvent.click(screen.getByRole("button", { name: /Name/ }));
    expect(onStepClick).toHaveBeenCalledWith(0);
    expect(screen.queryByRole("button", { name: /Access/ })).toBeNull();
    expect(screen.queryByRole("button", { name: /Settings/ })).toBeNull();
  });

  it("an error on the active step keeps it current", () => {
    render(<Wizard active={1} errorAt={1} />);
    const second = items()[1];
    expect(second).toHaveAttribute("aria-current", "step");
    expect(second).toHaveTextContent("Settings, has an error");
  });

  it("vertical orientation renders the content under the active step", () => {
    render(<Wizard active={0} vertical />);
    const first = items()[0];
    expect(within(first!).getByText("name form")).toBeInTheDocument();
  });
});
