import { createApiClient } from "../api";
import type { Task, CreateTaskPayload, UpdateTaskPayload, PaginatedResponse, Tag } from "../types";

function parseApiList<T>(payload: unknown): T[] {
  if (Array.isArray(payload)) {
    return payload;
  }

  if (typeof payload === "object" && payload !== null && "data" in payload) {
    return (payload as any).data as T[];
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

    return tasks.map(task => ({
      ...task,
      taskTags: task.tags.map(id => tagMap.get(id)).filter(Boolean) as Tag[],
    }));
  } catch (error) {
    console.error("Failed to populate task tags:", error);
    return tasks;
  }
}

export const taskService = {
  async getTasks(projectId?: number, token?: string): Promise<Task[]> {
    const client = createApiClient(token);
    const url = projectId ? `/projects/${projectId}/tasks` : "/tasks";
    const response = await client.get(url);
    const tasks = parseApiList<Task>(response.data);
    return populateTaskTags(tasks, token);
  },

  async getTask(id: number, token?: string): Promise<Task> {
    const client = createApiClient(token);
    const response = await client.get(`/tasks/${id}`);
    return response.data.data ?? response.data;
  },

  async createTask(payload: CreateTaskPayload, token?: string): Promise<Task> {
    const client = createApiClient(token);
    const response = await client.post("/tasks", payload);
    return response.data.data ?? response.data;
  },

  async updateTask(payload: UpdateTaskPayload, token?: string): Promise<Task> {
    const client = createApiClient(token);
    const { id, ...updateData } = payload;
    const response = await client.put(`/tasks/${id}`, updateData);
    return response.data.data ?? response.data;
  },

  async deleteTask(id: number, token?: string): Promise<void> {
    const client = createApiClient(token);
    await client.delete(`/tasks/${id}`);
  },

  async updateTaskStatus(id: number, status: Task["status"], token?: string): Promise<Task> {
    const client = createApiClient(token);
    const response = await client.patch(`/tasks/${id}/status`, { status });
    return response.data.data ?? response.data;
  },
};