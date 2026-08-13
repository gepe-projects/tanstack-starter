# Google OAuth Login — Panduan Integrasi Frontend

Dokumen ini menjelaskan cara menghubungkan frontend TanStack Start dengan **Google OAuth dance** yang sudah dibuat di backend Spring Boot (`../backend`). Kamu tidak perlu mengimplementasikan OAuth protocol sendiri — backend sudah menangani semuanya (state, PKCE, nonce, verifikasi id_token). Tugas kamu di frontend hanya **3 langkah kecil**.

---

## 1. Alur OAuth secara keseluruhan

Pahami alur ini dulu sebelum menulis kode:

```
[User]  klik "Login with Google"
   │
   │  ①  POST/GET ke backend minta URL Google
   ▼
[Frontend] ──GET /api/v1/auth/oauth/google?redirect_url=<url frontend>──▶ [Spring Backend]
   │
   │  ②  backend jawab { redirectUrl: "https://accounts.google.com/..." }
   ▼
[Browser] ──window.location.assign(redirectUrl)──▶ [Google]
   │
   │  ③  user login di Google
   ▼
[Google] ──302 redirect──▶ [Backend callback /auth/oauth/google/callback?state=...&code=...]
   │
   │  ④  backend tukar code → id_token, validasi, buat user, issue token
   │     simpan TokenResponse di Redis sebagai one-time-code (5 menit)
   ▼
[Backend] ──302 redirect──▶ [Frontend /auth/google/callback?code=<one-time-code>]
   │
   │  ⑤  frontend baca `code` dari URL
   ▼
[Frontend] ──POST /api/v1/auth/oauth/exchange { code }──▶ [Spring Backend]
   │
   │  ⑥  backend return TokenResponse { accessToken, refreshToken, ... user }
   ▼
[Frontend] simpan TokenResponse ke session cookie `app-session`
   │
   ▼
navigate ke /dashboard
```

**Poin penting yang wajib dipahami:**

- Frontend **tidak pernah** menerima/berurusan dengan authorization code Google, `state`, PKCE, atau `nonce`. Semua itu ditangani & disimpan backend di Redis.
- Frontend cuma menerima **one-time code** (`?code=...`) yang muncul di URL setelah redirect balik.
- One-time code itu **sekali pakai & kadaluarsa 5 menit**. Kalau di-refresh halaman callback-nya, code sudah tidak berlaku → harus login ulang. Itu normal & aman.
- `redirect_url` yang dikirim di langkah ① **origin-nya harus terdaftar** di backend (`APP_SECURITY_OAUTH_FRONTEND_REDIRECT_URIS`, default `http://localhost:3000`). Kalau beda, backend balas 400.

---

## 2. Prasyarat

### a. Backend harus jalan
```bash
cd ../backend
# pastikan .env berisi (sudah ada di repo kamu)
# GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, APP_SECURITY_OAUTH_REDIRECT_URI, ...
./mvnw spring-boot:run
```

### b. Port frontend harus 3000
Backend secara default hanya mengizinkan origin `http://localhost:3000` sebagai `redirect_url`. Vite dev server TanStack Start default-nya di `http://localhost:3000`, jadi aman.

> Kalau frontend jalan di port lain, kamu harus ubah juga
> `APP_SECURITY_OAUTH_FRONTEND_REDIRECT_URIS` di `../backend/.env`.

### c. Frontend env
Pastikan `frontend/.env` punya:
```bash
SERVER_URL=http://localhost:8080
SESSION_SECRET=<sudah ada>
```

---

## 3. Langkah implementasi (urut)

### Langkah 1 — Tambah schema OAuth di `src/features/auth/schemas.ts`

Buka file itu dan tambahkan di bagian bawah:

```ts
export const OAuthExchangeSchema = z.object({
  code: z.string().min(1, 'Missing OAuth code'),
})

export type OAuthExchangeInput = z.infer<typeof OAuthExchangeSchema>
```

**Kenapa?** Sesuai konvensi project, schema Zod di `schemas.ts` dipakai **dua kali**:
1. sebagai `.validator()` di `createServerFn` (validasi server-side),
2. sebagai validator form (kalau dibutuhkan di client).

