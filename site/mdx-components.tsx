import Link from "next/link";
import type { MDXComponents } from "mdx/types";
import { isValidElement, type ReactNode } from "react";
import { CodeBlock } from "@/components/code-block";
import { languages, type Language } from "@/lib/highlight";

function text(node: ReactNode): string {
  if (typeof node === "string" || typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(text).join("");
  if (isValidElement<{ children?: ReactNode }>(node)) return text(node.props.children);
  return "";
}

const slugify = (value: string) =>
  value
    .toLowerCase()
    .replace(/[`"'’]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

function heading(Tag: "h2" | "h3") {
  return function Heading({ children }: { children?: ReactNode }) {
    const id = slugify(text(children));
    return (
      <Tag id={id}>
        {children}
        <a href={`#${id}`} className="heading-anchor" aria-label={`Link to ${text(children)}`}>
          #
        </a>
      </Tag>
    );
  };
}

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    h2: heading("h2"),
    h3: heading("h3"),
    a: ({ href = "", children }) =>
      href.startsWith("/") ? <Link href={href}>{children}</Link> : <a href={href}>{children}</a>,
    // A fenced block: ```tsx title="app/layout.tsx"
    pre: ({ children }) => {
      const code = isValidElement<{ className?: string; children?: ReactNode }>(children) ? children : null;
      const lang = /language-(\w+)/.exec(code?.props.className ?? "")?.[1] ?? "tsx";
      return (
        <CodeBlock
          code={text(code?.props.children)}
          lang={(languages as readonly string[]).includes(lang) ? (lang as Language) : "tsx"}
          className="not-prose my-5"
        />
      );
    },
    ...components,
  };
}
