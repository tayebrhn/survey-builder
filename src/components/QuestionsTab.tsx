import React, { useMemo, useCallback } from "react";
import { Plus } from "lucide-react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useVirtualizer } from "@tanstack/react-virtual";
import { QuestionEditor } from "./subs/QuestionEditor";
import { useSurveyDataContext, useSurveyActionsContext } from "..";

const VIRTUALIZATION_THRESHOLD = 20;

export const QuestionsTab: React.FC = () => {
  const { survey } = useSurveyDataContext();
  const {
    addQuestion,
    updateQuestion,
    deleteQuestion,
    duplicateQuestion,
    reorderQuestions,
  } = useSurveyActionsContext();
  const hasRes = survey.has_responses;

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      if (!over || active.id === over.id) return;

      const oldIndex = survey.questions.findIndex(
        (q) => q.sequence_num === active.id,
      );
      const newIndex = survey.questions.findIndex(
        (q) => q.sequence_num === over.id,
      );
      if (oldIndex !== -1 && newIndex !== -1) {
        reorderQuestions(oldIndex, newIndex);
      }
    },
    [survey.questions, reorderQuestions],
  );

  const sortItems = useMemo(
    () => survey.questions.map((q) => q.sequence_num),
    [survey.questions],
  );

  const parentRef = React.useRef<HTMLDivElement>(null);
  const useVirtual = survey.questions.length > VIRTUALIZATION_THRESHOLD;

  const virtualizer = useVirtualizer({
    count: survey.questions.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 280,
    overscan: 5,
    enabled: useVirtual,
  });

  const renderQuestion = useCallback(
    (idx: number) => {
      const q = survey.questions[idx];
      return (
        <QuestionEditor
          key={q.sequence_num}
          question={q}
          index={idx}
          categories={survey.question_categories || []}
          questions={survey.questions || []}
          onUpdate={(updates) => updateQuestion(idx, updates)}
          onDelete={() => deleteQuestion(idx)}
          onDuplicate={() => duplicateQuestion(idx)}
        />
      );
    },
    [survey, updateQuestion, deleteQuestion, duplicateQuestion],
  );

  return (
    hasRes || (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-bold text-gray-800">
            Survey Questions ({survey.questions.length})
          </h3>
        </div>
        {survey.questions.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <p className="text-lg mb-2">No questions yet</p>
            <p className="text-sm">Click "Add Question" to get started</p>
          </div>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={sortItems}
              strategy={verticalListSortingStrategy}
            >
              {useVirtual ? (
                <div
                  ref={parentRef}
                  className="space-y-4 overflow-auto"
                  style={{ height: "calc(100vh - 280px)" }}
                >
                  <div
                    style={{
                      height: `${virtualizer.getTotalSize()}px`,
                      width: "100%",
                      position: "relative",
                    }}
                  >
                    {virtualizer.getVirtualItems().map((virtualRow) => (
                      <div
                        key={virtualRow.key}
                        style={{
                          position: "absolute",
                          top: 0,
                          left: 0,
                          width: "100%",
                          transform: `translateY(${virtualRow.start}px)`,
                        }}
                      >
                        {renderQuestion(virtualRow.index)}
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {survey.questions.map((_, idx) => renderQuestion(idx))}
                </div>
              )}
            </SortableContext>
          </DndContext>
        )}
        <div className="flex justify-end">
          <button
            type="button"
            onClick={addQuestion}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition"
          >
            <Plus size={18} /> Add Question
          </button>
        </div>
      </div>
    )
  );
};
