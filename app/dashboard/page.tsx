"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { ProjectsSection } from "@/components/dashboard/ProjectsSection";
import { LogoutButton } from "@/components/ui/LogoutButton";
import { useStore } from "@/lib/store";
import { Skeleton } from "@/components/ui/Skeleton";

export default function DashboardPage() {
  const router = useRouter();
  const { token } = useStore();

  useEffect(() => {
    if (!token) {
      router.push("/login");
    }
  }, [token, router]);

  if (!token) {
    return (
      <div className="min-h-screen bg-background px-4 py-10">
        <div className="mx-auto w-full max-w-5xl">
          <Skeleton className="h-32 rounded-3xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background px-4 py-10">
      <div className="mx-auto w-full max-w-5xl space-y-8">
        <header className="flex flex-col gap-6 rounded-3xl border bg-card p-8 shadow-sm sm:flex-row sm:items-center sm:justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
              Welcome back
            </p>
            <h1 className="mt-3 text-3xl font-bold tracking-tight">Kanbam dashboard</h1>
            <p className="mt-2 text-muted-foreground">
              Manage your projects and tasks with ease.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <Link
              href="/board"
              className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              View Kanban Board
            </Link>
            <LogoutButton />
          </div>
        </header>

        <ProjectsSection />
      </div>
    </div>
  );
}
