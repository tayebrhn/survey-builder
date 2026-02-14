import { useRequired } from "../..";

type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

export const Input: React.FC<InputProps> = ({ required, ...props }) => {
  const { requiredByDefault } = useRequired();
  return <input {...props} required={required ?? requiredByDefault} />;
};

type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement>;

export const Textarea: React.FC<TextareaProps> = ({ required, ...props }) => {
  const { requiredByDefault } = useRequired();
  return <textarea {...props} required={required ?? requiredByDefault} />;
};

type SelectProps = React.SelectHTMLAttributes<HTMLSelectElement>;

export const Select: React.FC<SelectProps> = ({
  required,
  className,
  children,
  value,
  ...props
}) => {
  const { requiredByDefault } = useRequired();

  // Treat 0 as invalid
  const isInvalidValue = value === 0 || value === "0" || value === "";

  return (
    <select
      {...props}
      value={value}
      required={required ?? requiredByDefault}
      className={`border p-2 rounded ${isInvalidValue ? "border-red-500 ring-1 ring-red-500" : ""} ${className ?? ""}`}
    >
      {children}
    </select>
  );
};

type CheckboxRadioProps = React.InputHTMLAttributes<HTMLInputElement> & {
  groupName?: string; // same name for radio groups
};

export const CheckboxRadio: React.FC<CheckboxRadioProps> = ({
  groupName,
  type,
  required,
  className,
  ...props
}) => {
  const { requiredByDefault } = useRequired();

  return (
    <input
      {...props}
      type={type}
      name={groupName}
      required={
        required ??
        (type === "radio" || type === "checkbox"
          ? requiredByDefault
          : undefined)
      }
      className={`accent-blue-500 ${className ?? ""}`}
    />
  );
};
