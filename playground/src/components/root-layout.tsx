import { Outlet, useRouterState } from '@tanstack/react-router'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
import { TooltipProvider } from '@/components/ui/tooltip'
import { PlaygroundProvider } from '@/components/playground/context'
import { BuilderDnd } from '@/components/playground/builder-dnd'
import { DocsSidebar } from '@/components/layout/docs-sidebar'
import { RightSidebar } from '@/components/layout/right-sidebar'
import { SiteHeader } from '@/components/layout/site-header'
import { sectionFromPath } from '@/components/layout/nav'

// The persistent app shell rendered by the root route: left docs nav, header, the routed page
// in the middle, and (on Build) the right widgets/config sidebar. Playground state lives here so
// it survives navigation between pages.
export function RootLayout() {
  const pathname = useRouterState({ select: (s) => s.location.pathname })
  const section = sectionFromPath(pathname)
  const onBuild = section === 'build'

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
                  <div className="h-full overflow-auto">
                    <div className="px-4 py-6 md:px-6 lg:px-8">
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
