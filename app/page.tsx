import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-50 px-4 py-16 text-slate-900">
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-10 rounded-3xl border border-slate-200 bg-white p-10 shadow-sm">
        <section className="space-y-4">
          <p className="text-sm uppercase tracking-[0.25em] text-slate-500">Kanbam Authentication</p>
          <h1 className="text-4xl font-semibold tracking-tight">Login, register, and protect routes with cookies.</h1>
          <p className="max-w-2xl text-sm leading-7 text-slate-600">
            This demo uses Next.js App Router, axios interceptors, react-hook-form, and zod validation. The bearer token is stored in cookies and is used to protect the dashboard route.
          </p>
        </section>

        <section className="grid gap-4 sm:grid-cols-2">
          <Link
            href="/login"
            className="rounded-3xl border border-slate-200 bg-slate-950 px-6 py-5 text-center text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            Sign in
          </Link>
          <Link
            href="/register"
            className="rounded-3xl border border-slate-200 bg-white px-6 py-5 text-center text-sm font-semibold text-slate-950 transition hover:bg-slate-100"
          >
            Register
          </Link>
        </section>
      </div>
    </main>
  );
}
