import { useState, useEffect, useRef, useCallback } from "react";

/**
 * Manages a local input value that updates immediately for responsiveness,
 * while debouncing the callback to the parent/context.
 */
export function useDebouncedField(
  externalValue: string,
  onCommit: (value: string) => void,
  delay = 300,
) {
  const [localValue, setLocalValue] = useState(externalValue);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const committedRef = useRef(externalValue);

  // Sync when external value changes (e.g., language switch, undo)
  useEffect(() => {
    if (externalValue !== committedRef.current) {
      setLocalValue(externalValue);
      committedRef.current = externalValue;
    }
  }, [externalValue]);

  const handleChange = useCallback(
    (newValue: string) => {
      setLocalValue(newValue);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => {
        committedRef.current = newValue;
        onCommit(newValue);
      }, delay);
    },
    [onCommit, delay],
  );

  // Flush on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  return { value: localValue, onChange: handleChange };
}
