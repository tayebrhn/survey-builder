import React, { useState } from "react";
import {
  Plus,
  Trash2,
  ChevronRight,
  ChevronDown,
  Clipboard,
  CheckSquare,
  Square,
  Link,
} from "lucide-react";
import { useSurveyContext, type QuestionOption } from "../../";

const MAX_NESTING_LEVEL = 2;

export const RecursiveOptionEditor: React.FC<{
  options: QuestionOption[];
  onChange: (opts: QuestionOption[]) => void;
  parentQuestionSN?: number;
  level?: number;
}> = ({ options, parentQuestionSN, onChange, level = 0 }) => {
  const { survey } = useSurveyContext();

  // --- NEW: Root Collapse State ---
  const [isRootExpanded, setIsRootExpanded] = useState(false);

  const [expandedIndices, setExpandedIndices] = useState<Set<number>>(
    new Set(),
  );
  const [showBulkPaste, setShowBulkPaste] = useState(false);
  const [bulkText, setBulkText] = useState("");

  // Resolve Parent Options
  let parentOptions: QuestionOption[] | undefined;
  if (parentQuestionSN) {
    parentOptions = survey.questions.find(
      (parentQ) => parentQ.sequence_num === parentQuestionSN,
    )?.options;
  }

  // Bulk Selection State
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedIndices, setSelectedIndices] = useState<Set<number>>(
    new Set(),
  );

  const toggleExpand = (index: number) => {
    const newSet = new Set(expandedIndices);
    newSet.has(index) ? newSet.delete(index) : newSet.add(index);
    setExpandedIndices(newSet);
  };

  const toggleSelectAll = () => {
    if (selectedIndices.size === options.length) {
      setSelectedIndices(new Set());
    } else {
      setSelectedIndices(new Set(options.map((_, i) => i)));
    }
  };

  const toggleSelect = (index: number) => {
    const newSet = new Set(selectedIndices);
    newSet.has(index) ? newSet.delete(index) : newSet.add(index);
    setSelectedIndices(newSet);
  };

  const deleteSelected = () => {
    if (window.confirm(`Delete ${selectedIndices.size} items?`)) {
      const newOptions = options.filter((_, i) => !selectedIndices.has(i));
      const resequenced = newOptions.map((opt, i) => ({
        ...opt,
        sequence: i + 1,
      }));
      onChange(resequenced);
      setSelectedIndices(new Set());
      setIsSelectionMode(false);
    }
  };

  const clearAll = () => {
    if (window.confirm("Clear EVERYTHING at this level?")) {
      onChange([]);
      setIsSelectionMode(false);
    }
  };

  const getSubOptions = (opt: QuestionOption): QuestionOption[] =>
    opt.sub_options || [];

  const normalizedOptions = options.map((opt) => ({
    ...opt,
    sub_options: getSubOptions(opt),
  }));

  return (
    <div
      className={`space-y-2 ${level > 0 ? "ml-4 pl-3 border-l border-gray-200" : "mt-4"}`}
    >
      {/* --- HEADER (Always Visible) --- */}
      <div className="flex justify-between items-center mb-2 bg-gray-50 p-2 rounded-md border border-gray-100">
        <div className="flex items-center gap-2">
          {/* Root Collapse Button */}
          <button
            onClick={() => setIsRootExpanded(!isRootExpanded)}
            className="p-1 text-gray-500 hover:text-blue-600 hover:bg-white rounded transition-colors"
          >
            {isRootExpanded ? (
              <ChevronDown size={16} />
            ) : (
              <ChevronRight size={16} />
            )}
          </button>

          <h4
            className="text-sm font-bold text-gray-700 uppercase tracking-tight cursor-pointer select-none"
            onClick={() => setIsRootExpanded(!isRootExpanded)}
          >
            Level {level} Options ({normalizedOptions.length})
          </h4>

          {isRootExpanded && normalizedOptions.length > 0 && (
            <button
              onClick={() => {
                setIsSelectionMode(!isSelectionMode);
                setSelectedIndices(new Set());
              }}
              className={`ml-2 text-xs px-2 py-1 rounded border transition-colors ${
                isSelectionMode
                  ? "bg-gray-800 text-white border-black"
                  : "text-gray-600 border-gray-300 hover:bg-white"
              }`}
            >
              {isSelectionMode ? "Exit" : "Select"}
            </button>
          )}
        </div>

        {/* Header Actions (Only visible if expanded or specific conditions met) */}
        {isRootExpanded && (
          <div className="flex gap-2">
            {isSelectionMode && selectedIndices.size > 0 ? (
              <button
                onClick={deleteSelected}
                className="text-xs bg-red-600 text-white px-2 py-1 rounded flex items-center gap-1 hover:bg-red-700"
              >
                <Trash2 size={12} /> Delete ({selectedIndices.size})
              </button>
            ) : (
              level === 0 && (
                <button
                  onClick={() => setShowBulkPaste(!showBulkPaste)}
                  className="text-xs text-blue-600 flex items-center gap-1 hover:bg-blue-50 px-2 py-1 rounded"
                >
                  <Clipboard size={12} /> Bulk Paste
                </button>
              )
            )}

            {isSelectionMode && (
              <button
                onClick={clearAll}
                className="text-xs text-red-500 hover:underline px-2"
              >
                Clear All
              </button>
            )}
          </div>
        )}
      </div>

      {/* --- COLLAPSIBLE CONTENT AREA --- */}
      {isRootExpanded && (
        <div className="animate-in fade-in slide-in-from-top-1 duration-200">
          {/* Select All Toggle */}
          {isSelectionMode && normalizedOptions.length > 0 && (
            <div className="flex items-center gap-2 pl-1 mb-2">
              <button
                onClick={toggleSelectAll}
                className="text-gray-400 hover:text-blue-600"
              >
                {selectedIndices.size === normalizedOptions.length ? (
                  <CheckSquare size={18} />
                ) : (
                  <Square size={18} />
                )}
              </button>
              <span className="text-xs font-semibold text-gray-500">
                Select All
              </span>
            </div>
          )}

          {/* Bulk Paste UI */}
          {showBulkPaste && (
            <div className="bg-blue-50 p-3 rounded mb-3 border border-blue-200">
              <textarea
                className="w-full border p-2 text-xs h-24 font-mono mb-2"
                value={bulkText}
                onChange={(e) => setBulkText(e.target.value)}
                placeholder="LABEL|Text (one per line)"
              />
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    const lines = bulkText.split("\n").filter((l) => l.trim());
                    const newOpts = lines.map((l, i) => ({
                      sequence: normalizedOptions.length + i + 1,
                      label: l.split("|")[0],
                      text: l.split("|")[1] || l,
                      is_other: false,
                      sub_options: [],
                    }));
                    onChange([...normalizedOptions, ...newOpts]);
                    setShowBulkPaste(false);
                    setBulkText("");
                  }}
                  className="bg-blue-600 text-white text-xs px-3 py-1 rounded"
                >
                  Add Items
                </button>
                <button
                  onClick={() => setShowBulkPaste(false)}
                  className="text-xs text-gray-500"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Option List */}
          <div className="space-y-1">
            {normalizedOptions.map((opt, idx) => {
              const isSelected = selectedIndices.has(idx);
              const isExpanded = expandedIndices.has(idx);
              const canHaveChildren = level < MAX_NESTING_LEVEL;
              const subOptions = getSubOptions(opt);
              const hasSubOptions = subOptions.length > 0;

              return (
                <div
                  key={idx}
                  className={`rounded-md transition-colors ${isSelected ? "bg-red-50 border-red-100" : ""}`}
                >
                  <div className="flex gap-2 items-center p-1 group">
                    {/* Expand/Select Toggle */}
                    {isSelectionMode ? (
                      <button
                        onClick={() => toggleSelect(idx)}
                        className="text-blue-600 px-1"
                      >
                        {isSelected ? (
                          <CheckSquare size={18} />
                        ) : (
                          <Square size={18} />
                        )}
                      </button>
                    ) : (
                      <button
                        onClick={() => toggleExpand(idx)}
                        className={`p-1 rounded hover:bg-gray-100 text-gray-400 ${
                          canHaveChildren && hasSubOptions ? "" : "invisible"
                        }`}
                        disabled={!canHaveChildren || !hasSubOptions}
                      >
                        {isExpanded ? (
                          <ChevronDown size={14} />
                        ) : (
                          <ChevronRight size={14} />
                        )}
                      </button>
                    )}

                    <span className="text-[10px] font-mono text-gray-400 w-6">
                      {opt.sequence}
                    </span>

                    <input
                      type="text"
                      placeholder="Label"
                      className={`border p-1 rounded text-sm w-28 font-mono ${
                        isSelected ? "bg-red-50" : "bg-white"
                      }`}
                      value={opt.label}
                      onChange={(e) => {
                        const newOpts = [...normalizedOptions];
                        newOpts[idx].label = e.target.value;
                        onChange(newOpts);
                      }}
                    />

                    <input
                      type="text"
                      placeholder="Option Text"
                      className={`border p-1 rounded text-sm flex-1 ${
                        isSelected ? "bg-red-50" : "bg-white"
                      }`}
                      value={opt.text}
                      onChange={(e) => {
                        const newOpts = [...normalizedOptions];
                        newOpts[idx].text = e.target.value;
                        onChange(newOpts);
                      }}
                    />

                    {/* Dependency Dropdown */}
                    {level === 0 &&
                      parentOptions &&
                      parentOptions.length > 0 && (
                        <div
                          className="relative group/dep"
                          title="Depends on Parent Option"
                        >
                          <div className="absolute inset-y-0 left-2 flex items-center pointer-events-none">
                            <Link size={12} className="text-gray-400" />
                          </div>
                          <select
                            className={`border border-gray-300 rounded text-xs pl-6 pr-2 py-1.5 w-32 appearance-none cursor-pointer hover:border-blue-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-200 outline-none ${
                              opt.dependency_option
                                ? "bg-blue-50 text-blue-800 border-blue-200"
                                : "bg-white text-gray-500"
                            }`}
                            value={opt.dependency_option || ""}
                            onChange={(e) => {
                              const newOpts = [...normalizedOptions];
                              newOpts[idx] = {
                                ...newOpts[idx],
                                dependency_option: e.target.value
                                  ? Number(e.target.value)
                                  : undefined,
                              };
                              onChange(newOpts);
                            }}
                          >
                            <option value="">-- Parent Opt --</option>
                            {parentOptions.map((pOpt) => (
                              <option key={pOpt.sequence} value={pOpt.sequence}>
                                {pOpt.text.length > 15
                                  ? pOpt.text.substring(0, 15) + "..."
                                  : pOpt.text || pOpt.label}
                              </option>
                            ))}
                          </select>
                        </div>
                      )}

                    {!isSelectionMode && (
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        {canHaveChildren && (
                          <button
                            onClick={() => {
                              if (!isExpanded) toggleExpand(idx);
                              const newOpts = [...normalizedOptions];
                              newOpts[idx].sub_options = [
                                ...subOptions,
                                {
                                  sequence: subOptions.length + 1,
                                  text: "",
                                  label: "",
                                  is_other: false,
                                  sub_options: [],
                                },
                              ];
                              onChange(newOpts);
                            }}
                            className="p-1 text-blue-500 hover:bg-blue-50 rounded"
                            title="Add Sub-Option"
                          >
                            <Plus size={14} />
                          </button>
                        )}
                        <button
                          onClick={() =>
                            onChange(
                              normalizedOptions.filter((_, i) => i !== idx),
                            )
                          }
                          className="p-1 text-red-400 hover:bg-red-50 rounded"
                          title="Delete Option"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    )}
                  </div>

                  {isExpanded && !isSelectionMode && canHaveChildren && (
                    <RecursiveOptionEditor
                      level={level + 1}
                      options={subOptions}
                      onChange={(newSubs) => {
                        const newOpts = [...normalizedOptions];
                        newOpts[idx].sub_options = newSubs;
                        onChange(newOpts);
                      }}
                    />
                  )}
                </div>
              );
            })}
          </div>

          {!isSelectionMode && (
            <button
              onClick={() =>
                onChange([
                  ...normalizedOptions,
                  {
                    sequence: normalizedOptions.length + 1,
                    text: "",
                    label: "",
                    is_other: false,
                    sub_options: [],
                  },
                ])
              }
              className="text-xs text-blue-600 flex items-center gap-1 mt-2 hover:underline px-2"
            >
              <Plus size={14} /> Add Option
            </button>
          )}
        </div>
      )}
    </div>
  );
};
