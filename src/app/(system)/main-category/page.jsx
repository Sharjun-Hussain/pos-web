"use client";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Clock, XCircle } from "lucide-react";
// Attempting to fix the component import path
import { EntityManagement } from "../components/EntityManagement";

// --- Live API Functions ---

// Helper function for handling API responses
const handleResponse = async (response) => {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({})); // Try to parse error, fallback to empty obj
    console.error("API Error:", response.status, errorData);
    // In a real app, you'd throw an error to be caught by React Query or a try/catch block
    // For EntityManagement, we might need to adjust based on how it handles errors
    throw new Error(errorData.message || "An unknown API error occurred.");
  }
  return response.json(); // Return the parsed JSON data
};

// GET /maincategory
const fetchMainCategories = async () => {
  console.log("Fetching categories from API...");
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/maincategory`
    );
    return await handleResponse(response);
  } catch (error) {
    console.error("Failed to fetch categories:", error);
    throw error; // Re-throw for the component to handle
  }
};

// POST /maincategory
const addMainCategory = async (newCategory) => {
  console.log("Adding category via API:", newCategory);
  try {
    const response = await fetch("/maincategory", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(newCategory),
    });
    return await handleResponse(response);
  } catch (error) {
    console.error("Failed to add category:", error);
    throw error;
  }
};

// PUT /maincategory/:id
const updateMainCategory = async (updatedCategory) => {
  console.log("Updating category via API:", updatedCategory);
  if (!updatedCategory.id) {
    throw new Error("Cannot update category without an ID.");
  }

  try {
    const response = await fetch(`/maincategory/${updatedCategory.id}`, {
      method: "PUT", // or PATCH if your API supports partial updates
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updatedCategory),
    });
    return await handleResponse(response);
  } catch (error) {
    console.error("Failed to update category:", error);
    throw error;
  }
};

// DELETE /maincategory/:id
const deleteMainCategory = async (categoryId) => {
  console.log("Deleting category via API:", categoryId);
  try {
    const response = await fetch(`/maincategory/${categoryId}`, {
      method: "DELETE",
    });
    // DELETE might return 204 No Content, or the deleted object.
    // Adjust handleResponse if 204 is expected
    if (response.status === 204) {
      return { id: categoryId }; // Return something to confirm deletion
    }
    return await handleResponse(response);
  } catch (error) {
    console.error("Failed to delete category:", error);
    throw error;
  }
};
// --- End API Functions ---

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
      {Icon && <Icon className="mr-1 h-3 w-3" />}
      {/* Fixed a small template literal issue here, was `status` inside backticks */}
      {status}
    </Badge>
  );
};

// The page component remains the same, just consuming the new live API functions.
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
      // Data Functions (now pointing to live API calls)
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
