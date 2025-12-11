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
  description: z.string().optional(),
  is_variant: z.boolean().default(false),
  is_active: z.boolean().default(true),
});

// --- REUSABLE SEARCHABLE SELECT COMPONENT ---
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
                <CommandInput placeholder={`Search ${label.toLowerCase()}...`} />
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

export function ProductForm() {
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const { data: session } = useSession();
  const router = useRouter();

  // --- API DATA STATE ---
  const [options, setOptions] = useState({
    mainCategories: [],
    subCategories: [],
    brands: [],
    units: [],
    measurements: [],
    containers: [],
  });

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
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

  // --- FETCH DATA ---
  useEffect(() => {
    let isMounted = true; // 1. Safety flag

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

        if (isMounted) { // 2. Only update if mounted
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
            description: "Could not load dropdown options. Please refresh.",
            action: {
              label: "Refresh",
              onClick: () => window.location.reload(),
            },
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
      isMounted = false; // 3. Cleanup: mark as unmounted
    };
  }, [session]); // Removed 'toast' to prevent unnecessary re-runs

  // --- FILTER SUB-CATEGORIES ---
  const filteredSubCategories = useMemo(() => {
    if (!selectedMainCategory) return [];
    return options.subCategories.filter(
      (sub) => sub.main_category_id === Number(selectedMainCategory)
    );
  }, [selectedMainCategory, options.subCategories]);

  // Reset Sub Category when Main Category changes
  useEffect(() => {
    if (form.getValues("sub_category_id")) {
      form.setValue("sub_category_id", 0);
    }
  }, [selectedMainCategory, form.setValue, form.getValues]);

  // --- SUBMIT ---
// --- SUBMIT ---
  const handleServerSubmit = async (data, resetAfter = false) => {
    setSubmitting(true);
    
    // 1. Check for Authentication
    if (!session?.accessToken) {
      toast.error("Authentication Error", {
        description: "You are not logged in. Please reload or sign in again.",
      });
      setSubmitting(false);
      return;
    }

    try {
      // 2. Prepare Payload (ensure numbers are numbers)
      const payload = {
        ...data,
        brand_id: Number(data.brand_id),
        main_category_id: Number(data.main_category_id),
        sub_category_id: Number(data.sub_category_id),
        measurement_id: Number(data.measurement_id),
        unit_id: Number(data.unit_id),
        container_id: Number(data.container_id),
      };


      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/products`, // Update this endpoint if it differs
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${session.accessToken}`,
          },
          body: JSON.stringify(payload),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        // Handle Server Errors (e.g., Validation failed)
        throw new Error(result.message || "Failed to create product");
      }

      // 4. Success Handling
      toast.success("Product Saved Successfully", {
        description: `${data.name} has been added to your inventory.`,
        duration: 4000,
        icon: "✅",
      });

      if (resetAfter) {
        // Scenario A: Save & Create New (Reset Form)
        form.reset({
          code: "",
          name: "",
          description: "",
          is_variant: false,
          is_active: true,
          brand_id: data.brand_id,
          main_category_id: data.main_category_id,
          sub_category_id: data.sub_category_id,
          measurement_id: data.measurement_id,
          unit_id: data.unit_id,
          container_id: data.container_id,
        });

        // Focus back on the first input
        const codeInput = document.querySelector('input[name="code"]');
        if (codeInput) codeInput.focus();
      } else {
        // Scenario B: Save (Redirect to List)
        router.push("/products"); // Update this route to your actual product list page
      }
    } catch (error) {
      console.error("Submission Error:", error);
      toast.error("Failed to create product", {
        description: error.message || "Please check your inputs and try again.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
     <ProductFormSkeleton/>
    );
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
                  type="button" // CRITICAL: Prevents form submit
                  variant="ghost"
                  size="icon"
                  onClick={(e) => {
                    e.preventDefault(); // CRITICAL: Stops event propagation
                    router.back();
                  }}
                >
                  <ArrowLeft className="h-4 w-4" />
                </Button>
                <h2 className="text-2xl font-bold tracking-tight text-foreground">
                  Create Product
                </h2>
              </div>
              <p className="text-muted-foreground ml-14">
                Add a new item to your inventory system.
              </p>
            </div>
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
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* --- LEFT COLUMN (Primary Info) --- */}
            <div className="lg:col-span-8 space-y-8">
              {/* Card 1: Identity */}
              <Card className="border-t-4 border-t-blue-500 shadow-sm">
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
              <Card className="border-t-4 border-t-purple-500 shadow-sm">
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
              <Card className="border-t-4 border-t-green-500 shadow-sm">
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
                <Button
                  type="button"
                  size="lg"
                  className="w-full bg-slate-800 hover:bg-slate-700 text-white shadow-lg"
                  disabled={submitting}
                  onClick={form.handleSubmit((d) => handleServerSubmit(d, true))}
                >
                  {submitting ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  ) : (
                    <PlusCircle className="w-4 h-4 mr-2" />
                  )}
                  Save & Add Another
                </Button>

                <Button
                  type="button"
                  size="lg"
                  variant="secondary"
                  className="w-full shadow-sm border bg-white hover:bg-gray-100 text-slate-900"
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
                  Save Product
                </Button>
              </div>
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
}