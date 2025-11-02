// app/brands/brand-dialog.jsx
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
  FormDescription, // Import FormDescription
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch"; // Import Switch
import { Loader2 } from "lucide-react";

// 1. Define the form schema for Brands
const formSchema = z.object({
  name: z.string().min(3, {
    message: "Brand name must be at least 3 characters long.",
  }),
  description: z.string().optional(),
  is_active: z.boolean().default(true), // Add the is_active field
});

// 2. The component (renamed)
export function BrandDialog({
  open,
  onOpenChange,
  onSuccess,
  session,
  initialData,
}) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isEditMode = !!initialData;

  // 3. useForm (add new default value)
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      is_active: true, // Set default
    },
  });

  // 4. Reset the form when initialData changes
  useEffect(() => {
    if (initialData) {
      form.reset({
        name: initialData.name,
        description: initialData.description || "",
        is_active: initialData.is_active, // Add is_active
      });
    } else {
      form.reset({
        name: "",
        description: "",
        is_active: true, // Add is_active
      });
    }
  }, [initialData, form]);

  // 5. Handle the form submission (no type on 'values')
  const onSubmit = async (values) => {
    if (!session?.accessToken) {
      toast.error("Authentication failed. Please log in again.");
      return;
    }

    setIsSubmitting(true);

    // Update API endpoint
    const url = isEditMode
      ? `${process.env.NEXT_PUBLIC_API_BASE_URL}/brands/${initialData?.id}`
      : `${process.env.NEXT_PUBLIC_API_BASE_URL}/brands`;

    const method = isEditMode ? "PATCH" : "POST";

    try {
      const response = await fetch(url, {
        method: method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.accessToken}`,
        },
        // 'values' will automatically include name, description, and is_active
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to save brand.");
      }

      // Update success message
      toast.success(
        `Brand ${isEditMode ? "updated" : "created"} successfully!`
      );
      onSuccess(); // Trigger refetch and close dialog
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
          {/* Update titles */}
          <DialogTitle>
            {isEditMode ? "Edit Brand" : "Create Brand"}
          </DialogTitle>
          <DialogDescription>
            {isEditMode
              ? "Make changes to your brand here."
              : "Add a new brand to your product list."}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Brand Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Dell, Sony, etc." {...field} />
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
                      placeholder="A short description of the brand"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* --- 6. ADD THE NEW SWITCH FIELD --- */}
            <FormField
              control={form.control}
              name="is_active"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                  <div className="space-y-0.5">
                    <FormLabel>Active</FormLabel>
                    <FormDescription>
                      Inactive brands won't appear in lists.
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
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  "Save"
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
