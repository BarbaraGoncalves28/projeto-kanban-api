export type LoginPayload = {
  email: string;
  password: string;
};

export type RegisterPayload = {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
};

export interface AuthResponse {
  token?: string;
  access_token?: string;
  message?: string;
}

// Kanban System Types
export type TaskStatus = "backlog" | "pendente" | "em_progresso" | "revisao" | "concluido";

export type TaskPriority = "baixa" | "media" | "alta" | "urgente";

export interface User {
  id: number;
  name: string;
  email: string;
  avatar?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Project {
  id: number;
  name: string;
  description?: string;
  ownerId: number;
  owner?: User;
  createdAt: string;
  updatedAt: string;
}

export interface Tag {
  id: number;
  name: string;
  color?: string;
  projectId?: number;
  createdAt: string;
  updatedAt: string;
}

export interface Task {
  id: number;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  estimatedTime?: number; // in minutes
  dueDate?: string; // ISO date string
  projectId: number;
  project?: Project;
  creatorId: number;
  creator?: User;
  assignedUsers: number[]; // array of user IDs
  assignees?: User[]; // populated users
  tags: number[]; // array of tag IDs
  taskTags?: Tag[]; // populated tags
  createdAt: string;
  updatedAt: string;
}

// API Response types
export interface ApiResponse<T> {
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  currentPage: number;
  lastPage: number;
  perPage: number;
  total: number;
}

// Form types
export interface CreateTaskPayload {
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  estimatedTime?: number;
  dueDate?: string;
  projectId: number;
  assignedUsers: number[];
  tags: number[];
}

export interface UpdateTaskPayload extends Partial<CreateTaskPayload> {
  id: number;
}

export interface CreateProjectPayload {
  name: string;
  description?: string;
}

export interface Comment {
  id: number;
  userId: number;
  user?: User;
  message: string;
  createdAt: string;
  updatedAt: string;
}