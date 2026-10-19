import { fireEvent, render, screen } from "@testing-library/react";
import { Radio, RadioGroup } from "./radio";
import { Accordion, AccordionItem } from "../accordion";
import { Progress } from "../progress";
import { Textarea } from "../textarea";
import { Slider } from "../slider";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from "../drawer";
import { Popover, PopoverContent, PopoverTrigger } from "../popover";
import { Button } from "../button";

describe("RadioGroup", () => {
  it("is a labelled group; choosing a radio reports its value", () => {
    const onValueChange = vi.fn();
    render(
      <RadioGroup label="Visibility" onValueChange={onValueChange}>
        <Radio value="public" description="Anyone can see it">
          Public
        </Radio>
        <Radio value="private">Private</Radio>
      </RadioGroup>,
    );
    expect(screen.getByRole("radiogroup", { name: "Visibility" })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("radio", { name: /Private/ }));
    expect(onValueChange).toHaveBeenCalledWith("private");
  });
});

describe("Accordion", () => {
  it("opens one item at a time and exposes expanded state", () => {
    render(
      <Accordion>
        <AccordionItem value="a" title="What is cennge-ui?">
          A React library
        </AccordionItem>
        <AccordionItem value="b" title="Is it free?">
          MIT
        </AccordionItem>
      </Accordion>,
    );
    const first = screen.getByRole("button", { name: "What is cennge-ui?" });
    const second = screen.getByRole("button", { name: "Is it free?" });
    fireEvent.click(first);
    expect(first).toHaveAttribute("aria-expanded", "true");
    fireEvent.click(second);
    expect(first).toHaveAttribute("aria-expanded", "false");
    expect(second).toHaveAttribute("aria-expanded", "true");
  });
});

describe("Progress", () => {
  it("exposes value and text to assistive tech", () => {
    render(<Progress label="Upload" value={42} />);
    const bar = screen.getByRole("progressbar", { name: "Upload" });
    expect(bar).toHaveAttribute("aria-valuenow", "42");
    expect(bar).toHaveAttribute("aria-valuetext", "42%");
    expect(screen.getByText("42%")).toBeInTheDocument();
  });

  it("is indeterminate without a value", () => {
    render(<Progress aria-label="Loading" />);
    expect(screen.getByRole("progressbar", { name: "Loading" })).not.toHaveAttribute("aria-valuenow");
  });
});

describe("Textarea", () => {
  it("works uncontrolled and reports the value", () => {
    const onValueChange = vi.fn();
    render(<Textarea label="Description" onValueChange={onValueChange} />);
    const field = screen.getByLabelText("Description");
    fireEvent.change(field, { target: { value: "Hello" } });
    expect(field).toHaveValue("Hello");
    expect(onValueChange).toHaveBeenCalledWith("Hello");
  });
});

describe("Slider", () => {
  it("names the thumb after the label and formats the value", () => {
    render(<Slider label="Opacity" defaultValue={40} formatValue={(v) => `${v}%`} />);
    const thumb = screen.getByRole("slider", { name: "Opacity" });
    expect(thumb).toHaveAttribute("aria-valuetext", "40%");
    expect(screen.getByText("40%")).toBeInTheDocument();
  });

  it("a range names each thumb after the label", () => {
    render(<Slider label="Stars" defaultValue={[10, 90]} />);
    expect(screen.getByRole("slider", { name: "Stars Minimum" })).toBeInTheDocument();
    expect(screen.getByRole("slider", { name: "Stars Maximum" })).toBeInTheDocument();
  });

  it("thumb names can be translated; aria-label works for ranges too", () => {
    render(
      <>
        <Slider label="Звёзды" defaultValue={[10, 90]} thumbLabels={["от", "до"]} />
        <Slider aria-label="Price" defaultValue={[10, 90]} />
      </>,
    );
    expect(screen.getByRole("slider", { name: "Звёзды от" })).toBeInTheDocument();
    expect(screen.getByRole("slider", { name: "Звёзды до" })).toBeInTheDocument();
    expect(screen.getByRole("slider", { name: "Price Maximum" })).toBeInTheDocument();
  });

  it("a one-item array is a single thumb named by the label", () => {
    render(<Slider label="Opacity" defaultValue={[40]} />);
    expect(screen.getByRole("slider", { name: "Opacity" })).toBeInTheDocument();
  });
});

describe("Drawer and Popover", () => {
  it("Drawer opens as a dialog", () => {
    render(
      <Drawer>
        <DrawerTrigger>
          <Button>Settings</Button>
        </DrawerTrigger>
        <DrawerContent aria-describedby={undefined}>
          <DrawerHeader>
            <DrawerTitle>Repository settings</DrawerTitle>
          </DrawerHeader>
        </DrawerContent>
      </Drawer>,
    );
    fireEvent.click(screen.getByRole("button", { name: "Settings" }));
    expect(screen.getByRole("dialog", { name: "Repository settings" })).toBeInTheDocument();
  });

  it("Popover toggles from its trigger", () => {
    render(
      <Popover>
        <PopoverTrigger>
          <Button>Share</Button>
        </PopoverTrigger>
        <PopoverContent>Copy link</PopoverContent>
      </Popover>,
    );
    const trigger = screen.getByRole("button", { name: "Share" });
    fireEvent.click(trigger);
    expect(trigger).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByText("Copy link")).toBeInTheDocument();
  });
});
