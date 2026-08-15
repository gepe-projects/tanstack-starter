import * as React from "react"
import { motion, isMotionComponent } from "motion/react"
import type { HTMLMotionProps } from "motion/react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center rounded-2xl border border-transparent bg-clip-padding text-sm font-medium whitespace-nowrap transition-[box-shadow,color,background-color,border-color,outline-color,text-decoration-color,fill,stroke,opacity,translate] outline-none select-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30 active:not-aria-[haspopup]:translate-y-px disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/80",
        outline:
          "border-border bg-background hover:bg-muted hover:text-foreground aria-expanded:bg-muted aria-expanded:text-foreground dark:bg-transparent dark:hover:bg-input/30",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-[color-mix(in_oklch,var(--secondary),var(--foreground)_5%)] aria-expanded:bg-secondary aria-expanded:text-secondary-foreground",
        ghost:
          "hover:bg-muted hover:text-foreground aria-expanded:bg-muted aria-expanded:text-foreground dark:hover:bg-muted/50",
        destructive:
          "bg-destructive/10 text-destructive hover:bg-destructive/20 focus-visible:border-destructive/40 focus-visible:ring-destructive/20 dark:bg-destructive/20 dark:hover:bg-destructive/30 dark:focus-visible:ring-destructive/40",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default:
          "h-8 gap-1.5 px-3 has-data-[icon=inline-end]:pr-2.5 has-data-[icon=inline-start]:pl-2.5",
        xs: "h-6 gap-1 px-2.5 text-xs has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2 [&_svg:not([class*='size-'])]:size-3",
        sm: "h-7 gap-1 px-3 has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2",
        lg: "h-9 gap-1.5 px-4 has-data-[icon=inline-end]:pr-3 has-data-[icon=inline-start]:pl-3",
        icon: "size-8",
        "icon-xs": "size-6 [&_svg:not([class*='size-'])]:size-3",
        "icon-sm": "size-7",
        "icon-lg": "size-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
)

type MotionButtonProps = HTMLMotionProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
    hoverScale?: number
    tapScale?: number
  }

type ButtonProps = MotionButtonProps

function mergeRefs<T>(...refs: Array<React.Ref<T> | undefined>): React.RefCallback<T> {
  return (node) => {
    refs.forEach((ref) => {
      if (!ref) return
      if (typeof ref === "function") {
        ref(node)
      } else {
        ref.current = node
      }
    })
  }
}

type SlotProps = {
  children: React.ReactNode
  ref?: React.Ref<HTMLElement>
  "data-slot"?: string
} & Omit<HTMLMotionProps<"button">, "ref" | "children">

function Slot({ children, ref, ...props }: SlotProps) {
  const child = React.Children.only(children) as React.ReactElement
  const isAlreadyMotion = isMotionComponent(child.type)

  const Base = React.useMemo(
    () =>
      isAlreadyMotion
        ? (child.type as React.ElementType)
        : motion.create(child.type as React.ElementType),
    [isAlreadyMotion, child.type],
  )

  const { ref: childRef, ...childProps } = child.props as Record<
    string,
    unknown
  > & { ref?: React.Ref<unknown> }

  const mergedProps = {
    ...childProps,
    ...props,
    className: cn(childProps.className as string | undefined, props.className),
    style: {
      ...(childProps.style as React.CSSProperties | undefined),
      ...(props.style as React.CSSProperties | undefined),
    },
  }

  return (
    <Base
      {...mergedProps}
      ref={mergeRefs(childRef as React.Ref<HTMLElement>, ref)}
    />
  )
}

function Button({
  className,
  variant = "default",
  size = "default",
  type = "button",
  asChild = false,
  hoverScale = 1.05,
  tapScale = 0.95,
  ...props
}: ButtonProps) {
  const Component = (asChild ? Slot : motion.button) as React.ElementType

  return (
    <Component
      {...(asChild ? {} : { "data-slot": "button" })}
      type={type}
      className={cn(buttonVariants({ variant, size, className }))}
      whileHover={{ scale: hoverScale }}
      whileTap={{ scale: tapScale }}
      {...props}
    />
  )
}

export { Button, buttonVariants, type ButtonProps }
