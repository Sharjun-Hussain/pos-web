"use client";

// ----------------------------------------------------------------------
// 1. Imports
// ----------------------------------------------------------------------
import { useState, useEffect, useCallback, useMemo } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import Link from "next/link";

// UI Components
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

// Icons
import {
  CheckCircle2,
  XCircle,
  Trash2,
  ChevronDown,
  Package,
  PlusCircle,
  Loader2,
} from "lucide-react";

// Custom Components & Hooks
import { ResourceManagementLayout } from "@/components/general/resource-management-layout";
import { usePermission } from "@/hooks/use-permission";
import { getProductColumns } from "./product-column";
import ProductSkeleton from "@/app/skeletons/product-listing-page-skeleton";

// ----------------------------------------------------------------------
// 2. Helper Components
// ----------------------------------------------------------------------

/**
 * Renders the Title and Icon for the page header.
 */
const HeaderContent = () => (
  <div className="flex items-center gap-3">
    <div className="p-2 rounded-lg bg-primary-100">
      {/* Product Icon */}
      <Package className="w-6 h-6 text-primary-600" />
    </div>
    <div>
      <h1 className="text-2xl font-bold text-gray-900">Product Inventory</h1>
      <p className="text-gray-600 text-sm font-medium">
        Manage your product catalog, prices, and stock.
      </p>
    </div>
  </div>
);

/**
 * The Bulk Action Dropdown Menu
 */
