import { z } from 'zod'

export const UserStatusSchema = z.enum(['ACTIVE', 'SUSPENDED', 'DISABLED'])
export type UserStatusInput = z.infer<typeof UserStatusSchema>

export const RoleTypeSchema = z.enum(['USER', 'ADMIN', 'OPERATION', 'SUPER_ADMIN'])

export const UserIdParamsSchema = z.object({
  userId: z.string().min(1),
})
export type UserIdParamsInput = z.infer<typeof UserIdParamsSchema>

export const ChangeStatusSchema = z.object({
  userId: z.string().min(1),
  status: UserStatusSchema,
})
export type ChangeStatusInput = z.infer<typeof ChangeStatusSchema>

export const AssignRolesSchema = z.object({
  userId: z.string().min(1),
  roles: z.array(RoleTypeSchema).min(1, 'Minimal satu role wajib diisi'),
})
export type AssignRolesInput = z.infer<typeof AssignRolesSchema>

export const UserPageParamsSchema = z.object({
  cursor: z.string().optional(),
  status: UserStatusSchema.optional(),
  limit: z.number().int().min(1).max(50).default(20),
})
export type UserPageParamsInput = z.infer<typeof UserPageParamsSchema>

export const AuditPageParamsSchema = z.object({
  cursor: z.string().optional(),
  limit: z.number().int().min(1).max(50).default(20),
})
export type AuditPageParamsInput = z.infer<typeof AuditPageParamsSchema>
