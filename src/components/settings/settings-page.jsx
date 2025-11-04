"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BusinessSettings } from "./business-settings";
import { ReceiptSettings } from "./receipt-settings";
import { UserSettings } from "./user-settings";

export function SettingsPage() {
  return (
    <div className="flex  flex-col bg-background ml-6">
      <div className="flex items-start justify-start flex-col py-4">
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>{" "}
        <div className="mt-1 text-sm text-muted-foreground">
          Configure your POS system preferences
        </div>
      </div>

      <div className="flex-1 ">
        <Tabs defaultValue="business" className="space-y-6">
          <TabsList>
            <TabsTrigger value="business">Business</TabsTrigger>

            <TabsTrigger value="receipt">Receipts</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
          </TabsList>

          <TabsContent value="business">
            <BusinessSettings />
          </TabsContent>

          <TabsContent value="receipt">
            <ReceiptSettings />
          </TabsContent>

          <TabsContent value="users">
            <UserSettings />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
