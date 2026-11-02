
import { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";

import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import AdminSidebar from "../components/admin/AdminSidebar";

import "./MainLayout.css";

function MainLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  const isAdmin = location.pathname.startsWith("/admin");

  // Admin layout
  if (isAdmin) {
    return (
      <div className="admin-app-layout">
        <AdminSidebar />

        <main className="admin-main-content">
          <section className="dashboard-content">
            <Outlet />
          </section>
        </main>
      </div>
    );
  }

  // Other role layouts
  return (
    <div className="dashboard-layout">
      <Sidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <main className="dashboard-main">
        <Navbar onMenuClick={() => setSidebarOpen(true)} />

        <section className="dashboard-content">
          <Outlet />
        </section>
      </main>
    </div>
  );
}

export default MainLayout;
