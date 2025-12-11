// app/brands/page.tsx
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

// --- 1. IMPORT YOUR NEW BRAND COMPONENTS ---
import { getBrandColumns } from "./brand-column";
import { BrandDialog } from "./brand-dialog";

// --- 2. RENAMED COMPONENT ---
const BrandBulkActions = ({ table, onDelete, onDeactivate }) => {
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

// --- 3. RENAMED MAIN PAGE COMPONENT ---
export default function BrandPage() {
  // --- 4. RENAMED STATE VARIABLES ---
  const [brands, setBrands] = useState([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingBrand, setEditingBrand] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { data: session, status } = useSession();
  const router = useRouter();

  // Auth logic (remains the same)
  useEffect(() => {
    if (status === "unauthenticated") {
      const returnUrl = window.location.pathname + window.location.search;
      router.push(`/login?return_url=${encodeURIComponent(returnUrl)}`);
    }
  }, [router, status]);

  // --- 5. UPDATED FETCH LOGIC ---
  const fetchBrands = useCallback(async () => {
    if (!session?.accessToken) return;
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/brands`, // Updated endpoint
        {
          headers: {
            Authorization: `Bearer ${session.accessToken}`,
          },
        }
      );
      if (!response.ok) throw new Error("Failed to fetch");
      const data = await response.json();
      if (data.status === "success") {
        setBrands(data.data.data || []); // Updated state
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
      fetchBrands(); // Updated function call
    }
  }, [status, fetchBrands]);

  // --- 6. UPDATED DIALOG HANDLERS ---
  const handleAddClick = useCallback(() => {
    setEditingBrand(null); // Updated state
    setIsDialogOpen(true);
  }, []);

  const handleEditClick = useCallback((brand) => {
    setEditingBrand(brand); // Updated state
    setIsDialogOpen(true);
  }, []);

  const handleDialogSuccess = useCallback(() => {
    setIsDialogOpen(false);
    setEditingBrand(null); // Updated state
    fetchBrands(); // Updated function call
  }, [fetchBrands]);

  const handleDialogClose = useCallback((open) => {
    setIsDialogOpen(open);
    if (!open) setEditingBrand(null);
  }, []);

  // --- 7. UPDATED API HANDLERS ---
  const handleDelete = useCallback(async (ids) => {
    const isBulk = Array.isArray(ids);
    const idsToDelete = isBulk ? ids : [ids];

    toast.promise(
      Promise.all(
        idsToDelete.map((id) =>
          fetch(
            `${process.env.NEXT_PUBLIC_API_BASE_URL}/brands/${id}`, // Updated endpoint
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
          fetchBrands(); // Updated function call
          return "Brand(s) deleted successfully!"; // Updated text
        },
        error: "Failed to delete.",
      }
    );
  }, [session?.accessToken, fetchBrands]);

  const handleToggleStatus = useCallback(async (brand) => {
    const action = brand.is_active ? "deactivate" : "activate";
    toast.promise(
      fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/brands/${brand.id}/${action}`, // Updated endpoint
        {
          method: "PATCH",
          headers: { Authorization: `Bearer ${session?.accessToken}` },
        }
      ),
      {
        loading: `${action === "activate" ? "Activating" : "Suspending"}...`,
        success: () => {
          fetchBrands(); // Updated function call
          return `Brand ${brand.name} ${action}d successfully!`; // Updated text
        },
        error: "Action failed.",
      }
    );
  }, [session?.accessToken, fetchBrands]);

  const handleBulkDeactivate = useCallback(async (ids) => {
    toast.promise(
      Promise.all(
        ids.map((id) =>
          fetch(
            `${process.env.NEXT_PUBLIC_API_BASE_URL}/brands/${id}/deactivate`, // Updated endpoint
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
          fetchBrands(); // Updated function call
          return "Brand(s) deactivated successfully!"; // Updated text
        },
        error: "Action failed.",
      }
    );
  }, [session?.accessToken, fetchBrands]);

  // 7. Get the columns by passing the handlers
  const columns = useMemo(() => getBrandColumns({
    // Updated function call
    onDelete: handleDelete,
    onToggleStatus: handleToggleStatus,
    onEdit: handleEditClick,
  }), [handleDelete, handleToggleStatus, handleEditClick]);

  const bulkActionsComponent = useMemo(() => (
    <BrandBulkActions // Updated component
      onDelete={handleDelete}
      onDeactivate={handleBulkDeactivate}
    />
  ), [handleDelete, handleBulkDeactivate]);

  return (
    <>
      {/* --- 8. UPDATED LAYOUT PROPS --- */}
      <ResourceManagementLayout
        data={brands} // Updated data
        columns={columns}
        isLoading={loading || status === "loading"}
        isError={!!error}
        errorMessage={error}
        onRetry={fetchBrands} // Updated function
        headerTitle="Brand Management" // Updated text
        headerDescription="Manage all your product brands and suppliers." // Updated text
        addButtonLabel="Add Brand" // Updated text
        onAddClick={handleAddClick}
        isAdding={isDialogOpen} // <-- Proactive Bug Fix
        onExportClick={() => console.log("Export clicked")}
        bulkActionsComponent={bulkActionsComponent}
        searchColumn="name"
        searchPlaceholder="Filter brands by name..." // Updated text
        loadingSkeleton={<OrganizationPageSkeleton />}
      />
      {/* --- 9. UPDATED DIALOG COMPONENT --- */}
      <BrandDialog
        open={isDialogOpen}
        onOpenChange={handleDialogClose}
        onSuccess={handleDialogSuccess}
        session={session}
        initialData={editingBrand} // Updated state
      />
    </>
  );
}
