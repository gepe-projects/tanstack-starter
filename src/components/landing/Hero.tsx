import { ArrowRightIcon } from 'lucide-react'

import { Badge } from '#/components/ui/badge'
import { Button } from '#/components/ui/button'
import { ScrollReveal } from '#/components/motion/scroll-reveal'

import { hero } from './content'

export function Hero() {
  return (
    <section
      id="top"
      className="relative overflow-hidden pt-36 pb-20 sm:pt-44 sm:pb-24"
    >
      {/* Decorative background */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,color-mix(in_oklch,var(--border)_60%,transparent)_1px,transparent_1px),linear-gradient(to_bottom,color-mix(in_oklch,var(--border)_60%,transparent)_1px,transparent_1px)] bg-[size:56px_56px] [mask-image:radial-gradient(ellipse_70%_55%_at_50%_0%,black,transparent)]" />
        <div className="absolute -top-40 left-1/2 h-120 w-200 -translate-x-1/2 rounded-full bg-primary/20 blur-3xl" />
        <div className="absolute top-24 left-[12%] size-60 rounded-full bg-accent/60 blur-3xl" />
        <div className="absolute top-40 right-[10%] size-60 rounded-full bg-primary/10 blur-3xl" />
      </div>

      <div className="mx-auto flex max-w-6xl flex-col items-center px-4 text-center sm:px-6">
        <ScrollReveal>
          <Badge variant="secondary" className="gap-1.5">
            <span className="size-1.5 animate-pulse rounded-full bg-primary" />
            {hero.badge}
          </Badge>
        </ScrollReveal>

        <ScrollReveal delay={0.05}>
          <h1 className="mt-6 max-w-3xl text-4xl font-semibold tracking-tight text-balance sm:text-6xl">
            {hero.title.before}
            <span className="bg-gradient-to-r from-primary via-fuchsia-500 to-primary bg-clip-text text-transparent">
              {hero.title.highlight}
            </span>
            {hero.title.after}
          </h1>
        </ScrollReveal>

        <ScrollReveal delay={0.1}>
          <p className="mt-6 max-w-2xl text-lg text-pretty text-muted-foreground">
            {hero.description}
          </p>
        </ScrollReveal>

        <ScrollReveal delay={0.15}>
          <div className="mt-8 flex w-full flex-col justify-center gap-3 sm:w-auto sm:flex-row">
            <Button asChild size="lg" className="w-full sm:w-auto">
              <a href={hero.primaryCta.href}>
                {hero.primaryCta.label}
                <ArrowRightIcon data-icon="inline-end" />
              </a>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="w-full sm:w-auto"
            >
              <a href={hero.secondaryCta.href}>{hero.secondaryCta.label}</a>
            </Button>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={0.2}>
          <ul
            id="features"
            className="mt-14 flex max-w-3xl flex-wrap items-center justify-center gap-2 scroll-mt-24"
          >
            {hero.features.map((feature) => (
              <li key={feature.label}>
                <Badge
                  variant="outline"
                  className="gap-1.5 rounded-full px-3 py-1"
                >
                  <feature.icon />
                  {feature.label}
                </Badge>
              </li>
            ))}
          </ul>
        </ScrollReveal>
      </div>
    </section>
  )
}
