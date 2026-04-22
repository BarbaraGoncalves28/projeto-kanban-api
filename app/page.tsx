import Link from "next/link";
import { panelSurface, pageShell } from "@/lib/design";

export default function Home() {
  return (
    <main className={`${pageShell} px-4 py-16`}>
      <div className={`mx-auto flex w-full max-w-4xl flex-col gap-10 ${panelSurface} p-10`}>
        <section className="space-y-4">
          <p className="text-sm uppercase tracking-[0.25em] text-sky-700 dark:text-sky-300">Kanbam Authentication</p>
          <h1 className="text-4xl font-semibold tracking-tight">Faça login, cadastre-se e proteja rotas com cookies.</h1>
          <p className="max-w-2xl text-sm leading-7 text-slate-600 dark:text-slate-400">
            Esta demonstração utiliza o Next.js App Router, interceptores Axios, react-hook-form e validação Zod. O token de acesso (bearer token) é armazenado em cookies e usado para proteger a rota do painel de controle.
          </p>
        </section>

        <section className="grid gap-4 sm:grid-cols-2">
          <Link
            href="/login"
            className="rounded-3xl border border-sky-500/30 bg-sky-600 px-6 py-5 text-center text-sm font-semibold text-white transition hover:bg-sky-500 dark:bg-sky-500 dark:hover:bg-sky-400"
          >
            Entrar
          </Link>
          <Link
            href="/register"
            className="rounded-3xl border border-slate-200 bg-white/80 px-6 py-5 text-center text-sm font-semibold text-slate-950 transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-100 dark:hover:bg-slate-800"
          >
            Cadastre-se
          </Link>
        </section>
      </div>
    </main>
  );
}
