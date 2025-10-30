// BranchesPage.jsx (Corrected)
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  PlusCircle,
  Download,
  Loader2,
  Building2,
  User,
  MapPin,
} from "lucide-react";
import Link from "next/link";
import { columns } from "./branches-column"; // Make sure this path is correct
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DataTable } from "../general/data-table"; // Make sure this path is correct
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// --- 1. Import React Table hooks ---
import {
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  getFacetedRowModel, // Needed for selection count
  getFacetedUniqueValues, // Needed for selection count
  useReactTable,
} from "@tanstack/react-table";

// Mock Data for Branches (Same as before)
const mockBranches = [
  // ... your branch data
  {
    id: "branch_1",
    name: "Headquarters",
    location: { city: "Frankfurt", country: "Germany" },
    manager: "Alice Johnson",
    staffCount: 35,
    status: "active",
  },
  {
    id: "branch_2",
    name: "Westside Hub",
    location: { city: "Berlin", country: "Germany" },
    manager: "Bob Williams",
    staffCount: 18,
    status: "active",
  },
  {
    id: "branch_3",
    name: "Innovation Center",
    location: { city: "Munich", country: "Germany" },
    manager: "Charlie Brown",
    staffCount: 22,
    status: "active",
  },
  {
    id: "branch_4",
    name: "Logistics Dept.",
    location: { city: "Hamburg", country: "Germany" },
    manager: "Diana Prince",
    staffCount: 12,
    status: "inactive",
  },
  {
    id: "branch_5",
    name: "Paris Office",
    location: { city: "Paris", country: "France" },
    manager: "Eve Adams",
    staffCount: 15,
    status: "active",
  },
];

// Calculated Statistics for Branches (Same as before)
const branchStats = {
  // ... your stats
  totalBranches: mockBranches.length,
  activeBranches: mockBranches.filter((branch) => branch.status === "active")
    .length,
  totalStaff: mockBranches.reduce((acc, branch) => acc + branch.staffCount, 0),
  locations: new Set(mockBranches.map((branch) => branch.location.city)).size,
};

const BranchTableToolbar = ({ table, bulkActionsComponent }) => {
  const numSelected = table.getFilteredSelectedRowModel().rows.length;

  return (
    <div className="flex items-center justify-between space-x-4 mb-4">
      <div className="flex flex-1 items-center space-x-2">
        {/* Filter by Name (Search Input) */}
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Filter branches by name..."
            value={table.getColumn("name")?.getFilterValue() ?? ""}
            onChange={(event) =>
              table.getColumn("name")?.setFilterValue(event.target.value)
            }
            className="pl-10"
          />
        </div>

        {/* Filter by Status */}
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
            <SelectItem value="inactive">Inactive</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Show bulk actions only if rows are selected */}
      {numSelected > 0 && bulkActionsComponent}
    </div>
  );
};

const BranchBulkActions = ({ table }) => {
  const numSelected = table.getFilteredSelectedRowModel().rows.length;

  const handleDeactivate = () => {
    console.log("Deactivating selected branches...");
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
        <DropdownMenuItem className="text-red-500" onClick={handleDeactivate}>
          Deactivate Selected
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default function BranchesManagement() {
  const [isNavigating, setIsNavigating] = useState(false);

  // --- 3. Add Table State (like in ProductsPage) ---
  const [sorting, setSorting] = useState([]);
  const [columnFilters, setColumnFilters] = useState([]);
  const [rowSelection, setRowSelection] = useState({});

  const data = mockBranches;

  // --- 4. Create the 'table' instance (like in ProductsPage) ---
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getFacetedRowModel: getFacetedRowModel(), // Needed for getFilteredSelectedRowModel
    getFacetedUniqueValues: getFacetedUniqueValues(), // Needed for getFilteredSelectedRowModel
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
    <div className="hidden h-full flex-1 flex-col space-y-6 p-6 md:flex">
      {/* Header Section (Same as before) */}
      <div className="flex items-center justify-between">
        {/* ... header content ... */}
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">
            Branch Management
          </h1>
          <p className="text-muted-foreground">
            Manage all branches across your organization
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            Export
          </Button>
          <Link href="/branches/new" passHref>
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
              Add Branch
            </Button>
          </Link>
        </div>
      </div>

      {/* Statistics Cards (Same as before) */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* ... card content ... */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Branches
            </CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {branchStats.totalBranches}
            </div>
            <p className="text-xs text-muted-foreground">
              Across all locations
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Active Branches
            </CardTitle>
            <Building2 className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {branchStats.activeBranches}
            </div>
            <p className="text-xs text-muted-foreground">
              Currently operational
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Staff</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{branchStats.totalStaff}</div>
            <p className="text-xs text-muted-foreground">
              Employees across all branches
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Locations</CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{branchStats.locations}</div>
            <p className="text-xs text-muted-foreground">Unique cities</p>
          </CardContent>
        </Card>
      </div>

      {/* Branches Table Section (Corrected) */}
      <Card>
        <CardHeader>
          {/* ... header content ... */}
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>All Branches</CardTitle>
              <CardDescription>
                View and manage branch details and status.
              </CardDescription>
            </div>
            <div className="text-sm text-muted-foreground">
              Showing {mockBranches.length} branches
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* --- 5. Use the new Toolbar and pass the 'table' instance --- */}
          <BranchTableToolbar
            table={table}
            bulkActionsComponent={<BranchBulkActions table={table} />}
          />

          {/* --- 6. Pass the 'table' instance to DataTable --- */}
          <DataTable table={table} columns={columns} />
        </CardContent>
      </Card>
    </div>
  );
}
