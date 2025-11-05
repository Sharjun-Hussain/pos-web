// app/units/unit-dialog.jsx
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
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox"; // Added for the boolean field
import { Loader2, LoaderIcon } from "lucide-react";

// 1. Define the form schema for Units
const formSchema = z.object({
  name: z.string().min(2, {
    message: "Unit name must be at least 2 characters long.",
  }),
  short_code: z.string().min(1, {
    message: "Short code is required (e.g., bx, kg, pc).",
  }),
  is_base_unit: z.boolean().default(false),
  description: z.string().optional(),
});

// 2. The component
export function UnitDialog({
  open,
  onOpenChange,
  onSuccess,
  session,
  initialData,
}) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isEditMode = !!initialData;

  // 3. useForm
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      short_code: "",
      is_base_unit: false,
      description: "",
    },
  });

  // 4. Reset the form when initialData changes
  useEffect(() => {
    if (initialData) {
      form.reset({
        name: initialData.name,
        short_code: initialData.short_code,
        is_base_unit: initialData.is_base_unit || false,
        description: initialData.description || "",
      });
    } else {
      form.reset({
        name: "",
        short_code: "",
        is_base_unit: false,
        description: "",
      });
    }
  }, [initialData, form]);

  // 5. Handle the form submission
  const onSubmit = async (values) => {
    if (!session?.accessToken) {
      toast.error("Authentication failed. Please log in again.");
      return;
    }

    setIsSubmitting(true);

    // *** CHANGED: Updated API endpoint ***
    const url = isEditMode
      ? `${process.env.NEXT_PUBLIC_API_BASE_URL}/units/${initialData?.id}`
      : `${process.env.NEXT_PUBLIC_API_BASE_URL}/units`;

    const method = isEditMode ? "PATCH" : "POST";

    try {
      const response = await fetch(url, {
        method: method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.accessToken}`,
        },
        body: JSON.stringify(values), // Sends the new payload
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to save unit.");
      }

      toast.success(`Unit ${isEditMode ? "updated" : "created"} successfully!`);
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
          <DialogTitle>{isEditMode ? "Edit Unit" : "Create Unit"}</DialogTitle>
          <DialogDescription>
            {isEditMode
              ? "Make changes to your unit here."
              : "Add a new unit of measurement to your system."}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Unit Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Box" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="short_code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Short Code</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., bx" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="A short description of the unit"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="is_base_unit"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Base Unit</FormLabel>
                    <FormDescription>
                      Is this the smallest unit for this type? (e.g., 'Piece' or
                      'Gram').
                    </FormDescription>
                  </div>
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
                  <span className="flex items-center gap-2 justify-center">
                    {" "}
                    <LoaderIcon className="mr-2 h-4 w-4 animate-spin" />{" "}
                    Saving...
                  </span>
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
