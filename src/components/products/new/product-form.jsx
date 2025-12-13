"use client";

import { useState, useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { cn } from "@/lib/utils";
import {
  Loader2,
  Save,
  PlusCircle,
  RefreshCw,
  Box,
  Settings2,
  LayoutGrid,
  Check,
  ChevronsUpDown,
  ArrowLeft,
} from "lucide-react";

// UI Components
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
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
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { useSession } from "next-auth/react";
import { Separator } from "@/components/ui/separator";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useRouter } from "next/navigation";
import { ProductFormSkeleton } from "@/app/skeletons/product-form-skeleton";

// --- ZOD SCHEMA ---
const formSchema = z.object({
  code: z.string().min(1, "Product Code is required"),
  name: z.string().min(1, "Product Name is required"),
  brand_id: z.coerce.number().min(1, "Brand is required"),
  main_category_id: z.coerce.number().min(1, "Main Category is required"),
  sub_category_id: z.coerce.number().min(1, "Sub Category is required"),
  measurement_id: z.coerce.number().min(1, "Measurement Unit is required"),
  unit_id: z.coerce.number().min(1, "Unit is required"),
  container_id: z.coerce.number().min(1, "Container is required"),
  description: z.string().optional().nullable(), // Allow null for API compatibility
  is_variant: z.boolean().default(false),
  is_active: z.boolean().default(true),
});

// --- REUSABLE SEARCHABLE SELECT ---
const SearchableSelect = ({
  form,
  name,
  label,
  options,
  placeholder = "Select...",
  disabled = false,
}) => {
  const [open, setOpen] = useState(false);

  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem className="flex flex-col">
          <FormLabel>
            {label} <span className="text-red-500">*</span>
          </FormLabel>
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <FormControl>
                <Button
                  variant="outline"
                  role="combobox"
                  disabled={disabled}
                  aria-expanded={open}
                  className={cn(
                    "w-full justify-between bg-background hover:bg-accent hover:text-accent-foreground",
                    !field.value && "text-muted-foreground"
                  )}
                >
                  {field.value
                    ? options.find((item) => item.id === field.value)?.name
                    : placeholder}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </FormControl>
            </PopoverTrigger>
            <PopoverContent className="w-[250px] p-0" align="start">
              <Command>
                <CommandInput
                  placeholder={`Search ${label.toLowerCase()}...`}
                />
                <CommandList>
                  <CommandEmpty>No results found.</CommandEmpty>
                  <CommandGroup>
                    {options.map((item) => (
                      <CommandItem
                        value={item.name}
                        key={item.id}
                        onSelect={() => {
                          form.setValue(name, item.id);
                          form.clearErrors(name);
                          setOpen(false);
                        }}
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            item.id === field.value
                              ? "opacity-100"
                              : "opacity-0"
                          )}
                        />
                        {item.name}
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
  );
};

