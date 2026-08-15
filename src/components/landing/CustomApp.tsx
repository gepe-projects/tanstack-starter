import { ArrowRightIcon } from 'lucide-react'

import { Badge } from '#/components/ui/badge'
import { buttonVariants } from '#/components/ui/button'
import { ScrollReveal } from '#/components/motion/scroll-reveal'

import { customApp, services } from './content'

export function CustomApp() {
  return (
    <section id="custom" className="scroll-mt-20 py-20 sm:py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <ScrollReveal>
          <div className="relative overflow-hidden rounded-3xl border bg-card p-8 sm:p-14">
            {/* Decorative glows */}
            <div aria-hidden className="pointer-events-none absolute inset-0">
              <div className="absolute -top-24 -right-24 size-72 rounded-full bg-primary/20 blur-3xl" />
              <div className="absolute -bottom-24 -left-24 size-72 rounded-full bg-accent/60 blur-3xl" />
            </div>

            <div className="relative grid gap-10 lg:grid-cols-2">
              <div className="flex flex-col gap-4">
                <span className="text-xs font-semibold uppercase tracking-widest text-primary">
                  {customApp.eyebrow}
                </span>
                <h2 className="text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
                  {customApp.title}
                </h2>
                <p className="text-base text-pretty text-muted-foreground">
                  {customApp.description}
                </p>

                <div className="mt-2 flex flex-wrap gap-2">
                  {customApp.techStack.map((tech) => (
                    <Badge key={tech} variant="outline">
                      {tech}
                    </Badge>
                  ))}
                </div>

                <div className="mt-4">
                  <a
                    href={customApp.cta.href}
                    className={buttonVariants({ size: 'lg' })}
                  >
                    {customApp.cta.label}
                    <ArrowRightIcon data-icon="inline-end" />
                  </a>
                </div>
              </div>

              <ul className="grid content-start gap-3 sm:grid-cols-2">
                {services.map((service) => (
                  <li
                    key={service.title}
                    className="flex flex-col gap-2 rounded-2xl border bg-background/60 p-4 transition-colors hover:border-primary/40"
                  >
                    <span className="grid size-8 place-items-center rounded-lg bg-primary/10 text-primary">
                      <service.icon />
                    </span>
                    <span className="text-sm font-medium">{service.title}</span>
                    <span className="text-xs text-pretty text-muted-foreground">
                      {service.description}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  )
}
