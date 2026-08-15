'use client'

import { useEffect, useState } from 'react'

import { MenuIcon } from 'lucide-react'

import { ScrollReveal } from '#/components/motion/scroll-reveal'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '#/components/ui/sheet'
import { buttonVariants } from '#/components/ui/button'
import { cn } from '#/lib/utils'

import { hero, navLinks, site } from './content'

export function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <ScrollReveal
      y={-8}
      blur={0}
      amount={0}
      className="fixed inset-x-0 top-0 z-40"
    >
      <header
        className={cn(
          'border-b transition-all duration-300',
          scrolled
            ? 'border-border bg-background/80 backdrop-blur-md'
            : 'border-transparent bg-transparent',
        )}
      >
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6">
          <a
            href="#top"
            className="flex items-center gap-2 font-semibold tracking-tight"
          >
            <span className="grid size-7 place-items-center rounded-lg bg-primary text-sm font-bold text-primary-foreground">
              G
            </span>
            {site.name}
          </a>

          <nav className="hidden items-center gap-6 md:flex" aria-label="Main">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                {link.label}
              </a>
            ))}
          </nav>

          <a
            href={hero.primaryCta.href}
            className={cn(
              buttonVariants({ size: 'sm' }),
              'hidden md:inline-flex',
            )}
          >
            {hero.primaryCta.label}
          </a>

          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger
              aria-label="Open menu"
              className={cn(
                buttonVariants({ variant: 'outline', size: 'icon' }),
                'md:hidden',
              )}
            >
              <MenuIcon />
              <span className="sr-only">Open menu</span>
            </SheetTrigger>
            <SheetContent side="right" className="md:hidden">
              <SheetHeader>
                <SheetTitle>{site.name}</SheetTitle>
              </SheetHeader>
              <nav
                className="flex flex-col gap-1 px-6 pt-4"
                aria-label="Mobile"
              >
                {navLinks.map((link) => (
                  <a
                    key={link.href}
                    href={link.href}
                    onClick={() => setOpen(false)}
                    className="rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                  >
                    {link.label}
                  </a>
                ))}
              </nav>
              <div className="px-6 pt-4">
                <a
                  href={hero.primaryCta.href}
                  onClick={() => setOpen(false)}
                  className={cn(buttonVariants(), 'w-full')}
                >
                  {hero.primaryCta.label}
                </a>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </header>
    </ScrollReveal>
  )
}
