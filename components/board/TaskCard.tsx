import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Calendar, GripVertical, Tag as TagIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Task } from "@/lib/types";
import { mutedText } from "@/lib/design";

type TaskCardProps = {
  task: Task;
  onViewDetails?: () => void;
};

const priorityVariants = {
  baixa: "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300",
  media: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300",
  alta: "bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-300",
  urgente: "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300",
};

export function TaskCard({ task, onViewDetails }: TaskCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "group relative cursor-grab rounded-2xl border border-slate-200/75 bg-white/90 p-4 shadow-md shadow-slate-200/50 transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-slate-200/60 active:cursor-grabbing dark:border-slate-800 dark:bg-slate-950/85 dark:shadow-black/20 dark:hover:shadow-black/30",
        isDragging && "opacity-50 rotate-2 shadow-lg"
      )}
    >
      {/* Drag handle */}
      <div
        {...attributes}
        {...listeners}
        className="absolute left-2 top-2 cursor-grab opacity-0 transition-opacity group-hover:opacity-100"
      >
        <GripVertical className="h-4 w-4 text-slate-400 dark:text-slate-500" />
      </div>

      <div className="pl-6" onClick={(e) => {
              e.stopPropagation();
              onViewDetails?.();
            }}>
        <h4 className="mb-2 line-clamp-2 font-semibold text-slate-950 dark:text-slate-100">
          {task.title.charAt(0).toUpperCase() + task.title.slice(1)}
        </h4>

        {task.description && (
          <p className={cn("mb-3 line-clamp-2 text-sm", mutedText)}>
            {task.description
    ? task.description.charAt(0).toUpperCase() + task.description.slice(1)
    : ''}
          </p>
        )}

        <div className="flex items-center justify-between mb-3">
          <span className={cn("text-xs", mutedText)}>#{task.id}</span>
          <span className={cn("px-2 py-1 rounded-full text-xs font-medium", priorityVariants[task.priority])}>
            {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
          </span>
        </div>

        {task.due_date && (
          <div className={cn("mb-2 flex items-center gap-1 text-xs", mutedText)}>
            <Calendar className="h-3 w-3" />
            <span>Due {new Date(task.due_date).toLocaleDateString()}</span>
          </div>
        )}

        {task.tags && task.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-2">
            {task.tags.slice(0, 3).map((tag) => (
              <span
                key={tag.id}
                className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-1 text-xs font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300"
                style={{
                  backgroundColor: tag.color ? `${tag.color}20` : undefined,
                  color: tag.color || undefined
                }}
              >
                <TagIcon className="h-2 w-2" />
                {tag.name}
              </span>
            ))}
            {task.tags.length > 3 && (
              <span className={cn("text-xs", mutedText)}>
                +{task.tags.length - 3} mais
              </span>
            )}
          </div>
        )}

        {onViewDetails && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onViewDetails();
            }}
            className="text-xs text-sky-700 underline-offset-4 hover:underline dark:text-sky-300"
          >
            Ver detalhes
          </button>
        )}
      </div>
    </div>
  );
}
