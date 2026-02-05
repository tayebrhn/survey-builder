import { useState } from "react";
import { Save, Settings, List, FileJson, Loader } from "lucide-react";
import { JsonTab, MetaProvider, QuestionsTab, SettingsTab, SkipLogicTab, SurveySkeleton, useSurveyContext } from ".";


type TabType = "settings" | "questions" | "logic" | "json";

export default function SurveyBuilder() {
  const { survey, handleSave, isSaving, isLoading } = useSurveyContext();
  const [activeTab, setActiveTab] = useState<TabType>("settings");

  // In your SurveyBuilder component, replace the loading condition:
  if (isLoading) {
    return <SurveySkeleton />;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8 font-sans">
      <div className="max-w-5xl mx-auto bg-white shadow-lg rounded-xl overflow-hidden">
        {/* Header */}
        <div className="bg-blue-600 p-6 text-white flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">
              {survey.metadata.title || "Untitled Survey"}
            </h1>
            <p className="text-blue-100 text-sm">Builder v1.0</p>
          </div>
          <button
            onClick={handleSave}
            disabled={isSaving || isLoading} // Disable while saving or loading
            className={`${
              isSaving || isLoading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-white text-blue-600 hover:bg-blue-50"
            } px-4 py-2 rounded-lg font-semibold flex items-center gap-2 transition`}
          >
            {isSaving ? (
              <>
                <Loader className="animate-spin h-4 w-4" /> Saving...
              </>
            ) : (
              <>
                <Save size={18} /> Save
              </>
            )}
          </button>
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
      </div>
    </div>
  );
}