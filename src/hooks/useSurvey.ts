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
  normalizeRule,
  sanitizeSurvey,
} from "..";

export const useSurvey = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const surveyId = searchParams.get("surveyId");
  const [survey, setSurvey] = useState<SurveyExport>(initialSurveyState);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editingLanguage, setEditingLanguage] = useState<string>("en");
  const isEdit = Boolean(surveyId);

  useEffect(() => {
    if (!surveyId) return;

    const controller = new AbortController();

    const fetchSurvey = async () => {
      setIsLoading(true);
      try {
        const token = localStorage.getItem("access_token");
        const csrfToken = getCSRFToken() || "";
        const response = await fetch(
          `${import.meta.env.VITE_SURVEY_API + surveyId}/`,
          {
            credentials: "include",
            signal: controller.signal,
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
              "X-CSRFToken": csrfToken,
            },
          },
        );

        if (!response.ok) throw new Error("Failed to load survey");

        const data = await response.json();
        setSurvey(sanitizeSurvey(data));
      } catch (err: any) {
        if (err.name !== "AbortError") {
          console.error(err);
          toast.error("Could not load survey data. refresh again.");
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchSurvey();
    return () => controller.abort();
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
          normalizedSurvey.has_responses = false;
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
        // const title = (survey.metadata.title || "untitled-survey")
        //   .toLowerCase()
        //   .replace(/[^a-z0-9]/g, "-")
        //   .replace(/-+/g, "-")
        //   .replace(/^-|-$/g, "")
        //   .slice(0, 50); // Limit length

        const now = new Date();
        const dateStr = now.toISOString().split("T")[0]; // YYYY-MM-DD
        const timeStr = now.toTimeString().split(" ")[0].replace(/:/g, "-"); // HH-MM-SS
        return `survey-${survey.metadata.version}-${dateStr}-${timeStr}.json`;
      };

      // Replacer function to exclude specific values
      const replacer = (
        key: string,
        value: string | number | boolean | any[] | null,
      ) => {
        // Exclude null values
        // if (value === null) return undefined;

        // Exclude empty strings
        // if (value === "") return undefined;

        // Exclude specific fields by name
        if (key === "has_responses") {
          return undefined;
        }

        // Exclude empty arrays
        // if (Array.isArray(value) && value.length === 0) return undefined;

        // Exclude empty objects
        // if (
        //   typeof value === "object" &&
        //   value !== null &&
        //   Object.keys(value).length === 0
        // ) {
        //   return undefined;
        // }

        // Exclude false boolean values (optional)
        // if (value === false) return undefined;

        // // Exclude specific values (e.g., -1 for default)
        // if (value === -1) return undefined;

        return value;
      };

      const filename = getSafeFilename();
      const json = JSON.stringify(survey, replacer, 2);

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
    setSurvey((prev) => {
      const newCats = [...(prev.question_categories || [])];
      newCats[index] = { ...newCats[index], name };
      return { ...prev, question_categories: newCats };
    });
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
    setSurvey((prev) => {
      const newChoices = [...prev.key_choice];
      newChoices[index] = { ...newChoices[index], [field]: value };
      return { ...prev, key_choice: newChoices };
    });
  };

  const removeKeyChoice = (index: number) => {
    setSurvey((prev) => ({
      ...prev,
      key_choice: prev.key_choice.filter((_, i) => i !== index),
    }));
  };

  const addQuestion = () => {
    const prevQ = survey.questions[survey.questions.length - 1];
    const defaultCat = survey.question_categories?.[0]?.cat_number || 1;
    setSurvey((prev) => ({
      ...prev,
      questions: [
        ...prev.questions,
        createEmptyQuestion(prev.questions.length + 1, defaultCat,prevQ),
      ],
    }));
  };

  const updateQuestion = (index: number, updates: Partial<SurveyQuestion>) => {
    setSurvey((prev) => {
      const newQuestions = [...prev.questions];
      newQuestions[index] = { ...newQuestions[index], ...updates };
      return { ...prev, questions: newQuestions };
    });
  };

  const deleteQuestion = (index: number) => {
    setSurvey((prev) => {
      const newQuestions = prev.questions.filter((_, i) => i !== index);
      const resequenced = newQuestions.map((q, i) => ({
        ...q,
        sequence_num: i + 1,
      }));
      return { ...prev, questions: resequenced };
    });
  };

  const duplicateQuestion = (index: number) => {
    setSurvey((prev) => {
      const original = prev.questions[index];
      const duplicate: SurveyQuestion = {
        ...JSON.parse(JSON.stringify(original)),
        sequence_num: 0,
        question: `${original.question} (copy)`,
      };
      const newQuestions = [...prev.questions];
      newQuestions.splice(index + 1, 0, duplicate);
      return {
        ...prev,
        questions: newQuestions.map((q, i) => ({ ...q, sequence_num: i + 1 })),
      };
    });
  };

  const reorderQuestions = (fromIndex: number, toIndex: number) => {
    setSurvey((prev) => {
      const newQuestions = [...prev.questions];
      const [moved] = newQuestions.splice(fromIndex, 1);
      newQuestions.splice(toIndex, 0, moved);
      return {
        ...prev,
        questions: newQuestions.map((q, i) => ({ ...q, sequence_num: i + 1 })),
      };
    });
  };

  const addSkipLogic = () => {
    setSurvey((prev) => ({
      ...prev,
      skip_logic: [
        ...(prev.skip_logic ?? []),
        normalizeRule({}), // let normalizer build defaults
      ],
    }));
  };

  const updateSkipLogic = (ruleId: string, updates: Partial<SkipLogicRule>) => {
    setSurvey((prev) => {
      if (!prev.skip_logic) return prev;

      const updatedLogic = prev.skip_logic.map((rule) => {
        if (rule.id !== ruleId) return rule;

        const merged = { ...rule, ...updates };

        // 🔥 Normalization layer
        return normalizeRule(merged);
      });

      return {
        ...prev,
        skip_logic: updatedLogic,
      };
    });
  };

  const removeSkipLogic = (ruleId: string) => {
    setSurvey((prev) => ({
      ...prev,
      skip_logic: prev.skip_logic?.filter((rule) => rule.id !== ruleId),
    }));
  };

  // --- i18n helpers ---

  const getI18nValue = (
    i18nMap: Record<string, string> | undefined,
    fallback: string,
  ): string => {
    if (!i18nMap) return fallback;
    return i18nMap[editingLanguage] ?? fallback;
  };

  const setI18nValue = (
    i18nMap: Record<string, string> | undefined,
    value: string,
  ): Record<string, string> => {
    const map = { ...(i18nMap || {}) };
    map[editingLanguage] = value;
    return map;
  };

  const getTranslationCompleteness = (lang: string): { total: number; translated: number } => {
    let total = 0;
    let translated = 0;

    const check = (map: Record<string, string> | undefined) => {
      total++;
      if (map?.[lang]) translated++;
    };

    check(survey.metadata.title_i18n);
    check(survey.metadata.description_i18n);
    check(survey.metadata.instructions_i18n);

    survey.question_categories?.forEach((cat) => {
      check(cat.name_i18n);
      check(cat.description_i18n);
    });

    survey.questions.forEach((q) => {
      check(q.question_i18n);
      check(q.placeholder_i18n);
      q.options.forEach((opt) => {
        check(opt.label_i18n);
        check(opt.text_i18n);
      });
    });

    survey.key_choice.forEach((kc) => {
      check(kc.description_i18n);
    });

    return { total, translated };
  };

  const handleSave = async () => {
    if (survey.metadata.is_multilingual && survey.metadata.available_languages) {
      const baseLang = survey.metadata.language || "en";
      const incompleteLangs = survey.metadata.available_languages.filter(
        (lang) => lang !== baseLang,
      ).filter((lang) => {
        const { total, translated } = getTranslationCompleteness(lang);
        return total > 0 && translated < total * 0.5;
      });

      if (incompleteLangs.length > 0) {
        const confirmed = window.confirm(
          `The following languages have less than 50% translations: ${incompleteLangs.join(", ")}. Save anyway?`,
        );
        if (!confirmed) return;
      }
    }

    setIsSaving(true);

    const url = isEdit
      ? `${import.meta.env.VITE_SURVEY_API + surveyId}/`
      : import.meta.env.VITE_SURVEY_API;

    const method = isEdit ? "PUT" : "POST";

    try {
      const response = await fetch(url, {
        method,
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "X-CSRFToken": getCSRFToken() || "",
        },
        body: JSON.stringify(survey),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.details || "Failed to save survey.");
      }

      const savedSurvey = await response.json();

      // 🔁 RESYNC: backend is source of truth
      setSurvey(sanitizeSurvey(savedSurvey));

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
    setSurvey,
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
    duplicateQuestion,
    reorderQuestions,
    addSkipLogic,
    updateSkipLogic,
    removeSkipLogic,
    handleSave,
    importSurveyFromJSON,
    exportSurveyToJSON,
    surveyId,
    isSaving,
    isLoading,
    editingLanguage,
    setEditingLanguage,
    getI18nValue,
    setI18nValue,
    getTranslationCompleteness,
  };
};
