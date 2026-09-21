import { useMemo } from "react";
import { useSurveyContext } from "..";

/** Simplified read-only preview of the survey as respondents will see it. */
export const PreviewPanel: React.FC = () => {
  const { survey } = useSurveyContext();

  const groupedQuestions = useMemo(() => {
    if (!survey.question_categories) return [];
    return survey.question_categories.map((cat) => ({
      ...cat,
      questions: survey.questions.filter((q) => q.category === cat.cat_number),
    }));
  }, [survey.question_categories, survey.questions]);

  const nonEmptyCategories = useMemo(
    () => groupedQuestions.filter((c) => c.questions.length > 0),
    [groupedQuestions],
  );

  return (
    <div className="bg-gray-50 rounded-xl border border-gray-200 p-6 overflow-y-auto max-h-[calc(100vh-200px)]">
      <div className="max-w-lg mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold text-gray-800">
            {survey.metadata.title || "Untitled Survey"}
          </h2>
          {survey.metadata.description && (
            <p className="text-sm text-gray-500">{survey.metadata.description}</p>
          )}
        </div>

        {/* Categories & Questions */}
        {nonEmptyCategories.map((cat) => (
          <div key={cat.cat_number} className="space-y-4">
            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wide border-b border-gray-200 pb-2">
              {cat.name}
            </h3>

            {cat.questions.map((q) => (
              <div
                key={q.sequence_num}
                className="bg-white rounded-lg border border-gray-200 p-4 space-y-3"
              >
                <div className="flex items-start gap-2">
                  <span className="text-xs font-bold text-indigo-600 bg-indigo-50 rounded px-1.5 py-0.5 shrink-0">
                    {q.sequence_num}
                  </span>
                  <div>
                    <p className="text-sm font-medium text-gray-800">
                      {q.question}
                      {q.constraints?.required && (
                        <span className="text-red-500 ml-1">*</span>
                      )}
                    </p>
                  </div>
                </div>

                {/* Render input placeholder based on type */}
                {q.q_type === "text" && (
                  <input
                    disabled
                    placeholder={q.placeholder || "Short answer text"}
                    className="w-full border border-gray-200 rounded px-3 py-2 text-sm bg-gray-50 text-gray-400"
                  />
                )}
                {q.q_type === "text_area" && (
                  <textarea
                    disabled
                    placeholder={q.placeholder || "Long answer text"}
                    rows={3}
                    className="w-full border border-gray-200 rounded px-3 py-2 text-sm bg-gray-50 text-gray-400 resize-none"
                  />
                )}
                {q.q_type === "number" && (
                  <input
                    disabled
                    type="number"
                    placeholder={q.placeholder || "Number"}
                    className="w-full border border-gray-200 rounded px-3 py-2 text-sm bg-gray-50 text-gray-400"
                  />
                )}
                {q.q_type === "single_choice" && (
                  <div className="space-y-1">
                    {q.options.map((opt) => (
                      <label key={opt.sequence} className="flex items-center gap-2 text-sm text-gray-600">
                        <input type="radio" disabled className="accent-indigo-500" />
                        {opt.text || opt.label}
                      </label>
                    ))}
                  </div>
                )}
                {q.q_type === "multi_select" && (
                  <div className="space-y-1">
                    {q.options.map((opt) => (
                      <label key={opt.sequence} className="flex items-center gap-2 text-sm text-gray-600">
                        <input type="checkbox" disabled className="accent-indigo-500" />
                        {opt.text || opt.label}
                      </label>
                    ))}
                  </div>
                )}
                {q.q_type === "drop_down" && (
                  <select disabled className="w-full border border-gray-200 rounded px-3 py-2 text-sm bg-gray-50 text-gray-400">
                    <option>{q.placeholder || "Select an option"}</option>
                    {q.options.map((opt) => (
                      <option key={opt.sequence}>{opt.text || opt.label}</option>
                    ))}
                  </select>
                )}
                {q.q_type === "rating" && (
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((n) => (
                      <span
                        key={n}
                        className="w-8 h-8 rounded border border-gray-200 flex items-center justify-center text-sm text-gray-400 bg-gray-50"
                      >
                        {n}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        ))}

        {nonEmptyCategories.length === 0 && (
          <p className="text-center text-gray-400 text-sm py-8">
            No questions to preview
          </p>
        )}
      </div>
    </div>
  );
};
