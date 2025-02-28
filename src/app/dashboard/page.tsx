import React from "react";
import AdminSidebar from "../../components/sidebar/sidebar";
import ProductsTable from "../../components/ProductsTable";

export default function Dashboard() {
  return (
    <div>
      <AdminSidebar />
      <div className="ml-16">
        <ProductsTable />
      </div>
    </div>
  );
}
