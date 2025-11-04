"use client";

import { useForm, useFieldArray } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useEffect, useState, useMemo } from "react";
import {
  Trash2,
  Plus,
  Upload,
  Package,
  Shield,
  Users,
  DollarSign,
  Fingerprint,
  GitFork,
  Star, // NEW: Star icon for featured image
  Image as ImageIcon, // NEW: Placeholder icon
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { BarcodeGenerator } from "@/components/products/barcode-generator";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

// Function to compute Cartesian product for variants
function generateVariantCombinations(options) {
  if (options.length === 0 || options.some((opt) => opt.values.length === 0))
    return [];

  let result = [[]];
  for (const option of options) {
    const nextResult = [];
    for (const res of result) {
      for (const value of option.values) {
        nextResult.push([...res, value]);
      }
    }
    result = nextResult;
  }
  return result.map((combo) => combo.join(" / "));
}

export function ProductForm({ categories = [], brands = [], tenants = [] }) {
  const [availableSubcategories, setAvailableSubcategories] = useState([]);

  const form = useForm({
    defaultValues: {
      // Basic Information
      name: "",
      description: "",
      short_description: "",
      product_type: "physical",
      unit_of_measurement: "piece",
      category_id: "",
      subcategory_id: "",

      // Images & Media
      images: [],
      primary_image: null, // UPDATED: Use null for better checking

      // Multi-tenancy
      tenant_id: "",
      is_global: false,
      tenant_specific_pricing: [],

      // Pricing & Inventory
      status: "active",
      has_variants: false,
      variantOptions: [{ name: "", values: [] }],
      variants: [],

      selling_price: 0,
      cost_price: 0,
      wholesale_price: 0,
      minimum_price: 0,
      discount_type: "none",
      discount_value: 0,

      sku: "",
      barcode_number: "",
      track_quantity: true,
      low_stock_threshold: 5,

      // Tax & Compliance
      tax_category: "standard",
      taxable: true,
      hsn_code: "",
      excise_duty: 0,

      // Advanced Settings
      min_order_quantity: 1,
      max_order_quantity: 0,
      bundle_products: [],
      warranty_months: 0,
      return_policy: "standard",

      related_products: [],
      cross_sell_products: [],
      up_sell_products: [],
    },
  });

  const {
    fields: variantOptionFields,
    append: appendVariantOption,
    remove: removeVariantOption,
  } = useFieldArray({
    control: form.control,
    name: "variantOptions",
  });

  const { fields: variantFields, replace: replaceVariants } = useFieldArray({
    control: form.control,
    name: "variants",
  });

  const {
    fields: tenantPricingFields,
    append: appendTenantPricing,
    remove: removeTenantPricing,
  } = useFieldArray({
    control: form.control,
    name: "tenant_specific_pricing",
  });

  // Watch all relevant fields
  const hasVariants = form.watch("has_variants");
  const variantOptions = form.watch("variantOptions");
  const isGlobal = form.watch("is_global");
  const productType = form.watch("product_type");
  const sellingPrice = form.watch("selling_price");
  const discountType = form.watch("discount_type");
  const discountValue = form.watch("discount_value");
  const selectedCategoryId = form.watch("category_id");
  const images = form.watch("images");
  const primaryImageIndex = form.watch("primary_image");

  // --- NEW: Effect to manage default and invalid featured images ---
  useEffect(() => {
    if (
      images.length > 0 &&
      (primaryImageIndex === null || primaryImageIndex >= images.length)
    ) {
      form.setValue("primary_image", 0);
    } else if (images.length === 0 && primaryImageIndex !== null) {
      form.setValue("primary_image", null);
    }
  }, [images, primaryImageIndex, form]);

  useEffect(() => {
    const selectedCategory = categories.find(
      (cat) => String(cat.id) === selectedCategoryId
    );

    if (selectedCategory && selectedCategory.subcategories) {
      setAvailableSubcategories(selectedCategory.subcategories);
    } else {
      setAvailableSubcategories([]);
    }
    form.setValue("subcategory_id", "");
  }, [selectedCategoryId, categories, form]);

  const finalPrice = useMemo(() => {
    const price = parseFloat(sellingPrice) || 0;
    const value = parseFloat(discountValue) || 0;

    if (discountType === "percentage") {
      if (value < 0 || value > 100) return price;
      return price - (price * value) / 100;
    }
    if (discountType === "fixed") {
      const discounted = price - value;
      return discounted > 0 ? discounted : 0;
    }
    return price;
  }, [sellingPrice, discountType, discountValue]);

  useEffect(() => {
    if (hasVariants) {
      const combinations = generateVariantCombinations(
        variantOptions.filter((opt) => opt.name && opt.values.length > 0)
      );
      const newVariants = combinations.map((combo) => ({
        name: combo,
        price: 0,
        cost_price: 0,
        compare_at_price: 0,
        sku: "",
        barcode_number: "",
        quantity: 0,
        weight: 0,
      }));
      replaceVariants(newVariants);
    } else {
      replaceVariants([]);
    }
  }, [variantOptions, hasVariants, replaceVariants]);

  function onSubmit(data) {
    console.log("Single Page Product Form Submitted:", data);
    alert("Product data saved! Check console for details.");
  }

  const handleImageUpload = (event) => {
    const files = Array.from(event.target.files);
    const currentImages = form.getValues("images") || [];
    form.setValue("images", [...currentImages, ...files]);
  };

  const removeImage = (index) => {
    const currentImages = form.getValues("images") || [];
    currentImages.splice(index, 1);
    form.setValue("images", [...currentImages]);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* --- LEFT COLUMN: Main scrollable content --- */}
          <div className="lg:col-span-2 space-y-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Basic Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    name="name"
                    control={form.control}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Product Name *</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. Cotton T-Shirt" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    name="code"
                    control={form.control}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Product Code *</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. CT-001" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4"></div>

                <FormField
                  name="description"
                  control={form.control}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Detailed product description, features, benefits..."
                          className="h-12"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    name="product_type"
                    control={form.control}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Product Type</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger className="w-full">
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="physical">
                              Physical Product
                            </SelectItem>
                            <SelectItem value="digital">
                              Digital Product
                            </SelectItem>
                            <SelectItem value="service">Service</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    name="unit_of_measurement"
                    control={form.control}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Unit of Measurement</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger className="w-full">
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="piece">Piece</SelectItem>
                            <SelectItem value="kg">Kilogram (kg)</SelectItem>
                            <SelectItem value="g">Gram (g)</SelectItem>
                            <SelectItem value="l">Liter (L)</SelectItem>
                            <SelectItem value="ml">Milliliter (ml)</SelectItem>
                            <SelectItem value="m">Meter (m)</SelectItem>
                            <SelectItem value="set">Set</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    name="category_id"
                    control={form.control}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Category *</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Select a category" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {categories.map((cat) => (
                              <SelectItem key={cat.id} value={String(cat.id)}>
                                {cat.name}
                              </SelectItem>
                            ))}{" "}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    name="subcategory_id"
                    control={form.control}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Sub-Category</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                          disabled={availableSubcategories.length === 0}
                        >
                          <FormControl>
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Select a sub-category" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {availableSubcategories.map((subcat) => (
                              <SelectItem
                                key={subcat.id}
                                value={String(subcat.id)}
                              >
                                {subcat.name}
                              </SelectItem>
                            ))}{" "}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="has_variants"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel>This product has variants</FormLabel>
                        <div className="text-sm text-gray-500">
                          Enable if product comes in different options like
                          size, color, etc.
                        </div>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
            {/* Images */}
            <Card>
              <CardHeader>
                <CardTitle>Images & Media</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormItem>
                  <FormLabel>Product Images</FormLabel>
                  <div className="border-2 border-dashed rounded-lg p-6 text-center">
                    <Upload className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                    <p className="text-sm text-gray-600 mb-2">
                      Drag & drop images or click to browse
                    </p>
                    <Input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      id="product-images"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() =>
                        document.getElementById("product-images").click()
                      }
                    >
                      Select Images
                    </Button>
                  </div>
                </FormItem>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {images?.map((image, index) => {
                    const isFeatured = index === primaryImageIndex;
                    return (
                      <div key={index} className="relative group">
                        <div
                          className={`absolute inset-0 rounded-md border-2 ${
                            isFeatured
                              ? "border-blue-500"
                              : "border-transparent"
                          }`}
                          aria-hidden="true"
                        />
                        <img
                          src={URL.createObjectURL(image)}
                          alt={`Product image ${index + 1}`}
                          className="h-28 w-full object-cover rounded-md"
                        />
                        <div className="absolute top-1 right-1 flex items-center gap-1">
                          <Button
                            type="button"
                            variant="secondary"
                            size="icon"
                            className={`h-7 w-7 transition-opacity group-hover:opacity-100 ${
                              !isFeatured && "opacity-0"
                            }`}
                            onClick={() =>
                              form.setValue("primary_image", index)
                            }
                          >
                            <Star
                              className={`h-4 w-4 ${
                                isFeatured
                                  ? "fill-yellow-400 text-yellow-500"
                                  : "text-gray-500"
                              }`}
                            />
                          </Button>
                          <Button
                            type="button"
                            variant="destructive"
                            size="icon"
                            className="h-7 w-7 opacity-0 transition-opacity group-hover:opacity-100"
                            onClick={() => removeImage(index)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
            {/* Pricing  */}
            {/* <Card>
              <CardHeader>
                <CardTitle>Pricing & Discounts</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <FormLabel className="text-base font-semibold">
                    Price Points
                  </FormLabel>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-2">
                    <FormField
                      name="selling_price"
                      control={form.control}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Selling Price *</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              step="0.01"
                              placeholder="e.g., 49.99"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      name="cost_price"
                      control={form.control}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Cost Price</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              step="0.01"
                              placeholder="Your cost"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      name="wholesale_price"
                      control={form.control}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Wholesale Price</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              step="0.01"
                              placeholder="For B2B"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      name="minimum_price"
                      control={form.control}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Minimum Price</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              step="0.01"
                              placeholder="Floor price"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
                <Separator />
                <div>
                  <FormLabel className="text-base font-semibold">
                    Product Discount
                  </FormLabel>
                  <FormDescription>
                    Set a permanent discount for this product.
                  </FormDescription>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                    <FormField
                      name="discount_type"
                      control={form.control}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Discount Type</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger className="w-full">
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="none">None</SelectItem>
                              <SelectItem value="percentage">
                                Percentage (%)
                              </SelectItem>
                              <SelectItem value="fixed">
                                Fixed Amount
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </FormItem>
                      )}
                    />
                    {discountType !== "none" && (
                      <FormField
                        name="discount_value"
                        control={form.control}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Discount Value</FormLabel>
                            <FormControl>
                              <Input type="number" step="0.01" {...field} />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    )}
                  </div>
                  <div className="mt-4 p-4 bg-muted rounded-lg text-center">
                    <p className="text-sm font-medium text-muted-foreground">
                      Final Selling Price (After Discount)
                    </p>
                    <p className="text-3xl font-bold tracking-tight">
                      {new Intl.NumberFormat("en-US", {
                        style: "currency",
                        currency: "USD",
                      }).format(finalPrice)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card> */}

            {/* {productType === "physical" && (
              <Card>
                <CardHeader>
                  <CardTitle>Identification & Stock Control</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <FormField
                    name="track_quantity"
                    control={form.control}
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel>Track Quantity</FormLabel>
                          <div className="text-sm text-gray-500">
                            Enable inventory tracking for this product.
                          </div>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  {form.watch("track_quantity") && (
                    <FormField
                      name="low_stock_threshold"
                      control={form.control}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Low Stock Alert Threshold</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder="e.g., 5"
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            Receive a notification when the total product stock
                            drops to this level.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}
                  <FormField
                    name="sku"
                    control={form.control}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>SKU (Stock Keeping Unit) *</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., TSHIRT-BLK-L" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    name="barcode_number"
                    control={form.control}
                    render={({ field }) => {
                      const productName = form.watch("name");
                      const barcodeData = {
                        title: productName,
                        price: finalPrice
                          ? new Intl.NumberFormat("en-US", {
                              style: "currency",
                              currency: "USD",
                            }).format(finalPrice)
                          : "",
                        barcodeValue: field.value || "",
                      };
                      const handleDataChange = (newData) => {
                        field.onChange(newData.barcodeValue);
                      };
                      return (
                        <FormItem>
                          <FormLabel>Barcode (GTIN, UPC, etc.)</FormLabel>
                          <FormControl>
                            <BarcodeGenerator
                              data={barcodeData}
                              onDataChange={handleDataChange}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      );
                    }}
                  />
                </CardContent>
              </Card>
            )} */}

            {/* Advanced */}
            {/* <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Advanced Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    name="min_order_quantity"
                    control={form.control}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Min Order Quantity</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    name="max_order_quantity"
                    control={form.control}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Max Order Quantity</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  name="warranty_months"
                  control={form.control}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Warranty (Months)</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  name="return_policy"
                  control={form.control}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Return Policy</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="w-full">
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="standard">
                            30 Days Return
                          </SelectItem>
                          <SelectItem value="extended">
                            60 Days Return
                          </SelectItem>
                          <SelectItem value="none">No Returns</SelectItem>
                          <SelectItem value="exchange">
                            Exchange Only
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  name="excise_duty"
                  control={form.control}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Excise Duty (%)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card> */}
          </div>

          {/* --- RIGHT COLUMN: Sticky Sidebar --- */}
          <div className="lg:col-span-1">
            <div className="sticky top-8 space-y-8">
              <Card>
                <CardHeader>
                  <CardTitle>Product Status</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* --- NEW: Featured Image Display --- */}
                  <div className="space-y-2">
                    <FormLabel>Featured Image</FormLabel>
                    {primaryImageIndex !== null && images[primaryImageIndex] ? (
                      <div className="aspect-square w-full overflow-hidden rounded-md">
                        <img
                          src={URL.createObjectURL(images[primaryImageIndex])}
                          alt="Featured product image"
                          className="h-full w-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="aspect-square w-full flex items-center justify-center bg-secondary rounded-md">
                        <ImageIcon className="h-10 w-10 text-muted-foreground" />
                      </div>
                    )}
                  </div>

                  <FormField
                    name="status"
                    control={form.control}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Status</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger className="w-full">
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="active">Active</SelectItem>
                            <SelectItem value="draft">Draft</SelectItem>
                            <SelectItem value="archived">Archived</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    name="brand"
                    control={form.control}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Brand</FormLabel>
                        <Select onValueChange={field.onChange}>
                          <FormControl>
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Select brand" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {brands.map((brand) => (
                              <SelectItem
                                key={brand.id}
                                value={String(brand.id)}
                              >
                                {brand.name}
                              </SelectItem>
                            ))}{" "}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="pt-4">
                    <div className="text-sm font-medium mb-2">
                      Product Summary
                    </div>
                    <div className="space-y-2 text-sm text-gray-600">
                      <div className="flex justify-between">
                        <span>Type:</span>
                        <Badge variant="outline" className="capitalize">
                          {form.watch("product_type")}
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span>Variants:</span>
                        <span>
                          {hasVariants ? variantFields.length : "None"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Inventory:</span>
                        <span>
                          {form.watch("track_quantity")
                            ? "Tracked"
                            : "Not Tracked"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Taxable:</span>
                        <span>{form.watch("taxable") ? "Yes" : "No"}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button
                    type="submit"
                    className="w-full bg-gray-700 hover:bg-gray-500"
                  >
                    Save Product & Create New
                  </Button>
                  <Button type="submit" className="w-full">
                    Save Product
                  </Button>
                  <Button type="button" variant="outline" className="w-full">
                    Save as Draft
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </form>
    </Form>
  );
}
