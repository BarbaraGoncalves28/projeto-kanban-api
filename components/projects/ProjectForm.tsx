"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/Button";
import { TextField } from "@/components/ui/TextField";
import type { CreateProjectPayload } from "@/lib/types";
import { cn } from "@/lib/utils";

const projectFormSchema = z.object({
  name: z.string().trim().min(1, "O nome do projeto é obrigatório."),
  description: z.string().trim().min(1, "A descrição do projeto é obrigatória."),
});

export type ProjectFormValues = z.infer<typeof projectFormSchema>;

type ProjectFormProps = {
  initialValues?: {
    name: string;
    description?: string;
  };
  defaultValues?: Partial<CreateProjectPayload>;
  isSubmitting?: boolean;
  submitLabel?: string;
  errorMessage?: string | null;
  onCancel?: () => void;
  onSubmit: (values: CreateProjectPayload) => Promise<void> | void;
  className?: string;
};

export function ProjectForm({
  initialValues,
  defaultValues,
  isSubmitting = false,
  submitLabel = "Criar projeto",
  errorMessage,
  onCancel,
  onSubmit,
  className,
}: ProjectFormProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitSuccessful },
  } = useForm<ProjectFormValues>({
    resolver: zodResolver(projectFormSchema),
    defaultValues: {
      name: initialValues?.name ?? defaultValues?.name ?? "",
      description: initialValues?.description ?? defaultValues?.description ?? "",
    },
  });

  useEffect(() => {
  reset({
    name: initialValues?.name ?? "",
    description: initialValues?.description ?? "",
  });
}, [initialValues, reset]);

  useEffect(() => {
  if (isSubmitSuccessful) {
    reset({
      name: "",
      description: "",
    });
  }
}, [isSubmitSuccessful, reset]);

  return (
    <form onSubmit={handleSubmit((values) => onSubmit(values))} className={cn("space-y-5", className)}>
      <TextField
        id="project-name"
        label="Nome"
        placeholder="Ex.: Plataforma Mobile"
        autoComplete="off"
        disabled={isSubmitting}
        error={errors.name?.message}
        {...register("name")}
      />

      <div className="space-y-2">
        <label htmlFor="project-description" className="text-sm font-medium leading-none">
          Descrição
        </label>
        <textarea
          id="project-description"
          rows={4}
          placeholder="Descreva o objetivo, contexto ou escopo do projeto."
          disabled={isSubmitting}
          className={cn(
            "flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
            errors.description && "border-destructive focus-visible:ring-destructive"
          )}
          {...register("description")}
        />
        {errors.description ? (
          <p className="text-sm text-destructive">{errors.description.message}</p>
        ) : null}
      </div>

      {errorMessage ? (
        <div className="rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">
          {errorMessage}
        </div>
      ) : null}

      <div className="flex justify-end gap-3 pt-2">
        {onCancel ? (
          <Button type="button" variant="ghost" onClick={onCancel} disabled={isSubmitting}>
            Cancelar
          </Button>
        ) : null}
        <Button type="submit" loading={isSubmitting}>
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}
