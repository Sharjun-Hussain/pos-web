"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";

// JSDoc comment to describe the shape of the Branch object for clarity
/**
 * @typedef Branch
 * @property {string} id
 * @property {string} name
 * @property {{ city: string; country: string; }} location
 * @property {string} manager
 * @property {number} staffCount
 * @property {'active' | 'inactive'} status
 */

export const columns = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
  },
  {
    accessorKey: "name",
    header: "Branch Name",
  },
  {
    accessorKey: "location",
    header: "Location",
    cell: ({ row }) => {
      const location = row.original.location;
      return `${location.city}, ${location.country}`;
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status");
      return (
        <Badge variant={status === "active" ? "success" : "secondary"}>
          {status}
        </Badge>
      );
    },
  },
  {
    accessorKey: "manager",
    header: "Manager",
  },
  {
    accessorKey: "staffCount",
    header: "Staff Count",
    cell: ({ row }) => {
      return (
        <div className="text-center font-medium">
          {row.getValue("staffCount")}
        </div>
      );
    },
  },
];
