import { Blocks, BookOpen, Download, Info, LayoutGrid, type LucideIcon } from 'lucide-react'

export type SectionKey = 'build' | 'getting-started' | 'install' | 'widgets' | 'about'

export interface NavItem {
  key: SectionKey
  label: string
  path: string
  icon: LucideIcon
}

export interface NavSection {
  label: string
  items: NavItem[]
}

// Grouped navigation. Each section becomes its own labeled group in the sidebar so the links read
// as a small hierarchy (onboarding → the interactive tool → project info) instead of one flat list.
export const NAV_SECTIONS: NavSection[] = [
  {
    label: 'Get started',
    items: [
      { key: 'getting-started', label: 'Getting started', path: '/getting-started', icon: BookOpen },
      { key: 'install', label: 'Install', path: '/install', icon: Download },
    ],
  },
  {
    label: 'Playground',
    items: [{ key: 'build', label: 'Build', path: '/build', icon: Blocks }],
  },
  {
    label: 'Reference',
    items: [{ key: 'widgets', label: 'Widgets', path: '/widgets', icon: LayoutGrid }],
  },
  {
    label: 'Project',
    items: [{ key: 'about', label: 'About', path: '/about', icon: Info }],
  },
]

// Flat list derived from the sections; drives path <-> section lookups.
export const NAV: NavItem[] = NAV_SECTIONS.flatMap((s) => s.items)

export const SECTION_TITLES: Record<SectionKey, string> = {
  build: 'Build your status line',
  'getting-started': 'Getting started',
  install: 'Install',
  widgets: 'Widget reference',
  about: 'About dashline',
}

// The section key for a pathname like "/install" -> "install". Defaults to getting-started.
export function sectionFromPath(pathname: string): SectionKey {
  const seg = pathname.replace(/^\/+|\/+$/g, '').split('/').pop() ?? ''
  const item = NAV.find((n) => n.key === seg)
  return item ? item.key : 'getting-started'
}
