import React from "react";
import { Plus, Trash2 } from "lucide-react";
import type { QuestionOption } from "../types";
import { createEmptyOption } from "../constants";
// import { createEmptyOption } from "../constants";

interface RecursiveOptionEditorProps {
  options: QuestionOption[];
  onChange: (opts: QuestionOption[]) => void;
  level?: number;
}

export const RecursiveOptionEditor: React.FC<RecursiveOptionEditorProps> = ({
  options,
  onChange,
  level = 0,
}) => {
  const handleUpdateOption = (
    index: number,
    updatedOption: QuestionOption
  ) => {
    const newOptions = [...options];
    newOptions[index] = updatedOption;
    onChange(newOptions);
  };

  const handleRemoveOption = (index: number) => {
    const newOptions = options.filter((_, i) => i !== index);
    onChange(newOptions);
  };

  const handleAddOption = () => {
    const nextSeq =
      options.length > 0 ? Math.max(...options.map((o) => o.sequence)) + 1 : 1;
    onChange([...options, createEmptyOption(nextSeq)]);
  };

  return (
    <div
      className={`space-y-3 ${level > 0 ? "ml-6 mt-3 pl-4 border-l-2 border-indigo-100" : "mt-4"}`}
    >
      {level === 0 && (
        <h4 className="text-sm font-semibold text-gray-700">Options</h4>
      )}

      {options.map((opt, idx) => (
        <div key={idx} className="group relative">
          <div className="flex gap-2 items-start">
            <div className="pt-2">
              <span className="text-xs font-mono text-gray-400 bg-gray-50 px-1 rounded">
                {level === 0 ? opt.sequence : `${level}.${opt.sequence}`}
              </span>
            </div>

            <div className="flex-1 space-y-2">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Label (Backend Value)"
                  className="border p-1.5 rounded text-sm w-1/3 focus:ring-1 focus:ring-blue-500 outline-none"
                  value={opt.label}
                  onChange={(e) =>
                    handleUpdateOption(idx, { ...opt, label: e.target.value })
                  }
                />
                <input
                  type="text"
                  placeholder={`Display Text ${level > 0 ? "(Sub-option)" : ""}`}
                  className="border p-1.5 rounded text-sm flex-1 focus:ring-1 focus:ring-blue-500 outline-none"
                  value={opt.text}
                  onChange={(e) =>
                    handleUpdateOption(idx, { ...opt, text: e.target.value })
                  }
                />
                <button
                  onClick={() => handleRemoveOption(idx)}
                  className="text-gray-400 hover:text-red-500 p-1.5 transition-colors"
                  title="Remove Option"
                >
                  <Trash2 size={16} />
                </button>
              </div>

              <div className="flex flex-col items-start">
                <RecursiveOptionEditor
                  level={level + 1}
                  options={opt.sub_options || []}
                  onChange={(newSubOptions) =>
                    handleUpdateOption(idx, {
                      ...opt,
                      sub_options: newSubOptions,
                    })
                  }
                />
              </div>
            </div>
          </div>
        </div>
      ))}

      <button
        onClick={handleAddOption}
        className={`text-sm flex items-center gap-1 hover:underline ${
          level > 0 ? "text-indigo-500 text-xs" : "text-blue-600"
        }`}
      >
        <Plus size={level > 0 ? 12 : 14} />
        {level === 0 ? "Add Option" : "Add Sub-Option"}
      </button>
    </div>
  );
};
