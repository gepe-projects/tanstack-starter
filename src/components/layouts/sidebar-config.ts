import type { LucideIcon } from 'lucide-react'
import {
  BookOpen,
  CircleUser,
  KeyRound,
  LayoutDashboard,
  ScrollText,
  Settings2,
  ShieldCheck,
  Users,
} from 'lucide-react'

/**
 * Config-driven sidebar. Semua menu di sidebar ditarik dari file ini —
 * tambah/edit/hapus section, item, atau submenu tanpa menyentuh komponen.
 *
 * Shape:
 *  - section: { title, items }
 *  - item tanpa children  -> tombol link langsung (wajib punya `url`)
 *  - item dengan children -> submenu collapsible (children wajib punya `url`)
 *  - `badge` -> label kecil di kanan item
 *  - `adminOnly` -> item/section hanya tampil untuk user tier admin
 *
 * ✏️ Sesuaikan dengan menu aplikasi kamu.
 */

export type SidebarItem = {
  title: string
  url?: string
  icon?: LucideIcon
  badge?: string
  adminOnly?: boolean
  children?: SidebarItem[]
}

export type SidebarSection = {
  title: string
  items: SidebarItem[]
}

export const sidebarSections: SidebarSection[] = [
  {
    title: 'Platform',
    items: [
      {
        title: 'Dashboard',
        url: '/dashboard',
        icon: LayoutDashboard,
      },
      {
        title: 'Admin Center',
        icon: ShieldCheck,
        adminOnly: true,
        children: [
          { title: 'Users', url: '/admin', icon: Users },
          { title: 'API Keys', url: '/admin/keys', icon: KeyRound, badge: 'JWT' },
          {
            title: 'Audit Logs',
            url: '/admin/audit-logs',
            icon: ScrollText,
            badge: 'New',
          },
        ],
      },
    ],
  },
  {
    title: 'Project',
    items: [
      {
        title: 'Documentation',
        icon: BookOpen,
        children: [
          { title: 'Overview', url: '/dashboard' },
          { title: 'Admin Guide', url: '/admin' },
        ],
      },
      {
        title: 'Preferences',
        icon: Settings2,
        children: [
          { title: 'Profile', url: '/dashboard', icon: CircleUser },
          { title: 'API Keys', url: '/admin/keys', icon: KeyRound },
        ],
      },
    ],
  },
]

/** Cari judul item aktif di seluruh config (untuk judul halaman di header). */
export function findActiveTitle(
  pathname: string,
  sections: SidebarSection[] = sidebarSections,
): string | null {
  for (const section of sections) {
    for (const item of section.items) {
      if (item.url && (pathname === item.url || pathname.startsWith(`${item.url}/`))) {
        return item.title
      }
      for (const child of item.children ?? []) {
        if (child.url && (pathname === child.url || pathname.startsWith(`${child.url}/`))) {
          return child.title
        }
      }
    }
  }
  return null
}
