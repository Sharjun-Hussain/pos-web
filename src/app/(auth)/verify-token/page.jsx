// app/verify-token/page.jsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";

const formSchema = z.object({
  token: z.string().min(6, { message: "Token must be 6 characters." }),
});

export default function VerifyTokenPage() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: { token: "" },
  });

  async function onSubmit(values) {
    setIsLoading(true);
    console.log("Verifying token:", values.token);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // Example of failed verification
    if (values.token !== "123456") {
      toast.error("Invalid Token", {
        description: "The token you entered is incorrect. Please try again.",
      });
      setIsLoading(false);
      return;
    }

    toast.success("Token Verified!", {
      description: "You can now reset your password.",
    });
    setIsLoading(false);

    // On success, redirect to the reset password page
    router.push("/reset-password");
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 dark:bg-slate-900 p-4">
      <Card className="w-full max-w-sm border-slate-300 dark:border-slate-700">
        <CardHeader>
          <CardTitle className="text-2xl">Enter Verification Token</CardTitle>
          <CardDescription>
            Please enter the 6-digit token sent to your email.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="token"
                render={({ field }) => (
                  <FormItem className="flex flex-col items-center">
                    <FormLabel>Verification Token</FormLabel>
                    <FormControl>
                      <InputOTP maxLength={6} {...field}>
                        <InputOTPGroup>
                          <InputOTPSlot index={0} />
                          <InputOTPSlot index={1} />
                          <InputOTPSlot index={2} />
                          <InputOTPSlot index={3} />
                          <InputOTPSlot index={4} />
                          <InputOTPSlot index={5} />
                        </InputOTPGroup>
                      </InputOTP>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <Loader2 className="animate-spin" />
                ) : (
                  "Verify Token"
                )}
              </Button>
              <Button variant="outline" className="w-full" asChild>
                <Link href="/login">Cancel</Link>
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </main>
  );
}
