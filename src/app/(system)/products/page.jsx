"use client"; // Required for useState

import { useState } from "react";
import { columns } from "@/components/products/columns";
import { DataTable } from "@/components/general/data-table";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  PlusCircle,
  Search,
  Download,
  Filter,
  Loader2,
  Package,
  CheckCircle,
  AlertTriangle,
  AlertCircle,
  XCircle,
  Layers,
  Folder,
} from "lucide-react"; // 1. Import Loader2
import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Enhanced mock data with more realistic product information
const mockProducts = [
  {
    id: "prod_1",
    name: "Organic Cotton T-Shirt",
    sku: "TSHIRT-ORG-COT",
    image: "https://via.placeholder.com/40",
    category: { id: "cat_apparel", name: "Apparel" },
    stock: 152,
    status: "active",
    price: 29.99,
    cost: 12.5,
    supplier: "EcoWear Inc.",
    lastUpdated: "2024-01-15",
  },
  {
    id: "prod_2",
    name: "Espresso Roast Coffee",
    sku: "SB-CF-001",
    image: "https://via.placeholder.com/40",
    category: { id: "cat_grocery", name: "Groceries" },
    stock: 8,
    status: "active",
    price: 16.99,
    cost: 8.2,
    supplier: "Bean Masters",
    lastUpdated: "2024-01-18",
  },
  {
    id: "prod_3",
    name: "Wireless Mouse",
    sku: "LOGI-MX-M1",
    image: "https://via.placeholder.com/40",
    category: { id: "cat_electronics", name: "Electronics" },
    stock: 0,
    status: "archived",
    price: 49.99,
    cost: 28.5,
    supplier: "TechGear Ltd.",
    lastUpdated: "2024-01-10",
  },
  {
    id: "prod_4",
    name: "Stainless Steel Water Bottle",
    sku: "ACC-WB-750",
    image: "https://via.placeholder.com/40",
    category: { id: "cat_accessories", name: "Accessories" },
    stock: 45,
    status: "active",
    price: 24.99,
    cost: 11.8,
    supplier: "HydroFlask Co.",
    lastUpdated: "2024-01-20",
  },
];

// --- 1. Create the Product-Specific Bulk Actions Component ---
// This component receives the 'table' prop injected by DataTableToolbar
const ProductBulkActions = ({ table }) => {
  const numSelected = table.getFilteredSelectedRowModel().rows.length;
  const selectedRows = table.getFilteredSelectedRowModel().rows;

  const handleArchive = () => {
    const selectedIds = selectedRows.map((row) => row.original.id);
    console.log("Archiving products:", selectedIds);
    // Add your API call logic here
    table.resetRowSelection(); // Clear selection after action
  };

  const handleDelete = () => {
    const selectedIds = selectedRows.map((row) => row.original.id);
    console.log("Deleting products:", selectedIds);
    // Add your API call logic here
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
        <DropdownMenuItem onClick={handleArchive}>
          Archive Selected
        </DropdownMenuItem>
        <DropdownMenuItem className="text-red-500" onClick={handleDelete}>
          Delete Selected
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

// Calculate statistics from mock data
const productStats = {
  totalProducts: mockProducts.length,
  lowStock: mockProducts.filter(
    (product) => product.stock > 0 && product.stock < 10
  ).length,
  outOfStock: mockProducts.filter((product) => product.stock === 0).length,
  categories: new Set(mockProducts.map((product) => product.category.id)).size,
};

export default function ProductsPage() {
  // 2. Add state to track navigation
  const [isNavigating, setIsNavigating] = useState(false);

  return (
    <div className="hidden h-full flex-1 flex-col space-y-6 px-6 pb-6 pt-3 md:flex">
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">
            Product Inventory
          </h1>
          <p className="text-muted-foreground">
            Manage your product catalog, inventory levels, and product
            information
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            Export
          </Button>
          <Link href="/products/new" passHref>
            {/* 3. Update the Button to use the loading state */}
            <Button
              onClick={() => setIsNavigating(true)}
              disabled={isNavigating}
              className="gap-2"
            >
              {isNavigating ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <PlusCircle className="h-4 w-4" />
              )}
              Add Product
            </Button>
          </Link>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="p-4 hover:shadow-md transition-shadow duration-200 cursor-pointer">
          <CardContent className="p-0 flex items-stretch gap-4">
            <div className="p-3 bg-blue-50 rounded-lg flex items-center justify-center">
              <Package className="h-6 w-6 text-blue-600" />
            </div>
            <div className="flex flex-col justify-center">
              <div className="text-sm text-gray-500 mb-1">Total Products</div>
              <div className="text-3xl font-bold text-gray-900">
                {productStats.totalProducts}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="p-4 hover:shadow-md transition-shadow duration-200 cursor-pointer">
          <CardContent className="p-0 flex items-stretch gap-4">
            <div className="p-3 bg-amber-50 rounded-lg flex items-center justify-center">
              <AlertTriangle className="h-6 w-6 text-amber-600" />
            </div>
            <div className="flex flex-col justify-center">
              <div className="text-sm text-gray-500 mb-1">Low Stock</div>
              <div className="text-3xl font-bold text-amber-600">
                {productStats.lowStock}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="p-4 hover:shadow-md transition-shadow duration-200 cursor-pointer">
          <CardContent className="p-0 flex items-stretch gap-4">
            <div className="p-3 bg-red-50 rounded-lg flex items-center justify-center">
              <XCircle className="h-6 w-6 text-red-600" />
            </div>
            <div className="flex flex-col justify-center">
              <div className="text-sm text-gray-500 mb-1">Out of Stock</div>
              <div className="text-3xl font-bold text-red-600">
                {productStats.outOfStock}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="p-4 hover:shadow-md transition-shadow duration-200 cursor-pointer">
          <CardContent className="p-0 flex items-stretch gap-4">
            <div className="p-3 bg-green-50 rounded-lg flex items-center justify-center">
              <Layers className="h-6 w-6 text-green-600" />
            </div>
            <div className="flex flex-col justify-center">
              <div className="text-sm text-gray-500 mb-1">Categories</div>
              <div className="text-3xl font-bold text-gray-900">
                {productStats.categories}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Products Table Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Product Catalog</CardTitle>
              <CardDescription>
                All products in your inventory. Manage stock, prices, and
                product details.
              </CardDescription>
            </div>
            <div className="text-sm text-muted-foreground">
              Showing {mockProducts.length} products
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Data Table */}
          <DataTable
            data={mockProducts}
            columns={columns}
            filterColumnId="name" // Specify which column to filter
            filterPlaceholder="Filter products by name..." // Specify placeholder
            bulkActionsComponent={<ProductBulkActions />} // Pass your actions component
          />
        </CardContent>
      </Card>
    </div>
  );
}
