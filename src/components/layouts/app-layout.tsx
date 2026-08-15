'use client';

import { Outlet, useLocation } from '@tanstack/react-router';

import { cn } from '#/lib/utils';
import { Separator } from '#/components/ui/separator';
import { TooltipProvider } from '#/components/animate-ui/components/animate/tooltip';
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from '#/components/animate-ui/components/radix/sidebar';
import { AppSidebar } from '#/components/layouts/app-sidebar';
import { findActiveTitle, sidebarSections } from '#/components/layouts/sidebar-config';

export function AppLayout({
  user,
  onSignOut,
  className,
}: {
  user: { email: string; roles: string[] };
  onSignOut?: () => void;
  className?: string;
}) {
  const { pathname } = useLocation();
  const activeTitle = findActiveTitle(pathname, sidebarSections);

  return (
    <TooltipProvider>
      <SidebarProvider>
        <AppSidebar user={user} onSignOut={onSignOut} />
        <SidebarInset>
          <header className="flex h-14 shrink-0 items-center gap-2 border-b px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <span className="text-sm font-medium text-muted-foreground">
              {activeTitle ?? 'Dashboard'}
            </span>
          </header>
          <main className={cn('flex flex-1 flex-col gap-4 p-4', className)}>
            <Outlet />
          </main>
        </SidebarInset>
      </SidebarProvider>
    </TooltipProvider>
  );
}