// --- MAIN COMPONENT ---
// Accepts initialData prop for Edit Mode
export function ProductForm({ initialData = null }) {
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const { data: session } = useSession();
  const router = useRouter();

  const isEditing = !!initialData; // Boolean flag to check mode

  // --- API DATA STATE ---
  const [options, setOptions] = useState({
    mainCategories: [],
    subCategories: [],
    brands: [],
    units: [],
    measurements: [],
    containers: [],
  });

  // --- INIT FORM ---
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: initialData
      ? {
          // --- EDIT MODE DEFAULTS ---
          code: initialData.code || "",
          name: initialData.name || "",
          description: initialData.description || "",
          // Ensure these are numbers for the Select components
          brand_id: Number(initialData.brand_id) || 0,
          main_category_id: Number(initialData.main_category_id) || 0,
          sub_category_id: Number(initialData.sub_category_id) || 0,
          measurement_id: Number(initialData.measurement_id) || 0,
          unit_id: Number(initialData.unit_id) || 0,
          container_id: Number(initialData.container_id) || 0,
          // Ensure booleans
          is_variant: Boolean(initialData.is_variant),
          is_active: Boolean(initialData.is_active),
        }
      : {
          // --- CREATE MODE DEFAULTS ---
          code: "",
          name: "",
          brand_id: 0,
          main_category_id: 0,
          sub_category_id: 0,
          measurement_id: 0,
          unit_id: 0,
          container_id: 0,
          description: "",
          is_variant: false,
          is_active: true,
        },
  });

  const selectedMainCategory = form.watch("main_category_id");

  // --- FETCH DROPDOWN OPTIONS ---
  useEffect(() => {
    let isMounted = true;

    const fetchOptions = async () => {
      try {
        const endpoints = [
          "/main-categories/active/list",
          "/brands/active/list",
          "/sub-categories/active/list",
          "/units/active/list",
          "/measurement-units/active/list",
          "/containers/active/list",
        ];

        const responses = await Promise.all(
          endpoints.map((url) =>
            fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}${url}`, {
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${session?.accessToken}`,
              },
            }).then((res) => res.json())
          )
        );

        if (isMounted) {
          setOptions({
            mainCategories: responses[0].data || [],
            brands: responses[1].data || [],
            subCategories: responses[2].data || [],
            units: responses[3].data || [],
            measurements: responses[4].data || [],
            containers: responses[5].data || [],
          });
        }
      } catch (error) {
        if (isMounted) {
          console.error("Failed to fetch form options:", error);
          toast.error("Network Error", {
            description: "Could not load dropdown options.",
          });
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    if (session?.accessToken) {
      fetchOptions();
    }

    return () => {
      isMounted = false;
    };
  }, [session]);

  // --- FILTER SUB-CATEGORIES ---
  const filteredSubCategories = useMemo(() => {
    if (!selectedMainCategory) return [];
    return options.subCategories.filter(
      (sub) => sub.main_category_id === Number(selectedMainCategory)
    );
  }, [selectedMainCategory, options.subCategories]);

  // Reset Sub Category when Main Category changes (User Interaction Only)
  useEffect(() => {
    // Only reset if we are not loading initial data for the first time
    // We check if the current value matches the filtered list to allow initial load
    const currentSub = form.getValues("sub_category_id");
    if (currentSub && selectedMainCategory) {
      const isValid = filteredSubCategories.find(
        (sub) => sub.id === currentSub
      );
      if (!isValid && filteredSubCategories.length > 0 && !loading) {
        form.setValue("sub_category_id", 0);
      }
    }
  }, [
    selectedMainCategory,
    form.setValue,
    form.getValues,
    filteredSubCategories,
    loading,
  ]);

  // --- SUBMIT HANDLER ---
  const handleServerSubmit = async (data, resetAfter = false) => {
    setSubmitting(true);

    if (!session?.accessToken) {
      toast.error("Authentication Error");
      setSubmitting(false);
      return;
    }

    try {
      const payload = {
        ...data,
        brand_id: Number(data.brand_id),
        main_category_id: Number(data.main_category_id),
        sub_category_id: Number(data.sub_category_id),
        measurement_id: Number(data.measurement_id),
        unit_id: Number(data.unit_id),
        container_id: Number(data.container_id),
      };

      // --- DYNAMIC URL & METHOD ---
      const url = isEditing
        ? `${process.env.NEXT_PUBLIC_API_BASE_URL}/products/${initialData.id}`
        : `${process.env.NEXT_PUBLIC_API_BASE_URL}/products`;

      const method = isEditing ? "PUT" : "POST"; // Use PUT or PATCH based on API

      const response = await fetch(url, {
        method: method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.accessToken}`,
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.message ||
            `Failed to ${isEditing ? "update" : "create"} product`
        );
      }

      toast.success(isEditing ? "Product Updated" : "Product Created", {
        description: `${data.name} has been ${
          isEditing ? "updated" : "added"
        }.`,
        duration: 4000,
        icon: "✅",
      });

      if (resetAfter && !isEditing) {
        // Create Mode: Reset and stay
        form.reset({
          code: "",
          name: "",
          description: "",
          is_variant: false,
          is_active: true,
          brand_id: data.brand_id, // Keep previous selections for ease
          main_category_id: data.main_category_id,
          sub_category_id: data.sub_category_id,
          measurement_id: data.measurement_id,
          unit_id: data.unit_id,
          container_id: data.container_id,
        });
        const codeInput = document.querySelector('input[name="code"]');
        if (codeInput) codeInput.focus();
      } else {
        // Edit Mode OR Create & Exit: Go back
        router.push("/products");
      }
    } catch (error) {
      console.error("Submission Error:", error);
      toast.error("Error", {
        description: error.message || "Something went wrong.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <ProductFormSkeleton />;
  }

  return (
    <div className="min-h-screen bg-muted/40 p-4 md:p-4">
      <Form {...form}>
        <form className="max-w-7xl mx-auto space-y-8">
          {/* Header Section */}
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-4 mb-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={(e) => {
                    e.preventDefault();
                    router.back();
                  }}
                >
                  <ArrowLeft className="h-4 w-4" />
                </Button>
                <h2 className="text-2xl font-bold tracking-tight text-foreground">
                  {isEditing ? "Edit Product" : "Create Product"}
                </h2>
              </div>
              <p className="text-muted-foreground ml-14">
                {isEditing
                  ? `Update details for ${initialData?.name || "this product"}.`
                  : "Add a new item to your inventory system."}
              </p>
            </div>
            {!isEditing && (
              <div className="hidden md:flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={(e) => {
                    e.preventDefault();
                    form.reset();
                  }}
                  className="bg-background"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Reset
                </Button>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* --- LEFT COLUMN (Primary Info) --- */}
            <div className="lg:col-span-8 space-y-8">
              {/* Card 1: Identity */}
              <Card className="border-t-4 border-t-blue-500 shadow-sm py-5">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Box className="h-5 w-5 text-blue-500" />
                    <CardTitle className="text-lg">Product Identity</CardTitle>
                  </div>
                  <CardDescription>
                    Core details used to identify the product.
                  </CardDescription>
                </CardHeader>
                <Separator />
                <CardContent className="pt-6 grid gap-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <FormField
                      name="code"
                      control={form.control}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            Product Code <span className="text-red-500">*</span>
                          </FormLabel>
                          <FormControl>
                            <Input
                              placeholder="PROD-001"
                              className="bg-background"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      name="name"
                      control={form.control}
                      render={({ field }) => (
                        <FormItem className="md:col-span-2">
                          <FormLabel>
                            Product Name <span className="text-red-500">*</span>
                          </FormLabel>
                          <FormControl>
                            <Input
                              placeholder="e.g. Wireless Headphones"
                              className="bg-background"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    name="description"
                    control={form.control}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Detailed product features and specifications..."
                            className="min-h-[80px] bg-background resize-y"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              {/* Card 2: Classification & Specs */}
              <Card className="border-t-4 border-t-purple-500 shadow-sm py-5">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <LayoutGrid className="h-5 w-5 text-purple-500" />
                    <CardTitle className="text-lg">
                      Classification & Specifications
                    </CardTitle>
                  </div>
                  <CardDescription>
                    Categorization and physical attributes.
                  </CardDescription>
                </CardHeader>
                <Separator />
                <CardContent className="pt-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <SearchableSelect
                      form={form}
                      name="brand_id"
                      label="Brand"
                      options={options.brands}
                      placeholder="Select Brand"
                    />
                    <SearchableSelect
                      form={form}
                      name="main_category_id"
                      label="Main Category"
                      options={options.mainCategories}
                      placeholder="Select Category"
                    />
                    <SearchableSelect
                      form={form}
                      name="sub_category_id"
                      label="Sub Category"
                      options={filteredSubCategories}
                      placeholder={
                        selectedMainCategory
                          ? "Select Sub Category"
                          : "Select Main Category First"
                      }
                      // In edit mode, if main category is set, enable this
                      disabled={!selectedMainCategory}
                    />
                    <SearchableSelect
                      form={form}
                      name="unit_id"
                      label="Base Unit"
                      options={options.units}
                      placeholder="e.g. Piece"
                    />
                    <SearchableSelect
                      form={form}
                      name="measurement_id"
                      label="Measurement"
                      options={options.measurements}
                      placeholder="e.g. Kg"
                    />
                    <SearchableSelect
                      form={form}
                      name="container_id"
                      label="Container Type"
                      options={options.containers}
                      placeholder="e.g. Box"
                    />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* --- RIGHT COLUMN (Settings & Actions) --- */}
            <div className="lg:col-span-4 space-y-8">
              <Card className="border-t-4 border-t-green-500 shadow-sm py-5">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Settings2 className="h-5 w-5 text-green-500" />
                    <CardTitle className="text-lg">Configuration</CardTitle>
                  </div>
                </CardHeader>
                <Separator />
                <CardContent className="space-y-3 pt-6">
                  <FormField
                    control={form.control}
                    name="is_active"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 bg-muted/10">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">Active</FormLabel>
                          <FormDescription className="text-xs">
                            Available in POS
                          </FormDescription>
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
                  <FormField
                    control={form.control}
                    name="is_variant"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 bg-muted/10">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">
                            Has Variants
                          </FormLabel>
                          <FormDescription className="text-xs">
                            Size, Color, etc.
                          </FormDescription>
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

              <div className="grid gap-3 sticky top-4">
                {/* Only show "Save & Add Another" in Create Mode */}
                {!isEditing && (
                  <Button
                    type="button"
                    size="lg"
                    className="w-full bg-slate-800 hover:bg-slate-700 text-white shadow-lg"
                    disabled={submitting}
                    onClick={form.handleSubmit((d) =>
                      handleServerSubmit(d, true)
                    )}
                  >
                    {submitting ? (
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    ) : (
                      <PlusCircle className="w-4 h-4 mr-2" />
                    )}
                    Save & Add Another
                  </Button>
                )}

                <Button
                  type="button"
                  size="lg"
                  variant={isEditing ? "default" : "secondary"}
                  className={cn(
                    "w-full shadow-sm border",
                    !isEditing
                      ? "bg-white hover:bg-gray-100 text-slate-900"
                      : ""
                  )}
                  disabled={submitting}
                  onClick={form.handleSubmit((d) =>
                    handleServerSubmit(d, false)
                  )}
                >
                  {submitting ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  ) : (
                    <Save className="w-4 h-4 mr-2" />
                  )}
                  {isEditing ? "Update Product" : "Save Product"}
                </Button>
              </div>
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
}
