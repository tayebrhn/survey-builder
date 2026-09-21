import { useCallback } from "react";
import { Copy, Plus, Trash2 } from "lucide-react";
import { Switch } from "@headlessui/react";
import {
  useSurveyDataContext,
  useSurveyActionsContext,
  useSurveyI18nContext,
  useMetaContext,
} from "..";
import { useDebouncedField } from "../hooks/useDebouncedField";
import { Input, Select, Textarea } from "./forms/FormsComponent";

/* -------------------------------
   Reusable Tailwind styles
-------------------------------- */
const inputBase =
  "w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm " +
  "focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition";

const textareaBase =
  "w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm " +
  "focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition resize-none";

const labelBase =
  "block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1";

export const SettingsTab: React.FC = () => {
  const { survey, setSurvey } = useSurveyDataContext();
  const {
    updateMetadata,
    addCategory,
    updateCategory,
    removeCategory,
    addKeyChoice,
    updateKeyChoice,
    removeKeyChoice,
  } = useSurveyActionsContext();
  const {
    editingLanguage,
    setEditingLanguage,
    getI18nValue,
    setI18nValue,
    getTranslationCompleteness,
  } = useSurveyI18nContext();

  const canRemoveCategory = (survey?.question_categories?.length ?? 0) > 1;
  const { meta } = useMetaContext();
  const hasRes = survey.has_responses;

  const languages = meta?.languages || [];
  const isMultilingual = survey.metadata.is_multilingual ?? false;
  const availableLanguages = survey.metadata.available_languages || [
    survey.metadata.language || "en",
  ];
  const baseLang = survey.metadata.language || "en";
  const isTranslating = editingLanguage !== baseLang;

  const handleMultilingualToggle = useCallback(
    (checked: boolean) => {
      updateMetadata("is_multilingual", checked);
      if (checked) {
        const lang = survey.metadata.language || "en";
        updateMetadata(
          "available_languages",
          availableLanguages.includes(lang)
            ? availableLanguages
            : [...availableLanguages, lang],
        );
      }
    },
    [updateMetadata, survey.metadata.language, availableLanguages],
  );

  const toggleAvailableLanguage = useCallback(
    (code: string) => {
      const current = availableLanguages;
      const next = current.includes(code)
        ? current.filter((c) => c !== code)
        : [...current, code];
      if (next.length === 0) return;
      updateMetadata("available_languages", next);
    },
    [availableLanguages, updateMetadata],
  );

  const titleField = useDebouncedField(
    getI18nValue(survey.metadata.title_i18n, survey.metadata.title),
    useCallback(
      (val: string) => {
        updateMetadata("title", isTranslating ? survey.metadata.title : val);
        updateMetadata("title_i18n", setI18nValue(survey.metadata.title_i18n, val));
      },
      [updateMetadata, isTranslating, survey.metadata.title, survey.metadata.title_i18n, setI18nValue],
    ),
  );

  const descriptionField = useDebouncedField(
    getI18nValue(survey.metadata.description_i18n, survey.metadata.description),
    useCallback(
      (val: string) => {
        updateMetadata("description", isTranslating ? survey.metadata.description : val);
        updateMetadata("description_i18n", setI18nValue(survey.metadata.description_i18n, val));
      },
      [updateMetadata, isTranslating, survey.metadata.description, survey.metadata.description_i18n, setI18nValue],
    ),
  );

  const versionField = useDebouncedField(
    survey.metadata.version,
    useCallback((val: string) => updateMetadata("version", val), [updateMetadata]),
  );

  return (
    <div className="space-y-6">
      {/* ================= Metadata ================= */}
      <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <h3 className="text-lg font-bold text-gray-800 mb-4">
          Survey Metadata
        </h3>

        <div className="space-y-4">
          <div>
            <label className={labelBase}>Title</label>
            <div className="flex items-center gap-1">
              <Input
                type="text"
                className={inputBase}
                value={titleField.value}
                onChange={(e) => titleField.onChange(e.target.value)}
              />
              {isTranslating && !survey.metadata.title_i18n?.[editingLanguage] && (
                <button
                  type="button"
                  onClick={() =>
                    updateMetadata("title_i18n", {
                      ...(survey.metadata.title_i18n || {}),
                      [editingLanguage]: survey.metadata.title,
                    })
                  }
                  title="Copy from base language"
                  className="p-1 text-gray-400 hover:text-indigo-600 transition shrink-0"
                >
                  <Copy size={14} />
                </button>
              )}
            </div>
          </div>

          <div>
            <label className={labelBase}>Description</label>
            <div className="flex items-start gap-1">
              <Textarea
                name="description"
                rows={3}
                className={textareaBase}
                value={descriptionField.value}
                onChange={(e) => descriptionField.onChange(e.target.value)}
              />
              {isTranslating && !survey.metadata.description_i18n?.[editingLanguage] && (
                <button
                  type="button"
                  onClick={() =>
                    updateMetadata("description_i18n", {
                      ...(survey.metadata.description_i18n || {}),
                      [editingLanguage]: survey.metadata.description,
                    })
                  }
                  title="Copy from base language"
                  className="p-1 text-gray-400 hover:text-indigo-600 transition shrink-0 mt-2"
                >
                  <Copy size={14} />
                </button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={labelBase}>Version</label>
              <Input
                type="text"
                className={inputBase}
                value={versionField.value}
                onChange={(e) => versionField.onChange(e.target.value)}
              />
            </div>

            <div>
              <label className={labelBase}>Language</label>
              <Select
                value={survey.metadata.language}
                onChange={(e) => updateMetadata("language", e.target.value)}
              >
                <option value="">Select language</option>
                {languages.map((lang) => (
                  <option key={lang.value} value={lang.value}>
                    {lang.label}
                  </option>
                ))}
              </Select>
            </div>
          </div>
        </div>
      </section>

      {/* ================= Multilingual ================= */}
      <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between gap-4 mb-4">
          <div>
            <label className="text-sm font-medium text-gray-800">
              Multilingual Mode
            </label>
            <p className="text-xs text-gray-500">
              Allow survey content in multiple languages
            </p>
          </div>
          <Switch
            checked={isMultilingual}
            onChange={handleMultilingualToggle}
            className={`${
              isMultilingual ? "bg-indigo-600" : "bg-gray-300"
            } relative inline-flex h-6 w-11 items-center rounded-full transition`}
          >
            <span
              className={`${
                isMultilingual ? "translate-x-6" : "translate-x-1"
              } inline-block h-4 w-4 transform rounded-full bg-white transition`}
            />
          </Switch>
        </div>

        {isMultilingual && (
          <div className="space-y-3">
            <div>
              <label className={labelBase}>Available Languages</label>
              <div className="flex flex-wrap gap-2 mt-1">
                {languages.map((lang) => {
                  const isBase = lang.value === baseLang;
                  const { total, translated } = getTranslationCompleteness(
                    lang.value,
                  );
                  const pct =
                    total > 0 ? Math.round((translated / total) * 100) : 0;
                  return (
                    <button
                      key={lang.value}
                      type="button"
                      onClick={() => toggleAvailableLanguage(lang.value)}
                      className={`px-3 py-1 rounded-full text-sm font-medium transition ${
                        availableLanguages.includes(lang.value)
                          ? "bg-indigo-600 text-white"
                          : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                      }`}
                    >
                      {lang.label}
                      {isMultilingual &&
                        !isBase &&
                        availableLanguages.includes(lang.value) && (
                          <span
                            className={`ml-1 text-xs ${
                              availableLanguages.includes(lang.value)
                                ? "opacity-80"
                                : ""
                            }`}
                          >
                            {pct}%
                          </span>
                        )}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className={labelBase}>Editing Language</label>
              <Select
                value={editingLanguage}
                onChange={(e) => setEditingLanguage(e.target.value)}
              >
                {languages
                  .filter((l) => availableLanguages.includes(l.value))
                  .map((lang) => (
                    <option key={lang.value} value={lang.value}>
                      {lang.label}
                    </option>
                  ))}
              </Select>
              <p className="text-xs text-gray-400 mt-1">
                Text you type will be saved for the selected language
              </p>
            </div>
          </div>
        )}
      </section>

      {/* is active*/}
      <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between gap-4">
          <div>
            <label className="text-sm font-medium text-gray-800">
              Is survey active?
            </label>
            <p className="text-xs text-gray-500">
              Inactive surveys cannot be filled by respondents
            </p>
          </div>

          <Switch
            checked={survey.metadata.is_active}
            onChange={(checked) => updateMetadata("is_active", checked)}
            className={`${
              survey.metadata.is_active ? "bg-indigo-600" : "bg-gray-300"
            } relative inline-flex h-6 w-11 items-center rounded-full transition`}
          >
            <span
              className={`${
                survey.metadata.is_active ? "translate-x-6" : "translate-x-1"
              } inline-block h-4 w-4 transform rounded-full bg-white transition`}
            />
          </Switch>
        </div>
      </section>
      {/* date*/}
      <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Start Date
            </label>
            <Input
              type="date"
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
              value={survey.metadata.start}
              onChange={(e) => updateMetadata("start", e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              End Date (Optional)
            </label>
            <Input
              type="date"
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
              value={survey.metadata.end}
              onChange={(e) => updateMetadata("end", e.target.value)}
            />
          </div>
        </div>
      </section>
      {/* ================= Categories ================= */}
      {hasRes || (
        <>
          <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-gray-800">
                Question Categories
              </h3>

              <button
                type="button"
                onClick={addCategory}
                className="inline-flex items-center gap-2 px-3 py-2 rounded-lg
                       bg-indigo-600 text-white text-sm font-medium
                       hover:bg-indigo-700 transition"
              >
                <Plus size={16} />
                Add Category
              </button>
            </div>

            <div className="space-y-3">
              {survey?.question_categories?.map((cat, idx) => (
                <CategoryRow
                  key={cat.cat_number}
                  cat={cat}
                  idx={idx}
                  isTranslating={isTranslating}
                  editingLanguage={editingLanguage}
                  baseLang={baseLang}
                  canRemove={canRemoveCategory}
                  onUpdate={(name) => updateCategory(idx, name)}
                  onRemove={() => removeCategory(idx)}
                  onCopyI18n={() => {
                    const newCats = [...(survey.question_categories || [])];
                    newCats[idx] = {
                      ...newCats[idx],
                      name_i18n: {
                        ...(cat.name_i18n || {}),
                        [editingLanguage]: cat.name,
                      },
                    };
                    setSurvey({ ...survey, question_categories: newCats });
                  }}
                  onI18nChange={(val) => {
                    const newCats = [...(survey.question_categories || [])];
                    newCats[idx] = {
                      ...newCats[idx],
                      name_i18n: setI18nValue(newCats[idx].name_i18n, val),
                    };
                    setSurvey({ ...survey, question_categories: newCats });
                  }}
                  getI18nValue={getI18nValue}
                  setI18nValue={setI18nValue}
                />
              ))}
            </div>

            {!canRemoveCategory && (
              <p className="text-xs text-gray-400 mt-2">
                At least one category is required.
              </p>
            )}
          </section>
          <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="flex justify-between items-end mb-4">
              <h3 className="text-lg font-bold text-gray-800">Key Choices</h3>
            </div>

            <div className="space-y-3">
              {survey.key_choice.length === 0 && (
                <p className="text-sm text-gray-400 italic">
                  No key choices defined.
                </p>
              )}

              {survey.key_choice.map((choice, idx) => (
                <KeyChoiceRow
                  key={idx}
                  choice={choice}
                  idx={idx}
                  isTranslating={isTranslating}
                  editingLanguage={editingLanguage}
                  onRemove={() => removeKeyChoice(idx)}
                  onKeyChange={(val) => updateKeyChoice(idx, "key", val)}
                  onCopyI18n={() => {
                    const newChoices = [...survey.key_choice];
                    newChoices[idx] = {
                      ...newChoices[idx],
                      description_i18n: {
                        ...(choice.description_i18n || {}),
                        [editingLanguage]: choice.description,
                      },
                    };
                    setSurvey({ ...survey, key_choice: newChoices });
                  }}
                  onI18nChange={(val) => {
                    const newChoices = [...survey.key_choice];
                    newChoices[idx] = {
                      ...newChoices[idx],
                      description_i18n: setI18nValue(
                        newChoices[idx].description_i18n,
                        val,
                      ),
                    };
                    setSurvey({ ...survey, key_choice: newChoices });
                  }}
                  onDescriptionChange={(val) =>
                    updateKeyChoice(idx, "description", val)
                  }
                  getI18nValue={getI18nValue}
                />
              ))}

              <button
                type="button"
                onClick={addKeyChoice}
                className="inline-flex items-center gap-2 text-sm
                       text-indigo-600 hover:underline mt-2"
              >
                <Plus size={16} />
                Add Key Choice
              </button>
            </div>
          </section>
        </>
      )}
    </div>
  );
};

/* ---------- Sub-components to prevent unnecessary re-renders ---------- */

const CategoryRow: React.FC<{
  cat: { cat_number: number; name: string; name_i18n?: Record<string, string> };
  idx: number;
  isTranslating: boolean;
  editingLanguage: string;
  baseLang: string;
  canRemove: boolean;
  onUpdate: (name: string) => void;
  onRemove: () => void;
  onCopyI18n: () => void;
  onI18nChange: (val: string) => void;
  getI18nValue: (map: Record<string, string> | undefined, fallback: string) => string;
  setI18nValue: (map: Record<string, string> | undefined, value: string) => Record<string, string>;
}> = React.memo(({ cat, idx, isTranslating, editingLanguage, canRemove, onUpdate, onRemove, onCopyI18n, onI18nChange, getI18nValue }) => {
  const nameField = useDebouncedField(
    getI18nValue(cat.name_i18n, cat.name),
    useCallback((val: string) => {
      if (!isTranslating) onUpdate(val);
    }, [isTranslating, onUpdate]),
  );

  return (
    <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 border border-gray-200">
      <span className="inline-flex items-center justify-center w-12 h-8 rounded-md bg-indigo-100 text-indigo-700 text-sm font-bold shrink-0">
        #{cat.cat_number}
      </span>
      <Input
        type="text"
        className={inputBase}
        value={nameField.value}
        onChange={(e) => nameField.onChange(e.target.value)}
      />
      {isTranslating && !cat.name_i18n?.[editingLanguage] && (
        <button
          type="button"
          onClick={onCopyI18n}
          title="Copy from base language"
          className="p-1 text-gray-400 hover:text-indigo-600 transition shrink-0"
        >
          <Copy size={14} />
        </button>
      )}
      {canRemove && (
        <button
          type="button"
          onClick={onRemove}
          title="Remove category"
          className="p-2 rounded-md text-gray-400 hover:text-red-600 hover:bg-red-50 transition"
        >
          <Trash2 size={18} />
        </button>
      )}
    </div>
  );
});

const KeyChoiceRow: React.FC<{
  choice: { key: string; description: string; description_i18n?: Record<string, string> };
  idx: number;
  isTranslating: boolean;
  editingLanguage: string;
  onRemove: () => void;
  onKeyChange: (val: string) => void;
  onCopyI18n: () => void;
  onI18nChange: (val: string) => void;
  onDescriptionChange: (val: string) => void;
  getI18nValue: (map: Record<string, string> | undefined, fallback: string) => string;
}> = React.memo(({ choice, idx, isTranslating, editingLanguage, onRemove, onKeyChange, onCopyI18n, onI18nChange, onDescriptionChange, getI18nValue }) => {
  const keyField = useDebouncedField(
    choice.key,
    useCallback((val: string) => onKeyChange(val), [onKeyChange]),
  );

  const descField = useDebouncedField(
    getI18nValue(choice.description_i18n, choice.description),
    useCallback((val: string) => {
      if (!isTranslating) onDescriptionChange(val);
    }, [isTranslating, onDescriptionChange]),
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-[1fr_2fr_auto] gap-3 items-end p-4 rounded-lg border border-gray-200 bg-gray-50">
      <div>
        <label className={labelBase}>Key</label>
        <input
          className={`${inputBase} font-mono`}
          value={keyField.value}
          onChange={(e) => keyField.onChange(e.target.value)}
        />
      </div>

      <div>
        <label className={labelBase}>Label</label>
        <div className="flex items-center gap-1">
          <Input
            className={inputBase}
            value={descField.value}
            onChange={(e) => descField.onChange(e.target.value)}
            required={false}
          />
          {isTranslating && !choice.description_i18n?.[editingLanguage] && (
            <button
              type="button"
              onClick={onCopyI18n}
              title="Copy from base language"
              className="p-1 text-gray-400 hover:text-indigo-600 transition shrink-0"
            >
              <Copy size={14} />
            </button>
          )}
        </div>
      </div>
      <button
        type="button"
        onClick={onRemove}
        title="Remove key choice"
        className="p-2 rounded-md text-gray-400 hover:text-red-600 hover:bg-red-50 transition"
      >
        <Trash2 size={18} />
      </button>
    </div>
  );
});
