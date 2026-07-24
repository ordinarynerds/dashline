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
import { NAV_SECTIONS, type SectionKey } from './nav'
import { OrdinaryNerdsBrand } from './brand'
import { DashlineWordmark } from './dashline-wordmark'

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
              <SidebarMenu>
                {group.items.map((item) => (
                  <SidebarMenuItem key={item.key}>
                    <SidebarMenuButton asChild isActive={section === item.key} tooltip={item.label}>
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
