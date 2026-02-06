import type { SurveyExport, SurveyQuestion, QuestionOption } from "..";

export const generateId = () => crypto.randomUUID();

export const createEmptyOption = (sequence: number): QuestionOption => ({
  sequence,
  text: "",
  label: "",
  is_other: false,
  sub_options: [],
});

export const createEmptyQuestion = (
  seq: number,
  catId: number,
): SurveyQuestion => ({
  sequence_num: seq,
  type: "",
  question: "",
  category: catId,
  constraints: { verifiable: false, required: true },
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
  questions: [],
  question_categories: [{ cat_number: 1, name: "General" }],
  key_choice: [],
  skip_logic: [],
};

export const MAX_FILE_SIZE_MB = 3;
export const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;
