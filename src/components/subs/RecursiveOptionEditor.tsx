import React, { useState } from "react";
import {
  Plus,
  Trash2,
  ChevronRight,
  ChevronDown,
  Clipboard,
  CheckSquare,
  Square,
} from "lucide-react";
import type { QuestionOption } from "../../types";

const MAX_NESTING_LEVEL = 2;

export const RecursiveOptionEditor: React.FC<{
  options: QuestionOption[];
  onChange: (opts: QuestionOption[]) => void;
  level?: number;
}> = ({ options, onChange, level = 0 }) => {
  const [expandedIndices, setExpandedIndices] = useState<Set<number>>(
    new Set(),
  );
  const [showBulkPaste, setShowBulkPaste] = useState(false);
  const [bulkText, setBulkText] = useState("");

  // --- Bulk Selection State ---
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedIndices, setSelectedIndices] = useState<Set<number>>(
    new Set(),
  );

  const toggleExpand = (index: number) => {
    const newSet = new Set(expandedIndices);
    newSet.has(index) ? newSet.delete(index) : newSet.add(index);
    setExpandedIndices(newSet);
  };

  // --- Bulk Actions ---
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
    if (
      window.confirm(
        `Delete ${selectedIndices.size} items and all their sub-options?`,
      )
    ) {
      const newOptions = options.filter((_, i) => !selectedIndices.has(i));
      // Re-sequence remaining items
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
    if (
      window.confirm("Are you sure you want to clear EVERYTHING at this level?")
    ) {
      onChange([]);
      setIsSelectionMode(false);
    }
  };

  return (
    <div
      className={`space-y-2 ${level > 0 ? "ml-4 pl-3 border-l border-gray-200" : "mt-4"}`}
    >
      {/* Header with Bulk Controls */}
      <div className="flex justify-between items-center mb-2 bg-gray-50 p-2 rounded-md border border-gray-100">
        <div className="flex items-center gap-3">
          <h4 className="text-sm font-bold text-gray-700 uppercase tracking-tight">
            Level {level} Options ({options.length})
          </h4>

          {options.length > 0 && (
            <button
              onClick={() => {
                setIsSelectionMode(!isSelectionMode);
                setSelectedIndices(new Set());
              }}
              className={`text-xs px-2 py-1 rounded border ${
                isSelectionMode
                  ? "bg-gray-800 text-white border-black"
                  : "text-gray-600 border-gray-300 hover:bg-white"
              }`}
            >
              {isSelectionMode ? "Exit Selection" : "Bulk Select"}
            </button>
          )}
        </div>

        <div className="flex gap-2">
          {isSelectionMode && selectedIndices.size > 0 ? (
            <button
              onClick={deleteSelected}
              className="text-xs bg-red-600 text-white px-2 py-1 rounded flex items-center gap-1 hover:bg-red-700"
            >
              <Trash2 size={12} /> Delete Selected ({selectedIndices.size})
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
      </div>

      {/* Select All Toggle */}
      {isSelectionMode && options.length > 0 && (
        <div className="flex items-center gap-2 pl-1 mb-2">
          <button
            onClick={toggleSelectAll}
            className="text-gray-400 hover:text-blue-600"
          >
            {selectedIndices.size === options.length ? (
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

      {/* Bulk Paste UI (same as before) */}
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
                  sequence: options.length + i + 1,
                  label: l.split("|")[0],
                  text: l.split("|")[1] || l,
                  is_other: false,
                  sub_options: [],
                }));
                onChange([...options, ...newOpts]);
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
        {options.map((opt, idx) => {
          const isSelected = selectedIndices.has(idx);
          const isExpanded = expandedIndices.has(idx);
          const canHaveChildren = level < MAX_NESTING_LEVEL;

          return (
            <div
              key={idx}
              className={`rounded-md transition-colors ${isSelected ? "bg-red-50 border-red-100" : ""}`}
            >
              <div className="flex gap-2 items-center p-1 group">
                {/* Selection Checkbox */}
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
                    className={`p-1 rounded hover:bg-gray-100 text-gray-400 ${canHaveChildren && opt.sub_options.length > 0 ? "" : "invisible"}`}
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
                  className={`border p-1 rounded text-sm w-28 font-mono ${isSelected ? "bg-red-50" : "bg-white"}`}
                  value={opt.label}
                  onChange={(e) => {
                    const newOpts = [...options];
                    newOpts[idx].label = e.target.value;
                    onChange(newOpts);
                  }}
                />

                <input
                  type="text"
                  className={`border p-1 rounded text-sm flex-1 ${isSelected ? "bg-red-50" : "bg-white"}`}
                  value={opt.text}
                  onChange={(e) => {
                    const newOpts = [...options];
                    newOpts[idx].text = e.target.value;
                    onChange(newOpts);
                  }}
                />

                {!isSelectionMode && (
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100">
                    {canHaveChildren && (
                      <button
                        onClick={() => {
                          if (!isExpanded) toggleExpand(idx);
                          const newOpts = [...options];
                          newOpts[idx].sub_options = [
                            ...(newOpts[idx].sub_options || []),
                            {
                              sequence: 1,
                              text: "",
                              label: "",
                              is_other: false,
                              sub_options: [],
                            },
                          ];
                          onChange(newOpts);
                        }}
                        className="p-1 text-blue-500 hover:bg-blue-50 rounded"
                      >
                        <Plus size={14} />
                      </button>
                    )}
                    <button
                      onClick={() =>
                        onChange(options.filter((_, i) => i !== idx))
                      }
                      className="p-1 text-red-400 hover:bg-red-50 rounded"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                )}
              </div>

              {/* Recursive Children */}
              {isExpanded && !isSelectionMode && canHaveChildren && (
                <RecursiveOptionEditor
                  level={level + 1}
                  options={opt.sub_options || []}
                  onChange={(newSubs) => {
                    const newOpts = [...options];
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
              ...options,
              {
                sequence: options.length + 1,
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
  );
};

