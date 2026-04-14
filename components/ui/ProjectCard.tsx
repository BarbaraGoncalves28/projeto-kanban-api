import Link from "next/link";
import { Calendar, Users } from "lucide-react";
import type { Project } from "@/lib/types";

type ProjectCardProps = {
  project: Project;
};

export function ProjectCard({ project }: ProjectCardProps) {
  const createdAt = project.created_at ?? project.createdAt;

  return (
    <Link
      href={`/board?project=${project.id}`}
      className="group block rounded-xl border bg-card p-6 shadow-sm transition-all hover:shadow-md hover:border-border/80"
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold text-foreground truncate group-hover:text-primary">
            {project.name}
          </h3>
          <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
            {project.description || "No description provided."}
          </p>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
        <div className="flex items-center gap-1">
          <Calendar className="h-3 w-3" />
          <span>
            Created {createdAt ? new Date(createdAt).toLocaleDateString() : "recently"}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <Users className="h-3 w-3" />
          <span>{project.id}</span>
        </div>
      </div>
    </Link>
  );
}
