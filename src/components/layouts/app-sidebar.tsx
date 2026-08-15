'use client';

import { Link, useLocation, type LinkProps } from '@tanstack/react-router';
import { ChevronRight, LogOut } from 'lucide-react';

import { hasAdminTier } from '#/features/admin/roles';
import { cn } from '#/lib/utils';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '#/components/animate-ui/primitives/radix/collapsible';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarRail,
} from '#/components/animate-ui/components/radix/sidebar';
import {
  sidebarSections,
  type SidebarItem,
} from '#/components/layouts/sidebar-config';

type NavLinkProps = LinkProps['to'];

export function AppSidebar({
  user,
  onSignOut,
  className,
  ...props
}: React.ComponentProps<typeof Sidebar> & {
  user: { email: string; roles: string[] };
  onSignOut?: () => void;
}) {
  const { pathname } = useLocation();
  const isAdmin = hasAdminTier(user.roles);

  const isActive = (url?: string) =>
    url ? pathname === url || pathname.startsWith(`${url}/`) : false;

  const visibleItems = (items: SidebarItem[]) =>
    items.filter((item) => !item.adminOnly || isAdmin);

  const renderItem = (item: SidebarItem) => {
    if (item.children?.length) {
      const hasActiveChild = item.children.some((child) => isActive(child.url));
      return (
        <Collapsible
          key={item.title}
          asChild
          defaultOpen={hasActiveChild}
          className="group/collapsible"
        >
          <SidebarMenuItem>
            <CollapsibleTrigger asChild>
              <SidebarMenuButton tooltip={item.title}>
                {item.icon && <item.icon />}
                <span>{item.title}</span>
                <ChevronRight className="ml-auto transition-transform duration-300 group-data-[state=open]/collapsible:rotate-90" />
              </SidebarMenuButton>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <SidebarMenuSub>
                {item.children.map((child) => (
                  <SidebarMenuSubItem key={child.title}>
                    <SidebarMenuSubButton
                      asChild
                      isActive={isActive(child.url)}
                    >
                      <Link to={child.url as NavLinkProps}>
                        {child.icon && <child.icon />}
                        <span>{child.title}</span>
                      </Link>
                    </SidebarMenuSubButton>
                  </SidebarMenuSubItem>
                ))}
              </SidebarMenuSub>
            </CollapsibleContent>
          </SidebarMenuItem>
        </Collapsible>
      );
    }

    return (
      <SidebarMenuItem key={item.title}>
        <SidebarMenuButton
          asChild
          isActive={isActive(item.url)}
          tooltip={item.title}
        >
          <Link to={item.url as NavLinkProps}>
            {item.icon && <item.icon />}
            <span>{item.title}</span>
            {item.badge && <SidebarMenuBadge>{item.badge}</SidebarMenuBadge>}
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
    );
  };

  return (
    <Sidebar collapsible="icon" className={cn(className)} {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" className="gap-2">
              <div className="flex aspect-square size-8 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                <span className="text-sm font-bold">S</span>
              </div>
              <span className="truncate font-semibold">Starter App</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        {sidebarSections.map((section) => {
          const items = visibleItems(section.items);
          if (items.length === 0) return null;
          return (
            <SidebarGroup key={section.title}>
              <SidebarGroupLabel>{section.title}</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>{items.map(renderItem)}</SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          );
        })}
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <div className="group/menu-button flex w-full items-center gap-2 overflow-hidden rounded-xl px-3 py-2 text-left text-sm whitespace-nowrap transition-[width,height,padding] duration-200 group-data-[collapsible=icon]:size-8! group-data-[collapsible=icon]:p-2! hover:bg-sidebar-accent hover:text-sidebar-accent-foreground">
              <div className="flex aspect-square size-8 shrink-0 items-center justify-center rounded-xl bg-sidebar-accent text-sidebar-accent-foreground">
                <span className="text-sm font-bold">
                  {user.email.slice(0, 1).toUpperCase()}
                </span>
              </div>
              <span className="min-w-0 flex-1 truncate text-left">
                <span className="block truncate text-sm font-medium">
                  {user.email}
                </span>
                <span className="block truncate text-xs text-sidebar-foreground/60">
                  {user.roles.join(', ')}
                </span>
              </span>
              {onSignOut && (
                <button
                  type="button"
                  onClick={onSignOut}
                  className="flex size-6 shrink-0 items-center justify-center rounded-xl text-sidebar-foreground/70 transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                  aria-label="Sign out"
                >
                  <LogOut className="size-4" />
                </button>
              )}
            </div>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
