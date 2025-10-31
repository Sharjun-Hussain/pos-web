"use client";

import { useState } from "react";
import { columns } from "@/components/organizations/columns"; // 1. CHANGED
import { DataTable } from "@/components/general/data-table";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  PlusCircle,
  Search,
  Download,
  Filter,
  Loader2,
  Building, // 2. CHANGED
  ShieldCheck,
  Package,
} from "lucide-react";
import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// 3. CHANGED: Mock data for organizations
const mockOrganizations = [
  {
    id: "org_1",
    name: "Demo Inc.",
    code: "ABCD004",
    city: "Sainthamaruthu",
    is_multi_branch: true,
    logo: "https://via.placeholder.com/40",
    status: "active",
    subscription_plan: "Pro",
    owner_email: "admin@demo.com",
  },
  {
    id: "org_2",
    name: "Alpha Widgets",
    code: "ALPH001",
    city: "Metropolis",
    is_multi_branch: false,
    logo: "https://via.placeholder.com/40",
    status: "active",
    subscription_plan: "Basic",
    owner_email: "ceo@alpha.com",
  },
  {
    id: "org_3",
    name: "NextGen Solutions",
    code: "NEXT002",
    city: "Gotham",
    is_multi_branch: true,
    logo: "https://via.placeholder.com/40",
    status: "suspended",
    subscription_plan: "Enterprise",
    owner_email: "ops@nextgen.com",
  },
];

// 4. CHANGED: Bulk actions for organizations
const OrganizationBulkActions = ({ table }) => {
  const numSelected = table.getFilteredSelectedRowModel().rows.length;
  const selectedRows = table.getFilteredSelectedRowModel().rows;

  const handleSuspend = () => {
    const selectedIds = selectedRows.map((row) => row.original.id);
    console.log("Suspending organizations:", selectedIds);
    // Add your API call logic here
    table.resetRowSelection();
  };

  const handleDelete = () => {
    const selectedIds = selectedRows.map((row) => row.original.id);
    console.log("Deleting organizations:", selectedIds);
    // Add your API call logic here
    table.resetRowSelection();
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="ml-auto">
          Actions ({numSelected})
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={handleSuspend}>
          Suspend Selected
        </DropdownMenuItem>
        <DropdownMenuItem className="text-red-500" onClick={handleDelete}>
          Delete Selected
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

// 5. CHANGED: Toolbar for organizations
const OrganizationTableToolbar = ({ table, bulkActionsComponent }) => {
  const numSelected = table.getFilteredSelectedRowModel().rows.length;

  return (
    <div className="flex items-center justify-between space-x-4 mb-4">
      <div className="flex flex-1 items-center space-x-2">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Filter organizations by name..."
            value={table.getColumn("name")?.getFilterValue() ?? ""}
            onChange={(event) =>
              table.getColumn("name")?.setFilterValue(event.target.value)
            }
            className="pl-10"
          />
        </div>

        <Select
          value={table.getColumn("subscription_plan")?.getFilterValue() ?? ""}
          onValueChange={(value) => {
            table
              .getColumn("subscription_plan")
              ?.setFilterValue(value || undefined);
          }}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by plan" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={undefined}>All Plans</SelectItem>
            <SelectItem value="Basic">Basic</SelectItem>
            <SelectItem value="Pro">Pro</SelectItem>
            <SelectItem value="Enterprise">Enterprise</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={table.getColumn("status")?.getFilterValue() ?? ""}
          onValueChange={(value) => {
            table.getColumn("status")?.setFilterValue(value || undefined);
          }}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={undefined}>All Statuses</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="suspended">Suspended</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {numSelected > 0 && bulkActionsComponent}
    </div>
  );
};

// 6. CHANGED: Main page component
export default function OrganizationsPage() {
  const [isNavigating, setIsNavigating] = useState(false);
  const [sorting, setSorting] = useState([]);
  const [columnFilters, setColumnFilters] = useState([]);
  const [rowSelection, setRowSelection] = useState({});

  const data = mockOrganizations;

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      rowSelection,
    },
  });

  return (
    <div className="hidden h-full flex-1 flex-col space-y-6 px-6 pb-6 pt-3 md:flex">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">
            Organization Management
          </h1>
          <p className="text-muted-foreground">
            Manage all organizations on your platform.
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            Export
          </Button>
          <Link href="/organizations/new" passHref>
            <Button
              onClick={() => setIsNavigating(true)}
              disabled={isNavigating}
              className="gap-2"
            >
              {isNavigating ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <PlusCircle className="h-4 w-4" />
              )}
              Add Organization
            </Button>
          </Link>
        </div>
      </div>

      <Card>
        {/* As per your last example, the CardHeader is omitted */}
        <CardContent>
          <OrganizationTableToolbar
            table={table}
            bulkActionsComponent={<OrganizationBulkActions table={table} />}
          />

          <DataTable table={table} columns={columns} />
        </CardContent>
      </Card>
    </div>
  );
}
