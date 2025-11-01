"use client";

// --- 1. Import hooks ---
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
// --- 2. Import shadcn/ui Table components ---
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// --- 3. Import lucide-react icons ---
import {
  PlusCircle,
  Download,
  Loader2,
  Building2,
  User,
  MapPin,
  LoaderIcon,
  Search,
  MoreHorizontal,
  ArrowUpDown,
} from "lucide-react";

// --- 4. Import @tanstack/react-table ---
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  useReactTable,
} from "@tanstack/react-table";

// --- 5. Define columns in-file ---
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
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Branch Name
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => (
      <div className="font-medium">{row.getValue("name")}</div>
    ),
  },
  {
    accessorKey: "organization",
    header: "Organization",
    cell: ({ row }) => {
      // Assuming branch.organization.name exists
      const organization = row.original.organization;
      return <div>{organization?.name || "N/A"}</div>;
    },
  },
  {
    accessorKey: "location",
    header: "Location",
    cell: ({ row }) => {
      // Assuming branch.location.city exists
      const location = row.original.location;
      return <div>{location?.city || "N/A"}</div>;
    },
  },
  {
    accessorKey: "staff_count",
    header: "Staff",
    cell: ({ row }) => <div>{row.getValue("staff_count") || 0}</div>,
  },
  {
    accessorKey: "is_active",
    header: "Status",
    cell: ({ row }) => {
      const isActive = row.getValue("is_active");
      return (
        <Badge variant={isActive ? "default" : "outline"}>
          {isActive ? "Active" : "Inactive"}
        </Badge>
      );
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const branch = row.original;
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
            <DropdownMenuItem
              onClick={() => navigator.clipboard.writeText(branch.id)}
            >
              Copy branch ID
            </DropdownMenuItem>
            <DropdownMenuItem>Edit Branch</DropdownMenuItem>
            <DropdownMenuItem className="text-red-500">
              Delete Branch
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];

// --- 6. Define DataTable component in-file ---
function DataTable({ table, columns }) {
  return (
    <div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end space-x-2 py-4">
        <div className="flex-1 text-sm text-muted-foreground">
          {table.getFilteredSelectedRowModel().rows.length} of{" "}
          {table.getFilteredRowModel().rows.length} row(s) selected.
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
        >
          Previous
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
        >
          Next
        </Button>
      </div>
    </div>
  );
}

// --- 7. Create a function to calculate stats ---
const calculateBranchStats = (branches) => {
  if (!branches || branches.length === 0) {
    return {
      totalBranches: 0,
      activeBranches: 0,
      totalStaff: 0,
      locations: 0,
    };
  }

  return {
    totalBranches: branches.length,
    activeBranches: branches.filter((branch) => branch.is_active).length,
    totalStaff: branches.reduce(
      (acc, branch) => acc + (branch.staff_count || 0),
      0
    ),
    locations: new Set(
      branches.map((branch) => branch.location?.city).filter(Boolean)
    ).size,
  };
};

// --- 8. BranchTableToolbar component ---
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
          value={
            table.getColumn("is_active")?.getFilterValue() === undefined
              ? ""
              : String(table.getColumn("is_active")?.getFilterValue())
          }
          onValueChange={(value) => {
            table
              .getColumn("is_active")
              ?.setFilterValue(value === "" ? undefined : value === "true");
          }}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Statuses</SelectItem>
            <SelectItem value="true">Active</SelectItem>
            <SelectItem value="false">Inactive</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {numSelected > 0 && bulkActionsComponent}
    </div>
  );
};

