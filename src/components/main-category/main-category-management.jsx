// app/main_categorys/page.tsx
"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
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
import {
  getMainCategoryColumns,
  getOrganizationColumns,
} from "./main-category-column";
import { MainCategoryDialog } from "./main-category-dialog";

const MainCategoryBulkActions = ({ table, onDelete, onDeactivate }) => {
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
export default function MainCategoryPage() {
  const [isNavigating, setIsNavigating] = useState(false);
  const [MainCategories, setMainCategories] = useState([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { data: session, status } = useSession();
  const router = useRouter();

  // 5. Auth and Data Fetching Logic STAYS here
  // 5. Auth and Data Fetching Logic STAYS here
  useEffect(() => {
    if (status === "unauthenticated") {
      const returnUrl = window.location.pathname + window.location.search;
      router.push(`/login?return_url=${encodeURIComponent(returnUrl)}`);
    }
  }, [router, status]);

  const fetchMainCategories = useCallback(async () => {
    if (!session?.accessToken) return;
    console.log("Fetching Main Categories...");
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/main-categories`,
        {
          headers: {
            Authorization: `Bearer ${session.accessToken}`,
          },
        }
      );
      if (!response.ok) throw new Error("Failed to fetch");
      const data = await response.json();
      if (data.status === "success") {
        setMainCategories(data.data.data);
      } else {
        throw new Error(data.message || "Failed to fetch");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [session?.accessToken]); // Depend only on the token string

  useEffect(() => {
    if (status === "authenticated") {
      console.log("Effect triggered: Fetching data");
      fetchMainCategories();
    }
  }, [status, fetchMainCategories]); // Re-run when session is ready

  const handleAddClick = () => {
    setEditingCategory(null); // No data = Create mode
    setIsDialogOpen(true);
  };

  // --- NEW EDIT HANDLER (no type on 'category') ---
  const handleEditClick = useCallback((category) => {
    setEditingCategory(category); // Pass data = Edit mode
    setIsDialogOpen(true);
  }, []);

  // --- NEW DIALOG SUCCESS HANDLER ---
  const handleDialogSuccess = () => {
    setIsDialogOpen(false);
    setEditingCategory(null); // Clear editing state
    fetchMainCategories(); // Refetch the data
  };

  // --- NEW DIALOG CLOSE HANDLER ---
  const handleDialogClose = () => {
    if (isDialogOpen) {
      setIsDialogOpen(false);
      setEditingCategory(null); // Always clear state on close
    }
  };
  const handleDelete = useCallback(async (ids) => {
    // This now works for single or bulk!
    const isBulk = Array.isArray(ids);
    const idsToDelete = isBulk ? ids : [ids];

    toast.promise(
      Promise.all(
        idsToDelete.map((id) =>
          fetch(
            `${process.env.NEXT_PUBLIC_API_BASE_URL}/main-categories/${id}`,
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
          fetchMainCategories(); // Refetch data
          return "Main Category(s) deleted successfully!";
        },
        error: "Failed to delete.",
      }
    );
  }, [session, fetchMainCategories]);

  const handleToggleStatus = useCallback(async (main_category) => {
    const action = main_category.is_active ? "deactivate" : "activate";
    toast.promise(
      fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/main-categories/${main_category.id}/${action}`,
        {
          method: "PATCH",
          headers: { Authorization: `Bearer ${session.accessToken}` },
        }
      ),
      {
        loading: `${action === "activate" ? "Activating" : "Suspending"}...`,
        success: () => {
          fetchMainCategories(); // Refetch data
          return `Main Category ${main_category.name} ${action}d successfully!`;
        },
        error: "Action failed.",
      }
    );
  }, [session, fetchMainCategories]);

  const handleBulkDeactivate = useCallback(async (ids) => {
    toast.promise(
      Promise.all(
        ids.map((id) =>
          fetch(
            `${process.env.NEXT_PUBLIC_API_BASE_URL}/main-categories/${id}/deactivate`,
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
          fetchMainCategories(); // Refetch data
          return "Main Category(s) deactivated successfully!";
        },
        error: "Action failed.",
      }
    );
  }, [session, fetchMainCategories]);

  // 7. Get the columns by passing the handlers
  const columns = useMemo(() => getMainCategoryColumns({
    onDelete: handleDelete,
    onToggleStatus: handleToggleStatus,
    onEdit: handleEditClick,
  }), [handleDelete, handleToggleStatus, handleEditClick]);

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
        onAddClick={handleAddClick}
        isAdding={isNavigating}
        onExportClick={() => console.log("Export clicked")}
        // statCardsComponent={statCards}
        bulkActionsComponent={
          <MainCategoryBulkActions
            onDelete={handleDelete}
            onDeactivate={handleBulkDeactivate}
          />
        }
        searchColumn="name"
        searchPlaceholder="Filter main category by name..."
        loadingSkeleton={<OrganizationPageSkeleton />}
        // filterComponents={(table) => <OrganizationFilters table={table} />}
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
