import { useState } from "react";
import type {
  SurveyExport,
  SurveyQuestion,
  SkipLogicRule,
  KeyChoice,
} from "../types";
import { initialSurveyState, createEmptyQuestion } from "../constants";

export const useSurvey = () => {
  const [survey, setSurvey] = useState<SurveyExport>(initialSurveyState);
  const [isSaving, setIsSaving] = useState(false);
  const updateMetadata = (
    field: keyof SurveyExport["metadata"],
    value: string|boolean,
  ) => {
    setSurvey((prev) => ({
      ...prev,
      metadata: { ...prev.metadata, [field]: value },
    }));
  };

  const addCategory = () => {
    const nextNum = (survey.question_categories?.length || 0) + 1;
    setSurvey((prev) => ({
      ...prev,
      question_categories: [
        ...(prev.question_categories || []),
        { cat_number: nextNum, name: "New Category" },
      ],
    }));
  };

  const updateCategory = (index: number, name: string) => {
    const newCats = [...(survey.question_categories || [])];
    newCats[index].name = name;
    setSurvey({ ...survey, question_categories: newCats });
  };

  const removeCategory = (index: number) => {
    setSurvey((prev) => {
      const categories = prev.question_categories ?? [];

      // Safety: do not remove last category
      if (categories.length <= 1) {
        return prev;
      }

      const removedCategory = categories[index];
      const removedCatNumber = removedCategory.cat_number;

      const updatedCategories = categories
        .filter((_, i) => i !== index)
        .map((cat, i) => ({
          ...cat,
          cat_number: i + 1,
        }));

      // 2️⃣ Update questions that referenced categories
      const updatedQuestions = prev.questions.map((q) => {
        // If question used removed category → move to first category
        if (q.category === removedCatNumber) {
          return {
            ...q,
            category: 1,
          };
        }

        // If category numbers shifted downward
        if (q.category > removedCatNumber) {
          return {
            ...q,
            category: q.category - 1,
          };
        }

        return q;
      });

      return {
        ...prev,
        question_categories: updatedCategories,
        questions: updatedQuestions,
      };
    });
  };

  // --- Key Choice Handlers ---

  const addKeyChoice = () => {
    setSurvey((prev) => ({
      ...prev,
      key_choice: [...prev.key_choice, { key: "", description: "" }],
    }));
  };

  const updateKeyChoice = (
    index: number,
    field: keyof KeyChoice,
    value: string,
  ) => {
    const newChoices = [...survey.key_choice];
    newChoices[index] = { ...newChoices[index], [field]: value };
    setSurvey({ ...survey, key_choice: newChoices });
  };

  const removeKeyChoice = (index: number) => {
    setSurvey((prev) => ({
      ...prev,
      key_choice: prev.key_choice.filter((_, i) => i !== index),
    }));
  };

  const addQuestion = () => {
    const defaultCat = survey.question_categories?.[0]?.cat_number || 1;
    setSurvey((prev) => ({
      ...prev,
      questions: [
        ...prev.questions,
        createEmptyQuestion(prev.questions.length + 1, defaultCat),
      ],
    }));
  };

  const updateQuestion = (index: number, updates: Partial<SurveyQuestion>) => {
    const newQuestions = [...survey.questions];
    newQuestions[index] = { ...newQuestions[index], ...updates };
    setSurvey({ ...survey, questions: newQuestions });
  };

  const deleteQuestion = (index: number) => {
    const newQuestions = survey.questions.filter((_, i) => i !== index);
    const resequenced = newQuestions.map((q, i) => ({
      ...q,
      sequence_num: i + 1,
    }));
    setSurvey({ ...survey, questions: resequenced });
  };

  const addSkipLogic = () => {
    const newRule: SkipLogicRule = {
      trigger_question_sn: 0,
      operator: "EQUALS",
      trigger_options_sn: [],
      action: "SHOW",
      target_questions_sn: [],
    };
    setSurvey((prev) => ({
      ...prev,
      skip_logic: [...(prev.skip_logic || []), newRule],
    }));
  };

  const updateSkipLogic = (index: number, updates: Partial<SkipLogicRule>) => {
    const newLogic = [...(survey.skip_logic || [])];
    newLogic[index] = { ...newLogic[index], ...updates };
    setSurvey({ ...survey, skip_logic: newLogic });
  };

  const removeSkipLogic = (index: number) => {
    const newLogic = (survey.skip_logic || []).filter((_, i) => i !== index);
    setSurvey({ ...survey, skip_logic: newLogic });
  };

  const handleSave = async () => {
    // 1. Start loading state
    setIsSaving(true);

    try {
      const response = await fetch("http://127.0.0.1:8000/api/surveys/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          // If your backend requires CSRF or Auth tokens, add them here:
          // "X-CSRFToken": getCookie('csrftoken'),
        },
        body: JSON.stringify(survey),
      });

      // 2. Check if the backend returned an error (e.g., 400 or 500)
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.detail ||
            errorData.message ||
            "Failed to save survey to backend.",
        );
      }

      // 3. Handle success
      const result = await response.json();
      console.log("Backend Response:", result);
      alert("Survey created successfully!");
    } catch (error: any) {
      // 4. Handle network errors or thrown errors
      console.error("Save Error:", error);
      alert(`Error: ${error.message}`);
    } finally {
      // 5. Reset loading state
      setIsSaving(false);
    }
  };

  return {
    survey,
    updateMetadata,
    addCategory,
    updateCategory,
    removeCategory,
    addKeyChoice,
    updateKeyChoice,
    removeKeyChoice,
    addQuestion,
    updateQuestion,
    deleteQuestion,
    addSkipLogic,
    updateSkipLogic,
    removeSkipLogic,
    handleSave,
    isSaving,
  };
};
