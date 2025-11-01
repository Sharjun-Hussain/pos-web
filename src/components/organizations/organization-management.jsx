// app/organizations/page.tsx
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
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Users, UserCheck, UserX, Briefcase, Building } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import OrganizationPageSkeleton from "@/app/skeletons/Organization-skeleton";
import { ResourceManagementLayout } from "../general/resource-management-layout";
import { getOrganizationColumns } from "./organization-column";

const calculateOrganizationStats = (organizations) => ({
  totalOrganizations: organizations.length,
  activeOrganizations: organizations.filter((org) => org.is_active).length,
  inactiveOrganizations: organizations.filter((org) => !org.is_active).length,
  multiBranchOrganizations: organizations.filter((org) => org.is_multi_branch)
    .length,
});

const OrganizationFilters = ({ table }) => {
  return (
    <>
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

const OrganizationBulkActions = ({ table, onDelete, onDeactivate }) => {
  const selectedRows = table.getFilteredSelectedRowModel().rows;
  const selectedIds = selectedRows.map((row) => row.original.id);
  const numSelected = selectedIds.length;

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

// 4. The Main Page Component
export default function OrganizationPage() {
  const [isNavigating, setIsNavigating] = useState(false);
  const [organizations, setOrganizations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { data: session, status } = useSession();
  const router = useRouter();

  // 5. Auth and Data Fetching Logic STAYS here
  useEffect(() => {
    if (status === "unauthenticated") {
      const returnUrl = window.location.pathname + window.location.search;
      router.push(`/login?return_url=${encodeURIComponent(returnUrl)}`);
    }
  }, [router, status]);

  const fetchOrganizations = async () => {
    if (!session?.accessToken) return;
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/organizations`,
        {
          headers: {
            Authorization: `Bearer ${session.accessToken}`,
          },
        }
      );
      if (!response.ok) throw new Error("Failed to fetch");
      const data = await response.json();
      if (data.status === "success") {
        setOrganizations(data.data.data);
      } else {
        throw new Error(data.message || "Failed to fetch");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (status === "authenticated") {
      fetchOrganizations();
    }
  }, [status, session]); // Re-run when session is ready

  // 6. Define all your API handlers here
  const handleAddClick = () => {
    setIsNavigating(true);
    router.push("/organizations/new");
  };

  const handleDelete = async (ids) => {
    // This now works for single or bulk!
    const isBulk = Array.isArray(ids);
    const idsToDelete = isBulk ? ids : [ids];

    toast.promise(
      Promise.all(
        idsToDelete.map((id) =>
          fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/organizations/${id}`, {
            method: "DELETE",
            headers: { Authorization: `Bearer ${session.accessToken}` },
          })
        )
      ),
      {
        loading: "Deleting...",
        success: () => {
          fetchOrganizations(); // Refetch data
          return "Organization(s) deleted successfully!";
        },
        error: "Failed to delete.",
      }
    );
  };

  const handleToggleStatus = async (organization) => {
    const action = organization.is_active ? "deactivate" : "activate";
    toast.promise(
      fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/organizations/${organization.id}/${action}`,
        {
          method: "PATCH",
          headers: { Authorization: `Bearer ${session.accessToken}` },
        }
      ),
      {
        loading: `${action === "activate" ? "Activating" : "Suspending"}...`,
        success: () => {
          fetchOrganizations(); // Refetch data
          return `Organization ${action}d successfully!`;
        },
        error: "Action failed.",
      }
    );
  };

  const handleBulkDeactivate = async (ids) => {
    toast.promise(
      Promise.all(
        ids.map((id) =>
          fetch(
            `${process.env.NEXT_PUBLIC_API_BASE_URL}/organizations/${id}/deactivate`,
            {
              method: "PATCH",
              headers: { Authorization: `Bearer ${session.accessToken}` },
            }
          )
        )
      ),
      {
        loading: "Deactivating...",
        success: () => {
          fetchOrganizations(); // Refetch data
          return "Organizations deactivated successfully!";
        },
        error: "Action failed.",
      }
    );
  };

  // 7. Get the columns by passing the handlers
  const columns = getOrganizationColumns({
    onDelete: handleDelete,
    onToggleStatus: handleToggleStatus,
  });

  // 8. Define your StatCards component
  const organizationStats = calculateOrganizationStats(organizations);
  const statCards = (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Total Organizations
              </p>
              <p className="text-2xl font-bold">
                {organizationStats.totalOrganizations}
              </p>
            </div>
            <Building className="h-8 w-8 text-blue-500" />
          </div>
        </CardContent>
      </Card>
      {/* ... other 3 cards ... */}
    </div>
  );

  // 9. Render the generic layout!
  return (
    <ResourceManagementLayout
      data={organizations}
      columns={columns}
      isLoading={loading || status === "loading"}
      isError={!!error}
      errorMessage={error}
      onRetry={fetchOrganizations}
      headerTitle="Organization Management"
      headerDescription="Manage your organizations, branches, and settings."
      addButtonLabel="Add Organization"
      onAddClick={handleAddClick}
      isAdding={isNavigating}
      onExportClick={() => console.log("Export clicked")}
      // statCardsComponent={statCards}
      bulkActionsComponent={
        <OrganizationBulkActions
          onDelete={handleDelete}
          onDeactivate={handleBulkDeactivate}
        />
      }
      searchColumn="name"
      searchPlaceholder="Filter organizations by name..."
      loadingSkeleton={<OrganizationPageSkeleton />}
      filterComponents={(table) => <OrganizationFilters table={table} />}
    />
  );
}
