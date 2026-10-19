import { fireEvent, render, screen } from "@testing-library/react";
import { Rating } from "./rating";

describe("Rating", () => {
  it("five stars are a labelled radio group, one radio per star", () => {
    render(<Rating label="Rate ai-niche-scout" />);
    const group = screen.getByRole("radiogroup", { name: "Rate ai-niche-scout" });
    const radios = screen.getAllByRole("radio");
    expect(radios.map((radio) => radio.getAttribute("aria-label"))).toEqual(["1 star", "2 stars", "3 stars", "4 stars", "5 stars"]);
    expect(group).toContainElement(radios[0]!);
    // Nothing chosen yet: the first star is the tab stop.
    expect(radios.map((radio) => radio.tabIndex)).toEqual([0, -1, -1, -1, -1]);
  });

  it("a click picks a star; a second click on it clears the rating", () => {
    const onValueChange = vi.fn();
    render(<Rating aria-label="Rating" onValueChange={onValueChange} />);
    const four = screen.getByRole("radio", { name: "4 stars" });
    fireEvent.click(four);
    expect(onValueChange).toHaveBeenLastCalledWith(4);
    expect(four).toHaveAttribute("aria-checked", "true");
    expect(four).toHaveAttribute("tabindex", "0");
    fireEvent.click(four);
    expect(onValueChange).toHaveBeenLastCalledWith(0);
    expect(four).toHaveAttribute("aria-checked", "false");
  });

  it("isClearable={false} keeps the rating on a second click", () => {
    const onValueChange = vi.fn();
    render(<Rating aria-label="Rating" defaultValue={4} isClearable={false} onValueChange={onValueChange} />);
    fireEvent.click(screen.getByRole("radio", { name: "4 stars" }));
    expect(onValueChange).not.toHaveBeenCalled();
    fireEvent.keyDown(screen.getByRole("radio", { name: "4 stars" }), { key: "Backspace" });
    expect(onValueChange).not.toHaveBeenCalled();
  });

  it("keyboard: arrows move and check without wrapping; Home, End, Space; Backspace clears", () => {
    const onValueChange = vi.fn();
    render(<Rating aria-label="Rating" defaultValue={4} onValueChange={onValueChange} />);
    const radio = (n: number) => screen.getByRole("radio", { name: n === 1 ? "1 star" : `${n} stars` });
    radio(4).focus();
    fireEvent.keyDown(radio(4), { key: "ArrowRight" });
    expect(radio(5)).toHaveFocus();
    expect(radio(5)).toHaveAttribute("aria-checked", "true");
    fireEvent.keyDown(radio(5), { key: "ArrowRight" });
    expect(radio(5)).toHaveFocus(); // no wrap to 1
    fireEvent.keyDown(radio(5), { key: "Home" });
    expect(radio(1)).toHaveFocus();
    fireEvent.keyDown(radio(1), { key: "ArrowLeft" });
    expect(radio(1)).toHaveAttribute("aria-checked", "true");
    fireEvent.keyDown(radio(1), { key: "End" });
    expect(radio(5)).toHaveAttribute("aria-checked", "true");
    fireEvent.keyDown(radio(5), { key: "Backspace" });
    expect(onValueChange).toHaveBeenLastCalledWith(0);
    expect(radio(5)).toHaveAttribute("aria-checked", "false");
    // Space checks the focused star.
    fireEvent.keyDown(radio(5), { key: " " });
    expect(onValueChange).toHaveBeenLastCalledWith(5);
  });

  it("half stars are a slider: arrows step by half, Page keys by a whole star", () => {
    const onValueChange = vi.fn();
    render(<Rating label="Docs quality" allowHalf defaultValue={3.5} onValueChange={onValueChange} />);
    const slider = screen.getByRole("slider", { name: "Docs quality" });
    expect(screen.queryAllByRole("radio")).toHaveLength(0);
    expect(slider).toHaveAttribute("aria-valuenow", "3.5");
    expect(slider).toHaveAttribute("aria-valuetext", "3.5 stars");
    expect(slider).toHaveAttribute("aria-valuemax", "5");
    fireEvent.keyDown(slider, { key: "ArrowLeft" });
    expect(slider).toHaveAttribute("aria-valuenow", "3");
    fireEvent.keyDown(slider, { key: "PageUp" });
    expect(slider).toHaveAttribute("aria-valuenow", "4");
    fireEvent.keyDown(slider, { key: "Home" });
    expect(slider).toHaveAttribute("aria-valuetext", "0.5 stars");
    fireEvent.keyDown(slider, { key: "ArrowDown" });
    expect(slider).toHaveAttribute("aria-valuenow", "0.5"); // the lowest rating, not 0
    fireEvent.keyDown(slider, { key: "Delete" });
    expect(slider).toHaveAttribute("aria-valuetext", "No rating");
    fireEvent.keyDown(slider, { key: "End" });
    expect(onValueChange).toHaveBeenLastCalledWith(5);
  });

  it("more than seven choices make a slider too", () => {
    render(<Rating aria-label="Score" count={10} />);
    expect(screen.getByRole("slider", { name: "Score" })).toHaveAttribute("aria-valuemax", "10");
  });

  it("read-only shows any value as a picture with a text name", () => {
    const { container } = render(
      <>
        <Rating isReadOnly value={4.3} aria-label="Average" />
        <Rating isReadOnly value={2} label="Your rating" />
      </>,
    );
    expect(screen.getByRole("img", { name: "Average: 4.3 stars" })).toBeInTheDocument();
    expect(screen.getByRole("img", { name: "Your rating 2 stars" })).toBeInTheDocument();
    expect(screen.queryAllByRole("radio")).toHaveLength(0);
    const fifth = container.querySelector('[data-star="4"]');
    expect(fifth).toHaveAttribute("data-filled", "partial");
    expect(fifth?.querySelector<HTMLElement>("[style]")?.style.clipPath).toBe("inset(0 70% 0 0)");
  });

  it("submits the value with a form, empty without a rating", () => {
    const { container, rerender } = render(<Rating aria-label="Rating" name="rating" value={4} />);
    expect(container.querySelector<HTMLInputElement>('input[name="rating"]')?.value).toBe("4");
    rerender(<Rating aria-label="Rating" name="rating" value={0} />);
    expect(container.querySelector<HTMLInputElement>('input[name="rating"]')?.value).toBe("");
  });

  it("disabled: no tab stops, clicks do nothing", () => {
    const onValueChange = vi.fn();
    render(<Rating aria-label="Rating" defaultValue={2} isDisabled onValueChange={onValueChange} />);
    expect(screen.getByRole("radiogroup")).toHaveAttribute("aria-disabled", "true");
    for (const radio of screen.getAllByRole("radio")) expect(radio).not.toHaveAttribute("tabindex");
    fireEvent.click(screen.getByRole("radio", { name: "5 stars" }));
    expect(onValueChange).not.toHaveBeenCalled();
  });

  it("names can be translated; required and invalid reach assistive tech", () => {
    const stars = (n: number) => (n === 1 ? "звезда" : n < 5 ? "звезды" : "звёзд");
    render(
      <Rating
        label="Оценка"
        getValueLabel={(v) => `${v} ${stars(v)}`}
        isRequired
        isInvalid
        errorMessage="Поставьте оценку"
      />,
    );
    const group = screen.getByRole("radiogroup", { name: /Оценка/ });
    expect(screen.getByRole("radio", { name: "2 звезды" })).toBeInTheDocument();
    expect(screen.getByRole("radio", { name: "5 звёзд" })).toBeInTheDocument();
    expect(group).toHaveAttribute("aria-required", "true");
    expect(group).toHaveAttribute("aria-invalid", "true");
    expect(group).toHaveAccessibleDescription("Поставьте оценку");
  });
});
