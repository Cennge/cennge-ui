import data from "../generated/props.json";

export interface PropDoc {
  name: string;
  type: string;
  values?: string[];
  required: boolean;
  default?: string;
  deprecated?: string;
  description?: string;
  only?: string;
}
export interface PropsDoc {
  source: string;
  description?: string;
  inherits: string[];
  props: PropDoc[];
}

const all = data as Record<string, PropsDoc>;

export function propsOf(name: string): PropsDoc {
  const doc = all[name];
  if (!doc) throw new Error(`No props named ${name} in generated/props.json: export it from the library.`);
  return doc;
}

/** "Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "color">" -> the element and what is left out. */
export function describeInherits(text: string): { element?: string; omitted: string[]; raw: string } {
  const omitted = [...text.matchAll(/"([^"]+)"/g)].map((match) => match[1]!);
  const element =
    /HTML(\w+)Element/.exec(text)?.[1]?.replace(/^Anchor$/, "a").replace(/^Div$/, "div").replace(/^Input$/, "input") ??
    /ComponentPropsWithoutRef<"(\w+)">/.exec(text)?.[1];
  return { element: element?.toLowerCase(), omitted: element ? omitted.filter((name) => name !== element) : omitted, raw: text };
}
