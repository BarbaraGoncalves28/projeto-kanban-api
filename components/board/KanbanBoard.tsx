'use client'

import { Button } from '@/components/ui/Button'
import { useStore } from '@/lib/store'
import type { Task, TaskStatus } from '@/lib/types'
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragStartEvent,
} from '@dnd-kit/core'
import { FolderKanban, Plus } from 'lucide-react'
import { useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Column } from './Column'
import { CreateTaskModal } from './CreateTaskModal'
import { TaskDetailModal } from './TaskDetailModal'
import { cardSurface, mutedText } from '@/lib/design'

const columns: { id: TaskStatus; title: string }[] = [
  { id: 'pendente', title: 'Pendente' },
  { id: 'em_progresso', title: 'Em Progresso' },
  { id: 'revisao', title: 'Revisão' },
  { id: 'concluida', title: 'Concluído' },
]

export function KanbanBoard() {
  const searchParams = useSearchParams()
  const { tasks, tasksLoading, tasksError, fetchTasks, updateTaskStatus } =
    useStore()
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)
  const projectIdParam = searchParams.get('project')
  const parsedProjectId = projectIdParam ? Number(projectIdParam) : undefined
  const selectedProjectId =
    parsedProjectId && Number.isInteger(parsedProjectId) && parsedProjectId > 0
      ? parsedProjectId
      : undefined
  const hasSelectedProject = selectedProjectId !== undefined

  useEffect(() => {
    if (!hasSelectedProject) {
      void fetchTasks(undefined)
      return
    }

    void fetchTasks(selectedProjectId)
  }, [fetchTasks, hasSelectedProject, selectedProjectId])

  function getTasksByStatus(status: TaskStatus) {
    return tasks.filter((task) => task.status === status)
  }

  function handleDragStart(event: DragStartEvent) {
    void event
  }

  function handleDragOver(event: DragOverEvent) {
    const { over } = event

    if (!over) return

    const overId = over.id as TaskStatus | number

    // If dropping on a column
    if (typeof overId === 'string') {
      // Visual feedback can be added here later if needed.
    }
  }

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event

    if (!over) {
      return
    }

    const activeId = active.id as number
    const overId = over.id as TaskStatus | number

    let newStatus: TaskStatus

    if (typeof overId === 'string') {
      // Dropped on a column
      newStatus = overId as TaskStatus
    } else {
      // Dropped on another task - use that task's status
      const overTask = tasks.find((t) => t.id === overId)
      if (!overTask) return
      newStatus = overTask.status
    }

    await updateTaskStatus(activeId, newStatus, selectedProjectId)
  }

  const handleTaskClick = (task: Task) => {
    setSelectedTask(task)
    setIsDetailModalOpen(true)
  }

  const handleCloseTaskDetail = () => {
    setIsDetailModalOpen(false)
    setSelectedTask(null)
  }

  if (tasksLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (tasksError) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <p className="mb-4 text-rose-600 dark:text-rose-400">{tasksError}</p>
          <Button
            onClick={() => hasSelectedProject && fetchTasks(selectedProjectId)}
          >
            Try Again
          </Button>
        </div>
      </div>
    )
  }

  if (!hasSelectedProject) {
    return (
      <div className="flex min-h-96 items-center justify-center">
        <div className={`max-w-md ${cardSurface} p-8 text-center`}>
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-sky-500/10 text-sky-700 dark:bg-sky-400/10 dark:text-sky-300">
            <FolderKanban className="h-7 w-7" />
          </div>
          <h2 className="mt-5 text-2xl font-semibold">Selecione um projeto</h2>
          <p className={`mt-2 text-sm ${mutedText}`}>
            Abra o board a partir de um card de projeto para carregar as tarefas
            pela rota correta da API.
          </p>
        </div>
      </div>
    )
  }

  return (
    <DndContext
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Tarefas</h2>
          <p className={`mt-1 ${mutedText}`}>
            {tasks.length} total tarefas
          </p>
        </div>
        <Button className='cursor-pointer' onClick={() => setIsCreateModalOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Criar tarefa
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-6 overflow-x-auto pb-4 md:grid-cols-2 xl:grid-cols-4">
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
        onTaskCreated={() => fetchTasks(selectedProjectId)}
        projectId={selectedProjectId}
      />

      <TaskDetailModal
        task={selectedTask}
        isOpen={isDetailModalOpen}
        onClose={handleCloseTaskDetail}
        currentUser={{
          id: 1,
          name: 'Current User',
          email: 'user@example.com',
          createdAt: '',
          updatedAt: '',
        }}
      />
    </DndContext>
  )
}
