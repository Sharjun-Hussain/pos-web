// app/unit-measurement/measurement-unit-dialog.tsx
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
  FormDescription, // Added for the switch
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
import { Switch } from "@/components/ui/switch"; // Import Switch
import { Loader2 } from "lucide-react";
import useSWR from "swr";
import { swrFetcher } from "@/lib/utils";

// --- Updated Schema (with is_active) ---
const formSchema = z.object({
  type: z.string().min(1, "Please select a unit type."),
  name: z.string().min(2, {
    message: "Unit name must be at least 2 characters long.",
  }),
  short_code: z.string().min(1, "Short code is required (e.g., kg, L)."),
  description: z.string().optional(),
  // Added is_active, defaulting to true
  is_active: z.boolean().default(true),
});

export function MeasurementUnitDialog({
  open,
  onOpenChange,
  onSuccess,
  session,
  initialData,
}) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isEditMode = !!initialData;

  const form = useForm({
    resolver: zodResolver(formSchema),
    // --- Updated Default Values ---
    defaultValues: {
      type: undefined,
      name: "",
      short_code: "",
      description: "",
      is_active: true, // Default to active
    },
  });

  // --- Updated Form Reset (with is_active) ---
  useEffect(() => {
    if (open) {
      if (initialData) {
        form.reset({
          type: initialData.type,
          name: initialData.name,
          short_code: initialData.short_code,
          description: initialData.description || "",
          is_active: initialData.is_active, // Set from existing data
        });
      } else {
        form.reset({
          type: undefined,
          name: "",
          short_code: "",
          description: "",
          is_active: true, // Default to true for new units
        });
      }
    }
  }, [initialData, form, open]);

  // --- SWR Hook to fetch /measurement-types ---
  const measurementTypesUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/measurement-types`;
  const accessToken = session?.accessToken;

  const swrKey =
    open && accessToken ? [measurementTypesUrl, accessToken] : null;

  const {
    data: measurementTypes,
    error,
    isLoading: isFetchingTypes,
  } = useSWR(swrKey, swrFetcher, {
    revalidateOnFocus: false,
  });

  useEffect(() => {
    if (error) {
      toast.error(error.message || "Failed to load measurement types.");
      console.error(error);
    }
  }, [error]);

  // --- onSubmit Logic ---
  // This function now works perfectly, as `values`
  // will automatically include `is_active` from the form.
  const onSubmit = async (values) => {
    if (!session?.accessToken) {
      toast.error("Authentication failed. Please log in again.");
      return;
    }

    setIsSubmitting(true);

    const url = isEditMode
      ? `${process.env.NEXT_PUBLIC_API_BASE_URL}/measurement-units/${initialData?.id}`
      : `${process.env.NEXT_PUBLIC_API_BASE_URL}/measurement-units`;

    const method = isEditMode ? "PATCH" : "POST";

    try {
      const response = await fetch(url, {
        method: method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.accessToken}`,
        },
        // `values` now correctly includes all fields from your payload
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to save unit.");
      }

      toast.success(
        `Measurement Unit ${isEditMode ? "updated" : "created"} successfully!`
      );
      onSuccess(); // This will close the dialog and refresh the table
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
            {isEditMode ? "Edit Measurement Unit" : "Create Measurement Unit"}
          </DialogTitle>
          <DialogDescription>
            {isEditMode
              ? "Make changes to your unit here."
              : "Add a new measurement unit to your system."}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Unit Type</FormLabel>
                  <Select
                    value={field.value}
                    onValueChange={field.onChange}
                    disabled={isFetchingTypes}
                  >
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue
                          placeholder={
                            isFetchingTypes
                              ? "Loading types..."
                              : "Select a unit type"
                          }
                        />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {(measurementTypes || []).map((type) => (
                        <SelectItem key={type.id} value={type.value}>
                          {type.label}
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
                  <FormLabel>Unit Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Kilogram" {...field} />
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
                    <Input placeholder="e.g., kg, L, cm" {...field} />
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
                      placeholder="A short description of the unit"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* --- Added Switch for is_active --- */}
            <FormField
              control={form.control}
              name="is_active"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                  <div className="space-y-0.5">
                    <FormLabel>Status</FormLabel>
                    <FormDescription>
                      Is this unit currently active and available for use?
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
                  <span className="flex items-center gap-2">
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {isEditMode ? "Saving..." : "Creating..."}
                  </span>
                ) : isEditMode ? (
                  "Save Changes"
                ) : (
                  "Create Unit"
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
