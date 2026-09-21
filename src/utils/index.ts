import type { SkipLogicRule, SurveyExport } from "..";
import { v4 as uuid } from "uuid";

export const getCSRFToken = () => {
  return document.cookie
    .split("; ")
    .find((row) => row.startsWith("csrftoken="))
    ?.split("=")[1];
};

export const validateRule = (rule: SkipLogicRule) => {
  if (rule.trigger_question_sn == null) return "Trigger question required";
  if (!rule.operator) return "Condition required";
  if (!rule.trigger_options_sn?.length)
    return "At least one answer must be selected";
  if (!rule.target_questions_sn.length)
    return "At least one target question required";

  return null;
};

export const normalizeRule = (rule: Partial<SkipLogicRule>): SkipLogicRule => {
  return {
    ...rule, // spread first
    id: rule.id ?? uuid(), // then enforce
    trigger_question_sn:
      typeof rule.trigger_question_sn === "number"
        ? rule.trigger_question_sn
        : null,
    operator: rule.operator ?? "EQUALS",
    action: rule.action ?? "SHOW",
    trigger_options_sn: Array.isArray(rule.trigger_options_sn)
      ? rule.trigger_options_sn.map(Number).filter((v) => !Number.isNaN(v))
      : [],
    target_questions_sn: Array.isArray(rule.target_questions_sn)
      ? rule.target_questions_sn.map(Number).filter((v) => !Number.isNaN(v))
      : [],
  };
};
const normalizeSkipLogic = (
  input?: Partial<SkipLogicRule> | Partial<SkipLogicRule>[] | null,
): SkipLogicRule[] => {
  if (!input) return [];

  if (Array.isArray(input)) {
    return input.map((rule) => normalizeRule(rule));
  }

  // single rule passed accidentally
  return [normalizeRule(input)];
};

export const sanitizeSurvey = (
  survey: SurveyExport,
): SurveyExport => {
  return {
    ...survey,

    id: undefined,
    has_responses: survey.has_responses ?? false,
    metadata: {
      ...survey.metadata,
      is_active: survey.metadata.is_active ?? false,
      is_multilingual: survey.metadata.is_multilingual ?? false,
      available_languages: survey.metadata.available_languages ?? [survey.metadata.language ?? "en"],
      created: survey.metadata.created || new Date().toISOString(),
      version: survey.metadata?.version ?? "v.1.0",
      title_i18n: survey.metadata.title_i18n ?? undefined,
      description_i18n: survey.metadata.description_i18n ?? undefined,
      instructions_i18n: survey.metadata.instructions_i18n ?? undefined,
    },

    question_categories: (survey.question_categories ?? []).map((cat) => ({
      ...cat,
      name_i18n: cat.name_i18n ?? undefined,
      description_i18n: cat.description_i18n ?? undefined,
    })),
    questions: survey.questions.map((q, qIndex) => ({
      ...q,
      sequence_num: qIndex + 1,
      constraints: { ...q.constraints, hidden: q.constraints.hidden || false },
      question_i18n: q.question_i18n ?? undefined,
      placeholder_i18n: q.placeholder_i18n ?? undefined,
      options: Array.isArray(q.options)
        ? q.options.map((opt, opIndex) => {
            const currentOptSequence = opIndex + 1;

            return {
              ...opt,
              sequence: currentOptSequence,
              label_i18n: opt.label_i18n ?? undefined,
              text_i18n: opt.text_i18n ?? undefined,

              sub_options: Array.isArray(opt.sub_options)
                ? opt.sub_options.map((sub, subIndex) => {
                    const currentSubSequence = subIndex + 1;

                    return {
                      ...sub,
                      sequence: currentSubSequence,
                      label_i18n: sub.label_i18n ?? undefined,
                      text_i18n: sub.text_i18n ?? undefined,
                    };
                  })
                : [],
            };
          })
        : [],
    })),
    key_choice: (survey.key_choice ?? []).map((kc) => ({
      ...kc,
      description_i18n: kc.description_i18n ?? undefined,
    })),
    skip_logic: normalizeSkipLogic(survey.skip_logic),
  };
};
