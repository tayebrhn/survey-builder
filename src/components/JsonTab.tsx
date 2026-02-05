import React from "react";
import { useSurveyContext } from "..";

export const JsonTab: React.FC = () => {
  const { survey } = useSurveyContext();
  return (
    <div className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-auto h-150 font-mono text-sm">
      <pre>{JSON.stringify(survey, null, 2)}</pre>
    </div>
  );
};
