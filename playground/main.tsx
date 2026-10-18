import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { CenngeProvider, Toaster } from "cennge-ui";
import { App } from "./App";
import "./styles.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <CenngeProvider>
      <App />
      <Toaster />
    </CenngeProvider>
  </StrictMode>,
);
