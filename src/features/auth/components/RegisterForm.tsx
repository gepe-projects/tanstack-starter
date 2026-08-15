import { Link, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'

import { register } from '#/features/auth/api/auth.functions'
import { RegisterSchema } from '#/features/auth/schemas'
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
import { getGoogleAuthUrl } from '../api/oauth.functions'

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
  const [googleLoading, setGoogleLoading] = useState(false)
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

  // Google OAuth — backend otomatis membuat akun saat user pertama kali login
  async function handleGoogleSignUp() {
    setGoogleLoading(true)
    try {
      const result = await getGoogleAuthUrl()
      if (!result.ok) {
        toast.add({
          title: 'Google sign-up failed',
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
        <CardTitle>Create your account</CardTitle>
        <CardDescription>
          Enter your details below to get started
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-5">
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
        <SeparatorWithText text="or continue with" />
        <Button
          type="button"
          variant="outline"
          className="w-full"
          onClick={handleGoogleSignUp}
          disabled={googleLoading}
        >
          <GoogleIcon className="mr-2 h-4 w-4" />
          {googleLoading ? 'Redirecting to Google…' : 'Sign up with Google'}
        </Button>
      </CardContent>
      <CardFooter className="justify-center">
        <p className="text-sm text-muted-foreground">
          Already have an account?{' '}
          <Link
            to="/sign-in"
            className="font-medium text-primary transition-colors hover:text-primary/80"
          >
            Sign in
          </Link>
        </p>
      </CardFooter>
    </Card>
  )
}

export default RegisterForm
