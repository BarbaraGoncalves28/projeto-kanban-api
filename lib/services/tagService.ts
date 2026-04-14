import { createApiClient } from "../api";
import type { Tag, CreateTagPayload } from "../types";

function parseApiList<T>(payload: unknown): T[] {
  if (Array.isArray(payload)) {
    return payload;
  }

  if (typeof payload === "object" && payload !== null && "data" in payload) {
    return (payload as { data: T[] }).data;
  }

  return [];
}

export const tagService = {
  async getTags(token?: string): Promise<Tag[]> {
    const client = createApiClient(token);
    const response = await client.get("/tags");
    return parseApiList<Tag>(response.data);
  },

  async getTag(id: number, token?: string): Promise<Tag> {
    const client = createApiClient(token);
    const response = await client.get(`/tags/${id}`);
    return response.data.data ?? response.data;
  },

  async createTag(payload: CreateTagPayload, token?: string): Promise<Tag> {
    const client = createApiClient(token);
    const response = await client.post("/tags", payload);
    return response.data.data ?? response.data;
  },

  async updateTag(id: number, payload: Partial<CreateTagPayload>, token?: string): Promise<Tag> {
    const client = createApiClient(token);
    const response = await client.put(`/tags/${id}`, payload);
    return response.data.data ?? response.data;
  },

  async deleteTag(id: number, token?: string): Promise<void> {
    const client = createApiClient(token);
    await client.delete(`/tags/${id}`);
  },
};
