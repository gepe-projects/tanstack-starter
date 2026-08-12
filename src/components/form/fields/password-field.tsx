import { useState, type ComponentProps } from 'react'

import { Eye, EyeOff } from 'lucide-react'

import { useFieldContext } from '@/components/form/form'
import {
  InputGroup,
  InputGroupButton,
  InputGroupInput,
} from '@/components/ui/input-group'

import { FieldShell } from './field-shell'

function PasswordField({
  label,
  ...props
}: { label: string } & Omit<ComponentProps<'input'>, 'type'>) {
  const field = useFieldContext<string>()
  const [show, setShow] = useState(false)
  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid

  return (
    <FieldShell
      name={field.name}
      label={label}
      isInvalid={isInvalid}
      errors={field.state.meta.errors}
    >
      <InputGroup>
        <InputGroupInput
          id={field.name}
          name={field.name}
          type={show ? 'text' : 'password'}
          value={field.state.value}
          onBlur={field.handleBlur}
          onChange={(event) => field.handleChange(event.target.value)}
          aria-invalid={isInvalid}
          {...props}
        />
        <InputGroupButton
          type="button"
          variant="ghost"
          size="icon-sm"
          aria-label={show ? 'Hide password' : 'Show password'}
          onClick={() => setShow((value) => !value)}
        >
          {show ? <EyeOff /> : <Eye />}
        </InputGroupButton>
      </InputGroup>
    </FieldShell>
  )
}

export { PasswordField }