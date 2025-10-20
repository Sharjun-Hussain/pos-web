import { ProductForm } from "@/components/products/new/product-add-form";

// Mock data for dropdowns, which would normally come from an API
const mockCategories = [
  { id: "cat_apparel", name: "Apparel" },
  { id: "cat_electronics", name: "Electronics" },
  { id: "cat_grocery", name: "Groceries" },
];
const mockBrands = [
  { id: "brand_nike", name: "Nike" },
  { id: "brand_apple", name: "Apple" },
  { id: "brand_starbucks", name: "Starbucks" },
];

export default function AddProductPage() {
  return (
    <div className="p-8">
      <div className="flex items-center justify-between space-y-2 mb-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            Create a New Product
          </h2>
          <p className="text-muted-foreground">
            Fill in the details below to add a new product to your inventory.
          </p>
        </div>
      </div>
      <ProductForm categories={mockCategories} brands={mockBrands} />
    </div>
  );
}
