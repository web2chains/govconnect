import React from "react";
import { DashboardLayout } from "../components/AdminDashboard/DashboardLayout";

export default function AdminDashboard() {
  return (
    <DashboardLayout>
      <div className="p-8 text-center">
        <h1 className="text-3xl font-bold text-gray-800 font-poppins">
          Welcome to Admin Dashboard
        </h1>
        <p className="text-gray-500 mt-2">Kelola pemilihan dengan mudah dan aman.</p>
      </div>
    </DashboardLayout>
  );
}
