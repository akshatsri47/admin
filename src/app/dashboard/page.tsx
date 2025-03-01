"use client"

import DashboardOverview from "@/components/Preview";
import AdminSidebar from "@/components/sidebar/sidebar";
import { useState } from "react";

export default function Dashboard(){
    const [sidebarExpanded,setSidebarExpanded]  = useState(false)
    return(
        <div className="flex h-screen overflow-hidden">
              {/* Sidebar with dynamic hover expansion */}
              <AdminSidebar onHover={setSidebarExpanded} />
        
              {/* Content area with dynamic margin transition */}
              <div
                className={`flex-1 p-4 overflow-auto bg-gray-100 transition-all duration-300 ${
                  sidebarExpanded ? "ml-32" : "ml-8"
                }`}
              >
                <DashboardOverview />
              </div>
            </div>
    )
}