`OAuthExchangeSchema` memvalidasi bahwa `code` yang kita kirim ke backend itu string tidak kosong.

---

### Langkah 2 — Buat server functions `src/features/auth/api/oauth.functions.ts`

Buat file baru:

```ts
import { createServerFn } from '@tanstack/react-start'
import { getRequest } from '@tanstack/react-start/server'

import { OAuthExchangeSchema } from '#/features/auth/schemas'
import type { TokenResponse } from '#/features/auth/api/types'

import type { ApiResult } from '#/lib/api/errors'
import { apiFetch } from '#/lib/api/client'
import { guestOnlyMiddleware } from '#/server/auth-middleware'
import { useAppSession } from '#/server/session'

/**
 * ① Langkah pertama OAuth:
 * minta URL Google dari backend.
 * Backend yang menyusun URL authorize (dengan state, PKCE, nonce) dan
 * menyimpannya di Redis. Kita cuma dapat redirectUrl-nya.
 */
export const getGoogleAuthUrl = createServerFn({ method: 'GET' })
  .middleware([guestOnlyMiddleware])
  .handler(async (): Promise<ApiResult<{ redirectUrl: string }>> => {
    // Ambil origin frontend dari request yang masuk, supaya tidak hardcode.
    // Contoh: http://localhost:3000
    const request = getRequest()
    const origin = new URL(request.url).origin

    // URL callback di frontend yang akan dituju browser setelah flow selesai.
    // Origin-nya harus terdaftar di backend (APP_SECURITY_OAUTH_FRONTEND_REDIRECT_URIS).
    const redirectUrl = `${origin}/auth/google/callback`

    return await apiFetch<{ redirectUrl: string }>(
      `/api/v1/auth/oauth/google?redirect_url=${encodeURIComponent(redirectUrl)}`,
      { method: 'GET' },
    )
  })

/**
 * ⑤ Langkah terakhir OAuth:
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
        body: { code: data.code },
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
    },
  )
```

**Penjelasan bagian-bagian penting:**

| Baris | Penjelasan |
|---|---|
| `getRequest()` | Utilitas dari TanStack Start untuk ambil `Request` HTTP yang sedang diproses. Dipakai server-side saja. Kita pakai `.url` untuk tahu origin frontend → tidak perlu hardcode URL. |
| `guestOnlyMiddleware` | Middleware dari `src/server/auth-middleware.ts`. Kalau user sudah login, langsung di-redirect ke `/dashboard`. |
| `apiFetch` | Helper HTTP dari `src/lib/api/client.ts`. Dipanggil **di server**, jadi tidak ada masalah CORS. Otomatis membungkus payload backend (`{ message, data }`) → `ApiResult`. |
| `session.update(...)` | Menulis TokenResponse ke cookie `app-session` (HttpOnly). Sejak saat itu user dianggap login. |

---

### Langkah 3 — Buat route callback `src/routes/auth/google/callback.tsx`

Buat folder `src/routes/auth/google/` lalu file `callback.tsx`:

```tsx
import { createFileRoute, redirect, Navigate } from '@tanstack/react-router'
import { z } from 'zod'

import { getSessionInfo } from '#/features/auth/api/auth.functions'
import { exchangeGoogleCode } from '#/features/auth/api/oauth.functions'

const CallbackSearchSchema = z.object({
  code: z.string().min(1).optional(),
  error: z.string().optional(),
})

const GENERIC_OAUTH_ERROR = 'Google sign-in canceled or failed. Please try again.'

function oauthErrorToMessage(error: string): string {
  if (error === 'access_denied') {
    return 'You cancelled Google sign-in. Please try again.'
  }
  return GENERIC_OAUTH_ERROR
}

export const Route = createFileRoute('/auth/google/callback')({
  validateSearch: CallbackSearchSchema,

  beforeLoad: async ({ search }) => {
    // Sudah login? Tidak perlu OAuth lagi.
    const session = await getSessionInfo()
    if (session) throw redirect({ to: '/dashboard' })

    // Backend redirect ke sini dengan ?error=... saat user batal di Google
    if (search.error) {
      throw redirect({
        to: '/sign-in',
        search: { error: oauthErrorToMessage(search.error) },
      })
    }

    // URL callback tapi tidak ada code? (misal user batal / redirect manual)
    if (!search.code) {
      throw redirect({
        to: '/sign-in',
        search: { error: GENERIC_OAUTH_ERROR },
      })
    }

    // Tukar one-time code → simpan token ke session.
    const result = await exchangeGoogleCode({ data: { code: search.code } })
    if (!result.ok) {
      throw redirect({
        to: '/sign-in',
        search: { error: result.error.message },
      })
    }
  },

  component: RouteComponent,
})

function RouteComponent() {
  return (
    <div className="flex h-screen items-center justify-center">
      <p className="text-sm text-muted-foreground">Signing you in…</p>
      <Navigate to="/dashboard" />
    </div>
  )
}
```

