import { buildAuthCookie } from '@/lib/auth-server'
import { authService } from '@/lib/services'
import type { AuthResponse } from '@/lib/types'
import { loginSchema } from '@/lib/validators'
import { NextResponse } from 'next/server'

type AuthResponseWithData = AuthResponse & {
  data?: AuthResponse
}

type LaravelValidationErrors = Record<string, string[]>

function extractToken(data: AuthResponseWithData) {
  return (
    data?.token ??
    data?.access_token ??
    data?.data?.token ??
    data?.data?.access_token
  )
}

function getErrorMessage(error: unknown): string {
  if (typeof error === 'object' && error !== null && 'message' in error) {
    const message = (error as { message?: unknown }).message
    if (typeof message === 'string' && message.trim()) {
      return message
    }
  }

  if (error instanceof Error && error.message.trim()) {
    return error.message
  }

  return 'Algo deu errado durante o login. Por favor, tente novamente.'
}

function getValidationErrors(
  error: unknown,
): LaravelValidationErrors | undefined {
  if (typeof error === 'object' && error !== null && 'errors' in error) {
    const errors = (error as { errors?: unknown }).errors
    if (typeof errors === 'object' && errors !== null) {
      return errors as LaravelValidationErrors
    }
  }

  return undefined
}

export async function POST(request: Request) {
  const body = await request.json()
  const parseResult = loginSchema.safeParse(body)

  if (!parseResult.success) {
    const fieldErrors = parseResult.error.flatten().fieldErrors
    return NextResponse.json(
      {
        message:
          parseResult.error.flatten().formErrors.join(' ') ||
          'Dados inválidos.',
        errors: fieldErrors,
      },
      { status: 400 },
    )
  }

  try {
    const response = await authService.login(parseResult.data)
    const token = extractToken(response)

    if (!token) {
      return NextResponse.json(
        { message: 'O token de autenticação não foi retornado.' },
        { status: 500 },
      )
    }

    const nextResponse = NextResponse.json({
      message: 'Login realizado com sucesso',
      token,
    })
    const cookieConfig = buildAuthCookie(token)
    nextResponse.cookies.set(
      cookieConfig.name,
      cookieConfig.value,
      cookieConfig.options,
    )

    return nextResponse
  } catch (error: unknown) {
    const message = getErrorMessage(error)
    const errors = getValidationErrors(error)
    return NextResponse.json({ message, errors }, { status: 422 })
  }
}
