import React from "react";
import { Plus, Trash2 } from "lucide-react";
import { Switch } from "@headlessui/react";
import { useSurveyContext, useMetaContext } from "../context";

/* -------------------------------
   Reusable Tailwind styles
-------------------------------- */
const inputBase =
  "w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm " +
  "focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition";

const textareaBase =
  "w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm " +
  "focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition resize-none";

const labelBase =
  "block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1";

export const SettingsTab: React.FC = () => {
  const {
    survey,
    updateMetadata,
    addCategory,
    updateCategory,
    removeCategory,
    addKeyChoice,
    updateKeyChoice,
    removeKeyChoice,
  } = useSurveyContext();
  const canRemoveCategory = survey?.question_categories!.length > 1;
  const { meta } = useMetaContext();

  const languages = meta?.languages || [];

  return (
    <div className="space-y-6">
      {/* ================= Metadata ================= */}
      <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <h3 className="text-lg font-bold text-gray-800 mb-4">
          Survey Metadata
        </h3>

        <div className="space-y-4">
          <div>
            <label className={labelBase}>Title</label>
            <input
              type="text"
              className={inputBase}
              value={survey.metadata.title}
              onChange={(e) => updateMetadata("title", e.target.value)}
            />
          </div>

          <div>
            <label className={labelBase}>Description</label>
            <textarea
              rows={3}
              className={textareaBase}
              value={survey.metadata.description}
              onChange={(e) => updateMetadata("description", e.target.value)}
            />
          </div>

          <div>
            <label className={labelBase}>Instructions</label>
            <textarea
              rows={3}
              className={textareaBase}
              value={survey.metadata.instructions}
              onChange={(e) => updateMetadata("instructions", e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={labelBase}>Version</label>
              <input
                type="text"
                className={inputBase}
                value={survey.metadata.version}
                onChange={(e) => updateMetadata("version", e.target.value)}
              />
            </div>

            <div>
              <label className={labelBase}>Language</label>
              <select
                value={survey.metadata.language}
                onChange={(e) => updateMetadata("language", e.target.value)}
              >
                <option value="">Select language</option>
                {languages.map((lang) => (
                  <option key={lang.value} value={lang.value}>
                    {lang.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </section>
      {/* is active*/}
      <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between gap-4">
          <div>
            <label className="text-sm font-medium text-gray-800">
              Is survey active?
            </label>
            <p className="text-xs text-gray-500">
              Inactive surveys cannot be filled by respondents
            </p>
          </div>

          <Switch
            checked={survey.metadata.is_active}
            onChange={(checked) => updateMetadata("is_active", checked)}
            className={`${
              survey.metadata.is_active ? "bg-indigo-600" : "bg-gray-300"
            } relative inline-flex h-6 w-11 items-center rounded-full transition`}
          >
            <span
              className={`${
                survey.metadata.is_active ? "translate-x-6" : "translate-x-1"
              } inline-block h-4 w-4 transform rounded-full bg-white transition`}
            />
          </Switch>
        </div>
      </section>
      {/* date*/}
      <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Start Date
            </label>
            <input
              type="date"
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
              value={survey.metadata.start_date}
              onChange={(e) => updateMetadata("start_date", e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              End Date (Optional)
            </label>
            <input
              type="date"
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
              value={survey.metadata.end_date}
              onChange={(e) => updateMetadata("end_date", e.target.value)}
            />
          </div>
        </div>
      </section>
      {/* ================= Categories ================= */}
      <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold text-gray-800">
            Question Categories
          </h3>

          <button
            onClick={addCategory}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-lg
                       bg-indigo-600 text-white text-sm font-medium
                       hover:bg-indigo-700 transition"
          >
            <Plus size={16} />
            Add Category
          </button>
        </div>

        <div className="space-y-3">
          {survey?.question_categories?.map((cat, idx) => (
            <div
              key={cat.cat_number}
              className="flex items-center gap-3 p-3 rounded-lg
                         bg-gray-50 border border-gray-200"
            >
              <span
                className="inline-flex items-center justify-center
                           w-12 h-8 rounded-md bg-indigo-100
                           text-indigo-700 text-sm font-bold shrink-0"
              >
                #{cat.cat_number}
              </span>

              <input
                type="text"
                className={inputBase}
                value={cat.name}
                onChange={(e) => updateCategory(idx, e.target.value)}
              />

              {canRemoveCategory && (
                <button
                  onClick={() => removeCategory(idx)}
                  title="Remove category"
                  className="p-2 rounded-md text-gray-400
                             hover:text-red-600 hover:bg-red-50 transition"
                >
                  <Trash2 size={18} />
                </button>
              )}
            </div>
          ))}
        </div>

        {!canRemoveCategory && (
          <p className="text-xs text-gray-400 mt-2">
            At least one category is required.
          </p>
        )}
      </section>{" "}
      {/* ================= Key Choices ================= */}
      <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex justify-between items-end mb-4">
          <h3 className="text-lg font-bold text-gray-800">Key Choices</h3>
        </div>

        <div className="space-y-3">
          {survey.key_choice.length === 0 && (
            <p className="text-sm text-gray-400 italic">
              No key choices defined.
            </p>
          )}

          {survey.key_choice.map((choice, idx) => (
            <div
              key={idx}
              className="grid grid-cols-1 md:grid-cols-[1fr_2fr_auto]
                         gap-3 items-end p-4 rounded-lg
                         border border-gray-200 bg-gray-50"
            >
              <div>
                <label className={labelBase}>Key</label>
                <input
                  className={`${inputBase} font-mono`}
                  value={choice.key}
                  onChange={(e) => updateKeyChoice(idx, "key", e.target.value)}
                />
              </div>

              <div>
                <label className={labelBase}>Description</label>
                <input
                  className={inputBase}
                  value={choice.description}
                  onChange={(e) =>
                    updateKeyChoice(idx, "description", e.target.value)
                  }
                />
              </div>

              <button
                onClick={() => removeKeyChoice(idx)}
                title="Remove key choice"
                className="p-2 rounded-md text-gray-400
                           hover:text-red-600 hover:bg-red-50 transition"
              >
                <Trash2 size={18} />
              </button>
            </div>
          ))}

          <button
            onClick={addKeyChoice}
            className="inline-flex items-center gap-2 text-sm
                       text-indigo-600 hover:underline mt-2"
          >
            <Plus size={16} />
            Add Key Choice
          </button>
        </div>
      </section>
    </div>
  );
};
