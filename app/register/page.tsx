"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { registerSchema, type RegisterFormValues } from "@/lib/validators";
import { AuthPageShell } from "@/components/layout/AuthPageShell";
import { TextField } from "@/components/ui/TextField";
import { Button } from "@/components/ui/Button";
import { FormError } from "@/components/ui/FormError";
import { useStore } from "@/lib/store";

export default function RegisterPage() {
  const router = useRouter();
  const { setToken } = useStore();
  const [serverError, setServerError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
  });

  async function onSubmit(values: RegisterFormValues) {
    setIsLoading(true);
    setServerError(null);

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      const data = await response.json();

      if (!response.ok) {
        setServerError(data.message || "Unable to register. Please try again.");
        return;
      }

      // Update store with token if provided
      if (data.token) {
        setToken(data.token);
      }

      router.push(data.token ? "/dashboard" : "/login");
    } catch (error) {
      setServerError("Unable to register. Please check your connection.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <AuthPageShell
      title="Create your account"
      description="Register with your email and get started using the Kanbam dashboard."
      actionHref="/login"
      actionLabel="Already have an account? Sign in"
    >
      <form className="flex flex-col gap-5" onSubmit={handleSubmit(onSubmit)}>
        <TextField label="Name" id="name" type="text" autoComplete="name" {...register("name")} error={errors.name?.message} />
        <TextField label="Email" id="email" type="email" autoComplete="email" {...register("email")} error={errors.email?.message} />
        <TextField label="Password" id="password" type="password" autoComplete="new-password" {...register("password")} error={errors.password?.message} />
        <TextField label="Confirm password" id="passwordConfirmation" type="password" autoComplete="new-password" {...register("passwordConfirmation")} error={errors.passwordConfirmation?.message} />

        {serverError ? <FormError message={serverError} /> : null}

        <Button loading={isLoading}>Create account</Button>
      </form>
    </AuthPageShell>
  );
}
