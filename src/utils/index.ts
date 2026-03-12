import type { SkipLogicRule, SurveyExport } from "..";
import { v4 as uuid } from "uuid";

export const getCSRFToken = () => {
  return document.cookie
    .split("; ")
    .find((row) => row.startsWith("csrftoken="))
    ?.split("=")[1];
};

export const validateRule = (rule: SkipLogicRule) => {
  if (!rule.trigger_question_sn) return "Trigger question required";
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

const incrementVersion = (
  version?: string | null,
  type: "major" | "minor" | "patch" = "patch",
): string => {
  if (!version) return "1.0.0";

  let [major = 1, minor = 0, patch = 0] = version.split(".").map(Number);

  if ([major, minor, patch].some(Number.isNaN)) {
    return "1.0.0";
  }

  switch (type) {
    case "major":
      major++;
      minor = 0;
      patch = 0;
      break;

    case "minor":
      minor++;
      patch = 0;
      break;

    case "patch":
      patch++;

      // rollover patch at 9
      if (patch > 9) {
        patch = 0;
        minor++;
      }

      // rollover minor at 9
      if (minor > 9) {
        minor = 0;
        major++;
      }
      break;
  }

  return `${major}.${minor}.${patch}`;
};

export const sanitizeSurvey = (
  survey: SurveyExport,
  editSurv: boolean,
): SurveyExport => {
  // let optionSequence = 1; // 🔥 shared counter for options + suboptions
  return {
    ...survey,

    id: undefined,

    metadata: {
      ...survey.metadata,
      is_active: survey.metadata.is_active ?? false,
      created: new Date().toISOString(),
      version: editSurv
        ? survey.metadata?.version
        : incrementVersion(survey.metadata?.version),
    },
    question_categories: survey.question_categories ?? [],
    questions: survey.questions.map((q, qIndex) => ({
      ...q,
      sequence_num: ++qIndex,
      constraints: { ...q.constraints, hidden: q.constraints.hidden || false },
      options: Array.isArray(q.options)
        ? q.options.map((opt, opIndex) => {
            const currentOptSequence = ++opIndex;

            return {
              ...opt,
              sequence: currentOptSequence,

              sub_options: Array.isArray(opt.sub_options)
                ? opt.sub_options.map((sub, subIndex) => {
                    const currentSubSequence = ++subIndex;

                    return {
                      ...sub,
                      sequence: currentSubSequence,
                    };
                  })
                : [],
            };
          })
        : [],
    })),
    key_choice: survey.key_choice ?? [],
    skip_logic: normalizeSkipLogic(survey.skip_logic),
  };
};
