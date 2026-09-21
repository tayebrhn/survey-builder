import { Copy, Plus, Trash2 } from "lucide-react";
import { Switch } from "@headlessui/react";
import { useSurveyContext, useMetaContext } from "..";
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
  const {
    survey,
    setSurvey,
    updateMetadata,
    addCategory,
    updateCategory,
    removeCategory,
    addKeyChoice,
    updateKeyChoice,
    removeKeyChoice,
    editingLanguage,
    setEditingLanguage,
    getI18nValue,
    setI18nValue,
    getTranslationCompleteness,
  } = useSurveyContext();
  const canRemoveCategory = (survey?.question_categories?.length ?? 0) > 1;
  const { meta } = useMetaContext();
  const hasRes = survey.has_responses;

  const languages = meta?.languages || [];
  const isMultilingual = survey.metadata.is_multilingual ?? false;
  const availableLanguages = survey.metadata.available_languages || [survey.metadata.language || "en"];

  const handleMultilingualToggle = (checked: boolean) => {
    updateMetadata("is_multilingual", checked);
    if (checked) {
      const lang = survey.metadata.language || "en";
      updateMetadata("available_languages", availableLanguages.includes(lang) ? availableLanguages : [...availableLanguages, lang]);
    }
  };

  const toggleAvailableLanguage = (code: string) => {
    const current = availableLanguages;
    const next = current.includes(code)
      ? current.filter((c) => c !== code)
      : [...current, code];
    if (next.length === 0) return;
    updateMetadata("available_languages", next);
  };

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
                value={getI18nValue(survey.metadata.title_i18n, survey.metadata.title)}
                onChange={(e) => {
                  const val = e.target.value;
                  updateMetadata("title", editingLanguage === (survey.metadata.language || "en") ? val : survey.metadata.title);
                  updateMetadata("title_i18n", setI18nValue(survey.metadata.title_i18n, val));
                }}
              />
              {editingLanguage !== (survey.metadata.language || "en") && !survey.metadata.title_i18n?.[editingLanguage] && (
                <button
                  type="button"
                  onClick={() => updateMetadata("title_i18n", { ...(survey.metadata.title_i18n || {}), [editingLanguage]: survey.metadata.title })}
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
                value={getI18nValue(survey.metadata.description_i18n, survey.metadata.description)}
                onChange={(e) => {
                  const val = e.target.value;
                  updateMetadata("description", editingLanguage === (survey.metadata.language || "en") ? val : survey.metadata.description);
                  updateMetadata("description_i18n", setI18nValue(survey.metadata.description_i18n, val));
                }}
              />
              {editingLanguage !== (survey.metadata.language || "en") && !survey.metadata.description_i18n?.[editingLanguage] && (
                <button
                  type="button"
                  onClick={() => updateMetadata("description_i18n", { ...(survey.metadata.description_i18n || {}), [editingLanguage]: survey.metadata.description })}
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
                value={survey.metadata.version}
                onChange={(e) => updateMetadata("version", e.target.value)}
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
                  const isBase = lang.value === (survey.metadata.language || "en");
                  const { total, translated } = getTranslationCompleteness(lang.value);
                  const pct = total > 0 ? Math.round((translated / total) * 100) : 0;
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
                      {isMultilingual && !isBase && availableLanguages.includes(lang.value) && (
                        <span className={`ml-1 text-xs ${availableLanguages.includes(lang.value) ? "opacity-80" : ""}`}>
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
                <div
                  key={cat.cat_number}
                  className="flex items-center gap-3 p-3 rounded-lg
                         bg-gray-50 border border-gray-200"
                >
                  <span
                    className="inline-flex items-center justify-center
                           w-12 h-8 rounded-md bg-indigo-100
                           text-indigo-700 text-sm font-bold shrink-0"
                  >
                    #{cat.cat_number}
                  </span>
                  <Input
                    type="text"
                    className={inputBase}
                    value={getI18nValue(cat.name_i18n, cat.name)}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (editingLanguage === (survey.metadata.language || "en")) {
                        updateCategory(idx, val);
                      }
                      const newCats = [...(survey.question_categories || [])];
                      newCats[idx] = { ...newCats[idx], name_i18n: setI18nValue(newCats[idx].name_i18n, val) };
                      setSurvey({ ...survey, question_categories: newCats });
                    }}
                  />
                  {editingLanguage !== (survey.metadata.language || "en") && !cat.name_i18n?.[editingLanguage] && (
                    <button
                      type="button"
                      onClick={() => {
                        const newCats = [...(survey.question_categories || [])];
                        newCats[idx] = { ...newCats[idx], name_i18n: { ...(cat.name_i18n || {}), [editingLanguage]: cat.name } };
                        setSurvey({ ...survey, question_categories: newCats });
                      }}
                      title="Copy from base language"
                      className="p-1 text-gray-400 hover:text-indigo-600 transition shrink-0"
                    >
                      <Copy size={14} />
                    </button>
                  )}
                  {canRemoveCategory && (
                  <button
                    type="button"
                    onClick={() => removeCategory(idx)}
                    title="Remove category"
                    className="p-2 rounded-md text-gray-400
                             hover:text-red-600 hover:bg-red-50 transition"
                  >
                    <Trash2 size={18} />
                  </button>
                  )}
                </div>
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
                <div
                  key={idx}
                  className="grid grid-cols-1 md:grid-cols-[1fr_2fr_auto]
                         gap-3 items-end p-4 rounded-lg
                         border border-gray-200 bg-gray-50"
                >
                  <div>
                    <label className={labelBase}>Key</label>
                    <input
                      className={`${inputBase} font-mono`}
                      value={choice.key}
                      onChange={(e) =>
                        updateKeyChoice(idx, "key", e.target.value)
                      }
                    />
                  </div>

                  <div>
                    <label className={labelBase}>Label</label>
                    <div className="flex items-center gap-1">
                      <Input
                        className={inputBase}
                        value={getI18nValue(choice.description_i18n, choice.description)}
                        onChange={(e) => {
                          const val = e.target.value;
                          if (editingLanguage === (survey.metadata.language || "en")) {
                            updateKeyChoice(idx, "description", val);
                          }
                          const newChoices = [...survey.key_choice];
                          newChoices[idx] = { ...newChoices[idx], description_i18n: setI18nValue(newChoices[idx].description_i18n, val) };
                          setSurvey({ ...survey, key_choice: newChoices });
                        }}
                        required={false}
                      />
                      {editingLanguage !== (survey.metadata.language || "en") && !choice.description_i18n?.[editingLanguage] && (
                        <button
                          type="button"
                          onClick={() => {
                            const newChoices = [...survey.key_choice];
                            newChoices[idx] = { ...newChoices[idx], description_i18n: { ...(choice.description_i18n || {}), [editingLanguage]: choice.description } };
                            setSurvey({ ...survey, key_choice: newChoices });
                          }}
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
                    onClick={() => removeKeyChoice(idx)}
                    title="Remove key choice"
                    className="p-2 rounded-md text-gray-400
                           hover:text-red-600 hover:bg-red-50 transition"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
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
