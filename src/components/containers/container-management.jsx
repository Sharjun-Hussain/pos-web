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
import { getContainerColumns } from "./container-column";
import { ContainerDialog } from "./container-dialog";

// --- FIX 1: Component defined outside with safety check ---
const ContainerBulkActions = ({ table, onDelete, onDeactivate }) => {
  // Guard clause: prevents crashes if table isn't ready
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

export default function ContainerPage() {
  const [isNavigating, setIsNavigating] = useState(false);
  const [containers, setContainers] = useState([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingContainer, setEditingContainer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { data: session, status } = useSession();
  const router = useRouter();

  // 1. Auth Check
  useEffect(() => {
    if (status === "unauthenticated") {
      const returnUrl = window.location.pathname + window.location.search;
      router.push(`/login?return_url=${encodeURIComponent(returnUrl)}`);
    }
  }, [router, status]);

  // 2. Data Fetching (Wrapped in useCallback)
  const fetchContainers = useCallback(async () => {
    if (!session?.accessToken) return;
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/containers`,
        {
          headers: {
            Authorization: `Bearer ${session.accessToken}`,
          },
        }
      );
      if (!response.ok) throw new Error("Failed to fetch");
      const data = await response.json();
      if (data.status === "success") {
        setContainers(data.data.data || []);
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
      fetchContainers();
    }
  }, [status, fetchContainers]);

  // 3. Handlers (Wrapped in useCallback)
  const handleAddClick = useCallback(() => {
    setEditingContainer(null);
    setIsDialogOpen(true);
  }, []);

  const handleEditClick = useCallback((container) => {
    setEditingContainer(container);
    setIsDialogOpen(true);
  }, []);

  const handleDialogSuccess = useCallback(() => {
    setIsDialogOpen(false);
    setEditingContainer(null);
    fetchContainers();
  }, [fetchContainers]);

  // --- FIX 2: Correct Dialog Closing Logic ---
  const handleDialogClose = useCallback((open) => {
    setIsDialogOpen(open);
    if (!open) setEditingContainer(null);
  }, []);

  const handleDelete = useCallback(async (ids) => {
    const isBulk = Array.isArray(ids);
    const idsToDelete = isBulk ? ids : [ids];

    toast.promise(
      Promise.all(
        idsToDelete.map((id) =>
          fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/containers/${id}`, {
            method: "DELETE",
            headers: { Authorization: `Bearer ${session.accessToken}` },
          })
        )
      ),
      {
        loading: "Deleting...",
        success: () => {
          fetchContainers();
          return "Container(s) deleted successfully!";
        },
        error: "Failed to delete.",
      }
    );
  }, [session, fetchContainers]);

  const handleToggleStatus = useCallback(async (container) => {
    const action = container.is_active ? "deactivate" : "activate";
    toast.promise(
      fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/containers/${container.id}/${action}`,
        {
          method: "PATCH",
          headers: { Authorization: `Bearer ${session.accessToken}` },
        }
      ),
      {
        loading: `${action === "activate" ? "Activating" : "Deactivating"}...`,
        success: () => {
          fetchContainers();
          return `Container ${container.name} ${action}d successfully!`;
        },
        error: "Action failed.",
      }
    );
  }, [session, fetchContainers]);

  const handleBulkDeactivate = useCallback(async (ids) => {
    toast.promise(
      Promise.all(
        ids.map((id) =>
          fetch(
            `${process.env.NEXT_PUBLIC_API_BASE_URL}/containers/${id}/deactivate`,
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
          fetchContainers();
          return "Container(s) deactivated successfully!";
        },
        error: "Action failed.",
      }
    );
  }, [session, fetchContainers]);

  // --- FIX 3: Memoize Columns ---
  const columns = useMemo(() => getContainerColumns({
    onDelete: handleDelete,
    onToggleStatus: handleToggleStatus,
    onEdit: handleEditClick,
  }), [handleDelete, handleToggleStatus, handleEditClick]);

  // --- FIX 4: Memoize Bulk Actions Component ---
  // This prevents the infinite loop/freeze
  const bulkActionsComponent = useMemo(() => (
    <ContainerBulkActions
      onDelete={handleDelete}
      onDeactivate={handleBulkDeactivate}
    />
  ), [handleDelete, handleBulkDeactivate]);

  return (
    <>
      <ResourceManagementLayout
        data={containers}
        columns={columns}
        isLoading={loading || status === "loading"}
        isError={!!error}
        errorMessage={error}
        onRetry={fetchContainers}
        headerTitle="Container Management"
        headerDescription="Manage your containers, capacity, and settings."
        addButtonLabel="Add Container"
        onAddClick={handleAddClick}
        isAdding={isNavigating}
        onExportClick={() => console.log("Export clicked")}
        bulkActionsComponent={bulkActionsComponent} // Use the memoized variable
        searchColumn="name"
        searchPlaceholder="Filter containers by name..."
        loadingSkeleton={<OrganizationPageSkeleton />}
      />
      <ContainerDialog
        open={isDialogOpen}
        onOpenChange={handleDialogClose} // Use fixed handler
        onSuccess={handleDialogSuccess}
        session={session}
        initialData={editingContainer}
      />
    </>
  );
}