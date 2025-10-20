"use client";

import { useState } from "react";
import { Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/page-header";
import { CustomersTable } from "./customers-table";
import { AddCustomerDialog } from "./add-customer-dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CustomerStats } from "./customer-stats";

const initialCustomers = [
  {
    id: "1",
    name: "John Smith",
    email: "john.smith@email.com",
    phone: "+1 (555) 123-4567",
    address: "123 Main St, New York, NY 10001",
    loyaltyPoints: 450,
    totalSpent: 1250.75,
    visits: 28,
    lastVisit: "2025-09-28",
    status: "active",
  },
  {
    id: "2",
    name: "Sarah Johnson",
    email: "sarah.j@email.com",
    phone: "+1 (555) 234-5678",
    address: "456 Oak Ave, Los Angeles, CA 90001",
    loyaltyPoints: 820,
    totalSpent: 2340.5,
    visits: 45,
    lastVisit: "2025-09-29",
    status: "active",
  },
  {
    id: "3",
    name: "Michael Brown",
    email: "m.brown@email.com",
    phone: "+1 (555) 345-6789",
    address: "789 Pine Rd, Chicago, IL 60601",
    loyaltyPoints: 120,
    totalSpent: 450.25,
    visits: 12,
    lastVisit: "2025-09-15",
    status: "active",
  },
  {
    id: "4",
    name: "Emily Davis",
    email: "emily.davis@email.com",
    phone: "+1 (555) 456-7890",
    address: "321 Elm St, Houston, TX 77001",
    loyaltyPoints: 1250,
    totalSpent: 3890.0,
    visits: 67,
    lastVisit: "2025-09-30",
    status: "active",
  },
  {
    id: "5",
    name: "David Wilson",
    email: "d.wilson@email.com",
    phone: "+1 (555) 567-8901",
    address: "654 Maple Dr, Phoenix, AZ 85001",
    loyaltyPoints: 50,
    totalSpent: 180.5,
    visits: 5,
    lastVisit: "2025-08-20",
    status: "inactive",
  },
];

export function CustomersManagement() {
  const [customers, setCustomers] = useState(initialCustomers);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");

  const filteredCustomers = customers.filter((customer) => {
    const matchesSearch =
      searchQuery === "" ||
      customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customer.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customer.phone.includes(searchQuery);

    const matchesTab =
      activeTab === "all" ||
      (activeTab === "active" && customer.status === "active") ||
      (activeTab === "inactive" && customer.status === "inactive") ||
      (activeTab === "vip" && customer.loyaltyPoints >= 500);

    return matchesSearch && matchesTab;
  });

  const addCustomer = (customer) => {
    const newCustomer = {
      ...customer,
      id: String(customers.length + 1),
    };
    setCustomers([...customers, newCustomer]);
  };

  const updateCustomer = (id, updates) => {
    setCustomers(
      customers.map((c) => (c.id === id ? { ...c, ...updates } : c))
    );
  };

  const deleteCustomer = (id) => {
    setCustomers(customers.filter((c) => c.id !== id));
  };

  return (
    <div className="flex h-screen flex-col bg-background">
      <PageHeader
        title="Customer Management"
        description="Manage customer information and loyalty programs"
        action={
          <AddCustomerDialog onAdd={addCustomer}>
            <Button size="lg">
              <Plus className="mr-2 h-5 w-5" />
              Add Customer
            </Button>
          </AddCustomerDialog>
        }
      />
      {/* <PageHeader
        title="Customer Management"
        description="Manage customer information and loyalty programs"
        action={
          <AddCustomerDialog onAdd={addCustomer}>
            <Button size="lg">
              <Plus className="mr-2 h-5 w-5" />
              Add Customer
            </Button>
          </AddCustomerDialog>
        }
      /> */}

      <div className="flex-1 overflow-hidden p-8">
        <CustomerStats customers={customers} />

        <div className="mt-6">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <TabsList>
                <TabsTrigger value="all">All Customers</TabsTrigger>
                <TabsTrigger value="active">Active</TabsTrigger>
                <TabsTrigger value="vip">VIP</TabsTrigger>
                <TabsTrigger value="inactive">Inactive</TabsTrigger>
              </TabsList>

              <div className="relative flex-1 sm:max-w-sm">
                <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search customers..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="h-11 pl-10"
                />
              </div>
            </div>

            <TabsContent value={activeTab} className="mt-0">
              <CustomersTable
                customers={filteredCustomers}
                onUpdate={updateCustomer}
                onDelete={deleteCustomer}
              />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
