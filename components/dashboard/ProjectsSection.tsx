"use client";

import { useEffect, useState } from "react";
import { useStore } from "@/lib/store";
import { CreateProjectModal } from "@/components/projects/CreateProjectModal";
import { ProjectCard } from "@/components/ui/ProjectCard";
import { Button } from "@/components/ui/Button";
import { SkeletonCard } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { CheckCircle2, FolderPlus, RefreshCw } from "lucide-react";
import type { Project } from "@/lib/types";
import { projectService } from "@/lib/services";

export function ProjectsSection() {
  const { projects, projectsLoading, projectsError, fetchProjects } = useStore();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);
  const [projectToEdit, setProjectToEdit] = useState<Project | null>(null);

  function closeModal() {
    setIsCreateModalOpen(false);
    setProjectToEdit(null);
    setSuccessMessage(null);
  }

  const handleDeleteProject = (project: Project) => {
  setProjectToDelete(project);
};

const confirmDeleteProject = async () => {
  if (!projectToDelete) return;

  try {
    setDeletingId(projectToDelete.id);

    await projectService.deleteProject(projectToDelete.id);
    await fetchProjects();

    setSuccessMessage(`Projeto "${projectToDelete.name}" deletado com sucesso.`);
    setProjectToDelete(null);
  } catch (error) {
    console.error("Erro ao deletar projeto:", error);
  } finally {
    setDeletingId(null);
  }
};

useEffect(() => {
  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === "Escape" && !deletingId) {
      setProjectToDelete(null);
    }
  };

  if (projectToDelete) {
    document.addEventListener("keydown", handleKeyDown);
  }

  return () => {
    document.removeEventListener("keydown", handleKeyDown);
  };
}, [projectToDelete, deletingId]);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  useEffect(() => {
    if (!successMessage) {
      return;
    }

    const timeout = window.setTimeout(() => {
      setSuccessMessage(null);
    }, 4000);

    return () => clearTimeout(timeout);
  }, [successMessage]);

  function handleCreateProject() {
    setIsCreateModalOpen(true);
  }

  function handleProjectCreated(project: Project) {
    setSuccessMessage(`Projeto "${project.name}" salvo com sucesso.`);
    closeModal();
  }

  if (projectsLoading) {
    return (
      <>
      <section className="rounded-3xl border bg-card p-8 shadow-sm">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Projects</h2>
          <Button onClick={handleCreateProject} disabled>
            Create Project
          </Button>
        </div>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      </section>
      <CreateProjectModal
        isOpen={isCreateModalOpen}
          onClose={closeModal}
          onSuccess={handleProjectCreated}
          projectToEdit={projectToEdit}
      />
      </>
    );
  }

  if (projectsError) {
    return (
      <>
      <section className="rounded-3xl border bg-card p-8 shadow-sm">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Projects</h2>
          <Button onClick={handleCreateProject}>
            Create Project
          </Button>
        </div>
        <div className="mt-6">
          <EmptyState
            title="Failed to load projects"
            description="There was an error loading your projects. Please try again."
            icon={<RefreshCw className="h-6 w-6" />}
            action={
              <Button onClick={fetchProjects} variant="outline">
                Try Again
              </Button>
            }
          />
        </div>
      </section>
      <CreateProjectModal
        isOpen={isCreateModalOpen}
          onClose={closeModal}
          onSuccess={handleProjectCreated}
          projectToEdit={projectToEdit}
      />
      </>
    );
  }

  return (
    <>
      <section className="rounded-3xl border bg-card p-8 shadow-sm">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Projects</h2>
          <Button onClick={handleCreateProject}>
            <FolderPlus className="mr-2 h-4 w-4" />
            Create Project
          </Button>
        </div>

        {successMessage ? (
          <div className="mt-6 flex items-center gap-3 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-700">
            <CheckCircle2 className="h-4 w-4" />
            <span>{successMessage}</span>
          </div>
        ) : null}

        {projects.length === 0 ? (
          <div className="mt-6">
            <EmptyState
              title="No projects yet"
              description="Create your first project to start organizing your tasks and collaborating with your team."
              icon={<FolderPlus className="h-6 w-6" />}
              action={
                <Button onClick={handleCreateProject}>
                  Create Your First Project
                </Button>
              }
            />
          </div>
        ) : (
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {projects.map((project) => (
              <ProjectCard key={project.id} project={project} onDelete={handleDeleteProject} onEdit={(project) => { setProjectToEdit(project);setIsCreateModalOpen(true);
}} isDeleting={deletingId === project.id}/>
            ))}
          </div>
        )}
      </section>

      <CreateProjectModal
        isOpen={isCreateModalOpen}
        onClose={closeModal}
        onSuccess={handleProjectCreated}
        projectToEdit={projectToEdit}
      />

      {projectToDelete && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setProjectToDelete(null)}>
    <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl" onClick={(e) => e.stopPropagation()}>
      
      <h3 className="text-lg font-semibold mb-2">
        Deletar projeto
      </h3>

      <p className="text-sm text-muted-foreground mb-6">
        Tem certeza que deseja deletar{" "}
        <span className="font-medium text-foreground">
          {projectToDelete.name}
        </span>
        ?
      </p>

      <div className="flex justify-end gap-3">
        <button
          onClick={() => setProjectToDelete(null)}
          disabled={deletingId === projectToDelete.id}
  className="px-4 py-2 text-sm text-slate-600 hover:text-slate-900 disabled:opacity-50"
        >
          Cancelar
        </button>

        <Button
          onClick={confirmDeleteProject}
          loading={deletingId === projectToDelete.id}
          disabled={deletingId === projectToDelete.id}
        >
          Deletar
        </Button>
      </div>
    </div>
  </div>
)}
    </>
  );
}
