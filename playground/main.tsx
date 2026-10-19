import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { CenngeProvider, Toaster } from "cennge-ui";
import { App } from "./App";
import "./fonts";
import "./styles.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    {/* The playground is in Russian: dates and numbers too. */}
    <CenngeProvider locale="ru-RU">
      <App />
      <Toaster />
    </CenngeProvider>
  </StrictMode>,
);
