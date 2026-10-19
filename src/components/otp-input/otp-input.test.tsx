import { fireEvent, render, screen } from "@testing-library/react";
import { OtpInput } from "./otp-input";

const slots = () => screen.getAllByRole("textbox");
const slot = (index: number) => {
  const node = slots()[index];
  if (!node) throw new Error(`No slot ${index}`);
  return node;
};
const typeInto = (slot: HTMLElement, char: string) => fireEvent.change(slot, { target: { value: char } });

describe("OtpInput", () => {
  it("is a labelled group of slots with a single Tab stop", () => {
    render(<OtpInput label="Verification code" description="From your authenticator app" />);
    const group = screen.getByRole("group", { name: "Verification code" });
    expect(group).toHaveAccessibleDescription("From your authenticator app");
    expect(slots()).toHaveLength(6);
    expect(slot(0)).toHaveAccessibleName("Character 1 of 6");
    expect(slot(0)).toHaveAttribute("autocomplete", "one-time-code");
    expect(slot(0)).toHaveAttribute("inputmode", "numeric");
    const tabStops = [group, ...slots()].filter((node) => node.getAttribute("tabindex") === "0");
    expect(tabStops).toHaveLength(1);
  });

  it("typing fills the slots in turn and reports the complete code once", () => {
    const onComplete = vi.fn();
    const onValueChange = vi.fn();
    render(<OtpInput label="Code" length={4} onComplete={onComplete} onValueChange={onValueChange} />);
    "4815".split("").forEach((char, index) => typeInto(slot(index), char));
    expect(slots().map((slot) => (slot as HTMLInputElement).value)).toEqual(["4", "8", "1", "5"]);
    expect(onValueChange).toHaveBeenLastCalledWith("4815");
    expect(onComplete).toHaveBeenCalledTimes(1);
    expect(onComplete).toHaveBeenCalledWith("4815");
  });

  it("ignores characters the code cannot contain", () => {
    const onValueChange = vi.fn();
    render(<OtpInput label="Code" onValueChange={onValueChange} />);
    typeInto(slot(0), "a");
    expect(onValueChange).not.toHaveBeenCalled();
    expect(slot(0)).toHaveValue("");
  });

  it("a pasted code fills every slot, without spaces or dashes", () => {
    const onComplete = vi.fn();
    render(<OtpInput label="Code" onComplete={onComplete} />);
    fireEvent.paste(slot(0), { clipboardData: { getData: () => "123 456" } });
    expect(slots().map((slot) => (slot as HTMLInputElement).value).join("")).toBe("123456");
    expect(onComplete).toHaveBeenCalledWith("123456");
  });

  it("letters work when allowed, and slot names can be translated", () => {
    render(
      <OtpInput
        label="Код"
        length={4}
        allowedCharacters="alphanumeric"
        formatSlotLabel={(position, length) => `Символ ${position} из ${length}`}
      />,
    );
    expect(slot(1)).toHaveAccessibleName("Символ 2 из 4");
    typeInto(slot(0), "A");
    expect(slot(0)).toHaveValue("A");
  });

  it("draws a hidden separator between groups", () => {
    render(<OtpInput label="Code" groupSize={3} />);
    const group = screen.getByRole("group");
    const separators = group.querySelectorAll('[aria-hidden="true"]');
    expect(separators).toHaveLength(1);
    expect(separators[0]?.previousElementSibling).toBe(slot(2));
  });

  it("submits the code with a form through a hidden input", () => {
    render(<OtpInput label="Code" name="code" defaultValue="123456" />);
    expect(document.querySelector('input[type="hidden"][name="code"]')).toHaveValue("123456");
  });

  it("shows the error message and marks every slot invalid", () => {
    render(<OtpInput label="Code" isInvalid errorMessage="Wrong code" description="6 digits" />);
    expect(screen.getByRole("group")).toHaveAccessibleDescription("Wrong code");
    expect(slots().every((slot) => slot.getAttribute("aria-invalid") === "true")).toBe(true);
  });

  it("autoFocus and a click on the label go to the slot where typing continues", () => {
    render(<OtpInput label="Code" autoFocus />);
    expect(slot(0)).toHaveFocus();
    typeInto(slot(0), "7");
    (document.activeElement as HTMLElement).blur();
    fireEvent.click(screen.getByText("Code"));
    expect(slot(1)).toHaveFocus();
  });
});
