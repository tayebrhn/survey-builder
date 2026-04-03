import type {
  SurveyExport,
  SurveyQuestion,
  QuestionOption,
  SkipLogicRule,
} from "..";

import { v4 as uuid } from "uuid";

export const createEmptyRule = (): SkipLogicRule => ({
  id: uuid(), // 🔥 Stable identity
  trigger_question_sn: null,
  operator: "EQUALS",
  trigger_options_sn: [],
  action: "SHOW",
  target_questions_sn: [],
});

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
  q_type: "text",
  question: `Queston #${seq}`,
  placeholder: "",
  category: catId,
  validation_type: "none",
  constraints: {
    hidden: false,
    is_unique: false,
    verifiable: false,
    required: true,
  },
  options: [],
});

export const initialSurveyState: SurveyExport = {
  // id: generateId(),
  has_responses: false,
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
