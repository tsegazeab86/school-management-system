import { useState } from "react";

import RegistrarSidebar from "./RegistrarSidebar";
import RegistrarHeader from "./RegistrarHeader";
import RegistrarBreadcrumb from "./RegistrarBreadcrumb";

import "../../styles/registrar/RegistrarLayout.css";

function RegistrarLayout({
    children,
    title = "Staff Dashboard",
    activePage = "dashboard",
    onNavigate = () => {},
}) {
    const [collapsed, setCollapsed] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);

    const handleLogout = () => {
        const confirmLogout = window.confirm(
            "Are you sure you want to logout?"
        );

        if (confirmLogout) {
            window.location.href = "/";
        }
    };

    return (
        <div className="registrar-layout">

            <RegistrarSidebar
                activePage={activePage}
                onNavigate={onNavigate}
                onLogout={handleLogout}
                collapsed={collapsed}
                onToggleCollapse={() => setCollapsed(!collapsed)}
                mobileOpen={mobileOpen}
                onCloseMobile={() => setMobileOpen(false)}
            />

            <main
                className={`registrar-main ${
                    collapsed ? "sidebar-collapsed" : ""
                }`}
            >
                <RegistrarHeader
                    title={title}
                    subtitle="Welcome back! Manage your school activities here."
                    onMenuClick={() => setMobileOpen(true)}
                    onNavigate={onNavigate}
                    onLogout={handleLogout}
                />

                <RegistrarBreadcrumb
                    items={[
                        { label: title, key: activePage }
                    ]}
                    onNavigate={onNavigate}
                />

                {children}
            </main>

        </div>
    );
}

export default RegistrarLayout;