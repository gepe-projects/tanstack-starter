import { apiFetch } from "#/lib/api/client";
import type { ApiResult } from "#/lib/api/errors";
import { guestOnlyMiddleware } from "#/server/auth-middleware";
import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { useAppSession } from "#/server/session";
import { OAuthExchangeSchema } from "../schemas";
import type { TokenResponse } from "./types";


/**
 * minta URL Google dari backend.
 * Backend yang menyusun URL authorize (dengan state, PKCE, nonce) dan
 * menyimpannya di Redis. Kita cuma dapat redirectUrl-nya.
 */
export const getGoogleAuthUrl = createServerFn({ method: 'GET' })
  .middleware([guestOnlyMiddleware])
  .handler(async (): Promise<ApiResult<{ redirectUrl: string }>> => {
    const request = getRequest()
    const origin = new URL(request.url).origin

    const redirectUrl = `${origin}/auth/google/callback`
    return await apiFetch<{ redirectUrl: string }>(
      `/api/v1/auth/oauth/google?redirect_url=${encodeURIComponent(redirectUrl)}`,
      { method: 'GET' },
    )
  })


/**
* tukar one-time code (yang muncul di URL callback) menjadi TokenResponse.
* Token disimpan ke session cookie `app-session` — pola ini sama persis
* dengan function `login` yang sudah ada.
*/
export const exchangeGoogleCode = createServerFn({ method: 'POST' })
  .middleware([guestOnlyMiddleware])
  .validator(OAuthExchangeSchema)
  .handler(
    async ({ data }): Promise<ApiResult<{ userId: string }>> => {
      const result = await apiFetch<TokenResponse>('/api/v1/auth/oauth/exchange', {
        method: 'POST',
        body: { code: data.code }
      })
      if (!result.ok) return result

      const session = await useAppSession()
      await session.update({
        accessToken: result.data.accessToken,
        refreshToken: result.data.refreshToken,
        refreshTokenId: result.data.refreshTokenId,
        sessionId: result.data.sessionId,
        user: result.data.user,
      })
      return { ok: true, data: { userId: result.data.user.userId } }
    }
  )