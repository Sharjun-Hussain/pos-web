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
  Origami,
  PieChart,
  Settings,
  Settings2,
  SquareTerminal,
  UsersRoundIcon,
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
import { useSession } from "next-auth/react";

export function AppSidebar({ ...props }) {
  const { data: session } = useSession();

  const data = {
    user: {
      name: session?.user?.name,
      email: session?.user?.email,
      avatar: session?.user?.image,
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
            url: "/main-category",
          },
          {
            title: "Sub Category",
            url: "/sub-category",
          },
          {
            title: "Brand",
            url: "/brand",
          },
          {
            title: "Branch",
            url: "/branches",
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
            url: "/unit-measurement",
          },
          {
            title: "Unit",
            url: "/units",
          },
          {
            title: "Containers",
            url: "/containers",
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
            url: "/products/inventory",
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
            url: "/analytics/sales-reports",
          },

          {
            title: "Inventory Reports",
            url: "/analytics/inventory-reports",
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
    ],
    Purchase: [
      {
        name: "Suppliers",
        url: "/suppliers",
        icon: UsersRoundIcon,
      },
      {
        name: "Purchase Orders",
        url: "/purchase-orders",
        icon: Bot,
      },
      {
        name: "Good Received Notes",
        url: "/good-received-notes",
        icon: Command,
      },
    ],
    Settings: [
      {
        name: "Settings",
        url: "/settings",
        icon: Settings,
      },
      {
        name: "Organizations",
        url: "/organizations",
        icon: Origami,
      },
    ],
  };

  return (
    <Sidebar {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={data.teams} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavProjects projects={data.Core} label="Users Management" />
        <NavProjects projects={data.Purchase} label="Purchases" />

        <NavProjects projects={data.Settings} label="Internal Setings" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
