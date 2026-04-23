"use client";

import { useEffect, useState } from "react";
import { useStore } from "@/lib/store";
import { CreateProjectModal } from "@/components/projects/CreateProjectModal";
import { ProjectCard } from "@/components/ui/ProjectCard";
import { Button } from "@/components/ui/Button";
import { SkeletonCard } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { FolderPlus, RefreshCw } from "lucide-react";
import type { Project } from "@/lib/types";
import { projectService } from "@/lib/services";
import { cardSurface, modalOverlay, modalPanel, mutedText } from "@/lib/design";
import { toast } from "sonner";

export function ProjectsSection() {
  const { projects, projectsLoading, projectsError, fetchProjects } = useStore();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);
  const [projectToEdit, setProjectToEdit] = useState<Project | null>(null);

  function closeModal() {
    setIsCreateModalOpen(false);
    setProjectToEdit(null);
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

    toast.success(`Projeto "${projectToDelete.name}" deletado com sucesso!`);

    setProjectToDelete(null);
  } catch (error) {
    console.error("Erro ao deletar projeto:", error);

    toast.error("Não foi possível deletar o projeto.");
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


  function handleCreateProject() {
    setIsCreateModalOpen(true);
  }

  function handleProjectCreated() {
    closeModal();
  }

  if (projectsLoading) {
    return (
      <>
      <section className={`${cardSurface} p-8`}>
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Projects</h2>
          <Button className="cursor-pointer" onClick={handleCreateProject} disabled>
            Criar projeto
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
      <section className={`${cardSurface} p-8`}>
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Projetos</h2>
          <Button className="cursor-pointer" onClick={handleCreateProject}>
            Criar projeto
          </Button>
        </div>
        <div className="mt-6">
          <EmptyState
            title="Failed to load projects"
            description="There was an error loading your projects. Please try again."
            icon={<RefreshCw className="h-6 w-6" />}
            action={
              <Button onClick={fetchProjects} variant="outline">
                Tente novamente
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
      <section className={`${cardSurface} p-8`}>
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Projetos</h2>
          <Button className="cursor-pointer" onClick={handleCreateProject}>
            <FolderPlus className="mr-2 h-4 w-4" />
            Criar projeto
          </Button>
        </div>

        {projects.length === 0 ? (
          <div className="mt-6">
            <EmptyState
              title="No projects yet"
              description="Create your first project to start organizing your tasks and collaborating with your team."
              icon={<FolderPlus className="h-6 w-6" />}
              action={
                <Button onClick={handleCreateProject}>
                  Crie seu primeiro projeto
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
  <div className={modalOverlay} onClick={() => setProjectToDelete(null)}>
    <div className={`${modalPanel} max-w-md p-6`} onClick={(e) => e.stopPropagation()}>
      
      <h3 className="text-lg font-semibold mb-2">
        Deletar projeto
      </h3>

      <p className={`mb-6 text-sm ${mutedText}`}>
        Tem certeza que deseja deletar{" "}
        <span className="font-medium text-slate-950 dark:text-slate-100">
          {projectToDelete.name.charAt(0).toUpperCase() + projectToDelete.name.slice(1)}
        </span>
        ?
      </p>

      <div className="flex justify-end gap-3">
        <button
          onClick={() => setProjectToDelete(null)}
          disabled={deletingId === projectToDelete.id}
  className="cursor-pointer px-4 py-2 text-sm text-slate-600 transition hover:text-slate-950 disabled:opacity-50 dark:text-slate-400 dark:hover:text-slate-100"
        >
          Cancelar
        </button>

        <Button className="cursor-pointer"
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
