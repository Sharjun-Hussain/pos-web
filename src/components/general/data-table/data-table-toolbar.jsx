// /components/data-table/data-table-toolbar.tsx
"use client";

import { Table } from "@tanstack/react-table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, Trash } from "lucide-react";

export function DataTableToolbar({ table, entityName, onAdd }) {
  const isFiltered = table.getState().columnFilters.length > 0;
  const numSelected = table.getFilteredSelectedRowModel().rows.length;

  return (
    <div className="flex items-center justify-between">
      <div className="flex flex-1 items-center space-x-2">
        <Input
          placeholder={`Filter by name...`}
          value={table.getColumn("name")?.getFilterValue() ?? ""}
          onChange={(event) =>
            table.getColumn("name")?.setFilterValue(event.target.value)
          }
          className="h-8 w-[150px] lg:w-[250px]"
        />
        {/* You can add more filters here, e.g., a status filter dropdown */}
      </div>
      <div className="flex items-center space-x-2">
        {numSelected > 0 && (
          <Button variant="destructive" size="sm" className="h-8">
            <Trash className="mr-2 h-4 w-4" />
            Delete ({numSelected})
          </Button>
        )}
        <Button onClick={onAdd} size="sm" className="h-8">
          <Plus className="mr-2 h-4 w-4" />
          Add {entityName}
        </Button>
      </div>
    </div>
  );
}
