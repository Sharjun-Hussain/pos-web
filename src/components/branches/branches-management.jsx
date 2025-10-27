"use client";

import { useState } from "react";
import { DataTable } from "@/components/branches/data-table";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  PlusCircle,
  Download,
  Loader2,
  Building2,
  User,
  MapPin,
} from "lucide-react";
import Link from "next/link";
import { columns } from "./branches-column";

// Mock Data for Branches
const mockBranches = [
  {
    id: "branch_1",
    name: "Headquarters",
    location: { city: "Frankfurt", country: "Germany" },
    manager: "Alice Johnson",
    staffCount: 35,
    status: "active",
  },
  {
    id: "branch_2",
    name: "Westside Hub",
    location: { city: "Berlin", country: "Germany" },
    manager: "Bob Williams",
    staffCount: 18,
    status: "active",
  },
  {
    id: "branch_3",
    name: "Innovation Center",
    location: { city: "Munich", country: "Germany" },
    manager: "Charlie Brown",
    staffCount: 22,
    status: "active",
  },
  {
    id: "branch_4",
    name: "Logistics Dept.",
    location: { city: "Hamburg", country: "Germany" },
    manager: "Diana Prince",
    staffCount: 12,
    status: "inactive",
  },
  {
    id: "branch_5",
    name: "Paris Office",
    location: { city: "Paris", country: "France" },
    manager: "Eve Adams",
    staffCount: 15,
    status: "active",
  },
];

// Calculated Statistics for Branches
const branchStats = {
  totalBranches: mockBranches.length,
  activeBranches: mockBranches.filter((branch) => branch.status === "active")
    .length,
  totalStaff: mockBranches.reduce((acc, branch) => acc + branch.staffCount, 0),
  locations: new Set(mockBranches.map((branch) => branch.location.city)).size,
};

export default function BranchesPage() {
  const [isNavigating, setIsNavigating] = useState(false);

  return (
    <div className="hidden h-full flex-1 flex-col space-y-6 p-6 md:flex">
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">
            Branch Management
          </h1>
          <p className="text-muted-foreground">
            Manage all branches across your organization
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            Export
          </Button>
          <Link href="/branches/new" passHref>
            <Button
              onClick={() => setIsNavigating(true)}
              disabled={isNavigating}
              className="gap-2"
            >
              {isNavigating ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <PlusCircle className="h-4 w-4" />
              )}
              Add Branch
            </Button>
          </Link>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Branches
            </CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {branchStats.totalBranches}
            </div>
            <p className="text-xs text-muted-foreground">
              Across all locations
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Active Branches
            </CardTitle>
            <Building2 className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {branchStats.activeBranches}
            </div>
            <p className="text-xs text-muted-foreground">
              Currently operational
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Staff</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{branchStats.totalStaff}</div>
            <p className="text-xs text-muted-foreground">
              Employees across all branches
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Locations</CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{branchStats.locations}</div>
            <p className="text-xs text-muted-foreground">Unique cities</p>
          </CardContent>
        </Card>
      </div>

      {/* Branches Table Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>All Branches</CardTitle>
              <CardDescription>
                View and manage branch details and status.
              </CardDescription>
            </div>
            <div className="text-sm text-muted-foreground">
              Showing {mockBranches.length} branches
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <DataTable data={mockBranches} columns={columns} />
        </CardContent>
      </Card>
    </div>
  );
}
