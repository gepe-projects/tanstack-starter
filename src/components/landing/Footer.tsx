import { Separator } from '#/components/ui/separator'

import { footer, site } from './content'

export function Footer() {
  return (
    <footer className="border-t py-12">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-6 px-4 sm:flex-row sm:px-6">
        <div className="flex flex-col items-center gap-1.5 sm:items-start">
          <a
            href="#top"
            className="flex items-center gap-2 font-semibold tracking-tight"
          >
            <span className="grid size-6 place-items-center rounded-md bg-primary text-xs font-bold text-primary-foreground">
              G
            </span>
            {site.name}
          </a>
          <p className="max-w-xs text-center text-xs text-muted-foreground sm:text-left">
            {footer.description}
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
          {footer.socials.map((social) => (
            <a
              key={social.label}
              href={social.href}
              className="transition-colors hover:text-foreground"
            >
              {social.label}
            </a>
          ))}
          <Separator orientation="vertical" className="hidden h-4 sm:block" />
          <a
            href={`mailto:${site.email}`}
            className="transition-colors hover:text-foreground"
          >
            {site.email}
          </a>
        </div>
      </div>
      <p className="mt-8 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} {site.name}. Built with care.
      </p>
    </footer>
  )
}
