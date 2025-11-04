"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useFieldArray } from "react-hook-form";
import { z } from "zod";
import { LoaderIcon, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { toast } from "sonner";

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
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea"; // Added for description

// Regex for phone numbers (simplified, allows + and numbers)
const phoneRegex = new RegExp(
  /^([+]?[\s0-9]+)?(\d{3}|[(]?[0-9]+[)])?([-]?[\s]?[0-9])+$/
);

// Schema for a single bank account
const bankAccountSchema = z.object({
  id: z.any().optional(), // To track existing accounts for updates
  bank_name: z.string().min(2, { message: "Bank name is required." }),
  account_holder_name: z
    .string()
    .min(2, { message: "Account holder name is required." }),
  branch_name: z.string().optional().or(z.literal("")),
  account_number: z.string().min(5, { message: "Account number is required." }),
  is_default: z.boolean().default(false),
  is_active: z.boolean().default(true),
});

// Main supplier form schema based on your JSON
export const supplierFormSchema = z.object({
  name: z
    .string()
    .min(2, { message: "Supplier name must be at least 2 characters." }),
  code: z
    .string()
    .min(3, { message: "Supplier code must be at least 3 characters." }),
  company_name: z.string().optional().or(z.literal("")),
  contact_person_name: z
    .string()
    .min(2, { message: "Contact person is required." }),
  contact_person_phone: z.string().regex(phoneRegex, "Invalid phone number"),
  alternate_phone: z
    .string()
    .regex(phoneRegex, "Invalid phone number")
    .optional()
    .or(z.literal("")),
  address: z.string().optional().or(z.literal("")),
  city: z.string().optional().or(z.literal("")),
  state: z.string().optional().or(z.literal("")),
  country: z.string().optional().or(z.literal("")),
  phone: z.string().regex(phoneRegex, "Invalid phone number"),
  whatsapp: z
    .string()
    .regex(phoneRegex, "Invalid phone number")
    .optional()
    .or(z.literal("")),
  fax: z.string().optional().or(z.literal("")), // Fax can have various formats
  email: z
    .string()
    .email({ message: "Please enter a valid email address." })
    .optional()
    .or(z.literal("")),
  website: z
    .string()
    .url({ message: "Please enter a valid URL." })
    .optional()
    .or(z.literal("")),
  description: z.string().optional().or(z.literal("")),
  is_active: z.boolean().default(true),
  bank_accounts: z
    .array(bankAccountSchema)
    .min(1, "At least one bank account is required."),
});

// Helper to get default values for a new bank account
const createDefaultBankAccount = (holderName = "") => ({
  bank_name: "",
  account_holder_name: holderName,
  branch_name: "",
  account_number: "",
  is_default: false,
  is_active: true,
});

export function SupplierForm({ initialData }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { data: session } = useSession();
  const accessToken = session?.accessToken;
  const router = useRouter();

  const isEditMode = !!initialData;

  const form = useForm({
    resolver: zodResolver(supplierFormSchema),
    defaultValues: {
      name: initialData?.name || "",
      code: initialData?.code || "",
      company_name: initialData?.company_name || "",
      contact_person_name: initialData?.contact_person_name || "",
      contact_person_phone: initialData?.contact_person_phone || "",
      alternate_phone: initialData?.alternate_phone || "",
      address: initialData?.address || "",
      city: initialData?.city || "",
      state: initialData?.state || "",
      country: initialData?.country || "",
      phone: initialData?.phone || "",
      whatsapp: initialData?.whatsapp || "",
      fax: initialData?.fax || "",
      email: initialData?.email || "",
      website: initialData?.website || "",
      description: initialData?.description || "",
      is_active: initialData ? !!initialData.is_active : true,
      bank_accounts:
        initialData?.bank_accounts?.length > 0
          ? initialData.bank_accounts
          : [
              createDefaultBankAccount(
                initialData?.company_name || initialData?.name
              ),
            ],
    },
  });

  // Setup for the dynamic bank account array
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "bank_accounts",
  });

  /**
   * Handles setting a bank account as default, ensuring only one is default.
   */
  const handleSetDefault = (indexToSet) => {
    const currentBankAccounts = form.getValues("bank_accounts");
    const updatedBankAccounts = currentBankAccounts.map((account, index) => ({
      ...account,
      is_default: index === indexToSet, // Only the clicked one is default
    }));
    form.setValue("bank_accounts", updatedBankAccounts, {
      shouldValidate: true,
      shouldDirty: true,
    });
  };

  async function onSubmit(data) {
    if (!accessToken) {
      toast.error("Authentication failed. Please log in again.");
      return;
    }

    // Ensure at least one bank account is default if multiple exist
    const defaultExists = data.bank_accounts.some((ba) => ba.is_default);
    if (!defaultExists && data.bank_accounts.length > 0) {
      data.bank_accounts[0].is_default = true;
    }

    setIsSubmitting(true);

    const url = isEditMode
      ? `${process.env.NEXT_PUBLIC_API_BASE_URL}/suppliers/${initialData.id}`
      : `${process.env.NEXT_PUBLIC_API_BASE_URL}/suppliers`;

    const method = isEditMode ? "PATCH" : "POST";

    try {
      const response = await fetch(url, {
        method: method,
        body: JSON.stringify(data), // Send as clean JSON
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message ||
            `Failed to ${isEditMode ? "update" : "create"} supplier.`
        );
      }

      toast.success(
        `Supplier ${isEditMode ? "updated" : "created"} successfully!`
      );
      router.back(); // Navigate back on success
      router.refresh(); // Refresh router cache
    } catch (error) {
      console.error("Submission error:", error);
      toast.error(error.message || "An unexpected error occurred.");
    } finally {
      setIsSubmitting(false); // Always re-enable button
    }
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            {/* Section 1: Supplier Details */}
            <div>
              <h3 className="text-lg font-medium mb-4">Supplier Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Supplier Name*</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter supplier display name"
                          {...field}
                          disabled={isSubmitting}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="code"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Supplier Code*</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter unique code (e.g., SUP001)"
                          {...field}
                          disabled={isSubmitting || isEditMode}
                        />
                      </FormControl>
                      {isEditMode && (
                        <FormDescription>
                          Cannot be changed after creation.
                        </FormDescription>
                      )}
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="company_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Company Name (Legal)</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter company's legal name"
                          {...field}
                          disabled={isSubmitting}
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
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="A short description of the supplier..."
                          {...field}
                          disabled={isSubmitting}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <Separator />

            {/* Section 2: Contact Information */}
            <div>
              <h3 className="text-lg font-medium mb-4">Contact Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="contact_person_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Contact Person*</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g., John Smith"
                          {...field}
                          disabled={isSubmitting}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="contact_person_phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Contact Person Phone*</FormLabel>
                      <FormControl>
                        <Input
                          type="tel"
                          placeholder="+2348012345678"
                          {...field}
                          disabled={isSubmitting}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Company Phone*</FormLabel>
                      <FormControl>
                        <Input
                          type="tel"
                          placeholder="Company main line"
                          {...field}
                          disabled={isSubmitting}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="alternate_phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Alternate Phone</FormLabel>
                      <FormControl>
                        <Input
                          type="tel"
                          placeholder="Another contact number"
                          {...field}
                          disabled={isSubmitting}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="contact@supplier.com"
                          {...field}
                          disabled={isSubmitting}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="whatsapp"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>WhatsApp</FormLabel>
                      <FormControl>
                        <Input
                          type="tel"
                          placeholder="WhatsApp number"
                          {...field}
                          disabled={isSubmitting}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="website"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Website</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="https://supplier.com"
                          {...field}
                          disabled={isSubmitting}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="fax"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Fax</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Fax number"
                          {...field}
                          disabled={isSubmitting}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <Separator />

            {/* Section 3: Address */}
            <div>
              <h3 className="text-lg font-medium mb-4">Address</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel>Address</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="123 Main Street"
                          {...field}
                          disabled={isSubmitting}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="city"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>City</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g., Lagos"
                          {...field}
                          disabled={isSubmitting}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="state"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>State</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g., Lagos"
                          {...field}
                          disabled={isSubmitting}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="country"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Country</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g., Nigeria"
                          {...field}
                          disabled={isSubmitting}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <Separator />

            {/* Section 4: Settings */}
            <div>
              <h3 className="text-lg font-medium mb-4">Settings</h3>
              <FormField
                control={form.control}
                name="is_active"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel>Supplier Status</FormLabel>
                      <FormDescription>
                        Inactive suppliers cannot be added to purchase orders.
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        disabled={isSubmitting}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>

            <Separator />

            {/* Section 5: Bank Accounts */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium">Bank Accounts</h3>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={isSubmitting}
                  onClick={() =>
                    append(
                      createDefaultBankAccount(
                        form.getValues("company_name") || form.getValues("name")
                      )
                    )
                  }
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Bank Account
                </Button>
              </div>
              <div className="space-y-4">
                {fields.map((field, index) => (
                  <Card key={field.id} className="relative">
                    <CardHeader>
                      <CardTitle>Bank Account #{index + 1}</CardTitle>
                      {fields.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="absolute top-2 right-2 text-muted-foreground hover:text-red-500"
                          onClick={() => remove(index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                          control={form.control}
                          name={`bank_accounts.${index}.bank_name`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Bank Name*</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="e.g., First Bank"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name={`bank_accounts.${index}.account_holder_name`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Account Holder Name*</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="Legal name on account"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name={`bank_accounts.${index}.account_number`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Account Number*</FormLabel>
                              <FormControl>
                                <Input placeholder="1234567890" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name={`bank_accounts.${index}.branch_name`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Branch Name</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="e.g., Victoria Island"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      <div className="flex items-center space-x-6 pt-2">
                        <FormField
                          control={form.control}
                          name={`bank_accounts.${index}.is_active`}
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center space-x-2">
                              <FormControl>
                                <Switch
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                  disabled={isSubmitting}
                                />
                              </FormControl>
                              <FormLabel className="mb-0 !mt-0">
                                Active
                              </FormLabel>
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name={`bank_accounts.${index}.is_default`}
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center space-x-2">
                              <FormControl>
                                <Switch
                                  checked={field.value}
                                  onCheckedChange={(isChecked) => {
                                    if (isChecked) {
                                      handleSetDefault(index);
                                    }
                                    // Don't allow unchecking directly
                                    // To change default, check another
                                  }}
                                  disabled={isSubmitting}
                                />
                              </FormControl>
                              <FormLabel className="mb-0 !mt-0">
                                Set as Default
                              </FormLabel>
                            </FormItem>
                          )}
                        />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* --- Final Buttons --- */}
            <div className="flex justify-end gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <span className="flex items-center gap-2">
                    <LoaderIcon className="h-4 w-4 animate-spin" /> Saving...
                  </span>
                ) : isEditMode ? (
                  "Save Changes"
                ) : (
                  "Create Supplier"
                )}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
