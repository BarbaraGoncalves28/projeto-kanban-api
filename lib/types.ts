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
export type TaskStatus = "pendente" | "em_progresso" | "revisao" | "concluido";

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
  id: number;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  estimatedTime?: number; // in minutes
  estimated_time?: number; // in minutes
  dueDate?: string; // ISO date string
  due_date?: string; // ISO date string
  projectId?: number;
  project_id?: number;
  project?: Project;
  creatorId?: number;
  creator_id?: number;
  creator?: User;
  assignedUsers?: number[]; // array of user IDs
  assigned_users?: number[]; // array of user IDs
  assignees?: User[]; // populated users
  tags: number[]; // array of tag IDs
  taskTags?: Tag[]; // populated tags
  task_tags?: Tag[]; // populated tags
  createdAt?: string;
  updatedAt?: string;
  created_at?: string;
  updated_at?: string;
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
  estimated_time?: number;
  dueDate?: string;
  due_date?: string;
  projectId?: number;
  project_id?: number;
  assignedUsers?: number[];
  assigned_users?: number[];
  tags: number[];
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
