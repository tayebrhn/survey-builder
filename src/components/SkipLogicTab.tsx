import React from "react";
import { Plus, Trash2 } from "lucide-react";
import type { SurveyExport, SkipLogicRule } from "../types";

type Action = "SHOW" | "HIDE" | "JUMP_TO" | "ENABLE" | "REQUIRE";

interface SkipLogicTabProps {
  survey: SurveyExport;
  onAddSkipLogic: () => void;
  onUpdateSkipLogic: (index: number, updates: Partial<SkipLogicRule>) => void;
  onRemoveSkipLogic: (index: number) => void;
}

/* -------------------------------
   Reusable Tailwind classes
-------------------------------- */
const inputBase =
  "w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm " +
  "focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition";

const labelBase =
  "block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1";

export const SkipLogicTab: React.FC<SkipLogicTabProps> = ({
  survey,
  onAddSkipLogic,
  onUpdateSkipLogic,
  onRemoveSkipLogic,
}) => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-bold text-gray-800">
          Conditional Logic ({survey.skip_logic?.length || 0})
        </h3>

        <button
          onClick={onAddSkipLogic}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg
                     bg-indigo-600 text-white text-sm font-medium
                     hover:bg-indigo-700 transition"
        >
          <Plus size={16} />
          Add Rule
        </button>
      </div>

      {/* Empty State */}
      {!survey.skip_logic || survey.skip_logic.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16
                        bg-gray-50 rounded-xl border border-dashed border-gray-300">
          <p className="text-lg font-medium text-gray-500 mb-1">
            No conditional rules yet
          </p>
          <p className="text-sm text-gray-400 mb-4">
            Create rules to control question flow
          </p>

          <button
            onClick={onAddSkipLogic}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg
                       bg-indigo-600 text-white text-sm hover:bg-indigo-700 transition"
          >
            <Plus size={16} />
            Add your first rule
          </button>
        </div>
      ) : (
        <div className="space-y-5">
          {survey.skip_logic.map((rule, idx) => {
            const triggerQuestion = survey.questions.find(
              (q) => q.sequence_num === rule.trigger_question_sn
            );

            return (
              <div
                key={idx}
                className="rounded-xl border border-indigo-200 bg-white
                           shadow-sm hover:shadow-md transition p-5 space-y-5"
              >
                {/* Rule Header */}
                <div className="flex justify-between items-center">
                  <span className="inline-flex items-center px-3 py-1 rounded-full
                                   bg-indigo-50 text-indigo-700 text-xs font-bold">
                    Rule #{idx + 1}
                  </span>

                  <button
                    onClick={() => onRemoveSkipLogic(idx)}
                    title="Delete rule"
                    className="p-2 rounded-md text-gray-400
                               hover:text-red-600 hover:bg-red-50 transition"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>

                {/* IF Section */}
                <div className="rounded-lg bg-indigo-50/60 p-4 space-y-4">
                  <h4 className="text-sm font-semibold text-indigo-700">IF</h4>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Trigger Question */}
                    <div>
                      <label className={labelBase}>Question</label>
                      <select
                        className={inputBase}
                        value={rule.trigger_question_sn}
                        onChange={(e) =>
                          onUpdateSkipLogic(idx, {
                            trigger_question_sn: Number(e.target.value),
                          })
                        }
                      >
                        <option value={0}>Select question</option>
                        {survey.questions.map((q) => (
                          <option key={q.sequence_num} value={q.sequence_num}>
                            Q{q.sequence_num}: {q.question.substring(0, 40)}…
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Operator */}
                    <div>
                      <label className={labelBase}>Condition</label>
                      <select
                        className={inputBase}
                        value={rule.operator}
                        onChange={(e) =>
                          onUpdateSkipLogic(idx, {
                            operator: e.target.value as any,
                          })
                        }
                      >
                        <option value="EQUALS">Equals</option>
                        <option value="NOT_EQUALS">Does Not Equal</option>
                        <option value="IN">Is In</option>
                        <option value="CONTAINS">Contains</option>
                      </select>
                    </div>

                    {/* Answer Options */}
                    <div>
                      <label className={labelBase}>Answer(s)</label>
                      <select
                        multiple
                        className={`${inputBase} min-h-[96px]`}
                        value={
                          Array.isArray(rule.trigger_options_sn)
                            ? rule.trigger_options_sn.map(String)
                            : [String(rule.trigger_options_sn)]
                        }
                        onChange={(e) => {
                          const values = Array.from(
                            e.target.selectedOptions,
                            (opt) => Number(opt.value)
                          );
                          onUpdateSkipLogic(idx, {
                            trigger_options_sn: values,
                          });
                        }}
                      >
                        {triggerQuestion?.options.map((opt) => (
                          <option key={opt.sequence} value={opt.sequence}>
                            {opt.text}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* THEN Section */}
                <div className="rounded-lg bg-gray-50 p-4 space-y-4">
                  <h4 className="text-sm font-semibold text-gray-700">THEN</h4>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Action */}
                    <div>
                      <label className={labelBase}>Action</label>
                      <select
                        className={inputBase}
                        value={rule.action}
                        onChange={(e) =>
                          onUpdateSkipLogic(idx, {
                            action: e.target.value as Action,
                          })
                        }
                      >
                        <option value="SHOW">Show</option>
                        <option value="HIDE">Hide</option>
                        <option value="JUMP_TO">Jump To</option>
                        <option value="ENABLE">Enable</option>
                        <option value="REQUIRE">Make Required</option>
                      </select>
                    </div>

                    {/* Targets */}
                    <div>
                      <label className={labelBase}>Target Question(s)</label>
                      <select
                        multiple
                        className={`${inputBase} min-h-[96px]`}
                        value={rule.target_questions_sn.map(String)}
                        onChange={(e) => {
                          const values = Array.from(
                            e.target.selectedOptions,
                            (opt) => Number(opt.value)
                          );
                          onUpdateSkipLogic(idx, {
                            target_questions_sn: values,
                          });
                        }}
                      >
                        {survey.questions
                          .filter(
                            (q) =>
                              q.sequence_num > rule.trigger_question_sn
                          )
                          .map((q) => (
                            <option
                              key={q.sequence_num}
                              value={q.sequence_num}
                            >
                              Q{q.sequence_num}:{" "}
                              {q.question.substring(0, 40)}…
                            </option>
                          ))}
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
