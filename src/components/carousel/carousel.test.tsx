import { render, screen } from "@testing-library/react";
import { Carousel, CarouselContent, CarouselControls, CarouselItem, useCarousel } from "./carousel";

function Releases(props: Partial<React.ComponentProps<typeof Carousel>>) {
  return (
    <Carousel aria-label="Releases" {...props}>
      <CarouselContent>
        <CarouselItem>v0.3.0</CarouselItem>
        <CarouselItem>v0.2.0</CarouselItem>
        <CarouselItem aria-label="First release">v0.1.0</CarouselItem>
      </CarouselContent>
      <CarouselControls />
    </Carousel>
  );
}

describe("Carousel", () => {
  it("a named carousel region with slides named N of M", () => {
    render(<Releases />);
    const region = screen.getByRole("region", { name: "Releases" });
    expect(region).toHaveAttribute("aria-roledescription", "carousel");
    const slide = screen.getByRole("group", { name: "1 of 3" });
    expect(slide).toHaveAttribute("aria-roledescription", "slide");
    expect(screen.getByRole("group", { name: "2 of 3" })).toHaveTextContent("v0.2.0");
    // A slide can carry its own name.
    expect(screen.getByRole("group", { name: "First release" })).toHaveTextContent("v0.1.0");
    // The scrolling list is a tab stop, so the keyboard can move it.
    expect(screen.getByRole("group", { name: "Slides" })).toHaveAttribute("tabindex", "0");
  });

  it("without a name it is a plain section, not a carousel region", () => {
    const { container } = render(
      <Carousel>
        <CarouselContent>
          <CarouselItem>One</CarouselItem>
        </CarouselContent>
      </Carousel>,
    );
    expect(screen.queryByRole("region")).not.toBeInTheDocument();
    expect(container.querySelector("section")).not.toHaveAttribute("aria-roledescription");
  });

  it("names can be translated", () => {
    render(
      <Releases
        aria-label="Релизы"
        labels={{ carousel: "карусель", slide: "слайд", slideName: (index, count) => `${index} из ${count}`, slides: "Слайды" }}
      />,
    );
    expect(screen.getByRole("region", { name: "Релизы" })).toHaveAttribute("aria-roledescription", "карусель");
    expect(screen.getByRole("group", { name: "2 из 3" })).toHaveAttribute("aria-roledescription", "слайд");
    expect(screen.getByRole("group", { name: "Слайды" })).toBeInTheDocument();
  });

  it("autoplay always has a play/pause button: over the slides when there is no CarouselControls", () => {
    render(
      <Carousel aria-label="Tips" autoplay>
        <CarouselContent>
          <CarouselItem>One</CarouselItem>
          <CarouselItem>Two</CarouselItem>
        </CarouselContent>
      </Carousel>,
    );
    expect(screen.getByRole("button", { name: /slide show/ })).toHaveAttribute("data-carousel-autoplay");
  });

  it("slidesPerView and gap become CSS variables, so classes can make them responsive", () => {
    render(<Releases slidesPerView={2.5} gap="0.5rem" />);
    const region = screen.getByRole("region", { name: "Releases" });
    expect(region.style.getPropertyValue("--carousel-per-view")).toBe("2.5");
    expect(region.style.getPropertyValue("--carousel-gap")).toBe("0.5rem");
  });

  it("useCarousel works only inside a carousel", () => {
    function Thumbnails() {
      const { slideCount } = useCarousel();
      return <span>{slideCount} slides</span>;
    }
    expect(() => render(<Thumbnails />)).toThrow(/inside <Carousel>/);
    render(
      <Carousel aria-label="Shots">
        <CarouselContent>
          <CarouselItem>1</CarouselItem>
          <CarouselItem>2</CarouselItem>
        </CarouselContent>
        <Thumbnails />
      </Carousel>,
    );
    expect(screen.getByText("2 slides")).toBeInTheDocument();
  });
});
