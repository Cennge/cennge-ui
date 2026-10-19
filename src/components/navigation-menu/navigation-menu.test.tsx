import { fireEvent, render, screen } from "@testing-library/react";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "./navigation-menu";

function Menu(props: Partial<React.ComponentProps<typeof NavigationMenu>>) {
  return (
    <NavigationMenu aria-label="Main" {...props}>
      <NavigationMenuList>
        <NavigationMenuItem>
          <NavigationMenuTrigger>Components</NavigationMenuTrigger>
          <NavigationMenuContent>
            <NavigationMenuLink href="#carousel" title="Carousel" description="Native scroll snapping" />
          </NavigationMenuContent>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <NavigationMenuLink href="#changelog" isActive>
            Changelog
          </NavigationMenuLink>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  );
}

describe("NavigationMenu", () => {
  it("a named navigation; the current page is marked", () => {
    render(<Menu />);
    const nav = screen.getByRole("navigation", { name: "Main" });
    expect(nav).toContainElement(screen.getByRole("link", { name: "Changelog" }));
    expect(screen.getByRole("link", { name: "Changelog" })).toHaveAttribute("aria-current", "page");
  });

  it("a click opens a panel with title-and-description links", () => {
    render(<Menu />);
    const trigger = screen.getByRole("button", { name: "Components" });
    expect(trigger).toHaveAttribute("aria-expanded", "false");
    expect(screen.queryByRole("link", { name: /Carousel/ })).not.toBeInTheDocument();
    fireEvent.click(trigger);
    expect(trigger).toHaveAttribute("aria-expanded", "true");
    const link = screen.getByRole("link", { name: /Carousel/ });
    expect(link).toHaveTextContent("CarouselNative scroll snapping");
  });

  it("keepMounted keeps closed panels' links in the page", () => {
    render(<Menu keepMounted />);
    const link = document.querySelector('a[href="#carousel"]');
    expect(link).not.toBeNull();
    expect(screen.getByRole("button", { name: "Components" })).toHaveAttribute("aria-expanded", "false");
  });

  it("the open panel can be controlled", () => {
    const onValueChange = vi.fn();
    const { rerender } = render(<Menu value="" onValueChange={onValueChange} />);
    fireEvent.click(screen.getByRole("button", { name: "Components" }));
    expect(onValueChange).toHaveBeenCalled();
    const opened = onValueChange.mock.calls[0]![0] as string;
    rerender(<Menu value={opened} onValueChange={onValueChange} />);
    expect(screen.getByRole("button", { name: "Components" })).toHaveAttribute("aria-expanded", "true");
  });
});
