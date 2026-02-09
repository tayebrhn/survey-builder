import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Toaster } from "sonner";
import "./index.css";
import { AuthProvider, SurveyBuilder, SurveyProvider } from ".";
import { BrowserRouter } from "react-router-dom";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Toaster richColors position="top-center" />
    <BrowserRouter>
      <AuthProvider>
        <SurveyProvider>
          <SurveyBuilder />
        </SurveyProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
);
