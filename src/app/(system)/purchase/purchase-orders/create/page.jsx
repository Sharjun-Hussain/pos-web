"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useFieldArray } from "react-hook-form";
import { z } from "zod";
import { format } from "date-fns";
import {
  ArrowLeft,
  Calendar as CalendarIcon,
  Plus,
  Trash2,
  Save,
  CheckCircle2,
  Check,
  ChevronsUpDown,
  Search,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Calendar } from "@/components/ui/calendar";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

// --- 1. Mock API Data (Replace with real API fetch) ---

const apiSuppliers = [
  { id: "sup_1", name: "Global Tech Distributors", email: "sales@globaltech.lk" },
  { id: "sup_2", name: "EcoWear Lanka", email: "orders@ecowear.lk" },
  { id: "sup_3", name: "Bean Masters Colombo", email: "info@beanmasters.lk" },
  { id: "sup_4", name: "Singer Sri Lanka (Wholesale)", email: "b2b@singer.lk" },
  { id: "sup_5", name: "Abans Corporate", email: "corporate@abans.lk" },
];

const apiProducts = [
  { id: "prod_1", name: "Pro Wireless Mouse", sku: "LOG-M-001", cost: 12500.00, stock: 12 },
  { id: "prod_2", name: "Mechanical Keyboard RGB", sku: "KEY-RGB-99", cost: 24000.00, stock: 5 },
  { id: "prod_3", name: "USB-C Hub Multi-port", sku: "USB-C-HUB", cost: 8500.00, stock: 45 },
  { id: "prod_4", name: "Monitor Stand Adjustable", sku: "MON-ST-01", cost: 4500.00, stock: 0 },
  { id: "prod_5", name: "Thermal Receipt Paper (50 Rolls)", sku: "POS-PAP-50", cost: 3200.00, stock: 100 },
];

// --- 2. Zod Schema ---

const itemSchema = z.object({
  productId: z.string().min(1, "Product is required"),
  unitCost: z.coerce.number().min(1, "Cost must be valid"),
  quantity: z.coerce.number().min(1, "Quantity must be at least 1"),
});

const formSchema = z.object({
  supplierId: z.string({ required_error: "Please select a supplier." }),
  orderDate: z.date({ required_error: "Order date is required." }),
  expectedDate: z.date().optional(),
  reference: z.string().optional(),
  notes: z.string().optional(),
  items: z.array(itemSchema).min(1, "Add at least one item"),
});

