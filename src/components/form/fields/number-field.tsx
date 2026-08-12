import { useRef, useState, type ComponentProps, type ReactNode } from 'react'

import { useIsomorphicLayoutEffect } from '@tanstack/react-form'

import { useFieldContext } from '@/components/form/form'
import {
  InputGroup,
  InputGroupInput,
  InputGroupText,
} from '@/components/ui/input-group'

import { FieldShell } from './field-shell'

const toString = (value: number) =>
  Number.isNaN(value) ? '' : String(value)

function sanitize(value: string, mode: 'integer' | 'decimal'): string {
  if (mode === 'integer') {
    return value.replace(/\D/g, '')
  }
  const cleaned = value.replace(/[^\d.,]/g, '')
  const match = cleaned.match(/\d*(?:[.,]\d*)?/)
  return match ? match[0] : ''
}

function parseNumber(value: string): number {
  if (value.trim() === '') {
    return Number.NaN
  }
  return Number(value.replace(',', '.'))
}

function NumberField({
  label,
  mode = 'decimal',
  suffix,
  description,
  ...props
}: {
  label: string
  mode?: 'integer' | 'decimal'
  suffix?: string
  description?: ReactNode
} & Omit<ComponentProps<'input'>, 'type'>) {
  const field = useFieldContext<number>()
  const [draft, setDraft] = useState(() => toString(field.state.value))
  const focusedRef = useRef(false)
  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid

  useIsomorphicLayoutEffect(() => {
    if (!focusedRef.current) {
      setDraft(toString(field.state.value))
    }
  }, [field.state.value])

  return (
    <FieldShell
      name={field.name}
      label={label}
      description={description}
      isInvalid={isInvalid}
      errors={field.state.meta.errors}
    >
      <InputGroup>
        <InputGroupInput
          id={field.name}
          name={field.name}
          type="text"
          inputMode={mode === 'integer' ? 'numeric' : 'decimal'}
          value={draft}
          onFocus={() => {
            focusedRef.current = true
          }}
          onBlur={() => {
            focusedRef.current = false
            setDraft(toString(field.state.value))
            field.handleBlur()
          }}
          onChange={(event) => {
            const next = sanitize(event.target.value, mode)
            setDraft(next)
            field.handleChange(parseNumber(next))
          }}
          aria-invalid={isInvalid}
          {...props}
        />
        {suffix && <InputGroupText className="pl-1 pr-2.5">{suffix}</InputGroupText>}
      </InputGroup>
    </FieldShell>
  )
}

export { NumberField }