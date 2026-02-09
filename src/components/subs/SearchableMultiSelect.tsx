import { Fragment, useState } from "react";
import {
  Combobox,
  ComboboxButton,
  ComboboxInput,
  ComboboxOption,
  ComboboxOptions,
} from "@headlessui/react";
import { Check, ChevronDown } from "lucide-react";

interface Option {
  value: number;
  label: string;
}

interface Props {
  options: Option[];
  value: number | number[];
  onChange: (values: number[]) => void;
  placeholder?: string;
  disabled?: boolean;
}

export const SearchableMultiSelect: React.FC<Props> = ({
  options,
  value,
  onChange,
  placeholder = "Select options...",
  disabled,
}) => {
  const [query, setQuery] = useState("");
  const filtered =
    query === ""
      ? options
      : options.filter((o) =>
          o.label.toLowerCase().includes(query.toLowerCase()),
        );

  return (
    <Combobox value={value} onChange={onChange} multiple disabled={disabled}>
      <div className="relative">
        <ComboboxInput
          className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:ring-2 focus:ring-indigo-200"
          onChange={(e) => setQuery(e.target.value)}
          displayValue={() =>
            options
              .filter((o) => value.includes(o.value))
              .map((o) => o.label)
              .join(", ")
          }
          placeholder={placeholder}
        />

        <ComboboxButton className="absolute inset-y-0 right-2 flex items-center">
          <ChevronDown size={16} className="text-gray-400" />
        </ComboboxButton>

        <ComboboxOptions className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-lg bg-white shadow-lg border">
          {filtered.length === 0 && (
            <div className="px-3 py-2 text-sm text-gray-400">No results</div>
          )}

          {filtered.map((opt) => (
            <ComboboxOption key={opt.value} value={opt.value} as={Fragment}>
              {({ active, selected }) => (
                <li
                  className={`flex items-center justify-between px-3 py-2 text-sm cursor-pointer
                    ${active ? "bg-indigo-50" : ""}
                  `}
                >
                  <span>{opt.label}</span>
                  {selected && <Check size={16} className="text-indigo-600" />}
                </li>
              )}
            </ComboboxOption>
          ))}
        </ComboboxOptions>
      </div>
    </Combobox>
  );
};
