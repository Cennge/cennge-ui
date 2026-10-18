import { useState } from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { TagsInput } from "./tags-input";

const field = () => screen.getByRole("textbox", { name: "Topics" });
const tagNames = () =>
  Array.from(document.querySelectorAll('[data-slot="tag"]')).map((t) => t.textContent);
const type = (text: string) => fireEvent.change(field(), { target: { value: text } });
const press = (key: string) => fireEvent.keyDown(field(), { key });
const announced = () => document.querySelector('[aria-live="polite"]')?.textContent;

describe("TagsInput", () => {
  it("Enter and comma turn the text into tags; an empty Enter adds nothing", () => {
    render(<TagsInput label="Topics" />);
    type("react");
    press("Enter");
    type(" tailwindcss ");
    press(",");
    press("Enter");
    expect(tagNames()).toEqual(["react", "tailwindcss"]);
    expect(field()).toHaveValue("");
    expect(announced()).toBe("Added tailwindcss");
  });

  it("refuses duplicates regardless of case, keeps the text and flags the existing tag", () => {
    render(<TagsInput label="Topics" defaultValue={["React"]} />);
    type("react");
    press("Enter");
    expect(tagNames()).toEqual(["React"]);
    expect(field()).toHaveValue("react");
    expect(document.querySelector('[data-slot="tag"]')).toHaveAttribute("data-highlighted", "true");
    expect(announced()).toBe("react is already added");
  });

  it("allows duplicates when asked", () => {
    render(<TagsInput label="Topics" defaultValue={["a"]} allowDuplicates />);
    type("a");
    press("Enter");
    expect(tagNames()).toEqual(["a", "a"]);
  });

  it("Backspace in an empty field removes the last tag", () => {
    render(<TagsInput label="Topics" defaultValue={["a", "b"]} />);
    press("Backspace");
    expect(tagNames()).toEqual(["a"]);
    expect(announced()).toBe("Removed b");
  });

  it("splits pasted text on separators and new lines", () => {
    render(<TagsInput label="Topics" />);
    fireEvent.paste(field(), { clipboardData: { getData: () => "react, vue\nsvelte" } });
    expect(tagNames()).toEqual(["react", "vue", "svelte"]);
  });

  it("validate and maxTags refuse tags", () => {
    render(<TagsInput label="Topics" maxTags={2} validate={(t) => /^[a-z-]+$/.test(t)} />);
    type("Bad Tag");
    press("Enter");
    expect(tagNames()).toEqual([]);
    expect(announced()).toBe("Bad Tag is not allowed");
    for (const t of ["a", "b", "c"]) {
      type(t);
      press("Enter");
    }
    expect(tagNames()).toEqual(["a", "b"]);
    expect(announced()).toBe("Tag limit reached");
  });

  it("adds leftover text on blur unless disabled", () => {
    const { rerender } = render(<TagsInput label="Topics" />);
    type("react");
    fireEvent.blur(field());
    expect(tagNames()).toEqual(["react"]);
    rerender(<TagsInput label="Topics" addOnBlur={false} />);
    type("vue");
    fireEvent.blur(field());
    expect(tagNames()).toEqual(["react"]);
  });

  it("keyboard: ArrowLeft reaches the tags, Delete removes and moves focus to a neighbour", () => {
    render(<TagsInput label="Topics" defaultValue={["a", "b", "c"]} />);
    field().focus();
    press("ArrowLeft");
    const removeC = screen.getByRole("button", { name: "Remove c" });
    expect(removeC).toHaveFocus();
    fireEvent.keyDown(removeC, { key: "ArrowLeft" });
    const removeB = screen.getByRole("button", { name: "Remove b" });
    expect(removeB).toHaveFocus();
    fireEvent.keyDown(removeB, { key: "Delete" });
    expect(tagNames()).toEqual(["a", "c"]);
    expect(screen.getByRole("button", { name: "Remove c" })).toHaveFocus();
    fireEvent.keyDown(screen.getByRole("button", { name: "Remove c" }), { key: "ArrowRight" });
    expect(field()).toHaveFocus();
  });

  it("a mouse click on a remove button removes that tag", () => {
    render(<TagsInput label="Topics" defaultValue={["a", "b"]} />);
    fireEvent.click(screen.getByRole("button", { name: "Remove a" }), { detail: 1 });
    expect(tagNames()).toEqual(["b"]);
  });

  it("submits tags through hidden inputs; required only while empty", () => {
    render(<TagsInput label="Topics" name="topics" defaultValue={["a", "b"]} isRequired />);
    const hidden = Array.from(document.querySelectorAll('input[type="hidden"][name="topics"]')).map(
      (i) => (i as HTMLInputElement).value,
    );
    expect(hidden).toEqual(["a", "b"]);
    expect(field()).not.toBeRequired();
  });

  it("works controlled", () => {
    function Controlled() {
      const [tags, setTags] = useState<string[]>(["a"]);
      return <TagsInput label="Topics" value={tags} onValueChange={setTags} isClearable />;
    }
    render(<Controlled />);
    type("b");
    press("Enter");
    expect(tagNames()).toEqual(["a", "b"]);
    fireEvent.click(screen.getByRole("button", { name: "Clear" }));
    expect(tagNames()).toEqual([]);
  });
});
