import type { ReactNode } from 'react'

import { Field, FieldDescription, FieldError, FieldLabel } from '@/components/ui/field'

interface FieldShellProps {
  name: string
  label: string
  description?: ReactNode
  isInvalid: boolean
  errors: Array<{ message?: string } | undefined>
  children: ReactNode
}

function FieldShell({
  name,
  label,
  description,
  isInvalid,
  errors,
  children,
}: FieldShellProps) {
  return (
    <Field data-invalid={isInvalid}>
      <FieldLabel htmlFor={name}>{label}</FieldLabel>
      {children}
      {description && <FieldDescription>{description}</FieldDescription>}
      {isInvalid && <FieldError errors={errors} />}
    </Field>
  )
}

export { FieldShell }