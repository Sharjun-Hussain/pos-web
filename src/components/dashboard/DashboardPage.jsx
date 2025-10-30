"use client";

import { useState } from "react";
import Header from "./Header";
import StatsGrid from "./StatsGrid";
import QuickActions from "./QuickAction";
import RecentActivity from "./RecentActivity";
import PluginMarketplace from "./PluginMarketPlace";

export default function Dashboard() {
  const [activeSection, setActiveSection] = useState("dashboard");

  return (
    <div className="min-h-screen bg-gray-50/30">
      <Header
        activeSection={activeSection}
        onSectionChange={setActiveSection}
      />

      <main className="container mx-auto px-4 py-6">
        {activeSection === "dashboard" && (
          <div className="space-y-6">
            {/* Quick Stats */}
            <StatsGrid />

            {/* Quick Actions */}
            <QuickActions />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Recent Activity */}
              <div className="lg:col-span-2">
                <RecentActivity />
              </div>
            </div>
          </div>
        )}

        {/* Other sections would be rendered here based on activeSection */}
      </main>
    </div>
  );
}
