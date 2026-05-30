import { z } from 'zod'

const passwordSchema = z
  .string()
  .min(6, 'A senha deve ter no mínimo 6 caracteres')

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'O e-mail é obrigatório')
    .email('Informe um e-mail válido'),
  password: passwordSchema,
})

export const registerSchema = z
  .object({
    name: z.string().min(2, 'O nome é obrigatório'),
    email: z
      .string()
      .min(1, 'O e-mail é obrigatório')
      .email('Informe um e-mail válido'),
    password: passwordSchema,
    passwordConfirmation: passwordSchema,
  })
  .refine((data) => data.password === data.passwordConfirmation, {
    message: 'As senhas devem ser iguais',
    path: ['passwordConfirmation'],
  })

export type LoginFormValues = z.infer<typeof loginSchema>
export type RegisterFormValues = z.infer<typeof registerSchema>
