import React from "react";
import { GripVertical, Trash2 } from "lucide-react";
import type { SurveyQuestion, QuestionType } from "../..";
import { RecursiveOptionEditor } from "../..";
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
  const { meta, loading } = useMetaContext();
  const questionTypes = meta?.question_types || [];

  const typeMeta = questionTypes?.find((t) => t.value === question.type);
  const requiresOptionsDep = typeMeta?.has_options ?? false;

  return (
    <div
      className="rounded-xl border border-gray-200 bg-white p-5
                 shadow-sm hover:shadow-md transition space-y-4"
    >
      <div className="flex gap-4">
        {/* Drag Handle */}
        <div className="pt-2 cursor-move text-gray-300 hover:text-gray-500 transition">
          <GripVertical size={20} />
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
              />
            </div>

            <button
              onClick={onDelete}
              title="Delete question"
              className="p-2 rounded-md text-gray-400
                         hover:text-red-600 hover:bg-red-50 transition"
            >
              <Trash2 size={18} />
            </button>
          </div>

          {/* Configuration */}
          <div className="rounded-lg bg-gray-50 p-4 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Question Type */}
              <div>
                <label className={labelBase}>Type</label>
                <select
                  className={inputBase}
                  value={question.type}
                  onChange={(e) =>
                    onUpdate({
                      type: e.target.value as QuestionType,
                      // reset options if new type doesn't support them
                      options: questionTypes.find(
                        (t) => t.value === e.target.value,
                      )?.has_options
                        ? question.options
                        : [],
                    })
                  }
                  disabled={loading}
                >
                  {questionTypes.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Category */}
              <div>
                <label className={labelBase}>Category</label>
                <select
                  className={inputBase}
                  value={question.category}
                  onChange={(e) =>
                    onUpdate({ category: Number(e.target.value) })
                  }
                >
                  {categories.map((cat) => (
                    <option key={cat.cat_number} value={cat.cat_number}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Flags */}
              <div className="flex flex-col justify-end gap-2">
                <label className="flex items-center gap-2 text-sm text-gray-700">
                  <input
                    type="checkbox"
                    checked={question.constraints?.required}
                    onChange={(e) =>
                      onUpdate({
                        constraints: {
                          ...question.constraints,
                          required: e.target.checked,
                        },
                      })
                    }
                    className="rounded border-gray-300 text-indigo-600
                               focus:ring-indigo-500"
                  />
                  Required
                </label>

                <label className="flex items-center gap-2 text-sm text-gray-700">
                  <input
                    type="checkbox"
                    checked={question.constraints?.verifiable}
                    onChange={(e) =>
                      onUpdate({
                        constraints: {
                          ...question.constraints,
                          verifiable: e.target.checked,
                        },
                      })
                    }
                    className="rounded border-gray-300 text-indigo-600
                               focus:ring-indigo-500"
                  />
                  Verifiable
                </label>
              </div>
            </div>
          </div>
          {/* --- NEW: Dependency Field --- */}
          {/* Options Editor */}
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
                      value={question.depends_on || undefined}
                      onChange={(e) =>
                        onUpdate({
                          depends_on: e.target.value
                            ? Number(e.target.value)
                            : undefined,
                        })
                      }
                    >
                      <option value="">-- No Dependency --</option>
                      {questions
                        .filter((parentQ) => {
                          const parentMeta = questionTypes.find(
                            (t) => t.value === parentQ.type,
                          );

                          return (
                            parentQ.sequence_num < question.sequence_num &&
                            parentMeta?.has_options
                          );
                        })
                        .map((parentQ) => (
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
                  onChange={(newOptions) => onUpdate({ options: newOptions })}
                />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
