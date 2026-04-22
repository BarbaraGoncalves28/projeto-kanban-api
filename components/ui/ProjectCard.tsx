import Link from "next/link";
import { Calendar, MoreVertical, Pencil, Trash2, Users } from "lucide-react";
import type { Project } from "@/lib/types";
import { useEffect, useRef, useState } from "react";
import { mutedText } from "@/lib/design";

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
      className="group relative block rounded-[1.75rem] border border-slate-200/70 bg-white/85 p-6 shadow-lg shadow-slate-200/50 backdrop-blur-sm transition-all hover:-translate-y-0.5 hover:border-sky-300/70 hover:shadow-xl hover:shadow-sky-100/60 dark:border-slate-800/80 dark:bg-slate-900/82 dark:shadow-black/25 dark:hover:border-sky-500/40 dark:hover:shadow-black/35"
    >

    <button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setIsMenuOpen((prev) => !prev);
        }}
        className="absolute right-4 top-4 rounded-full p-1.5 transition hover:bg-slate-100 dark:hover:bg-slate-800"
      >
        <MoreVertical className="h-5 w-5 cursor-pointer text-slate-500 dark:text-slate-400" />
      </button>

      {/* DROPDOWN */}
      {isMenuOpen && (
  <div 
    onClick={(e) => {
      e.preventDefault();
      e.stopPropagation();
    }}
    ref={dropdownRef}
    className="absolute right-2 top-10 z-50 mt-2 w-32 overflow-hidden rounded-2xl border border-slate-200/80 bg-white/95 shadow-lg shadow-slate-900/10 backdrop-blur dark:border-slate-700 dark:bg-slate-900/95 dark:shadow-black/30"
  >
    <button
      onClick={() => {
        onEdit?.(project);
        setIsMenuOpen(false);
      }}
      className="flex w-full cursor-pointer items-center gap-2 px-4 py-2.5 text-sm text-slate-700 transition hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-800"
    >
      <Pencil className="w-4 h-4" />
      Editar
    </button>

    {/* separador */}
    <div className="mx-2 h-px bg-slate-100 dark:bg-slate-800" />

    <button
      onClick={() => {
        if (isDeleting) return;
        onDelete?.(project);
        setIsMenuOpen(false);
      }}
      disabled={isDeleting}
      className="flex w-full cursor-pointer items-center gap-2 px-4 py-2.5 text-sm text-rose-600 transition hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-50 dark:text-rose-400 dark:hover:bg-rose-500/10"
    >
      <Trash2 className="w-4 h-4" />
      {isDeleting ? "Deletando..." : "Deletar"}
    </button>
  </div>
)}

      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <h3 className="truncate text-lg font-semibold text-slate-950 group-hover:text-sky-700 dark:text-slate-100 dark:group-hover:text-sky-300">
            {project.name.charAt(0).toUpperCase() + project.name.slice(1)}
          </h3>
          <p className={`mt-2 line-clamp-2 text-sm ${mutedText}`}>
            {project.description
    ? project.description.charAt(0).toUpperCase() + project.description.slice(1)
    : "No description provided."}
          </p>
        </div>
      </div>

      <div className={`mt-4 flex items-center justify-between text-xs ${mutedText}`}>
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
