import { useEffect, useState } from "react";
import { toast } from "sonner";
import type {
  SurveyExport,
  SurveyQuestion,
  SkipLogicRule,
  KeyChoice,
} from "..";
import { createEmptyQuestion, initialSurveyState } from "..";

export const useSurvey = (surveyId?: string) => {
  const [survey, setSurvey] = useState<SurveyExport>(initialSurveyState);
  const [isLoading, setIsLoading] = useState(false);
  useEffect(() => {
    if (!surveyId) return; // It's a new survey, do nothing

    const fetchSurvey = async () => {
      setIsLoading(true);
      try {
        const token = localStorage.getItem("access_token");
        const response = await fetch(
          `http://127.0.0.1:8000/api/surveys/${surveyId}/`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          },
        );

        if (!response.ok) throw new Error("Failed to load survey");

        const data = await response.json();
        // Update state with fetched data
        setSurvey(data);
      } catch (err) {
        console.error(err);
        toast.error("Could not load survey data. refresh again.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchSurvey();
  }, [surveyId]);

  const [isSaving, setIsSaving] = useState(false);
  const updateMetadata = (
    field: keyof SurveyExport["metadata"],
    value: string | boolean,
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
    setIsSaving(true);
    // const token = localStorage.getItem("access_token");

    // Determine URL and Method based on whether we are editing
    const url = surveyId
      ? `http://127.0.0.1:8000/api/surveys/${surveyId}/`
      : "http://127.0.0.1:8000/api/surveys/";

    const method = surveyId ? "PUT" : "POST";

    try {
      const response = await fetch(url, {
        method: method,
        headers: {
          "Content-Type": "application/json",
          // Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(survey),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || "Failed to save survey.");
      }

      const result = await response.json();
      console.log("Backend Response:", result);
      toast.success(
        surveyId
          ? "Survey updated successfully!"
          : "Survey created successfully!",
      );
    } catch (error: any) {
      console.error("Save Error:", error);
      toast.error(`Error: ${error.message}`);
    } finally {
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
    isLoading,
  };
};
