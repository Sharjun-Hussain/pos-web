
'use client';
import { useSession } from 'next-auth/react';
import { AppSidebar } from "@/components/app-sidebar"

import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"
import { DashboardLayoutSkeleton } from '../skeletons/Dashboard-skeleton';
import { SystemBreadcrumb } from '@/components/general/breadcrumb/Breadcrumb';
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
           <div className='flex flex-col'>
           <div className='mt-3 mx-6 rounded-sm'> <SystemBreadcrumb/></div>
              {children}
           </div>
            </SidebarInset>
          </div>
        </div>
      </SidebarProvider>
  );
}