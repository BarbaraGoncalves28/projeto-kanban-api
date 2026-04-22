import type { InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";
import { inputBase } from "@/lib/design";

type TextFieldProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  error?: string;
};

export function TextField({ id, label, error, className, ...props }: TextFieldProps) {
  return (
    <div className="space-y-2">
      <label
        htmlFor={id}
        className="text-sm font-medium leading-none text-slate-700 peer-disabled:cursor-not-allowed peer-disabled:opacity-70 dark:text-slate-200"
      >
        {label}
      </label>
      <input
        id={id}
        className={cn(
          inputBase,
          "h-11 file:border-0 file:bg-transparent file:text-sm file:font-medium",
          error && "border-rose-400 focus:border-rose-400 focus:ring-rose-100 dark:border-rose-500 dark:focus:ring-rose-500/15",
          className
        )}
        {...props}
      />
      {error && (
        <p className="text-sm text-rose-600 dark:text-rose-400">{error}</p>
      )}
    </div>
  );
}
