"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, FolderPlus, X } from "lucide-react";
import { ProjectForm } from "@/components/projects/ProjectForm";
import { useStore } from "@/lib/store";
import type { CreateProjectPayload, Project } from "@/lib/types";
import { modalOverlay, modalPanel, mutedText } from "@/lib/design";

type CreateProjectModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (project: Project) => void;
  projectToEdit?: Project | null;
};

function getErrorMessage(error: unknown) {
  if (typeof error === "object" && error !== null) {
    const maybeMessage = "message" in error ? error.message : undefined;
    if (typeof maybeMessage === "string" && maybeMessage.trim()) {
      return maybeMessage;
    }

    const maybeErrors = "errors" in error ? error.errors : undefined;
    if (typeof maybeErrors === "object" && maybeErrors !== null) {
      const firstError = Object.values(maybeErrors)[0];
      if (Array.isArray(firstError) && typeof firstError[0] === "string") {
        return firstError[0];
      }
    }
  }

  return "Nao foi possivel criar o projeto. Tente novamente.";
}

export function CreateProjectModal({ isOpen, onClose, onSuccess, projectToEdit, }: CreateProjectModalProps) {
  const { createProject, updateProject } = useStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const isEditing = !!projectToEdit;

  useEffect(() => {
    if (!isOpen) {
      setErrorMessage(null);
      setSuccessMessage(null);
      setIsSubmitting(false);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape" && !isSubmitting) {
        onClose();
      }
    }

    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [isOpen, isSubmitting, onClose]);

  if (!isOpen) {
    return null;
  }

async function handleSubmit(values: CreateProjectPayload) {
  setIsSubmitting(true);
  setErrorMessage(null);

  try {
    let project: Project;

    if (isEditing) {
      project = await updateProject(projectToEdit!.id, values);
    } else {
      project = await createProject(values);
    }

    onSuccess?.(project);
    setSuccessMessage(
      isEditing
        ? "Projeto atualizado com sucesso!"
        : "Projeto criado com sucesso!"
    );

    setTimeout(() => onClose(), 300);
  } catch (error) {
    setErrorMessage(getErrorMessage(error));
  } finally {
    setIsSubmitting(false);
  }
}

  return (
    <div className={modalOverlay}>
      <div className={`${modalPanel} max-w-2xl overflow-hidden`}>
        <div className="border-b border-slate-200/80 bg-gradient-to-r from-sky-500/10 via-transparent to-sky-500/5 px-6 py-5 dark:border-slate-800/80 sm:px-8">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 rounded-full border border-sky-500/20 bg-sky-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-sky-700 dark:text-sky-300">
                <FolderPlus className="h-3.5 w-3.5" />
                {isEditing ? "Editar Projeto" : "Novo Projeto"}
              </div>
              <div>
                <h2 className="text-2xl font-semibold tracking-tight">{isEditing ? "Editar projeto" : "Criar projeto"}</h2>
                <p className={`mt-1 text-sm ${mutedText}`}>
                  {isEditing
                  ? "Atualize as informações do projeto."
                  : "Adicione um novo projeto ao painel sem sair da tela atual."}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="rounded-full p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-950 disabled:cursor-not-allowed disabled:opacity-50 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100"
              aria-label="Fechar modal"
            >
              <X className="h-5 w-5 cursor-pointer" />
            </button>
          </div>
        </div>

        <div className="px-6 py-6 sm:px-8">
          {successMessage ? (
            <div className="mb-5 flex items-center gap-3 rounded-xl border border-emerald-400/35 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 dark:border-emerald-500/25 dark:bg-emerald-500/10 dark:text-emerald-300">
              <CheckCircle2 className="h-4 w-4" />
              <span>{successMessage}</span>
            </div>
          ) : null}

          <ProjectForm
          initialValues={
          projectToEdit
      ?   {
            name: projectToEdit.name,
            description: projectToEdit.description ?? "",
          }
            : undefined
          }
            isSubmitting={isSubmitting}
            submitLabel={isEditing ? "Salvar alterações" : "Salvar projeto"}
            errorMessage={errorMessage}
            onCancel={onClose}
            onSubmit={handleSubmit}
          />
        </div>
      </div>
    </div>
  );
}
