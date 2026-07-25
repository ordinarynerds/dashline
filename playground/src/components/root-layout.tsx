import { useEffect, useLayoutEffect, useRef } from 'react'
import { Outlet, useRouterState } from '@tanstack/react-router'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
import { TooltipProvider } from '@/components/ui/tooltip'
import { PlaygroundProvider } from '@/components/playground/context'
import { BuilderDnd } from '@/components/playground/builder-dnd'
import { DocsSidebar } from '@/components/layout/docs-sidebar'
import { RightSidebar } from '@/components/layout/right-sidebar'
import { SiteHeader } from '@/components/layout/site-header'
import { SECTION_TITLES, sectionFromPath } from '@/components/layout/nav'

// The persistent app shell rendered by the root route: left docs nav, header, the routed page
// in the middle, and (on Build) the right widgets/config sidebar. Playground state lives here so
// it survives navigation between pages.
export function RootLayout() {
  const pathname = useRouterState({ select: (s) => s.location.pathname })
  const section = sectionFromPath(pathname)
  const onBuild = section === 'build'

  // Every navigation starts at the top of the page.
  //
  // The docs scroll in this container rather than on the document, and the container belongs to the
  // layout, so it outlives the route with its scrollTop intact — the browser then clamps that stale
  // offset to the new page's height. Scrolling to the bottom of the widget reference and clicking
  // Changelog landed at 711.5 of a 712px scroll: the very bottom of a page you had never seen.
  //
  // Top rather than restore-on-back, deliberately. The router's own scrollRestoration records this
  // container on arrival — carried-over offset included — then restores what it just recorded, so
  // it preserves the bug instead of fixing it. Owning the restore did not work either: this effect
  // can run on a render where the pathname has changed but the route component has not committed,
  // so a remembered 900 measured against the outgoing page and clamped to 712, and deferring it a
  // frame was still too early because the view transition defers the DOM swap. A restore that lands
  // on the right offset only sometimes is worse than one that never claims to. Zero is valid
  // against any content, on any route, in both directions.
  const scroller = useRef<HTMLDivElement>(null)
  useLayoutEffect(() => {
    if (scroller.current) scroller.current.scrollTop = 0
  }, [pathname])

  // Every route served the same <title>, so tabs, history and bookmarks were indistinguishable —
  // six entries reading "dashline playground". The name stays in the suffix so a tab is still
  // identifiable when the title is truncated to a few characters, unless the section already says
  // it: "About dashline · dashline" is worse than either half.
  useEffect(() => {
    const title = SECTION_TITLES[section]
    document.title = title.toLowerCase().includes('dashline') ? title : `${title} · dashline`
  }, [section])

  return (
    <PlaygroundProvider>
      <TooltipProvider delayDuration={200}>
        <BuilderDnd>
          <SidebarProvider className="lg:h-svh lg:overflow-hidden">
            <DocsSidebar section={section} />
            <SidebarInset className="min-w-0 lg:h-svh lg:overflow-hidden">
              <SiteHeader section={section} />
              <main className="min-h-0 min-w-0 flex-1 lg:overflow-hidden">
                {onBuild ? (
                  <Outlet />
                ) : (
                  <div ref={scroller} className="h-full overflow-auto">
                    {/* The left rail every docs page aligns to. Pages set their own measure and
                        left-align into it rather than centring, so the column, the headings, and
                        the header chrome all share one edge. */}
                    <div className="px-4 py-8 md:px-6 md:py-10 lg:px-8">
                      <Outlet />
                    </div>
                  </div>
                )}
              </main>
            </SidebarInset>
            {onBuild && <RightSidebar />}
          </SidebarProvider>
        </BuilderDnd>
      </TooltipProvider>
    </PlaygroundProvider>
  )
}
