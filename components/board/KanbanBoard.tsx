"use client";

import { useEffect, useState } from "react";
import { DndContext, DragEndEvent, DragOverEvent, DragStartEvent } from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import { useStore } from "@/lib/store";
import { Column } from "./Column";
import { CreateTaskModal } from "./CreateTaskModal";
import { TaskDetailModal } from "./TaskDetailModal";
import { Button } from "@/components/ui/Button";
import { Plus } from "lucide-react";
import type { Task, TaskStatus } from "@/lib/types";

const columns: { id: TaskStatus; title: string }[] = [
  { id: "backlog", title: "Backlog" },
  { id: "pendente", title: "Pendente" },
  { id: "em_progresso", title: "Em Progresso" },
  { id: "revisao", title: "Revisão" },
  { id: "concluido", title: "Concluído" },
];

export function KanbanBoard() {
  const { tasks, tasksLoading, tasksError, fetchTasks, updateTaskStatus } = useStore();
  const [activeId, setActiveId] = useState<number | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  function getTasksByStatus(status: TaskStatus) {
    return tasks.filter(task => task.status === status);
  }

  function handleDragStart(event: DragStartEvent) {
    setActiveId(event.active.id as number);
  }

  function handleDragOver(event: DragOverEvent) {
    const { active, over } = event;

    if (!over) return;

    const activeId = active.id as number;
    const overId = over.id as TaskStatus | number;

    // If dropping on a column
    if (typeof overId === "string") {
      const newStatus = overId as TaskStatus;
      // Visual feedback - temporarily update status
      // The store will handle the actual update on drag end
    }
  }

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    if (!over) {
      setActiveId(null);
      return;
    }

    const activeId = active.id as number;
    const overId = over.id as TaskStatus | number;

    let newStatus: TaskStatus;

    if (typeof overId === "string") {
      // Dropped on a column
      newStatus = overId as TaskStatus;
    } else {
      // Dropped on another task - use that task's status
      const overTask = tasks.find(t => t.id === overId);
      if (!overTask) return;
      newStatus = overTask.status;
    }

    try {
      await updateTaskStatus(activeId, newStatus);
    } catch (error) {
      console.error("Failed to update task status:", error);
    }

    setActiveId(null);
  }

  const handleTaskClick = (task: Task) => {
    setSelectedTask(task);
    setIsDetailModalOpen(true);
  };

  if (tasksLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (tasksError) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <p className="text-destructive mb-4">{tasksError}</p>
          <Button onClick={() => fetchTasks()}>
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <DndContext
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Tasks</h2>
          <p className="text-muted-foreground mt-1">
            {tasks.length} total tasks
          </p>
        </div>
        <Button onClick={() => setIsCreateModalOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Create Task
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-6 overflow-x-auto pb-4 md:grid-cols-3 lg:grid-cols-5">
        {columns.map((column) => (
          <Column
            key={column.id}
            id={column.id}
            title={column.title}
            tasks={getTasksByStatus(column.id)}
            onTaskClick={handleTaskClick}
          />
        ))}
      </div>

      <CreateTaskModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onTaskCreated={fetchTasks}
      />

      <TaskDetailModal
        task={selectedTask}
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        currentUser={{ id: 1, name: "Current User", email: "user@example.com", createdAt: "", updatedAt: "" }}
      />
    </DndContext>
  );
}