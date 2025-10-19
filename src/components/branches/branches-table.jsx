"use client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Edit, Trash2, Eye, Building2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const mockBranches = [
  {
    id: "1",
    clientId: "client-1",
    name: "Main Branch",
    code: "MAIN",
    type: "main",
    address: "123 Business Street, New York, NY 10001",
    phone: "+1 (555) 123-4567",
    email: "main@business.com",
    manager: "John Doe",
    status: "active",
    settings: {
      allowInventoryTransfer: true,
      syncWithMain: true,
      canManageUsers: true,
    },
    createdAt: new Date("2024-01-01"),
  },
  {
    id: "2",
    clientId: "client-1",
    name: "Downtown Branch",
    code: "DT01",
    type: "sub",
    parentBranchId: "1",
    address: "456 Market Street, New York, NY 10002",
    phone: "+1 (555) 234-5678",
    email: "downtown@business.com",
    manager: "Jane Smith",
    status: "active",
    settings: {
      allowInventoryTransfer: true,
      syncWithMain: true,
      canManageUsers: false,
    },
    createdAt: new Date("2024-02-15"),
  },
  {
    id: "3",
    clientId: "client-1",
    name: "Uptown Branch",
    code: "UT01",
    type: "sub",
    parentBranchId: "1",
    address: "789 Park Avenue, New York, NY 10003",
    phone: "+1 (555) 345-6789",
    email: "uptown@business.com",
    manager: "Mike Johnson",
    status: "active",
    settings: {
      allowInventoryTransfer: true,
      syncWithMain: true,
      canManageUsers: false,
    },
    createdAt: new Date("2024-03-20"),
  },
];

export function BranchesTable({ searchQuery }) {
  const filteredBranches = mockBranches.filter(
    (branch) =>
      branch.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      branch.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      branch.manager.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Branch</TableHead>
            <TableHead>Code</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Manager</TableHead>
            <TableHead>Contact</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredBranches.map((branch) => (
            <TableRow key={branch.id}>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <div className="font-medium">{branch.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {branch.address}
                    </div>
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <Badge variant="outline">{branch.code}</Badge>
              </TableCell>
              <TableCell>
                <Badge
                  variant={branch.type === "main" ? "default" : "secondary"}
                >
                  {branch.type}
                </Badge>
              </TableCell>
              <TableCell>{branch.manager}</TableCell>
              <TableCell>
                <div className="text-sm">
                  <div>{branch.phone}</div>
                  <div className="text-muted-foreground">{branch.email}</div>
                </div>
              </TableCell>
              <TableCell>
                <Badge
                  variant={branch.status === "active" ? "default" : "secondary"}
                >
                  {branch.status}
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>
                      <Eye className="mr-2 h-4 w-4" />
                      View Details
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Edit className="mr-2 h-4 w-4" />
                      Edit Branch
                    </DropdownMenuItem>
                    <DropdownMenuItem className="text-destructive">
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete Branch
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
