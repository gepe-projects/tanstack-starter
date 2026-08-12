import type { AnyFormApi } from '@tanstack/react-form'

import { toast } from '#/components/ui/toast'
import type { ApiError } from '#/lib/api/errors'

export function applyServerErrors(formApi: AnyFormApi, error: ApiError): void {
  for (const { field, message } of error.errors) {
    formApi.setFieldMeta(field, (prev) => ({
      ...prev,
      isTouched: true,
      errorMap: {
        ...prev.errorMap,
        onServer: { message },
      },
    }))
  }

  if (error.errors.length === 0) {
    toast.add({
      title: error.message,
      type: 'error',
      timeout: 5000,
    })
  }
}
