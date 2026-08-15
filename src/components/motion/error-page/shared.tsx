import { motion, useReducedMotion } from 'motion/react'
import { SPRING_PRESS } from '@/lib/ease'
import { useHoverCapable } from '@/lib/hooks/use-hover-capable'
import { cn } from '@/lib/utils'

export interface ErrorProps {
  className?: string
  /** The big status code. */
  code?: string
  title?: string
  description?: string
  homeHref?: string
  homeLabel?: string
  /** When both are set, a secondary outline button is rendered next to "Back home". */
  secondaryHref?: string
  secondaryLabel?: string
}

export const ERROR_DEFAULTS = {
  code: '404',
  title: 'Page not found',
  description:
    'The page you are looking for moved, vanished, or never existed.',
  homeHref: '/',
  homeLabel: 'Back home',
} as const

export const ERROR_PRESETS = {
  notFound: {
    code: '404',
    title: 'Page not found',
    description:
      'The page you are looking for moved, vanished, or never existed.',
  },
  forbidden: {
    code: '403',
    title: 'Access denied',
    description:
      "You don't have permission to view this page. If this is a mistake, contact your administrator.",
  },
  internalServer: {
    code: '500',
    title: 'Something went wrong',
    description:
      'An unexpected error occurred on our end. Please try again in a moment.',
  },
} as const

type ActionsProps = Pick<
  ErrorProps,
  'homeHref' | 'homeLabel' | 'secondaryHref' | 'secondaryLabel' | 'className'
>

/** The primary "Back home" CTA plus an optional secondary outline button. */
export function ErrorActions({
  homeHref = ERROR_DEFAULTS.homeHref,
  homeLabel = ERROR_DEFAULTS.homeLabel,
  secondaryHref,
  secondaryLabel,
  className,
}: ActionsProps) {
  const reduce = useReducedMotion()
  const canHover = useHoverCapable()
  const whileTap = reduce ? undefined : { scale: 0.96 }
  const whileHover = reduce || !canHover ? undefined : { scale: 1.02 }

  return (
    <div
      className={cn(
        'flex flex-wrap items-center justify-center gap-3',
        className,
      )}
    >
      <motion.a
        href={homeHref}
        whileTap={whileTap}
        whileHover={whileHover}
        transition={SPRING_PRESS}
        className="inline-flex h-11 select-none items-center justify-center rounded-lg bg-primary px-6 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
      >
        {homeLabel}
      </motion.a>
      {secondaryHref && secondaryLabel && (
        <motion.a
          href={secondaryHref}
          whileTap={whileTap}
          whileHover={whileHover}
          transition={SPRING_PRESS}
          className="inline-flex h-11 select-none items-center justify-center rounded-lg border border-border bg-card px-6 text-sm font-medium text-foreground transition-colors hover:bg-primary/5"
        >
          {secondaryLabel}
        </motion.a>
      )}
    </div>
  )
}

/** Centers a variant and gives it a consistent minimum stage height. */
export function ErrorStage({
  className,
  children,
}: {
  className?: string
  children: React.ReactNode
}) {
  return (
    <div
      className={cn(
        'flex min-h-105 w-full flex-col items-center justify-center gap-8 px-4 text-center',
        className,
      )}
    >
      {children}
    </div>
  )
}
