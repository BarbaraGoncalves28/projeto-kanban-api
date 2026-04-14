"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { projectService, tagService } from "@/lib/services";
import { useStore } from "@/lib/store";
import { Button } from "@/components/ui/Button";
import { TextField } from "@/components/ui/TextField";
import type { Project, Tag } from "@/lib/types";

const createTaskSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  projectId: z.number().min(1, "Project is required"),
  priority: z.enum(["baixa", "media", "alta", "urgente"]),
  dueDate: z.string().optional(),
  tags: z.array(z.number()).default([]),
});

type CreateTaskForm = z.infer<typeof createTaskSchema>;

type CreateTaskModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onTaskCreated: () => void;
};

export function CreateTaskModal({ isOpen, onClose, onTaskCreated }: CreateTaskModalProps) {
  const { createTask } = useStore();
  const [projects, setProjects] = useState<Project[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<CreateTaskForm>({
    resolver: zodResolver(createTaskSchema),
    defaultValues: {
      priority: "media",
      tags: [],
    },
  });

  const selectedTags = watch("tags");

  useEffect(() => {
    if (isOpen) {
      const fetchData = async () => {
        try {
          const [projectsData, tagsData] = await Promise.all([
            projectService.getProjects(),
            tagService.getTags(),
          ]);
          setProjects(projectsData);
          setTags(tagsData);
        } catch (error) {
          console.error("Failed to fetch data:", error);
        } finally {
          setIsLoadingData(false);
        }
      };
      fetchData();
    }
  }, [isOpen]);

  const onSubmit = async (data: CreateTaskForm) => {
    setIsLoading(true);
    try {
      await createTask({
        title: data.title,
        description: data.description,
        status: "pendente",
        priority: data.priority,
        due_date: data.dueDate,
        project_id: data.projectId,
        assigned_users: [],
        tags: data.tags,
      });
      reset();
      onTaskCreated();
      onClose();
    } catch (error) {
      console.error("Failed to create task:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTagToggle = (tagId: number) => {
    const currentTags = selectedTags || [];
    const newTags = currentTags.includes(tagId)
      ? currentTags.filter(id => id !== tagId)
      : [...currentTags, tagId];
    setValue("tags", newTags);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold">Create New Task</h2>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600"
            >
              ✕
            </button>
          </div>

          {isLoadingData ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900"></div>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Project
                  </label>
                  <select
                    {...register("projectId", { valueAsNumber: true })}
                    className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-200"
                  >
                    <option value="">Select a project</option>
                    {projects.map((project) => (
                      <option key={project.id} value={project.id}>
                        {project.name}
                      </option>
                    ))}
                  </select>
                  {errors.projectId && (
                    <p className="mt-1 text-sm text-red-600">{errors.projectId.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Priority
                  </label>
                  <select
                    {...register("priority")}
                    className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-200"
                  >
                    <option value="baixa">Baixa</option>
                    <option value="media">Média</option>
                    <option value="alta">Alta</option>
                    <option value="urgente">Urgente</option>
                  </select>
                </div>
              </div>

              <TextField
                label="Title"
                {...register("title")}
                error={errors.title?.message}
              />

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Description
                </label>
                <textarea
                  {...register("description")}
                  rows={3}
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-200 resize-none"
                  placeholder="Task description..."
                />
              </div>

              <TextField
                label="Due Date"
                type="date"
                {...register("dueDate")}
              />

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-3">
                  Tags
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {tags.map((tag) => (
                    <label key={tag.id} className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedTags?.includes(tag.id) || false}
                        onChange={() => handleTagToggle(tag.id)}
                        className="rounded border-slate-300 text-slate-900 focus:ring-slate-200"
                      />
                      <span
                        className="text-sm px-2 py-1 rounded-full"
                        style={{
                          backgroundColor: tag.color ? `${tag.color}20` : '#f1f5f9',
                          color: tag.color || '#64748b'
                        }}
                      >
                        {tag.name}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-4 pt-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-6 py-3 text-sm font-medium text-slate-700 hover:text-slate-900"
                >
                  Cancel
                </button>
                <Button type="submit" loading={isLoading}>
                  Create Task
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
