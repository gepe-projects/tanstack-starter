import { useRef, useState, type ComponentProps, type ReactNode } from 'react'

import { useIsomorphicLayoutEffect } from '@tanstack/react-form'

import { useFieldContext } from '@/components/form/form'
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from '@/components/ui/input-group'

import { FieldShell } from './field-shell'

const formatRupiah = (value: number) => {
  if (Number.isNaN(value)) {
    return ''
  }
  return new Intl.NumberFormat('id-ID', {
    maximumFractionDigits: 0,
  }).format(value)
}

const digitsOf = (value: string) => value.replace(/\D/g, '')

const rupiahToNumber = (value: string) => {
  const digits = digitsOf(value)
  return digits === '' ? Number.NaN : Number(digits)
}

function RupiahField({
  label,
  description,
  ...props
}: {
  label: string
  description?: ReactNode
} & Omit<ComponentProps<'input'>, 'type'>) {
  const field = useFieldContext<number>()
  const [draft, setDraft] = useState(() => formatRupiah(field.state.value))
  const focusedRef = useRef(false)
  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid

  useIsomorphicLayoutEffect(() => {
    if (!focusedRef.current) {
      setDraft(formatRupiah(field.state.value))
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
        <InputGroupAddon align="inline-start" className="select-none pr-1">
          Rp
        </InputGroupAddon>
        <InputGroupInput
          id={field.name}
          name={field.name}
          type="text"
          inputMode="numeric"
          autoComplete="off"
          value={draft}
          onFocus={() => {
            focusedRef.current = true
          }}
          onBlur={() => {
            focusedRef.current = false
            setDraft(formatRupiah(field.state.value))
            field.handleBlur()
          }}
          onChange={(event) => {
            const number = rupiahToNumber(event.target.value)
            setDraft(formatRupiah(number))
            field.handleChange(number)
          }}
          aria-invalid={isInvalid}
          {...props}
        />
      </InputGroup>
    </FieldShell>
  )
}

export { RupiahField }