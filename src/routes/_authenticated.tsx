import { createFileRoute, redirect } from '@tanstack/react-router'

import { getSessionInfo } from '#/features/auth/api/auth.functions'

export const Route = createFileRoute('/_authenticated')({
  beforeLoad: async () => {
    const session = await getSessionInfo()
    if (!session) {
      throw redirect({ to: '/sign-in' })
    }
    return { session } // auto masuk context, bisa diakses di semua route anaknya
  },
})
