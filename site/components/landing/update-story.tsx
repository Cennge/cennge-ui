"use client";

import { useEffect, useRef, useState } from "react";
import UpdateSteps from "@/examples/landing/update-steps";

const words = ["no", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten"];

export function UpdateStory({ releases, version }: { releases: number; version: string }) {
  const count = words[releases] ?? String(releases);
  const statements = [
    {
      title: "Install it once.",
      text: "npm install cennge-ui, then its stylesheet after Tailwind’s. It needs React 17, 18 or 19 and Tailwind CSS v4.",
    },
    {
      title: "Then a fix ships in a release.",
      text: `Each change to the package comes with a changeset, which becomes a version and a line in the changelog. ${count[0]!.toUpperCase()}${count.slice(1)} releases so far, the latest ${version}.`,
    },
    {
      title: "npm update, and every app has it.",
      text: "No component was copied into your code, so there is no copy to patch by hand in each project.",
    },
  ];

  const blocks = useRef<(HTMLDivElement | null)[]>([]);
  const [active, setActive] = useState(0);

  // The statement crossing the middle of the screen sets the stepper's step.
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActive(Number((entry.target as HTMLElement).dataset.step));
        }
      },
      { rootMargin: "-45% 0px -45% 0px" },
    );
    blocks.current.forEach((block) => block && observer.observe(block));
    return () => observer.disconnect();
  }, []);

  // A click on a step scrolls to its statement, which then sets the step.
  const go = (step: number) => {
    const block = blocks.current[step];
    setActive(step);
    if (!block || !window.matchMedia("(min-width: 1024px)").matches) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const top = block.getBoundingClientRect().top + window.scrollY - (window.innerHeight - block.offsetHeight) / 2;
    window.scrollTo({ top, behavior: reduce ? "instant" : "smooth" });
  };

  return (
    <section className="story" aria-labelledby="story-title">
      <h2 id="story-title" className="landing-heading story-title" data-reveal>
        Updating is the feature
      </h2>
      <div className="story-stage">
        <div className="story-sticky" data-reveal>
          <div data-ui className="story-fragment">
            <UpdateSteps step={active} onStepChange={go} />
          </div>
        </div>
      </div>
      <div className="story-text">
        {statements.map((statement, index) => (
          <div
            key={statement.title}
            ref={(node) => {
              blocks.current[index] = node;
            }}
            data-step={index}
            data-active={index === active ? "" : undefined}
            className="story-step"
          >
            <h3 className="story-statement">{statement.title}</h3>
            <p className="mt-3 max-w-[44ch] text-base leading-[1.55] text-pretty">{statement.text}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
