import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { SurveyBuilder, SurveyProvider } from ".";
// Function to extract surveyId from URL
function getSurveyIdFromUrl(): string | null {
  const params = new URLSearchParams(window.location.search);
  return params.get("surveyId");
}
const surveyId = getSurveyIdFromUrl() || undefined; // From URL params, state, etc.

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <SurveyProvider surveyId={surveyId}>
      <SurveyBuilder />
    </SurveyProvider>
  </StrictMode>,
);
