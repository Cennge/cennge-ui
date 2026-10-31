import { createRef } from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { Button } from "./button";
import { CenngeProvider } from "../../provider";

describe("Button", () => {
  it("renders a type=button by default so it never submits forms by accident", () => {
    render(<Button>Save</Button>);
    expect(screen.getByRole("button", { name: "Save" })).toHaveAttribute("type", "button");
  });

  it("forwards the ref to the DOM element", () => {
    const ref = createRef<HTMLButtonElement>();
    render(<Button ref={ref}>Save</Button>);
    expect(ref.current).toBeInstanceOf(HTMLButtonElement);
  });

  it("applies colour and variant classes", () => {
    render(
      <Button color="primary" variant="flat">
        Go
      </Button>,
    );
    const el = screen.getByRole("button");
    expect(el).toHaveClass("bg-primary-bg", "text-primary-text");
  });

  it("lets className override variant classes", () => {
    render(
      <Button radius="sm" className="rounded-large">
        Go
      </Button>,
    );
    const el = screen.getByRole("button");
    expect(el).toHaveClass("rounded-large");
    expect(el).not.toHaveClass("rounded-small");
  });

  it("isDisabled and disabled both block clicks", () => {
    const onClick = vi.fn();
    render(
      <>
        <Button isDisabled onClick={onClick}>
          A
        </Button>
        <Button disabled onClick={onClick}>
          B
        </Button>
      </>,
    );
    for (const el of screen.getAllByRole("button")) {
      expect(el).toBeDisabled();
      expect(el).toHaveAttribute("data-disabled", "true");
      fireEvent.click(el);
    }
    expect(onClick).not.toHaveBeenCalled();
  });

  it("isLoading shows a spinner, sets aria-busy and blocks clicks", () => {
    const onClick = vi.fn();
    const { container } = render(
      <Button isLoading onClick={onClick}>
        Save
      </Button>,
    );
    const el = screen.getByRole("button");
    expect(el).toHaveAttribute("aria-busy", "true");
    expect(container.querySelector("svg")).not.toBeNull();
    fireEvent.click(el);
    expect(onClick).not.toHaveBeenCalled();
  });

  it("asChild renders the child element with button styles", () => {
    render(
      <Button asChild color="primary">
        <a href="/docs">Docs</a>
      </Button>,
    );
    const link = screen.getByRole("link", { name: "Docs" });
    expect(link).toHaveAttribute("href", "/docs");
    expect(link).toHaveClass("bg-primary");
    expect(link).not.toHaveAttribute("type");
  });

  it("asChild + isDisabled marks the link aria-disabled", () => {
    render(
      <Button asChild isDisabled>
        <a href="/docs">Docs</a>
      </Button>,
    );
    expect(screen.getByRole("link")).toHaveAttribute("aria-disabled", "true");
  });

  it("asChild + isDisabled or isLoading: the link neither navigates nor runs its own onClick", () => {
    const onClick = vi.fn();
    const outer = vi.fn();
    render(
      <div onClick={outer}>
        <Button asChild isDisabled>
          <a href="/docs" onClick={onClick}>
            Docs
          </a>
        </Button>
        <Button asChild isLoading>
          <a href="/blog" onClick={onClick}>
            Blog
          </a>
        </Button>
      </div>,
    );
    for (const name of ["Docs", "Blog"]) {
      // fireEvent returns false when the default action (navigation) was prevented.
      expect(fireEvent.click(screen.getByRole("link", { name }))).toBe(false);
    }
    expect(onClick).not.toHaveBeenCalled();
    expect(outer).not.toHaveBeenCalled();
  });

  it("asChild keeps the caller's onClickCapture while enabled", () => {
    const onClickCapture = vi.fn();
    render(
      <Button asChild onClickCapture={onClickCapture}>
        <a href="#docs">Docs</a>
      </Button>,
    );
    fireEvent.click(screen.getByRole("link"));
    expect(onClickCapture).toHaveBeenCalledTimes(1);
  });

  it("shows the pointer; a loading button the wait cursor, without hover or press effects", () => {
    render(
      <>
        <Button color="primary">Save</Button>
        <Button color="primary" isLoading>
          Saving
        </Button>
      </>,
    );
    const [idle, loading] = screen.getAllByRole("button");
    expect(idle).toHaveClass("cursor-pointer", "not-data-[loading]:hover:brightness-110");
    expect(loading).toHaveClass("data-[loading]:cursor-wait");
    // Disabled buttons drop pointer events, but a loading one keeps them so its cursor shows.
    expect(loading).toHaveClass("data-[disabled]:not-data-[loading]:pointer-events-none");
  });

  it("takes defaults from CenngeProvider, props still win", () => {
    render(
      <CenngeProvider color="danger" size="lg">
        <Button>A</Button>
        <Button color="success">B</Button>
      </CenngeProvider>,
    );
    const [a, b] = screen.getAllByRole("button");
    expect(a).toHaveClass("bg-danger", "h-12");
    expect(b).toHaveClass("bg-success", "h-12");
  });
});
