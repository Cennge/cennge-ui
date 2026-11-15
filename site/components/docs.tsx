import Link from "next/link";
import type { ReactNode } from "react";
import { Kbd, Table, TableBody, TableCell, TableColumn, TableHeader, TableRow, type KbdProps } from "cennge-ui";
import facts from "@/generated/facts.json";
import { exampleSource } from "@/lib/examples";
import { pageBySlug } from "@/lib/nav";
import { describeInherits, propsOf, type PropDoc } from "@/lib/props";
import { CodeBlock } from "./code-block";
import { OnThisPage } from "./on-this-page";
import { repository } from "./docs-shell";

type Facts = {
  from: string;
  imports: string[];
  gzip: number | null;
  unit: boolean;
  specs: string[];
  ssr: boolean;
  source: string | null;
};
const allFacts = facts as Record<string, Facts>;

/* ------------------------------------------------------------------ page */

/** The page's title and lede, from the nav, and the reading column below them. */
function Heading({ slug, lede }: { slug: string; lede?: ReactNode }) {
  const { page } = pageBySlug(slug);
  return (
    <div className="min-w-0">
      <h1 className="text-[2.5rem] leading-[1.15] font-bold tracking-[-0.025em] text-balance max-sm:text-[2rem]">{page.title}</h1>
      <p className="mt-2 max-w-[60ch] text-lg leading-normal text-pretty">{lede ?? page.summary}</p>
    </div>
  );
}

function PreviousNext({ slug }: { slug: string }) {
  const { previous, next } = pageBySlug(slug);
  const link =
    "group flex min-w-0 flex-1 flex-col gap-0.5 rounded-large bg-surface-2 px-5 py-4 transition-colors duration-(--cennge-duration-fast) hover:bg-surface-3 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary focus-visible:outline-solid";
  return (
    <nav aria-label="Previous and next page" className="mt-20 flex flex-wrap gap-3">
      {previous ? (
        <Link href={`/docs/${previous.slug}/`} className={link}>
          <span className="text-sm text-muted">Previous</span>
          <span className="truncate font-semibold">{previous.title}</span>
        </Link>
      ) : (
        <span className="flex-1" />
      )}
      {next ? (
        <Link href={`/docs/${next.slug}/`} className={`${link} items-end text-right`}>
          <span className="text-sm text-muted">Next</span>
          <span className="truncate font-semibold">{next.title}</span>
        </Link>
      ) : null}
    </nav>
  );
}

const column = "cennge-prose max-w-[68ch] min-w-0";

/** A guide: title, lede and prose. */
export function Guide({ slug, lede, children }: { slug: string; lede?: ReactNode; children: ReactNode }) {
  return (
    <article className="mx-auto grid w-full max-w-[76rem] grid-cols-1 gap-x-10 px-4 pt-8 pb-16 sm:px-6 lg:px-10 xl:grid-cols-[minmax(0,1fr)_16.25rem]">
      <Heading slug={slug} lede={lede} />
      <div data-reading className={`${column} mt-8 xl:col-start-1`}>
        {children}
      </div>
      <div className="xl:col-start-2 xl:row-span-2 xl:row-start-2 xl:mt-8">
        <div className="xl:sticky xl:top-20">
          <OnThisPage />
        </div>
      </div>
      <div className="xl:col-start-1">
        <PreviousNext slug={slug} />
      </div>
    </article>
  );
}

export interface FieldMarksProps {
  /** The WAI-ARIA pattern or native element it follows. */
  pattern?: ReactNode;
  /** Keys it answers to, as Kbd props. */
  keyboard?: (string | KbdProps)[];
  /** How its value is held: controlled, uncontrolled, both. */
  state?: ReactNode;
  /** Anything else a reader checks before choosing it. */
  extra?: { term: string; detail: ReactNode }[];
}

/**
 * A component's entry, as in a field guide: the live plate and its field marks first, then the reading
 * column (when to use it, look-alikes, examples, props).
 */
export function Entry({
  slug,
  lede,
  plate,
  marks,
  children,
}: {
  slug: string;
  lede?: ReactNode;
  plate: ReactNode;
  marks?: FieldMarksProps;
  children: ReactNode;
}) {
  return (
    <article className="mx-auto grid w-full max-w-[76rem] grid-cols-1 gap-x-10 px-4 pt-8 pb-16 sm:px-6 lg:px-10 xl:grid-cols-[minmax(0,1fr)_16.25rem]">
      <Heading slug={slug} lede={lede} />
      <div className="mt-6 min-w-0 xl:col-start-1">{plate}</div>
      <div className="mt-8 xl:col-start-2 xl:row-span-3 xl:row-start-2 xl:mt-6">
        {/* The field marks scroll away with the plate; the contents stay in view down the page. */}
        <div className="flex h-full flex-col gap-10">
          <FieldMarks slug={slug} {...marks} />
          <div className="xl:sticky xl:top-20">
            <OnThisPage />
          </div>
        </div>
      </div>
      <div data-reading className={`${column} mt-10 xl:col-start-1`}>
        {children}
      </div>
      <div className="xl:col-start-1">
        <PreviousNext slug={slug} />
      </div>
    </article>
  );
}

