import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { User, Project, Task } from "../types";

// Helper to get token from cookie (client-side only)
const getTokenFromCookie = () => {
  if (typeof window === "undefined") return null;
  const cookie = document.cookie
    .split("; ")
    .find((item) => item.startsWith("kanban_token="));
  return cookie?.split("=")[1] || null;
};

interface AuthState {
  user: User | null;
  token: string | null;
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  logout: () => void;
}

interface ProjectsState {
  projects: Project[];
  setProjects: (projects: Project[]) => void;
  addProject: (project: Project) => void;
  updateProject: (id: number, updates: Partial<Project>) => void;
  removeProject: (id: number) => void;
}

interface TasksState {
  tasks: Task[];
  setTasks: (tasks: Task[]) => void;
  addTask: (task: Task) => void;
  updateTask: (id: number, updates: Partial<Task>) => void;
  removeTask: (id: number) => void;
  moveTask: (taskId: number, newStatus: Task["status"]) => void;
}

type AppState = AuthState & ProjectsState & TasksState;

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Auth state
      user: null,
      token: getTokenFromCookie(), // Initialize from cookie
      setUser: (user) => set({ user }),
      setToken: (token) => {
        set({ token });
        // Also update cookie for server-side access
        if (typeof window !== "undefined") {
          document.cookie = `kanban_token=${token || ""}; path=/; max-age=${token ? "2592000" : "0"}; samesite=strict; secure=${process.env.NODE_ENV === "production"}`;
        }
      },
      logout: () => {
        set({ user: null, token: null });
        // Clear cookie
        if (typeof window !== "undefined") {
          document.cookie = "kanban_token=; path=/; max-age=0; samesite=strict";
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
        set({ projectsLoading: true, projectsError: null });
        try {
          const { projectService } = await import("@/lib/services");
          const projects = await projectService.getProjects();
          set({ projects, projectsLoading: false });
        } catch (error: any) {
          set({ projectsError: error?.message ?? "Failed to load projects", projectsLoading: false });
        }
      },
      addProject: (project) => set((state) => ({
        projects: [...state.projects, project]
      })),
      updateProject: (id, updates) => set((state) => ({
        projects: state.projects.map(p => p.id === id ? { ...p, ...updates } : p)
      })),
      removeProject: (id) => set((state) => ({
        projects: state.projects.filter(p => p.id !== id)
      })),

      // Tasks state
      tasks: [],
      tasksLoading: false,
      tasksError: null,
      setTasks: (tasks) => set({ tasks }),
      setTasksLoading: (loading) => set({ tasksLoading: loading }),
      setTasksError: (error) => set({ tasksError: error }),
      fetchTasks: async () => {
        set({ tasksLoading: true, tasksError: null });
        try {
          const { taskService } = await import("@/lib/services");
          const tasks = await taskService.getTasks();
          set({ tasks, tasksLoading: false });
        } catch (error: any) {
          set({ tasksError: error?.message ?? "Failed to load tasks", tasksLoading: false });
        }
      },
      updateTaskStatus: async (taskId: number, status: Task["status"]) => {
        try {
          const { taskService } = await import("@/lib/services");
          await taskService.updateTask(taskId, { status });
          // Optimistically update local state
          set((state) => ({
            tasks: state.tasks.map(task =>
              task.id === taskId ? { ...task, status } : task
            )
          }));
        } catch (error: any) {
          // Revert optimistic update on error
          await get().fetchTasks();
          throw error;
        }
      },
      createTask: async (taskData: Omit<Task, "id" | "created_at" | "updated_at">) => {
        try {
          const { taskService } = await import("@/lib/services");
          const newTask = await taskService.createTask(taskData);
          // Add to local state
          set((state) => ({
            tasks: [...state.tasks, newTask]
          }));
          return newTask;
        } catch (error: any) {
          throw error;
        }
      },
      addTask: (task) => set((state) => ({
        tasks: [...state.tasks, task]
      })),
      updateTask: (id, updates) => set((state) => ({
        tasks: state.tasks.map(t => t.id === id ? { ...t, ...updates } : t)
      })),
      removeTask: (id) => set((state) => ({
        tasks: state.tasks.filter(t => t.id !== id)
      })),
      moveTask: (taskId, newStatus) => set((state) => ({
        tasks: state.tasks.map(t => t.id === taskId ? { ...t, status: newStatus } : t)
      })),
    }),
    {
      name: "kanban-store",
      partialize: (state) => ({ token: state.token }), // Only persist token
    }
  )
);

// Selector hooks for better performance
export const useUser = () => useStore((state) => state.user);
export const useToken = () => useStore((state) => state.token);
export const useProjects = () => useStore((state) => state.projects);
export const useTasks = () => useStore((state) => state.tasks);

// Action hooks
export const useAuthActions = () => useStore((state) => ({
  setUser: state.setUser,
  setToken: state.setToken,
  logout: state.logout,
}));

export const useProjectActions = () => useStore((state) => ({
  setProjects: state.setProjects,
  addProject: state.addProject,
  updateProject: state.updateProject,
  removeProject: state.removeProject,
}));

export const useTaskActions = () => useStore((state) => ({
  setTasks: state.setTasks,
  addTask: state.addTask,
  updateTask: state.updateTask,
  removeTask: state.removeTask,
  moveTask: state.moveTask,
}));