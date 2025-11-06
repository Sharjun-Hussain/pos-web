"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
// --- 1. IMPORT SWR & FETCHER ---
import useSWR from "swr";
import { swrFetcher } from "@/lib/utils";

// --- 2. IMPORT NEW UI COMPONENTS ---
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
import { Switch } from "@/components/ui/switch"; // For is_active
import { Loader2 } from "lucide-react";

// --- 3. DEFINE NEW CONTAINER SCHEMA ---
const formSchema = z.object({
  name: z.string().min(3, {
    message: "Container name must be at least 3 characters long.",
  }),
  description: z.string().optional(),
  base_unit_id: z.coerce
    .number({
      required_error: "Please select a base unit.",
      invalid_type_error: "Please select a base unit.",
    })
    .min(1, "Please select a base unit."),
  measurement_unit_id: z.coerce
    .number({
      required_error: "Please select a measurement unit.",
      invalid_type_error: "Please select a measurement unit.",
    })
    .min(1, "Please select a measurement unit."),
  capacity: z.coerce
    .number({
      invalid_type_error: "Capacity must be a number.",
    })
    .min(0, "Capacity must be 0 or more."),
  is_active: z.boolean().default(true),
});

// --- 4. RENAME THE COMPONENT ---
export function ContainerDialog({
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
    // --- 5. SET NEW DEFAULT VALUES ---
    defaultValues: {
      name: "",
      description: "",
      base_unit_id: undefined,
      measurement_unit_id: undefined,
      capacity: 0,
      is_active: true,
    },
  });

  // --- 6. UPDATE RESET LOGIC ---
  useEffect(() => {
    // We reset the form only when the dialog opens
    if (open) {
      if (isEditMode && initialData) {
        form.reset({
          name: initialData.name,
          description: initialData.description || "",
          base_unit_id: initialData.base_unit_id,
          measurement_unit_id: initialData.measurement_unit_id,
          capacity: Number(initialData.capacity) || 0,
          is_active: initialData.is_active,
        });
      } else {
        form.reset({
          name: "",
          description: "",
          base_unit_id: undefined,
          measurement_unit_id: undefined,
          capacity: 0,
          is_active: true,
        });
      }
    }
  }, [initialData, form, open, isEditMode]);

  // --- 7. SET UP SWR FOR BOTH ENDPOINTS ---
  const accessToken = session?.accessToken;

  // Fetch Measurement Units
  const measurementUnitsUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/measurement-units`;
  const swrMeasurementKey =
    open && accessToken ? [measurementUnitsUrl, accessToken] : null;
  const {
    data: measurementUnits,
    error: measurementError,
    isLoading: isFetchingMeasurementUnits,
  } = useSWR(swrMeasurementKey, swrFetcher, { revalidateOnFocus: false });

  // Fetch Base Units
  const baseUnitsUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/units`;
  const swrBaseUnitsKey =
    open && accessToken ? [baseUnitsUrl, accessToken] : null;
  const {
    data: baseUnits,
    error: baseUnitsError,
    isLoading: isFetchingBaseUnits,
  } = useSWR(swrBaseUnitsKey, swrFetcher, { revalidateOnFocus: false });

  // Handle SWR errors
  useEffect(() => {
    if (measurementError) {
      toast.error(
        measurementError.message || "Failed to load measurement units."
      );
      console.error("SWR Measurement Error:", measurementError);
    }
    if (baseUnitsError) {
      toast.error(baseUnitsError.message || "Failed to load base units.");
      console.error("SWR Base Units Error:", baseUnitsError);
    }
  }, [measurementError, baseUnitsError]);

  // --- 8. UPDATE ONSUBMIT FUNCTION ---
  const onSubmit = async (values) => {
    if (!session?.accessToken) {
      toast.error("Authentication failed. Please log in again.");
      return;
    }

    setIsSubmitting(true);

    const url = isEditMode
      ? `${process.env.NEXT_PUBLIC_API_BASE_URL}/containers/${initialData?.id}` // Endpoint for containers
      : `${process.env.NEXT_PUBLIC_API_BASE_URL}/containers`; // Endpoint for containers

    const method = isEditMode ? "PATCH" : "POST";

    try {
      const response = await fetch(url, {
        method: method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.accessToken}`,
        },
        body: JSON.stringify(values), // Schema now matches the API payload
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to save container.");
      }

      toast.success(
        `Container ${isEditMode ? "updated" : "created"} successfully!`
      );
      onSuccess(); // This prop will trigger a refetch in the parent component
    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isLoadingDropdowns = isFetchingMeasurementUnits || isFetchingBaseUnits;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          {/* --- 9. UPDATE DIALOG TEXT --- */}
          <DialogTitle>
            {isEditMode ? "Edit Container" : "Create New Container"}
          </DialogTitle>
          <DialogDescription>
            {isEditMode
              ? "Make changes to your container here."
              : "Add a new container to manage inventory."}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          {/* --- 10. BUILD THE NEW FORM --- */}
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Container Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Large Storage Box" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Grid for units and capacity */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="base_unit_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Base Unit</FormLabel>
                    <Select
                      value={field.value ? String(field.value) : undefined}
                      onValueChange={field.onChange}
                      disabled={isFetchingBaseUnits}
                    >
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue
                            placeholder={
                              isFetchingBaseUnits
                                ? "Loading units..."
                                : "Select a unit"
                            }
                          />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {(baseUnits || []).map((unit) => (
                          <SelectItem key={unit.id} value={String(unit.id)}>
                            {unit.name}
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
                name="measurement_unit_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Measurement Unit</FormLabel>
                    <Select
                      value={field.value ? String(field.value) : undefined}
                      onValueChange={field.onChange}
                      disabled={isFetchingMeasurementUnits}
                    >
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue
                            placeholder={
                              isFetchingMeasurementUnits
                                ? "Loading units..."
                                : "Select a unit"
                            }
                          />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {(measurementUnits || []).map((unit) => (
                          <SelectItem key={unit.id} value={String(unit.id)}>
                            {unit.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="capacity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Capacity</FormLabel>
                  <FormControl>
                    {/* Set type to number for better UX */}
                    <Input
                      min={0}
                      type="number"
                      placeholder="50.5"
                      {...field}
                    />
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
                      placeholder="A short description of the container"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="is_active"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                  <div className="space-y-0.5">
                    <FormLabel>Active</FormLabel>
                    <FormDescription>
                      Is this container actively in use?
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

            <DialogFooter className="pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting || isLoadingDropdowns} // Disable if submitting OR loading data
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : isEditMode ? (
                  "Save Changes"
                ) : (
                  "Create Container"
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
