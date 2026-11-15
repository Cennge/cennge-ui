"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { Badge, Button, ToggleGroup, ToggleGroupItem } from "cennge-ui";
import ButtonFix from "@/examples/landing/button-fix";
import DateFix from "@/examples/landing/date-fix";
import KbdFix from "@/examples/landing/kbd-fix";
import SelectFix from "@/examples/landing/select-fix";
import { BrandMark } from "../brand-mark";
import { repository } from "./links";
import { LiveControls } from "./live-controls";

/** Place in the entrance sequence. */
const order = (index: number) => ({ "--i": index }) as CSSProperties;

/** Fixes from the changelog, each shown working. */
const fixes: { name: string; version: string; text: string; fragment: ReactNode }[] = [
  {
    name: "Button",
    version: "0.3.0",
    text: "A loading button shows the wait cursor and stays still; a disabled link no longer navigates.",
    fragment: <ButtonFix />,
  },
  {
    name: "Select",
    version: "0.3.0",
    text: "Inside an open Accordion, Dialog or Popover, a closed Select’s chevron points down again.",
    fragment: <SelectFix />,
  },
  {
    name: "Kbd",
    version: "0.3.0",
    text: "Key symbols drawn at the size of the key cap in every font, read out as “Command Shift K”.",
    fragment: <KbdFix />,
  },
  {
    name: "DatePicker",
    version: "0.1.1",
    text: "minValue takes null, so a limit counted from today can wait until the browser knows the day.",
    fragment: <DateFix />,
  },
];

export function Hero() {
  const section = useRef<HTMLElement>(null);
  const [active, setActive] = useState(0);
  const [isReel, setReel] = useState(false);

  // On wide screens the stage holds while the page scrolls, and the reel steps through the fixes.
  useEffect(() => {
    const media = window.matchMedia("(min-width: 1024px)");
    let frame = 0;
    const update = () => {
      const node = section.current;
      setReel(media.matches);
      if (!node || !media.matches) return;
      const distance = node.offsetHeight - window.innerHeight;
      const progress = distance > 0 ? Math.min(Math.max(-node.getBoundingClientRect().top / distance, 0), 1) : 0;
      setActive(Math.min(fixes.length - 1, Math.floor(progress * fixes.length)));
    };
    const schedule = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    media.addEventListener("change", schedule);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      media.removeEventListener("change", schedule);
    };
  }, []);

  // Tabbing into a frame outside the window scrolls the page to that frame's step.
  const bringIntoView = (index: number) => {
    const node = section.current;
    if (!isReel || !node || index === active) return;
    const distance = node.offsetHeight - window.innerHeight;
    const top = node.getBoundingClientRect().top + window.scrollY;
    window.scrollTo({ top: top + ((index + 0.5) / fixes.length) * distance, behavior: "instant" });
  };

  return (
    <section ref={section} className="hero" aria-labelledby="hero-title">
      <div className="hero-stage">
        <header className="hero-nav">
          <Link href="/" className="landing-wordmark inline-flex items-center gap-2 rounded-small" aria-label="cennge-ui, home">
            <BrandMark />
            cennge-ui
          </Link>
          <nav aria-label="Site" className="flex items-center gap-5 text-[15px] sm:gap-7">
            <Link href="/docs/introduction/" className="landing-link">
              Docs
            </Link>
            <a href={`${repository}/blob/main/CHANGELOG.md`} className="landing-link max-sm:hidden">
              Changelog
            </a>
            <a href={repository} className="landing-link">
              GitHub
            </a>
          </nav>
        </header>

        <h1 id="hero-title" className="hero-h1">
          <span className="hero-line" style={order(0)}>
            <span>npm update,</span>
          </span>{" "}
          <span className="hero-line hero-line-b" style={order(1)}>
            <span>fixed everywhere.</span>
          </span>
        </h1>

        <div className="hero-lead hero-rise" style={order(3)}>
          <p className="text-lg leading-[1.5] text-pretty">
            Dark-first React components on Radix UI and Tailwind CSS v4, installed from npm instead of copied
            into each project, so a fix ships once and reaches every app.
          </p>
          <Button asChild color="primary" size="lg" className="self-start">
            <Link href="/docs/installation/">Install cennge-ui</Link>
          </Button>
        </div>

        <div className="reel-window hero-rise" style={order(2)}>
          {/* Narrow screens show one fix at a time, picked here; wide ones step through them as the page scrolls. */}
          <div data-ui className="reel-picker">
            <ToggleGroup
              aria-label="Fix shown"
              value={String(active)}
              onValueChange={(value) => value && setActive(Number(value))}
            >
              {fixes.map((fix, index) => (
                <ToggleGroupItem key={fix.name} value={String(index)}>
                  {fix.name}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
          </div>
          <ol
            className="reel"
            aria-label="Fixes from the changelog"
            style={{ "--active": isReel ? active : 0 } as CSSProperties}
          >
            {fixes.map((fix, index) => (
              <li
                key={fix.name}
                className="reel-frame"
                data-active={index === active ? "" : undefined}
                onFocus={() => bringIntoView(index)}
              >
                <div className="flex flex-col gap-1.5">
                  <p className="flex items-center gap-2 text-[15px] font-semibold">
                    {fix.name}
                    <Badge color="primary" className="text-[13px]">
                      fixed in {fix.version}
                    </Badge>
                  </p>
                  <p className="text-[15px] leading-[1.45] text-pretty">{fix.text}</p>
                </div>
                <div data-ui className="reel-fragment">
                  {fix.fragment}
                </div>
              </li>
            ))}
          </ol>
        </div>

        <div className="hero-live hero-rise" style={order(4)}>
          <p className="text-[15px] leading-[1.45] text-pretty">
            Pick an accent or a theme: this page and every component on it repaint, as your app would.
          </p>
          <LiveControls className="hero-live-controls" />
        </div>
      </div>
    </section>
  );
}
