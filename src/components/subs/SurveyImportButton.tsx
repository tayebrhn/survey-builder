import { Upload } from "lucide-react";
import { toast } from "sonner";
import { useSurveyContext } from "../..";

export const SurveyImportButton = ({ disabled }: { disabled?: boolean }) => {
  const { importSurveyFromJSON } = useSurveyContext();

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      await importSurveyFromJSON(file);
      toast.success("Survey imported successfully");
    } catch (err: any) {
      toast.error(err.message || "Import failed");
    } finally {
      e.target.value = ""; // reset input
    }
  };

  return (
    <>
      <input
        id="survey-import"
        type="file"
        accept=".json"
        className="hidden"
        onChange={handleImport}
        disabled={disabled}
      />

      <label
        htmlFor="survey-import"
        className="cursor-pointer bg-white text-blue-600 px-4 py-2 rounded-lg
                   font-semibold flex items-center gap-2 hover:bg-blue-50"
      >
        <Upload size={18} />
        Import
      </label>
    </>
  );
};
