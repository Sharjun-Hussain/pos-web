"use client";

import React, { useState } from "react";
import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Mail, Lock, Loader2, AlertTriangle } from "lucide-react";

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
    .email({ message: "A valid email is required." })
    .trim()
    .max(100, { message: "Email must not exceed 100 characters." }),
  password: z
    .string()
    .min(1, { message: "Password is required." })
    .max(100, { message: "Password must not exceed 100 characters." }),
});

export default function IndustrialLoginPage() {
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

    await new Promise((resolve) => setTimeout(resolve, 2000));

    if (
      values.email !== "admin@system.com" ||
      values.password !== "password123"
    ) {
      setServerError("Invalid credentials or system error. Please try again.");
    } else {
      console.log("Login successful:", values);
    }

    setIsLoading(false);
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 dark:bg-slate-900 p-4">
      <div className="w-full max-w-md">
        <Card className="border-slate-300 dark:border-slate-700">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl tracking-tight">
              Industrial POS System
            </CardTitle>
            <CardDescription>Secure Access Terminal</CardDescription>
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
                        <FormLabel>Operator Email</FormLabel>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                          <FormControl>
                            <Input
                              placeholder="operator@company.com"
                              type="email"
                              autoComplete="username"
                              className="pl-10"
                              {...field}
                            />
                          </FormControl>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password</FormLabel>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                          <FormControl>
                            <Input
                              placeholder="••••••••"
                              type="password"
                              autoComplete="current-password"
                              className="pl-10"
                              {...field}
                            />
                          </FormControl>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {serverError && (
                  <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>Login Failed</AlertTitle>
                    <AlertDescription>{serverError}</AlertDescription>
                  </Alert>
                )}

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    "Secure Login"
                  )}
                </Button>
              </form>
            </Form>
          </CardContent>
          <CardFooter className="flex justify-center text-xs">
            <Link
              href="/forgot-password"
              className="underline text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
            >
              Forgot Password or need assistance?
            </Link>
          </CardFooter>
        </Card>
        <p className="mt-4 text-center text-xs text-slate-500 dark:text-slate-600">
          Protected by company security policies. All access is monitored.
        </p>
      </div>
    </main>
  );
}
