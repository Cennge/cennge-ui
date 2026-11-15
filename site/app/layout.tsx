import "@fontsource/inter/400.css";
import "@fontsource/inter/500.css";
import "@fontsource/inter/600.css";
import "@fontsource/inter/700.css";
import "@fontsource/jetbrains-mono/400.css";
import "@fontsource/jetbrains-mono/500.css";
import "./globals.css";
import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { ThemeScript, Toaster } from "cennge-ui";
import { accentScript } from "@/lib/accent";

export const metadata: Metadata = {
  title: { default: "cennge-ui: React components you update, not copy", template: "%s · cennge-ui" },
  description:
    "Tactile, dark-first React components on Radix UI and Tailwind CSS v4. Install from npm, theme with one accent, get fixes with npm update.",
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#111317" },
    { media: "(prefers-color-scheme: light)", color: "#eef0f3" },
  ],
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    // The theme and accent scripts set class and data-accent before hydration: React must not mind them.
    <html lang="en" suppressHydrationWarning>
      <head>
        <ThemeScript defaultTheme="dark" />
        <script dangerouslySetInnerHTML={{ __html: accentScript }} />
      </head>
      <body>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
