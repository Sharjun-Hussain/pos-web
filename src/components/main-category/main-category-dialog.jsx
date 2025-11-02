// app/main_categorys/main-category-dialog.jsx
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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";

// 1. Define the form schema with Zod (this stays the same)
const formSchema = z.object({
  name: z.string().min(3, {
    message: "Category name must be at least 3 characters long.",
  }),
  description: z.string().optional(),
});

// 2. The component (props are just destructured, no types)
export function MainCategoryDialog({
  open,
  onOpenChange,
  onSuccess,
  session,
  initialData,
}) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isEditMode = !!initialData;

  // 3. useForm (no generic type <FormSchema>)
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
    },
  });

  // 4. Reset the form when initialData changes
  useEffect(() => {
    if (initialData) {
      form.reset({
        name: initialData.name,
        description: initialData.description || "",
      });
    } else {
      form.reset({
        name: "",
        description: "",
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

    const url = isEditMode
      ? `${process.env.NEXT_PUBLIC_API_BASE_URL}/main-categories/${initialData?.id}`
      : `${process.env.NEXT_PUBLIC_API_BASE_URL}/main-categories`;

    const method = isEditMode ? "PATCH" : "POST";

    try {
      const response = await fetch(url, {
        method: method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.accessToken}`,
        },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to save category.");
      }

      toast.success(
        `Main Category ${isEditMode ? "updated" : "created"} successfully!`
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
          <DialogTitle>
            {isEditMode ? "Edit Main Category" : "Create Main Category"}
          </DialogTitle>
          <DialogDescription>
            {isEditMode
              ? "Make changes to your category here."
              : "Add a new main category to your system."}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Electronics" {...field} />
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
