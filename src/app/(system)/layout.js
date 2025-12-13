
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
      <SidebarProvider defaultOpen={false}>
        <div className="flex  min-h-screen w-full">
          <AppSidebar variant="inset" />
          <div className="flex-1 overflow-x-auto"> {/* Container for scrolling */}
            <SidebarInset>
           <div className='flex bg-gray-50 flex-col'>
           <div className='my-3 mx-6 bg-gray-50 rounded-sm'> <SystemBreadcrumb/></div>
              {children}
           </div>
            </SidebarInset>
          </div>
        </div>
      </SidebarProvider>
  );
}