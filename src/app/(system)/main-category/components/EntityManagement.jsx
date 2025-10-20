// components/entity-management.tsx
import React, { useState, useEffect, useMemo } from "react";
import {
  ChevronDown,
  Plus,
  Search,
  MoreHorizontal,
  Trash,
  Edit,
  ChevronLeft,
  ChevronRight,
  Download,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { CardContent, CardFooter } from "@/components/ui/card";
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
import { toast } from "sonner";
import { EntityManagementSkeleton } from "@/app/skeletons/EntityManagement-Skeleton";

// --- HELPERS ---
const capitalize = (s) => (s && s.charAt(0).toUpperCase() + s.slice(1)) || "";

// --- DEFAULTS ---
const defaultStatusOptions = [
  { value: "all", label: "All Statuses" },
  { value: "active", label: "Active" },
  { value: "pending", label: "Pending" },
  { value: "inactive", label: "Inactive" },
];

export const EntityManagement = ({
  entityName = "entity",
  entityPlural = "entities",
  fetchEntities,
  addEntity,
  updateEntity,
  deleteEntity,
  columns,
  statusOptions = defaultStatusOptions,
  defaultPageSize = 10,
  enableSearch = true,
  enableFilters = true,
  enableExport = true,
  customFilters,
  initialFormData = { name: "", status: "active" },
  defaultSort = { key: "name", direction: "asc" },
  headerTitle = "Management",
  headerDescription,
}) => {
  // --- STATE MANAGEMENT ---
  const [entities, setEntities] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(defaultPageSize);
  const [sortConfig, setSortConfig] = useState(defaultSort);

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const [currentEntity, setCurrentEntity] = useState(null);
  const [formData, setFormData] = useState(initialFormData);

  const entityNameCaps = capitalize(entityName);

  // --- DATA FETCHING & MUTATIONS ---
  const fetchData = async () => {
    setIsLoading(true);
    setIsError(false);
    try {
      const data = await fetchEntities();
      setEntities(data);
    } catch (error) {
      console.error(`Failed to fetch ${entityPlural}`, error);
      setIsError(true);
      toast.error(`Error loading ${entityPlural}.`);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // --- DATA PROCESSING (FILTER, SORT, PAGINATE) ---
  const processedEntities = useMemo(() => {
    let filtered = entities;
    if (statusFilter !== "all") {
      filtered = filtered.filter((entity) => entity.status === statusFilter);
    }
    if (searchQuery) {
      const lowercasedQuery = searchQuery.toLowerCase();
      filtered = filtered.filter((entity) =>
        Object.values(entity).some((val) =>
          String(val).toLowerCase().includes(lowercasedQuery)
        )
      );
    }
    const sorted = [...filtered].sort((a, b) => {
      if (a[sortConfig.key] < b[sortConfig.key])
        return sortConfig.direction === "asc" ? -1 : 1;
      if (a[sortConfig.key] > b[sortConfig.key])
        return sortConfig.direction === "asc" ? 1 : -1;
      return 0;
    });
    return sorted;
  }, [entities, searchQuery, statusFilter, sortConfig]);

  const totalPages = Math.ceil(processedEntities.length / pageSize);
  const paginatedEntities = processedEntities.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  // --- HANDLERS ---
  const requestSort = (key) => {
    setSortConfig((prevConfig) => ({
      key,
      direction:
        prevConfig.key === key && prevConfig.direction === "asc"
          ? "desc"
          : "asc",
    }));
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    if (!addEntity) return;
    setIsSubmitting(true);
    try {
      await addEntity(formData);
      toast.success(`${entityNameCaps} added successfully`);
      setIsAddDialogOpen(false);
      await fetchData();
    } catch (error) {
      toast.error(`Failed to add ${entityName}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateSubmit = async (e) => {
    e.preventDefault();
    if (!updateEntity) return;
    setIsSubmitting(true);
    try {
      await updateEntity({ ...currentEntity, ...formData });
      toast.success("Changes saved successfully");
      setIsEditDialogOpen(false);
      await fetchData();
    } catch (error) {
      toast.error(`Failed to update ${entityName}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteEntity || !currentEntity) return;
    setIsSubmitting(true);
    try {
      await deleteEntity(currentEntity.id);
      toast.error(`${entityNameCaps} removed successfully`);
      setIsDeleteDialogOpen(false);
      await fetchData();
    } catch (error) {
      toast.error(`Failed to delete ${entityName}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const openEditDialog = (entity) => {
    setCurrentEntity(entity);
    setFormData(entity);
    setIsEditDialogOpen(true);
  };

  const openDeleteDialog = (entity) => {
    setCurrentEntity(entity);
    setIsDeleteDialogOpen(true);
  };

  // --- RENDER LOGIC ---
  if (isLoading) return <EntityManagementSkeleton columns={columns} />;
  if (isError)
    return (
      <div className="p-8 text-center text-red-600">
        Error loading {entityPlural}. Please try refreshing the page.
      </div>
    );

  const visibleColumns = columns.filter((col) => col.visible !== false);

  return (
    <div className="container mx-auto px-4 flex flex-col my-6 gap-6">
      {/* Redesigned Header */}
      <div className="">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">
              {headerTitle}
            </h1>
            <p className="mt-2 text-slate-600">
              {headerDescription || `Manage all your ${entityPlural}`}
            </p>
          </div>
          {addEntity && (
            <Button
              onClick={() => {
                setFormData(initialFormData);
                setIsAddDialogOpen(true);
              }}
            >
              <Plus className="w-4 h-4 mr-2" /> Add New {entityNameCaps}
            </Button>
          )}
        </div>
      </div>

      {/* Filter Bar */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:flex lg:flex-row lg:items-center gap-4">
        {enableSearch && (
          <div className="relative lg:flex-grow">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder={`Search ${entityPlural}...`}
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        )}
        <div className="flex flex-wrap items-center gap-2">
          {enableFilters && (
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          {customFilters}
          {enableExport && (
            <Button
              variant="outline"
              onClick={() => {
                /* export logic */
              }}
            >
              <Download className="h-4 w-4 mr-2" /> Export
            </Button>
          )}
        </div>
      </div>

      {/* Content Table */}
      <div className="overflow-hidden border rounded-md">
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-slate-50">
              <TableRow>
                {visibleColumns.map((col) => (
                  <TableHead
                    key={col.key}
                    onClick={() => col.sortable && requestSort(col.key)}
                    className={col.sortable ? "cursor-pointer" : ""}
                  >
                    <div className="flex items-center gap-1">
                      {col.label}
                      {col.sortable && sortConfig.key === col.key && (
                        <ChevronDown
                          className={`h-4 w-4 transition-transform ${
                            sortConfig.direction === "desc" ? "rotate-180" : ""
                          }`}
                        />
                      )}
                    </div>
                  </TableHead>
                ))}
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedEntities.length > 0 ? (
                paginatedEntities.map((entity) => (
                  <TableRow key={entity.id} className="hover:bg-slate-50/50">
                    {visibleColumns.map((col) => (
                      <TableCell key={col.key}>
                        {col.render ? col.render(entity) : entity[col.key]}
                      </TableCell>
                    ))}
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {updateEntity && (
                            <DropdownMenuItem
                              onClick={() => openEditDialog(entity)}
                            >
                              <Edit className="mr-2 h-4 w-4" /> Edit
                            </DropdownMenuItem>
                          )}
                          {deleteEntity && (
                            <>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => openDeleteDialog(entity)}
                                className="text-red-600 focus:text-red-600"
                              >
                                <Trash className="mr-2 h-4 w-4" /> Delete
                              </DropdownMenuItem>
                            </>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={visibleColumns.length + 1}
                    className="text-center h-24 text-slate-500"
                  >
                    {`No ${entityPlural} found.`}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
        {totalPages > 1 && (
          <CardFooter className="flex items-center justify-between px-6 py-4 bg-slate-50 border-t">
            <div className="text-sm text-slate-600">
              Page {currentPage} of {totalPages}
            </div>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4 mr-1" /> Prev
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setCurrentPage((p) => Math.min(p + 1, totalPages))
                }
                disabled={currentPage === totalPages}
              >
                Next <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </CardFooter>
        )}
      </div>

      {/* Dialogs */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New {entityNameCaps}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAddSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">{entityNameCaps} Name</Label>
                <Input
                  id="name"
                  value={formData.name || ""}
                  onChange={(e) =>
                    setFormData((p) => ({ ...p, name: e.target.value }))
                  }
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) =>
                    setFormData((p) => ({ ...p, status: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsAddDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Adding..." : `Add ${entityNameCaps}`}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit {entityNameCaps}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleUpdateSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">{entityNameCaps} Name</Label>
                <Input
                  id="name"
                  value={formData.name || ""}
                  onChange={(e) =>
                    setFormData((p) => ({ ...p, name: e.target.value }))
                  }
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) =>
                    setFormData((p) => ({ ...p, status: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsEditDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Saving..." : "Save Changes"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete {entityNameCaps}</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            Are you sure you want to delete{" "}
            <span className="font-semibold">{currentEntity?.name}</span>?
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
