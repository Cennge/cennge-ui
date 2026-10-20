import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { CenngeProvider, Toaster } from "cennge-ui";
import { setMapWorkerUrl } from "cennge-ui/map";
import mapWorkerUrl from "maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url";
import { App } from "./App";
import "./fonts";
import "./styles.css";

setMapWorkerUrl(mapWorkerUrl);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    {/* The playground is in Russian: dates and numbers too. */}
    <CenngeProvider locale="ru-RU">
      <App />
      <Toaster />
    </CenngeProvider>
  </StrictMode>,
);
