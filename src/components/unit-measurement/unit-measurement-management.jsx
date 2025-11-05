// app/unit-measurement/page.tsx
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
// --- 1. Updated Imports ---
import { MeasurementUnitDialog } from "./unit-measurement-dialog";
import { getMeasurementUnitColumns } from "./unit-measuremrent -column";
// --- 2. Renamed Bulk Actions Component ---
const UnitMeasurementBulkActions = ({ table, onDelete, onDeactivate }) => {
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
  const fetchMeasurementUnits = async () => {
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
        setMeasurementUnits(data.data.data); // Set the correct state
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
      fetchMeasurementUnits(); // Call the renamed function
    }
  }, [status, session]);

  // --- 6. Updated Click Handlers ---
  const handleAddClick = () => {
    setEditingUnit(null); // Use renamed state
    setIsDialogOpen(true);
  };

  const handleEditClick = (unit) => {
    setEditingUnit(unit); // Use renamed state
    setIsDialogOpen(true);
  };

  const handleDialogSuccess = () => {
    setIsDialogOpen(false);
    setEditingUnit(null); // Use renamed state
    fetchMeasurementUnits(); // Call renamed function
  };

  const handleDialogClose = () => {
    if (isDialogOpen) {
      setIsDialogOpen(false);
      setEditingUnit(null); // Use renamed state
    }
  };

  // --- 7. Updated Delete Handler ---
  const handleDelete = async (ids) => {
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
              headers: { Authorization: `Bearer ${session.accessToken}` },
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
  };

  // --- 8. Updated Toggle Status Handler ---
  const handleToggleStatus = async (unit) => {
    const action = unit.is_active ? "deactivate" : "activate";
    toast.promise(
      fetch(
        // --- Using correct endpoint ---
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/measurement-units/${unit.id}/${action}`,
        {
          method: "PATCH",
          headers: { Authorization: `Bearer ${session.accessToken}` },
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
  };

  // --- 9. Updated Bulk Deactivate Handler ---
  const handleBulkDeactivate = async (ids) => {
    toast.promise(
      Promise.all(
        ids.map((id) =>
          fetch(
            // --- Using correct endpoint ---
            `${process.env.NEXT_PUBLIC_API_BASE_URL}/measurement-units/${id}/deactivate`,
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
          fetchMeasurementUnits(); // Refetch data
          return "Unit(s) deactivated successfully!"; // Updated message
        },
        error: "Action failed.",
      }
    );
  };

  // --- 10. Get Columns ---
  const columns = getMeasurementUnitColumns({
    onDelete: handleDelete,
    onToggleStatus: handleToggleStatus,
    onEdit: handleEditClick,
  });

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
        bulkActionsComponent={
          <UnitMeasurementBulkActions
            onDelete={handleDelete}
            onDeactivate={handleBulkDeactivate}
          />
        }
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
