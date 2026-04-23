'use client'

import { projectService, taskService, userService, tagService } from '@/lib/services'
import { useStore } from '@/lib/store'
import type { Task, User, Tag } from '@/lib/types'
import { useEffect, useState } from 'react'
import { inputBase, modalOverlay, modalPanel, mutedText } from '@/lib/design'
import { toast } from "sonner";

type TaskDetailModalProps = {
  task: Task | null
  isOpen: boolean
  onClose: () => void
  currentUser?: User
}

type UpdateTaskForm = {
  title?: string
  description?: string
  status?: Task['status']
  priority?: Task['priority']
  due_date?: string
  project_id?: number
  estimated_minutes?: number
  assignees?: number[]
  tags?: number[]
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
  const [formData, setFormData] = useState<UpdateTaskForm>({})
  const [users, setUsers] = useState<User[]>([])
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [tags, setTags] = useState<Tag[]>([])
  const [isTagDropdownOpen, setIsTagDropdownOpen] = useState(false)
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false)

  void currentUser
  const dueDate = task?.due_date
  const projectId = task?.project_id
  const storeProjectName = projects.find(
    (project) => project.id === projectId,
  )?.name
  const projectName =
    task?.project?.name ??
    projects.find((p) => p.id === projectId)?.name ??
    (projectId ? `Project ${projectId}` : 'No project')
  const taskTags = task?.tags

  useEffect(() => {
    userService.getUsers().then(setUsers)
  }, [])

  useEffect(() => {
  tagService.getTags().then(setTags)
}, [])


  function handleStartEdit() {
    if (!task) return

    setFormData({
      title: task.title,
      description: task.description,
      status: task.status,
      priority: task.priority,
      due_date: task.due_date,
      project_id: task.project_id,
      estimated_minutes: task.estimated_minutes,
      assignees: task.assignees?.map(u => u.id) || [],
      tags: task.tags?.map(t => t.id) || [],
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
    const validStatus: Task['status'][] = [
      'pendente',
      'em_progresso',
      'revisao',
      'concluida',
    ]

    const status =
      formData.status && validStatus.includes(formData.status)
        ? formData.status
        : task.status

    const payload = {
      id: task.id,
      title: formData.title ?? task.title,
      description: formData.description ?? task.description,
      status,
      priority: formData.priority ?? task.priority,
      due_date: formData.due_date ?? task.due_date,
      estimated_minutes:
        formData.estimated_minutes ?? task.estimated_minutes,

      project_id: task.project_id,

      assignees:
        formData.assignees ??
        task.assignees?.map((user) => user.id) ??
        [],

      tags: formData.tags ?? task.tags?.map(t => t.id) ?? [],
    }

    console.log('PAYLOAD:', payload)

    await taskService.updateTask(payload)

    useStore.getState().updateTask(task.id, {
      title: payload.title,
      description: payload.description,
      status: payload.status,
      priority: payload.priority,
      due_date: payload.due_date,
      estimated_minutes: payload.estimated_minutes,

      assignees: users.filter(user =>
        payload.assignees.includes(user.id)
      ),

      tags: tags.filter(tag =>
        payload.tags.includes(tag.id)
      ),
    })

    toast.success(
  `Tarefa "${payload.title.charAt(0).toUpperCase() + payload.title.slice(1)}" atualizada com sucesso!`
);

    setIsEditing(false)
    onClose()
  } catch (err: any) {
    console.error('Erro ao atualizar tarefa:', err)
    toast.error("Não foi possível atualizar a tarefa.");
    console.error('Resposta do backend:', err?.response?.data)
  }
}

  // 🔴 DELETE TASK
  async function confirmDelete() {
  if (!task || !task.project_id) return

  try {
    setIsDeleting(true)

    await taskService.deleteTask(task.id, task.project_id)
    useStore.getState().removeTask(task.id)

    toast.success(
  `Tarefa "${task.title.charAt(0).toUpperCase() + task.title.slice(1)}" deletada com sucesso!`
);

    setShowDeleteModal(false)
    onClose()
  } catch (err) {
    console.error('Erro ao deletar tarefa:', err)
    toast.error("Não foi possível deletar a tarefa.");
  } finally {
    setIsDeleting(false)
  }
}

  return (
    <>
    <div className={modalOverlay}>
      <div className={`${modalPanel} relative max-h-[90vh] max-w-4xl overflow-y-auto`}>

        <button
              onClick={() => {setIsEditing(false)
              setShowDeleteModal(false)
              onClose()
              }}
              className="absolute right-4 top-4 cursor-pointer text-xl text-slate-400 transition hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300"
            >
              ✕
            </button>
        <div className="p-8 pt-20">
          
          <div className="flex items-center justify-between mb-6">
            {isEditing ? (
              <input
                className={`${inputBase} w-full text-2xl font-semibold`}
                value={formData.title || ''}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
              />
            ) : (
              <h2 className="text-2xl font-semibold text-slate-950 dark:text-slate-100">
                {task.title}
              </h2>
            )}
          </div>

          <div className="space-y-6">
            <div>
              <h3 className="mb-3 text-lg font-semibold text-slate-950 dark:text-slate-100">
                Descrição:
              </h3>
              {isEditing ? (
                <textarea
                  className={`${inputBase} min-h-32 resize-none`}
                  value={formData.description || ''}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                />
              ) : (
                <p className="text-slate-700 dark:text-slate-300">
                  {task.description
    ? task.description.charAt(0).toUpperCase() + task.description.slice(1)
    : 'No description provided.'}
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className={`text-sm font-medium ${mutedText}`}>
                  Status:
                </span>

                {isEditing ? (
                  <select className={`${inputBase} mt-2 cursor-pointer`} value={formData.status ?? task.status} onChange={(e) => setFormData({ ...formData, status: e.target.value as Task['status'],})}>
                    <option value="pendente">Pendente</option>
                    <option value="em_progresso">Em progresso</option>
                    <option value="revisao">Revisão</option>
                    <option value="concluida">Concluído</option>
                  </select>
                ) : (
                <p className="capitalize text-slate-950 dark:text-slate-100">
                  {task.status.replace('_', ' ')}
                </p>
                )}
              </div>
              <div>
                <span className={`text-sm font-medium ${mutedText}`}>
                  Prioridade:
                </span>
                {isEditing ? (
                  <select
                    className={`${inputBase} mt-2 cursor-pointer`}
                    value={formData.priority ?? task.priority}
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
                        ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
                        : task.priority === 'alta'
                          ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300'
                          : task.priority === 'media'
                            ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300'
                            : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
                    }`}
                  >
                    {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                  </p>
                )}
              </div>
              <div>
                <span className={`text-sm font-medium ${mutedText}`}>
                  Projeto:
                </span>

                  <p className="text-slate-950 dark:text-slate-100">
                    {resolvedProjectName ?? projectName}
                  </p>
              </div>
              <div>
                <span className={`text-sm font-medium ${mutedText}`}>
                  Data de criação:
                </span>

                {isEditing ? (
                  <input
                    type="date"
                    className={`${inputBase} mt-2 cursor-pointer`}
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
                  <p className="text-slate-950 dark:text-slate-100">
                    {dueDate
                      ? new Date(dueDate).toLocaleDateString()
                      : 'No due date'}
                  </p>
                )}
              </div>

                <div>
  <span className={`text-sm font-medium ${mutedText}`}>
    Criador(a):
  </span>
  <p className="text-slate-950 dark:text-slate-100">
    {task.creator?.name
    ? task.creator.name.charAt(0).toUpperCase() + task.creator.name.slice(1)
    : 'Unknown'}
  </p>
</div>

              <div>
  <span className={`text-sm font-medium ${mutedText}`}>
    Duração (minutos):
  </span>

  {isEditing ? (
    <input
      type="number"
      className={`${inputBase} mt-2`}
      value={formData.estimated_minutes ?? ''}
      onChange={(e) =>
        setFormData({
          ...formData,
          estimated_minutes: Number(e.target.value),
        })
      }
    />
  ) : (
    <p className="text-slate-950 dark:text-slate-100">
      {task.estimated_minutes
        ? `${task.estimated_minutes} min`
        : 'No estimate'}
    </p>
  )}
</div>
            </div>

            {taskTags && taskTags.length > 0 && (
              <div>
                <span className={`mb-2 block text-sm font-medium ${mutedText}`}>
                  Tags:
                </span>


                {isEditing ? (
    <div className="relative">
  <div
    onClick={() => setIsTagDropdownOpen(prev => !prev)}
    className={`${inputBase} cursor-pointer`}
  >
    {formData.tags && formData.tags.length > 0
      ? "Adicionar mais tags"
      : "Selecionar tags"}
  </div>

  {isTagDropdownOpen && (
    <div className="absolute z-10 mt-2 max-h-48 w-full overflow-y-auto rounded-2xl border border-slate-200/80 bg-white/95 shadow-lg shadow-slate-900/10 dark:border-slate-700 dark:bg-slate-900/95 dark:shadow-black/30">
      {tags.map(tag => {
        const isSelected = formData.tags?.includes(tag.id)

        return (
          <div
            key={tag.id}
            onClick={() => {
              const updated = isSelected
                ? formData.tags?.filter(id => id !== tag.id)
                : [...(formData.tags || []), tag.id]

              setFormData({ ...formData, tags: updated })
              setIsTagDropdownOpen(false)
            }}
            className={`cursor-pointer px-4 py-2 transition hover:bg-slate-100 dark:hover:bg-slate-800 ${
              isSelected ? "bg-slate-100 font-medium dark:bg-slate-800" : ""
            }`}
          >
            {tag.name}
          </div>
        )
      })}
    </div>
  )}

  {/* TAGS SELECIONADAS */}
  {formData.tags && formData.tags.length > 0 && (
    <div className="flex flex-wrap gap-2 mt-2">
      {tags
        .filter(tag => formData.tags?.includes(tag.id))
        .map(tag => (
          <div
            key={tag.id}
            className="flex items-center gap-2 px-3 py-1 rounded-full text-sm"
            style={{
              backgroundColor: tag.color ? `${tag.color}20` : '#f1f5f9',
              color: tag.color || '#64748b',
            }}
          >
            <span>{tag.name}</span>
            <button
              type="button"
              onClick={() => {
                const updated = formData.tags?.filter(id => id !== tag.id)
                setFormData({ ...formData, tags: updated })
              }}
              className="cursor-pointer transition hover:text-rose-500"
            >
              ✕
            </button>
          </div>
        ))}
    </div>
  )}
</div>
  ) : (
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
                )}
              </div>
            )}

            <div>
              <span className={`cursor-pointer text-sm font-medium ${mutedText}`}>
                Usuários atribuídos:
              </span>
               {isEditing ? (
    <div className="relative">
  <div
    onClick={() => setIsUserDropdownOpen(prev => !prev)}
    className={`${inputBase} cursor-pointer`}
  >
    {formData.assignees && formData.assignees.length > 0
      ? "Adicionar mais usuários"
      : "Selecione usuários"}
  </div>

  {isUserDropdownOpen && (
    <div className="absolute z-10 mt-2 max-h-48 w-full overflow-y-auto rounded-2xl border border-slate-200/80 bg-white/95 shadow-lg shadow-slate-900/10 dark:border-slate-700 dark:bg-slate-900/95 dark:shadow-black/30">
      {users.map(user => {
        const isSelected = formData.assignees?.includes(user.id)

        return (
          <div
            key={user.id}
            onClick={() => {
              const updated = isSelected
                ? formData.assignees?.filter(id => id !== user.id)
                : [...(formData.assignees || []), user.id]

              setFormData({ ...formData, assignees: updated })
              setIsUserDropdownOpen(false)
            }}
            className={`cursor-pointer px-4 py-2 transition hover:bg-slate-100 dark:hover:bg-slate-800 ${
              isSelected ? "bg-slate-100 font-medium dark:bg-slate-800" : ""
            }`}
          >
            {user.name}
          </div>
        )
      })}
    </div>
  )}

  {/* USERS SELECIONADOS */}
  {formData.assignees && formData.assignees.length > 0 && (
    <div className="flex flex-wrap gap-2 mt-2">
      {users
        .filter(user => formData.assignees?.includes(user.id))
        .map(user => (
          <div
            key={user.id}
            className="flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-sm text-slate-800 dark:bg-slate-800 dark:text-slate-200"
          >
            <span>{user.name}</span>
            <button
              type="button"
              onClick={() => {
                const updated = formData.assignees?.filter(id => id !== user.id)
                setFormData({ ...formData, assignees: updated })
              }}
              className="cursor-pointer transition hover:text-rose-500"
            >
              ✕
            </button>
          </div>
        ))}
    </div>
  )}
</div>
  ) : (
              <p className="text-slate-950 dark:text-slate-100">
                {task.assignees && task.assignees.length > 0
                  ? task.assignees.map((user) => user.name).join(', ')
                  : 'No users assigned'}
              </p>
              )}
            </div>

            <div className="flex gap-3 pt-4">
              {isEditing ? (
                <>
                  <button
                    onClick={handleUpdate}
                    className="cursor-pointer rounded-xl bg-sky-600 px-4 py-2 text-white transition hover:bg-sky-500 dark:bg-sky-500 dark:hover:bg-sky-400"
                  >
                    Salvar
                  </button>

                  <button
                    onClick={() => setIsEditing(false)}
                    className="cursor-pointer rounded-xl bg-rose-600 px-4 py-2 text-white transition hover:bg-rose-500 dark:bg-rose-500 dark:hover:bg-rose-400"
                  >
                    Cancelar
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={handleStartEdit}
                    className="cursor-pointer rounded-xl bg-sky-600 px-4 py-2 text-white transition hover:bg-sky-500 dark:bg-sky-500 dark:hover:bg-sky-400"
                  >
                    Editar
                  </button>

                  <button
                    onClick={() => setShowDeleteModal(true)}
                    className="cursor-pointer rounded-xl bg-rose-600 px-4 py-2 text-white transition hover:bg-rose-500 dark:bg-rose-500 dark:hover:bg-rose-400"
                  >
                    Deletar
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {showDeleteModal && (
  <div
    className={modalOverlay}
    onClick={() => setShowDeleteModal(false)}
  >
    <div
      className={`${modalPanel} max-w-md p-6`}
      onClick={(e) => e.stopPropagation()}
    >
      <h3 className="text-lg font-semibold mb-2">
        Deletar tarefa
      </h3>

      <p className={`mb-6 text-sm ${mutedText}`}>
        Tem certeza que deseja deletar{" "}
        <span className="font-medium text-slate-950 dark:text-slate-100">
          {task.title.charAt(0).toUpperCase() + task.title.slice(1)}
        </span>
        ?
      </p>

      <div className="flex justify-end gap-3">
        <button
          onClick={() => setShowDeleteModal(false)}
          disabled={isDeleting}
          className="cursor-pointer px-4 py-2 text-sm text-slate-600 transition hover:text-slate-950 disabled:opacity-50 dark:text-slate-400 dark:hover:text-slate-100"
        >
          Cancelar
        </button>

        <button
          onClick={confirmDelete}
          disabled={isDeleting}
          className="cursor-pointer rounded-xl bg-rose-600 px-4 py-2 text-white transition hover:bg-rose-500 dark:bg-rose-500 dark:hover:bg-rose-400"
        >
          {isDeleting ? "Deletando..." : "Deletar"}
        </button>
      </div>
    </div>
  </div>
)}
    </div>
    </>
  )
}
