"use client";

import { useEffect, useState } from "react";

type Order = {
  id: string; userId: string; totalAmount: number; paymentMethod?: "ONLINE" | "COD" | "FULL_COD";
  codAdvanceAmount?: number; codDueAmount?: number; paymentRestriction?: string; status: string; createdAt: string;
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [error, setError] = useState("");
  useEffect(() => { fetch("/api/orders").then((r) => r.json()).then((r) => r.success ? setOrders(r.data) : setError(r.error)).catch(() => setError("Unable to load orders")); }, []);
  return <div className="min-h-screen bg-gray-100 p-6">
    <h1 className="mb-6 text-3xl font-bold">Orders and delivery collections</h1>
    {error && <p className="text-red-600">{error}</p>}
    <div className="overflow-x-auto rounded-lg bg-white shadow"><table className="w-full text-left text-sm">
      <thead className="bg-gray-900 text-white"><tr>{["Order", "Customer", "Total", "Method", "Paid online", "Collect on delivery", "Restriction", "Status"].map((h) => <th key={h} className="p-3">{h}</th>)}</tr></thead>
      <tbody>{orders.map((order) => <tr key={order.id} className="border-b">
        <td className="p-3 font-mono">{order.id}</td><td className="p-3">{order.userId}</td><td className="p-3">₹{order.totalAmount}</td>
        <td className="p-3">{order.paymentMethod === "COD" ? "Partial COD (15% advance)" : order.paymentMethod === "FULL_COD" ? "Full COD" : "Full online"}</td>
        <td className="p-3">₹{order.paymentMethod === "ONLINE" ? order.totalAmount : order.codAdvanceAmount || 0}</td><td className="p-3 font-semibold">₹{order.codDueAmount || 0}</td>
        <td className="p-3">{order.paymentRestriction || "—"}</td><td className="p-3">{order.status}</td>
      </tr>)}</tbody>
    </table></div>
  </div>;
}
