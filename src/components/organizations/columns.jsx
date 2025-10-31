"use client";

import { ArrowUpDown, MoreHorizontal, Building } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Link from "next/link";

const DataTableColumnHeader = ({ column, title }) => {
  return (
    <Button
      variant="ghost"
      onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
    >
      {title}
      <ArrowUpDown className="ml-2 h-1 w-1 text-gray-700 opacity-60" />
    </Button>
  );
};

export const columns = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "name",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Organization" />
    ),
    cell: ({ row }) => {
      const organization = row.original;
      return (
        <div className="flex items-center gap-3">
          <Avatar>
            <AvatarImage src={organization.logo} alt={organization.name} />
            <AvatarFallback>
              <Building className="h-5 w-5 text-muted-foreground" />
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="font-medium">{organization.name}</div>
            <div className="text-sm text-muted-foreground">
              {organization.owner_email}
            </div>
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "code",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Org Code" />
    ),
    cell: ({ row }) => {
      return <Badge variant="outline">{row.getValue("code")}</Badge>;
    },
  },
  {
    accessorKey: "subscription_plan",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Plan" />
    ),
    cell: ({ row }) => {
      const plan = row.getValue("subscription_plan");
      let variant = "outline";
      if (plan === "Pro") variant = "default";
      if (plan === "Enterprise") variant = "secondary";

      return <Badge variant={variant}>{plan}</Badge>;
    },
  },
  {
    accessorKey: "city",
    header: "City",
  },
  {
    accessorKey: "is_multi_branch",
    header: "Multi-Branch",
    cell: ({ row }) => {
      return row.getValue("is_multi_branch") ? "Yes" : "No";
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.original.status;
      return (
        <Badge variant={status === "active" ? "default" : "destructive"}>
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </Badge>
      );
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const organization = row.original;
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <Link href={`/organizations/${organization.id}`} passHref>
              <DropdownMenuItem>View Dashboard</DropdownMenuItem>
            </Link>
            <Link href={`/organizations/${organization.id}/edit`} passHref>
              <DropdownMenuItem>Edit Settings</DropdownMenuItem>
            </Link>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-red-500">
              Suspend
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
