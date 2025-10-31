"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Building } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation"; // CHANGED: For navigation on success

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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_IMAGE_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
];

// CHANGED: Exporting schema for type inference
export const formSchema = z.object({
  logo: z
    .instanceof(File)
    .optional()
    .refine(
      (file) => !file || file.size <= MAX_FILE_SIZE,
      `Max image size is 5MB.`
    )
    .refine(
      (file) => !file || ACCEPTED_IMAGE_TYPES.includes(file.type),
      "Only .jpg, .jpeg, .png and .webp formats are supported."
    ),
  name: z
    .string()
    .min(2, { message: "Organization name must be at least 2 characters." }),
  code: z
    .string()
    .min(4, { message: "Org. code must be at least 4 characters." }),
  owner_email: z
    .string()
    .email({ message: "Please enter a valid email address." }),
  city: z.string().min(2, { message: "City must be at least 2 characters." }),
  subscription_plan: z.string({
    required_error: "Please select a subscription plan.",
  }),
  status: z.string({ required_error: "Please select a status." }),
  is_multi_branch: z.boolean().default(false).optional(),
});

const subscriptionPlans = [
  { id: "Basic", name: "Basic" },
  { id: "Pro", name: "Pro" },
  { id: "Enterprise", name: "Enterprise" },
];

const statuses = [
  { id: "active", name: "Active" },
  { id: "suspended", name: "Suspended" },
];

export function OrganizationForm() {
  // CHANGED: Add loading state
  const [isLoading, setIsLoading] = useState(false);

  // CHANGED: Initialize router and toast
  const router = useRouter();

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      logo: undefined,
      name: "",
      code: "",
      owner_email: "",
      city: "",
      subscription_plan: "",
      status: "active",
      is_multi_branch: false,
    },
  });

  const logo = form.watch("logo");
  const previewUrl = logo ? URL.createObjectURL(logo) : null;

  // CHANGED: Updated onSubmit function to call the API
  async function onSubmit(data) {
    setIsLoading(true); // 1. Disable buttons immediately

    const formData = new FormData();
    formData.append("name", data.name);
    formData.append("code", data.code);
    formData.append("owner_email", data.owner_email);
    formData.append("city", data.city);
    formData.append("subscription_plan", data.subscription_plan);
    formData.append("status", data.status);
    formData.append("is_multi_branch", data.is_multi_branch ? "1" : "0");
    if (data.logo) {
      formData.append("logo", data.logo);
    }

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/organizations`,
        {
          method: "POST",
          body: formData,
          headers: {
            // "Authorization": "Bearer YOUR_API_TOKEN",
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to create organization.");
      }

      const result = await response.json();
      console.log("Organization created:", result);

      // SUCCESS:
      toast.success("Success!", "Organization created successfully.");

      // Wait 1s, then navigate. The buttons will remain
      // disabled this whole time, which is good UX.
      setTimeout(() => {
        router.back();
      }, 1000);

      // Note: We DO NOT call setIsLoading(false) here.
    } catch (error) {
      // ERROR:
      console.error("Submission error:", error);
      toast.error(error.message || "Failed to create organization.");

      // Only set loading to false if there's an error,
      // so the user can try again.
      setIsLoading(false);
    }
    // We remove the `finally` block entirely.
  }

  return (
    <Card className="">
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            {/* ... (The rest of your form fields remain unchanged) ... */}

            <div>
              <h3 className="text-lg font-medium mb-4">Organization Details</h3>

              <FormField
                control={form.control}
                name="logo"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-center gap-6">
                      <Avatar className="w-20 h-20">
                        <AvatarImage src={previewUrl || ""} alt="Logo" />
                        <AvatarFallback>
                          <Building className="w-10 h-10" />
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <FormLabel>Organization Logo</FormLabel>
                        <FormDescription>PNG or JPG. Max 5MB.</FormDescription>
                      </div>
                      <FormControl>
                        <Input
                          type="file"
                          accept="image/png, image/jpeg"
                          className="hidden"
                          id="file-upload"
                          onChange={(e) =>
                            field.onChange(e.target.files?.[0] ?? null)
                          }
                        />
                      </FormControl>
                      <Button asChild variant="outline">
                        <label htmlFor="file-upload">Upload Logo</label>
                      </Button>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Organization Name</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter organization name"
                          {...field}
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
                      <FormLabel>Organization Code</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter unique code (e.g., ABCD004)"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="owner_email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Owner's Email Address</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="Enter owner's email address"
                          {...field}
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
                        <Input placeholder="Enter city" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <Separator />

            <div>
              <h3 className="text-lg font-medium mb-4">
                Settings & Subscription
              </h3>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <FormField
                    control={form.control}
                    name="subscription_plan"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Subscription Plan</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Select a plan" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {subscriptionPlans.map((plan) => (
                              <SelectItem key={plan.id} value={plan.id}>
                                {plan.name}
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
                    name="status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Status</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Select a status" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {statuses.map((status) => (
                              <SelectItem key={status.id} value={status.id}>
                                {status.name}
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
                  name="is_multi_branch"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel>Multi-Branch</FormLabel>
                        <FormDescription>
                          Allow this organization to create and manage multiple
                          branches.
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* CHANGED: Disable buttons and show loading text on submit */}
            <div className="flex justify-end gap-2">
              <Button type="button" variant="ghost" disabled={isLoading}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Saving..." : "Save Organization"}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
