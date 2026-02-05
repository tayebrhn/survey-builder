import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { SurveyProvider } from "./context";
import { SurveyBuilder } from ".";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <SurveyProvider>
      <SurveyBuilder />
    </SurveyProvider>
  </StrictMode>,
);
