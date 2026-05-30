import { buildLogoutCookie } from '@/lib/auth-server'
import { NextResponse } from 'next/server'

export async function POST() {
  const response = NextResponse.json({ message: 'Sessão encerrada' })

  const cookieConfig = buildLogoutCookie()
  response.cookies.set(
    cookieConfig.name,
    cookieConfig.value,
    cookieConfig.options,
  )

  return response
}
