import Link from "next/link";
import type { ReactNode } from "react";

type AuthPageShellProps = {
  title: string;
  description: string;
  actionLabel: string;
  actionHref: string;
  children: ReactNode;
};

export function AuthPageShell({ title, description, actionLabel, actionHref, children }: AuthPageShellProps) {
  return (
    <div className="min-h-screen bg-background px-4 py-12 text-foreground">
      <div className="mx-auto flex w-full max-w-md flex-col gap-8 rounded-3xl border bg-card p-8 shadow-sm">
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">{description}</p>
        </div>
        {children}
        <div className="text-center text-sm text-muted-foreground">
          <Link
            className="font-medium text-primary hover:text-primary/80 underline-offset-4 hover:underline"
            href={actionHref}
          >
            {actionLabel}
          </Link>
        </div>
      </div>
    </div>
  );
}
