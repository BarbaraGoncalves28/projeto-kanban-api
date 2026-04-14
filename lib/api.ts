import axios, { AxiosHeaders, AxiosInstance } from "axios";
import { getBrowserToken } from "@/lib/auth";
import type { AuthResponse, LoginPayload, RegisterPayload, Project, Tag } from "./types";

export const BASE_URL = "https://kanbam-api-main-vdfpic.free.laravel.cloud/api";

function parseApiList<T>(payload: unknown): T[] {
  if (Array.isArray(payload)) {
    return payload;
  }

  if (typeof payload === "object" && payload !== null && "data" in payload) {
    return (payload as { data: T[] }).data;
  }

  return [];
}

function createInstance(token?: string): AxiosInstance {
  const instance = axios.create({
    baseURL: BASE_URL,
    headers: {
      Accept: "application/json",
    },
  });

  instance.interceptors.request.use((config) => {
    if (!config.headers) {
      config.headers = new AxiosHeaders();
    }

    const authToken = token ?? getBrowserToken();

    if (authToken) {
      config.headers.set("Authorization", `Bearer ${authToken}`);
    }

    return config;
  });

  instance.interceptors.response.use(
    (response) => response,
    (error) => {
      if (axios.isAxiosError(error)) {
        const status = error.response?.status;
        const url = error.config?.url;
        const isMissingTasksEndpoint = status === 404 && url === "/tasks";
        const isTaskStatusValidationError =
          status === 422 &&
          error.config?.method?.toLowerCase() === "patch" &&
          typeof url === "string" &&
          /\/projects\/\d+\/tasks\/\d+$/.test(url);

        if (!isMissingTasksEndpoint && !isTaskStatusValidationError) {
          console.error(`[API] Request failed: ${error.config?.method?.toUpperCase()} ${url} - Status: ${status}`);
        }

        // Global error handling
        if (status === 401) {
          console.error("[API] 401 Unauthorized - clearing token and redirecting to login");
          // Clear token from cookie
          if (typeof window !== "undefined") {
            document.cookie = "kanban_token=; path=/; max-age=0; samesite=strict";
          }
          // If client-side, redirect to login
          if (typeof window !== "undefined") {
            window.location.href = "/login";
          }
        } else if (status === 500) {
          console.error("Server error:", error.response?.data);
        }

        return Promise.reject(error.response?.data ?? error);
      }

      return Promise.reject(error);
    }
  );

  return instance;
}

export const api = createInstance();

export function createApiClient(token?: string) {
  return createInstance(token);
}

// Legacy functions - moved to services
export async function login(payload: LoginPayload) {
  const response = await api.post<AuthResponse>("/login", payload);
  return response.data;
}

export async function register(payload: RegisterPayload) {
  const response = await api.post<AuthResponse>("/register", payload);
  return response.data;
}

export async function getProjects(token?: string) {
  const response = await createApiClient(token).get("/projects");
  return parseApiList<Project>(response.data);
}

export async function getTags(token?: string) {
  const response = await createApiClient(token).get("/tags");
  return parseApiList<Tag>(response.data);
}
