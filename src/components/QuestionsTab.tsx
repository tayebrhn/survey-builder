import React from "react";
import { Plus } from "lucide-react";
import type { SurveyExport, SurveyQuestion } from "../types";
import { QuestionEditor } from "./QuestionEditor";

interface QuestionsTabProps {
  survey: SurveyExport;
  onAddQuestion: () => void;
  onUpdateQuestion: (index: number, updates: Partial<SurveyQuestion>) => void;
  onDeleteQuestion: (index: number) => void;
}

export const QuestionsTab: React.FC<QuestionsTabProps> = ({
  survey,
  onAddQuestion,
  onUpdateQuestion,
  onDeleteQuestion,
}) => {
  return (
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
        <div className="space-y-4">
          {survey.questions.map((q, idx) => (
            <QuestionEditor
              key={q.sequence_num}
              question={q}
              index={idx}
              categories={survey.question_categories || []}
              questions={survey.questions || []}
              onUpdate={(updates) => onUpdateQuestion(idx, updates)}
              onDelete={() => onDeleteQuestion(idx)}
            />
          ))}
        </div>
      )}
      <div className="flex justify-end">
        <button
          onClick={onAddQuestion}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition"
        >
          <Plus size={18} /> Add Question
        </button>
      </div>
    </div>
  );
};
