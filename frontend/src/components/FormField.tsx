import type { ReactNode } from "react";

interface FormFieldProps {
  label: string;
  error?: string;
  children: ReactNode;
}

export const FormField = ({ label, error, children }: FormFieldProps) => (
  <label className="block text-sm">
    <span className="mb-1 block font-medium text-slate-700">{label}</span>
    {children}
    {error && <p className="field-error">{error}</p>}
  </label>
);
