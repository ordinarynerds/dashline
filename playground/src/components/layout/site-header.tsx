import { Separator } from '@/components/ui/separator'
import { SidebarTrigger } from '@/components/ui/sidebar'
import { GitHubStars } from './github-stars'
import { MobileConfig } from './mobile-config'
import { SECTION_TITLES, type SectionKey } from './nav'

// Sticky top bar: sidebar toggle, current section, GitHub star button, and mobile config.
export function SiteHeader({ section }: { section: SectionKey }) {
  return (
    <header className="sticky top-0 z-20 flex h-14 shrink-0 items-center gap-2 border-b bg-background/80 px-3 backdrop-blur-md md:px-5">
      <SidebarTrigger className="-ml-1" />
      <Separator orientation="vertical" className="mr-1 !h-5" />
      <h1 className="truncate text-sm font-semibold">{SECTION_TITLES[section]}</h1>
      <span className="flex-1" />
      <GitHubStars />
      {section === 'build' && <MobileConfig />}
    </header>
  )
}
