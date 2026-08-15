import { useNavigate } from '@tanstack/react-router'

import { register } from '#/features/auth/api/auth.functions'
import { RegisterSchema } from '#/features/auth/schemas'

import { Button } from '#/components/animate-ui/components/buttons/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '#/components/ui/card'
import { FieldGroup } from '#/components/ui/field'
import { toast } from '#/components/ui/toast'
import { PasswordField } from '#/components/form/fields/password-field'
import { TextField } from '#/components/form/fields/text-field'
import { useAppForm } from '#/components/form/form'
import { applyServerErrors } from '#/components/form/server-errors'

const registerDefaults: {
  displayName?: string
  email: string
  password: string
} = {
  displayName: undefined,
  email: '',
  password: '',
}

const RegisterForm = () => {
  const navigate = useNavigate()
  const form = useAppForm({
    defaultValues: registerDefaults,
    validators: {
      onChange: RegisterSchema,
      onSubmit: RegisterSchema,
    },
    onSubmit: async ({ value, formApi }) => {
      const result = await register({
        data: {
          displayName: value.displayName?.trim() || undefined,
          email: value.email,
          password: value.password,
        },
      })
      if (!result.ok) {
        applyServerErrors(formApi, result.error)
        return
      }
      toast.add({
        title: 'Account created',
        description: 'Welcome aboard!',
        timeout: 5000,
        type: 'success',
      })
      navigate({ to: '/dashboard' })
    },
  })

  return (
    <Card className="w-full sm:max-w-md">
      <CardHeader>
        <CardTitle>Create your account</CardTitle>
        <CardDescription>
          Enter your details below to get started
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form
          id="sign-up-form"
          onSubmit={(e) => {
            e.preventDefault()
            form.handleSubmit()
          }}
        >
          <FieldGroup>
            <form.AppField name="displayName">
              {(_field) => (
                <TextField
                  label="Name (optional)"
                  placeholder="Enter your name"
                  autoComplete="name"
                />
              )}
            </form.AppField>
            <form.AppField name="email">
              {(_field) => (
                <TextField
                  label="Email"
                  type="email"
                  placeholder="Enter your email"
                  autoComplete="email"
                />
              )}
            </form.AppField>
            <form.AppField name="password">
              {(_field) => (
                <PasswordField
                  label="Password"
                  placeholder="At least 8 characters"
                  autoComplete="new-password"
                />
              )}
            </form.AppField>
          </FieldGroup>
          <Button type="submit" form="sign-up-form" className="mt-5 w-full">
            Create account
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

export default RegisterForm