// --- 3. Helper Component for Product Search (UX Focus) ---
// We extract this to handle the popover state cleanly for each row
const ProductSelect = ({ value, onChange, products }) => {
  const [open, setOpen] = useState(false);

  const selectedProduct = products.find((p) => p.id === value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            "w-full justify-between bg-white",
            !value && "text-muted-foreground"
          )}
        >
          {selectedProduct ? (
            <span className="truncate font-medium">
              {selectedProduct.name}
            </span>
          ) : (
            "Search product..."
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[400px] p-0" align="start">
        <Command>
          <CommandInput placeholder="Search by name or SKU..." />
          <CommandList>
            <CommandEmpty>No product found.</CommandEmpty>
            <CommandGroup>
              {products.map((product) => (
                <CommandItem
                  key={product.id}
                  value={product.name} // Search by name
                  onSelect={() => {
                    onChange(product.id);
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === product.id ? "opacity-100" : "opacity-0"
                    )}
                  />
                  <div className="flex flex-col w-full">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">{product.name}</span>
                      <span className="text-xs text-muted-foreground">{product.sku}</span>
                    </div>
                    <div className="flex justify-between items-center mt-1">
                      <span className="text-xs text-muted-foreground">
                        Stock: 
                        <span className={cn(
                            "ml-1 font-medium", 
                            product.stock === 0 ? "text-red-500" : "text-green-600"
                        )}>
                            {product.stock} units
                        </span>
                      </span>
                      <span className="text-xs font-medium text-slate-600">
                        LKR {product.cost.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};

export default function CreatePurchaseOrder() {
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      supplierId: "",
      orderDate: new Date(),
      expectedDate: undefined,
      reference: "",
      notes: "",
      items: [{ productId: "", unitCost: 0, quantity: 1 }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "items",
  });

  // Calculations
  const watchedItems = form.watch("items");
  const calculateTotals = () => {
    const subtotal = watchedItems.reduce((acc, item) => {
      return acc + (item.unitCost || 0) * (item.quantity || 0);
    }, 0);
    const taxRate = 0.0; // Set to 0 if no tax for POs in your region, or modify
    const tax = subtotal * taxRate;
    const total = subtotal + tax;
    return { subtotal, tax, total };
  };

  const { subtotal, total } = calculateTotals();

  // Auto-fill cost when product is selected
  const handleProductSelect = (index, productId) => {
    const product = apiProducts.find((p) => p.id === productId);
    if (product) {
      form.setValue(`items.${index}.productId`, productId);
      form.setValue(`items.${index}.unitCost`, product.cost);
    }
  };

  function onSubmit(data) {
    console.log("Submitted Data:", data);
  }

  return (
    <div className="flex-1 space-y-6 p-6 bg-gray-50/50 min-h-screen">
      {/* --- Header (No Breadcrumbs) --- */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            Create Purchase Order
          </h1>
          <p className="text-muted-foreground mt-1">
            Create a new PO for restocking inventory.
          </p>
        </div>
        <Button variant="outline" asChild className="bg-white">
          <Link href="/purchases">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to List
          </Link>
        </Button>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          
          {/* --- Top Section: Supplier & Dates --- */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2 border-none shadow-md">
              <CardHeader>
                <CardTitle>Supplier Details</CardTitle>
                <CardDescription>Select the vendor and dates.</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-6 md:grid-cols-2">
                
                {/* Searchable Supplier Dropdown */}
                <FormField
                  control={form.control}
                  name="supplierId"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Supplier</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              role="combobox"
                              className={cn(
                                "w-full justify-between pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value
                                ? apiSuppliers.find(
                                    (supplier) => supplier.id === field.value
                                  )?.name
                                : "Select supplier"}
                              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-[300px] p-0">
                          <Command>
                            <CommandInput placeholder="Search supplier..." />
                            <CommandList>
                              <CommandEmpty>No supplier found.</CommandEmpty>
                              <CommandGroup>
                                {apiSuppliers.map((supplier) => (
                                  <CommandItem
                                    value={supplier.name}
                                    key={supplier.id}
                                    onSelect={() => {
                                      form.setValue("supplierId", supplier.id);
                                    }}
                                  >
                                    <Check
                                      className={cn(
                                        "mr-2 h-4 w-4",
                                        supplier.id === field.value
                                          ? "opacity-100"
                                          : "opacity-0"
                                      )}
                                    />
                                    {supplier.name}
                                  </CommandItem>
                                ))}
                              </CommandGroup>
                            </CommandList>
                          </Command>
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="reference"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Reference No.</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. PO-001" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Shadcn Calendar - Order Date */}
                <FormField
                  control={form.control}
                  name="orderDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Order Date</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={cn(
                                "w-full pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value ? (
                                format(field.value, "PPP")
                              ) : (
                                <span>Pick a date</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            disabled={(date) =>
                              date > new Date() || date < new Date("1900-01-01")
                            }
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Shadcn Calendar - Expected Date */}
                <FormField
                  control={form.control}
                  name="expectedDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Expected Delivery</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={cn(
                                "w-full pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value ? (
                                format(field.value, "PPP")
                              ) : (
                                <span>Pick a date</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            disabled={(date) =>
                              date < new Date()
                            }
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Notes Section */}
            <Card className="lg:col-span-1 border-none shadow-md">
                <CardHeader>
                    <CardTitle>Notes</CardTitle>
                </CardHeader>
                <CardContent>
                    <FormField
                    control={form.control}
                    name="notes"
                    render={({ field }) => (
                        <FormItem>
                        <FormControl>
                            <Textarea
                            placeholder="Add private notes..."
                            className="resize-none min-h-[150px]"
                            {...field}
                            />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                </CardContent>
            </Card>
          </div>

          {/* --- Section 2: Order Items --- */}
          <Card className="border-none shadow-md">
            <CardHeader>
              <CardTitle>Order Items</CardTitle>
              <CardDescription>
                Add products to the order.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Table Header - Desktop */}
              <div className="hidden md:grid grid-cols-12 gap-4 mb-4 text-sm font-semibold text-gray-500 px-2 uppercase tracking-wider">
                <div className="col-span-6">Product Details</div>
                <div className="col-span-2">Unit Cost (LKR)</div>
                <div className="col-span-2">Quantity</div>
                <div className="col-span-2 text-right">Line Total</div>
              </div>

              {/* Dynamic Rows */}
              <div className="space-y-4">
                {fields.map((field, index) => {
                  const currentCost = form.getValues(`items.${index}.unitCost`) || 0;
                  const currentQty = form.getValues(`items.${index}.quantity`) || 0;
                  const lineTotal = (currentCost * currentQty).toLocaleString('en-LK', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

                  return (
                    <div
                      key={field.id}
                      className="grid grid-cols-1 md:grid-cols-12 gap-4 items-start p-4 border rounded-lg bg-white"
                    >
                      {/* Searchable Product Select */}
                      <div className="col-span-1 md:col-span-6">
                        <FormLabel className="md:hidden mb-2 block">Product</FormLabel>
                        <ProductSelect 
                            value={form.watch(`items.${index}.productId`)}
                            products={apiProducts}
                            onChange={(val) => handleProductSelect(index, val)}
                        />
                      </div>

                      {/* Unit Cost */}
                      <div className="col-span-1 md:col-span-2">
                        <FormField
                          control={form.control}
                          name={`items.${index}.unitCost`}
                          render={({ field }) => (
                            <FormItem>
                                <FormLabel className="md:hidden">Unit Cost</FormLabel>
                              <FormControl>
                                <Input type="number" min="0" step="0.01" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      {/* Quantity */}
                      <div className="col-span-1 md:col-span-2">
                        <FormField
                          control={form.control}
                          name={`items.${index}.quantity`}
                          render={({ field }) => (
                            <FormItem>
                                <FormLabel className="md:hidden">Quantity</FormLabel>
                              <FormControl>
                                <Input type="number" min="1" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      {/* Line Total & Delete */}
                      <div className="col-span-1 md:col-span-2 flex items-center justify-between md:justify-end h-10">
                         <span className="text-sm font-medium text-gray-500 md:hidden">Total:</span>
                         <div className="flex items-center gap-4">
                            <span className="font-semibold text-gray-900">
                                {lineTotal}
                            </span>
                            <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="text-red-500 hover:text-red-700 hover:bg-red-50"
                            onClick={() => remove(index)}
                            disabled={fields.length === 1}
                            >
                            <Trash2 className="h-4 w-4" />
                            </Button>
                         </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <Button
                type="button"
                variant="outline"
                className="mt-6 border-dashed border-2 w-full py-6 text-muted-foreground hover:text-primary hover:border-primary"
                onClick={() => append({ productId: "", unitCost: 0, quantity: 1 })}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Another Item
              </Button>

              {/* Summary Section */}
              <div className="mt-8 flex justify-end">
                <div className="w-full md:w-1/3 bg-white p-6 rounded-lg border shadow-sm space-y-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>LKR {subtotal.toLocaleString('en-LK', { minimumFractionDigits: 2 })}</span>
                  </div>
                  
                  <Separator />
                  <div className="flex justify-between text-xl font-bold text-gray-900">
                    <span>Total</span>
                    <span>LKR {total.toLocaleString('en-LK', { minimumFractionDigits: 2 })}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* --- Footer Actions --- */}
          <div className="flex items-center justify-end gap-4 sticky bottom-0 bg-white p-4 border-t -mx-6 -mb-6 shadow-lg md:static md:bg-transparent md:border-0 md:shadow-none md:p-0 md:mx-0 md:mb-0">
            <Button type="button" variant="ghost">
              Cancel
            </Button>
            <Button type="button" variant="outline" className="gap-2">
              <Save className="h-4 w-4" />
              Save Draft
            </Button>
            <Button type="submit" className="gap-2 ">
              <CheckCircle2 className="h-4 w-4" />
              Submit Purchase Order
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}