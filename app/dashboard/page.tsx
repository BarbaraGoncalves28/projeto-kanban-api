"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { ProjectsSection } from "@/components/dashboard/ProjectsSection";
import { LogoutButton } from "@/components/ui/LogoutButton";
import { useStore } from "@/lib/store";
import { Skeleton } from "@/components/ui/Skeleton";
import { mutedText, pageShell, panelSurface } from "@/lib/design";

export default function DashboardPage() {
  const router = useRouter();
  const { token, hasHydrated } = useStore();

  useEffect(() => {
    if (hasHydrated && !token) {
      router.push("/login");
    }
  }, [hasHydrated, token, router]);

  if (!hasHydrated || !token) {
    return (
      <div className={`${pageShell} px-4 py-10`}>
        <div className="mx-auto w-full max-w-5xl">
          <Skeleton className="h-32 rounded-3xl" />
        </div>
      </div>
    );
  }

  return (
    <div className={`${pageShell} px-4 py-10`}>
      <div className="mx-auto w-full max-w-5xl space-y-8">
        <header className={`flex flex-col gap-6 ${panelSurface} p-8 sm:flex-row sm:items-center sm:justify-between`}>
          <div className="flex-1">
            <p className={`text-sm font-medium uppercase tracking-wider ${mutedText}`}>
              Bem-Vindo
            </p>
            <h1 className="mt-3 text-3xl font-bold tracking-tight">Kanbam Dashboard</h1>
            <p className={`mt-2 ${mutedText}`}>
              Gerencie seus projetos e tarefas com facilidade.
            </p>
          </div>
          <div className="flex items-center justify-start sm:justify-end">
            <LogoutButton />
          </div>
        </header>

        <ProjectsSection />
      </div>
    </div>
  );
}
