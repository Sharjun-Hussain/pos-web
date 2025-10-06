"use client";

import React, { useState } from "react";
import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Mail, Lock, Loader2, AlertTriangle, HardHat } from "lucide-react";

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
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const formSchema = z.object({
  email: z
    .string()
    .email({ message: "Please enter a valid email address." })
    .trim()
    .max(100, { message: "Email must not exceed 100 characters." }),
  password: z
    .string()
    .min(1, { message: "Password cannot be empty." })
    .max(100, { message: "Password must not exceed 100 characters." }),
});

export default function ModernIndustrialLoginPageLight() {
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState(null);

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function onSubmit(values) {
    setIsLoading(true);
    setServerError(null);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 2000));

    if (
      values.email !== "admin@system.com" ||
      values.password !== "password123"
    ) {
      setServerError("Invalid email or password. Please try again.");
    } else {
      console.log("Login successful:", values);
      // In a real app, you'd redirect here, e.g., router.push('/dashboard');
      alert("Login Successful! (This is a demo alert)");
    }

    setIsLoading(false);
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 p-4 font-sans">
      <div className="w-full max-w-md">
        <Card className="bg-white shadow-xl border-slate-200">
          <CardHeader className="text-center pb-6">
            <div className="flex justify-center mb-4">
              <HardHat className="h-10 w-10 text-blue-600" />
            </div>
            <CardTitle className="text-3xl font-bold tracking-tight text-slate-800">
              POS Terminal Login
            </CardTitle>
            <CardDescription className="text-slate-500 text-sm mt-1">
              Access your Industrial Point of Sale system
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-6"
              >
                <div className="space-y-4">
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
                              placeholder="operator@company.com"
                              type="email"
                              autoComplete="username"
                              className="pl-10 bg-slate-100 border-slate-300 text-slate-900 placeholder:text-slate-400 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                              {...field}
                            />
                          </FormControl>
                        </div>
                        <FormMessage className="text-red-600" />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-slate-700">
                          Password
                        </FormLabel>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                          <FormControl>
                            <Input
                              placeholder="••••••••"
                              type="password"
                              autoComplete="current-password"
                              className="pl-10 bg-slate-100 border-slate-300 text-slate-900 placeholder:text-slate-400 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                              {...field}
                            />
                          </FormControl>
                        </div>
                        <FormMessage className="text-red-600" />
                      </FormItem>
                    )}
                  />
                </div>

                {serverError && (
                  <Alert
                    variant="destructive"
                    className="bg-red-50 border-red-200 text-red-800"
                  >
                    <AlertTriangle className="h-4 w-4 text-red-500" />
                    <AlertTitle>Login Failed</AlertTitle>
                    <AlertDescription>{serverError}</AlertDescription>
                  </Alert>
                )}

                <Button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 text-sm rounded-lg transition-all duration-200"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Authenticating...
                    </>
                  ) : (
                    "Secure Login"
                  )}
                </Button>
              </form>
            </Form>
          </CardContent>
          <CardFooter className="flex flex-col items-center pt-4">
            <Link
              href="/forgot-password"
              className="text-sm underline text-slate-500 hover:text-blue-600 transition-colors duration-200"
            >
              Forgot Password?
            </Link>
            <p className="text-xs text-slate-400 mt-4 text-center">
              All access is monitored for security purposes.
            </p>
          </CardFooter>
        </Card>
      </div>
    </main>
  );
}
