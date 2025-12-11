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
import { getMainCategoryColumns } from "./main-category-column";
import { MainCategoryDialog } from "./main-category-dialog";
import { usePermission } from "@/hooks/use-permission";

// --- FIX 1: Define this component OUTSIDE the main function ---
// This prevents React from redefining the component on every single render.
const MainCategoryBulkActions = ({ table, onDelete, onDeactivate }) => {
  // Guard clause: If table is not yet available, return null to prevent crashes
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

export default function MainCategoryPage() {
  const [isNavigating, setIsNavigating] = useState(false);
  const [MainCategories, setMainCategories] = useState([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { data: session, status } = useSession();
  const router = useRouter();
  const { hasPermission } = usePermission();

  // Permissions
  const canCreate = hasPermission("Main Category Create");
  const canEdit = hasPermission("Main Category Edit");
  const canDelete = hasPermission("Main Category Delete");
  const canToggleStatus = hasPermission("Main Category Status");

  // 1. Safe Auth Check
  useEffect(() => {
    if (status === "unauthenticated") {
      const returnUrl = window.location.pathname + window.location.search;
      router.push(`/login?return_url=${encodeURIComponent(returnUrl)}`);
    }
  }, [router, status]);

  // 2. Data Fetching
  const fetchMainCategories = useCallback(async () => {
    if (!session?.accessToken) return;
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/main-categories`,
        {
          headers: { Authorization: `Bearer ${session.accessToken}` },
        }
      );
      if (!response.ok) throw new Error("Failed to fetch");
      const data = await response.json();
      
      if (data.status === "success") {
        setMainCategories(data.data.data || []); 
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
      fetchMainCategories();
    }
  }, [status, fetchMainCategories]);

  // 3. Dialog Handlers
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
    fetchMainCategories();
  }, [fetchMainCategories]);

  const handleDialogClose = useCallback((open) => {
    setIsDialogOpen(open);
    if (!open) setEditingCategory(null);
  }, []);

  // 4. Action Handlers (Delete, Toggle, Bulk)
  const handleDelete = useCallback(async (ids) => {
    const idsToDelete = Array.isArray(ids) ? ids : [ids];
    toast.promise(
      Promise.all(
        idsToDelete.map((id) =>
          fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/main-categories/${id}`, {
            method: "DELETE",
            headers: { Authorization: `Bearer ${session?.accessToken}` },
          })
        )
      ),
      {
        loading: "Deleting...",
        success: () => {
          fetchMainCategories();
          return "Main Category(s) deleted successfully!";
        },
        error: "Failed to delete.",
      }
    );
  }, [session?.accessToken, fetchMainCategories]);

  const handleToggleStatus = useCallback(async (main_category) => {
    const action = main_category.is_active ? "deactivate" : "activate";
    toast.promise(
      fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/main-categories/${main_category.id}/${action}`,
        {
          method: "PATCH",
          headers: { Authorization: `Bearer ${session?.accessToken}` },
        }
      ),
      {
        loading: `${action === "activate" ? "Activating" : "Suspending"}...`,
        success: () => {
          fetchMainCategories(); 
          return `Main Category ${main_category.name} ${action}d successfully!`;
        },
        error: "Action failed.",
      }
    );
  }, [session?.accessToken, fetchMainCategories]);

  const handleBulkDeactivate = useCallback(async (ids) => {
    toast.promise(
      Promise.all(
        ids.map((id) =>
          fetch(
            `${process.env.NEXT_PUBLIC_API_BASE_URL}/main-categories/${id}/deactivate`,
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
          fetchMainCategories();
          return "Main Category(s) deactivated successfully!";
        },
        error: "Action failed.",
      }
    );
  }, [session?.accessToken, fetchMainCategories]);

  // --- FIX 2: Memoize Columns ---
  // Prevents table re-calculations on every render
  const columns = useMemo(() => getMainCategoryColumns({
    onDelete: handleDelete,
    onToggleStatus: handleToggleStatus,
    onEdit: handleEditClick,
    canEdit,
    canDelete,
    canToggleStatus,
  }), [handleDelete, handleToggleStatus, handleEditClick, canEdit, canDelete, canToggleStatus]);

  // --- FIX 3: Memoize Bulk Actions Component ---
  // Prevents the Layout from thinking the component changed, which stops the infinite loop
  const bulkActionsComponent = useMemo(() => (
    <MainCategoryBulkActions
      onDelete={handleDelete}
      onDeactivate={handleBulkDeactivate}
    />
  ), [handleDelete, handleBulkDeactivate]);

  return (
    <>
      <ResourceManagementLayout
        data={MainCategories}
        columns={columns}
        isLoading={loading || status === "loading"}
        isError={!!error}
        errorMessage={error}
        onRetry={fetchMainCategories}
        headerTitle="Main Category Management"
        headerDescription="Manage your main categories, branches, and settings."
        addButtonLabel="Add Main Category"
        onAddClick={canCreate ? handleAddClick : null}
        isAdding={isNavigating}
        bulkActionsComponent={bulkActionsComponent} // Passing the stable object
        searchColumn="name"
        searchPlaceholder="Filter main category by name..."
        loadingSkeleton={<OrganizationPageSkeleton />}
      />
      <MainCategoryDialog
        open={isDialogOpen}
        onOpenChange={handleDialogClose}
        onSuccess={handleDialogSuccess}
        session={session}
        initialData={editingCategory}
      />
    </>
  );
}