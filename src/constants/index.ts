import type { SurveyExport, SurveyQuestion, QuestionOption } from "..";

export const generateId = () => crypto.randomUUID();

export const createEmptyOption = (sequence: number): QuestionOption => ({
  sequence,
  text: `Option ${sequence}`,
  label: `op-${sequence}`,
  is_other: false,
  sub_options: [],
});

export const createEmptyQuestion = (
  seq: number,
  catId: number,
): SurveyQuestion => ({
  sequence_num: seq,
  type: "text",
  question: `Queston #${seq}`,
  placeholder: "",
  category: catId,
  constraints: { hidden: false, verifiable: false, required: true },
  options: [],
});

export const initialSurveyState: SurveyExport = {
  // id: generateId(),
  metadata: {
    title: "Untitled Survey",
    description: "",
    instructions: "",
    version: "1.0",
    created: new Date().toISOString().split("T")[0],
    start: "", // Initialized
    end: "", // Initialized
    is_active: false,
    language: "en",
  },
  questions: [createEmptyQuestion(1, 1)],
  question_categories: [{ cat_number: 1, name: "General" }],
  key_choice: [],
  skip_logic: [],
};

export const MAX_FILE_SIZE_MB = 3;
export const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;
