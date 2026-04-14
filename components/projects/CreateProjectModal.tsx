"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, FolderPlus, X } from "lucide-react";
import { ProjectForm } from "@/components/projects/ProjectForm";
import { useStore } from "@/lib/store";
import type { CreateProjectPayload, Project } from "@/lib/types";

type CreateProjectModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onProjectCreated?: (project: Project) => void;
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

export function CreateProjectModal({ isOpen, onClose, onProjectCreated }: CreateProjectModalProps) {
  const { createProject } = useStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

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
      const project = await createProject(values);
      setSuccessMessage(`Projeto "${project.name}" criado com sucesso.`);
      onProjectCreated?.(project);
      window.setTimeout(() => {
        onClose();
      }, 600);
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="w-full max-w-2xl overflow-hidden rounded-3xl border border-border bg-background shadow-2xl">
        <div className="border-b border-border bg-gradient-to-r from-primary/10 via-transparent to-primary/5 px-6 py-5 sm:px-8">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-primary">
                <FolderPlus className="h-3.5 w-3.5" />
                Novo Projeto
              </div>
              <div>
                <h2 className="text-2xl font-semibold tracking-tight">Criar projeto</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Adicione um novo projeto ao painel sem sair da tela atual.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="rounded-full p-2 text-muted-foreground transition hover:bg-accent hover:text-foreground disabled:cursor-not-allowed disabled:opacity-50"
              aria-label="Fechar modal"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="px-6 py-6 sm:px-8">
          {successMessage ? (
            <div className="mb-5 flex items-center gap-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-700">
              <CheckCircle2 className="h-4 w-4" />
              <span>{successMessage}</span>
            </div>
          ) : null}

          <ProjectForm
            isSubmitting={isSubmitting}
            submitLabel="Salvar projeto"
            errorMessage={errorMessage}
            onCancel={onClose}
            onSubmit={handleSubmit}
          />
        </div>
      </div>
    </div>
  );
}
