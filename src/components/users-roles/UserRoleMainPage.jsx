"use client";

import { useState } from "react";
import {
  Search,
  Plus,
  MoreHorizontal,
  Shield,
  Users,
  Lock,
  Check,
  UserPlus,
  AlertCircle,
  Save,
  RotateCcw,
  Settings,
  DollarSign,
  Package,
  Trash2,
  Pencil,
  Code, // Icon for Dev Mode
  X,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Switch } from "@/components/ui/switch";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";

// --- MOCK DATA ---

const INITIAL_STRUCTURE = [
  {
    id: "cat_sales",
    category: "Sales & Deals",
    icon: <DollarSign className="h-5 w-5 text-green-600" />,
    description: "Manage access to pipelines, deals, and revenue data.",
    permissions: [
      { id: "view_deals", label: "View deals" },
      { id: "edit_deals", label: "Add and edit deals" },
      { id: "delete_deals", label: "Delete deals" },
      { id: "export_deals", label: "Export deals data" },
    ],
  },
  {
    id: "cat_inv",
    category: "Inventory & Products",
    icon: <Package className="h-5 w-5 text-blue-600" />,
    description: "Control stock adjustments, product creation, and viewing costs.",
    permissions: [
      { id: "view_products", label: "View product catalog" },
      { id: "manage_stock", label: "Adjust stock levels (GRN/Adjustments)" },
      { id: "edit_products", label: "Create and edit products" },
      { id: "view_cost", label: "View product cost prices" },
    ],
  },
  {
    id: "cat_sys",
    category: "Admin & Settings",
    icon: <Settings className="h-5 w-5 text-slate-600" />,
    description: "System-wide configurations and user management.",
    permissions: [
      { id: "manage_users", label: "Manage users and roles" },
      { id: "manage_billing", label: "Access billing and invoices" },
      { id: "system_settings", label: "Configure system settings" },
    ],
  },
];

const INITIAL_ROLES = [
  { id: "admin", name: "Administrator", description: "Full access.", usersCount: 2, isSystem: true, color: "bg-purple-100 text-purple-700 border-purple-200" },
  { id: "manager", name: "Store Manager", description: "Operations management.", usersCount: 4, color: "bg-blue-100 text-blue-700 border-blue-200" },
  { id: "cashier", name: "Cashier", description: "Sales processing.", usersCount: 12, color: "bg-emerald-100 text-emerald-700 border-emerald-200" },
];

const INITIAL_USERS = [
  { id: "u1", name: "Alex Johnson", email: "alex@company.com", roleId: "admin", status: "active", lastLogin: "2 mins ago" },
  { id: "u2", name: "Sarah Smith", email: "sarah@company.com", roleId: "manager", status: "active", lastLogin: "1 hour ago" },
];

const INITIAL_PERMISSIONS = {
  admin: { view_deals: true, edit_deals: true, delete_deals: true, view_products: true, manage_stock: true, manage_users: true, export_deals: true, view_cost: true, manage_billing: true, system_settings: true },
  manager: { view_deals: true, edit_deals: true, delete_deals: false, view_products: true, manage_stock: true, manage_users: false, export_deals: true, view_cost: true },
  cashier: { view_deals: false, edit_deals: false, view_products: true, manage_stock: false, manage_users: false, export_deals: false, view_cost: false },
};

