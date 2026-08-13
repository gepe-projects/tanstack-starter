import { useNavigate } from '@tanstack/react-router'

import { login } from '#/features/auth/api/auth.functions'
import { SignInSchema } from '#/features/auth/schemas'

import { Button } from '#/components/animate-ui/components/buttons/button'
import {
  Card,
  CardContent,
  CardDescription,
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

function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className}>
      <path
        fill="#4285F4"
        d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
      />
    </svg>
  )
}

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
    </Card>
  )
}

export default SignInForm
