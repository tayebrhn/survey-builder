import React, { useMemo, useCallback, useEffect } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Copy, GripVertical, TextCursor, Trash2 } from "lucide-react";
import type { SurveyQuestion, QuestionType } from "../..";
import {
  RecursiveOptionEditor,
} from "../..";
import { useSurveyDataContext, useSurveyI18nContext, useMetaContext } from "../..";
import { useDebouncedField } from "../../hooks/useDebouncedField";
import { CheckboxRadio, Input, Select } from "../forms/FormsComponent";

interface QuestionEditorProps {
  question: SurveyQuestion;
  index: number;
  categories: Array<{ cat_number: number; name: string }>;
  questions: SurveyQuestion[];
  onUpdate: (updates: Partial<SurveyQuestion>) => void;
  onDelete: () => void;
  onDuplicate: () => void;
}

/* -------------------------------
   Reusable Tailwind styles
-------------------------------- */
const inputBase =
  "w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm " +
  "focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition";

const labelBase =
  "block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1";

export const QuestionEditor: React.FC<QuestionEditorProps> = ({
  question,
  categories,
  questions,
  onUpdate,
  onDelete,
  onDuplicate,
}) => {
  const { meta, loading: metaLoading } = useMetaContext();
  const { survey } = useSurveyDataContext();
  const { editingLanguage, getI18nValue, setI18nValue } = useSurveyI18nContext();
  const questionTypes = useMemo(() => meta?.question_types || [], [meta]);
  const validationType = useMemo(() => meta?.validation_type || [], [meta]);

  const typeMeta = useMemo(
    () => questionTypes?.find((t) => t.value === question.q_type),
    [questionTypes, question.q_type],
  );

  const havePlacehoder = typeMeta?.has_plh ?? false;
  const requiresOptionsDep = typeMeta?.has_options ?? false;

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: question.sequence_num });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  useEffect(() => {
    if (!requiresOptionsDep && question.options.length > 0) {
      onUpdate({ options: [] });
    }
  }, [requiresOptionsDep]);

  const eligibleParents = useMemo(() => {
    return questions.filter((parentQ) => {
      if (parentQ.sequence_num >= question.sequence_num) return false;
      const parentMeta = questionTypes.find((t) => t.value === parentQ.q_type);
      return parentMeta?.has_options;
    });
  }, [questions, question.sequence_num, questionTypes]);

  const handleOptionsChange = useCallback(
    (newOptions: any[]) => {
      onUpdate({ options: newOptions });
    },
    [onUpdate],
  );

  const baseLang = survey.metadata.language || "en";
  const isTranslating = editingLanguage !== baseLang;

  const questionText = useDebouncedField(
    getI18nValue(question.question_i18n, question.question),
    useCallback((val: string) => {
      onUpdate({
        question: isTranslating ? question.question : val,
        question_i18n: setI18nValue(question.question_i18n, val),
      });
    }, [onUpdate, isTranslating, question.question, question.question_i18n, setI18nValue]),
  );

  const placeholderText = useDebouncedField(
    getI18nValue(question.placeholder_i18n, question.placeholder || ""),
    useCallback((val: string) => {
      onUpdate({
        placeholder: isTranslating ? question.placeholder : val,
        placeholder_i18n: setI18nValue(question.placeholder_i18n, val),
      });
    }, [onUpdate, isTranslating, question.placeholder, question.placeholder_i18n, setI18nValue]),
  );

  const defaultValueText = useDebouncedField(
    String(question.default_value ?? ""),
    useCallback((val: string) => {
      const parsed = question.q_type === "number"
        ? (val === "" ? undefined : Number(val))
        : val || undefined;
      onUpdate({ default_value: parsed });
    }, [onUpdate, question.q_type]),
  );

  if (metaLoading) return <div>Loading permissions...</div>;
  if (questionTypes.length === 0) {
    return (
      <div className="p-4 text-red-500">
        Error: Could not load question types.
      </div>
    );
  }

  return (
    <div ref={setNodeRef} style={style} className="group relative rounded-2xl border border-gray-200/70 bg-white/90 backdrop-blur-sm p-6 shadow-sm hover:shadow-lg transition-all duration-300">
      {/* Left Accent Bar */}
      <div className="absolute left-0 top-0 h-full w-1 rounded-l-2xl bg-indigo-500 opacity-70 group-hover:opacity-100 transition" />

      <div className="flex gap-5">
        <div
          className="pt-2 cursor-move text-gray-300 hover:text-gray-500 transition"
          {...attributes}
          {...listeners}
        >
          <GripVertical size={18} />
        </div>

        <div className="flex-1 space-y-6">
          {/* ================= HEADER ================= */}
          <div className="flex items-start gap-4">
            <div className="flex items-center gap-3 shrink-0">
              <span className="inline-flex items-center justify-center h-9 w-9 rounded-xl bg-indigo-100 text-indigo-700 text-sm font-bold">
                {question.sequence_num}
              </span>
            </div>
            <div className="flex-1 flex items-center gap-1">
              <Input
                type="text"
                placeholder="Enter your question..."
                value={questionText.value}
                onChange={(e) => questionText.onChange(e.target.value)}
                className="w-full text-lg font-semibold bg-transparent border-b border-gray-200 focus:border-indigo-500 outline-none py-1 transition"
              />
              {isTranslating && !question.question_i18n?.[editingLanguage] && (
                <button
                  type="button"
                  onClick={() => onUpdate({
                    question_i18n: { ...(question.question_i18n || {}), [editingLanguage]: question.question },
                  })}
                  title="Copy from base language"
                  className="p-1 text-gray-400 hover:text-indigo-600 transition shrink-0"
                >
                  <Copy size={14} />
                </button>
              )}
            </div>
            <div className="flex gap-1">
              <button
                type="button"
                onClick={onDuplicate}
                title="Duplicate question"
                className="p-2 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition"
              >
                <Copy size={18} />
              </button>
              <button
                type="button"
                onClick={onDelete}
                className="p-2 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition"
              >
                <Trash2 size={18} />
              </button>
            </div>
          </div>

          {/* ================= SETTINGS ================= */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
            {/* Question Type */}
            <div>
              <label className={labelBase}>Type</label>
              <Select
                className={inputBase}
                value={question.q_type}
                onChange={(e) =>
                  onUpdate({
                    q_type: e.target.value as QuestionType,
                    options: questionTypes.find(
                      (t) => t.value === e.target.value,
                    )?.has_options
                      ? question.options
                      : [],
                  })
                }
              >
                {questionTypes.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </Select>
            </div>

            {/* Category */}
            <div>
              <label className={labelBase}>Category</label>
              <Select
                className={inputBase}
                value={question.category}
                onChange={(e) => onUpdate({ category: Number(e.target.value) })}
              >
                {categories.map((cat) => (
                  <option key={cat.cat_number} value={cat.cat_number}>
                    {cat.name}
                  </option>
                ))}
              </Select>
            </div>

            {/* Length Constraints */}
            {question.q_type !== "rating" && (
              <div>
                <div>
                  <label className={labelBase}>Verifiable Type</label>
                  <Select
                    className={inputBase}
                    value={question.validation_type}
                    onChange={(e) =>
                      onUpdate({
                        validation_type: e.target.value,
                      })
                    }
                  >
                    {validationType.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </Select>
                </div>
                {!requiresOptionsDep && question.q_type !== "rating" && (
                  <>
                    <label className={labelBase}>Length</label>
                    <div className="flex gap-3">
                      <Input
                        type="number"
                        required={false}
                        placeholder="Min"
                        className={inputBase}
                        value={question.constraints?.min_length || ""}
                        onChange={(e) =>
                          onUpdate({
                            constraints: {
                              ...question.constraints,
                              min_length: Number(e.target.value),
                            },
                          })
                        }
                      />
                      <Input
                        type="number"
                        required={false}
                        placeholder="Max"
                        className={inputBase}
                        value={question.constraints?.max_length || ""}
                        onChange={(e) =>
                          onUpdate({
                            constraints: {
                              ...question.constraints,
                              max_length: Number(e.target.value),
                            },
                          })
                        }
                      />
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Placeholder */}
            {havePlacehoder && (
              <div>
                <label className={labelBase}>Placeholder</label>
                <div className="flex items-center gap-1">
                  <div className="relative flex-1">
                    <TextCursor
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                      size={16}
                    />
                    <Input
                      type="text"
                      required={false}
                      className={`${inputBase} pl-9`}
                      placeholder="Type your placeholder..."
                      value={placeholderText.value}
                      onChange={(e) => placeholderText.onChange(e.target.value)}
                    />
                  </div>
                  {isTranslating && !question.placeholder_i18n?.[editingLanguage] && (
                    <button
                      type="button"
                      onClick={() => onUpdate({
                        placeholder_i18n: { ...(question.placeholder_i18n || {}), [editingLanguage]: question.placeholder || "" },
                      })}
                      title="Copy from base language"
                      className="p-1 text-gray-400 hover:text-indigo-600 transition shrink-0"
                    >
                      <Copy size={14} />
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* ================= DEFAULT VALUE ================= */}
          {!requiresOptionsDep && question.q_type !== "rating" && (
            <div className="flex items-center gap-3 pt-2">
              <label className={labelBase}>Default Value</label>
              <Input
                type={question.q_type === "number" ? "number" : "text"}
                required={false}
                className={inputBase}
                placeholder="Optional default"
                value={defaultValueText.value}
                onChange={(e) => defaultValueText.onChange(e.target.value)}
              />
            </div>
          )}

          {/* ================= FLAGS ================= */}
          <div className="flex flex-wrap gap-6 pt-2 border-t border-gray-100">
            {[
              { key: "required", label: "Required" },
              { key: "hidden", label: "Hidden" },
              ...(question.q_type !== "rating"
                ? [
                    { key: "verifiable", label: "Verifiable" },
                    { key: "is_unique", label: "Unique" },
                  ]
                : []),
            ].map((flag) => (
              <label
                key={flag.key}
                className="flex items-center gap-2 text-sm font-medium text-gray-600 cursor-pointer"
              >
                <CheckboxRadio
                  type="checkbox"
                  required={false}
                  checked={!!(question.constraints as any)?.[flag.key]}
                  onChange={(e) =>
                    onUpdate({
                      constraints: {
                        ...question.constraints,
                        [flag.key]: e.target.checked,
                      },
                    })
                  }
                  className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />
                {flag.label}
              </label>
            ))}
            {requiresOptionsDep && (
              <label className="flex items-center gap-2 text-sm font-medium text-gray-600 cursor-pointer">
                <CheckboxRadio
                  type="checkbox"
                  required={false}
                  checked={!!question.shuffle_options}
                  onChange={(e) =>
                    onUpdate({ shuffle_options: e.target.checked })
                  }
                  className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />
                Shuffle Options
              </label>
            )}
          </div>

          {/* ================= DEPENDENCY ================= */}
          {requiresOptionsDep && question.sequence_num !== 1 && (
            <div className="p-4 rounded-xl bg-yellow-50 border border-yellow-200">
              <label className="block text-xs font-semibold uppercase text-yellow-700 mb-2">
                Dependency
              </label>

              <Select
                required={false}
                className={inputBase}
                value={question.depends_on || ""}
                onChange={(e) =>
                  onUpdate({
                    depends_on: e.target.value
                      ? Number(e.target.value)
                      : undefined,
                  })
                }
              >
                <option value="">No Dependency</option>
                {eligibleParents.map((parentQ) => (
                  <option
                    key={parentQ.sequence_num}
                    value={parentQ.sequence_num}
                  >
                    Q{parentQ.sequence_num}: {parentQ.question.substring(0, 40)}
                  </option>
                ))}
              </Select>
            </div>
          )}

          {/* ================= OPTIONS ================= */}
          {requiresOptionsDep && (
            <div className="rounded-xl border border-dashed border-gray-300 p-4">
              <RecursiveOptionEditor
                options={question.options}
                parentQuestionSN={question.depends_on}
                onChange={handleOptionsChange}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
