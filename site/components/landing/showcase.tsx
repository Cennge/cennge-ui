"use client";

import Link from "next/link";
import { useState, type CSSProperties, type ReactNode } from "react";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious, useCarousel } from "cennge-ui";
import CommandPanel from "@/examples/landing/command";
import ImportSizes from "@/examples/landing/import-sizes";
import Releases from "@/examples/landing/releases";
import ReleaseDate from "@/examples/landing/release-date";
import RepositorySettings from "@/examples/landing/repository-settings";
import facts from "@/generated/facts.json";
import { nav, pageBySlug } from "@/lib/nav";

type Fact = { gzip: number | null; specs: string[]; unit: boolean };

// The chart first: beside the lit Table it shows the ends of its bars, and Command on the other side its search.
// One width for every panel, so the caption beside the lit one stays put from panel to panel.
const panelWidth = 460;
const panels: { slug: string; name: string; node: ReactNode }[] = [
  { slug: "bar-chart", name: "BarChart", node: <ImportSizes /> },
  { slug: "table", name: "Table", node: <Releases /> },
  { slug: "command", name: "Command", node: <CommandPanel /> },
  { slug: "calendar", name: "Calendar", node: <ReleaseDate /> },
  { slug: "switch", name: "Switch and Select", node: <RepositorySettings /> },
];

// Counted from the docs' own navigation: component pages, chart pages (the overview aside) and map pages.
const measured = (slug: string) => Boolean((facts as Record<string, Fact>)[slug]?.gzip);
const countIn = (titles: string[], include: boolean) =>
  nav
    .filter((family) => family.title !== "Getting started" && titles.includes(family.title) === include)
    .reduce((sum, family) => sum + family.pages.filter((page) => measured(page.slug)).length, 0);
const counts = { components: countIn(["Charts", "Map"], false), charts: countIn(["Charts"], true), map: countIn(["Map"], true) };
const words = ["no", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten"];
const say = (count: number) => words[count] ?? String(count);

/** What the docs know of a component: its summary, and its measured size and tests. */
function about(slug: string) {
  const fact = (facts as Record<string, Fact>)[slug];
  const size = fact?.gzip ? `${(fact.gzip / 1024).toFixed(1)} KB gzip` : null;
  const tests = fact?.specs.length ? "tested end to end in five browser projects" : fact?.unit ? "unit tested" : null;
  return { summary: pageBySlug(slug).page.summary, facts: [size, tests].filter(Boolean).join(", ") };
}

/** The panels; a neighbour is brought to the middle by a click (the arrows and a swipe do the same). */
function Panels({ index }: { index: number }) {
  const { scrollTo } = useCarousel();
  return (
    <CarouselContent viewportClassName="showcase-row">
      {panels.map((item, i) => (
        <CarouselItem
          key={item.slug}
          aria-label={`${item.name}, ${i + 1} of ${panels.length}`}
          className="showcase-item basis-auto"
          data-neighbour={i === index ? undefined : ""}
          // An inert panel takes no clicks itself; they land on its slide.
          onClick={i === index ? undefined : () => scrollTo(i)}
        >
          <div data-ui className="showcase-panel" data-lit={i === index ? "" : undefined} inert={i !== index}>
            {item.node}
          </div>
        </CarouselItem>
      ))}
    </CarouselContent>
  );
}

export function Showcase() {
  // Starts on the second panel, so a neighbour shows on each side.
  const [index, setIndex] = useState(1);
  const panel = panels[index]!;

  return (
    <section className="showcase" aria-labelledby="showcase-title">
      <Carousel
        aria-label="Components at work"
        align="center"
        defaultIndex={1}
        onIndexChange={setIndex}
        className="showcase-carousel"
        style={{ "--panel-w": `${panelWidth}px` } as CSSProperties}
      >
        <Panels index={index} />

        <div className="showcase-caption">
          {/* Every panel's words in one cell, only the lit one's shown: the caption is always as tall as the
              longest, so the page below it never moves when the panel changes. */}
          <div className="grid">
            {panels.map((item, i) => {
              const text = about(item.slug);
              return (
                <div key={item.slug} className={`[grid-area:1/1] ${i === index ? "" : "invisible"}`} aria-hidden={i !== index}>
                  <p className="landing-heading">{item.name}</p>
                  <p className="mt-2 text-base leading-[1.5] text-pretty">{text.summary}</p>
                  <p className="mt-1 text-base leading-[1.5] text-muted text-pretty">{text.facts}.</p>
                </div>
              );
            })}
          </div>
          <div className="mt-4 flex items-center gap-3">
            <CarouselPrevious />
            <span className="text-[15px] tabular-nums text-muted">
              {index + 1} of {panels.length}
            </span>
            <CarouselNext />
            <Link href={`/docs/${panel.slug}/`} className="landing-link ml-2 text-[15px]">
              Read its page
            </Link>
          </div>
        </div>
      </Carousel>

      <div className="showcase-foot" data-reveal>
        <h2 id="showcase-title" className="landing-heading">
          Five here, the rest in the docs
        </h2>
        <p className="mt-3 max-w-[52ch] text-base leading-[1.55] text-pretty">
          Search, sort, read a chart, pick a date, flip a setting. The docs have {counts.components} component pages,{" "}
          {say(counts.charts)} for the charts and {say(counts.map)} for the map, each with live examples, its props and its
          measured size.
        </p>
      </div>
    </section>
  );
}
