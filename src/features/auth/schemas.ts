import z from 'zod'

export const SignInSchema = z.object({
  email: z.email('Enter a valid email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
})

export const RegisterSchema = z.object({
  email: z.email('Enter a valid email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
})

export const OAuthExchangeSchema = z.object({
  code: z.string().min(1, 'Missing OAuth code'),
})

export type SignInInput = z.infer<typeof SignInSchema>
export type RegisterInput = z.infer<typeof RegisterSchema>
export type OAuthExchangeInput = z.infer<typeof OAuthExchangeSchema>