import { columns } from "@/components/products/columns";
import { DataTable } from "@/components/products/data-table";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import Link from "next/link";

// Mock data directly in the component
const mockProducts = [
  {
    id: "prod_1",
    name: "Organic Cotton T-Shirt",
    sku: "TSHIRT-ORG-COT",
    image: "https://via.placeholder.com/40",
    category: { id: "cat_apparel", name: "Apparel" },
    stock: 152,
    status: "active",
  },
  {
    id: "prod_2",
    name: "Espresso Roast Coffee",
    sku: "SB-CF-001",
    image: "https://via.placeholder.com/40",
    category: { id: "cat_grocery", name: "Groceries" },
    stock: 8,
    status: "active",
  },
  {
    id: "prod_3",
    name: "Wireless Mouse",
    sku: "LOGI-MX-M1",
    image: "https://via.placeholder.com/40",
    category: { id: "cat_electronics", name: "Electronics" },
    stock: 0,
    status: "archived",
  },
];

export default function ProductsPage() {
  return (
    <div className="hidden h-full flex-1 flex-col space-y-8 p-8 md:flex">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Products</h2>
          <p className="text-muted-foreground">
            Here's a list of all products in your inventory.
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Link href="/dashboard/products/new">
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Product
            </Button>
          </Link>
        </div>
      </div>
      <DataTable data={mockProducts} columns={columns} />
    </div>
  );
}
