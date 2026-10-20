import * as React from "react";
import { cn } from "../utils/cn";
import { useMapContext } from "./context";

type Part = { text: string; href?: string };

/**
 * Sources credit themselves with HTML. Only its text and its http(s) links are kept, as React nodes:
 * a style from elsewhere cannot put markup or scripts into the page.
 */
export function parseCredit(html: string): Part[] {
  const parts: Part[] = [];
  const body = new DOMParser().parseFromString(html, "text/html").body;
  const walk = (node: Node) => {
    if (node.nodeType === Node.TEXT_NODE) {
      if (node.textContent) parts.push({ text: node.textContent });
      return;
    }
    if (node instanceof HTMLScriptElement || node instanceof HTMLStyleElement) return;
    if (node instanceof HTMLAnchorElement && /^https?:/i.test(node.getAttribute("href") ?? "")) {
      parts.push({ text: node.textContent ?? "", href: node.getAttribute("href") ?? undefined });
      return;
    }
    node.childNodes.forEach(walk);
  };
  walk(body);
  return parts;
}

/** The credits of the style's sources, in the corner. Their licences (OpenStreetMap's among them) ask for it. */
export function MapAttribution() {
  const { map, labels, styleRevision } = useMapContext("MapAttribution");
  const [credits, setCredits] = React.useState<string[]>([]);

  React.useEffect(() => {
    if (!map) return;
    const collect = () => {
      if (styleRevision === null) return;
      const found = new Set<string>();
      for (const id of Object.keys(map.getStyle().sources)) {
        const credit = (map.getSource(id) as { attribution?: string } | undefined)?.attribution;
        if (credit) found.add(credit);
      }
      const next = Array.from(found);
      setCredits((current) => (current.join("\n") === next.join("\n") ? current : next));
    };
    collect();
    // Tiled sources learn their credit when their description (TileJSON) arrives.
    map.on("sourcedata", collect);
    return () => {
      map.off("sourcedata", collect);
    };
  }, [map, styleRevision]);

  if (credits.length === 0) return null;
  return (
    <div
      aria-label={labels.attribution}
      role="group"
      data-slot="map-attribution"
      className={cn(
        "pointer-events-auto absolute right-0 bottom-0 z-[5] max-w-full rounded-tl-medium px-2 py-0.5",
        "bg-surface-1/80 text-[10px] leading-4 text-muted backdrop-blur-sm",
      )}
    >
      {credits.map((credit, index) => (
        <React.Fragment key={credit}>
          {index > 0 ? " · " : null}
          {parseCredit(credit).map((part, partIndex) =>
            part.href ? (
              <a
                key={partIndex}
                href={part.href}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(
                  "rounded-[2px] text-muted underline-offset-2 hover:text-foreground hover:underline",
                  "outline-none focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-ring",
                )}
              >
                {part.text}
              </a>
            ) : (
              <React.Fragment key={partIndex}>{part.text}</React.Fragment>
            ),
          )}
        </React.Fragment>
      ))}
    </div>
  );
}
