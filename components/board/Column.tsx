import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { TaskCard } from "./TaskCard";
import { cn } from "@/lib/utils";
import type { Task, TaskStatus } from "@/lib/types";

type ColumnProps = {
  id: TaskStatus;
  title: string;
  tasks: Task[];
  onTaskClick?: (task: Task) => void;
};

const columnVariants = {
  backlog: "border-muted bg-muted/30 hover:bg-muted/50",
  pendente: "border-blue-200 bg-blue-50/50 hover:bg-blue-50/70 dark:border-blue-800 dark:bg-blue-950/20 dark:hover:bg-blue-950/30",
  em_progresso: "border-yellow-200 bg-yellow-50/50 hover:bg-yellow-50/70 dark:border-yellow-800 dark:bg-yellow-950/20 dark:hover:bg-yellow-950/30",
  revisao: "border-purple-200 bg-purple-50/50 hover:bg-purple-50/70 dark:border-purple-800 dark:bg-purple-950/20 dark:hover:bg-purple-950/30",
  concluido: "border-green-200 bg-green-50/50 hover:bg-green-50/70 dark:border-green-800 dark:bg-green-950/20 dark:hover:bg-green-950/30",
};

const headerVariants = {
  backlog: "text-muted-foreground",
  pendente: "text-blue-700 dark:text-blue-300",
  em_progresso: "text-yellow-700 dark:text-yellow-300",
  revisao: "text-purple-700 dark:text-purple-300",
  concluido: "text-green-700 dark:text-green-300",
};

export function Column({ id, title, tasks, onTaskClick }: ColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id,
  });

  return (
    <div className={cn(
      "flex min-h-125 w-full flex-col rounded-xl border-2 bg-card p-4 transition-all duration-200",
      columnVariants[id],
      isOver && "ring-2 ring-ring ring-offset-2"
    )}>
      <div className={cn("mb-4 flex items-center justify-between", headerVariants[id])}>
        <h3 className="font-semibold text-sm uppercase tracking-wide">{title}</h3>
        <span className="rounded-full bg-background/80 px-2 py-1 text-xs font-medium">
          {tasks.length}
        </span>
      </div>

      <div
        ref={setNodeRef}
        className="flex flex-1 flex-col gap-3"
      >
        <SortableContext items={tasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
          {tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onViewDetails={onTaskClick ? () => onTaskClick(task) : undefined}
            />
          ))}
        </SortableContext>

        {tasks.length === 0 && (
          <div className="flex flex-1 items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/25 p-4">
            <p className="text-center text-sm text-muted-foreground">
              No tasks in {title.toLowerCase()}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}