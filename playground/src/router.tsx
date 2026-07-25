import { createRootRoute, createRoute, createRouter, redirect } from '@tanstack/react-router'
import { RootLayout } from '@/components/root-layout'
import { Workspace } from '@/components/playground/workspace'
import { GettingStarted } from '@/components/docs/getting-started'
import { Install } from '@/components/docs/install'
import { WidgetsReference } from '@/components/docs/widgets-reference'
import { Changelog } from '@/components/docs/changelog'
import { About } from '@/components/docs/about'

const rootRoute = createRootRoute({ component: RootLayout })

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  beforeLoad: () => {
    throw redirect({ to: '/getting-started' })
  },
})

const routeTree = rootRoute.addChildren([
  indexRoute,
  createRoute({ getParentRoute: () => rootRoute, path: '/getting-started', component: GettingStarted }),
  createRoute({ getParentRoute: () => rootRoute, path: '/install', component: Install }),
  createRoute({ getParentRoute: () => rootRoute, path: '/build', component: Workspace }),
  createRoute({ getParentRoute: () => rootRoute, path: '/widgets', component: WidgetsReference }),
  createRoute({ getParentRoute: () => rootRoute, path: '/changelog', component: Changelog }),
  createRoute({ getParentRoute: () => rootRoute, path: '/about', component: About }),
])

// No scrollRestoration option: the docs scroll in a container inside the layout, not on the
// document, and the router's element restoration records that container on arrival — stale offset
// included — then restores what it just recorded. root-layout.tsx owns it instead.
export const router = createRouter({
  routeTree,
  // Derived from Vite's base rather than hardcoded, so the same build works at the domain root
  // (Cloudflare) and under a /dashline/ prefix (GitHub Pages) without a second source of truth.
  basepath: import.meta.env.BASE_URL,
  defaultPreload: 'intent',
})
