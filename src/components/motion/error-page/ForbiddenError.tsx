import { ErrorGlitch } from './ErrorGlitch'
import { ERROR_PRESETS } from './shared'
import type { ErrorProps } from './shared'

export function ForbiddenError(props: ErrorProps) {
  return <ErrorGlitch {...ERROR_PRESETS.forbidden} {...props} />
}
