// contexts/SurveyContext.tsx
import React, { createContext, useContext } from "react";
import { useSurvey } from "..";

const SurveyContext = createContext<ReturnType<typeof useSurvey> | null>(null);

// const SurveyContext = createContext<SurveyContextType | undefined>(undefined);

export const SurveyProvider: React.FC<{
  surveyId?: string;
  children: React.ReactNode;
}> = ({ surveyId, children }) => {
  const surveyState = useSurvey(surveyId);

  return (
    <SurveyContext.Provider value={surveyState}>
      {children}
    </SurveyContext.Provider>
  );
};

export const useSurveyContext = () => {
  const ctx = useContext(SurveyContext);
  if (!ctx) {
    throw new Error("useSurveyContext must be used inside SurveyProvider");
  }
  return ctx;
};
