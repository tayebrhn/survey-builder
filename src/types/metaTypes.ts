export type Choice = {
  value: string;
  label: string;
};

export type QuestionTypeMeta = {
  value: string;
  label: string;
  has_options: boolean;
  has_plh: boolean;
  max_options?: number;
};

export type MetaResponse = {
  languages: Choice[];
  question_types: QuestionTypeMeta[];
  skip_logic: {
    conditions: Choice[];
    actions: Choice[];
  };
  validation_type: Choice[]
};

