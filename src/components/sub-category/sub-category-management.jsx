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
import { getSubCategoryColumns } from "./sub-category-column";
import { SubCategoryDialog } from "./sub-category-dialog";
import { usePermission } from "@/hooks/use-permission";

// --- FIX 1: Component defined outside with safety check ---
const SubCategoryBulkActions = ({ table, onDelete, onDeactivate }) => {
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

export default function SubCategoryPage() {
  const [isNavigating, setIsNavigating] = useState(false);
  const [SubCategories, setSubCategories] = useState([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { data: session, status } = useSession();
  const router = useRouter();
  const { hasPermission } = usePermission();

  // Permissions
  const canCreate = hasPermission("Sub Category Create");
  const canEdit = hasPermission("Sub Category Edit");
  const canDelete = hasPermission("Sub Category Delete");
  const canToggleStatus = hasPermission("Sub Category Status");

  // 1. Auth Check
  useEffect(() => {
    if (status === "unauthenticated") {
      const returnUrl = window.location.pathname + window.location.search;
      router.push(`/login?return_url=${encodeURIComponent(returnUrl)}`);
    }
  }, [router, status]);

  // 2. Data Fetching
  const fetchSubCategories = useCallback(async () => {
    if (!session?.accessToken) return;
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/sub-categories`,
        {
          headers: {
            Authorization: `Bearer ${session.accessToken}`,
          },
        }
      );
      if (!response.ok) throw new Error("Failed to fetch");
      const data = await response.json();
      
      if (data.status === "success") {
        setSubCategories(data.data.data || []);
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
      fetchSubCategories();
    }
  }, [status, fetchSubCategories]);

  // 3. Handlers
  const handleAddClick = useCallback(() => {
    setEditingCategory(null);
    setIsDialogOpen(true);
  }, []);

  const handleEditClick = useCallback((category) => {
    setEditingCategory(category);
    setIsDialogOpen(true);
  }, []);

  const handleDialogSuccess = useCallback(() => {
    setIsDialogOpen(false);
    setEditingCategory(null);
    fetchSubCategories();
  }, [fetchSubCategories]);

  // --- FIX 2: Correct Dialog Closing Logic ---
  const handleDialogClose = useCallback((open) => {
    setIsDialogOpen(open);
    if (!open) setEditingCategory(null);
  }, []);

  const handleDelete = useCallback(async (ids) => {
    const isBulk = Array.isArray(ids);
    const idsToDelete = isBulk ? ids : [ids];

    toast.promise(
      Promise.all(
        idsToDelete.map((id) =>
          fetch(
            `${process.env.NEXT_PUBLIC_API_BASE_URL}/sub-categories/${id}`,
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
          fetchSubCategories();
          return "Sub Category(s) deleted successfully!";
        },
        error: "Failed to delete.",
      }
    );
  }, [session, fetchSubCategories]);

  const handleToggleStatus = useCallback(async (sub_category) => {
    const action = sub_category.is_active ? "deactivate" : "activate";
    toast.promise(
      fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/sub-categories/${sub_category.id}/${action}`,
        {
          method: "PATCH",
          headers: { Authorization: `Bearer ${session.accessToken}` },
        }
      ),
      {
        loading: `${action === "activate" ? "Activating" : "Suspending"}...`,
        success: () => {
          fetchSubCategories(); 
          return `Sub Category ${sub_category.name} ${action}d successfully!`;
        },
        error: "Action failed.",
      }
    );
  }, [session, fetchSubCategories]);

  const handleBulkDeactivate = useCallback(async (ids) => {
    toast.promise(
      Promise.all(
        ids.map((id) =>
          fetch(
            `${process.env.NEXT_PUBLIC_API_BASE_URL}/sub-categories/${id}/deactivate`,
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
          fetchSubCategories(); 
          return "Sub Category(s) deactivated successfully!";
        },
        error: "Action failed.",
      }
    );
  }, [session, fetchSubCategories]);

  // 4. Memoize Columns
  const columns = useMemo(() => getSubCategoryColumns({
    onDelete: handleDelete,
    onToggleStatus: handleToggleStatus,
    onEdit: handleEditClick,
    canEdit,
    canDelete,
    canToggleStatus,
  }), [handleDelete, handleToggleStatus, handleEditClick, canEdit, canDelete, canToggleStatus]);

  // --- FIX 3: Memoize Bulk Actions Component ---
  // This prevents the infinite loop freeze
  const bulkActionsComponent = useMemo(() => (
    <SubCategoryBulkActions
      onDelete={handleDelete}
      onDeactivate={handleBulkDeactivate}
    />
  ), [handleDelete, handleBulkDeactivate]);

  return (
    <>
      <ResourceManagementLayout
        data={SubCategories}
        columns={columns}
        isLoading={loading || status === "loading"}
        isError={!!error}
        errorMessage={error}
        onRetry={fetchSubCategories}
        headerTitle="Sub Category Management"
        headerDescription="Manage your sub categories, branches, and settings."
        addButtonLabel="Add Sub Category"
        onAddClick={canCreate ? handleAddClick : null}
        isAdding={isNavigating}
        onExportClick={() => console.log("Export clicked")}
        bulkActionsComponent={bulkActionsComponent} // Use the memoized component
        searchColumn="name"
        searchPlaceholder="Filter sub category by name..."
        loadingSkeleton={<OrganizationPageSkeleton />}
      />
      <SubCategoryDialog
        open={isDialogOpen}
        onOpenChange={handleDialogClose} // Use fixed handler
        onSuccess={handleDialogSuccess}
        session={session}
        initialData={editingCategory}
      />
    </>
  );
}