// /components/data-table/entity-form-sheet.tsx
import React, { useState, useEffect } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const EntityFormSheet = ({
  isOpen,
  onClose,
  onSubmit,
  entityName,
  initialData,
}) => {
  const [formData, setFormData] = useState(initialData);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // When initialData changes (i.e., when opening for a new or different entity), update the form
  useEffect(() => {
    setFormData(initialData);
  }, [initialData]);

  const isEditing = initialData && initialData.id;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    const success = await onSubmit(formData);
    setIsSubmitting(false);
    // The parent component handles closing on success
  };

  const handleValueChange = (key, value) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>
            {isEditing ? `Edit` : `Add`} {entityName}
          </SheetTitle>
          <SheetDescription>
            {isEditing
              ? `Make changes to your ${entityName.toLowerCase()} here.`
              : `Create a new ${entityName.toLowerCase()} to add to your list.`}
          </SheetDescription>
        </SheetHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-6">
            <div className="grid gap-2">
              <Label htmlFor="name">{entityName} Name</Label>
              <Input
                id="name"
                value={formData.name || ""}
                onChange={(e) => handleValueChange("name", e.target.value)}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => handleValueChange("status", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <SheetFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Save Changes"}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
};
