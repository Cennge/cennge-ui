import { useState } from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { PasswordInput } from "./password-input";

const field = () => screen.getByLabelText("Password");
const toggle = () => screen.getByRole("button", { name: "Show password" });

describe("PasswordInput", () => {
  it("starts hidden, with the browser's password autofill hint", () => {
    render(<PasswordInput label="Password" />);
    expect(field()).toHaveAttribute("type", "password");
    expect(field()).toHaveAttribute("autocomplete", "current-password");
    expect(toggle()).toHaveAttribute("aria-pressed", "false");
  });

  it("the toggle shows and hides the password; its name stays, its pressed state changes", () => {
    render(<PasswordInput label="Password" defaultValue="hunter2" />);
    fireEvent.click(toggle());
    expect(field()).toHaveAttribute("type", "text");
    expect(toggle()).toHaveAttribute("aria-pressed", "true");
    fireEvent.click(toggle());
    expect(field()).toHaveAttribute("type", "password");
    expect(toggle()).toHaveAttribute("aria-pressed", "false");
  });

  it("gives the toggle its own id (Radix would reuse the input's)", () => {
    render(<PasswordInput label="Password" id="pw" />);
    expect(field()).toHaveAttribute("id", "pw");
    expect(toggle()).toHaveAttribute("id", "pw-toggle");
    expect(toggle()).toHaveAttribute("aria-controls", "pw");
    expect(document.querySelectorAll("#pw")).toHaveLength(1);
  });

  it("warns while Caps Lock is on and stops when it goes off or the field loses focus", () => {
    render(<PasswordInput label="Password" description="At least 12 characters" />);
    fireEvent.keyDown(field(), { key: "A", modifierCapsLock: true });
    expect(screen.getByText("Caps Lock is on")).toBeInTheDocument();
    expect(field()).toHaveAccessibleDescription("Caps Lock is on At least 12 characters");
    fireEvent.keyUp(field(), { key: "CapsLock", modifierCapsLock: false });
    expect(screen.queryByText("Caps Lock is on")).toBeNull();
    fireEvent.keyDown(field(), { key: "B", modifierCapsLock: true });
    fireEvent.blur(field());
    expect(screen.queryByText("Caps Lock is on")).toBeNull();
    expect(field()).toHaveAccessibleDescription("At least 12 characters");
  });

  it("the Caps Lock hint can be translated or turned off", () => {
    const { rerender } = render(<PasswordInput label="Password" capsLockWarning="Включён Caps Lock" />);
    fireEvent.keyDown(field(), { key: "A", modifierCapsLock: true });
    expect(screen.getByText("Включён Caps Lock")).toBeInTheDocument();
    rerender(<PasswordInput label="Password" capsLockWarning={false} />);
    fireEvent.keyDown(field(), { key: "A", modifierCapsLock: true });
    expect(screen.queryByText("Включён Caps Lock")).toBeNull();
  });

  it("hides the password again when the form is submitted", () => {
    render(
      <form onSubmit={(event) => event.preventDefault()}>
        <PasswordInput label="Password" name="password" defaultValue="hunter2" />
      </form>,
    );
    fireEvent.click(toggle());
    expect(field()).toHaveAttribute("type", "text");
    fireEvent.submit(field().closest("form")!);
    expect(field()).toHaveAttribute("type", "password");
  });

  it("works controlled, for the value and the visibility", () => {
    function Controlled() {
      const [value, setValue] = useState("");
      const [isVisible, setVisible] = useState(true);
      return (
        <>
          <PasswordInput
            label="Password"
            value={value}
            onValueChange={setValue}
            isVisible={isVisible}
            onVisibilityChange={setVisible}
          />
          <p data-testid="state">{`${value}|${isVisible}`}</p>
        </>
      );
    }
    render(<Controlled />);
    expect(field()).toHaveAttribute("type", "text");
    fireEvent.change(field(), { target: { value: "s3cret" } });
    fireEvent.click(toggle());
    expect(screen.getByTestId("state")).toHaveTextContent("s3cret|false");
    expect(field()).toHaveAttribute("type", "password");
  });

  it("shows the error message while invalid", () => {
    render(<PasswordInput label="Password" isInvalid errorMessage="Too short" description="At least 12" />);
    expect(field()).toHaveAttribute("aria-invalid", "true");
    expect(field()).toHaveAccessibleDescription("Too short");
  });
});
