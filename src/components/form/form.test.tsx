import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { Form, useFormField } from "./form";
import { Input } from "../input";
import { Checkbox } from "../checkbox";
import { Rating } from "../rating";
import { RadioGroup, Radio } from "../radio";

function SignUp({ errors, onSubmit }: { errors?: Record<string, string | string[]>; onSubmit?: () => void }) {
  return (
    <Form
      validationErrors={errors}
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit?.();
      }}
    >
      <Input name="email" label="Email" type="email" isRequired />
      <Input name="username" label="Username" description="Shown on your profile" />
      <Checkbox name="terms" isRequired>
        I agree to the terms
      </Checkbox>
      <button type="submit">Create account</button>
    </Form>
  );
}

describe("Form", () => {
  it("shows server errors under their fields and focuses the first", () => {
    render(<SignUp errors={{ username: "This name is taken", email: ["Already registered.", "Use a work address."] }} />);
    const email = screen.getByLabelText("Email");
    const username = screen.getByLabelText("Username");
    expect(username).toHaveAttribute("aria-invalid", "true");
    expect(username).toHaveAccessibleDescription("This name is taken");
    expect(email).toHaveAccessibleDescription("Already registered. Use a work address.");
    expect(email).toHaveFocus(); // first in the form, not first in the object
  });

  it("an edit clears that field's server error only; new errors show again", async () => {
    const { rerender } = render(<SignUp errors={{ username: "This name is taken", email: "Already registered" }} />);
    const username = screen.getByLabelText("Username");
    fireEvent.input(username, { target: { value: "cennge" } });
    // The form updates right after the event, once the field has taken the new value.
    await waitFor(() => expect(username).not.toHaveAttribute("aria-invalid"));
    expect(username).toHaveAccessibleDescription("Shown on your profile");
    expect(screen.getByLabelText("Email")).toHaveAttribute("aria-invalid", "true");
    // The next response brings the same error back.
    rerender(<SignUp errors={{ username: "Still taken" }} />);
    expect(username).toHaveAccessibleDescription("Still taken");
  });

  it("the browser's checks show in place instead of its tooltip, and block the submit", async () => {
    const onSubmit = vi.fn();
    render(<SignUp onSubmit={onSubmit} />);
    const email = screen.getByLabelText("Email");
    const invalid = new Event("invalid", { cancelable: true });
    act(() => {
      email.dispatchEvent(invalid);
    });
    expect(invalid.defaultPrevented).toBe(true); // no browser tooltip
    expect(email).toHaveAttribute("aria-invalid", "true");
    expect(email).toHaveAccessibleDescription((email as HTMLInputElement).validationMessage);
    // Fixing the field removes the message while typing.
    fireEvent.input(email, { target: { value: "dev@example.com" } });
    await waitFor(() => expect(email).not.toHaveAttribute("aria-invalid"));
  });

  it("a required checkbox shows its error and loses it when ticked", async () => {
    render(<SignUp errors={{ terms: "Please accept the terms" }} />);
    const box = screen.getByRole("checkbox", { name: "I agree to the terms" });
    expect(box).toHaveAttribute("aria-invalid", "true");
    expect(box).toHaveAccessibleDescription("Please accept the terms");
    fireEvent.click(box);
    await waitFor(() => expect(box).not.toHaveAttribute("aria-invalid"));
  });

  it("fields without a native input (stars, radios) take errors by name and clear on change", async () => {
    render(
      <Form validationErrors={{ rating: "Rate the release", plan: "Choose a plan" }}>
        <Rating label="Release" name="rating" />
        <RadioGroup label="Plan" name="plan">
          <Radio value="free">Free</Radio>
          <Radio value="pro">Pro</Radio>
        </RadioGroup>
      </Form>,
    );
    const stars = screen.getByRole("radiogroup", { name: "Release" });
    expect(stars).toHaveAccessibleDescription("Rate the release");
    fireEvent.click(screen.getByRole("radio", { name: "4 stars" }));
    expect(stars).not.toHaveAttribute("aria-invalid");
    const plan = screen.getByRole("radiogroup", { name: "Plan" });
    expect(plan).toHaveAccessibleDescription("Choose a plan");
    fireEvent.click(screen.getByRole("radio", { name: "Pro" }));
    await waitFor(() => expect(plan).not.toHaveAttribute("aria-invalid"));
  });

  it("a field's own error wins over the form's", () => {
    render(
      <Form validationErrors={{ email: "From the server" }}>
        <Input name="email" label="Email" isInvalid errorMessage="From the field" />
      </Form>,
    );
    expect(screen.getByLabelText("Email")).toHaveAccessibleDescription("From the field");
  });

  it("useFormField lets your own fields join in", () => {
    function Custom({ name }: { name: string }) {
      const field = useFormField(name);
      return (
        <div>
          <button type="button" onClick={field.markEdited}>
            Change
          </button>
          {field.isInvalid ? <p role="alert">{field.errorMessage}</p> : null}
        </div>
      );
    }
    render(
      <Form validationErrors={{ colour: "Pick a colour" }}>
        <Custom name="colour" />
      </Form>,
    );
    expect(screen.getByRole("alert")).toHaveTextContent("Pick a colour");
    fireEvent.click(screen.getByRole("button", { name: "Change" }));
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("outside a Form, fields behave as before", () => {
    render(<Input name="email" label="Email" isInvalid errorMessage="Own error" />);
    expect(screen.getByLabelText("Email")).toHaveAccessibleDescription("Own error");
  });
});
