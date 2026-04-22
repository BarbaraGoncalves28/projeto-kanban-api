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
export type TaskStatus = "pendente" | "em_progresso" | "revisao" | "concluida";

export type TaskPriority = "baixa" | "media" | "alta" | "urgente";

export interface User {
  id: number;
  name: string;
  email: string;
  avatar?: string;
  createdAt?: string;
  updatedAt?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Project {
  id: number;
  name: string;
  description?: string;
  ownerId?: number;
  owner_id?: number;
  owner?: User;
  createdAt?: string;
  updatedAt?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Tag {
  id: number;
  name: string;
  color?: string;
  projectId?: number;
  project_id?: number;
  createdAt?: string;
  updatedAt?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Task {
  id: number
  title: string
  description?: string
  status: TaskStatus
  priority: TaskPriority
  estimated_minutes?: number // in minutes
  due_date?: string // ISO date string
  project_id?: number
  project?: Project
  creator_id?: number
  creator?: User
  assignees?: User[] // populated users
  tags: Tag[] // array of tag objects
  created_at?: string
  updated_at?: string
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
  title: string
  description?: string
  status: TaskStatus
  priority: TaskPriority
  estimated_minutes?: number
  due_date?: string
  project_id: number
  assignees?: number[]
  tags: number[]
}

export interface UpdateTaskPayload extends Partial<CreateTaskPayload> {
  id: number;
}

export interface CreateProjectPayload {
  name: string;
  description?: string;
}

export interface CreateTagPayload {
  name: string;
  color?: string;
  project_id?: number;
  projectId?: number;
}

export interface Comment {
  id: number;
  userId?: number;
  user_id?: number;
  user?: User;
  message: string;
  createdAt?: string;
  updatedAt?: string;
  created_at?: string;
  updated_at?: string;
}
