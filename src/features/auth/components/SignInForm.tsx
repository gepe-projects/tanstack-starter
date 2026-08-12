import { useNavigate } from '@tanstack/react-router'

import { login } from '#/features/auth/api/auth.functions'
import { SignInSchema } from '#/features/auth/schemas'

import { Button } from '#/components/animate-ui/components/buttons/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '#/components/ui/card'
import { Field, FieldGroup } from '#/components/ui/field'
import { toast } from '#/components/ui/toast'
import { PasswordField } from '#/components/form/fields/password-field'
import { TextField } from '#/components/form/fields/text-field'
import { useAppForm } from '#/components/form/form'
import { applyServerErrors } from '#/components/form/server-errors'

const SignInForm = () => {
  const navigate = useNavigate()
  const form = useAppForm({
    defaultValues: {
      email: '',
      password: '',
    },
    validators: {
      onChange: SignInSchema,
      onSubmit: SignInSchema,
    },
    onSubmit: async ({ value, formApi }) => {
      const result = await login({
        data: { email: value.email, password: value.password },
      })
      if (!result.ok) {
        applyServerErrors(formApi, result.error)
        return
      }
      toast.add({
        title: 'Sign in successful',
        description: `Welcome back, ${value.email}!`,
        timeout: 5000,
        type: 'success',
      })
      navigate({ to: '/dashboard' })
    },
  })

  return (
    <Card className="w-full sm:max-w-md">
      <CardHeader>
        <CardTitle>Login to your account</CardTitle>
        <CardDescription>
          Enter your email below to login to your account
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form
          id="sign-in-form"
          onSubmit={(e) => {
            e.preventDefault()
            form.handleSubmit()
          }}
        >
          <FieldGroup>
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
                  placeholder="Enter your password"
                  autoComplete="current-password"
                />
              )}
            </form.AppField>
          </FieldGroup>
        </form>
      </CardContent>
      <CardFooter>
        <Field orientation="horizontal">
          <Button type="button" variant="outline" onClick={() => form.reset()}>
            Reset
          </Button>
          <Button type="submit" form="sign-in-form">
            Submit
          </Button>
        </Field>
      </CardFooter>
    </Card>
  )
}

export default SignInForm
