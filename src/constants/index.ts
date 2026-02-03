import type { SurveyExport, SurveyQuestion, QuestionOption } from "../types";
import { QUESTION_TYPE } from "../types";

export const generateId = () => Math.random().toString(36).substr(2, 9);

export const createEmptyOption = (sequence: number): QuestionOption => ({
  sequence,
  text: "",
  label: "",
  is_other: false,
  sub_options: [],
});

export const createEmptyQuestion = (
  seq: number,
  catId: number
): SurveyQuestion => ({
  sequence_num: seq,
  type: QUESTION_TYPE.TEXT,
  question: "",
  category: catId,
  constraints: { verifiable: false, required: true },
  options: [],
});

export const initialSurveyState: SurveyExport = {
  id: generateId(),
  metadata: {
    title: "Untitled Survey",
    description: "",
    instructions: "",
    version: "1.0",
    created: new Date().toISOString().split("T")[0],
    language: "en",
  },
  questions: [],
  question_categories: [{ cat_number: 1, name: "General" }],
  key_choice: [],
  skip_logic: [],
};
