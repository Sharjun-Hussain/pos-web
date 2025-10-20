"use client"; // Required for useState

import { useState } from "react";
import { columns } from "@/components/products/columns";
import { DataTable } from "@/components/products/data-table";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { PlusCircle, Search, Download, Filter, Loader2 } from "lucide-react"; // 1. Import Loader2
import Link from "next/link";

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
    <div className="hidden h-full flex-1 flex-col space-y-6 p-6 md:flex">
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
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Products
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {productStats.totalProducts}
            </div>
            <p className="text-xs text-muted-foreground">Active in catalog</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Low Stock</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">
              {productStats.lowStock}
            </div>
            <p className="text-xs text-muted-foreground">Needs restocking</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Out of Stock</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">
              {productStats.outOfStock}
            </div>
            <p className="text-xs text-muted-foreground">
              Requires immediate attention
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Categories</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{productStats.categories}</div>
            <p className="text-xs text-muted-foreground">Product categories</p>
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
          <DataTable data={mockProducts} columns={columns} />
        </CardContent>
      </Card>
    </div>
  );
}
