import { fireEvent, render, screen } from "@testing-library/react";
import { Slider } from "./slider";

const percents = [0, 25, 50, 75, 100].map((value) => ({ value, label: `${value}%` }));
const jobs = [1, 2, 4, 8, 16].map((value) => ({ value, label: String(value) }));

describe("Slider marks", () => {
  it("draws a dot per mark and a label per labelled one; labels are a visual scale only", () => {
    const { container } = render(<Slider label="Coverage" defaultValue={40} marks={[...percents, 10, 250]} />);
    // 250 is outside 0..100 and is dropped.
    expect(container.querySelectorAll('[data-slot="tick"]')).toHaveLength(6);
    const labels = container.querySelectorAll('[data-slot="mark"]');
    expect([...labels].map((label) => label.textContent)).toEqual(["0%", "25%", "50%", "75%", "100%"]);
    expect(labels[0]?.parentElement).toHaveAttribute("aria-hidden", "true");
    // Dots up to the value are on the filled part of the track.
    const inRange = container.querySelectorAll('[data-slot="tick"][data-in-range]');
    expect(inRange).toHaveLength(3); // 0, 10, 25
  });

  it("a click on a label moves the thumb there and commits", () => {
    const onValueChange = vi.fn();
    const onValueCommit = vi.fn();
    render(
      <Slider label="Coverage" defaultValue={40} marks={percents} onValueChange={onValueChange} onValueCommit={onValueCommit} />,
    );
    fireEvent.click(screen.getByText("75%"));
    const thumb = screen.getByRole("slider", { name: "Coverage" });
    expect(thumb).toHaveAttribute("aria-valuenow", "75");
    expect(onValueChange).toHaveBeenLastCalledWith(75);
    expect(onValueCommit).toHaveBeenLastCalledWith(75);
    expect(thumb).toHaveFocus();
    expect(screen.getByText("75%")).toHaveAttribute("data-selected");
  });

  it("in a range, a label click moves the nearest thumb", () => {
    const onValueChange = vi.fn();
    render(<Slider label="Window" defaultValue={[25, 50]} marks={percents} onValueChange={onValueChange} />);
    fireEvent.click(screen.getByText("100%"));
    expect(onValueChange).toHaveBeenLastCalledWith([25, 100]);
    fireEvent.click(screen.getByText("0%"));
    expect(onValueChange).toHaveBeenLastCalledWith([0, 100]);
    expect(screen.getByRole("slider", { name: "Window Minimum" })).toHaveFocus();
  });

  it("restrictToMarks: arrows go mark to mark, Home and End to the first and last", () => {
    const onValueChange = vi.fn();
    render(
      <Slider label="Parallel jobs" defaultValue={4} min={1} max={16} marks={jobs} restrictToMarks onValueChange={onValueChange} />,
    );
    const thumb = screen.getByRole("slider", { name: "Parallel jobs" });
    fireEvent.keyDown(thumb, { key: "ArrowRight" });
    expect(thumb).toHaveAttribute("aria-valuenow", "8");
    fireEvent.keyDown(thumb, { key: "ArrowRight" });
    fireEvent.keyDown(thumb, { key: "ArrowRight" });
    expect(thumb).toHaveAttribute("aria-valuenow", "16");
    fireEvent.keyDown(thumb, { key: "ArrowDown" });
    expect(thumb).toHaveAttribute("aria-valuenow", "8");
    fireEvent.keyDown(thumb, { key: "Home" });
    expect(thumb).toHaveAttribute("aria-valuenow", "1");
    fireEvent.keyDown(thumb, { key: "ArrowLeft" });
    expect(thumb).toHaveAttribute("aria-valuenow", "1");
    fireEvent.keyDown(thumb, { key: "End" });
    expect(onValueChange).toHaveBeenLastCalledWith(16);
    expect(onValueChange).toHaveBeenCalledTimes(5); // ArrowLeft at the first mark changed nothing
  });

  it("restrictToMarks: a value between marks steps to the next mark in the pressed direction", () => {
    const onValueChange = vi.fn();
    // Controlled and never updated, so both presses start from 6.
    render(<Slider label="Parallel jobs" value={6} min={1} max={16} marks={jobs} restrictToMarks onValueChange={onValueChange} />);
    const thumb = screen.getByRole("slider", { name: "Parallel jobs" });
    fireEvent.keyDown(thumb, { key: "ArrowLeft" });
    expect(onValueChange).toHaveBeenLastCalledWith(4);
    fireEvent.keyDown(thumb, { key: "ArrowRight" });
    expect(onValueChange).toHaveBeenLastCalledWith(8);
    expect(thumb).toHaveAttribute("aria-valuenow", "6");
  });

  it("restrictToMarks: the thumbs of a range do not pass each other", () => {
    const onValueChange = vi.fn();
    render(<Slider defaultValue={[2, 4]} min={1} max={16} marks={jobs} restrictToMarks onValueChange={onValueChange} />);
    const minimum = screen.getByRole("slider", { name: "Minimum" });
    fireEvent.keyDown(minimum, { key: "ArrowRight" });
    expect(onValueChange).toHaveBeenLastCalledWith([4, 4]);
    fireEvent.keyDown(minimum, { key: "ArrowRight" });
    expect(onValueChange).toHaveBeenCalledTimes(1);
  });

  it("restrictToMarks snaps a default value that sits between marks", () => {
    render(<Slider label="Parallel jobs" defaultValue={7} min={1} max={16} marks={jobs} restrictToMarks />);
    expect(screen.getByRole("slider", { name: "Parallel jobs" })).toHaveAttribute("aria-valuenow", "8");
  });

  it("labels name the values only when every value has one", () => {
    render(<Slider label="Coverage" defaultValue={75} marks={percents} />);
    // 0..100 has values without a label (40), so numbers stay numbers everywhere.
    expect(screen.getByRole("slider", { name: "Coverage" })).toHaveAttribute("aria-valuetext", "75");
    expect(screen.getByText("75", { selector: "output" })).toBeInTheDocument();
  });

  it("a mark's text label names the value; formatValue wins over it", () => {
    const levels = ["Error", "Warn", "Info", "Debug"].map((label, value) => ({ value, label }));
    const { rerender } = render(<Slider label="Log level" defaultValue={1} min={0} max={3} marks={levels} />);
    const thumb = screen.getByRole("slider", { name: "Log level" });
    expect(thumb).toHaveAttribute("aria-valuetext", "Warn");
    expect(screen.getByText("Warn", { selector: "output" })).toBeInTheDocument();
    fireEvent.keyDown(thumb, { key: "ArrowRight" });
    expect(thumb).toHaveAttribute("aria-valuetext", "Info");
    rerender(<Slider label="Log level" defaultValue={1} min={0} max={3} marks={levels} formatValue={(v) => `level ${v}`} />);
    expect(thumb).toHaveAttribute("aria-valuetext", "level 2");
  });

  it("disabled: label clicks do nothing", () => {
    const onValueChange = vi.fn();
    render(<Slider label="Coverage" defaultValue={40} marks={percents} isDisabled onValueChange={onValueChange} />);
    fireEvent.click(screen.getByText("75%"));
    expect(onValueChange).not.toHaveBeenCalled();
    expect(screen.getByRole("slider", { name: "Coverage" })).toHaveAttribute("aria-valuenow", "40");
  });
});
