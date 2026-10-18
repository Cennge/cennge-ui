import { useState } from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { Combobox, type ComboboxItem } from "./combobox";

const repos: ComboboxItem[] = [
  { value: "cennge-ui", label: "cennge-ui" },
  { value: "ai-niche-scout", label: "ai-niche-scout" },
  { value: "payload-cache", label: "payload-cache", isDisabled: true },
  { value: "spredo", label: "spredo-crypto-screener" },
];

const options = () => screen.queryAllByRole("option").map((o) => o.textContent);

describe("Combobox (single)", () => {
  it("is a labelled combobox that opens with ArrowDown and shows every item", () => {
    render(<Combobox label="Repository" items={repos} />);
    const input = screen.getByRole("combobox", { name: "Repository" });
    expect(input).toHaveAttribute("aria-expanded", "false");
    fireEvent.keyDown(input, { key: "ArrowDown" });
    expect(input).toHaveAttribute("aria-expanded", "true");
    expect(options()).toHaveLength(4);
  });

  it("opens on click but not on focus alone", () => {
    render(<Combobox label="Repository" items={repos} />);
    const input = screen.getByRole("combobox");
    fireEvent.focus(input);
    expect(input).toHaveAttribute("aria-expanded", "false");
    fireEvent.click(input);
    expect(input).toHaveAttribute("aria-expanded", "true");
    fireEvent.click(input);
    expect(input).toHaveAttribute("aria-expanded", "true");
  });

  it("filters as you type and shows the empty state", () => {
    render(<Combobox label="Repository" items={repos} emptyContent="Nothing found" />);
    const input = screen.getByRole("combobox");
    fireEvent.change(input, { target: { value: "CACHE" } });
    expect(options()).toEqual(["payload-cache"]);
    fireEvent.change(input, { target: { value: "zzz" } });
    expect(screen.getByText("Nothing found")).toBeInTheDocument();
  });

  it("arrows skip disabled items, Enter selects and closes", () => {
    const onValueChange = vi.fn();
    render(<Combobox label="Repository" items={repos} onValueChange={onValueChange} />);
    const input = screen.getByRole("combobox");
    fireEvent.keyDown(input, { key: "ArrowDown" }); // open, first item active
    fireEvent.keyDown(input, { key: "ArrowDown" }); // ai-niche-scout
    fireEvent.keyDown(input, { key: "ArrowDown" }); // skips payload-cache
    const active = document.getElementById(input.getAttribute("aria-activedescendant")!);
    expect(active).toHaveTextContent("spredo-crypto-screener");
    fireEvent.keyDown(input, { key: "Enter" });
    expect(onValueChange).toHaveBeenCalledWith("spredo");
    expect(input).toHaveValue("spredo-crypto-screener");
    expect(input).toHaveAttribute("aria-expanded", "false");
  });

  it("after typing, the first match is active and ArrowDown moves to the next match", () => {
    render(<Combobox label="Repository" items={repos} />);
    const input = screen.getByRole("combobox");
    fireEvent.change(input, { target: { value: "-" } }); // all but none filtered: cennge-ui, ai-niche-scout, payload-cache, spredo
    const active = () => document.getElementById(input.getAttribute("aria-activedescendant")!)?.textContent;
    expect(active()).toBe("cennge-ui");
    fireEvent.keyDown(input, { key: "ArrowDown" });
    expect(active()).toBe("ai-niche-scout");
  });

  it("Escape closes and restores the selected label", () => {
    render(<Combobox label="Repository" items={repos} defaultValue="cennge-ui" />);
    const input = screen.getByRole("combobox");
    fireEvent.change(input, { target: { value: "ai" } });
    fireEvent.keyDown(input, { key: "Escape" });
    expect(input).toHaveValue("cennge-ui");
    expect(input).toHaveAttribute("aria-expanded", "false");
  });

  it("clicking an option selects it; clear resets to null", () => {
    function Controlled() {
      const [value, setValue] = useState<string | null>(null);
      return (
        <>
          <Combobox label="Repository" items={repos} value={value} onValueChange={setValue} isClearable />
          <output>{value ?? "none"}</output>
        </>
      );
    }
    render(<Controlled />);
    const input = screen.getByRole("combobox");
    fireEvent.keyDown(input, { key: "ArrowDown" });
    fireEvent.click(screen.getByRole("option", { name: "ai-niche-scout" }));
    expect(screen.getByRole("status")).toHaveTextContent("ai-niche-scout");
    fireEvent.click(screen.getByRole("button", { name: "Clear" }));
    expect(screen.getByRole("status")).toHaveTextContent("none");
    expect(input).toHaveValue("");
  });
});

describe("Combobox (multiple)", () => {
  it("toggles items, keeps the list open, shows tags and removes with Backspace", () => {
    const onValuesChange = vi.fn();
    render(
      <Combobox
        selectionMode="multiple"
        label="Repositories"
        items={repos}
        defaultValues={["cennge-ui"]}
        onValuesChange={onValuesChange}
        name="repos"
      />,
    );
    const input = screen.getByRole("combobox");
    fireEvent.keyDown(input, { key: "ArrowDown" });
    expect(screen.getByRole("listbox")).toHaveAttribute("aria-multiselectable", "true");

    fireEvent.click(screen.getByRole("option", { name: "ai-niche-scout" }));
    expect(onValuesChange).toHaveBeenLastCalledWith(["cennge-ui", "ai-niche-scout"]);
    expect(input).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByRole("option", { name: "ai-niche-scout" })).toHaveAttribute("aria-selected", "true");
    expect(screen.getByRole("button", { name: "Remove ai-niche-scout" })).toBeInTheDocument();

    fireEvent.keyDown(input, { key: "Backspace" });
    expect(onValuesChange).toHaveBeenLastCalledWith(["cennge-ui"]);

    const hidden = document.querySelectorAll('input[type="hidden"][name="repos"]');
    expect(hidden).toHaveLength(1);
  });

  it("Enter does not submit the surrounding form while choosing", () => {
    const onSubmit = vi.fn((e: React.FormEvent) => e.preventDefault());
    render(
      <form onSubmit={onSubmit}>
        <Combobox selectionMode="multiple" label="Repositories" items={repos} />
      </form>,
    );
    const input = screen.getByRole("combobox");
    fireEvent.keyDown(input, { key: "ArrowDown" });
    fireEvent.keyDown(input, { key: "Enter" });
    expect(onSubmit).not.toHaveBeenCalled();
  });
});
