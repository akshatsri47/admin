import React from "react";
import AdminSidebar from "../../components/sidebar/sidebar";
import ProductsTable from "../../components/ProductsTable";

export default function Dashboard() {
  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar with fixed width */}
      <div className="w-60">
        <AdminSidebar />
      </div>

      {/* Content area without gap */}
      <div className="flex-1 overflow-auto">
        <ProductsTable />
      </div>
    </div>
  );
}
