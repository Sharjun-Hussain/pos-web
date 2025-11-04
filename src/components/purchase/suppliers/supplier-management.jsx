"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, UserCheck, UserX, Briefcase, Building } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
// Assuming you have a skeleton component for suppliers
// Assuming the columns file is renamed and exports getSupplierColumns
import { ResourceManagementLayout } from "@/components/general/resource-management-layout";
import OrganizationPageSkeleton from "@/app/skeletons/Organization-skeleton";
import { getSuppliersColumns } from "./suppliers-column";

/**
 * Calculates statistics from the list of suppliers.
 */
const calculateSupplierStats = (suppliers) => ({
  totalSuppliers: suppliers?.length || 0,
  activeSuppliers:
    suppliers?.filter((supplier) => supplier.is_active).length || 0,
  inactiveSuppliers:
    suppliers?.filter((supplier) => !supplier.is_active).length || 0,
  multiBranchSuppliers:
    suppliers?.filter((supplier) => supplier.is_multi_branch).length || 0,
});

/**
 * Renders filter components for the supplier table.
 */
const SupplierFilters = ({ table }) => {
  return (
    <>
      {/* Filter by Branch Type */}
      <Select
        value={String(
          table.getColumn("is_multi_branch")?.getFilterValue() ?? "all"
        )}
        onValueChange={(value) => {
          table
            .getColumn("is_multi_branch")
            ?.setFilterValue(value === "all" ? undefined : value === "true");
        }}
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="All Types" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Types</SelectItem>
          <SelectItem value="true">Multi-Branch</SelectItem>
          <SelectItem value="false">Single Branch</SelectItem>
        </SelectContent>
      </Select>

      {/* Filter by Status */}
      <Select
        value={String(table.getColumn("is_active")?.getFilterValue() ?? "all")}
        onValueChange={(value) => {
          table
            .getColumn("is_active")
            ?.setFilterValue(value === "all" ? undefined : value === "true");
        }}
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="All Statuses" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Statuses</SelectItem>
          <SelectItem value="true">Active</SelectItem>
          <SelectItem value="false">Inactive</SelectItem>
        </SelectContent>
      </Select>
    </>
  );
};

/**
 * Renders bulk action controls for selected suppliers.
 */
