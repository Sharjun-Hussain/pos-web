"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
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
  Loader2,
} from "lucide-react";
import Link from "next/link";
import {
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";

export default function ProductsPage() {
  const { data: session, status } = useSession();
  
  // Initialize with empty array for safety
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [sorting, setSorting] = useState([]);
  const [columnFilters, setColumnFilters] = useState([]);
  const [rowSelection, setRowSelection] = useState({});

  useEffect(() => {
    if (status === "loading") return;

    const fetchProducts = async () => {
      setLoading(true);
      try {
        // Safe access to token
        const token = session?.accessToken;

        if (!token) {
             console.error("No access token found.");
             setLoading(false);
             return;
        }
        
        const response = await fetch("https://apipos.inzeedo.com/api/v1/products?page=1", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Accept": "application/json",
            "Authorization": `Bearer ${token}` 
          },
        });

        if (!response?.ok) {
            throw new Error("Failed to fetch products");
        }

        const result = await response.json();

        // Safe access to nested API data with fallback
        if (result?.status === "success") {
          const products = result?.data?.data ?? [];
          setData(products);
        }
      } catch (err) {
        console.error("Fetch error:", err);
        // On error, we keep data as empty array or previous state
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [session, status]);

  const table = useReactTable({
    data: data ?? [], // Ensure data is never null/undefined passed to table
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      rowSelection,
    },
  });

  return (
    <div className="hidden h-full flex-1 flex-col space-y-6 px-6 pb-6 pt-3 md:flex">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">Product Inventory</h1>
          <p className="text-muted-foreground">Manage your product catalog</p>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="outline" className="gap-2">
            <Download className="h-4 w-4" /> Export
          </Button>
          <Link href="/products/new" passHref>
            <Button className="gap-2">
              <PlusCircle className="h-4 w-4" /> Add Product
            </Button>
          </Link>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Product Catalog</CardTitle>
              <CardDescription>Real-time data from database</CardDescription>
            </div>
            <div className="text-sm text-muted-foreground">
               {/* Safe access to length */}
               {loading ? "Loading..." : `Showing ${data?.length ?? 0} products`}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
             <div className="flex h-64 w-full items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
             </div>
          ) : (
            <>
              {/* Filter Input */}
              <div className="flex items-center py-4">
                <div className="relative w-full max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                    placeholder="Filter by name..."
                    // Safe access to filter value with default string fallback
                    value={(table?.getColumn("name")?.getFilterValue()) ?? ""}
                    onChange={(event) =>
                        table?.getColumn("name")?.setFilterValue(event.target.value)
                    }
                    className="pl-10"
                    />
                </div>
              </div>
              
              <DataTable table={table} columns={columns} />
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}