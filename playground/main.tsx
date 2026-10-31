import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { CenngeProvider, Toaster, initTheme } from "cennge-ui";
import { setMapWorkerUrl } from "cennge-ui/map";
import mapWorkerUrl from "maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url";
import { App, themeOptions } from "./App";
import "./fonts";
import "./styles.css";

setMapWorkerUrl(mapWorkerUrl);
// No server here to put ThemeScript in the page: the stored theme goes on before the first render.
initTheme(themeOptions);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    {/* The playground is in Russian: dates and numbers too. */}
    <CenngeProvider locale="ru-RU">
      <App />
      <Toaster />
    </CenngeProvider>
  </StrictMode>,
);