/* ----------------------------------------------------------------- plate */

/** A numbered mark linking a spot on the plate to its note in the key. */
export function Mark({ n }: { n: number }) {
  return (
    <span
      aria-hidden="true"
      className="inline-grid size-5 shrink-0 place-items-center rounded-full bg-primary text-[11.5px] leading-none font-bold text-primary-foreground tabular-nums"
    >
      {n}
    </span>
  );
}

/**
 * The identification plate: the component working, at full size, with a key of numbered notes on how
 * it behaves. Readers click, type and press keys on it.
 */
export function Plate({ children, notes, caption = "Live: the component itself, not a picture of it." }: { children: ReactNode; notes?: ReactNode[]; caption?: ReactNode }) {
  // Outside the reading column, so no prose styles reach it and it needs no `not-prose`.
  return (
    <figure className="grid gap-8 rounded-large bg-surface-2 p-6 sm:p-7 lg:grid-cols-[minmax(0,1fr)_17rem] lg:gap-14">
      <div className="flex min-h-56 min-w-0 flex-wrap content-start items-start gap-x-10 gap-y-6">{children}</div>
      <div className="flex flex-col gap-4 lg:justify-end">
        {notes?.length ? (
          <ol className="grid gap-2.5 text-sm leading-[1.45]">
            {notes.map((note, index) => (
              <li key={index} className="flex gap-2.5">
                <Mark n={index + 1} />
                <span>{note}</span>
              </li>
            ))}
          </ol>
        ) : null}
        <figcaption className="text-[13px] text-muted">{caption}</figcaption>
      </div>
    </figure>
  );
}

/* ----------------------------------------------------------- field marks */

function kb(bytes: number) {
  return `${(bytes / 1024).toFixed(1)} KB`;
}

const engines = "Chromium, Firefox and WebKit, on desktop and phone viewports";

