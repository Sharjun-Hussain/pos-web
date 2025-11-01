"use client";

import React, { useState } from "react";
import {
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { DataTable } from "@/components/general/data-table";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { LoaderIcon, PlusCircle, Download, Search, x, X } from "lucide-react";

// A new, generic toolbar
const ResourceTableToolbar = ({
  table,
  searchColumn,
  searchPlaceholder,
  bulkActionsComponent,
  filterComponents,
}) => {
  const numSelected = table.getFilteredSelectedRowModel().rows.length;
  const columnFilters = table.getState().columnFilters;
  const isFiltered = columnFilters.length > 0;

  return (
    <div className="flex items-center justify-between space-x-4 mb-4">
      <div className="flex flex-1 items-center space-x-2">
        {/* Generic Search Input */}
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={searchPlaceholder || "Search..."}
            value={table.getColumn(searchColumn)?.getFilterValue() ?? ""}
            onChange={(event) =>
              table.getColumn(searchColumn)?.setFilterValue(event.target.value)
            }
            className="pl-10"
          />
        </div>
        {filterComponents && filterComponents(table)}

        {isFiltered && (
          <Button
            variant="ghost"
            onClick={() => table.resetColumnFilters()} // Clears all filters
            className="h-8 px-2 text-red-500 lg:px-3 hover:bg-red-50 hover:text-red-600"
          >
            <X className="mr-1 h-4 w-4" />
            Clear ({columnFilters.length})
          </Button>
        )}
      </div>

      {/* Render bulk actions if any rows are selected */}
      {numSelected > 0 && bulkActionsComponent}
    </div>
  );
};

// The Main Generic Layout Component
export const ResourceManagementLayout = ({
  data,
  columns,
  isLoading,
  isError,
  errorMessage,
  onRetry,
  headerTitle,
  headerDescription,
  // Actions
  addButtonLabel = "Add New",
  onAddClick,
  onExportClick,
  isAdding, // For loader on "Add" button
  // Content Slots
  statCardsComponent,
  bulkActionsComponent,
  // Config
  searchColumn,
  searchPlaceholder,
  // Skeleton
  loadingSkeleton,
  filterComponents,
}) => {
  const [sorting, setSorting] = useState([]);
  const [columnFilters, setColumnFilters] = useState([]);
  const [rowSelection, setRowSelection] = useState({});

  const table = useReactTable({
    data: data || [],
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      rowSelection,
    },
  });

  if (isLoading) {
    return loadingSkeleton || <p>Loading...</p>;
  }

  if (isError) {
    return (
      <div className="hidden h-full flex-1 flex-col space-y-6 px-6 pb-6 pt-3 md:flex">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <p className="text-red-500 mb-4">Error: {errorMessage}</p>
            {onRetry && (
              <Button variant="outline" onClick={onRetry}>
                Retry
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Pass the table instance to the bulk actions component
  const renderedBulkActions = bulkActionsComponent
    ? React.cloneElement(bulkActionsComponent, { table })
    : null;

  return (
    <div className="hidden h-full flex-1 flex-col space-y-6 px-6 pb-6 pt-3 md:flex">
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">{headerTitle}</h1>
          <p className="text-muted-foreground">{headerDescription}</p>
        </div>
        <div className="flex items-center space-x-3">
          {onExportClick && (
            <Button variant="outline" className="gap-2" onClick={onExportClick}>
              <Download className="h-4 w-4" />
              Export
            </Button>
          )}
          {onAddClick && (
            <Button onClick={onAddClick} disabled={isAdding} className="gap-2">
              {isAdding ? (
                <LoaderIcon className="h-4 w-4 animate-spin" />
              ) : (
                <PlusCircle className="h-4 w-4" />
              )}
              {addButtonLabel}
            </Button>
          )}
        </div>
      </div>

      {/* Statistics Cards (Rendered via prop) */}
      {statCardsComponent}

      {/* Table Section */}
      <Card>
        <CardContent>
          <ResourceTableToolbar
            table={table}
            searchColumn={searchColumn}
            searchPlaceholder={searchPlaceholder}
            bulkActionsComponent={renderedBulkActions}
            filterComponents={filterComponents}
          />

          <DataTable table={table} columns={columns} />
        </CardContent>
      </Card>
    </div>
  );
};
