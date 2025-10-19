// app/dashboard/categories/page.tsx
"use client";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Clock, XCircle } from "lucide-react";
import { EntityManagement } from "./components/EntityManagement";

// --- Mock API and Data ---
// This part remains the same. These are just async functions that simulate API calls.
let mockCategories = [
  { id: "cat-001", name: "Experiences", slug: "experiences", status: "active" },
  {
    id: "cat-002",
    name: "Accommodations",
    slug: "accommodations",
    status: "active",
  },
  {
    id: "cat-003",
    name: "Restaurants",
    slug: "restaurants",
    status: "inactive",
  },
  { id: "cat-004", name: "Transport", slug: "transport", status: "active" },
  {
    id: "cat-005",
    name: "Wellness & Spa",
    slug: "wellness-spa",
    status: "pending",
  },
  { id: "cat-006", name: "Events", slug: "events", status: "active" },
];

const fetchMainCategories = async () => {
  console.log("Fetching categories...");
  await new Promise((resolve) => setTimeout(resolve, 500)); // Simulate network delay
  // In a real app, you might throw an error: if (!res.ok) throw new Error(...)
  return [...mockCategories]; // Return a copy
};

const addMainCategory = async (newCategory) => {
  console.log("Adding category:", newCategory);
  await new Promise((resolve) => setTimeout(resolve, 500));
  const category = {
    id: `cat-${Math.random().toString(36).substr(2, 9)}`,
    slug: newCategory.name.toLowerCase().replace(/\s+/g, "-"),
    ...newCategory,
  };
  mockCategories.push(category);
  return category;
};

const updateMainCategory = async (updatedCategory) => {
  console.log("Updating category:", updatedCategory);
  await new Promise((resolve) => setTimeout(resolve, 500));
  mockCategories = mockCategories.map((cat) =>
    cat.id === updatedCategory.id ? updatedCategory : cat
  );
  return updatedCategory;
};

const deleteMainCategory = async (categoryId) => {
  console.log("Deleting category:", categoryId);
  await new Promise((resolve) => setTimeout(resolve, 500));
  mockCategories = mockCategories.filter((cat) => cat.id !== categoryId);
  return categoryId;
};
// --- End Mock API ---

const renderStatusBadge = (status) => {
  const statusConfig = {
    active: {
      icon: CheckCircle2,
      className: "bg-emerald-100 text-emerald-800",
    },
    pending: { icon: Clock, className: "bg-amber-100 text-amber-800" },
    inactive: { icon: XCircle, className: "bg-rose-100 text-rose-800" },
  };
  const config = statusConfig[status] || {};
  const Icon = config.icon;
  return (
    <Badge className={`${config.className} hover:${config.className} border-0`}>
      {Icon && <Icon className="mr-1 h-3 w-3" />} `{status}
    </Badge>
  );
};

// The page component can now be used directly without any providers.
export default function MainCategoryPage() {
  const columns = [
    {
      key: "name",
      label: "Category Name",
      sortable: true,
    },
    {
      key: "slug",
      label: "Slug",
    },
    {
      key: "status",
      label: "Status",
      sortable: true,
      render: (entity) => renderStatusBadge(entity.status),
    },
  ];

  return (
    <EntityManagement
      // Entity Configuration
      entityName="category"
      entityPlural="categories"
      headerTitle="Main Categories"
      headerDescription="Manage the main categories for your platform."
      // Data Functions
      fetchEntities={fetchMainCategories}
      addEntity={addMainCategory}
      updateEntity={updateMainCategory}
      deleteEntity={deleteMainCategory}
      // Table and Form Configuration
      columns={columns}
      initialFormData={{ name: "", status: "active" }}
      defaultSort={{ key: "name", direction: "asc" }}
    />
  );
}
