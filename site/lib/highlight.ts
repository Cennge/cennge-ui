import { createCssVariablesTheme, createHighlighter, type Highlighter } from "shiki";

// Colours come from CSS variables (globals.css), so code follows the theme and the accent like everything else.
const theme = createCssVariablesTheme({ name: "cennge", variablePrefix: "--code-", fontStyle: true });
export const languages = ["tsx", "ts", "bash", "css", "json", "html"] as const;
export type Language = (typeof languages)[number];

let highlighter: Promise<Highlighter> | undefined;

/** Highlighted HTML for a code block: runs at build time, so pages ship no highlighter. */
export async function highlight(code: string, lang: Language): Promise<string> {
  highlighter ??= createHighlighter({ themes: [theme], langs: [...languages] });
  return (await highlighter).codeToHtml(code.trimEnd(), { lang, theme: "cennge" });
}
