"use client";

import { useEffect } from "react";
import { useStore } from "@/lib/store";
import { ProjectCard } from "@/components/ui/ProjectCard";
import { Button } from "@/components/ui/Button";
import { SkeletonCard } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { FolderPlus, RefreshCw } from "lucide-react";

export function ProjectsSection() {
  const { projects, projectsLoading, projectsError, fetchProjects } = useStore();

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  function handleCreateProject() {
    // TODO: Implement create project modal/form
    alert("Create project functionality not implemented yet");
  }

  if (projectsLoading) {
    return (
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
    );
  }

  if (projectsError) {
    return (
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
    );
  }

  return (
    <section className="rounded-3xl border bg-card p-8 shadow-sm">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Projects</h2>
        <Button onClick={handleCreateProject}>
          <FolderPlus className="mr-2 h-4 w-4" />
          Create Project
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
                Create Your First Project
              </Button>
            }
          />
        </div>
      ) : (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      )}
    </section>
  );
}