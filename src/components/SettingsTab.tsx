import React from "react";
import { Plus, Trash2 } from "lucide-react";
import type { SurveyExport } from "../types";

interface SettingsTabProps {
  survey: SurveyExport;
  onUpdateMetadata: (
    field: keyof SurveyExport["metadata"],
    value: string,
  ) => void;
  onAddCategory: () => void;
  onUpdateCategory: (index: number, name: string) => void;
  onRemoveCategory: (index: number) => void;
  onAddKeyChoice: () => void;
  onUpdateKeyChoice: (
    index: number,
    field: "key" | "description",
    value: string,
  ) => void;
  onRemoveKeyChoice: (index: number) => void;
}

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

export const SettingsTab: React.FC<SettingsTabProps> = ({
  survey,
  onUpdateMetadata,
  onAddCategory,
  onUpdateCategory,
  onRemoveCategory,
  onAddKeyChoice,
  onUpdateKeyChoice,
  onRemoveKeyChoice,
}) => {
  const canRemoveCategory = survey.question_categories.length > 1;

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
              onChange={(e) => onUpdateMetadata("title", e.target.value)}
            />
          </div>

          <div>
            <label className={labelBase}>Description</label>
            <textarea
              rows={3}
              className={textareaBase}
              value={survey.metadata.description}
              onChange={(e) => onUpdateMetadata("description", e.target.value)}
            />
          </div>

          <div>
            <label className={labelBase}>Instructions</label>
            <textarea
              rows={3}
              className={textareaBase}
              value={survey.metadata.instructions}
              onChange={(e) => onUpdateMetadata("instructions", e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={labelBase}>Version</label>
              <input
                type="text"
                className={inputBase}
                value={survey.metadata.version}
                onChange={(e) => onUpdateMetadata("version", e.target.value)}
              />
            </div>

            <div>
              <label className={labelBase}>Language</label>
              <input
                type="text"
                className={inputBase}
                value={survey.metadata.language}
                onChange={(e) => onUpdateMetadata("language", e.target.value)}
              />
            </div>
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
            onClick={onAddCategory}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-lg
                       bg-indigo-600 text-white text-sm font-medium
                       hover:bg-indigo-700 transition"
          >
            <Plus size={16} />
            Add Category
          </button>
        </div>

        <div className="space-y-3">
          {survey.question_categories.map((cat, idx) => (
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
                onChange={(e) => onUpdateCategory(idx, e.target.value)}
              />

              {canRemoveCategory && (
                <button
                  onClick={() => onRemoveCategory(idx)}
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
      </section>

      {/* ================= Key Choices ================= */}
      <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex justify-between items-end mb-4">
          <h3 className="text-lg font-bold text-gray-800">Key Choices</h3>
          <span className="text-xs text-gray-400">
            Global keys for logic & referencing
          </span>
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
                  onChange={(e) =>
                    onUpdateKeyChoice(idx, "key", e.target.value)
                  }
                />
              </div>

              <div>
                <label className={labelBase}>Description</label>
                <input
                  className={inputBase}
                  value={choice.description}
                  onChange={(e) =>
                    onUpdateKeyChoice(idx, "description", e.target.value)
                  }
                />
              </div>

              <button
                onClick={() => onRemoveKeyChoice(idx)}
                title="Remove key choice"
                className="p-2 rounded-md text-gray-400
                           hover:text-red-600 hover:bg-red-50 transition"
              >
                <Trash2 size={18} />
              </button>
            </div>
          ))}

          <button
            onClick={onAddKeyChoice}
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