export default function UserManagement() {
  const [isDevMode, setIsDevMode] = useState(false); // THE HIDDEN TOGGLE
  
  const [users, setUsers] = useState(INITIAL_USERS);
  const [roles, setRoles] = useState(INITIAL_ROLES);
  const [permissionStructure, setPermissionStructure] = useState(INITIAL_STRUCTURE);
  const [permissions, setPermissions] = useState(INITIAL_PERMISSIONS);
  
  // CRUD States
  const [isDirty, setIsDirty] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isUserDialogOpen, setIsUserDialogOpen] = useState(false);
  const [isRoleDialogOpen, setIsRoleDialogOpen] = useState(false);
  
  // Permission Definition Dialog States
  const [isPermDialogOpen, setIsPermDialogOpen] = useState(false);
  const [editingPerm, setEditingPerm] = useState(null); // null = create, object = edit
  const [targetCategory, setTargetCategory] = useState(null);
  const [permForm, setPermForm] = useState({ id: "", label: "" });

  const [userSearch, setUserSearch] = useState("");

  // --- PERMISSION VALUES (Values Matrix) ---

  const handleTogglePermission = (roleId, permId) => {
    const newPermissions = {
      ...permissions,
      [roleId]: {
        ...permissions[roleId],
        [permId]: !permissions[roleId]?.[permId],
      },
    };
    setPermissions(newPermissions);
    setIsDirty(true);
  };

  // --- PERMISSION DEFINITIONS (Dev Mode CRUD) ---

  const openCreatePermDialog = (categoryId) => {
    setTargetCategory(categoryId);
    setEditingPerm(null);
    setPermForm({ id: "", label: "" });
    setIsPermDialogOpen(true);
  };

  const openEditPermDialog = (categoryId, perm) => {
    setTargetCategory(categoryId);
    setEditingPerm(perm);
    setPermForm({ id: perm.id, label: perm.label });
    setIsPermDialogOpen(true);
  };

  const handleDeletePermission = (categoryId, permId) => {
    if (!confirm("Are you sure you want to delete this permission definition? This will remove it for all roles.")) return;

    const newStructure = permissionStructure.map(cat => {
      if (cat.id === categoryId) {
        return { ...cat, permissions: cat.permissions.filter(p => p.id !== permId) };
      }
      return cat;
    });
    setPermissionStructure(newStructure);
    setIsDirty(true);
  };

  const handleSavePermDefinition = () => {
    const newStructure = permissionStructure.map(cat => {
      if (cat.id === targetCategory) {
        if (editingPerm) {
          // Edit existing
          return {
            ...cat,
            permissions: cat.permissions.map(p => p.id === editingPerm.id ? { ...p, ...permForm } : p)
          };
        } else {
          // Create new
          // We also need to initialize this permission as FALSE for all roles in the permissions state
          const newPermissionId = permForm.id.toLowerCase().replace(/\s+/g, '_');
          return {
            ...cat,
            permissions: [...cat.permissions, { id: newPermissionId, label: permForm.label }]
          };
        }
      }
      return cat;
    });

    setPermissionStructure(newStructure);
    setIsPermDialogOpen(false);
    setIsDirty(true); // Mark as dirty so user saves the new structure to backend
  };

  // --- GENERAL SAVE ---
  const handleSaveAll = async () => {
    setIsSaving(true);
    await new Promise(resolve => setTimeout(resolve, 800));
    setIsDirty(false);
    setIsSaving(false);
    alert("Changes saved successfully!");
  };

  // --- HELPER ---
  const getRoleName = (id) => roles.find((r) => r.id === id)?.name || "Unknown";
  const filteredUsers = users.filter((u) => u.name.toLowerCase().includes(userSearch.toLowerCase()) || u.email.toLowerCase().includes(userSearch.toLowerCase()));

  return (
    <div className="flex-1 space-y-6 p-6 bg-gray-50/30 min-h-screen font-sans text-slate-900 relative">
      
      {/* --- Header --- */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">User Management</h1>
          <p className="text-slate-500">Manage your team, define roles, and control access security.</p>
        </div>
        <div className="flex items-center gap-3">
           {/* DEVELOPER MODE TOGGLE (Hidden for normal users in real app) */}
           <div className="flex items-center gap-2 mr-4 px-3 py-1.5 bg-slate-100 rounded-md border border-slate-200">
              <Code className="h-4 w-4 text-slate-500" />
              <span className="text-xs font-medium text-slate-600">Dev Mode</span>
              <Switch 
                className="scale-75" 
                checked={isDevMode} 
                onCheckedChange={setIsDevMode} 
              />
           </div>

           <Button variant="outline" className="bg-white shadow-sm">
             <Shield className="mr-2 h-4 w-4 text-slate-500" /> Audit Log
           </Button>
           <Button className="bg-blue-600 hover:bg-blue-700 shadow-sm" onClick={() => setIsUserDialogOpen(true)}>
             <UserPlus className="mr-2 h-4 w-4" /> Invite User
           </Button>
        </div>
      </div>

      <Tabs defaultValue="users" className="space-y-6">
        <TabsList className="bg-white border shadow-sm h-12 p-1 w-full max-w-md grid grid-cols-3">
          <TabsTrigger value="users" className="font-medium">Users</TabsTrigger>
          <TabsTrigger value="roles" className="font-medium">Roles</TabsTrigger>
          <TabsTrigger value="permissions" className="font-medium">Permissions</TabsTrigger>
        </TabsList>

        {/* ================= USERS TAB ================= */}
        <TabsContent value="users" className="space-y-6">
          <Card className="border-none shadow-sm bg-white">
            <CardHeader className="border-b border-slate-100 px-6 py-4">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-base font-semibold">Active Users ({users.length})</CardTitle>
                    <div className="relative w-64">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400"/>
                        <Input 
                            placeholder="Search..." 
                            className="pl-9 h-9 bg-slate-50 border-slate-200 focus:bg-white transition-colors"
                            value={userSearch}
                            onChange={(e) => setUserSearch(e.target.value)}
                        />
                    </div>
                </div>
            </CardHeader>
            <CardContent className="p-0">
                <Table>
                    <TableHeader className="bg-slate-50/50">
                        <TableRow>
                            <TableHead className="pl-6 w-[250px]">User</TableHead>
                            <TableHead>Role</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Last Login</TableHead>
                            <TableHead className="text-right pr-6">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredUsers.map((user) => (
                            <TableRow key={user.id} className="group hover:bg-slate-50 border-b border-slate-100 last:border-0">
                                <TableCell className="pl-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <Avatar className="h-9 w-9 border">
                                            <AvatarImage src={user.avatar} />
                                            <AvatarFallback className="bg-blue-50 text-blue-700 font-semibold">{user.name.charAt(0)}</AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <div className="font-medium text-slate-900">{user.name}</div>
                                            <div className="text-xs text-slate-500">{user.email}</div>
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <Badge variant="outline" className="bg-white text-slate-700 font-normal border-slate-300">
                                        {getRoleName(user.roleId)}
                                    </Badge>
                                </TableCell>
                                <TableCell>
                                    {user.status === "active" && <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-none shadow-none font-medium">Active</Badge>}
                                    {user.status === "invited" && <Badge className="bg-blue-50 text-blue-700 hover:bg-blue-50 border-none shadow-none font-medium">Invited</Badge>}
                                    {user.status === "inactive" && <Badge className="bg-slate-100 text-slate-600 hover:bg-slate-100 border-none shadow-none font-medium">Inactive</Badge>}
                                </TableCell>
                                <TableCell className="text-slate-500 text-sm">{user.lastLogin}</TableCell>
                                <TableCell className="text-right pr-6">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <MoreHorizontal className="h-4 w-4 text-slate-500" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuLabel>User Actions</DropdownMenuLabel>
                                            <DropdownMenuSeparator />
                                            <DropdownMenuItem>Edit Details</DropdownMenuItem>
                                            <DropdownMenuItem>Reset Password</DropdownMenuItem>
                                            <DropdownMenuSeparator />
                                            <DropdownMenuItem className="text-red-600">Deactivate User</DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ================= ROLES TAB ================= */}
        <TabsContent value="roles" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {roles.map((role) => (
                    <Card key={role.id} className="group hover:shadow-md transition-all cursor-pointer border-slate-200 hover:border-blue-300">
                        <CardHeader className="pb-3">
                            <div className="flex justify-between items-start">
                                <Badge variant="outline" className={`mb-2 ${role.color}`}>
                                    {role.name}
                                </Badge>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="icon" className="h-8 w-8 -mr-2 text-slate-400">
                                            <MoreHorizontal className="h-4 w-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuItem onClick={() => setIsRoleDialogOpen(true)}>Edit Role</DropdownMenuItem>
                                        {!role.isSystem && <DropdownMenuItem className="text-red-600">Delete Role</DropdownMenuItem>}
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                            <CardTitle className="text-lg font-bold text-slate-900">{role.name}</CardTitle>
                            <CardDescription className="line-clamp-2 h-10 text-sm mt-1">{role.description}</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center justify-between text-sm mt-2 pt-4 border-t border-slate-100">
                                <span className="text-slate-500 font-medium">Active Users</span>
                                <span className="font-bold text-slate-900">{role.usersCount}</span>
                            </div>
                        </CardContent>
                    </Card>
                ))}

                <button 
                    onClick={() => setIsRoleDialogOpen(true)}
                    className="border-2 border-dashed border-slate-200 rounded-xl p-6 flex flex-col items-center justify-center text-center hover:border-blue-400 hover:bg-blue-50/50 transition-all min-h-[200px]"
                >
                    <div className="h-12 w-12 rounded-full bg-white border shadow-sm flex items-center justify-center mb-4 text-blue-600">
                        <Plus className="h-6 w-6"/>
                    </div>
                    <h3 className="font-semibold text-slate-900">Create New Role</h3>
                    <p className="text-sm text-slate-500 mt-1 max-w-[200px]">Define permissions for a new team segment.</p>
                </button>
            </div>
        </TabsContent>

        {/* ================= PERMISSIONS TAB (CRUD ENABLED) ================= */}
        <TabsContent value="permissions" className="space-y-8">
            
            {/* Info Box */}
            <div className="flex items-center justify-between bg-blue-50 p-4 rounded-lg border border-blue-100 text-blue-900">
                <div className="flex items-center gap-3">
                    <Lock className="h-5 w-5 text-blue-600" />
                    <div>
                        <h3 className="font-semibold text-sm">Permission Matrix</h3>
                        <p className="text-xs text-blue-700">Toggle permissions to define what each role can access. {isDevMode && <strong>Dev Mode Enabled.</strong>}</p>
                    </div>
                </div>
            </div>

            {/* Categories */}
            {permissionStructure.map((section) => (
                <Card key={section.id} className="border-none shadow-sm overflow-hidden bg-white group/card">
                    <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-white rounded-md border shadow-sm">
                                {section.icon}
                            </div>
                            <div>
                                <h3 className="font-bold text-slate-900 text-base">{section.category}</h3>
                                <p className="text-xs text-slate-500">{section.description}</p>
                            </div>
                        </div>
                    </div>

                    <CardContent className="p-0">
                        <Table>
                            <TableHeader>
                                <TableRow className="hover:bg-transparent border-b border-slate-100">
                                    <TableHead className="w-[40%] pl-6 py-3 text-xs font-bold uppercase tracking-wider text-slate-500">Capability</TableHead>
                                    {roles.map(role => (
                                        <TableHead key={role.id} className="text-center w-[20%] py-3 border-l border-slate-100">
                                            <span className={`text-xs font-bold px-2 py-1 rounded-full ${role.color}`}>
                                                {role.name}
                                            </span>
                                        </TableHead>
                                    ))}
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {section.permissions.map((perm) => (
                                    <TableRow key={perm.id} className="hover:bg-slate-50 border-b border-slate-50 last:border-0 group/row">
                                        <TableCell className="pl-6 py-4 font-medium text-slate-700">
                                            <div className="flex items-center gap-2">
                                                {perm.label}
                                                {/* DEV MODE: Edit/Delete Icons */}
                                                {isDevMode && (
                                                    <div className="opacity-0 group-hover/row:opacity-100 transition-opacity flex items-center gap-1 ml-2">
                                                        <Button 
                                                            variant="ghost" size="icon" className="h-6 w-6 text-slate-400 hover:text-blue-600"
                                                            onClick={() => openEditPermDialog(section.id, perm)}
                                                        >
                                                            <Pencil className="h-3 w-3" />
                                                        </Button>
                                                        <Button 
                                                            variant="ghost" size="icon" className="h-6 w-6 text-slate-400 hover:text-red-600"
                                                            onClick={() => handleDeletePermission(section.id, perm.id)}
                                                        >
                                                            <Trash2 className="h-3 w-3" />
                                                        </Button>
                                                    </div>
                                                )}
                                            </div>
                                            {isDevMode && <div className="text-[10px] text-slate-400 font-mono">{perm.id}</div>}
                                        </TableCell>
                                        {roles.map((role) => {
                                            const isAllowed = permissions[role.id]?.[perm.id];
                                            const isSystemAdmin = role.id === "admin"; 

                                            return (
                                                <TableCell key={`${role.id}-${perm.id}`} className="text-center border-l border-slate-100">
                                                    <div className="flex justify-center">
                                                        {isSystemAdmin ? (
                                                            <Check className="h-5 w-5 text-slate-300" />
                                                        ) : (
                                                            <Switch 
                                                                checked={isAllowed || false}
                                                                onCheckedChange={() => handleTogglePermission(role.id, perm.id)}
                                                                className="data-[state=checked]:bg-blue-600"
                                                            />
                                                        )}
                                                    </div>
                                                </TableCell>
                                            );
                                        })}
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                        
                        {/* DEV MODE: Add Permission Button */}
                        {isDevMode && (
                            <div className="p-3 bg-slate-50 border-t border-slate-100 flex justify-center">
                                <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    className="text-blue-600 hover:bg-blue-50 hover:text-blue-700 dashed border border-transparent hover:border-blue-200 w-full"
                                    onClick={() => openCreatePermDialog(section.id)}
                                >
                                    <Plus className="h-4 w-4 mr-2" /> Add Permission to {section.category}
                                </Button>
                            </div>
                        )}
                    </CardContent>
                </Card>
            ))}
            
            <div className="h-20"></div> 
        </TabsContent>
      </Tabs>

      {/* --- FLOATING SAVE BAR --- */}
      {isDirty && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-full max-w-3xl z-50 px-4 animate-in slide-in-from-bottom-4 fade-in duration-300">
            <div className="bg-slate-900 text-white p-4 rounded-xl shadow-2xl flex items-center justify-between border border-slate-700">
                <div className="flex items-center gap-3">
                    <div className="bg-amber-500 h-2 w-2 rounded-full animate-pulse"></div>
                    <div>
                        <p className="font-semibold text-sm">Unsaved Changes</p>
                        <p className="text-xs text-slate-400">You have modified settings.</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <Button 
                        variant="ghost" size="sm" 
                        onClick={() => setIsDirty(false)}
                        className="text-slate-300 hover:text-white hover:bg-slate-800"
                    >
                        <RotateCcw className="mr-2 h-3 w-3" /> Reset
                    </Button>
                    <Button 
                        size="sm" 
                        onClick={handleSaveAll}
                        className="bg-white text-slate-900 hover:bg-slate-100 font-semibold"
                        disabled={isSaving}
                    >
                        {isSaving ? "Saving..." : "Save Changes"}
                    </Button>
                </div>
            </div>
        </div>
      )}

      {/* --- DIALOG: ADD/EDIT PERMISSION (DEV ONLY) --- */}
      <Dialog open={isPermDialogOpen} onOpenChange={setIsPermDialogOpen}>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>{editingPerm ? "Edit Permission" : "Define New Permission"}</DialogTitle>
                <DialogDescription>
                    This action modifies the system configuration. Use caution.
                </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
                <div className="space-y-2">
                    <Label>Permission ID (System Slug)</Label>
                    <Input 
                        placeholder="e.g. view_analytics" 
                        value={permForm.id}
                        onChange={(e) => setPermForm({...permForm, id: e.target.value})}
                        disabled={!!editingPerm} // Cannot change ID when editing
                        className="font-mono text-sm"
                    />
                    <p className="text-[10px] text-slate-500">Unique identifier used in code checks.</p>
                </div>
                <div className="space-y-2">
                    <Label>Display Label</Label>
                    <Input 
                        placeholder="e.g. View Analytics Dashboard" 
                        value={permForm.label}
                        onChange={(e) => setPermForm({...permForm, label: e.target.value})}
                    />
                </div>
            </div>
            <DialogFooter>
                <Button variant="ghost" onClick={() => setIsPermDialogOpen(false)}>Cancel</Button>
                <Button onClick={handleSavePermDefinition}>{editingPerm ? "Update" : "Create"}</Button>
            </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* --- DIALOG: INVITE USER --- */}
      <Dialog open={isUserDialogOpen} onOpenChange={setIsUserDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
            <DialogHeader><DialogTitle>Invite Team Member</DialogTitle></DialogHeader>
            <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2"><Label>First Name</Label><Input placeholder="Jane" /></div>
                    <div className="space-y-2"><Label>Last Name</Label><Input placeholder="Doe" /></div>
                </div>
                <div className="space-y-2"><Label>Email</Label><Input type="email" placeholder="jane@example.com" /></div>
                <div className="space-y-2"><Label>Role</Label><Select><SelectTrigger><SelectValue placeholder="Select Role" /></SelectTrigger><SelectContent>{roles.map(r => <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>)}</SelectContent></Select></div>
            </div>
            <DialogFooter><Button variant="ghost" onClick={() => setIsUserDialogOpen(false)}>Cancel</Button><Button className="bg-blue-600">Send Invite</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      {/* --- DIALOG: ROLE --- */}
      <Dialog open={isRoleDialogOpen} onOpenChange={setIsRoleDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
            <DialogHeader><DialogTitle>Create Role</DialogTitle></DialogHeader>
            <div className="space-y-4 py-4">
                <div className="space-y-2"><Label>Role Name</Label><Input placeholder="e.g. Marketing Manager" /></div>
                <div className="space-y-2"><Label>Description</Label><Input placeholder="Access level description..." /></div>
            </div>
            <DialogFooter><Button variant="ghost" onClick={() => setIsRoleDialogOpen(false)}>Cancel</Button><Button>Create Role</Button></DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  );
}