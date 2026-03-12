import { useRef, useState } from "react";
import {
  Save,
  Settings,
  List,
  FileJson,
  Loader,
  Download,
  Eye,
} from "lucide-react";
import {
  JsonTab,
  // JsonTab,
  MetaProvider,
  QuestionsTab,
  RequiredProvider,
  SettingsTab,
  SkipLogicTab,
  SurveyImportButton,
  SurveySkeleton,
  useAuth,
  useSurveyContext,
} from ".";
import { HeaderActionButton } from "./components/subs/HeaderActionButton ";

type TabType = "settings" | "questions" | "logic" | "json";
// type TabType = "settings" | "questions" | "logic";

export default function SurveyBuilder() {
  const { can } = useAuth();

  const {
    survey,
    handleSave,
    exportSurveyToJSON,
    surveyId,
    isSaving,
    isLoading,
  } = useSurveyContext();
  const [activeTab, setActiveTab] = useState<TabType>("settings");
  const formRef = useRef<HTMLFormElement>(null);

  const handleCustomSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formRef.current) return;

    const controls = formRef.current.querySelectorAll<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >("input, textarea, select");

    // 1. Find all invalid fields (even hidden ones)
    const allInvalidFields = Array.from(controls).filter(
      (el) => !el.checkValidity(),
    );

    if (allInvalidFields.length > 0) {
      const firstInvalid = allInvalidFields[0];

      // 2. SMART TAB SWITCHING:
      // If the invalid element is hidden, find which tab container it belongs to and switch to it
      const parentTab = firstInvalid.closest("[data-tab-name]");
      const tabName = parentTab?.getAttribute("data-tab-name") as TabType;

      if (tabName && tabName !== activeTab) {
        setActiveTab(tabName);
      }

      // 3. Focus and Alert (Delay slightly if tab switched so the DOM is visible)
      setTimeout(() => {
        firstInvalid.reportValidity();
        firstInvalid.focus();
      }, 50);
      return;
    }

    handleSave();
  };

  // In your SurveyBuilder component, replace the loading condition:
  if (isLoading) {
    return <SurveySkeleton />;
  }
  if (isLoading) return <div>Loading permissions...</div>;
  const canEdit = can("eeusurvey_app.change_survey") && !survey.has_responses;

  return (
    <div className="min-h-screen bg-gray-50 p-8 font-sans">
      <div className="max-w-5xl mx-auto bg-white shadow-lg rounded-xl">
        {/* Header */}
        <form ref={formRef} onSubmit={handleCustomSave} noValidate>
          <div className="bg-blue-600 p-6 text-white flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold">
                {survey.metadata.title || "Untitled Survey"}
              </h1>
              <p className="text-blue-100 text-sm">Builder v1.0</p>
            </div>
            <div className="flex gap-3">
              {/* 3. Render Preview Button if surveyId exists */}
              {surveyId && (
                <HeaderActionButton
                  type="button"
                  onClick={() =>
                    window.open(`/admin/survey-preview/${surveyId}`, "_blank")
                  }
                  disabled={isSaving || isLoading}
                  icon={<Eye size={18} />}
                  label="Preview"
                />
              )}
              <SurveyImportButton disabled={isSaving || isLoading} />

              <HeaderActionButton
                type="button"
                onClick={exportSurveyToJSON}
                disabled={isSaving || isLoading || !canEdit}
                icon={<Download size={18} />}
                label="Export"
              />

              <HeaderActionButton
                type="submit"
                // onClick={handleCustomSave}
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
              type="button"
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
              type="button"
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
              type="button"
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
              type="button"
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
                  <RequiredProvider>
                    {/* Wrap each tab in a div with 'data-tab-name'. 
                   This allows our logic to know WHERE an error is.
                */}
                    <div
                      data-tab-name="settings"
                      className={activeTab === "settings" ? "" : "hidden"}
                    >
                      <SettingsTab />
                    </div>
                    <div
                      data-tab-name="questions"
                      className={activeTab === "questions" ? "" : "hidden"}
                    >
                      <QuestionsTab />
                    </div>
                    <div
                      data-tab-name="logic"
                      className={activeTab === "logic" ? "" : "hidden"}
                    >
                      <SkipLogicTab />
                    </div>
                    <div
                      data-tab-name="json"
                      className={activeTab === "json" ? "" : "hidden"}
                    >
                      <JsonTab />
                    </div>
                  </RequiredProvider>
                </>
              )}
            </div>
          </MetaProvider>
        </form>
      </div>
    </div>
  );
}
