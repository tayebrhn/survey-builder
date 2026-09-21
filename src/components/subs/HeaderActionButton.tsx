import { Loader } from "lucide-react";

type HeaderActionButtonProps = {
  onClick?: () => void;
  disabled: boolean;
  loading?: boolean;
  icon: React.ReactNode;
  label: string;
  type: "button"|"submit";
  loadingLabel?: string;
};

export const HeaderActionButton = ({
  onClick,
  disabled,
  loading,
  icon,
  label,
  type,
  loadingLabel = label,
}: HeaderActionButtonProps) => (
  <button
    type={type}
    onClick={onClick}
    disabled={disabled}
    className={`px-4 py-2 rounded-lg font-semibold flex items-center gap-2 transition
      ${
        disabled
          ? "bg-gray-400 cursor-not-allowed text-white"
          : "bg-white text-blue-600 hover:bg-blue-50"
      }`}
  >
    {loading ? (
      <>
        <Loader className="animate-spin h-4 w-4" />
        {loadingLabel}
      </>
    ) : (
      <>
        {icon}
        {label}
      </>
    )}
  </button>
);
