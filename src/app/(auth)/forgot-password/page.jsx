"use client";

import { useState } from "react";
// import Link from "next/link"; // Removed Next.js specific import
// import { useRouter } from "next/navigation"; // Removed Next.js specific import
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { toast } from "sonner";
import { Mail, Loader2, KeyRound, ArrowLeft } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
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
import { Input } from "@/components/ui/input";

// Define the validation schema for the form
const formSchema = z.object({
  email: z
    .string()
    .email({ message: "Please enter a valid email address." })
    .trim(),
});

export default function ModernForgotPasswordPage() {
  const [isLoading, setIsLoading] = useState(false);
  // const router = useRouter(); // Removed Next.js specific hook

  // Initialize the form with react-hook-form and Zod for validation
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: { email: "" },
  });

  // Handle form submission
  async function onSubmit(values) {
    setIsLoading(true);
    console.log("Requesting password reset for:", values.email);

    // Simulate an API call to the backend
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // On success, show a toast notification to the user
    toast.success("Reset link sent!", {
      description: `If an account exists for ${values.email}, you will receive a password reset link.`,
      duration: 5000,
    });

    setIsLoading(false);

    // It's often better not to reveal if an email exists.
    // We can redirect them back to login or to a confirmation page.
    // For this example, we'll simulate a redirect after a short delay.
    setTimeout(() => {
      // window.location.href = "/reset-confirmation"; // Standard browser navigation
    }, 2000);
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 p-4 font-sans">
      <div className="w-full max-w-md">
        <Card className="bg-white shadow-xl border-slate-200">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <KeyRound className="h-10 w-10 text-blue-600" />
            </div>
            <CardTitle className="text-3xl font-bold tracking-tight text-slate-800">
              Forgot Your Password?
            </CardTitle>
            <CardDescription className="text-slate-500 text-sm mt-1">
              No problem. Enter your email and we'll send you a reset link.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-6"
              >
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-slate-700">
                        Email Address
                      </FormLabel>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                        <FormControl>
                          <Input
                            placeholder="your.email@company.com"
                            type="email"
                            autoComplete="email"
                            className="pl-10 bg-slate-100 border-slate-300 text-slate-900 placeholder:text-slate-400 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                            {...field}
                          />
                        </FormControl>
                      </div>
                      <FormMessage className="text-red-600" />
                    </FormItem>
                  )}
                />
                <Button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 text-sm rounded-lg transition-all duration-200"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    "Send Reset Link"
                  )}
                </Button>
              </form>
            </Form>
          </CardContent>
          <CardFooter className="flex justify-center pt-4">
            <a
              href="/"
              className="text-sm text-slate-500 hover:text-blue-600 transition-colors duration-200 flex items-center"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Login
            </a>
          </CardFooter>
        </Card>
      </div>
    </main>
  );
}
