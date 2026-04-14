"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { KanbanBoard } from "@/components/board/KanbanBoard";
import { useStore } from "@/lib/store";
import { Skeleton } from "@/components/ui/Skeleton";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";

export default function BoardPage() {
  const router = useRouter();
  const { token, hasHydrated } = useStore();

  useEffect(() => {
    if (hasHydrated && !token) {
      router.push("/login");
    }
  }, [hasHydrated, token, router]);

  if (!hasHydrated || !token) {
    return (
      <div className="min-h-screen bg-background px-4 py-10">
        <div className="mx-auto w-full max-w-7xl">
          <Skeleton className="h-32 rounded-3xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background px-4 py-10">
      <div className="mx-auto w-full max-w-7xl space-y-8">
        <header className="flex flex-col gap-6 rounded-3xl border bg-card p-8 shadow-sm sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <Link href="/dashboard">
              <Button variant="ghost" size="sm" className="p-2">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <div>
              <p className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
                Kanban Board
              </p>
              <h1 className="mt-1 text-3xl font-bold tracking-tight">Manage your tasks</h1>
              <p className="mt-2 text-muted-foreground">
                Drag and drop tasks between columns to update their status.
              </p>
            </div>
          </div>
        </header>

        <KanbanBoard />
      </div>
    </div>
  );
}
