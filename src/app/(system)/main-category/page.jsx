"use client";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Clock, XCircle } from "lucide-react";
import { EntityManagement } from "./components/EntityManagement";

const handleResponse = async (response) => {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    console.error("API Error:", response.status, errorData);
    throw new Error(errorData.message || "An unknown API error occurred.");
  }
  return response.json();
};

const fetchMainCategories = async () => {
  console.log("Fetching categories from API...");
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/maincategory`
    );
    return await handleResponse(response);
  } catch (error) {
    console.error("Failed to fetch categories:", error);
    throw error;
  }
};

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
      method: "PUT",
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

const deleteMainCategory = async (categoryId) => {
  console.log("Deleting category via API:", categoryId);
  try {
    const response = await fetch(`/maincategory/${categoryId}`, {
      method: "DELETE",
    });

    if (response.status === 204) {
      return { id: categoryId };
    }
    return await handleResponse(response);
  } catch (error) {
    console.error("Failed to delete category:", error);
    throw error;
  }
};

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
    </Badge>
  );
};

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
      entityName="category"
      entityPlural="categories"
      headerTitle="Main Categories"
      headerDescription="Manage the main categories for your platform."
      fetchEntities={fetchMainCategories}
      addEntity={addMainCategory}
      updateEntity={updateMainCategory}
      deleteEntity={deleteMainCategory}
      columns={columns}
      initialFormData={{ name: "", status: "active" }}
      defaultSort={{ key: "name", direction: "asc" }}
    />
  );
}
