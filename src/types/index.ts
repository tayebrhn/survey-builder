export interface QuestionCategory {
  cat_number: number;
  name: string;
}

export interface QuestionOption {
  sequence: number;
  text: string;
  label: string;
  is_other: boolean;
  dependency_option?: number;
  sub_options: QuestionOption[] | [];
}

export interface KeyChoice {
  key: string;
  description: string;
}

export type QuestionType = string;

export interface SurveyQuestion {
  sequence_num: number;
  type: QuestionType;
  question: string;
  category: number; // category name
  placeholder?: string;
  scale?: string;
  constraints: {
    hidden:boolean;
    verifiable: boolean;
    required: boolean;
    min_length?: number;
    max_length?: number;
  };
  depends_on?: number;
  options: QuestionOption[];
}

export interface SkipLogicRule {
  trigger_question_sn: number; // Which question triggers the rule
  trigger_options_sn: number[] | number; // Value(s) that trigger the rule
  operator: string;
  action: string;
  target_questions_sn: number[]; // Only for JUMP_TO Action
}
export type Action = "SHOW" | "HIDE" | "JUMP_TO" | "ENABLE" | "REQUIRE";

export interface SurveyExport {
  id?: string;
  metadata: {
    title: string;
    description: string;
    instructions: string;
    version: string;
    created: string; // ISO date string, e.g., "2025-08-12"
    start: string; // Added
    end: string;
    is_active: boolean;
    language: string;
  };
  skip_logic?: SkipLogicRule[]; // Rules where this question is the TARGET
  question_categories?: QuestionCategory[];
  questions: SurveyQuestion[];
  key_choice: KeyChoice[];
}

type QuestionTypeConfig = {
  hasOptions: boolean;
  hasPlaceholder: boolean;
  hasScale: boolean;
  minMaxAllowed: boolean;
};

export const QUESTION_TYPE_CONFIG: Record<QuestionType, QuestionTypeConfig> = {
  multi_select: {
    hasOptions: true,
    hasPlaceholder: false,
    hasScale: false,
    minMaxAllowed: false,
  },
  single_choice: {
    hasOptions: true,
    hasPlaceholder: false,
    hasScale: false,
    minMaxAllowed: false,
  },
  drop_down: {
    hasOptions: true,
    hasPlaceholder: false,
    hasScale: false,
    minMaxAllowed: false,
  },
  rating: {
    hasOptions: false,
    hasPlaceholder: false,
    hasScale: true,
    minMaxAllowed: false,
  },
  number: {
    hasOptions: false,
    hasPlaceholder: false,
    hasScale: false,
    minMaxAllowed: true,
  },
  text: {
    hasOptions: false,
    hasPlaceholder: true,
    hasScale: false,
    minMaxAllowed: true,
  },
  text_area: {
    hasOptions: false,
    hasPlaceholder: true,
    hasScale: false,
    minMaxAllowed: true,
  },
};

export type BuilderQuestion = {
  sequence_num: number;
  type: QuestionType;
  question: string;
  category: number;

  placeholder?: string;
  scale?: string;

  required: boolean;
  verifiable: boolean;
  min_length?: number;
  max_length?: number;

  options: {
    text: string;
    label: string;
    is_other?: boolean;
    sub_options?: BuilderQuestion["options"];
  }[];
};
