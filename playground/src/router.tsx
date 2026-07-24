import { createRootRoute, createRoute, createRouter, redirect } from '@tanstack/react-router'
import { RootLayout } from '@/components/root-layout'
import { Workspace } from '@/components/playground/workspace'
import { GettingStarted } from '@/components/docs/getting-started'
import { Install } from '@/components/docs/install'
import { WidgetsReference } from '@/components/docs/widgets-reference'
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
  createRoute({ getParentRoute: () => rootRoute, path: '/about', component: About }),
])

export const router = createRouter({ routeTree, basepath: '/dashline', defaultPreload: 'intent' })
