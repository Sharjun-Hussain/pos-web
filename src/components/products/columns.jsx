"use client";

import { useState } from "react";
import { MoreHorizontal, ArrowUpDown, Trash2, Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Link from "next/link";
import { useSession } from "next-auth/react";

// Helper for sorting headers
const DataTableColumnHeader = ({ column, title }) => {
  return (
    <Button
      variant="ghost"
      onClick={() => column?.toggleSorting?.(column?.getIsSorted() === "asc")}
    >
      {title}
      <ArrowUpDown className="ml-2 h-1 w-1 text-gray-700 opacity-60" />
    </Button>
  );
};

// Component to handle Actions (Delete/Edit) with Null Safety
const ActionCell = ({ row }) => {
  const { data: session } = useSession();
  const product = row?.original;
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    // Safety check: ensure product ID exists
    if (!product?.id) {
      alert("Error: Product ID is missing.");
      return;
    }

    if (!confirm("Are you sure you want to delete this product?")) return;

    setIsDeleting(true);
    try {
      // Safety check: ensure token exists
      const token = session?.accessToken;
      if (!token) {
        alert("Unauthorized: No access token found.");
        return;
      }

      const response = await fetch(`https://apipos.inzeedo.com/api/v1/products/${product?.id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
      });

      if (response?.ok) {
        alert("Product deleted successfully");
        window.location.reload(); 
      } else {
        alert("Failed to delete product");
      }
    } catch (error) {
      console.error("Delete error:", error);
      alert("Error occurred while deleting");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <span className="sr-only">Open menu</span>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Actions</DropdownMenuLabel>
        
        {/* Edit Link - Safe Access to ID */}
        {product?.id && (
          <Link href={`/products/${product.id}/edit`}>
            <DropdownMenuItem className="cursor-pointer">
              <Edit className="mr-2 h-4 w-4" /> Edit Product
            </DropdownMenuItem>
          </Link>
        )}

        <DropdownMenuSeparator />

        <DropdownMenuItem 
          onClick={handleDelete}
          disabled={isDeleting || !product?.id}
          className="text-red-500 focus:text-red-500 cursor-pointer"
        >
          <Trash2 className="mr-2 h-4 w-4" /> 
          {isDeleting ? "Deleting..." : "Delete"}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export const columns = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table?.getIsAllPageRowsSelected() ||
          (table?.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table?.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row?.getIsSelected()}
        onCheckedChange={(value) => row?.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "name",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Product" />
    ),
    cell: ({ row }) => {
      const product = row?.original;
      // Null safe access to name and code
      const name = product?.name ?? "Unknown Product";
      const code = product?.code ?? "No Code";
      const initial = name?.charAt(0)?.toUpperCase() ?? "P";

      return (
        <div className="flex items-center gap-3">
          <Avatar>
            <AvatarImage src="" alt={name} />
            <AvatarFallback>{initial}</AvatarFallback>
          </Avatar>
          <div>
            <div className="font-medium">{name}</div>
            <div className="text-sm text-muted-foreground">
              Code: {code}
            </div>
          </div>
        </div>
      );
    },
  },
  {
    // Deep optional chaining for nested objects
    accessorKey: "main_category.name", 
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Category" />
    ),
    cell: ({ row }) => {
      return <span>{row?.original?.main_category?.name ?? "N/A"}</span>;
    }
  },
  {
    accessorKey: "brand.name",
    header: "Brand",
    cell: ({ row }) => {
      return <span>{row?.original?.brand?.name ?? "N/A"}</span>;
    }
  },
  {
    accessorKey: "is_active",
    header: "Status",
    cell: ({ row }) => {
      const isActive = row?.original?.is_active;
      return (
        <Badge variant={isActive ? "default" : "outline"}>
          {isActive ? "Active" : "Inactive"}
        </Badge>
      );
    },
  },
  {
    id: "actions",
    cell: ({ row }) => <ActionCell row={row} />, 
  },
];