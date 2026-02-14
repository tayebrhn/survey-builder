import React, { useState, useMemo } from "react";
import {
  Plus,
  Trash2,
  ChevronRight,
  ChevronDown,
  Clipboard,
  CheckSquare,
  Square,
  Link,
  AlertCircle,
} from "lucide-react";
import { useAuth, useSurveyContext, type QuestionOption } from "../../";
import { Input, Select } from "../forms/FormsComponent";

const MAX_NESTING_LEVEL = 2;

export const RecursiveOptionEditor: React.FC<{
  options: QuestionOption[];
  onChange: (opts: QuestionOption[]) => void;
  parentQuestionSN?: number;
  level?: number;
}> = ({ options, parentQuestionSN, onChange, level = 0 }) => {
  const { can, isLoading } = useAuth();
  const { survey } = useSurveyContext();

  // --- State ---
  const [isRootExpanded, setIsRootExpanded] = useState(false);
  const [expandedIndices, setExpandedIndices] = useState<Set<number>>(new Set());
  const [showBulkPaste, setShowBulkPaste] = useState(false);
  const [bulkText, setBulkText] = useState("");
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedIndices, setSelectedIndices] = useState<Set<number>>(new Set());

  // --- Logic Helpers ---
  const normalizedOptions = useMemo(() => {
    if (!options) return [];
    return options.map((opt) => ({
      ...opt,
      sub_options: opt.sub_options || [],
    }));
  }, [options]);

  const parentOptions = useMemo(() => {
    if (!parentQuestionSN) return undefined;
    return survey.questions.find(
      (parentQ) => parentQ.sequence_num === parentQuestionSN,
    )?.options;
  }, [survey.questions, parentQuestionSN]);

  // Constraint: Cannot have fewer than 2 options
  const isMinOptionsReached = normalizedOptions.length <= 2;

  if (!options) return <></>;

  // --- Handlers ---
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
    const remainingCount = normalizedOptions.length - selectedIndices.size;
    
    if (remainingCount < 2) {
      alert("Validation Error: You must maintain at least 2 options at this level.");
      return;
    }

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

  if (isLoading) return <div className="p-4 text-sm text-gray-500">Loading permissions...</div>;
  
  const canEdit = can("eeusurvey_app.change_survey") && !survey.has_responses;

  return (
    <div className={`space-y-2 ${level > 0 ? "ml-4 pl-3 border-l-2 border-blue-100" : "mt-4"}`}>
      
      {/* --- HEADER --- */}
      <div className="flex justify-between items-center mb-2 bg-gray-50 p-2 rounded-md border border-gray-100 shadow-sm">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsRootExpanded(!isRootExpanded)}
            className="p-1 text-gray-500 hover:text-blue-600 hover:bg-white rounded transition-colors"
          >
            {isRootExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
          </button>

          <h4
            className="text-sm font-bold text-gray-700 uppercase tracking-tight cursor-pointer select-none"
            onClick={() => setIsRootExpanded(!isRootExpanded)}
          >
            Level {level} Options ({normalizedOptions.length})
          </h4>

          {isRootExpanded && (
            <div className="flex gap-2 ml-4">
              {canEdit && (isSelectionMode && selectedIndices.size > 0 ? (
                <button
                  type="button"
                  onClick={deleteSelected}
                  disabled={normalizedOptions.length - selectedIndices.size < 2}
                  className={`text-xs px-2 py-1 rounded flex items-center gap-1 transition-all ${
                    normalizedOptions.length - selectedIndices.size < 2
                      ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                      : "bg-red-600 text-white hover:bg-red-700 shadow-sm"
                  }`}
                >
                  <Trash2 size={12} /> Delete Selected
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setShowBulkPaste(!showBulkPaste)}
                  className="text-xs text-blue-600 flex items-center gap-1 hover:bg-blue-50 px-2 py-1 rounded transition-colors"
                >
                  <Clipboard size={12} /> Bulk Paste
                </button>
              ))}
            </div>
          )}
        </div>

        {canEdit && isRootExpanded && normalizedOptions.length > 0 && (
          <button
            type="button"
            onClick={() => {
              setIsSelectionMode(!isSelectionMode);
              setSelectedIndices(new Set());
            }}
            className={`text-xs px-2 py-1 rounded transition-colors ${
              isSelectionMode ? "text-blue-600 bg-blue-50 font-bold" : "text-gray-400 hover:text-blue-600"
            }`}
          >
            {isSelectionMode ? "Cancel Selection" : "Select"}
          </button>
        )}
      </div>

      {/* --- CONTENT AREA --- */}
      {isRootExpanded && (
        <div className="animate-in fade-in slide-in-from-top-1 duration-200">
          
          {/* Select All Toggle */}
          {isSelectionMode && normalizedOptions.length > 0 && (
            <div className="flex items-center gap-2 pl-1 mb-2">
              <button type="button" onClick={toggleSelectAll} className="text-blue-600">
                {selectedIndices.size === normalizedOptions.length ? <CheckSquare size={18} /> : <Square size={18} />}
              </button>
              <span className="text-xs font-semibold text-gray-500 italic">Select All (Min. 2 will remain)</span>
            </div>
          )}

          {/* Bulk Paste UI */}
          {showBulkPaste && (
            <div className="bg-blue-50 p-3 rounded mb-3 border border-blue-200 shadow-sm">
              <textarea
                className="w-full border border-blue-200 p-2 text-xs h-28 font-mono mb-2 rounded focus:ring-2 focus:ring-blue-300 outline-none bg-white"
                value={bulkText}
                onChange={(e) => setBulkText(e.target.value)}
                placeholder="Label|Option text..."
                autoFocus
              />
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const lines = bulkText.split("\n").filter((l) => l.trim());
                    const newOpts = lines.map((l, i) => {
                      const parts = l.split("|");
                      return {
                        sequence: normalizedOptions.length + i + 1,
                        label: parts.length > 1 ? parts[0].trim() : "",
                        text: parts.length > 1 ? parts[1].trim() : parts[0].trim(),
                        is_other: false,
                        sub_options: [],
                      };
                    });
                    onChange([...normalizedOptions, ...newOpts]);
                    setShowBulkPaste(false);
                    setBulkText("");
                  }}
                  className="bg-blue-600 text-white text-xs px-3 py-1.5 rounded font-medium"
                >
                  Add {bulkText.split("\n").filter((l) => l.trim()).length} Items
                </button>
                <button type="button" onClick={() => setShowBulkPaste(false)} className="text-xs text-gray-500">Cancel</button>
              </div>
            </div>
          )}

          {/* Option List */}
          <div className="space-y-1">
            {normalizedOptions.map((opt, idx) => {
              const isSelected = selectedIndices.has(idx);
              const isExpanded = expandedIndices.has(idx);
              const canHaveChildren = level < MAX_NESTING_LEVEL;
              const subOptions = opt.sub_options || [];

              return (
                <div key={idx} className={`rounded-md transition-all ${isSelected ? "bg-red-50" : ""}`}>
                  <div className="flex gap-2 items-center p-1 group">
                    
                    {isSelectionMode ? (
                      <button type="button" onClick={() => toggleSelect(idx)} className="text-blue-600 px-1">
                        {isSelected ? <CheckSquare size={18} /> : <Square size={18} />}
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => toggleExpand(idx)}
                        className={`p-1 rounded hover:bg-gray-100 text-gray-400 ${
                          canHaveChildren && subOptions.length > 0 ? "" : "invisible"
                        }`}
                        disabled={!canHaveChildren || subOptions.length === 0}
                      >
                        {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                      </button>
                    )}

                    <span className="text-[10px] font-mono text-gray-400 w-6">{opt.sequence}</span>

                    <Input
                      type="text"
                      placeholder="Label"
                      className="border p-1 rounded text-sm w-28 font-mono"
                      value={opt.label}
                      onChange={(e) => {
                        const newOpts = [...normalizedOptions];
                        newOpts[idx].label = e.target.value;
                        onChange(newOpts);
                      }}
                      disabled={!canEdit}
                    />

                    <Input
                      type="text"
                      placeholder="Option Text"
                      className="border p-1 rounded text-sm flex-1"
                      value={opt.text}
                      onChange={(e) => {
                        const newOpts = [...normalizedOptions];
                        newOpts[idx].text = e.target.value;
                        onChange(newOpts);
                      }}
                      disabled={!canEdit}
                      required
                    />

                    {/* Dependency Selection */}
                    {level === 0 && parentOptions && parentOptions.length > 0 && (
                      <div className="relative">
                        <div className="absolute inset-y-0 left-2 flex items-center pointer-events-none">
                          <Link size={12} className="text-gray-400" />
                        </div>
                        <Select
                          className="border border-gray-300 rounded text-xs pl-6 pr-2 py-1.5 w-32 bg-white"
                          value={opt.dependency_option || ""}
                          onChange={(e) => {
                            const newOpts = [...normalizedOptions];
                            newOpts[idx].dependency_option = e.target.value ? Number(e.target.value) : undefined;
                            onChange(newOpts);
                          }}
                          disabled={!canEdit}
                        >
                          <option value="">-- Parent --</option>
                          {parentOptions.map((pOpt) => (
                            <option key={pOpt.sequence} value={pOpt.sequence}>{pOpt.text || pOpt.label}</option>
                          ))}
                        </Select>
                      </div>
                    )}

                    {!isSelectionMode && canEdit && (
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        {canHaveChildren && (
                          <button
                            type="button"
                            onClick={() => {
                              if (!isExpanded) toggleExpand(idx);
                              const newOpts = [...normalizedOptions];
                              // SEED WITH 2 OPTIONS MINIMUM
                              newOpts[idx].sub_options = [
                                ...subOptions,
                                { sequence: subOptions.length + 1, text: "", label: "", is_other: false, sub_options: [] },
                                { sequence: subOptions.length + 2, text: "", label: "", is_other: false, sub_options: [] },
                              ];
                              onChange(newOpts);
                            }}
                            className="p-1 text-blue-500 hover:bg-blue-100 rounded"
                            title="Add Sub-Options (Min 2)"
                          >
                            <Plus size={14} />
                          </button>
                        )}
                        
                        <button
                          type="button"
                          onClick={() => {
                            if (!isMinOptionsReached) {
                              onChange(normalizedOptions.filter((_, i) => i !== idx));
                            }
                          }}
                          disabled={isMinOptionsReached}
                          className={`p-1 rounded ${isMinOptionsReached ? "text-gray-200 cursor-not-allowed" : "text-red-400 hover:bg-red-50"}`}
                          title={isMinOptionsReached ? "Minimum 2 options required" : "Delete"}
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

          {canEdit && !isSelectionMode && (
            <button
              type="button"
              onClick={() => onChange([...normalizedOptions, { sequence: normalizedOptions.length + 1, text: "", label: "", is_other: false, sub_options: [] }])}
              className="text-xs text-blue-600 flex items-center gap-1 mt-2 hover:bg-blue-50 px-2 py-1 rounded transition-all font-medium"
            >
              <Plus size={14} /> Add Another Option
            </button>
          )}
        </div>
      )}
      
      {/* Visual Indicator for user */}
      {isRootExpanded && isMinOptionsReached && !isSelectionMode && (
         <div className="flex items-center gap-1.5 text-[10px] text-gray-400 mt-1 pl-2">
            <AlertCircle size={10} />
            <span>Minimum 2 options required</span>
         </div>
      )}
    </div>
  );
};