// app/brands/page.tsx
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

// --- 1. IMPORT YOUR NEW BRAND COMPONENTS ---
import { getBrandColumns } from "./brand-column";
import { BrandDialog } from "./brand-dialog";

// --- 2. RENAMED COMPONENT ---
const BrandBulkActions = ({ table, onDelete, onDeactivate }) => {
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
  const fetchBrands = async () => {
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
        setBrands(data.data.data); // Updated state
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
      fetchBrands(); // Updated function call
    }
  }, [status, session]);

  // --- 6. UPDATED DIALOG HANDLERS ---
  const handleAddClick = () => {
    setEditingBrand(null); // Updated state
    setIsDialogOpen(true);
  };

  const handleEditClick = (brand) => {
    setEditingBrand(brand); // Updated state
    setIsDialogOpen(true);
  };

  const handleDialogSuccess = () => {
    setIsDialogOpen(false);
    setEditingBrand(null); // Updated state
    fetchBrands(); // Updated function call
  };

  const handleDialogClose = () => {
    if (isDialogOpen) {
      setIsDialogOpen(false);
      setEditingBrand(null); // Updated state
    }
  };

  // --- 7. UPDATED API HANDLERS ---
  const handleDelete = async (ids) => {
    const isBulk = Array.isArray(ids);
    const idsToDelete = isBulk ? ids : [ids];

    toast.promise(
      Promise.all(
        idsToDelete.map((id) =>
          fetch(
            `${process.env.NEXT_PUBLIC_API_BASE_URL}/brands/${id}`, // Updated endpoint
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
          fetchBrands(); // Updated function call
          return "Brand(s) deleted successfully!"; // Updated text
        },
        error: "Failed to delete.",
      }
    );
  };

  const handleToggleStatus = async (brand) => {
    const action = brand.is_active ? "deactivate" : "activate";
    toast.promise(
      fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/brands/${brand.id}/${action}`, // Updated endpoint
        {
          method: "PATCH",
          headers: { Authorization: `Bearer ${session.accessToken}` },
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
  };

  const handleBulkDeactivate = async (ids) => {
    toast.promise(
      Promise.all(
        ids.map((id) =>
          fetch(
            `${process.env.NEXT_PUBLIC_API_BASE_URL}/brands/${id}/deactivate`, // Updated endpoint
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
          fetchBrands(); // Updated function call
          return "Brand(s) deactivated successfully!"; // Updated text
        },
        error: "Action failed.",
      }
    );
  };

  // 7. Get the columns by passing the handlers
  const columns = getBrandColumns({
    // Updated function call
    onDelete: handleDelete,
    onToggleStatus: handleToggleStatus,
    onEdit: handleEditClick,
  });

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
        bulkActionsComponent={
          <BrandBulkActions // Updated component
            onDelete={handleDelete}
            onDeactivate={handleBulkDeactivate}
          />
        }
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
