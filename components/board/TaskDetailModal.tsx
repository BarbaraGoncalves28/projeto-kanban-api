'use client'

import { projectService, taskService, userService, tagService } from '@/lib/services'
import { useStore } from '@/lib/store'
import type { Task, User, Tag } from '@/lib/types'
import { useEffect, useState } from 'react'

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
      await taskService.updateTask({
        id: task.id,
        title: formData.title,
        description: formData.description,
        status: formData.status,
        priority: formData.priority,
        due_date: formData.due_date,
        estimated_minutes: formData.estimated_minutes,
        project_id: Number(formData.project_id ?? projectId),

        // 🔥 AQUI ESTÁ A CORREÇÃO
        assignees:
        formData.assignees ??
        task.assignees?.map((user) => user.id),
        tags: formData.tags,
      })

      // 🔥 atualiza o store
      useStore.getState().updateTask(task.id, {
  title: formData.title ?? task.title,
  description: formData.description ?? task.description,
  status: formData.status ?? task.status,
  priority: formData.priority ?? task.priority,
  due_date: formData.due_date ?? task.due_date,
  project_id: formData.project_id ?? task.project_id,
  estimated_minutes:
    formData.estimated_minutes ?? task.estimated_minutes,

  // ✅ mantém formato correto (User[])
  assignees: users.filter(user =>
  formData.assignees?.includes(user.id)
),

tags: tags.filter(tag =>
  formData.tags?.includes(tag.id)
),
})

      setIsEditing(false)
      onClose()
    } catch (err) {
      console.error('Erro ao atualizar tarefa:', err)
    }
  }

  // 🔴 DELETE TASK
  async function confirmDelete() {
  if (!task || !task.project_id) return

  try {
    setIsDeleting(true)

    await taskService.deleteTask(task.id, task.project_id)
    useStore.getState().removeTask(task.id)

    setShowDeleteModal(false)
    onClose()
  } catch (err) {
    console.error('Erro ao deletar tarefa:', err)
  } finally {
    setIsDeleting(false)
  }
}

  return (
    <>
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto relative">

        <button
              onClick={() => {setIsEditing(false)
              setShowDeleteModal(false)
              onClose()
              }}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 text-xl cursor-pointer"
            >
              ✕
            </button>
        <div className="p-8 pt-20">
          
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
          </div>

          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-3">
                Descrição:
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
                  {task.description
    ? task.description.charAt(0).toUpperCase() + task.description.slice(1)
    : 'No description provided.'}
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-sm font-medium text-slate-500">
                  Status:
                </span>

                {isEditing ? (
                  <select className="border p-2 w-full cursor-pointer" value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value as Task['status'],})}>
                    <option value="pendente">Pendente</option>
                    <option value="em_progresso">Em progresso</option>
                    <option value="revisao">Revisão</option>
                    <option value="concluido">Concluído</option>
                  </select>
                ) : (
                <p className="text-slate-900 capitalize">
                  {task.status.replace('_', ' ')}
                </p>
                )}
              </div>
              <div>
                <span className="text-sm font-medium text-slate-500">
                  Prioridade:
                </span>
                {isEditing ? (
                  <select
                    className="border p-2 w-full cursor-pointer"
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
                    {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                  </p>
                )}
              </div>
              <div>
                <span className="text-sm font-medium text-slate-500">
                  Projeto:
                </span>

                  <p className="text-slate-900">
                    {resolvedProjectName ?? projectName}
                  </p>
              </div>
              <div>
                <span className="text-sm font-medium text-slate-500">
                  Data de criação:
                </span>

                {isEditing ? (
                  <input
                    type="date"
                    className="border p-2 w-full cursor-pointer"
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

                <div>
  <span className="text-sm font-medium text-slate-500">
    Criador(a):
  </span>
  <p className="text-slate-900">
    {task.creator?.name
    ? task.creator.name.charAt(0).toUpperCase() + task.creator.name.slice(1)
    : 'Unknown'}
  </p>
</div>

              <div>
  <span className="text-sm font-medium text-slate-500">
    Duração (minutos):
  </span>

  {isEditing ? (
    <input
      type="number"
      className="border p-2 w-full"
      value={formData.estimated_minutes ?? ''}
      onChange={(e) =>
        setFormData({
          ...formData,
          estimated_minutes: Number(e.target.value),
        })
      }
    />
  ) : (
    <p className="text-slate-900">
      {task.estimated_minutes
        ? `${task.estimated_minutes} min`
        : 'No estimate'}
    </p>
  )}
</div>
            </div>

            {taskTags && taskTags.length > 0 && (
              <div>
                <span className="text-sm font-medium text-slate-500 block mb-2">
                  Tags:
                </span>


                {isEditing ? (
    <div className="relative">
  <div
    onClick={() => setIsTagDropdownOpen(prev => !prev)}
    className="w-full border p-2 cursor-pointer"
  >
    {formData.tags && formData.tags.length > 0
      ? "Adicionar mais tags"
      : "Selecionar tags"}
  </div>

  {isTagDropdownOpen && (
    <div className="absolute z-10 mt-2 w-full bg-white border rounded shadow max-h-48 overflow-y-auto">
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
            className={`px-4 py-2 cursor-pointer hover:bg-gray-100 ${
              isSelected ? "bg-gray-100 font-medium" : ""
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
              className="hover:text-red-500 cursor-pointer"
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
              <span className="text-sm font-medium text-slate-500 cursor-pointer">
                Usuários atribuídos:
              </span>
               {isEditing ? (
    <div className="relative">
  <div
    onClick={() => setIsUserDropdownOpen(prev => !prev)}
    className="w-full border p-2 cursor-pointer"
  >
    {formData.assignees && formData.assignees.length > 0
      ? "Adicionar mais usuários"
      : "Selecione usuários"}
  </div>

  {isUserDropdownOpen && (
    <div className="absolute z-10 mt-2 w-full bg-white border rounded shadow max-h-48 overflow-y-auto">
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
            className={`px-4 py-2 cursor-pointer hover:bg-gray-100 ${
              isSelected ? "bg-gray-100 font-medium" : ""
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
            className="flex items-center gap-2 bg-gray-100 px-3 py-1 rounded-full text-sm"
          >
            <span>{user.name}</span>
            <button
              type="button"
              onClick={() => {
                const updated = formData.assignees?.filter(id => id !== user.id)
                setFormData({ ...formData, assignees: updated })
              }}
              className="hover:text-red-500 cursor-pointer"
            >
              ✕
            </button>
          </div>
        ))}
    </div>
  )}
</div>
  ) : (
              <p className="text-slate-900">
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
                    className="bg-blue-600 text-white px-4 py-2 rounded cursor-pointer"
                  >
                    Salvar
                  </button>

                  <button
                    onClick={() => setIsEditing(false)}
                    className="bg-red-600 text-white px-4 py-2 rounded cursor-pointer"
                  >
                    Cancelar
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={handleStartEdit}
                    className="bg-blue-500 text-white px-4 py-2 rounded cursor-pointer"
                  >
                    Editar
                  </button>

                  <button
                    onClick={() => setShowDeleteModal(true)}
                    className="bg-red-600 text-white px-4 py-2 rounded cursor-pointer"
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
    className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
    onClick={() => setShowDeleteModal(false)}
  >
    <div
      className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl"
      onClick={(e) => e.stopPropagation()}
    >
      <h3 className="text-lg font-semibold mb-2">
        Deletar tarefa
      </h3>

      <p className="text-sm text-muted-foreground mb-6">
        Tem certeza que deseja deletar{" "}
        <span className="font-medium text-foreground">
          {task.title}
        </span>
        ?
      </p>

      <div className="flex justify-end gap-3">
        <button
          onClick={() => setShowDeleteModal(false)}
          disabled={isDeleting}
          className="px-4 py-2 text-sm text-slate-600 hover:text-slate-900 disabled:opacity-50 cursor-pointer"
        >
          Cancelar
        </button>

        <button
          onClick={confirmDelete}
          disabled={isDeleting}
          className="bg-red-600 text-white px-4 py-2 rounded cursor-pointer"
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