**Kenapa proses exchange ditaruh di `beforeLoad`?**

- Saat browser di-redirect dari Google/backend ke halaman ini, itu adalah **full page load** (SSR). `beforeLoad` jalan di server.
- Karena `exchangeGoogleCode` adalah server function yang butuh `useAppSession()` (akses request context), dia paling enak dipanggil saat masih di server.
- Kalau sukses, cookie session sudah ter-set **sebelum** komponen dirender. Jadi tidak ada flash halaman login sebentar.
- Kalau gagal, kita `throw redirect()` ke `/sign-in` dengan pesan error lewat search param — praktis, tidak perlu state management.

**Catatan `validateSearch`:** TanStack Router butuh tahu bentuk search params supaya tipe-aman. `search.code` dan `search.error` yang dibaca di `beforeLoad` mengikuti schema ini.

**Kenapa ada handling `?error=`?**
Saat user **membatalkan** login di Google, Google redirect balik ke backend dengan `error=access_denied` (tanpa `code`). Backend kemudian mengarahkan browser ke route ini dengan `?error=access_denied`. Fungsi `oauthErrorToMessage` memetakan kode error ke pesan yang manusiawi; kalau kodenya tidak dikenal, dipakai `GENERIC_OAUTH_ERROR` sebagai fallback.


---

### Langkah 4 — Tambah search param `error` di `src/routes/sign-in.tsx`

Sekarang halaman sign-in harus bisa menerima `?error=...` (yang dikirim dari callback saat gagal), dan menampilkannya.

```tsx
import { useEffect } from 'react'
import { createFileRoute, redirect } from '@tanstack/react-router'
import { z } from 'zod'

import { getSessionInfo } from '#/features/auth/api/auth.functions'
import SignInForm from '#/features/auth/components/SignInForm'
import { toast } from '#/components/ui/toast'

const SignInSearchSchema = z.object({
  error: z.string().optional(),
})

export const Route = createFileRoute('/sign-in')({
  validateSearch: SignInSearchSchema,

  beforeLoad: async () => {
    const session = await getSessionInfo()
    if (session) {
      throw redirect({ to: '/dashboard' })
    }
  },

  component: RouteComponent,
})

function RouteComponent() {
  const { error } = Route.useSearch()

  useEffect(() => {
    if (error) {
      toast.add({
        title: 'Sign-in failed',
        description: error,
        type: 'error',
        timeout: 6000,
      })
    }
  }, [error])

  return (
    <div className="flex h-screen items-center justify-center">
      <SignInForm />
    </div>
  )
}
```

**Kenapa perlu `validateSearch`?**
TanStack Router bersifat type-safe. Kalau route `/sign-in` tidak mendeklarasikan `error` di search params, maka `redirect({ to: '/sign-in', search: { error } })` di langkah 3 akan **gagal type-check**. Jadi deklarasi schema ini wajib.

---

### Langkah 5 — Wire tombol "Login with Google" di `src/features/auth/components/SignInForm.tsx`

Ubah file ini. Bagian yang berubah:
1. Tambah import: `useState`, dan `getGoogleAuthUrl`.
2. Tambah handler `handleGoogleLogin`.
3. Pasang `onClick` + `disabled` di tombol Google.

