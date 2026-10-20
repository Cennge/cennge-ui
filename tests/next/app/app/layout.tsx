import type { Metadata } from "next";
import type { ReactNode } from "react";
import { CenngeProvider, Toaster } from "cennge-ui";
import { MapWorker } from "./map-worker";
import "./globals.css";

export const metadata: Metadata = { title: "cennge-ui in Next.js" };

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ru" className="dark">
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
