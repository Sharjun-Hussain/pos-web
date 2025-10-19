"use client";

import { Users, TrendingUp, Award, DollarSign } from "lucide-react";
import { Card } from "@/components/ui/card";

export function CustomerStats({ customers }) {
  const totalCustomers = customers.length;
  const activeCustomers = customers.filter((c) => c.status === "active").length;
  const vipCustomers = customers.filter((c) => c.loyaltyPoints >= 500).length;
  const totalRevenue = customers.reduce((sum, c) => sum + c.totalSpent, 0);
  const avgSpent = totalCustomers > 0 ? totalRevenue / totalCustomers : 0;

  const stats = [
    {
      label: "Total Customers",
      value: totalCustomers,
      icon: Users,
      color: "text-blue-500",
    },
    {
      label: "Active Customers",
      value: activeCustomers,
      icon: TrendingUp,
      color: "text-emerald-500",
    },
    {
      label: "VIP Members",
      value: vipCustomers,
      icon: Award,
      color: "text-amber-500",
    },
    {
      label: "Avg. Customer Value",
      value: `$${avgSpent.toFixed(2)}`,
      icon: DollarSign,
      color: "text-purple-500",
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <Card key={stat.label} className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  {stat.label}
                </p>
                <p className="mt-2 text-3xl font-bold">{stat.value}</p>
              </div>
              <Icon className={`h-10 w-10 ${stat.color}`} />
            </div>
          </Card>
        );
      })}
    </div>
  );
}
