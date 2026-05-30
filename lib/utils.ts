import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Extracts the top-level message from a Laravel API error response
 * (`{ message, errors }`) or a generic Error.
 */
export function extractBackendMessage(error: unknown): string | undefined {
  if (typeof error === 'object' && error !== null && 'message' in error) {
    const message = (error as { message?: unknown }).message
    if (typeof message === 'string' && message.trim()) {
      return message
    }
  }

  if (error instanceof Error && error.message.trim()) {
    return error.message
  }

  return undefined
}

/**
 * Extracts Laravel field-level validation errors (`{ errors: { field: [msg] } }`)
 * into a flat record of `field -> first message`.
 */
export function extractBackendFieldErrors(
  error: unknown,
): Record<string, string> {
  const result: Record<string, string> = {}

  if (typeof error === 'object' && error !== null && 'errors' in error) {
    const errors = (error as { errors?: unknown }).errors
    if (typeof errors === 'object' && errors !== null) {
      for (const [field, messages] of Object.entries(
        errors as Record<string, unknown>,
      )) {
        const message = Array.isArray(messages) ? messages[0] : messages
        if (typeof message === 'string' && message.trim()) {
          result[field] = message
        }
      }
    }
  }

  return result
}
