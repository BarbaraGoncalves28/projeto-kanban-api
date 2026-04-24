import { buildAuthCookie } from '@/lib/auth-server'
import { authService } from '@/lib/services'
import type { AuthResponse } from '@/lib/types'
import { loginSchema } from '@/lib/validators'
import { NextResponse } from 'next/server'

type AuthResponseWithData = AuthResponse & {
  data?: AuthResponse
}

function extractToken(data: AuthResponseWithData) {
  return (
    data?.token ??
    data?.access_token ??
    data?.data?.token ??
    data?.data?.access_token
  )
}

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message
  }

  if (typeof error === "object" && error !== null && "message" in error) {
    return String((error as { message?: unknown }).message)
  }

  return 'Algo deu errado durante o login. Por favor, tente novamente.'
}

export async function POST(request: Request) {
  const body = await request.json()
  const parseResult = loginSchema.safeParse(body)

  if (!parseResult.success) {
    return NextResponse.json(
      { message: parseResult.error.flatten().formErrors.join(' ') },
      { status: 400 },
    )
  }

  try {
    const response = await authService.login(parseResult.data)
    const token = extractToken(response)

    if (!token) {
      return NextResponse.json(
        { message: 'Authentication token was not returned.' },
        { status: 500 },
      )
    }

    const nextResponse = NextResponse.json({
      message: 'Login successful',
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
    return NextResponse.json({ message }, { status: 422 })
  }
}
