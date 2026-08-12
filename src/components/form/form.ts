import { createFormHook, createFormHookContexts } from '@tanstack/react-form'

import { NumberField } from './fields/number-field'
import { PasswordField } from './fields/password-field'
import { RupiahField } from './fields/rupiah-field'
import { TextField } from './fields/text-field'

export const { useFieldContext, useFormContext, fieldContext, formContext } =
  createFormHookContexts()

export const { useAppForm, withForm } = createFormHook({
  fieldComponents: {
    NumberField,
    PasswordField,
    RupiahField,
    TextField,
  },
  formComponents: {},
  fieldContext,
  formContext,
})