// --- 9. BranchBulkActions component ---
const BranchBulkActions = ({ table }) => {
  const numSelected = table.getFilteredSelectedRowModel().rows.length;
  const selectedRows = table.getFilteredSelectedRowModel().rows;

  const handleDeactivate = () => {
    const selectedIds = selectedRows.map((row) => row.original.id);
    console.log("Deactivating selected branches:", selectedIds);
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
        <DropdownMenuItem className="text-red-500" onClick={handleDeactivate}>
          Deactivate Selected
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

// --- 10. Main BranchesManagement component ---
export default function BranchesManagement() {
  // Remove isNavigating state, as it's not used with <a> tag
  // const [isNavigating, setIsNavigating] = useState(false);

  const [sorting, setSorting] = useState([]);
  const [columnFilters, setColumnFilters] = useState([]);
  const [rowSelection, setRowSelection] = useState({});
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchBranches = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/branches`,
        {
          method: "GET",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            // 'Authorization': `Bearer ${yourToken}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch branches: ${response.status}`);
      }

      const data = await response.json();

      if (data.status === "success") {
        setBranches(data.data.data);
      } else {
        throw new Error(data.message || "Failed to fetch branches");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      console.error("Error fetching branches:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBranches();
  }, []);

  const branchStats = calculateBranchStats(branches);

  const table = useReactTable({
    data: branches,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      rowSelection,
    },
  });

  if (loading) {
    return (
      <div className="hidden h-full flex-1 flex-col space-y-6 px-6 pb-6 pt-3 md:flex">
        <div className="flex items-center justify-center h-64">
          <LoaderIcon className="h-4 w-4 animate-spin" />
          <span className="ml-2">Loading branches...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="hidden h-full flex-1 flex-col space-y-6 px-6 pb-6 pt-3 md:flex">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <p className="text-red-500 mb-4">Error: {error}</p>
            <Button onClick={fetchBranches}>Retry</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="hidden h-full flex-1 flex-col space-y-6 p-6 md:flex">
      {/* Header Section */}
      <div className="flex items-center justify-between">
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
          {/* --- 11. Replace Link with <a> tag --- */}
          <a href="/branches/new">
            <Button className="gap-2">
              <PlusCircle className="h-4 w-4" />
              Add Branch
            </Button>
          </a>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
        <Card className="p-3">
          <CardHeader className="flex flex-row items-center justify-between p-0 space-y-0">
            <CardTitle className="text-xs font-medium">
              Total Branches
            </CardTitle>
            <Building2 className="h-3 w-3 text-muted-foreground" />
          </CardHeader>
          <CardContent className="p-0 pt-2">
            <div className="text-xl font-bold">{branchStats.totalBranches}</div>
            <p className="text-xs text-muted-foreground">All locations</p>
          </CardContent>
        </Card>

        <Card className="p-3">
          <CardHeader className="flex flex-row items-center justify-between p-0 space-y-0">
            <CardTitle className="text-xs font-medium">
              Active Branches
            </CardTitle>
            <Building2 className="h-3 w-3 text-primary" />
          </CardHeader>
          <CardContent className="p-0 pt-2">
            <div className="text-xl font-bold text-green-600">
              {branchStats.activeBranches}
            </div>
            <p className="text-xs text-muted-foreground">Operational</p>
          </CardContent>
        </Card>

        <Card className="p-3">
          <CardHeader className="flex flex-row items-center justify-between p-0 space-y-0">
            <CardTitle className="text-xs font-medium">Total Staff</CardTitle>
            <User className="h-3 w-3 text-muted-foreground" />
          </CardHeader>
          <CardContent className="p-0 pt-2">
            <div className="text-xl font-bold">{branchStats.totalStaff}</div>
            <p className="text-xs text-muted-foreground">All employees</p>
          </CardContent>
        </Card>

        <Card className="p-3">
          <CardHeader className="flex flex-row items-center justify-between p-0 space-y-0">
            <CardTitle className="text-xs font-medium">Locations</CardTitle>
            <MapPin className="h-3 w-3 text-muted-foreground" />
          </CardHeader>
          <CardContent className="p-0 pt-2">
            <div className="text-xl font-bold">{branchStats.locations}</div>
            <p className="text-xs text-muted-foreground">Cities</p>
          </CardContent>
        </Card>
      </div>

      {/* Branches Table Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>All Branches</CardTitle>
              <CardDescription>
                View and manage branch details and status.
              </CardDescription>
            </div>
            <div className="text-sm text-muted-foreground">
              Showing {branches.length} branches
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <BranchTableToolbar
            table={table}
            bulkActionsComponent={<BranchBulkActions table={table} />}
          />

          <DataTable table={table} columns={columns} />
        </CardContent>
      </Card>
    </div>
  );
}
