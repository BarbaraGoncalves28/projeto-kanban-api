import Link from "next/link";
import type { ReactNode } from "react";
import { cardSurface, mutedText, pageShell } from "@/lib/design";

type AuthPageShellProps = {
  title: string;
  description: string;
  actionLabel: string;
  actionHref: string;
  children: ReactNode;
  className?: string;
};

export function AuthPageShell({ title, description, actionLabel, actionHref, children }: AuthPageShellProps) {
  return (
    <div className={`${pageShell} px-4 py-12`}>
      <div className={`mx-auto flex w-full max-w-md flex-col gap-8 ${cardSurface} p-8`}>
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
          <p className={`mt-3 text-sm leading-6 ${mutedText}`}>{description}</p>
        </div>
        {children}
        <div className={`text-center text-sm ${mutedText}`}>
          <Link
            className="font-medium text-sky-700 underline-offset-4 hover:underline dark:text-sky-300"
            href={actionHref}
          >
            {actionLabel}
          </Link>
        </div>
      </div>
    </div>
  );
}
