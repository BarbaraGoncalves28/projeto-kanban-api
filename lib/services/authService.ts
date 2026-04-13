import { api } from "../api";
import type { AuthResponse, LoginPayload, RegisterPayload } from "../types";

export const authService = {
  async login(payload: LoginPayload): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>("/login", payload);
    return response.data;
  },

  async register(payload: RegisterPayload): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>("/register", payload);
    return response.data;
  },
};