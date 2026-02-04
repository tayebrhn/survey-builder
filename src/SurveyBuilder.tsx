import { useState } from "react";
import { Save, Settings, List, FileJson } from "lucide-react";
import { useSurvey } from "./hooks/useSurvey";
import { SettingsTab } from "./components/SettingsTab";
import { QuestionsTab } from "./components/QuestionsTab";
import { SkipLogicTab } from "./components/SkipLogicTab";
import { JsonTab } from "./components/JsonTab";

type TabType = "settings" | "questions" | "logic" | "json";

export default function SurveyBuilder() {
  const {
    survey,
    updateMetadata,
    addCategory,
    updateCategory,
    onRemoveCategory,
    addQuestion,
    updateQuestion,
    deleteQuestion,
    addSkipLogic,
    updateSkipLogic,
    removeSkipLogic,
    addKeyChoice,
    updateKeyChoice,
    removeKeyChoice,
    handleSave,
  } = useSurvey();

  const [activeTab, setActiveTab] = useState<TabType>("settings");

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
            className="bg-white text-blue-600 px-4 py-2 rounded-lg font-semibold flex items-center gap-2 hover:bg-blue-50 transition"
          >
            <Save size={18} /> Save & Export
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab("settings")}
            className={`flex-1 py-4 text-center font-medium flex justify-center items-center gap-2 ${
              activeTab === "settings"
                ? "text-blue-600 border-b-2 border-blue-600 bg-blue-50"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <Settings size={18} /> Settings
          </button>
          <button
            onClick={() => setActiveTab("questions")}
            className={`flex-1 py-4 text-center font-medium flex justify-center items-center gap-2 ${
              activeTab === "questions"
                ? "text-blue-600 border-b-2 border-blue-600 bg-blue-50"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <List size={18} /> Questions ({survey.questions.length})
          </button>
          <button
            onClick={() => setActiveTab("logic")}
            className={`flex-1 py-4 text-center font-medium flex justify-center items-center gap-2 ${
              activeTab === "logic"
                ? "text-blue-600 border-b-2 border-blue-600 bg-blue-50"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <FileJson size={18} /> Skip Logic
          </button>
          <button
            onClick={() => setActiveTab("json")}
            className={`flex-1 py-4 text-center font-medium flex justify-center items-center gap-2 ${
              activeTab === "json"
                ? "text-blue-600 border-b-2 border-blue-600 bg-blue-50"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <FileJson size={18} /> JSON Output
          </button>
        </div>

        {/* Content Area */}
        <div className="p-8 min-h-125">
          {activeTab === "settings" && (
            <SettingsTab
              survey={survey}
              onUpdateMetadata={updateMetadata}
              onAddCategory={addCategory}
              onUpdateCategory={updateCategory}
              onRemoveCategory={onRemoveCategory}
              onAddKeyChoice={addKeyChoice}
              onUpdateKeyChoice={updateKeyChoice}
              onRemoveKeyChoice={removeKeyChoice}
            />
          )}
          {activeTab === "questions" && (
            <QuestionsTab
              survey={survey}
              onAddQuestion={addQuestion}
              onUpdateQuestion={updateQuestion}
              onDeleteQuestion={deleteQuestion}
            />
          )}
          {activeTab === "logic" && (
            <SkipLogicTab
              survey={survey}
              onAddSkipLogic={addSkipLogic}
              onUpdateSkipLogic={updateSkipLogic}
              onRemoveSkipLogic={removeSkipLogic}
            />
          )}
          {activeTab === "json" && <JsonTab survey={survey} />}
        </div>
      </div>
    </div>
  );
}
