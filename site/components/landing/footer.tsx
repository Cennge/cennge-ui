import Link from "next/link";
import type { CSSProperties } from "react";
import { BrandMark } from "../brand-mark";
import { repository } from "./links";
import { LiveControls } from "./live-controls";

const guides = [
  { href: "/docs/introduction/", label: "Introduction" },
  { href: "/docs/installation/", label: "Installation" },
  { href: "/docs/theming/", label: "Theming" },
  { href: "/docs/dark-mode/", label: "Dark mode" },
  { href: "/docs/server-rendering/", label: "Next.js and SSR" },
];

export function LandingFooter({ version }: { version: string }) {
  return (
    <footer className="foot" aria-label="cennge-ui">
      <div className="foot-tile foot-statement" data-reveal>
        <p className="landing-heading text-pretty">
          React components you install and update, not copy.
        </p>
        <p className="text-[13px] text-muted">
          Version {version}. MIT licence, © 2026 Cennge.
        </p>
      </div>
      <nav className="foot-tile foot-nav" aria-label="Guides" data-reveal style={{ "--i": 1 } as CSSProperties}>
        <ul className="flex flex-col gap-1.5 text-base">
          {guides.map((guide) => (
            <li key={guide.href}>
              <Link href={guide.href} className="landing-link">
                {guide.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      <div className="foot-tile foot-live" data-reveal style={{ "--i": 2 } as CSSProperties}>
        <p className="text-base leading-[1.45]">Another accent, or the other theme</p>
        <LiveControls className="items-start" />
      </div>
      <div className="foot-tile foot-source" data-reveal style={{ "--i": 3 } as CSSProperties}>
        <p className="text-base text-muted">Source, issues and releases</p>
        <a href={repository} className="landing-link text-lg">
          github.com/
          <wbr />
          Cennge/
          <wbr />
          cennge-ui
        </a>
      </div>
      <div className="foot-tile foot-mark" data-reveal>
        <p className="landing-display flex items-center gap-[0.22em]" aria-hidden="true">
          <BrandMark />
          cennge-ui
        </p>
      </div>
      <Link href="/docs/introduction/" className="foot-tile foot-go" data-reveal style={{ "--i": 1 } as CSSProperties}>
        <span className="landing-heading font-semibold">Read the docs</span>
        <svg viewBox="0 0 48 48" className="foot-arrow" fill="none" stroke="currentColor" strokeWidth="4" aria-hidden="true">
          <path d="M10 38 38 10M16 10h22v22" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </Link>
    </footer>
  );
}
