
import { useLocation, useNavigate } from "react-router-dom";

import AdminDashboard from "./AdminDashboard";
import ManageUsers from "./ManageUsers";
import ManageStudents from "./ManageStudents";
import ManageTeachers from "./ManageTeachers";
import ManageClasses from "./ManageClasses";
import ManageSubjects from "./ManageSubjects";
import AdminReports from "./AdminReports";
import SystemSettings from "./SystemSettings";

function AdminRolePage() {
    const location = useLocation();
    const navigate = useNavigate();

    const pages = {
        dashboard: AdminDashboard,
        users: ManageUsers,
        students: ManageStudents,
        teachers: ManageTeachers,
        classes: ManageClasses,
        subjects: ManageSubjects,
        reports: AdminReports,
        settings: SystemSettings,
    };

    const pageKey = location.pathname.split("/").filter(Boolean).pop();

    const ActivePage = pages[pageKey] || AdminDashboard;

    const handleNavigate = (page) => {
        navigate(`/admin/${page}`);
    };

    return (
        <div className="admin-role-page">
            <ActivePage onNavigate={handleNavigate} />
        </div>
    );
}

export default AdminRolePage;
