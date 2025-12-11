// app/sub_categorys/page.tsx
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

const SubCategoryBulkActions = ({ table, onDelete, onDeactivate }) => {
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
export default function SubCategoryPage() {
  const [isNavigating, setIsNavigating] = useState(false);
  const [SubCategories, setSubCategories] = useState([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
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
        setSubCategories(data.data.data);
      } else {
        throw new Error(data.message || "Failed to fetch");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [session]);

  useEffect(() => {
    if (status === "authenticated") {
      fetchSubCategories();
    }
  }, [status, fetchSubCategories]);

  const handleAddClick = () => {
    setEditingCategory(null);
    setIsDialogOpen(true);
  };

  const handleEditClick = useCallback((category) => {
    setEditingCategory(category);
    setIsDialogOpen(true);
  }, []);

  const handleDialogSuccess = () => {
    setIsDialogOpen(false);
    setEditingCategory(null);
    fetchSubCategories();
  };

  const handleDialogClose = () => {
    if (isDialogOpen) {
      setIsDialogOpen(false);
      setEditingCategory(null);
    }
  };
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
          fetchSubCategories(); // Refetch data
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
          fetchSubCategories(); // Refetch data
          return "Sub Category(s) deactivated successfully!";
        },
        error: "Action failed.",
      }
    );
  }, [session, fetchSubCategories]);

  // 7. Get the columns by passing the handlers
  const columns = useMemo(() => getSubCategoryColumns({
    onDelete: handleDelete,
    onToggleStatus: handleToggleStatus,
    onEdit: handleEditClick,
  }), [handleDelete, handleToggleStatus, handleEditClick]);

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
        onAddClick={handleAddClick}
        isAdding={isDialogOpen}
        onExportClick={() => console.log("Export clicked")}
        // statCardsComponent={statCards}
        bulkActionsComponent={
          <SubCategoryBulkActions
            onDelete={handleDelete}
            onDeactivate={handleBulkDeactivate}
          />
        }
        searchColumn="name"
        searchPlaceholder="Filter sub category by name..."
        loadingSkeleton={<OrganizationPageSkeleton />}
        // filterComponents={(table) => <OrganizationFilters table={table} />}
      />
      <SubCategoryDialog
        open={isDialogOpen}
        onOpenChange={handleDialogClose}
        onSuccess={handleDialogSuccess}
        session={session}
        initialData={editingCategory}
      />
    </>
  );
}