const SupplierBulkActions = ({ table, onDelete, onDeactivate }) => {
  const selectedRows = table.getFilteredSelectedRowModel().rows;
  const selectedIds = selectedRows.map((row) => row.original.id);
  const numSelected = selectedIds.length;

  if (numSelected === 0) {
    return null;
  }

  const handleDeactivate = () => {
    onDeactivate(selectedIds);
    table.resetRowSelection();
  };

  const handleDelete = () => {
    onDelete(selectedIds);
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
        <DropdownMenuItem onClick={handleDeactivate}>
          Deactivate Selected
        </DropdownMenuItem>
        <DropdownMenuItem className="text-red-500" onClick={handleDelete}>
          Delete Selected
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

/**
 * Main page component for managing suppliers.
 */
export default function SupplierPage() {
  const [isNavigating, setIsNavigating] = useState(false);
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { data: session, status } = useSession();
  const router = useRouter();

  // Redirect to login if unauthenticated
  useEffect(() => {
    if (status === "unauthenticated") {
      const returnUrl = window.location.pathname + window.location.search;
      router.push(`/login?return_url=${encodeURIComponent(returnUrl)}`);
    }
  }, [router, status]);

  // Fetches the list of suppliers from the API
  const fetchSuppliers = async () => {
    if (!session?.accessToken) return;
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/suppliers`,
        {
          headers: {
            Authorization: `Bearer ${session.accessToken}`,
          },
        }
      );
      if (!response.ok) throw new Error("Failed to fetch suppliers");
      const data = await response.json();
      if (data.status === "success") {
        setSuppliers(data?.data?.data || []);
      } else {
        throw new Error(data.message || "Failed to fetch suppliers");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Fetch suppliers when the session is authenticated
  useEffect(() => {
    if (status === "authenticated") {
      fetchSuppliers();
    }
  }, [status, session]);

  // Navigate to the 'new supplier' page
  const handleAddClick = () => {
    setIsNavigating(true);
    router.push("/suppliers/new");
  };

  // Handles deletion of one or more suppliers
  const handleDelete = async (ids) => {
    const isBulk = Array.isArray(ids);
    const idsToDelete = isBulk ? ids : [ids];

    toast.promise(
      Promise.all(
        idsToDelete.map((id) =>
          fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/suppliers/${id}`, {
            method: "DELETE",
            headers: { Authorization: `Bearer ${session.accessToken}` },
          })
        )
      ),
      {
        loading: "Deleting supplier(s)...",
        success: () => {
          fetchSuppliers(); // Refetch data
          return "Supplier(s) deleted successfully!";
        },
        error: "Failed to delete supplier(s).",
      }
    );
  };

  // Toggles the 'is_active' status of a single supplier
  const handleToggleStatus = async (supplier) => {
    const action = supplier?.is_active ? "deactivate" : "activate";
    toast.promise(
      fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/suppliers/${supplier?.id}/${action}`,
        {
          method: "PATCH",
          headers: { Authorization: `Bearer ${session.accessToken}` },
        }
      ),
      {
        loading: `${action === "activate" ? "Activating" : "Deactivating"}...`,
        success: () => {
          fetchSuppliers(); // Refetch data
          return `Supplier ${action}d successfully!`;
        },
        error: "Action failed.",
      }
    );
  };

  // Deactivates multiple suppliers in bulk
  const handleBulkDeactivate = async (ids) => {
    toast.promise(
      Promise.all(
        ids.map((id) =>
          fetch(
            `${process.env.NEXT_PUBLIC_API_BASE_URL}/suppliers/${id}/deactivate`,
            {
              method: "PATCH",
              headers: { Authorization: `Bearer ${session.accessToken}` },
            }
          )
        )
      ),
      {
        loading: "Deactivating suppliers...",
        success: () => {
          fetchSuppliers(); // Refetch data
          return "Suppliers deactivated successfully!";
        },
        error: "Action failed.",
      }
    );
  };

  // Define columns for the data table
  const columns = getSuppliersColumns({
    onDelete: handleDelete,
    onToggleStatus: handleToggleStatus,
  });

  const supplierStats = calculateSupplierStats(suppliers);

  // JSX for statistic cards
  const statCards = (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Suppliers</CardTitle>
          <Building className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {supplierStats?.totalSuppliers}
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Active Suppliers
          </CardTitle>
          <UserCheck className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {supplierStats?.activeSuppliers}
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Inactive Suppliers
          </CardTitle>
          <UserX className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {supplierStats?.inactiveSuppliers}
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Multi-Branch Suppliers
          </CardTitle>
          <Briefcase className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {supplierStats?.multiBranchSuppliers}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <ResourceManagementLayout
      data={suppliers}
      columns={columns}
      isLoading={loading || status === "loading"}
      isError={!!error}
      errorMessage={error}
      onRetry={fetchSuppliers}
      headerTitle="Supplier Management"
      headerDescription="Manage your suppliers, branches, and settings."
      addButtonLabel="Add Supplier"
      onAddClick={handleAddClick}
      isAdding={isNavigating}
      onExportClick={() => console.log("Export clicked")} // Placeholder
      statCardsComponent={statCards}
      bulkActionsComponent={(table) => (
        <SupplierBulkActions
          table={table}
          onDelete={handleDelete}
          onDeactivate={handleBulkDeactivate}
        />
      )}
      searchColumn="name"
      searchPlaceholder="Filter suppliers by name..."
      loadingSkeleton={<OrganizationPageSkeleton />}
      filterComponents={(table) => <SupplierFilters table={table} />}
    />
  );
}
