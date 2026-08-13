import { Separator } from '#/components/ui/separator'
import { cn } from '#/lib/utils'

interface SeparatorWithTextProps {
  text: string
  className?: string
}

export function SeparatorWithText({ text, className }: SeparatorWithTextProps) {
  return (
    <div className={cn('flex items-center gap-4', className)}>
      <Separator className="flex-1" />
      <span className="shrink-0 text-xs text-muted-foreground">{text}</span>
      <Separator className="flex-1" />
    </div>
  )
}
