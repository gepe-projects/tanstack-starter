// ---------------------------------------------------------------------------
// All copy for the landing page lives here, so you can edit text, links, and
// features without touching any component.
// ---------------------------------------------------------------------------

import {
  Boxes,
  CreditCard,
  Database,
  Globe,
  KeyRound,
  LayoutDashboard,
  Layers,
  Lock,
  RefreshCw,
  ScrollText,
  ShieldCheck,
  type LucideIcon,
} from 'lucide-react'

export type NavLink = { label: string; href: string }
export type Feature = { icon: LucideIcon; label: string }
export type Service = { icon: LucideIcon; title: string; description: string }

export const site = {
  name: 'Gepedevelop',
  tagline: 'Full-Stack Starter',
  email: 'gepedevelop@gmail.com',
}

const mailto = (subject: string) =>
  `mailto:${site.email}?subject=${encodeURIComponent(subject)}`

export const navLinks: NavLink[] = [
  { label: 'Features', href: '#features' },
  { label: 'Custom App', href: '#custom' },
]

export const hero = {
  badge: 'Production-ready full-stack starter',
  title: {
    before: 'A ',
    highlight: 'production-ready',
    after: ' full-stack starter.',
  },
  description:
    'TanStack Start frontend + Spring Boot monolith with email & Google sign-in, a role-based admin panel, audit logging, and JWT key management — so you can focus on your product, not the plumbing.',
  primaryCta: { label: 'Get Started', href: '/sign-up' },
  secondaryCta: { label: 'Sign In', href: '/sign-in' },
  features: [
    { icon: KeyRound, label: 'Email + Google Auth' },
    { icon: ShieldCheck, label: 'Role-Based Access (RBAC)' },
    { icon: ScrollText, label: 'Audit Trail' },
    { icon: RefreshCw, label: 'JWT Signing-Key Rotation' },
    { icon: LayoutDashboard, label: 'Admin Panel' },
    { icon: Lock, label: 'HttpOnly Session Cookies' },
    { icon: Database, label: 'PostgreSQL + Flyway' },
    { icon: Boxes, label: 'Spring Modulith' },
  ],
}

export const services: Service[] = [
  {
    icon: LayoutDashboard,
    title: 'Internal Tools',
    description:
      'Dashboards, admin panels, and operational apps built around how your business actually works.',
  },
  {
    icon: CreditCard,
    title: 'Online Payments',
    description:
      'Midtrans, Xendit, or custom payment gateway integrations — secure, compliant, and reliable.',
  },
  {
    icon: Layers,
    title: 'Full-Stack Apps',
    description:
      'From zero to production: solid architecture, high performance, and ready to scale with you.',
  },
  {
    icon: Globe,
    title: 'Landing Pages',
    description:
      'Marketing sites and company profiles that look great and turn visitors into customers.',
  },
]

export const customApp = {
  eyebrow: 'Hire Me',
  title: 'Need a Custom App?',
  description:
    'This starter is a real product I built end-to-end — Spring Boot backend, TanStack Start frontend, authentication, and deployment. If your team needs internal tools, payment integrations, or a full-stack application — or wants to extend this starter with custom features — I can help you build it.',
  cta: { label: "Let's Work Together", href: mailto('gepedevelop@gmail.com') },
  techStack: [
    'TypeScript',
    'TanStack',
    'Spring Boot',
    'PostgreSQL',
    'Redis',
    'Docker',
  ],
}

// TODO: fill in your real social links.
export const footer = {
  description:
    'A production-ready full-stack starter — TanStack Start frontend with a Spring Boot Modulith backend.',
  socials: [{ label: 'GitHub', href: 'https://github.com/ilhamgepe' }],
}
