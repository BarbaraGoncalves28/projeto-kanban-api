import axios from "axios";
import { createApiClient } from "../api";
import type { Task, CreateTaskPayload, UpdateTaskPayload, Tag } from "../types";

const uiToApiStatusCandidates = {
  pendente: ["pendente", "a_fazer", "todo"],
  em_progresso: ["em_progresso", "em_andamento", "fazendo", "doing"],
  revisao: ["revisao", "em_revisao", "review"],
  concluido: ["concluido", "concluida", "done"],
} as const;

function getPrimaryApiStatus(status: Task["status"]) {
  return uiToApiStatusCandidates[status][0];
}

function isStatusValidationError(error: unknown) {
  if (typeof error !== "object" || error === null) {
    return false;
  }

  const message = "message" in error && typeof error.message === "string" ? error.message : "";
  const errors = "errors" in error ? error.errors : undefined;

  if (message.toLowerCase().includes("status selecionado")) {
    return true;
  }

  if (typeof errors === "object" && errors !== null && "status" in errors) {
    return true;
  }

  return false;
}

function normalizeTaskStatusFromApi(status: string | undefined): Task["status"] {
  switch (status) {
    case "pendente":
    case "a_fazer":
    case "todo":
      return "pendente";
    case "fazendo":
    case "doing":
    case "em_andamento":
    case "em_progresso":
      return "em_progresso";
    case "review":
    case "em_revisao":
    case "revisao":
      return "revisao";
    case "done":
    case "concluida":
    case "concluido":
      return "concluido";
    default:
      return "pendente";
  }
}

function normalizeTaskFromApi(task: Task): Task {
  return {
    ...task,
    status: normalizeTaskStatusFromApi(task.status),
  };
}

function parseApiList<T>(payload: unknown): T[] {
  if (Array.isArray(payload)) {
    return payload;
  }

  if (typeof payload === "object" && payload !== null && "data" in payload) {
    return (payload as { data: T[] }).data;
  }

  return [];
}

async function populateTaskTags(tasks: Task[], token?: string): Promise<Task[]> {
  if (tasks.length === 0) return tasks;

  try {
    const client = createApiClient(token);
    const response = await client.get("/tags");
    const allTags: Tag[] = parseApiList<Tag>(response.data);

    const tagMap = new Map(allTags.map(tag => [tag.id, tag]));

    return tasks.map((task) => {
      const normalizedTask = normalizeTaskFromApi(task);

      return {
        ...normalizedTask,
        taskTags: normalizedTask.tags.map(id => tagMap.get(id)).filter(Boolean) as Tag[],
      };
    });
  } catch (error) {
    console.error("Failed to populate task tags:", error);
    return tasks.map(normalizeTaskFromApi);
  }
}

function getTaskProjectId(payload: { project_id?: number; projectId?: number }) {
  return payload.project_id ?? payload.projectId;
}

function buildProjectTaskUrl(projectId: number, taskId: number) {
  return `/projects/${projectId}/tasks/${taskId}`;
}

function normalizeTaskMutationPayload(payload: Partial<CreateTaskPayload>) {
  const normalized = {
    project_id: payload.project_id ?? payload.projectId,
    title: payload.title,
    description: payload.description,
    status: payload.status ? getPrimaryApiStatus(payload.status) : undefined,
    priority: payload.priority,
    due_date: payload.due_date ?? payload.dueDate,
    estimated_time: payload.estimated_time ?? payload.estimatedTime,
    assigned_users: payload.assigned_users ?? payload.assignedUsers,
    tags: payload.tags,
  };

  return Object.fromEntries(
    Object.entries(normalized).filter(([, value]) => value !== undefined)
  );
}

export const taskService = {
  async getTasks(projectId?: number, token?: string): Promise<Task[]> {
    const client = createApiClient(token);
    const url = projectId ? `/projects/${projectId}/tasks` : "/tasks";
    try {
      const response = await client.get(url);
      const tasks = parseApiList<Task>(response.data);
      return populateTaskTags(tasks, token);
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 404 && url === "/tasks") {
        return [];
      }

      throw error;
    }
  },

  async getTask(id: number, token?: string): Promise<Task> {
    const client = createApiClient(token);
    const response = await client.get(`/tasks/${id}`);
    return normalizeTaskFromApi(response.data.data ?? response.data);
  },

  async createTask(payload: CreateTaskPayload, token?: string): Promise<Task> {
    const client = createApiClient(token);
    const projectId = getTaskProjectId(payload);

    if (!projectId) {
      throw new Error("Project is required to create a task");
    }

    const response = await client.post(`/projects/${projectId}/tasks`, normalizeTaskMutationPayload(payload));
    return normalizeTaskFromApi(response.data.data ?? response.data);
  },

  async updateTask(payload: UpdateTaskPayload, token?: string): Promise<Task> {
    const client = createApiClient(token);
    const { id, ...updateData } = payload;
    const projectId = getTaskProjectId(updateData);

    if (!projectId) {
      throw new Error("Project is required to update a task");
    }

    const response = await client.put(
      buildProjectTaskUrl(projectId, id),
      normalizeTaskMutationPayload(updateData)
    );
    return normalizeTaskFromApi(response.data.data ?? response.data);
  },

  async deleteTask(id: number, token?: string): Promise<void> {
    const client = createApiClient(token);
    await client.delete(`/tasks/${id}`);
  },

  async updateTaskStatus(
    id: number,
    projectId: number,
    status: Task["status"],
    token?: string
  ): Promise<Task> {
    const client = createApiClient(token);
    const candidates = uiToApiStatusCandidates[status];
    let lastError: unknown;

    for (const candidate of candidates) {
      try {
        const response = await client.patch(buildProjectTaskUrl(projectId, id), {
          status: candidate,
        });

        return normalizeTaskFromApi(response.data.data ?? response.data);
      } catch (error) {
        lastError = error;

        if (!isStatusValidationError(error)) {
          throw error;
        }
      }
    }

    throw lastError;
  },
};
