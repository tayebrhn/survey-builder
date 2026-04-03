import React, { useMemo } from "react";
import { AlertTriangle, Plus, Trash2 } from "lucide-react";
import { SearchableMultiSelect } from "./subs/SearchableMultiSelect";
import { useMetaContext, useSurveyContext } from "..";

/* -------------------------------
  Types & Interfaces
-------------------------------- */
// Minimal interface based on usage to replace `any`
interface SkipLogicRule {
  id: string;
  trigger_question_sn?: number | null;
  trigger_options_sn?: number[];
  target_questions_sn?: number[];
  operator?: string;
  action?: string;
  [key: string]: any;
}

/* -------------------------------
  Reusable Tailwind classes
-------------------------------- */
const inputClass =
  "w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition disabled:bg-gray-100 disabled:cursor-not-allowed";

const labelClass =
  "block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1";

export const SkipLogicTab: React.FC = () => {
  const { survey, updateSkipLogic, removeSkipLogic, addSkipLogic } =
    useSurveyContext();
  const { meta } = useMetaContext();
  const hasRes = survey.has_responses;

  const conditions = meta?.skip_logic?.conditions ?? [];
  const actions = meta?.skip_logic?.actions ?? [];

  // const canEdit = can("eeusurvey_app.change_survey");
  // const hasRes = survey.has_responses;

  const questionsWithOptions = useMemo(
    () => survey.questions.filter((q) => q.options.length),
    [survey.questions],
  );

  // Memoize valid actions so we don't filter them inside the map for every rule
  const validActions = useMemo(
    () => actions.filter((a) => a.value === "SHOW" || a.value === "HIDE"),
    [actions],
  );

  const validateRule = (rule: SkipLogicRule) => {
    if (!rule.trigger_question_sn) return "Trigger question required";
    if (!rule.trigger_options_sn?.length) return "Select at least one answer";
    if (!rule.target_questions_sn?.length) return "Select at least one target";
    return null;
  };

  return (
    hasRes || (
      <div className="space-y-6">
        {/* HEADER */}
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-bold text-gray-900">
            Conditional Logic ({survey.skip_logic?.length ?? 0})
          </h3>
        </div>

        {/* EMPTY STATE */}
        {!survey.skip_logic?.length && (
          <div className="text-gray-400 text-center py-10 border-2 border-dashed border-gray-200 rounded-xl">
            No conditional rules defined. Click "Add Rule" to get started.
          </div>
        )}

        {/* RULES LIST */}
        <div className="space-y-5">
          {survey.skip_logic?.map((rule: SkipLogicRule, index: number) => {
            const error = validateRule(rule);
            const triggerQuestion = survey.questions.find(
              (q) => q.sequence_num === rule.trigger_question_sn,
            );

            const validTargets = rule.trigger_question_sn
              ? survey.questions
                  .filter((q) => q.sequence_num > rule.trigger_question_sn!)
                  .map((q) => ({
                    value: q.sequence_num,
                    label: `Q${q.sequence_num}: ${q.question}`,
                  }))
              : [];

            return (
              <div
                key={rule.id}
                className="border border-gray-200 rounded-xl p-5 bg-white shadow-sm space-y-5 transition-all hover:shadow-md"
              >
                {/* RULE HEADER */}
                <div className="flex justify-between items-center border-b pb-3">
                  <span className="text-sm font-bold text-indigo-600 uppercase tracking-wider">
                    Rule {index + 1}
                  </span>

                  {
                    <button
                      onClick={() => removeSkipLogic(rule.id)}
                      className="text-gray-400 hover:text-red-600 hover:bg-red-50 p-1.5 rounded-md transition"
                      aria-label="Remove Rule"
                    >
                      <Trash2 size={18} />
                    </button>
                  }
                </div>

                {/* VALIDATION WARNING */}
                {error && (
                  <div className="flex items-center gap-2 text-amber-700 bg-amber-50 p-3 rounded-lg text-sm border border-amber-200">
                    <AlertTriangle size={16} />
                    {error}
                  </div>
                )}

                {/* IF SECTION */}
                <div className="space-y-4 bg-indigo-50/50 border border-indigo-100 p-4 rounded-lg">
                  <h4 className="text-sm font-bold text-indigo-700">IF</h4>

                  <div className="grid md:grid-cols-3 gap-4">
                    {/* TRIGGER QUESTION */}
                    <div>
                      <label htmlFor={`q-${rule.id}`} className={labelClass}>
                        Question
                      </label>
                      <select
                        id={`q-${rule.id}`}
                        className={inputClass}
                        value={rule.trigger_question_sn ?? ""}
                        onChange={(e) =>
                          updateSkipLogic(rule.id, {
                            trigger_question_sn: e.target.value
                              ? Number(e.target.value)
                              : null,
                            trigger_options_sn: [],
                            target_questions_sn: [],
                          })
                        }
                      >
                        <option value="">Select question</option>
                        {questionsWithOptions.map((q) => (
                          <option key={q.sequence_num} value={q.sequence_num}>
                            Q{q.sequence_num}: {q.question}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* OPERATOR */}
                    <div>
                      <label htmlFor={`op-${rule.id}`} className={labelClass}>
                        Condition
                      </label>
                      <select
                        id={`op-${rule.id}`}
                        className={inputClass}
                        value={rule.operator ?? ""}
                        onChange={(e) =>
                          updateSkipLogic(rule.id, {
                            operator: e.target.value,
                          })
                        }
                      >
                        <option value="">Select condition</option>
                        {conditions.map((c) => (
                          <option key={c.value} value={c.value}>
                            {c.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* ANSWERS */}
                    <div>
                      <label className={labelClass}>Answer(s)</label>
                      <SearchableMultiSelect
                        disabled={!rule.trigger_question_sn}
                        options={
                          triggerQuestion?.options.map((opt) => ({
                            value: opt.sequence,
                            label: opt.text,
                          })) ?? []
                        }
                        value={rule.trigger_options_sn ?? []}
                        onChange={(vals) =>
                          updateSkipLogic(rule.id, {
                            trigger_options_sn: vals,
                          })
                        }
                      />
                    </div>
                  </div>
                </div>

                {/* THEN SECTION */}
                <div className="space-y-4 bg-gray-50 border border-gray-200 p-4 rounded-lg">
                  <h4 className="text-sm font-bold text-gray-700">THEN</h4>

                  <div className="grid md:grid-cols-2 gap-4">
                    {/* ACTION */}
                    <div>
                      <label htmlFor={`act-${rule.id}`} className={labelClass}>
                        Action
                      </label>
                      <select
                        id={`act-${rule.id}`}
                        className={inputClass}
                        value={rule.action ?? ""}
                        onChange={(e) =>
                          updateSkipLogic(rule.id, {
                            action: e.target.value,
                          })
                        }
                      >
                        <option value="">Select action</option>
                        {validActions.map((a) => (
                          <option key={a.value} value={a.value}>
                            {a.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* TARGETS */}
                    <div>
                      <label className={labelClass}>Target Question(s)</label>
                      <SearchableMultiSelect
                        disabled={!rule.trigger_question_sn}
                        options={validTargets}
                        value={rule.target_questions_sn ?? []}
                        onChange={(vals) =>
                          updateSkipLogic(rule.id, {
                            target_questions_sn: vals,
                          })
                        }
                      />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        <div className="flex justify-between items-center">
          {
            <button
              onClick={addSkipLogic}
              className="bg-indigo-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-indigo-700 transition shadow-sm"
              type="button"
            >
              <Plus size={16} />
              Add Rule
            </button>
          }
        </div>
      </div>
    )
  );
};
