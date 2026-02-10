import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import type {
  SurveyExport,
  SurveyQuestion,
  SkipLogicRule,
  KeyChoice,
} from "..";
import {
  createEmptyQuestion,
  getCSRFToken,
  initialSurveyState,
  MAX_FILE_SIZE_BYTES,
  MAX_FILE_SIZE_MB,
} from "..";

const sanitizeSurvey = (survey: SurveyExport): SurveyExport => {
  // let optionSequence = 1; // 🔥 shared counter for options + suboptions

  return {
    ...survey,

    id: undefined,

    metadata: {
      ...survey.metadata,
      is_active: survey.metadata.is_active ?? false,
      created: new Date().toISOString(),
      version: survey.metadata?.version ?? "1.0",
    },
    skip_logic: survey.skip_logic ?? [],
    question_categories: survey.question_categories ?? [],
    questions: survey.questions.map((q, qIndex) => ({
      ...q,
      sequence_num: ++qIndex,
      constraints: { ...q.constraints, hidden: q.constraints.hidden || false },
      options: Array.isArray(q.options)
        ? q.options.map((opt, opIndex) => {
            const currentOptSequence = ++opIndex;

            return {
              ...opt,
              sequence: currentOptSequence,

              sub_options: Array.isArray(opt.sub_options)
                ? opt.sub_options.map((sub, subIndex) => {
                    const currentSubSequence = ++subIndex;

                    return {
                      ...sub,
                      sequence: currentSubSequence,
                    };
                  })
                : [],
            };
          })
        : [],
    })),
    key_choice: survey.key_choice ?? [],
  };
};

export const useSurvey = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const surveyId = searchParams.get("surveyId");
  const [survey, setSurvey] = useState<SurveyExport>(initialSurveyState);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!surveyId) return; // It's a new survey, do nothing

    const fetchSurvey = async () => {
      setIsLoading(true);
      try {
        const token = localStorage.getItem("access_token");
        const response = await fetch(`/api/surveys/${surveyId}/`, {
          credentials: "include",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
            "X-CSRFToken": getCSRFToken()!,
          },
        });

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

  /* ----------------------------------
     Import survey from JSON (file)
  ---------------------------------- */

  const importSurveyFromJSON = (file: File) => {
    return new Promise<void>((resolve, reject) => {
      /* ---------- File validation ---------- */

      if (!file) {
        return reject(new Error("No file selected"));
      }

      if (file.size > MAX_FILE_SIZE_BYTES) {
        return reject(
          new Error(`File size exceeds ${MAX_FILE_SIZE_MB}MB limit`),
        );
      }

      if (
        file.type !== "application/json" &&
        !file.name.toLowerCase().endsWith(".json")
      ) {
        return reject(new Error("Only JSON files are allowed"));
      }

      const reader = new FileReader();

      reader.onerror = () => {
        reject(new Error("Failed to read file"));
      };

      reader.onload = () => {
        try {
          const raw = reader.result as string;
          const parsed = JSON.parse(raw);

          /* ---------- Structural validation ---------- */

          if (
            typeof parsed !== "object" ||
            !parsed.metadata ||
            !Array.isArray(parsed.questions)
          ) {
            throw new Error("Invalid survey format");
          }

          /* ---------- Normalize survey ---------- */

          const normalizedSurvey = sanitizeSurvey(parsed);

          setSurvey(normalizedSurvey);
          setSearchParams({});
          resolve();
        } catch (err) {
          reject(
            err instanceof Error ? err : new Error("Invalid JSON content"),
          );
        }
      };

      reader.readAsText(file);
    });
  };

  /* ----------------------------------
     Export survey to JSON (download)
  ---------------------------------- */
  const exportSurveyToJSON = () => {
    try {
      // Generate safe filename
      const getSafeFilename = () => {
        const title = (survey.metadata.title || "untitled-survey")
          .toLowerCase()
          .replace(/[^a-z0-9]/g, "-")
          .replace(/-+/g, "-")
          .replace(/^-|-$/g, "")
          .slice(0, 50); // Limit length

        const now = new Date();
        const dateStr = now.toISOString().split("T")[0]; // YYYY-MM-DD
        const timeStr = now.toTimeString().split(" ")[0].replace(/:/g, "-"); // HH-MM-SS

        return `survey-${title}-${dateStr}-${timeStr}.json`;
      };

      const filename = getSafeFilename();
      const json = JSON.stringify(survey, null, 2);

      const blob = new Blob([json], { type: "application/json" });
      const url = URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      URL.revokeObjectURL(url);

      toast.success(`Survey exported! Saved as: ${filename}`);
    } catch (error) {
      console.error("Export failed:", error);
      toast.error("Failed to export survey. Please try again.");
    }
  };

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

    const isEdit = Boolean(surveyId);
    const url = isEdit ? `/api/surveys/${surveyId}/` : "/api/surveys/";

    const method = isEdit ? "PUT" : "POST";

    try {
      const response = await fetch(url, {
        method,
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "X-CSRFToken": getCSRFToken()!,
        },
        body: JSON.stringify(survey),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || "Failed to save survey.");
      }

      const savedSurvey = await response.json();

      // 🔁 RESYNC: backend is source of truth
      setSurvey(savedSurvey);

      // 🆕 If it was a create, sync the ID (route or state)
      if (!isEdit && savedSurvey.id) {
        // If you use react-router
        // navigate(`/surveys/${savedSurvey.id}`);
        setSearchParams({ surveyId: savedSurvey.id });
      }

      toast.success(
        isEdit
          ? "Survey updated and synced successfully!"
          : "Survey created and synced successfully!",
      );
    } catch (error: any) {
      console.error("Save Error:", error);
      toast.error(error.message || "Failed to save survey.");
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
    importSurveyFromJSON,
    exportSurveyToJSON,
    isSaving,
    isLoading,
  };
};
