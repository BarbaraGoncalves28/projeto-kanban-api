'use client'

import { projectService, taskService } from '@/lib/services'
import { useStore } from '@/lib/store'
import type { Task, User } from '@/lib/types'
import { useEffect, useState } from 'react'

type TaskDetailModalProps = {
  task: Task | null
  isOpen: boolean
  onClose: () => void
  currentUser?: User
}

export function TaskDetailModal({
  task,
  isOpen,
  onClose,
  currentUser,
}: TaskDetailModalProps) {
  const projects = useStore((state) => state.projects)
  const [resolvedProjectName, setResolvedProjectName] = useState<string | null>(
    null,
  )

  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState<Partial<Task>>({})

  void currentUser
  const dueDate = task?.due_date ?? task?.dueDate
  const projectId = task?.project_id ?? task?.projectId
  const storeProjectName = projects.find(
    (project) => project.id === projectId,
  )?.name
  const projectName =
    task?.project?.name ??
    projects.find((p) => p.id === projectId)?.name ??
    (projectId ? `Project ${projectId}` : 'No project')
  const taskTags = task?.task_tags ?? task?.taskTags

  function handleStartEdit() {
    if (!task) return

    setFormData({
      title: task.title,
      description: task.description,
      status: task.status,
      priority: task.priority,
      due_date: task.due_date,
      project_id: task.project_id ?? task.projectId,
    })

    setIsEditing(true)
  }

  useEffect(() => {
    let isMounted = true

    async function resolveProjectName() {
      if (!isOpen || !task || !projectId) {
        if (isMounted) {
          setResolvedProjectName(null)
        }
        return
      }

      if (task.project?.name || storeProjectName) {
        if (isMounted) {
          setResolvedProjectName(null)
        }
        return
      }

      try {
        const project = await projectService.getProject(projectId)
        if (isMounted) {
          setResolvedProjectName(project.name)
        }
      } catch {
        if (isMounted) {
          setResolvedProjectName(null)
        }
      }
    }

    void resolveProjectName()

    return () => {
      isMounted = false
    }
  }, [isOpen, projectId, storeProjectName, task])

  if (!isOpen || !task) return null

  // 🟢 UPDATE TASK
  async function handleUpdate() {
    if (!task) return
    try {
      await taskService.updateTask({
        id: task.id,
        ...formData,
        projectId: Number(formData.project_id),
      })
      setIsEditing(false)
      onClose() // pode trocar por refetch futuramente
    } catch (err) {
      console.error('Erro ao atualizar tarefa:', err)
    }
  }

  // 🔴 DELETE TASK
  async function handleDelete() {
    if (!task) return
    const confirmDelete = confirm('Tem certeza que deseja deletar essa tarefa?')
    if (!confirmDelete) return

    try {
      await taskService.deleteTask(task.id)
      onClose()
    } catch (err) {
      console.error('Erro ao deletar tarefa:', err)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-8">
          <div className="flex items-center justify-between mb-6">
            {isEditing ? (
              <input
                className="text-2xl font-semibold border p-2 w-full"
                value={formData.title || ''}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
              />
            ) : (
              <h2 className="text-2xl font-semibold text-slate-900">
                {task.title}
              </h2>
            )}
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600 text-xl"
            >
              ✕
            </button>
          </div>

          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-3">
                Description
              </h3>
              {isEditing ? (
                <textarea
                  className="w-full border p-2"
                  value={formData.description || ''}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                />
              ) : (
                <p className="text-slate-700">
                  {task.description || 'No description provided.'}
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-sm font-medium text-slate-500">
                  Status
                </span>
                <p className="text-slate-900 capitalize">
                  {task.status.replace('_', ' ')}
                </p>
              </div>
              <div>
                <span className="text-sm font-medium text-slate-500">
                  Priority
                </span>
                {isEditing ? (
                  <select
                    className="border p-2 w-full"
                    value={formData.priority}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        priority: e.target.value as Task['priority'],
                      })
                    }
                  >
                    <option value="baixa">Baixa</option>
                    <option value="media">Média</option>
                    <option value="alta">Alta</option>
                    <option value="urgente">Urgente</option>
                  </select>
                ) : (
                  <p
                    className={`text-sm font-medium px-2 py-1 rounded-full inline-block ${
                      task.priority === 'urgente'
                        ? 'bg-red-100 text-red-700'
                        : task.priority === 'alta'
                          ? 'bg-orange-100 text-orange-700'
                          : task.priority === 'media'
                            ? 'bg-yellow-100 text-yellow-700'
                            : 'bg-green-100 text-green-700'
                    }`}
                  >
                    {task.priority}
                  </p>
                )}
              </div>
              <div>
                <span className="text-sm font-medium text-slate-500">
                  Project
                </span>

                {isEditing ? (
                  <select
                    className="border p-2 w-full"
                    value={formData.project_id ?? ''}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        project_id: Number(e.target.value),
                      })
                    }
                  >
                    {projects.map((project) => (
                      <option key={project.id} value={project.id}>
                        {project.name}
                      </option>
                    ))}
                  </select>
                ) : (
                  <p className="text-slate-900">
                    {resolvedProjectName ?? projectName}
                  </p>
                )}
              </div>
              <div>
                <span className="text-sm font-medium text-slate-500">
                  Due Date
                </span>

                {isEditing ? (
                  <input
                    type="date"
                    className="border p-2 w-full"
                    value={
                      formData.due_date
                        ? new Date(formData.due_date)
                            .toISOString()
                            .split('T')[0]
                        : ''
                    }
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        due_date: e.target.value,
                      })
                    }
                  />
                ) : (
                  <p className="text-slate-900">
                    {dueDate
                      ? new Date(dueDate).toLocaleDateString()
                      : 'No due date'}
                  </p>
                )}
              </div>
            </div>

            {taskTags && taskTags.length > 0 && (
              <div>
                <span className="text-sm font-medium text-slate-500 block mb-2">
                  Tags
                </span>
                <div className="flex flex-wrap gap-2">
                  {taskTags.map((tag) => (
                    <span
                      key={tag.id}
                      className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium"
                      style={{
                        backgroundColor: tag.color
                          ? `${tag.color}20`
                          : '#f1f5f9',
                        color: tag.color || '#64748b',
                      }}
                    >
                      {tag.name}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div>
              <span className="text-sm font-medium text-slate-500">
                Assigned Users
              </span>
              <p className="text-slate-900">
                {task.assignees && task.assignees.length > 0
                  ? task.assignees.map((u) => u.name).join(', ')
                  : 'No users assigned'}
              </p>
            </div>

            <div className="flex gap-3 pt-4">
              {isEditing ? (
                <>
                  <button
                    onClick={handleUpdate}
                    className="bg-blue-600 text-white px-4 py-2 rounded"
                  >
                    Salvar
                  </button>

                  <button
                    onClick={() => setIsEditing(false)}
                    className="bg-gray-300 px-4 py-2 rounded"
                  >
                    Cancelar
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={handleStartEdit}
                    className="bg-yellow-500 text-white px-4 py-2 rounded"
                  >
                    Editar
                  </button>

                  <button
                    onClick={handleDelete}
                    className="bg-red-600 text-white px-4 py-2 rounded"
                  >
                    Deletar
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
