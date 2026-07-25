import { Separator } from '@/components/ui/separator'
import { SidebarTrigger } from '@/components/ui/sidebar'
import { GitHubStars } from './github-stars'
import { MobileConfig } from './mobile-config'
import { SECTION_GROUP, SECTION_LABELS, SECTION_TITLES, type SectionKey } from './nav'

// Sticky top bar: sidebar toggle, where you are, GitHub star button, and mobile config.
//
// Build gets a title; the docs get a breadcrumb. Build is a tool with no document of its own, so
// the header is the one place it can say what it is — and at 18px it is the top of that screen's
// type scale. A docs page owns its <h1>, and printing the same words again up here only produced
// the same title twice, at two sizes, on two different left edges.
export function SiteHeader({ section }: { section: SectionKey }) {
  const onBuild = section === 'build'

  return (
    <header className="sticky top-0 z-20 flex h-14 shrink-0 items-center gap-2 border-b bg-background/80 px-3 backdrop-blur-md md:px-5">
      <SidebarTrigger className="-ml-1" />
      <Separator orientation="vertical" className="mr-1 !h-5" />
      {onBuild ? (
        <h1 className="truncate text-lg font-semibold tracking-[-0.01em]">{SECTION_TITLES[section]}</h1>
      ) : (
        <nav aria-label="Breadcrumb" className="flex min-w-0 items-center gap-1.5 text-sm">
          <span className="shrink-0 text-muted-foreground">{SECTION_GROUP[section]}</span>
          <span aria-hidden className="text-muted-foreground/40">
            /
          </span>
          <span className="truncate font-medium">{SECTION_LABELS[section]}</span>
        </nav>
      )}
      <span className="flex-1" />
      <GitHubStars />
      {onBuild && <MobileConfig />}
    </header>
  )
}
