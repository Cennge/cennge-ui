import type { Metadata } from "next";
import type { ReactNode } from "react";
import { CenngeProvider, ThemeScript, Toaster } from "cennge-ui";
import { MapWorker } from "./map-worker";
import "./globals.css";

export const metadata: Metadata = { title: "cennge-ui in Next.js" };

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    // The theme script sets the class on <html> before React hydrates: suppressHydrationWarning says that is expected.
    <html lang="ru" suppressHydrationWarning>
      <head>
        {/* The playground opens dark (its App uses the same options). */}
        <ThemeScript defaultTheme="dark" />
      </head>
      <body>
        {/* As in the playground: dates and numbers in Russian. */}
        <MapWorker />
        <CenngeProvider locale="ru-RU">
          {children}
          <Toaster />
        </CenngeProvider>
      </body>
    </html>
  );
}
