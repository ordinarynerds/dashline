import { Link } from '@tanstack/react-router'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar'
import { cn } from '@/lib/utils'
import { NAV_SECTIONS, type SectionKey } from './nav'
import { OrdinaryNerdsBrand } from './brand'
import { DashlineWordmark } from './dashline-wordmark'

// Three fixes to the vendored sidebar button, applied here rather than in components/ui/sidebar.tsx
// so a shadcn update cannot silently revert them.
//
// 1. Hover and active were the same fill. Both resolved to --sidebar-accent (#1c1c20), so hovering
//    the item below the current page painted two identical rectangles and you could no longer tell
//    which page you were on. Hover is now a lighter wash than active.
//
// 2. Adjacent items sat at gap-0 with an 8px radius. Two touching rounded rectangles of the same
//    colour merge into one shape with concave bites at the seam — the notch between "Getting
//    started" and "Install". Separated below, and no longer the same colour.
//
// 3. The focus ring was clipped. Tailwind's ring paints outward as a box-shadow, every menu item is
//    position:relative with z-index:auto, and the ring's owner comes first in DOM order — so the
//    item below painted over the bottom edge of it. A stacking bump on focus puts the ring on top.
const MENU_BUTTON = cn(
  'relative focus-visible:z-10',
  'hover:bg-sidebar-accent/50',
  // The current page also gets a rail. Colour alone is a small step on these surfaces, and "which
  // page am I on" should survive a glance. Inset from the ends so it clears the pill's corners.
  'data-[active=true]:before:absolute data-[active=true]:before:top-1.5 data-[active=true]:before:bottom-1.5',
  'data-[active=true]:before:left-0 data-[active=true]:before:w-0.5 data-[active=true]:before:rounded-full',
  'data-[active=true]:before:bg-foreground',
)

function Wordmark() {
  return (
    <div className="flex items-center px-2 py-1.5">
      <DashlineWordmark className="text-[19px] group-data-[collapsible=icon]:hidden" />
      <DashlineWordmark compact className="hidden text-[19px] group-data-[collapsible=icon]:flex" />
    </div>
  )
}

// Left navigation: playground and docs sections as routed links, with the Ordinary Nerds
// signature pinned to the bottom.
export function DocsSidebar({ section }: { section: SectionKey }) {
  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <Wordmark />
      </SidebarHeader>
      <SidebarContent>
        {NAV_SECTIONS.map((group) => (
          <SidebarGroup key={group.label}>
            <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu className="gap-0.5">
                {group.items.map((item) => (
                  <SidebarMenuItem key={item.key}>
                    <SidebarMenuButton asChild isActive={section === item.key} tooltip={item.label} className={MENU_BUTTON}>
                      <Link to={item.path}>
                        <item.icon />
                        <span>{item.label}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
      <SidebarFooter>
        <OrdinaryNerdsBrand className="px-2 py-1 group-data-[collapsible=icon]:hidden" />
      </SidebarFooter>
    </Sidebar>
  )
}
