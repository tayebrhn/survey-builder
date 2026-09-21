import { useCallback, useEffect, useMemo, useRef, useState } from "react";
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
  const isSavingRef = useRef(false);
  const saveAbortRef = useRef<AbortController | null>(null);

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

  const importSurveyFromJSON = useCallback(
    (file: File) => {
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
    },
    [setSearchParams],
  );

  /* ----------------------------------
     Export survey to JSON (download)
  ---------------------------------- */
  const exportSurveyToJSON = useCallback(() => {
    try {
      // Generate safe filename
      const getSafeFilename = () => {
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
        if (key === "has_responses") {
          return undefined;
        }

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
  }, [survey]);

  const updateMetadata = useCallback(
    (field: keyof SurveyExport["metadata"], value: string | boolean) => {
      setSurvey((prev) => ({
        ...prev,
        metadata: { ...prev.metadata, [field]: value },
      }));
    },
    [],
  );

  const addCategory = useCallback(() => {
    setSurvey((prev) => {
      const nextNum = (prev.question_categories?.length || 0) + 1;
      return {
        ...prev,
        question_categories: [
          ...(prev.question_categories || []),
          { cat_number: nextNum, name: "New Category" },
        ],
      };
    });
  }, []);

  const updateCategory = useCallback((index: number, name: string) => {
    setSurvey((prev) => {
      const newCats = [...(prev.question_categories || [])];
      newCats[index] = { ...newCats[index], name };
      return { ...prev, question_categories: newCats };
    });
  }, []);

  const removeCategory = useCallback((index: number) => {
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
  }, []);

  // --- Key Choice Handlers ---

  const addKeyChoice = useCallback(() => {
    setSurvey((prev) => ({
      ...prev,
      key_choice: [...prev.key_choice, { key: "", description: "" }],
    }));
  }, []);

  const updateKeyChoice = useCallback(
    (index: number, field: keyof KeyChoice, value: string) => {
      setSurvey((prev) => {
        const newChoices = [...prev.key_choice];
        newChoices[index] = { ...newChoices[index], [field]: value };
        return { ...prev, key_choice: newChoices };
      });
    },
    [],
  );

  const removeKeyChoice = useCallback((index: number) => {
    setSurvey((prev) => ({
      ...prev,
      key_choice: prev.key_choice.filter((_, i) => i !== index),
    }));
  }, []);

  const addQuestion = useCallback(() => {
    setSurvey((prev) => {
      const prevQ = prev.questions[prev.questions.length - 1];
      const defaultCat = prev.question_categories?.[0]?.cat_number || 1;
      return {
        ...prev,
        questions: [
          ...prev.questions,
          createEmptyQuestion(prev.questions.length + 1, defaultCat, prevQ),
        ],
      };
    });
  }, []);

  const updateQuestion = useCallback(
    (index: number, updates: Partial<SurveyQuestion>) => {
      setSurvey((prev) => {
        const newQuestions = [...prev.questions];
        newQuestions[index] = { ...newQuestions[index], ...updates };
        return { ...prev, questions: newQuestions };
      });
    },
    [],
  );

  const deleteQuestion = useCallback((index: number) => {
    setSurvey((prev) => {
      const newQuestions = prev.questions.filter((_, i) => i !== index);
      const resequenced = newQuestions.map((q, i) => ({
        ...q,
        sequence_num: i + 1,
      }));
      return { ...prev, questions: resequenced };
    });
  }, []);

  const duplicateQuestion = useCallback((index: number) => {
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
  }, []);

  const reorderQuestions = useCallback((fromIndex: number, toIndex: number) => {
    setSurvey((prev) => {
      const newQuestions = [...prev.questions];
      const [moved] = newQuestions.splice(fromIndex, 1);
      newQuestions.splice(toIndex, 0, moved);
      return {
        ...prev,
        questions: newQuestions.map((q, i) => ({ ...q, sequence_num: i + 1 })),
      };
    });
  }, []);

  const addSkipLogic = useCallback(() => {
    setSurvey((prev) => ({
      ...prev,
      skip_logic: [
        ...(prev.skip_logic ?? []),
        normalizeRule({}), // let normalizer build defaults
      ],
    }));
  }, []);

  const updateSkipLogic = useCallback(
    (ruleId: string, updates: Partial<SkipLogicRule>) => {
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
    },
    [],
  );

  const removeSkipLogic = useCallback((ruleId: string) => {
    setSurvey((prev) => ({
      ...prev,
      skip_logic: prev.skip_logic?.filter((rule) => rule.id !== ruleId),
    }));
  }, []);

  // --- i18n helpers ---

  const getI18nValue = useCallback(
    (
      i18nMap: Record<string, string> | undefined,
      fallback: string,
    ): string => {
      if (!i18nMap) return fallback;
      return i18nMap[editingLanguage] ?? fallback;
    },
    [editingLanguage],
  );

  const setI18nValue = useCallback(
    (
      i18nMap: Record<string, string> | undefined,
      value: string,
    ): Record<string, string> => {
      const map = { ...(i18nMap || {}) };
      map[editingLanguage] = value;
      return map;
    },
    [editingLanguage],
  );

  const getTranslationCompleteness = useCallback(
    (lang: string): { total: number; translated: number } => {
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
    },
    [survey],
  );

  const handleSave = useCallback(async () => {
    if (isSavingRef.current) return;

    if (survey.metadata.is_multilingual && survey.metadata.available_languages) {
      const baseLang = survey.metadata.language || "en";
      const incompleteLangs = survey.metadata.available_languages
        .filter((lang) => lang !== baseLang)
        .filter((lang) => {
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

    // Cancel any in-flight save
    if (saveAbortRef.current) saveAbortRef.current.abort();
    const controller = new AbortController();
    saveAbortRef.current = controller;

    isSavingRef.current = true;
    setIsSaving(true);

    const url = isEdit
      ? `${import.meta.env.VITE_SURVEY_API + surveyId}/`
      : import.meta.env.VITE_SURVEY_API;

    const method = isEdit ? "PUT" : "POST";

    try {
      const response = await fetch(url, {
        method,
        credentials: "include",
        signal: controller.signal,
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
        setSearchParams({ surveyId: savedSurvey.id });
      }

      toast.success(
        isEdit
          ? "Survey updated and synced successfully!"
          : "Survey created and synced successfully!",
      );
    } catch (error: any) {
      if (error.name !== "AbortError") {
        console.error("Save Error:", error);
        toast.error(error.message || "Failed to save survey.");
      }
    } finally {
      isSavingRef.current = false;
      setIsSaving(false);
    }
  }, [survey, isEdit, surveyId, getTranslationCompleteness, setSearchParams]);

  // Track dirty state for unsaved changes warning
  const initialSurveyRef = useRef(survey);
  const isDirty = survey !== initialSurveyRef.current;

  // Reset initial ref after save
  useEffect(() => {
    if (!isSaving) {
      initialSurveyRef.current = survey;
    }
  }, [isSaving, survey]);

  // Warn before leaving with unsaved changes
  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault();
      }
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [isDirty]);

  // Abort save on unmount
  useEffect(() => {
    return () => {
      if (saveAbortRef.current) saveAbortRef.current.abort();
    };
  }, []);

  return useMemo(
    () => ({
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
      isDirty,
      editingLanguage,
      setEditingLanguage,
      getI18nValue,
      setI18nValue,
      getTranslationCompleteness,
    }),
    [
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
      isDirty,
      editingLanguage,
      setEditingLanguage,
      getI18nValue,
      setI18nValue,
      getTranslationCompleteness,
    ],
  );
};
