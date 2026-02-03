import React from "react";
import type { SurveyExport } from "../types";

interface JsonTabProps {
  survey: SurveyExport;
}

export const JsonTab: React.FC<JsonTabProps> = ({ survey }) => {
  return (
    <div className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-auto h-[600px] font-mono text-sm">
      <pre>{JSON.stringify(survey, null, 2)}</pre>
    </div>
  );
};