function FieldMarks({ slug, pattern, keyboard, state, extra, className = "" }: FieldMarksProps & { slug: string; className?: string }) {
  const fact = allFacts[slug];
  if (!fact) return null;
  const importLine = fact.imports.length ? `import { ${fact.imports.join(", ")} } from "${fact.from}";` : null;
  const rows: { term: string; detail: ReactNode }[] = [];
  if (fact.gzip !== null) rows.push({ term: "Size", detail: `${kb(fact.gzip)} gzip for this import, its dependencies aside` });
  if (pattern) rows.push({ term: "Pattern", detail: pattern });
  if (keyboard?.length)
    rows.push({
      term: "Keyboard",
      detail: (
        <span className="flex flex-wrap gap-1.5">
          {keyboard.map((key, index) =>
            typeof key === "string" ? (
              <Kbd key={index} size="sm">
                {key}
              </Kbd>
            ) : (
              <Kbd key={index} size="sm" {...key} />
            ),
          )}
        </span>
      ),
    });
  if (state) rows.push({ term: "State", detail: state });
  if (fact.ssr) rows.push({ term: "SSR", detail: "Rendered on the server in the Next.js check; hydrates without a warning" });
  rows.push(...(extra ?? []));
  if (fact.unit || fact.specs.length)
    rows.push({
      term: "Tests",
      detail: (
        <>
          {fact.unit ? "Unit tests" : null}
          {fact.unit && fact.specs.length ? "; " : null}
          {fact.specs.length ? (
            <>
              end-to-end in {engines}:{" "}
              {fact.specs.map((spec, index) => (
                <span key={spec}>
                  {index ? ", " : null}
                  <a className="docs-link" href={`${repository}/blob/main/e2e/${spec}`}>
                    {spec.replace(".spec.ts", "")}
                  </a>
                </span>
              ))}
            </>
          ) : null}
        </>
      ),
    });
  if (fact.source)
    rows.push({
      term: "Source",
      detail: (
        <a className="docs-link" href={`${repository}/tree/main/${fact.source}`}>
          {fact.source}
        </a>
      ),
    });

  return (
    <section aria-labelledby={`${slug}-marks`} className={`min-w-0 ${className}`}>
      <h2 id={`${slug}-marks`} className="mb-3.5 text-[15px] font-semibold">
        Field marks
      </h2>
      <dl className="grid gap-x-8 gap-y-3.5 sm:grid-cols-2 xl:grid-cols-1">
        {importLine ? (
          <div className="sm:col-span-2 xl:col-span-1">
            <dt className="mb-1 text-[13px] font-medium text-muted">Import</dt>
            <dd>
              <CodeBlock code={importLine} className="[&_.code]:py-2.5 [&_.code]:pr-11 [&_.code]:text-[12.5px] [&_pre]:whitespace-pre-wrap" />
            </dd>
          </div>
        ) : null}
        {rows.map((row) => (
          <div key={row.term}>
            <dt className="mb-0.5 text-[13px] font-medium text-muted">{row.term}</dt>
            <dd className="text-[14.5px] leading-[1.45]">{row.detail}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

/* --------------------------------------------------------------- example */

/**
 * A working example and its source, the file a reader copies. Not clipped: menus that open in place
 * (NavigationMenu) reach past it on phones.
 *
 * The figure is `not-prose`, so the reading column's prose styles stay off the example. A `<Prose>`
 * example sets `isProse`: the library switches off prose for anything under a `not-prose`, nested
 * `<Prose>` included, so there only the code block is fenced off.
 */
export function Example({ file, children, className = "", isProse = false }: { file: string; children: ReactNode; className?: string; isProse?: boolean }) {
  const code = exampleSource(file);
  return (
    <figure data-example className={`my-6 ${isProse ? "" : "not-prose"}`}>
      <div className={`flex min-h-40 flex-wrap items-center gap-4 rounded-t-large bg-surface-2 p-6 sm:p-8 ${className}`}>{children}</div>
      <CodeBlock
        code={code}
        title={`${file.split("/").pop()}.tsx`}
        className="not-prose rounded-t-none rounded-b-large bg-[color-mix(in_oklab,var(--cennge-surface-2)_45%,var(--cennge-surface-1))] [&_.code]:max-h-[28rem]"
      />
    </figure>
  );
}

/* ----------------------------------------------------------------- props */

/** JSDoc text with its `code` spans set as code. */
function Doc({ text }: { text: string }) {
  return (
    <>
      {text.split(/(`[^`]+`)/).map((part, index) =>
        part.startsWith("`") && part.endsWith("`") ? (
          <code key={index} className="rounded-small bg-surface-3 px-1 py-px font-code text-[12.5px]">
            {part.slice(1, -1)}
          </code>
        ) : (
          part
        ),
      )}
    </>
  );
}

function TypeCell({ prop }: { prop: PropDoc }) {
  return (
    <div className="flex flex-col gap-1.5">
      {prop.values ? (
        <span className="flex flex-wrap gap-1">
          {prop.values.map((value) => (
            <code key={value} className="rounded-small bg-surface-3 px-1.5 py-0.5 font-code text-[12.5px]">
              {value}
            </code>
          ))}
        </span>
      ) : (
        <code className="font-code text-[12.5px] break-words text-[var(--code-token-constant)]">{prop.type}</code>
      )}
      {prop.description ? (
        <span className="text-sm leading-[1.5] text-foreground">
          <Doc text={prop.description} />
        </span>
      ) : null}
      {prop.only ? <span className="text-[13px] text-muted">Only with {prop.only}</span> : null}
      {prop.deprecated ? <span className="text-[13px] text-danger-text">Deprecated: {prop.deprecated}</span> : null}
    </div>
  );
}

/** The props of one component, read from its TypeScript types at build time. */
export function Props({ of, title }: { of: string; title?: string }) {
  const doc = propsOf(of);
  const inherited = doc.inherits.map(describeInherits).filter((entry) => entry.element);
  const name = title ?? of.replace(/Props$/, "");
  return (
    <div className="not-prose my-6">
      <Table aria-label={`${name} props`} size="sm" classNames={{ wrapper: "rounded-large bg-surface-2" }}>
        <TableHeader>
          <TableColumn className="w-[11rem]">Prop</TableColumn>
          <TableColumn>Type</TableColumn>
          <TableColumn className="w-[8rem]">Default</TableColumn>
        </TableHeader>
        <TableBody>
          {doc.props.map((prop) => (
            <TableRow key={prop.name}>
              <TableCell className="align-top">
                <code className="font-code text-[13px] font-medium text-[var(--code-token-keyword)]">{prop.name}</code>
                {prop.required ? <span className="ml-1.5 text-[12px] text-muted">required</span> : null}
              </TableCell>
              <TableCell className="align-top">
                <TypeCell prop={prop} />
              </TableCell>
              <TableCell className="align-top">
                {prop.default ? <code className="font-code text-[12.5px]">{prop.default}</code> : <span className="text-muted">–</span>}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      {inherited.length ? (
        <p className="mt-3 text-sm text-muted">
          Also takes every attribute of{" "}
          {inherited.map((entry, index) => (
            <span key={entry.raw}>
              {index ? " and " : null}
              <code className="font-code text-[12.5px] text-foreground">&lt;{entry.element}&gt;</code>
            </span>
          ))}
          {inherited.some((entry) => entry.omitted.length)
            ? `, except ${inherited
                .flatMap((entry) => entry.omitted)
                .map((name) => `${name}`)
                .join(", ")}, which mean something else here`
            : ""}
          .
        </p>
      ) : null}
    </div>
  );
}

/** A look-alike and how to tell it apart: the "Similar" list of an entry. */
export function Similar({ items }: { items: { slug: string; title: string; difference: ReactNode }[] }) {
  return (
    <ul>
      {items.map((item) => (
        <li key={item.slug}>
          <Link href={`/docs/${item.slug}/`}>{item.title}</Link>: {item.difference}
        </li>
      ))}
    </ul>
  );
}
