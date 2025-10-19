"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";

export function AddBranchDialog({ open, onOpenChange }) {
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    type: "sub",
    parentBranchId: "",
    address: "",
    phone: "",
    email: "",
    manager: "",
    allowInventoryTransfer: true,
    syncWithMain: true,
    canManageUsers: false,
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("[v0] Creating branch:", formData);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Branch</DialogTitle>
          <DialogDescription>
            Create a new branch location for your business
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">Branch Name</Label>
              <Input
                id="name"
                placeholder="Downtown Branch"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="code">Branch Code</Label>
              <Input
                id="code"
                placeholder="DT01"
                value={formData.code}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    code: e.target.value.toUpperCase(),
                  })
                }
                required
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="type">Branch Type</Label>
              <Select
                value={formData.type}
                onValueChange={(value) =>
                  setFormData({ ...formData, type: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="main">Main Branch</SelectItem>
                  <SelectItem value="sub">Sub Branch</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {formData.type === "sub" && (
              <div className="space-y-2">
                <Label htmlFor="parent">Parent Branch</Label>
                <Select
                  value={formData.parentBranchId}
                  onValueChange={(value) =>
                    setFormData({ ...formData, parentBranchId: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select parent" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Main Branch</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Address</Label>
            <Textarea
              id="address"
              placeholder="123 Business Street, City, State, ZIP"
              value={formData.address}
              onChange={(e) =>
                setFormData({ ...formData, address: e.target.value })
              }
              required
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="+1 (555) 123-4567"
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="branch@business.com"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="manager">Branch Manager</Label>
            <Input
              id="manager"
              placeholder="Manager Name"
              value={formData.manager}
              onChange={(e) =>
                setFormData({ ...formData, manager: e.target.value })
              }
              required
            />
          </div>

          <div className="space-y-4 rounded-lg border p-4">
            <h4 className="text-sm font-medium">Branch Settings</h4>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Allow Inventory Transfer</Label>
                <p className="text-xs text-muted-foreground">
                  Enable transferring inventory to/from this branch
                </p>
              </div>
              <Switch
                checked={formData.allowInventoryTransfer}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, allowInventoryTransfer: checked })
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Sync with Main Branch</Label>
                <p className="text-xs text-muted-foreground">
                  Automatically sync data with main branch
                </p>
              </div>
              <Switch
                checked={formData.syncWithMain}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, syncWithMain: checked })
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Can Manage Users</Label>
                <p className="text-xs text-muted-foreground">
                  Allow this branch to create and manage users
                </p>
              </div>
              <Switch
                checked={formData.canManageUsers}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, canManageUsers: checked })
                }
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit">Create Branch</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
