import React, { useMemo, useCallback } from "react";
import { GripVertical, Trash2 } from "lucide-react";
import type { SurveyQuestion, QuestionType } from "../..";
import { RecursiveOptionEditor, useAuth } from "../..";
import { useMetaContext } from "../..";

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
  const { can, isLoading } = useAuth();

  
  const { meta, loading } = useMetaContext();
  const questionTypes = useMemo(() => meta?.question_types || [], [meta]);
  
  // OPTIMIZATION 1: Memoize Metadata Lookup
  // Prevents array searching on every keystroke
  const typeMeta = useMemo(
    () => questionTypes?.find((t) => t.value === question.type),
    [questionTypes, question.type],
  );
  
  const requiresOptionsDep = typeMeta?.has_options ?? false;
  
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
  if (isLoading) return <div>Loading permissions...</div>;
  const canEdit = can("eeusurvey_app.change_survey");
  const canDelete = can("eeusurvey_app.delete_survey");

  return (
    <div
      className="rounded-xl border border-gray-200 bg-white p-5
    shadow-sm hover:shadow-md transition space-y-4"
    >
      <div className="flex gap-4">
        {/* Drag Handle */}
        <div className="pt-2 cursor-move text-gray-300 hover:text-gray-500 transition">
          {/* <GripVertical size={20} /> */}
        </div>

        <div className="flex-1 space-y-4">
          {/* Header */}
          <div className="flex items-start gap-3">
            <span
              className="inline-flex items-center px-3 py-1 rounded-full
                          bg-indigo-50 text-indigo-700 text-sm font-bold shrink-0"
            >
              Q{question.sequence_num}
            </span>

            <div className="flex-1">
              <input
                type="text"
                placeholder="Enter your question here…"
                value={question.question}
                onChange={(e) => onUpdate({ question: e.target.value })}
                className="w-full text-lg font-medium px-2 py-1
                           border-b-2 border-gray-200 focus:border-indigo-500
                           outline-none transition"
                disabled={!canEdit} // Lock the field if they don't have "change" perms
              />
            </div>
            {canDelete ?? (
              <button
                onClick={onDelete}
                title="Delete question"
                className="p-2 rounded-md text-gray-400
                         hover:text-red-600 hover:bg-red-50 transition"
              >
                <Trash2 size={18} />
              </button>
            )}
          </div>

          {/* Configuration Section */}
          <div className="rounded-xl bg-white border border-gray-200 shadow-sm overflow-hidden">
            <div className="bg-gray-50/50 border-b border-gray-100 px-4 py-2">
              <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                Question Settings
              </span>
            </div>

            <div className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* 1. Question Type */}
                <div className="space-y-1.5">
                  <label className={`${labelBase} flex items-center gap-2`}>
                    Type
                  </label>
                  <select
                    className={`${inputBase} w-full`}
                    value={question.type}
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
                    disabled={loading || !canEdit}
                  >
                    {questionTypes.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* 2. Category */}
                <div className="space-y-1.5">
                  <label className={labelBase}>Category</label>
                  <select
                    className={`${inputBase} w-full`}
                    value={question.category}
                    onChange={(e) =>
                      onUpdate({ category: Number(e.target.value) })
                    }
                    disabled={loading || !canEdit}
                  >
                    {categories.map((cat) => (
                      <option key={cat.cat_number} value={cat.cat_number}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* 3. Input Length Constraints */}
                {!requiresOptionsDep && question.type !== "rating" ? (
                  <div className="space-y-1.5">
                    <label className={labelBase}>Length Constraints</label>
                    <div className="flex items-center gap-2">
                      <div className="relative flex-1">
                        <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[9px] font-bold text-gray-400 pointer-events-none">
                          MIN
                        </span>
                        <input
                          type="number"
                          className={`${inputBase} pl-9 w-full text-right`}
                          value={question.constraints?.min_length || 0}
                          onChange={(e) =>
                            onUpdate({
                              constraints: {
                                ...question.constraints,
                                min_length: Number(e.target.value),
                              },
                            })
                          }
                          disabled={loading || !canEdit}
                        />
                      </div>
                      <span className="text-gray-300">—</span>
                      <div className="relative flex-1">
                        <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[9px] font-bold text-gray-400 pointer-events-none">
                          MAX
                        </span>
                        <input
                          type="number"
                          className={`${inputBase} pl-9 w-full text-right`}
                          value={question.constraints?.max_length || 0}
                          onChange={(e) =>
                            onUpdate({
                              constraints: {
                                ...question.constraints,
                                max_length: Number(e.target.value),
                              },
                            })
                          }
                          disabled={loading || !canEdit}
                        />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="hidden lg:block" /> /* Spacer for alignment */
                )}

                {/* 4. Behavioral Flags */}
                <div className="flex flex-col gap-2.5 pt-6 lg:pt-7 lg:pl-4">
                  {[
                    { key: "required", label: "Required" },
                    { key: "verifiable", label: "Verifiable" },
                    { key: "hidden", label: "Hidden" },
                  ].map((flag) => (
                    <label
                      key={flag.key}
                      className="group flex items-center gap-3 cursor-pointer"
                    >
                      <div className="relative flex items-center">
                        <input
                          type="checkbox"
                          checked={!!(question.constraints as any)?.[flag.key]}
                          onChange={(e) =>
                            onUpdate({
                              constraints: {
                                ...question.constraints,
                                [flag.key]: e.target.checked,
                              },
                            })
                          }
                          disabled={loading || !canEdit}
                          className="peer h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 transition-all cursor-pointer"
                        />
                      </div>
                      <span className="text-xs font-medium text-gray-600 group-hover:text-indigo-600 transition-colors">
                        {flag.label}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* --- Dependency & Options --- */}
          {requiresOptionsDep && (
            <>
              {question.sequence_num !== 1 && (
                <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                  <label className="block text-xs font-semibold text-gray-500 uppercase mb-2">
                    Dependency (Parent Question)
                  </label>
                  <div className="flex gap-4 items-center">
                    <select
                      className="flex-1 border border-gray-300 rounded p-1.5 text-sm bg-white"
                      value={question.depends_on || ""}
                      onChange={(e) =>
                        onUpdate({
                          depends_on: e.target.value
                            ? Number(e.target.value)
                            : undefined,
                        })
                      }
                      disabled={loading || !canEdit}
                    >
                      <option value="">-- No Dependency --</option>
                      {/* OPTIMIZATION: Use the memoized list instead of filtering inline */}
                      {eligibleParents.map((parentQ) => (
                        <option
                          key={parentQ.sequence_num}
                          value={parentQ.sequence_num}
                        >
                          Q{parentQ.sequence_num}:{" "}
                          {parentQ.question.substring(0, 40)}
                          {parentQ.question.length > 40 ? "..." : ""}
                        </option>
                      ))}
                    </select>

                    {/* Visual Indicator if Dependency is Set */}
                    {question.depends_on && (
                      <div className="text-xs text-yellow-700 flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse"></span>
                        Linked to Q{question.depends_on}
                      </div>
                    )}
                  </div>
                </div>
              )}
              <div className="rounded-lg border border-dashed border-gray-300 px-4 py-2">
                <RecursiveOptionEditor
                  options={question.options}
                  parentQuestionSN={question.depends_on}
                  onChange={handleOptionsChange}
                />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
