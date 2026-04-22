import Link from "next/link";
import { Calendar, MoreVertical, Pencil, Trash2, Users } from "lucide-react";
import type { Project } from "@/lib/types";
import { useEffect, useRef, useState } from "react";

type ProjectCardProps = {
  project: Project;
  onEdit?: (project: Project) => void;
  onDelete?: (project: Project) => void;
  isDeleting?: boolean;
};

export function ProjectCard({ project, onEdit, onDelete, isDeleting }: ProjectCardProps) {
  const createdAt = project.created_at ?? project.createdAt;
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
  const handleClickOutside = (event: MouseEvent) => {
    if (
      dropdownRef.current &&
      !dropdownRef.current.contains(event.target as Node)
    ) {
      setIsMenuOpen(false);
    }
  };

  if (isMenuOpen) {
    document.addEventListener("mousedown", handleClickOutside);
  }

  return () => {
    document.removeEventListener("mousedown", handleClickOutside);
  };
}, [isMenuOpen]);

  return (
    <Link
      href={`/board?project=${project.id}`}
      className="group relative block rounded-xl border bg-card p-6 shadow-sm transition-all hover:shadow-md hover:border-border/80"
    >

    <button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setIsMenuOpen((prev) => !prev);
        }}
        className="absolute top-4 right-4"
      >
        <MoreVertical className="w-5 h-5 text-muted-foreground cursor-pointer" />
      </button>

      {/* DROPDOWN */}
      {isMenuOpen && (
  <div 
    onClick={(e) => {
      e.preventDefault();
      e.stopPropagation();
    }}
    ref={dropdownRef}
    className="absolute right-2 top-10 mt-2 w-32 rounded-xl border border-gray-200 bg-white shadow-lg shadow-black/10 backdrop-blur-sm overflow-hidden z-50"
  >
    <button
      onClick={() => {
        onEdit?.(project);
        setIsMenuOpen(false);
      }}
      className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition cursor-pointer"
    >
      <Pencil className="w-4 h-4" />
      Editar
    </button>

    {/* separador */}
    <div className="mx-2 h-px bg-slate-100" />

    <button
      onClick={() => {
        if (isDeleting) return;
        onDelete?.(project);
        setIsMenuOpen(false);
      }}
      disabled={isDeleting}
      className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
    >
      <Trash2 className="w-4 h-4" />
      {isDeleting ? "Deletando..." : "Deletar"}
    </button>
  </div>
)}

      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold text-foreground truncate group-hover:text-primary">
            {project.name.charAt(0).toUpperCase() + project.name.slice(1)}
          </h3>
          <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
            {project.description
    ? project.description.charAt(0).toUpperCase() + project.description.slice(1)
    : "No description provided."}
          </p>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
        <div className="flex items-center gap-1">
          <Calendar className="h-3 w-3" />
          <span>
            Criado {createdAt ? new Date(createdAt).toLocaleDateString() : "recently"}
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
