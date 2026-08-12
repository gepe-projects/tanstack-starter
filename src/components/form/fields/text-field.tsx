import type { ComponentProps, ReactNode } from 'react'

import { useFieldContext } from '@/components/form/form'
import { Input } from '@/components/ui/input'

import { FieldShell } from './field-shell'

function TextField({
  label,
  description,
  ...props
}: {
  label: string
  description?: ReactNode
} & ComponentProps<'input'>) {
  const field = useFieldContext<string>()
  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid

  return (
    <FieldShell
      name={field.name}
      label={label}
      description={description}
      isInvalid={isInvalid}
      errors={field.state.meta.errors}
    >
      <Input
        id={field.name}
        name={field.name}
        value={field.state.value}
        onBlur={field.handleBlur}
        onChange={(event) => field.handleChange(event.target.value)}
        aria-invalid={isInvalid}
        {...props}
      />
    </FieldShell>
  )
}

export { TextField }