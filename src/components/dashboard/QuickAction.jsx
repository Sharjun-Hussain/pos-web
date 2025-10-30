"use client";

import {
  ShoppingCart,
  FileText,
  Package,
  Users,
  BarChart3,
  Plus,
  Barcode,
} from "lucide-react";
import Link from "next/link";

const quickActions = [
  {
    id: "pos",
    name: "Point of Sale",
    icon: ShoppingCart,
    description: "Process sales and transactions",
    color: "bg-green-500",
    soon: false,
    href: "/pos", // Added href for navigation
  },
  {
    id: "invoices",
    name: "Invoices",
    icon: FileText,
    description: "Create and manage invoices",
    color: "bg-blue-500",
    soon: false,
    href: "/invoices", // Added href for navigation
  },
  {
    id: "inventory",
    name: "Inventory",
    icon: Package,
    description: "Manage stock and products",
    color: "bg-orange-500",
    soon: false,
    href: "/inventory", // Added href for navigation
  },
  {
    id: "customers",
    name: "Customers",
    icon: Users,
    description: "Customer database",
    color: "bg-purple-500",
    soon: false,
    href: "/customers", // Added href for navigation
  },
  {
    id: "reports",
    name: "Reports",
    icon: BarChart3,
    description: "Analytics & insights",
    color: "bg-indigo-500",
    soon: false,
    href: "/reports", // Added href for navigation
  },
  {
    id: "barcodes",
    name: "Barcodes",
    icon: Barcode,
    description: "Manage Barcode for Products",
    color: "bg-gray-500",
    soon: false,
    href: "/barcodes", // Added href for navigation
  },
];

export default function QuickActions() {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">
        Quick Actions
      </h2>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {quickActions.map((action) => (
          <Link
            key={action.id}
            href={action.href}
            className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50/50 transition-all duration-200 group"
          >
            <div
              className={`p-3 rounded-lg ${action.color} text-white mb-3 group-hover:scale-110 transition-transform`}
            >
              <action.icon className="w-6 h-6" />
            </div>
            <span className="text-sm font-medium text-gray-900 text-center">
              {action.name}
            </span>
            <span className="text-xs text-gray-500 text-center mt-1">
              {action.description}
            </span>
            {action.soon && (
              <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full mt-2">
                Soon
              </span>
            )}
          </Link>
        ))}
      </div>
    </div>
  );
}
