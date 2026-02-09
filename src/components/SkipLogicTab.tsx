import React from "react";
import { Plus, Trash2 } from "lucide-react";
import { SearchableMultiSelect } from "./subs/SearchableMultiSelect";
import { useAuth, useMetaContext, useSurveyContext } from "..";

type Action = "SHOW" | "HIDE" | "JUMP_TO" | "ENABLE" | "REQUIRE";

/* -------------------------------
   Reusable Tailwind classes
-------------------------------- */
const inputBase =
  "w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm " +
  "focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition";

const labelBase =
  "block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1";

export const SkipLogicTab: React.FC = () => {
  const { can, isLoading } = useAuth();

  const { survey, addSkipLogic, updateSkipLogic, removeSkipLogic } =
    useSurveyContext();
  const { meta } = useMetaContext();
  const { conditions, actions } = meta?.skip_logic || {
    conditions: [],
    actions: [],
  };
  if (isLoading) return <div>Loading permissions...</div>;
  const canEdit = can("eeusurvey_app.change_survey");
  const canDelete = can("eeusurvey_app.delete_survey");
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-bold text-gray-800">
          Conditional Logic ({survey.skip_logic?.length || 0})
        </h3>
      </div>

      {/* Empty State */}
      {!survey.skip_logic || survey.skip_logic.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <p className="text-lg mb-2">No conditional rules yet</p>
          <p className="text-sm">Create rules to control question flow</p>
        </div>
      ) : (
        <div className="space-y-5">
          {survey.skip_logic.map((rule, idx) => {
            const triggerQuestion = survey.questions.find(
              (q) => q.sequence_num === rule.trigger_question_sn,
            );

            return (
              <div
                key={idx}
                className="rounded-xl border border-indigo-200 bg-white
                           shadow-sm hover:shadow-md transition p-5 space-y-5"
              >
                {/* Rule Header */}
                <div className="flex justify-between items-center">
                  <span
                    className="inline-flex items-center px-3 py-1 rounded-full
                                   bg-indigo-50 text-indigo-700 text-xs font-bold"
                  >
                    Rule #{idx + 1}
                  </span>

                  {canDelete ?? (
                    <button
                      onClick={() => removeSkipLogic(idx)}
                      title="Delete rule"
                      className="p-2 rounded-md text-gray-400
                               hover:text-red-600 hover:bg-red-50 transition"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
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
                          updateSkipLogic(idx, {
                            trigger_question_sn: Number(e.target.value),
                          })
                        }
                        disabled={!canEdit}
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
                          updateSkipLogic(idx, {
                            operator: e.target.value,
                          })
                        }
                        disabled={!canEdit}
                      >
                        {conditions.map((type) => (
                          <option key={type.value} value={type.value}>
                            {type.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Answer Options */}
                    <div>
                      <label className={labelBase}>Answer(s)</label>
                      <SearchableMultiSelect
                        options={
                          triggerQuestion?.options.map((opt) => ({
                            value: opt.sequence,
                            label: opt.text,
                          })) ?? []
                        }
                        value={rule.trigger_options_sn ?? []}
                        onChange={(values) =>
                          updateSkipLogic(idx, {
                            trigger_options_sn: values,
                          })
                        }
                        placeholder="Select answer(s)"
                        disabled={!canEdit}
                      />
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
                          updateSkipLogic(idx, {
                            action: e.target.value as Action,
                          })
                        }
                        disabled={!canEdit}
                      >
                        {actions.map((type) => (
                          <option key={type.value} value={type.value}>
                            {type.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Targets */}
                    <div>
                      <label className={labelBase}>Target Question(s)</label>
                      <SearchableMultiSelect
                        options={survey.questions
                          .filter(
                            (q) => q.sequence_num > rule.trigger_question_sn,
                          )
                          .map((q) => ({
                            value: q.sequence_num,
                            label: `Q${q.sequence_num}: ${q.question}`,
                          }))}
                        value={rule.target_questions_sn}
                        onChange={(values) =>
                          updateSkipLogic(idx, {
                            target_questions_sn: values,
                          })
                        }
                        placeholder="Select target questions"
                        disabled={!canEdit}
                      />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
      {!canEdit || (
        <div className="flex justify-end">
          <button
            onClick={addSkipLogic}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition"
          >
            <Plus size={18} /> Add Rule
          </button>
        </div>
      )}
    </div>
  );
};
