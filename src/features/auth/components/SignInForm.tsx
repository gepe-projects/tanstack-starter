import { Link, useNavigate } from '@tanstack/react-router'

import { login } from '#/features/auth/api/auth.functions'
import { SignInSchema } from '#/features/auth/schemas'
import { GoogleIcon } from '#/features/auth/components/GoogleIcon'

import { Button } from '#/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '#/components/ui/card'
import { FieldGroup } from '#/components/ui/field'
import { SeparatorWithText } from '#/components/ui/separator-with-text'
import { toast } from '#/components/ui/toast'
import { PasswordField } from '#/components/form/fields/password-field'
import { TextField } from '#/components/form/fields/text-field'
import { useAppForm } from '#/components/form/form'
import { applyServerErrors } from '#/components/form/server-errors'
import { useState } from 'react'
import { getGoogleAuthUrl } from '../api/oauth.functions'

const SignInForm = () => {
  const navigate = useNavigate()
  const [googleLoading, setGoogleLoading] = useState(false)
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

  // gogole signin
  async function handleGoogleLogin() {
    setGoogleLoading(true)
    try {
      const result = await getGoogleAuthUrl()
      if (!result.ok) {
        toast.add({
          title: 'Google sign-in failed',
          description: result.error.message,
          type: 'error',
          timeout: 6000,
        })
        return
      }
      // Full top-level navigation ke Google. Setelah user selesai di Google,
      // browser akan dibawa balik ke /auth/google/callback?code=...
      window.location.assign(result.data.redirectUrl)
    } finally {
      setGoogleLoading(false)
    }
  }

  return (
    <Card className="w-full sm:max-w-md">
      <CardHeader>
        <CardTitle>Login to your account</CardTitle>
        <CardDescription>
          Enter your email below to login to your account
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-5">
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
          <Button type="submit" form="sign-in-form" className="mt-5 w-full">
            Sign in
          </Button>
        </form>
        <SeparatorWithText text="or continue with" />
        <Button
          type="button"
          variant="outline"
          className="w-full"
          onClick={handleGoogleLogin}
          disabled={googleLoading}
        >
          <GoogleIcon className="mr-2 h-4 w-4" />
          {googleLoading ? 'Redirecting to Google…' : 'Login with Google'}
        </Button>
      </CardContent>
      <CardFooter className="justify-center">
        <p className="text-sm text-muted-foreground">
          Don&apos;t have an account?{' '}
          <Link
            to="/sign-up"
            className="font-medium text-primary transition-colors hover:text-primary/80"
          >
            Register
          </Link>
        </p>
      </CardFooter>
    </Card>
  )
}

export default SignInForm
