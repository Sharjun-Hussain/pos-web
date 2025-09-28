// app/(app)/layout.jsx
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, ShoppingCart, Package, Users, LogOut } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { signOut } from 'next-auth/react';

// You can create this as a separate component if you prefer
function Sidebar() {
  const pathname = usePathname();
  const navItems = [
    { href: '/dashboard', icon: Home, label: 'Dashboard' },
    { href: '/sales', icon: ShoppingCart, label: 'Sales' },
    { href: '/products', icon: Package, label: 'Products' },
    { href: '/customers', icon: Users, label: 'Customers' },
  ];

  return (
    <aside className="hidden md:flex flex-col w-64 bg-slate-800 text-white flex-shrink-0">
      <div className="h-16 flex items-center justify-center text-xl font-bold border-b border-slate-700">
        POS System
      </div>
      <nav className="flex-grow p-4">
        <ul>
          {navItems.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className={`flex items-center p-3 rounded-lg transition-colors ${
                  pathname === item.href
                    ? 'bg-slate-700'
                    : 'hover:bg-slate-700'
                }`}
              >
                <item.icon className="w-5 h-5 mr-3" />
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
}

// You can also create this as a separate component
function Header() {
  const { data: session } = useSession();

  return (
    <header className="flex items-center justify-end h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-6 flex-shrink-0">
      <div className="flex items-center gap-4">
        <span>{session?.user?.name || 'User'}</span>
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => signOut({ callbackUrl: '/login' })}
        >
          <LogOut className="w-5 h-5" />
        </Button>
      </div>
    </header>
  );
}

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
export default function AppLayout({ children }) {
  // We use useSession to ensure we don't show the layout while loading the session
  const { status } = useSession();

  if (status === 'loading') {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p>Loading application...</p>
      </div>
    );
  }
  
  return (
      <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator
              orientation="vertical"
              className="mr-2 data-[orientation=vertical]:h-4"
            />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink href="#">
                    Building Your Application
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbPage>Data Fetching</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>
        {children}
      </SidebarInset>
    </SidebarProvider>
  );
}