import { createApiClient } from "../api";
import type { User } from "../types";

export const userService = {
  async getCurrentUser(token?: string): Promise<User> {
    const client = createApiClient(token);
    const response = await client.get("/user");
    return response.data.data ?? response.data;
  },

  async getUsers(token?: string): Promise<User[]> {
    const client = createApiClient(token);
    const response = await client.get("/users");
    return response.data.data ?? response.data;
  },

  async getUser(id: number, token?: string): Promise<User> {
    const client = createApiClient(token);
    const response = await client.get(`/users/${id}`);
    return response.data.data ?? response.data;
  },
};