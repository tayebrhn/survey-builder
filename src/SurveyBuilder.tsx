import { useState } from "react";
import { Save, Settings, List, FileJson, Loader, Download } from "lucide-react";
import {
  JsonTab,
  MetaProvider,
  QuestionsTab,
  SettingsTab,
  SkipLogicTab,
  SurveyImportButton,
  SurveySkeleton,
  useAuth,
  useSurveyContext,
} from ".";
import { HeaderActionButton } from "./components/subs/HeaderActionButton ";

type TabType = "settings" | "questions" | "logic" | "json";

export default function SurveyBuilder() {
  const { can } = useAuth();

  const { survey, handleSave, exportSurveyToJSON, isSaving, isLoading } =
    useSurveyContext();
  const [activeTab, setActiveTab] = useState<TabType>("settings");

  // In your SurveyBuilder component, replace the loading condition:
  if (isLoading) {
    return <SurveySkeleton />;
  }
  if (isLoading) return <div>Loading permissions...</div>;
  const canEdit = can("eeusurvey_app.change_survey") && !survey.has_responses;
  return (
    <div className="min-h-screen bg-gray-50 p-8 font-sans">
      <div className="max-w-5xl mx-auto bg-white shadow-lg rounded-xl overflow-hidden">
        {/* Header */}
        <fieldset>
          <div className="bg-blue-600 p-6 text-white flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold">
                {survey.metadata.title || "Untitled Survey"}
              </h1>
              <p className="text-blue-100 text-sm">Builder v1.0</p>
            </div>
            <div className="flex gap-3">
              <SurveyImportButton disabled={isSaving || isLoading} />

              <HeaderActionButton
                onClick={exportSurveyToJSON}
                disabled={isSaving || isLoading || !canEdit}
                icon={<Download size={18} />}
                label="Export"
              />

              <HeaderActionButton
                onClick={handleSave}
                disabled={isSaving || isLoading || !canEdit}
                loading={isSaving}
                icon={<Save size={18} />}
                label="Save"
                loadingLabel="Saving..."
              />
            </div>
          </div>

          {/* Navigation Tabs - Disable while loading */}
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => !isLoading && setActiveTab("settings")}
              disabled={isLoading}
              className={`flex-1 py-4 text-center font-medium flex justify-center items-center gap-2 ${
                activeTab === "settings"
                  ? "text-blue-600 border-b-2 border-blue-600 bg-blue-50"
                  : "text-gray-500 hover:text-gray-700"
              } ${isLoading ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              <Settings size={18} /> Settings
              {isLoading && activeTab === "settings" && (
                <Loader className="animate-spin h-3 w-3 ml-1" />
              )}
            </button>
            <button
              onClick={() => !isLoading && setActiveTab("questions")}
              disabled={isLoading}
              className={`flex-1 py-4 text-center font-medium flex justify-center items-center gap-2 ${
                activeTab === "questions"
                  ? "text-blue-600 border-b-2 border-blue-600 bg-blue-50"
                  : "text-gray-500 hover:text-gray-700"
              } ${isLoading ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              <List size={18} />
              <span className="flex items-center gap-1">
                Questions ({survey.questions.length})
                {isLoading && activeTab === "questions" && (
                  <Loader className="animate-spin h-3 w-3" />
                )}
              </span>
            </button>
            <button
              onClick={() => !isLoading && setActiveTab("logic")}
              disabled={isLoading}
              className={`flex-1 py-4 text-center font-medium flex justify-center items-center gap-2 ${
                activeTab === "logic"
                  ? "text-blue-600 border-b-2 border-blue-600 bg-blue-50"
                  : "text-gray-500 hover:text-gray-700"
              } ${isLoading ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              <FileJson size={18} /> Skip Logic
              {isLoading && activeTab === "logic" && (
                <Loader className="animate-spin h-3 w-3 ml-1" />
              )}
            </button>
            <button
              onClick={() => !isLoading && setActiveTab("json")}
              disabled={isLoading}
              className={`flex-1 py-4 text-center font-medium flex justify-center items-center gap-2 ${
                activeTab === "json"
                  ? "text-blue-600 border-b-2 border-blue-600 bg-blue-50"
                  : "text-gray-500 hover:text-gray-700"
              } ${isLoading ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              <FileJson size={18} /> JSON Output
              {isLoading && activeTab === "json" && (
                <Loader className="animate-spin h-3 w-3 ml-1" />
              )}
            </button>
          </div>

          {/* Content Area - Show loading for active tab */}
          <MetaProvider>
            <div className="p-8 min-h-125">
              {isLoading ? (
                <div className="flex items-center justify-center h-64">
                  <div className="text-center">
                    <Loader className="animate-spin h-8 w-8 text-blue-600 mx-auto mb-4" />
                    <p className="text-gray-600">Loading {activeTab}...</p>
                  </div>
                </div>
              ) : (
                <>
                  {activeTab === "settings" && <SettingsTab />}
                  {activeTab === "questions" && <QuestionsTab />}
                  {activeTab === "logic" && <SkipLogicTab />}
                  {activeTab === "json" && <JsonTab />}
                </>
              )}
            </div>
          </MetaProvider>
        </fieldset>
      </div>
    </div>
  );
}
