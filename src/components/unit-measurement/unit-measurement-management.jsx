// app/unit-measurement/page.tsx
"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
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
// --- 1. Updated Imports ---
import { MeasurementUnitDialog } from "./unit-measurement-dialog";
import { getMeasurementUnitColumns } from "./unit-measuremrent -column";
// --- 2. Renamed Bulk Actions Component ---
const UnitMeasurementBulkActions = ({ table, onDelete, onDeactivate }) => {
  if (!table) return null;

  const selectedRows = table.getFilteredSelectedRowModel().rows;
  const selectedIds = selectedRows.map((row) => row.original.id);
  const numSelected = selectedIds.length;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="ml-auto">
          Actions ({numSelected})
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => {
            onDeactivate(selectedIds);
            table.resetRowSelection();
        }}>
          Deactivate Selected
        </DropdownMenuItem>
        <DropdownMenuItem className="text-red-500" onClick={() => {
            onDelete(selectedIds);
            table.resetRowSelection();
        }}>
          Delete Selected
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

// --- 3. Renamed Page Component ---
export default function MeasurementUnitPage() {
  const [isNavigating, setIsNavigating] = useState(false);
  // --- 4. Renamed State Variables ---
  const [measurementUnits, setMeasurementUnits] = useState([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingUnit, setEditingUnit] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { data: session, status } = useSession();
  const router = useRouter();

  // Auth check (remains the same)
  useEffect(() => {
    if (status === "unauthenticated") {
      const returnUrl = window.location.pathname + window.location.search;
      router.push(`/login?return_url=${encodeURIComponent(returnUrl)}`);
    }
  }, [router, status]);

  // --- 5. Updated Data Fetching ---
  // --- 5. Updated Data Fetching ---
  const fetchMeasurementUnits = useCallback(async () => {
    if (!session?.accessToken) return;
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(
        // --- Using correct endpoint ---
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/measurement-units`,
        {
          headers: {
            Authorization: `Bearer ${session.accessToken}`,
          },
        }
      );
      if (!response.ok) throw new Error("Failed to fetch measurement units");
      const data = await response.json();
      if (data.status === "success") {
        setMeasurementUnits(data.data.data || []); // Set the correct state
      } else {
        throw new Error(data.message || "Failed to fetch");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [session?.accessToken]);

  useEffect(() => {
    if (status === "authenticated") {
      fetchMeasurementUnits(); // Call the renamed function
    }
  }, [status, fetchMeasurementUnits]);

  // --- 6. Updated Click Handlers ---
  const handleAddClick = useCallback(() => {
    setEditingUnit(null); // Use renamed state
    setIsDialogOpen(true);
  }, []);

  const handleEditClick = useCallback((unit) => {
    setEditingUnit(unit); // Use renamed state
    setIsDialogOpen(true);
  }, []);

  const handleDialogSuccess = useCallback(() => {
    setIsDialogOpen(false);
    setEditingUnit(null); // Use renamed state
    fetchMeasurementUnits(); // Call renamed function
  }, [fetchMeasurementUnits]);

  const handleDialogClose = useCallback((open) => {
    setIsDialogOpen(open);
    if (!open) setEditingUnit(null); // Use renamed state
  }, []);

  // --- 7. Updated Delete Handler ---
  const handleDelete = useCallback(async (ids) => {
    const isBulk = Array.isArray(ids);
    const idsToDelete = isBulk ? ids : [ids];

    toast.promise(
      Promise.all(
        idsToDelete.map((id) =>
          fetch(
            // --- Using correct endpoint ---
            `${process.env.NEXT_PUBLIC_API_BASE_URL}/measurement-units/${id}`,
            {
              method: "DELETE",
              headers: { Authorization: `Bearer ${session?.accessToken}` },
            }
          )
        )
      ),
      {
        loading: "Deleting...",
        success: () => {
          fetchMeasurementUnits(); // Refetch
          return "Unit(s) deleted successfully!"; // Updated message
        },
        error: "Failed to delete.",
      }
    );
  }, [session?.accessToken, fetchMeasurementUnits]);

  // --- 8. Updated Toggle Status Handler ---
  const handleToggleStatus = useCallback(async (unit) => {
    const action = unit.is_active ? "deactivate" : "activate";
    toast.promise(
      fetch(
        // --- Using correct endpoint ---
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/measurement-units/${unit.id}/${action}`,
        {
          method: "PATCH",
          headers: { Authorization: `Bearer ${session?.accessToken}` },
        }
      ),
      {
        loading: `${action === "activate" ? "Activating" : "Deactivating"}...`,
        success: () => {
          fetchMeasurementUnits(); // Refetch data
          return `Unit ${unit.name} ${action}d successfully!`; // Updated message
        },
        error: "Action failed.",
      }
    );
  }, [session?.accessToken, fetchMeasurementUnits]);

  // --- 9. Updated Bulk Deactivate Handler ---
  const handleBulkDeactivate = useCallback(async (ids) => {
    toast.promise(
      Promise.all(
        ids.map((id) =>
          fetch(
            // --- Using correct endpoint ---
            `${process.env.NEXT_PUBLIC_API_BASE_URL}/measurement-units/${id}/deactivate`,
            {
              method: "PATCH",
              headers: { Authorization: `Bearer ${session?.accessToken}` },
            }
          )
        )
      ),
      {
        loading: "Deactivating...",
        success: () => {
          fetchMeasurementUnits(); // Refetch data
          return "Unit(s) deactivated successfully!"; // Updated message
        },
        error: "Action failed.",
      }
    );
  }, [session?.accessToken, fetchMeasurementUnits]);

  // --- 10. Get Columns ---
  const columns = useMemo(() => getMeasurementUnitColumns({
    onDelete: handleDelete,
    onToggleStatus: handleToggleStatus,
    onEdit: handleEditClick,
  }), [handleDelete, handleToggleStatus, handleEditClick]);

  const bulkActionsComponent = useMemo(() => (
    <UnitMeasurementBulkActions
      onDelete={handleDelete}
      onDeactivate={handleBulkDeactivate}
    />
  ), [handleDelete, handleBulkDeactivate]);

  return (
    <>
      {/* --- 11. Updated Layout Props --- */}
      <ResourceManagementLayout
        data={measurementUnits}
        columns={columns}
        isLoading={loading || status === "loading"}
        isError={!!error}
        errorMessage={error}
        onRetry={fetchMeasurementUnits}
        headerTitle="Unit Measurement"
        headerDescription="Manage your measurement units (e.g., kg, L, cm)."
        addButtonLabel="Add Unit"
        onAddClick={handleAddClick}
        isAdding={isDialogOpen}
        onExportClick={() => console.log("Export clicked")}
        bulkActionsComponent={bulkActionsComponent}
        searchColumn="name"
        searchPlaceholder="Filter units by name..."
        loadingSkeleton={<OrganizationPageSkeleton />}
      />
      {/* --- 12. Updated Dialog Component --- */}
      <MeasurementUnitDialog
        open={isDialogOpen}
        onOpenChange={handleDialogClose}
        onSuccess={handleDialogSuccess}
        session={session}
        initialData={editingUnit}
      />
    </>
  );
}
