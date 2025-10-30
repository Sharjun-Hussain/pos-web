"use client";

import * as React from "react";
import {
  AudioWaveform,
  BookOpen,
  Bot,
  ChartPie,
  Command,
  Frame,
  GalleryVerticalEnd,
  Map,
  PieChart,
  Settings,
  Settings2,
  SquareTerminal,
} from "lucide-react";

import { NavMain } from "@/components/nav-main";
import { NavProjects } from "@/components/nav-projects";
import { NavUser } from "@/components/nav-user";
import { TeamSwitcher } from "@/components/team-switcher";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";

// This is sample data.
const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  teams: [
    {
      name: "EMI POS",
      logo: GalleryVerticalEnd,
      plan: "Enterprise",
    },
  ],
  navMain: [
    {
      title: "Configuration",
      url: "#",
      icon: Settings2,
      items: [
        {
          title: "Main Category",
          url: "main-category",
        },
        {
          title: "Sub Category",
          url: "#",
        },
        {
          title: "Brand",
          url: "#",
        },
        {
          title: "Branch",
          url: "branches",
        },
        {
          title: "Supplier",
          url: "#",
        },
        {
          title: "City",
          url: "#",
        },
        {
          title: "Bank",
          url: "#",
        },
        {
          title: "Account Detail",
          url: "#",
        },
        {
          title: "Expense Type",
          url: "#",
        },
        {
          title: "Unit Measurement",
          url: "#",
        },
        {
          title: "Unit Container",
          url: "#",
        },
      ],
    },
    {
      title: "Products",
      url: "#",
      icon: Settings,
      items: [
        {
          title: "Product List",
          url: "/products",
        },

        {
          title: "Inventory / Stock",
          url: "products/inventory",
        },
      ],
    },
    {
      title: "Analytics",
      url: "#",
      icon: ChartPie,
      items: [
        {
          title: "Sales Reports",
          url: "analytics/sales-reports",
        },

        {
          title: "Inventory Reports",
          url: "analytics/inventory-reports",
        },
      ],
    },
  ],
  Core: [
    {
      name: "Employees",
      url: "/employees",
      icon: Frame,
    },
    {
      name: "Customers",
      url: "#",
      icon: PieChart,
    },
    {
      name: "Travel",
      url: "#",
      icon: Map,
    },
  ],
};

export function AppSidebar({ ...props }) {
  return (
    <Sidebar {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={data.teams} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavProjects projects={data.Core} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
