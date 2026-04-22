import { cn } from "@/lib/utils";
import { mutedText } from "@/lib/design";
import { FileX } from "lucide-react";

interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({
  title,
  description,
  icon,
  action,
  className
}: EmptyStateProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center py-12 text-center", className)}>
      <div className="mb-4 rounded-full bg-slate-100 p-3 text-slate-500 dark:bg-slate-800 dark:text-slate-400">
        {icon || <FileX className="h-6 w-6" />}
      </div>
      <h3 className="mb-2 text-lg font-semibold">{title}</h3>
      {description && (
        <p className={cn("mb-4 max-w-sm text-sm", mutedText)}>
          {description}
        </p>
      )}
      {action}
    </div>
  );
}
