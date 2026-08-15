import type { ReactNode } from 'react'

/**
 * Full-screen shell for the auth pages. Mirrors the decorative background
 * (grid of boxes + glow blobs) used in the landing hero, centered on the
 * viewport so the pattern frames the auth card.
 */
export function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-8">
      {/* Decorative background */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,color-mix(in_oklch,var(--border)_60%,transparent)_1px,transparent_1px),linear-gradient(to_bottom,color-mix(in_oklch,var(--border)_60%,transparent)_1px,transparent_1px)] bg-[size:56px_56px] [mask-image:radial-gradient(ellipse_65%_50%_at_50%_50%,black,transparent)]" />
        <div className="absolute -top-40 left-1/2 h-120 w-200 -translate-x-1/2 rounded-full bg-primary/20 blur-3xl" />
        <div className="absolute top-24 left-[12%] size-60 rounded-full bg-accent/60 blur-3xl" />
        <div className="absolute top-40 right-[10%] size-60 rounded-full bg-primary/10 blur-3xl" />
      </div>
      {children}
    </div>
  )
}
