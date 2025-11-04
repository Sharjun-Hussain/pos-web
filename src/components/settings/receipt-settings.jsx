"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";

export function ReceiptSettings() {
  const [settings, setSettings] = useState({
    showLogo: true,
    headerText: "Thank you for your purchase!",
    footerText: "Visit us again soon!",
    showTaxId: true,
    taxId: "12-3456789",
    emailReceipts: true,
    printReceipts: true,
  });

  const handleSave = () => {
    console.log("Saving receipt settings:", settings);
  };

  return (
    <Card className="p-6">
      <div className="mb-6">
        <h3 className="text-lg font-semibold">Receipt Settings</h3>
        <p className="text-sm text-muted-foreground">
          Customize your receipt appearance and options
        </p>
      </div>

      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="showLogo">Show Business Logo</Label>
            <p className="text-sm text-muted-foreground">
              Display logo on receipts
            </p>
          </div>
          <Switch
            id="showLogo"
            checked={settings.showLogo}
            onCheckedChange={(checked) =>
              setSettings({ ...settings, showLogo: checked })
            }
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="headerText">Receipt Header</Label>
          <Input
            id="headerText"
            value={settings.headerText}
            onChange={(e) =>
              setSettings({ ...settings, headerText: e.target.value })
            }
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="footerText">Receipt Footer</Label>
          <Textarea
            id="footerText"
            value={settings.footerText}
            onChange={(e) =>
              setSettings({ ...settings, footerText: e.target.value })
            }
            rows={3}
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="showTaxId">Show Tax ID</Label>
            <p className="text-sm text-muted-foreground">
              Display tax identification number
            </p>
          </div>
          <Switch
            id="showTaxId"
            checked={settings.showTaxId}
            onCheckedChange={(checked) =>
              setSettings({ ...settings, showTaxId: checked })
            }
          />
        </div>

        {settings.showTaxId && (
          <div className="space-y-2">
            <Label htmlFor="taxId">Tax ID Number</Label>
            <Input
              id="taxId"
              value={settings.taxId}
              onChange={(e) =>
                setSettings({ ...settings, taxId: e.target.value })
              }
            />
          </div>
        )}

        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="emailReceipts">Email Receipts</Label>
            <p className="text-sm text-muted-foreground">
              Send receipts via email
            </p>
          </div>
          <Switch
            id="emailReceipts"
            checked={settings.emailReceipts}
            onCheckedChange={(checked) =>
              setSettings({ ...settings, emailReceipts: checked })
            }
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="printReceipts">Print Receipts</Label>
            <p className="text-sm text-muted-foreground">
              Automatically print receipts
            </p>
          </div>
          <Switch
            id="printReceipts"
            checked={settings.printReceipts}
            onCheckedChange={(checked) =>
              setSettings({ ...settings, printReceipts: checked })
            }
          />
        </div>

        <div className="flex justify-end">
          <Button onClick={handleSave} size="lg">
            Save Changes
          </Button>
        </div>
      </div>
    </Card>
  );
}
