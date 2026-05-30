'use client'

import { AuthPageShell } from '@/components/layout/AuthPageShell'
import { Button } from '@/components/ui/Button'
import { FormError } from '@/components/ui/FormError'
import { TextField } from '@/components/ui/TextField'
import { useStore } from '@/lib/store'
import { loginSchema, type LoginFormValues } from '@/lib/validators'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { useForm } from 'react-hook-form'

export default function LoginPage() {
  const router = useRouter()
  const { setToken, setUser } = useStore()
  const [serverError, setServerError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  })

  async function onSubmit(values: LoginFormValues) {
    setIsLoading(true)
    setServerError(null)

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      })

      const data = await response.json()

      if (!response.ok) {
        const fieldErrors = data.errors as
          | Record<string, string[] | string>
          | undefined
        let mappedFieldError = false

        if (fieldErrors) {
          ;(['email', 'password'] as const).forEach((field) => {
            const fieldError = fieldErrors[field]
            const message = Array.isArray(fieldError)
              ? fieldError[0]
              : fieldError
            if (message) {
              setError(field, { type: 'server', message })
              mappedFieldError = true
            }
          })
        }

        if (!mappedFieldError) {
          setServerError(
            data.message || 'Não foi possível entrar. Tente novamente.',
          )
        }
        return
      }

      // Update store with token
      setToken(data.token)
      setUser(data.user)

      router.push('/dashboard')
    } catch {
      setServerError('Não foi possível entrar. Verifique sua conexão.')
    } finally {
      setIsLoading(false)
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
        <TextField
          label="Email:"
          id="email"
          type="email"
          autoComplete="email"
          {...register('email')}
          error={errors.email?.message}
        />
        <TextField
          label="Senha:"
          id="password"
          type="password"
          autoComplete="current-password"
          {...register('password')}
          error={errors.password?.message}
        />

        {serverError ? <FormError message={serverError} /> : null}

        <Button className="cursor-pointer" loading={isLoading}>
          Entrar
        </Button>
      </form>
    </AuthPageShell>
  )
}
