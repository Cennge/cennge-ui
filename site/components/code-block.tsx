import { cn } from "cennge-ui/utils";
import { highlight, type Language } from "@/lib/highlight";
import { CopyButton } from "./copy-button";

/** A highlighted, copyable block of code. Rendered at build time. */
export async function CodeBlock({
  code,
  lang = "tsx",
  title,
  className = "",
}: {
  code: string;
  lang?: Language;
  /** A file name or a short caption above the code. */
  title?: string;
  className?: string;
}) {
  const html = await highlight(code, lang);
  return (
    <div data-slot="code-block" className={cn("group/code relative overflow-hidden rounded-large bg-surface-2", className)}>
      {title ? (
        <div className="flex h-10 items-center px-4 text-[13px] text-muted">{title}</div>
      ) : null}
      <div
        // Shiki's <pre>; it scrolls sideways on its own and is reachable by keyboard.
        className="code overflow-x-auto px-4 py-3.5 font-code text-[13.5px] leading-[1.7] [&_pre]:outline-none [&_pre:focus-visible]:outline-2"
        dangerouslySetInnerHTML={{ __html: html.replace("<pre ", '<pre tabindex="0" ') }}
      />
      <CopyButton text={code.trimEnd()} className="absolute top-2 right-2" />
    </div>
  );
}
