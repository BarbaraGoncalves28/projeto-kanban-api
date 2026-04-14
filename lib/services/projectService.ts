import { createApiClient } from "../api";
import type { Project, CreateProjectPayload } from "../types";

function parseApiList<T>(payload: unknown): T[] {
  if (Array.isArray(payload)) {
    return payload;
  }

  if (typeof payload === "object" && payload !== null && "data" in payload) {
    return (payload as { data: T[] }).data;
  }

  return [];
}

export const projectService = {
  async getProjects(token?: string): Promise<Project[]> {
    const client = createApiClient(token);
    const response = await client.get("/projects");
    return parseApiList<Project>(response.data);
  },

  async getProject(id: number, token?: string): Promise<Project> {
    const client = createApiClient(token);
    const response = await client.get(`/projects/${id}`);
    return response.data.data ?? response.data;
  },

  async createProject(payload: CreateProjectPayload, token?: string): Promise<Project> {
    const client = createApiClient(token);
    const response = await client.post("/projects", payload);
    return response.data.data ?? response.data;
  },

  async updateProject(id: number, payload: Partial<CreateProjectPayload>, token?: string): Promise<Project> {
    const client = createApiClient(token);
    const response = await client.put(`/projects/${id}`, payload);
    return response.data.data ?? response.data;
  },

  async deleteProject(id: number, token?: string): Promise<void> {
    const client = createApiClient(token);
    await client.delete(`/projects/${id}`);
  },
};
