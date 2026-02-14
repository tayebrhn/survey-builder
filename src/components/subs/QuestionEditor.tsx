import React, { useMemo, useCallback } from "react";
import { TextCursor, Trash2 } from "lucide-react";
import type { SurveyQuestion, QuestionType } from "../..";
import { createEmptyOption, RecursiveOptionEditor, useAuth, useSurvey } from "../..";
import { useMetaContext } from "../..";
import { CheckboxRadio, Input, Select } from "../forms/FormsComponent";

interface QuestionEditorProps {
  question: SurveyQuestion;
  index: number;
  categories: Array<{ cat_number: number; name: string }>;
  questions: SurveyQuestion[];
  onUpdate: (updates: Partial<SurveyQuestion>) => void;
  onDelete: () => void;
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
  // index,
  categories,
  questions,
  onUpdate,
  onDelete,
}) => {
  const { can, isLoading: loading } = useAuth();
  const { survey } = useSurvey();
  const { meta, loading: metaLoading } = useMetaContext();
  const questionTypes = useMemo(() => meta?.question_types || [], [meta]);

  // OPTIMIZATION 1: Memoize Metadata Lookup
  // Prevents array searching on every keystroke
  const typeMeta = useMemo(
    () => questionTypes?.find((t) => t.value === question.type),
    [questionTypes, question.type],
  );

  const havePlacehoder = typeMeta?.has_plh ?? false;
  const requiresOptionsDep = typeMeta?.has_options ?? false;
// Only keep options if the type requires them
if (!requiresOptionsDep) {
  question.options = []; // clear any pre-existing options
} else {
  // Ensure there's at least one default option
  if (!question.options || question.options.length === 0) {
    question.options = [createEmptyOption(1),createEmptyOption(2)];
  }
}
  // OPTIMIZATION 2: Memoize Eligible Parents Calculation
  // This was likely the biggest bottleneck. Previously, it filtered through
  // ALL questions on every render. Now it recalculates only when list changes.
  const eligibleParents = useMemo(() => {
    return questions.filter((parentQ) => {
      // 1. Must be before current question
      if (parentQ.sequence_num >= question.sequence_num) return false;

      // 2. Parent must have options (to be a dependency source)
      const parentMeta = questionTypes.find((t) => t.value === parentQ.type);
      return parentMeta?.has_options;
    });
  }, [questions, question.sequence_num, questionTypes]);

  // OPTIMIZATION 3: Stable Handler for Child Component
  // Crucial: This ensures RecursiveOptionEditor doesn't re-render unnecessarily
  const handleOptionsChange = useCallback(
    (newOptions: any[]) => {
      onUpdate({ options: newOptions });
    },
    [onUpdate],
  );
  // These strings match Django's permission codenames: "app_label.permission_codename"
  if (metaLoading) return <div>Loading permissions...</div>;
  // 3. Safety Check: If meta loaded but is empty (API error), handle gracefully
  if (questionTypes.length === 0) {
    return (
      <div className="p-4 text-red-500">
        Error: Could not load question types.
      </div>
    );
  }
  const canEdit = can("eeusurvey_app.change_survey") && !survey.has_responses;
  const canDelete = can("eeusurvey_app.delete_survey");

  return (
    <div className="group relative rounded-2xl border border-gray-200/70 bg-white/90 backdrop-blur-sm p-6 shadow-sm hover:shadow-lg transition-all duration-300">
      {/* Left Accent Bar */}
      <div className="absolute left-0 top-0 h-full w-1 rounded-l-2xl bg-indigo-500 opacity-70 group-hover:opacity-100 transition" />

      <div className="flex gap-5">
        {/* Drag Handle */}
        <div className="pt-2 cursor-move text-gray-300 hover:text-gray-500 transition">
          {/* <GripVertical size={18} /> */}
        </div>

        <div className="flex-1 space-y-6">
          {/* ================= HEADER ================= */}
          <div className="flex items-start gap-4">
            <div className="flex items-center gap-3 shrink-0">
              <span className="inline-flex items-center justify-center h-9 w-9 rounded-xl bg-indigo-100 text-indigo-700 text-sm font-bold">
                {question.sequence_num}
              </span>
            </div>

            <div className="flex-1">
              <Input
                type="text"
                placeholder="Enter your question..."
                value={question.question}
                onChange={(e) => onUpdate({ question: e.target.value })}
                disabled={!canEdit}
                className="w-full text-lg font-semibold bg-transparent border-b border-gray-200 focus:border-indigo-500 outline-none py-1 transition"
              />
            </div>

            {canDelete && (
              <button
                type="button"
                onClick={onDelete}
                className="p-2 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition"
              >
                <Trash2 size={18} />
              </button>
            )}
          </div>

          {/* ================= SETTINGS ================= */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
            {/* Question Type */}
            <div>
              <label className={labelBase}>Type</label>
              <Select
                className={inputBase}
                value={question.type}
                disabled={loading || !canEdit}
                onChange={(e) =>
                  onUpdate({
                    type: e.target.value as QuestionType,
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
                disabled={loading || !canEdit}
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
            {!requiresOptionsDep && question.type !== "rating" && (
              <div>
                <label className={labelBase}>Length</label>
                <div className="flex gap-3">
                  <Input
                    type="number"
                    required={false}
                    placeholder="Min"
                    className={inputBase}
                    value={question.constraints?.min_length || ""}
                    disabled={loading || !canEdit}
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
                    disabled={loading || !canEdit}
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
              </div>
            )}

            {/* Placeholder */}
            {havePlacehoder && (
              <div>
                <label className={labelBase}>Placeholder</label>
                <div className="relative">
                  <TextCursor
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                    size={16}
                  />
                  <Input
                    type="text"
                    required={false}
                    className={`${inputBase} pl-9`}
                    placeholder="Type your placeholder..."
                    value={question.placeholder}
                    disabled={loading || !canEdit}
                    onChange={(e) => onUpdate({ placeholder: e.target.value })}
                  />
                </div>
              </div>
            )}
          </div>

          {/* ================= FLAGS ================= */}
          <div className="flex flex-wrap gap-6 pt-2 border-t border-gray-100">
            {[
              { key: "required", label: "Required" },
              { key: "verifiable", label: "Verifiable" },
              { key: "hidden", label: "Hidden" },
            ].map((flag) => (
              <label
                key={flag.key}
                className="flex items-center gap-2 text-sm font-medium text-gray-600 cursor-pointer"
              >
                <CheckboxRadio
                  type="checkbox"
                  required={false}
                  checked={!!(question.constraints as any)?.[flag.key]}
                  disabled={loading || !canEdit}
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
                disabled={loading || !canEdit}
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
