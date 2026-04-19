import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { CreateTaskPayload, Project, Task, User } from '../types'

function getErrorMessage(error: unknown, fallback: string) {
  if (typeof error === 'object' && error !== null) {
    const message = 'message' in error ? error.message : undefined
    if (typeof message === 'string' && message.trim()) {
      return message
    }
  }

  if (error instanceof Error && error.message.trim()) {
    return error.message
  }

  return fallback
}

interface AuthState {
  user: User | null
  token: string | null
  hasHydrated: boolean
  setHasHydrated: (value: boolean) => void
  setUser: (user: User | null) => void
  setToken: (token: string | null) => void
  logout: () => void
}

interface ProjectsState {
  projects: Project[]
  projectsLoading: boolean
  projectsError: string | null
  setProjects: (projects: Project[]) => void
  setProjectsLoading: (loading: boolean) => void
  setProjectsError: (error: string | null) => void
  fetchProjects: () => Promise<void>
  createProject: (
    projectData: import('../types').CreateProjectPayload,
  ) => Promise<Project>
  addProject: (project: Project) => void
  updateProject: (id: number, updates: Partial<Project>) => Promise<Project>
  removeProject: (id: number) => void
}

interface TasksState {
  tasks: Task[]
  tasksLoading: boolean
  tasksError: string | null
  setTasks: (tasks: Task[]) => void
  setTasksLoading: (loading: boolean) => void
  setTasksError: (error: string | null) => void
  fetchTasks: (projectId?: number) => Promise<void>
  updateTaskStatus: (
    taskId: number,
    status: Task['status'],
    projectId?: number,
  ) => Promise<void>
  createTask: (taskData: CreateTaskPayload) => Promise<Task>
  addTask: (task: Task) => void
  updateTask: (id: number, updates: Partial<Task>) => void
  removeTask: (id: number) => void
  moveTask: (taskId: number, newStatus: Task['status']) => void
}