```tsx
import { useState } from 'react'
import { useNavigate } from '@tanstack/react-router'

import { getGoogleAuthUrl, login } from '#/features/auth/api/auth.functions'
import { SignInSchema } from '#/features/auth/schemas'

// ... (import lain tidak berubah) ...

const SignInForm = () => {
  const navigate = useNavigate()
  const [googleLoading, setGoogleLoading] = useState(false)

  const form = useAppForm({
    // ... (form yang sudah ada tidak berubah) ...
  })

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
    // ... (struktur JSX tidak berubah) ...
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
  )
}
```

**Kenapa `window.location.assign` dan bukan `navigate`?**
Kita harus meninggalkan aplikasi ini sepenuhnya menuju `accounts.google.com` (host lain). Itu hanya bisa lewat navigasi penuh di level browser. `window.location.assign` melakukan hal itu, dan URL lengkapnya (`data.redirectUrl`) sudah dibuat backend.

---

## 4. Setelah implementasi — jalankan & tes

```bash
# 1. Backend (terminal 1)
cd ../backend
./mvnw spring-boot:run

# 2. Frontend (terminal 2)
cd ../frontend
npm run dev
```

Buka `http://localhost:3000/sign-in`:

1. Klik **"Login with Google"**.
2. Browser pindah ke halaman Google → pilih akun → allow.
3. Browser kembali ke `http://localhost:3000/auth/google/callback?code=xxxx`.
4. Sesaat menampilkan "Signing you in…" lalu masuk `/dashboard`.
5. Di dashboard, email & role Google user tampil. Refresh halaman — session tetap login (cookie `app-session`).

**Tes skenario error:**
- Akses manual `http://localhost:3000/auth/google/callback` (tanpa `?code=`) → balik ke sign-in dengan toast error.
- Refresh halaman `.../auth/google/callback?code=xxxx` setelah berhasil → error "code sudah dipakai", balik ke sign-in. Ini **perilaku yang benar** (one-time code).

---

## 5. Ringkasan file yang dibuat/diubah

| File | Aksi |
|---|---|
| `src/features/auth/schemas.ts` | **Edit** — tambah `OAuthExchangeSchema` |
| `src/features/auth/api/oauth.functions.ts` | **Buat baru** — 2 server functions |
| `src/routes/auth/google/callback.tsx` | **Buat baru** — route callback |
| `src/routes/sign-in.tsx` | **Edit** — `validateSearch` + toast error |
| `src/features/auth/components/SignInForm.tsx` | **Edit** — wiring tombol Google |
| `src/routeTree.gen.ts` | Jangan di-edit — auto-generated |

---

## 6. Referensi API backend yang dipakai

| Endpoint | Method | Dipakai di |
|---|---|---|
| `/api/v1/auth/oauth/google?redirect_url=...` | GET | `getGoogleAuthUrl` |
| `/api/v1/auth/oauth/exchange` | POST | `exchangeGoogleCode` |
| `/auth/oauth/google/callback` | GET | dipegang backend (browser → backend) |

Semua endpoint ini bebas-CORS **karena** dipanggil dari server (via `apiFetch`), bukan dari browser. Kalau suatu saat kamu memanggil `/api/v1/**` langsung dari browser dengan `fetch`, kamu bakal kena CORS error — itulah kenapa pola `createServerFn` + `apiFetch` dipakai.

---

## 7. Apa yang terjadi kalau mau produksi?

1. **Origin**: ganti `APP_SECURITY_OAUTH_FRONTEND_REDIRECT_URIS` di backend dengan domain produksi (misal `https://app.example.com`).
2. **`getRequest()` origin**: di produksi di belakang proxy/load balancer, pastikan `host` header diteruskan (biasanya default). Kalau ingin lebih eksplisit, bisa hardcode origin lewat env var `APP_URL` di `src/env.ts` dan gunakan itu untuk membangun `redirect_url`.
3. **Cookie**: session cookie sudah otomatis `Secure: true` di produksi (lihat `src/server/session.ts`).
4. **Google Console**: pastikan `redirect_uri` yang terdaftar di Google Cloud Console sesuai dengan `APP_SECURITY_OAUTH_REDIRECT_URI` backend.
