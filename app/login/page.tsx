"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, type LoginFormValues } from "@/lib/validators";
import { AuthPageShell } from "@/components/layout/AuthPageShell";
import { TextField } from "@/components/ui/TextField";
import { Button } from "@/components/ui/Button";
import { FormError } from "@/components/ui/FormError";
import { useStore } from "@/lib/store";

export default function LoginPage() {
  const router = useRouter();
  const { setToken, setUser } = useStore();
  const [serverError, setServerError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  async function onSubmit(values: LoginFormValues) {
    setIsLoading(true);
    setServerError(null);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      const data = await response.json();

      if (!response.ok) {
        setServerError(data.message || "Unable to login. Please try again.");
        return;
      }

      // Update store with token
      setToken(data.token);
      setUser(data.user);

      router.push("/dashboard");
    } catch {
      setServerError("Unable to login. Please check your connection.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <AuthPageShell
      className="cursor-pointer"
      title="Faça login"
      description="Insira suas credenciais para acessar seu painel de controle e gerenciar projetos."
      actionHref="/register"
      actionLabel="Crie uma conta"
    >
      <form className="flex flex-col gap-5" onSubmit={handleSubmit(onSubmit)}>
        <TextField label="Email:" id="email" type="email" autoComplete="email" {...register("email")} error={errors.email?.message} />
        <TextField label="Senha:" id="password" type="password" autoComplete="current-password" {...register("password")} error={errors.password?.message} />

        {serverError ? <FormError message={serverError} /> : null}

        <Button className="cursor-pointer" loading={isLoading}>Entrar</Button>
      </form>
    </AuthPageShell>
  );
}
