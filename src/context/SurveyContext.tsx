import React, { createContext, useContext } from "react";
import { useSurvey } from "../hooks/";

const SurveyContext = createContext<ReturnType<typeof useSurvey> | null>(null);

export const SurveyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const surveyState = useSurvey();
  return (
    <SurveyContext.Provider value={surveyState}>
      {children}
    </SurveyContext.Provider>
  );
};

export const useSurveyContext = () => {
  const ctx = useContext(SurveyContext);
  if (!ctx) {
    throw new Error("useSurveyContext must be used inside MetaProvider");
  }
  return ctx;
};

