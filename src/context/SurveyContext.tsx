// contexts/SurveyContext.tsx
import React, { createContext, useContext, useMemo } from "react";
import { useSurvey } from "..";

type SurveyState = ReturnType<typeof useSurvey>;

/* ---------- Data slice (read-only state) ---------- */
interface SurveyDataSlice {
  survey: SurveyState["survey"];
  setSurvey: SurveyState["setSurvey"];
  isLoading: SurveyState["isLoading"];
  isSaving: SurveyState["isSaving"];
  isDirty: SurveyState["isDirty"];
  surveyId: SurveyState["surveyId"];
}

/* ---------- Actions slice (handlers) ---------- */
interface SurveyActionsSlice {
  updateMetadata: SurveyState["updateMetadata"];
  addCategory: SurveyState["addCategory"];
  updateCategory: SurveyState["updateCategory"];
  removeCategory: SurveyState["removeCategory"];
  addKeyChoice: SurveyState["addKeyChoice"];
  updateKeyChoice: SurveyState["updateKeyChoice"];
  removeKeyChoice: SurveyState["removeKeyChoice"];
  addQuestion: SurveyState["addQuestion"];
  updateQuestion: SurveyState["updateQuestion"];
  deleteQuestion: SurveyState["deleteQuestion"];
  duplicateQuestion: SurveyState["duplicateQuestion"];
  reorderQuestions: SurveyState["reorderQuestions"];
  addSkipLogic: SurveyState["addSkipLogic"];
  updateSkipLogic: SurveyState["updateSkipLogic"];
  removeSkipLogic: SurveyState["removeSkipLogic"];
  handleSave: SurveyState["handleSave"];
  importSurveyFromJSON: SurveyState["importSurveyFromJSON"];
  exportSurveyToJSON: SurveyState["exportSurveyToJSON"];
}

/* ---------- i18n slice ---------- */
interface SurveyI18nSlice {
  editingLanguage: SurveyState["editingLanguage"];
  setEditingLanguage: SurveyState["setEditingLanguage"];
  getI18nValue: SurveyState["getI18nValue"];
  setI18nValue: SurveyState["setI18nValue"];
  getTranslationCompleteness: SurveyState["getTranslationCompleteness"];
}

const SurveyDataContext = createContext<SurveyDataSlice | null>(null);
const SurveyActionsContext = createContext<SurveyActionsSlice | null>(null);
const SurveyI18nContext = createContext<SurveyI18nSlice | null>(null);

export const SurveyProvider: React.FC<{
  surveyId?: string;
  children: React.ReactNode;
}> = ({ children }) => {
  const state = useSurvey();

  const dataSlice = useMemo<SurveyDataSlice>(
    () => ({
      survey: state.survey,
      setSurvey: state.setSurvey,
      isLoading: state.isLoading,
      isSaving: state.isSaving,
      isDirty: state.isDirty,
      surveyId: state.surveyId,
    }),
    [state.survey, state.isLoading, state.isSaving, state.isDirty, state.surveyId, state.setSurvey],
  );

  const actionsSlice = useMemo<SurveyActionsSlice>(
    () => ({
      updateMetadata: state.updateMetadata,
      addCategory: state.addCategory,
      updateCategory: state.updateCategory,
      removeCategory: state.removeCategory,
      addKeyChoice: state.addKeyChoice,
      updateKeyChoice: state.updateKeyChoice,
      removeKeyChoice: state.removeKeyChoice,
      addQuestion: state.addQuestion,
      updateQuestion: state.updateQuestion,
      deleteQuestion: state.deleteQuestion,
      duplicateQuestion: state.duplicateQuestion,
      reorderQuestions: state.reorderQuestions,
      addSkipLogic: state.addSkipLogic,
      updateSkipLogic: state.updateSkipLogic,
      removeSkipLogic: state.removeSkipLogic,
      handleSave: state.handleSave,
      importSurveyFromJSON: state.importSurveyFromJSON,
      exportSurveyToJSON: state.exportSurveyToJSON,
    }),
    [
      state.updateMetadata,
      state.addCategory,
      state.updateCategory,
      state.removeCategory,
      state.addKeyChoice,
      state.updateKeyChoice,
      state.removeKeyChoice,
      state.addQuestion,
      state.updateQuestion,
      state.deleteQuestion,
      state.duplicateQuestion,
      state.reorderQuestions,
      state.addSkipLogic,
      state.updateSkipLogic,
      state.removeSkipLogic,
      state.handleSave,
      state.importSurveyFromJSON,
      state.exportSurveyToJSON,
    ],
  );

  const i18nSlice = useMemo<SurveyI18nSlice>(
    () => ({
      editingLanguage: state.editingLanguage,
      setEditingLanguage: state.setEditingLanguage,
      getI18nValue: state.getI18nValue,
      setI18nValue: state.setI18nValue,
      getTranslationCompleteness: state.getTranslationCompleteness,
    }),
    [
      state.editingLanguage,
      state.setEditingLanguage,
      state.getI18nValue,
      state.setI18nValue,
      state.getTranslationCompleteness,
    ],
  );

  return (
    <SurveyDataContext.Provider value={dataSlice}>
      <SurveyActionsContext.Provider value={actionsSlice}>
        <SurveyI18nContext.Provider value={i18nSlice}>
          {children}
        </SurveyI18nContext.Provider>
      </SurveyActionsContext.Provider>
    </SurveyDataContext.Provider>
  );
};

/* ---------- Individual slice hooks ---------- */
export const useSurveyDataContext = () => {
  const ctx = useContext(SurveyDataContext);
  if (!ctx) throw new Error("useSurveyDataContext must be used inside SurveyProvider");
  return ctx;
};

export const useSurveyActionsContext = () => {
  const ctx = useContext(SurveyActionsContext);
  if (!ctx) throw new Error("useSurveyActionsContext must be used inside SurveyProvider");
  return ctx;
};

export const useSurveyI18nContext = () => {
  const ctx = useContext(SurveyI18nContext);
  if (!ctx) throw new Error("useSurveyI18nContext must be used inside SurveyProvider");
  return ctx;
};

/* ---------- Combined hook (backward-compatible) ---------- */
export const useSurveyContext = (): SurveyState => {
  const data = useSurveyDataContext();
  const actions = useSurveyActionsContext();
  const i18n = useSurveyI18nContext();
  return useMemo(
    () => ({ ...data, ...actions, ...i18n }),
    [data, actions, i18n],
  );
};