type AppState = AuthState & ProjectsState & TasksState

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Auth state
      user: null,
      token: null,
      hasHydrated: false,
      setHasHydrated: (value) => set({ hasHydrated: value }),
      setUser: (user) => set({ user }),
      setToken: (token) => {
        set({ token })
        // Also update cookie for server-side access
        if (typeof window !== 'undefined') {
          document.cookie = `kanban_token=${token || ''}; path=/; max-age=${token ? '2592000' : '0'}; samesite=strict; secure=${process.env.NODE_ENV === 'production'}`
        }
      },
      logout: () => {
        set({ user: null, token: null })
        // Clear cookie
        if (typeof window !== 'undefined') {
          document.cookie = 'kanban_token=; path=/; max-age=0; samesite=strict'
        }
      },

      // Projects state
      projects: [],
      projectsLoading: false,
      projectsError: null,
      setProjects: (projects) => set({ projects }),
      setProjectsLoading: (loading) => set({ projectsLoading: loading }),
      setProjectsError: (error) => set({ projectsError: error }),
      fetchProjects: async () => {
        set({ projectsLoading: true, projectsError: null })
        try {
          const { projectService } = await import('@/lib/services')
          const projects = await projectService.getProjects()
          set({ projects, projectsLoading: false })
        } catch (error: unknown) {
          const message =
            error instanceof Error ? error.message : 'Failed to load projects'
          set({ projectsError: message, projectsLoading: false })
        }
      },
      createProject: async (projectData) => {
        try {
          const { projectService } = await import('@/lib/services')
          const newProject = await projectService.createProject(projectData)
          set((state) => ({
            projects: [
              newProject,
              ...state.projects.filter(
                (project) => project.id !== newProject.id,
              ),
            ],
          }))
          return newProject
        } catch (error) {
          throw error
        }
      },
      addProject: (project) =>
        set((state) => ({
          projects: [
            project,
            ...state.projects.filter((item) => item.id !== project.id),
          ],
        })),
      updateProject: async (id, updates) => {
  try {
    const { projectService } = await import('@/lib/services')

    // 🔥 chama API
    const updatedProject = await projectService.updateProject(id, updates)

    // 🔥 atualiza estado local com resposta real do backend
    set((state) => ({
      projects: state.projects.map((p) =>
        p.id === id ? updatedProject : p
      ),
    }))

    return updatedProject
  } catch (error) {
    throw error
  }
},
      removeProject: (id) =>
        set((state) => ({
          projects: state.projects.filter((p) => p.id !== id),
        })),

      // Tasks state
      tasks: [],
      tasksLoading: false,
      tasksError: null,
      setTasks: (tasks) => set({ tasks }),
      setTasksLoading: (loading) => set({ tasksLoading: loading }),
      setTasksError: (error) => set({ tasksError: error }),
      fetchTasks: async (projectId?: number) => {
        set({ tasksLoading: true, tasksError: null })
        try {
          const { taskService } = await import('@/lib/services')
          const tasks = projectId ? await taskService.getTasks(projectId) : []

          const projects = get().projects

          const fullTasks = tasks.map((task) => {
            const resolvedProjectId =
              task.project_id ?? task.projectId ?? task.project?.id ?? projectId

            return {
              ...task,
              project_id: resolvedProjectId,
              projectId: resolvedProjectId,
              project:
                task.project ??
                projects.find((p) => p.id === resolvedProjectId),
            }
          })

          set({ tasks: fullTasks, tasksLoading: false })
        } catch (error: unknown) {
          const message =
            error instanceof Error ? error.message : 'Failed to load tasks'
          set({ tasksError: message, tasksLoading: false })
        }
      },
      updateTaskStatus: async (
        taskId: number,
        status: Task['status'],
        projectIdArg?: number,
      ) => {
        try {
          const { taskService } = await import('@/lib/services')
          const task = get().tasks.find((item) => item.id === taskId)
          const projectId = projectIdArg ?? task?.project_id ?? task?.projectId

          if (!projectId) {
            throw new Error('Project is required to update task status')
          }

          await taskService.updateTaskStatus(taskId, projectId, status)
          // Optimistically update local state
          set((state) => ({
            tasks: state.tasks.map((task) =>
              task.id === taskId ? { ...task, status } : task,
            ),
          }))
        } catch (error: unknown) {
          // Revert optimistic update on error
          const task = get().tasks.find((item) => item.id === taskId)
          const projectId = projectIdArg ?? task?.project_id ?? task?.projectId
          await get().fetchTasks(projectId)
          set({
            tasksError: getErrorMessage(
              error,
              'Nao foi possivel atualizar o status da tarefa agora.',
            ),
          })
        }
      },
      createTask: async (taskData: CreateTaskPayload) => {
        try {
          const { taskService } = await import('@/lib/services')
          const newTask = await taskService.createTask(taskData)

          set((state) => ({
            tasks: [...state.tasks, newTask],
          }))
          return newTask
        } catch (error: unknown) {
          throw error
        }
      },
      addTask: (task) =>
        set((state) => ({
          tasks: [...state.tasks, task],
        })),
      updateTask: (id, updates) =>
        set((state) => ({
          tasks: state.tasks.map((t) =>
            t.id === id ? { ...t, ...updates } : t,
          ),
        })),
      removeTask: (id) =>
        set((state) => ({
          tasks: state.tasks.filter((t) => t.id !== id),
        })),
      moveTask: (taskId, newStatus) =>
        set((state) => ({
          tasks: state.tasks.map((t) =>
            t.id === taskId ? { ...t, status: newStatus } : t,
          ),
        })),
    }),
    {
      name: 'kanban-store',
      partialize: (state) => ({ token: state.token }), // Only persist token
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true)
      },
    },
  ),
)

// Selector hooks for better performance
export const useUser = () => useStore((state) => state.user)
export const useToken = () => useStore((state) => state.token)
export const useHasHydrated = () => useStore((state) => state.hasHydrated)
export const useProjects = () => useStore((state) => state.projects)
export const useTasks = () => useStore((state) => state.tasks)

// Action hooks
export const useAuthActions = () =>
  useStore((state) => ({
    setUser: state.setUser,
    setToken: state.setToken,
    logout: state.logout,
  }))

export const useProjectActions = () =>
  useStore((state) => ({
    setProjects: state.setProjects,
    addProject: state.addProject,
    updateProject: state.updateProject,
    removeProject: state.removeProject,
  }))

export const useTaskActions = () =>
  useStore((state) => ({
    setTasks: state.setTasks,
    addTask: state.addTask,
    updateTask: state.updateTask,
    removeTask: state.removeTask,
    moveTask: state.moveTask,
  }))
