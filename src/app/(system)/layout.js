// app/(app)/layout.jsx
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, ShoppingCart, Package, Users, LogOut } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { signOut } from 'next-auth/react';


import { AppSidebar } from "@/components/app-sidebar"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { DashboardLayoutSkeleton } from '../skeletons/Dashboard-skeleton';
export default function AppLayout({ children }) {

  const { status } = useSession();

  if (status === 'loading') {
    return (
      <div className="flex min-h-screen items-center justify-center">
      <DashboardLayoutSkeleton/>
      </div>
    );
  }
  
  return (
      <SidebarProvider>
        <div className="flex min-h-screen w-full">
          <AppSidebar variant="inset" />
          <div className="flex-1 overflow-x-auto"> {/* Container for scrolling */}
            <SidebarInset>
           
              {children}
            </SidebarInset>
          </div>
        </div>
      </SidebarProvider>
  );
}