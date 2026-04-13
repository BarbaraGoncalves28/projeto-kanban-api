import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Calendar, GripVertical, Tag as TagIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Task } from "@/lib/types";

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
        "group relative rounded-lg border bg-card p-4 shadow-sm transition-all hover:shadow-md cursor-grab active:cursor-grabbing",
        isDragging && "opacity-50 rotate-2 shadow-lg"
      )}
    >
      {/* Drag handle */}
      <div
        {...attributes}
        {...listeners}
        className="absolute left-2 top-2 cursor-grab opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <GripVertical className="h-4 w-4 text-muted-foreground" />
      </div>

      <div className="pl-6">
        <h4 className="font-semibold text-foreground mb-2 line-clamp-2">
          {task.title}
        </h4>

        {task.description && (
          <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
            {task.description}
          </p>
        )}

        <div className="flex items-center justify-between mb-3">
          <span className="text-xs text-muted-foreground">#{task.id}</span>
          <span className={cn("px-2 py-1 rounded-full text-xs font-medium", priorityVariants[task.priority])}>
            {task.priority}
          </span>
        </div>

        {task.dueDate && (
          <div className="flex items-center gap-1 text-xs text-muted-foreground mb-2">
            <Calendar className="h-3 w-3" />
            <span>Due {new Date(task.dueDate).toLocaleDateString()}</span>
          </div>
        )}

        {task.taskTags && task.taskTags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-2">
            {task.taskTags.slice(0, 3).map((tag) => (
              <span
                key={tag.id}
                className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-muted text-muted-foreground"
                style={{
                  backgroundColor: tag.color ? `${tag.color}20` : undefined,
                  color: tag.color || undefined
                }}
              >
                <TagIcon className="h-2 w-2" />
                {tag.name}
              </span>
            ))}
            {task.taskTags.length > 3 && (
              <span className="text-xs text-muted-foreground">
                +{task.taskTags.length - 3} more
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
            className="text-xs text-primary hover:text-primary/80 underline-offset-4 hover:underline"
          >
            View details
          </button>
        )}
      </div>
    </div>
  );
}