const ProductBulkActions = ({ table, onDelete, onDeactivate, onActivate }) => {
  if (!table) return null;

  const selectedRows = table.getFilteredSelectedRowModel().rows;
  const selectedIds = selectedRows.map((row) => row.original.id);
  const numSelected = selectedIds.length;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="ml-auto">
          Actions ({numSelected}) <ChevronDown className="ml-2 h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem
          className="text-emerald-600 focus:text-emerald-700 focus:bg-emerald-50 cursor-pointer"
          onClick={() => {
            onActivate(selectedIds);
            table.resetRowSelection();
          }}
        >
          <CheckCircle2 className="mr-2 h-4 w-4" />
          Activate Selected
        </DropdownMenuItem>

        <DropdownMenuItem
          className="text-amber-600 focus:text-amber-700 focus:bg-amber-50 cursor-pointer"
          onClick={() => {
            onDeactivate(selectedIds);
            table.resetRowSelection();
          }}
        >
          <XCircle className="mr-2 h-4 w-4" />
          Deactivate Selected
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem
          className="text-red-600 focus:text-red-700 focus:bg-red-50 cursor-pointer"
          onClick={() => {
            onDelete(selectedIds);
            table.resetRowSelection();
          }}
        >
          <Trash2 className="mr-2 h-4 w-4" />
          Delete Selected
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

// ----------------------------------------------------------------------
// 3. Main Page Component
// ----------------------------------------------------------------------

export default function ProductsPage() {
  // --- State ---
  const [isNavigating, setIsNavigating] = useState(false);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // --- Hooks ---
  const { data: session, status } = useSession();
  const router = useRouter();
  const { hasPermission } = usePermission();

  // --- Permissions ---
  const canCreate = hasPermission("Product Create");
  const canEdit = hasPermission("Product Edit");
  const canDelete = hasPermission("Product Delete");
  const canToggleStatus = hasPermission("Product Status");

  // --- Authentication Guard ---
  useEffect(() => {
    if (status === "unauthenticated") {
      const returnUrl = window.location.pathname + window.location.search;
      router.push(`/login?return_url=${encodeURIComponent(returnUrl)}`);
    }
  }, [router, status]);

  // --- Data Fetching ---
  const fetchProducts = useCallback(async () => {
    if (!session?.accessToken) return;
    try {
      setLoading(true);
      setError(null);

      // Using API_BASE_URL env variable for consistency
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/products?page=1`, // Adjust query params as needed
        {
          headers: { Authorization: `Bearer ${session.accessToken}` },
        }
      );

      if (!response.ok) throw new Error("Failed to fetch products");
      const data = await response.json();

      if (data.status === "success") {
        setProducts(data.data.data || []);
      } else {
        throw new Error(data.message || "Failed to fetch products");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [session?.accessToken]);

  useEffect(() => {
    if (status === "authenticated") {
      fetchProducts();
    }
  }, [status, fetchProducts]);

  // --- API Actions (Delete / Toggle / Bulk) ---
  const performApiAction = async (
    ids,
    urlFn,
    method,
    loadingMsg,
    successMsg
  ) => {
    const idArray = Array.isArray(ids) ? ids : [ids];

    toast.promise(
      Promise.all(
        idArray.map((id) =>
          fetch(urlFn(id), {
            method,
            headers: { Authorization: `Bearer ${session?.accessToken}` },
          })
        )
      ),
      {
        loading: loadingMsg,
        success: () => {
          fetchProducts();
          return successMsg;
        },
        error: "Action failed.",
      }
    );
  };

  const handleDelete = useCallback(
    (ids) => {
      performApiAction(
        ids,
        (id) => `${process.env.NEXT_PUBLIC_API_BASE_URL}/products/${id}`,
        "DELETE",
        "Deleting products...",
        "Products deleted successfully!"
      );
    },
    [session, fetchProducts]
  );

  const handleBulkDeactivate = useCallback(
    (ids) => {
      performApiAction(
        ids,
        (id) =>
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/products/${id}/deactivate`,
        "PATCH",
        "Deactivating products...",
        "Products deactivated successfully!"
      );
    },
    [session, fetchProducts]
  );

  const handleBulkActivate = useCallback(
    (ids) => {
      performApiAction(
        ids,
        (id) =>
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/products/${id}/activate`,
        "PATCH",
        "Activating products...",
        "Products activated successfully!"
      );
    },
    [session, fetchProducts]
  );

  const handleToggleStatus = useCallback(
    async (product) => {
      const action = product.is_active ? "deactivate" : "activate";
      performApiAction(
        product.id,
        (id) =>
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/products/${id}/${action}`,
        "PATCH",
        `${action === "activate" ? "Activating" : "Suspending"}...`,
        `Product ${product.name} ${action}d successfully!`
      );
    },
    [session, fetchProducts]
  );

  // --- Navigation Handlers (Modified for Page Navigation) ---

  const handleAddClick = useCallback(() => {
    setIsNavigating(true);
    router.push("/products/new");
  }, [router]);

  const handleEditClick = useCallback(
    (product) => {
      setIsNavigating(true);
      router.push(`/products/${product.id}/edit`);
    },
    [router]
  );

  // --- Memoized Table Config ---
  const columns = useMemo(
    () =>
      getProductColumns({
        onDelete: handleDelete,
        onToggleStatus: handleToggleStatus,
        onEdit: handleEditClick, // This now triggers navigation
        canEdit,
        canDelete,
        canToggleStatus,
      }),
    [
      handleDelete,
      handleToggleStatus,
      handleEditClick,
      canEdit,
      canDelete,
      canToggleStatus,
    ]
  );

  const bulkActionsComponent = useMemo(
    () => (
      <ProductBulkActions
        onDelete={handleDelete}
        onDeactivate={handleBulkDeactivate}
        onActivate={handleBulkActivate}
        table={null} // Table instance will be injected by the Layout
      />
    ),
    [handleDelete, handleBulkDeactivate, handleBulkActivate]
  );

  // --- Render ---
  return (
    <div className="relative min-h-screen w-full bg-gray-50">
      {/* Ambient Background */}
      <div className="fixed inset-0 -z-10 h-full w-full bg-white">
        <div className="absolute top-0 z-[-2] h-screen w-screen bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.3),rgba(255,255,255,0))]"></div>
        <div className="absolute bottom-0 left-0 z-[-2] h-[500px] w-[500px] rounded-full bg-purple-100/50 blur-[100px]"></div>
        <div className="absolute bottom-0 right-0 z-[-2] h-[500px] w-[500px] rounded-full bg-blue-100/50 blur-[100px]"></div>
      </div>

      <ResourceManagementLayout
        // Data & Status
        data={products}
        isLoading={loading || status === "loading"}
        loadingSkeleton={<ProductSkeleton />}
        isError={!!error}
        errorMessage={error}
        onRetry={fetchProducts}
        // Header
        headerTitle={<HeaderContent />}
        // Actions
        addButtonLabel="Add Product"
        onAddClick={canCreate ? handleAddClick : null}
        isAdding={isNavigating} // Shows spinner on button if navigating
        bulkActionsComponent={bulkActionsComponent}
        // Table Config
        columns={columns}
        searchColumn="name"
        searchPlaceholder="Filter products by name..."
      />
    </div>
  );
}
