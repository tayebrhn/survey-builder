export interface QuestionCategory {
  cat_number: number;
  name: string;
  name_i18n?: Record<string, string>;
  description_i18n?: Record<string, string>;
}

export interface QuestionOption {
  sequence: number;
  text: string;
  label: string;
  is_other: boolean;
  dependency_option?: number;
  sub_options: QuestionOption[] | [];
  label_i18n?: Record<string, string>;
  text_i18n?: Record<string, string>;
}

export interface KeyChoice {
  key: string;
  description: string;
  description_i18n?: Record<string, string>;
}

export type QuestionType = "multi_select" | "single_choice" | "drop_down" | "rating" | "number" | "text" | "text_area";

export interface SurveyQuestion {
  sequence_num: number;
  q_type: QuestionType;
  question: string;
  category: number;
  placeholder?: string;
  scale?: string;
  depends_on?: number;
  validation_type: string;
  shuffle_options?: boolean;
  default_value?: string | number | string[];
  constraints: {
    hidden: boolean;
    verifiable: boolean;
    is_unique: boolean;
    required: boolean;
    min_length?: number;
    max_length?: number;
  };
  options: QuestionOption[];
  question_i18n?: Record<string, string>;
  placeholder_i18n?: Record<string, string>;
}

export interface SkipLogicRule {
  id: string;
  trigger_question_sn: number | null;
  trigger_options_sn: number[];
  operator: string;
  action: string;
  target_questions_sn: number[];
}
export type Action = "SHOW" | "HIDE";

export interface SurveyExport {
  id?: string;
  has_responses: boolean;
  metadata: {
    title: string;
    description: string;
    instructions: string;
    version: string;
    created: string;
    start: string;
    end: string;
    is_active: boolean;
    language: string;
    is_multilingual?: boolean;
    available_languages?: string[];
    title_i18n?: Record<string, string>;
    description_i18n?: Record<string, string>;
    instructions_i18n?: Record<string, string>;
  };
  skip_logic?: SkipLogicRule[];
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
