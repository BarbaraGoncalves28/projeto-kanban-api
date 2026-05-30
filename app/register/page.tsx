'use client'

import { AuthPageShell } from '@/components/layout/AuthPageShell'
import { Button } from '@/components/ui/Button'
import { FormError } from '@/components/ui/FormError'
import { TextField } from '@/components/ui/TextField'
import { useStore } from '@/lib/store'
import { registerSchema, type RegisterFormValues } from '@/lib/validators'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { useForm } from 'react-hook-form'

export default function RegisterPage() {
  const router = useRouter()
  const { setToken } = useStore()
  const [serverError, setServerError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
  })

  async function onSubmit(values: RegisterFormValues) {
    setIsLoading(true)
    setServerError(null)

    try {
      const response = await fetch('/api/auth/register', {
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
          const fieldMap: Record<string, keyof RegisterFormValues> = {
            name: 'name',
            email: 'email',
            password: 'password',
            password_confirmation: 'passwordConfirmation',
            passwordConfirmation: 'passwordConfirmation',
          }

          Object.entries(fieldErrors).forEach(([key, value]) => {
            const formField = fieldMap[key]
            const message = Array.isArray(value) ? value[0] : value
            if (formField && message) {
              setError(formField, { type: 'server', message })
              mappedFieldError = true
            }
          })
        }

        if (!mappedFieldError) {
          setServerError(
            data.message ||
              'Não foi possível concluir o cadastro. Tente novamente.',
          )
        }
        return
      }

      // Update store with token if provided
      if (data.token) {
        setToken(data.token)
      }

      router.push(data.token ? '/dashboard' : '/login')
    } catch {
      setServerError(
        'Não foi possível concluir o cadastro. Verifique sua conexão.',
      )
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AuthPageShell
      title="Crie sua conta"
      description="Cadastre-se com seu e-mail e comece a usar o painel do Kanbam."
      actionHref="/login"
      actionLabel="Já tem uma conta? Faça login"
    >
      <form className="flex flex-col gap-5" onSubmit={handleSubmit(onSubmit)}>
        <TextField
          label="Nome"
          id="name"
          type="text"
          autoComplete="name"
          {...register('name')}
          error={errors.name?.message}
        />
        <TextField
          label="E-mail"
          id="email"
          type="email"
          autoComplete="email"
          {...register('email')}
          error={errors.email?.message}
        />
        <TextField
          label="Senha"
          id="password"
          type="password"
          autoComplete="new-password"
          {...register('password')}
          error={errors.password?.message}
        />
        <TextField
          label="Confirmar senha"
          id="passwordConfirmation"
          type="password"
          autoComplete="new-password"
          {...register('passwordConfirmation')}
          error={errors.passwordConfirmation?.message}
        />

        {serverError ? <FormError message={serverError} /> : null}

        <Button loading={isLoading}>Criar conta</Button>
      </form>
    </AuthPageShell>
  )
}
