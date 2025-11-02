"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";

// --- 1. IMPORT useSWR ---
import useSWR from "swr";

const formSchema = z.object({
  main_category_id: z.coerce
    .number({
      required_error: "Please select a main category.",
      invalid_type_error: "Please select a main category.",
    })
    .min(1, "Please select a main category."),
  name: z.string().min(3, {
    message: "Category name must be at least 3 characters long.",
  }),
  description: z.string().optional(),
});

// --- 2. DEFINE A REUSABLE FETCHER FUNCTION ---
// This function is designed to work with useSWR's key: [url, token]
// It can be moved to a separate lib/utils file if you use it elsewhere.
const swrFetcher = async ([url, token]) => {
  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Failed to fetch data");
  }

  const data = await response.json();
  if (data.status === "success") {
    // Filter and return just the data array
    return data.data.data.filter((cat) => cat.is_active);
  } else {
    throw new Error(data.message || "Failed to fetch");
  }
};

export function SubCategoryDialog({
  open,
  onOpenChange,
  onSuccess,
  session,
  initialData,
}) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isEditMode = !!initialData;

  // --- 3. REMOVE THE OLD useState HOOKS for fetching ---
  // const [mainCategories, setMainCategories] = useState([]);
  // const [isFetchingCategories, setIsFetchingCategories] = useState(false);

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      main_category_id: undefined,
      name: "",
      description: "",
    },
  });

  // This form reset logic remains the same
  useEffect(() => {
    if (initialData) {
      form.reset({
        main_category_id: initialData.main_category_id,
        name: initialData.name,
        description: initialData.description || "",
      });
    } else {
      form.reset({
        main_category_id: undefined,
        name: "",
        description: "",
      });
    }
  }, [initialData, form, open]);

  // --- 4. REPLACE THE FETCHING useEffect WITH useSWR ---
  const mainCategoriesUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/main-categories`;
  const accessToken = session?.accessToken;

  // This is the key:
  // If the dialog is closed or there's no token, the key is `null` and SWR won't fetch.
  // When `open` becomes true, the key is set, and SWR fetches (or returns from cache).
  const swrKey = open && accessToken ? [mainCategoriesUrl, accessToken] : null;

  const {
    data: mainCategories, // SWR returns the data
    error,
    isLoading: isFetchingCategories, // SWR provides the loading state
  } = useSWR(
    swrKey, // The unique key for this request
    swrFetcher, // The function to run
    {
      // Optional: reduce re-fetching if you find it too aggressive
      revalidateOnFocus: false,
    }
  );

  // Handle SWR errors with a toast
  useEffect(() => {
    if (error) {
      toast.error(error.message || "Failed to load main categories.");
      console.error(error);
    }
  }, [error]);

  const onSubmit = async (values) => {
    if (!session?.accessToken) {
      toast.error("Authentication failed. Please log in again.");
      return;
    }

    setIsSubmitting(true);

    const url = isEditMode
      ? `${process.env.NEXT_PUBLIC_API_BASE_URL}/sub-categories/${initialData?.id}`
      : `${process.env.NEXT_PUBLIC_API_BASE_URL}/sub-categories`;

    const method = isEditMode ? "PATCH" : "POST";

    try {
      const response = await fetch(url, {
        method: method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.accessToken}`,
        },
        // 'values' already matches your required format
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to save category.");
      }

      toast.success(
        `Sub Category ${isEditMode ? "updated" : "created"} successfully!`
      );
      onSuccess();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {isEditMode ? "Edit Sub Category" : "Create Sub Category"}
          </DialogTitle>
          <DialogDescription>
            {isEditMode
              ? "Make changes to your category here."
              : "Add a new sub category to your system."}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="main_category_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Main Category</FormLabel>
                  <Select
                    value={field.value ? String(field.value) : undefined}
                    onValueChange={field.onChange}
                    disabled={isFetchingCategories} // This still works
                  >
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue
                          placeholder={
                            isFetchingCategories
                              ? "Loading categories..."
                              : // This will now be "Select..." almost instantly
                                "Select a main category"
                          }
                        />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {/* We add `|| []` as a safeguard, 
                        since `mainCategories` will be `undefined` 
                        on the very first render before SWR fetches.
                      */}
                      {(mainCategories || []).map((category) => (
                        <SelectItem
                          key={category.id}
                          value={String(category.id)}
                        >
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Sub Category Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Laptops" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="A short description of the category"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creating
                  </span>
                ) : (
                  "Create"
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
