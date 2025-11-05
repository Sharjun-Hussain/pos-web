"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import OrganizationPageSkeleton from "@/app/skeletons/Organization-skeleton";
import { ResourceManagementLayout } from "../general/resource-management-layout";
// Import the new dialog and column definitions for Units
import { UnitDialog } from "./units-dialog"; // Renamed from MainCategoryDialog
import { getUnitColumns } from "./units-column"; // Renamed from getMainCategoryColumns

// Renamed component
const UnitBulkActions = ({ table, onDelete, onDeactivate }) => {
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

// The Main Page Component - still named UnitsPage, which is now correct.
export default function UnitsPage() {
  const [isNavigating, setIsNavigating] = useState(false);
  // State renamed
  const [units, setUnits] = useState([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  // State renamed
  const [editingUnit, setEditingUnit] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { data: session, status } = useSession();
  const router = useRouter();

  // Auth logic remains the same
  useEffect(() => {
    if (status === "unauthenticated") {
      const returnUrl = window.location.pathname + window.location.search;
      router.push(`/login?return_url=${encodeURIComponent(returnUrl)}`);
    }
  }, [router, status]);

  // Renamed function and state
  const fetchUnits = async () => {
    if (!session?.accessToken) return;
    try {
      setLoading(true);
      setError(null);
      // This fetch URL was already correct
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/units`,
        {
          headers: {
            Authorization: `Bearer ${session.accessToken}`,
          },
        }
      );
      if (!response.ok) throw new Error("Failed to fetch");
      const data = await response.json();
      if (data.status === "success") {
        setUnits(data.data.data); // Use setUnits
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
      fetchUnits(); // Call fetchUnits
    }
  }, [status, session]); // Re-run when session is ready

  const handleAddClick = () => {
    setEditingUnit(null); // Use setEditingUnit
    setIsDialogOpen(true);
  };

  // Parameter renamed from 'category' to 'unit'
  const handleEditClick = (unit) => {
    setEditingUnit(unit); // Use setEditingUnit
    setIsDialogOpen(true);
  };

  // Dialog success handler updated
  const handleDialogSuccess = () => {
    setIsDialogOpen(false);
    setEditingUnit(null); // Clear editing state
    fetchUnits(); // Refetch the data
  };

  // Dialog close handler updated
  const handleDialogClose = () => {
    if (isDialogOpen) {
      setIsDialogOpen(false);
      setEditingUnit(null); // Always clear state on close
    }
  };

  const handleDelete = async (ids) => {
    const isBulk = Array.isArray(ids);
    const idsToDelete = isBulk ? ids : [ids];

    toast.promise(
      Promise.all(
        idsToDelete.map((id) =>
          fetch(
            // API endpoint changed
            `${process.env.NEXT_PUBLIC_API_BASE_URL}/units/${id}`,
            {
              method: "DELETE",
              headers: { Authorization: `Bearer ${session.accessToken}` },
            }
          )
        )
      ),
      {
        loading: "Deleting...",
        success: () => {
          fetchUnits(); // Refetch data
          return "Unit(s) deleted successfully!"; // Text changed
        },
        error: "Failed to delete.",
      }
    );
  };

  // Parameter renamed from 'main_category' to 'unit'
  const handleToggleStatus = async (unit) => {
    const action = unit.is_active ? "deactivate" : "activate";
    toast.promise(
      fetch(
        // API endpoint changed
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/units/${unit.id}/${action}`,
        {
          method: "PATCH",
          headers: { Authorization: `Bearer ${session.accessToken}` },
        }
      ),
      {
        loading: `${action === "activate" ? "Activating" : "Suspending"}...`,
        success: () => {
          fetchUnits(); // Refetch data
          // Text changed
          return `Unit ${unit.name} ${action}d successfully!`;
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
            // API endpoint changed
            `${process.env.NEXT_PUBLIC_API_BASE_URL}/units/${id}/deactivate`,
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
          fetchUnits(); // Refetch data
          return "Unit(s) deactivated successfully!"; // Text changed
        },
        error: "Action failed.",
      }
    );
  };

  // Get columns for Units
  const columns = getUnitColumns({
    onDelete: handleDelete,
    onToggleStatus: handleToggleStatus,
    onEdit: handleEditClick,
  });

  return (
    <>
      <ResourceManagementLayout
        data={units} // Pass units data
        columns={columns}
        isLoading={loading || status === "loading"}
        isError={!!error}
        errorMessage={error}
        onRetry={fetchUnits} // Pass fetchUnits
        headerTitle="Unit Management" // Text changed
        headerDescription="Manage your units, branches, and settings." // Text changed
        addButtonLabel="Add Unit" // Text changed
        onAddClick={handleAddClick}
        isAdding={isNavigating}
        onExportClick={() => console.log("Export clicked")}
        bulkActionsComponent={
          // Use renamed component
          <UnitBulkActions
            onDelete={handleDelete}
            onDeactivate={handleBulkDeactivate}
          />
        }
        searchColumn="name"
        searchPlaceholder="Filter unit by name..." // Text changed
        loadingSkeleton={<OrganizationPageSkeleton />}
        // filterComponents={(table) => <OrganizationFilters table={table} />}
      />
      {/* Use UnitDialog component */}
      <UnitDialog
        open={isDialogOpen}
        onOpenChange={handleDialogClose}
        onSuccess={handleDialogSuccess}
        session={session}
        initialData={editingUnit} // Pass editingUnit
      />
    </>
  );
}
