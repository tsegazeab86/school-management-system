
import React, { Suspense } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import RegistrarLayout from "../../components/registrar/RegistrarLayout";

// Import all Registrar pages
const StaffDashboard = React.lazy(() => import("./StaffDashboard"));
const MyProfile = React.lazy(() => import("./MyProfile"));
const StudentRegistration = React.lazy(() => import("./StudentRegistration"));
const ManageStudents = React.lazy(() => import("./ManageStudents"));
const GradeSectionManagement = React.lazy(() => import("./GradeSectionManagement"));
const StudentPromotion = React.lazy(() => import("./StudentPromotion"));
const StudentTransfer = React.lazy(() => import("./StudentTransfer"));
const StudentDocuments = React.lazy(() => import("./StudentDocuments"));
const ParentInformation = React.lazy(() => import("./ParentInformation"));
const CertificatesIDCards = React.lazy(() => import("./CertificatesIDCards"));
const StudentReports = React.lazy(() => import("./StudentReports"));
const StaffAttendance = React.lazy(() => import("./StaffAttendance"));
const WorkSchedule = React.lazy(() => import("./WorkSchedule"));
const Tasks = React.lazy(() => import("./Tasks"));
const LeaveRequest = React.lazy(() => import("./LeaveRequest"));
const SalaryInformation = React.lazy(() => import("./SalaryInformation"));
const Announcements = React.lazy(() => import("./Announcements"));
const Messages = React.lazy(() => import("./Messages"));
const StaffReports = React.lazy(() => import("./StaffReports"));
const Settings = React.lazy(() => import("./Settings"));

function RegistrarRolePage() {
    const location = useLocation();
    const navigate = useNavigate();

    // Get current page from URL
    const page = location.pathname.split("/")[2] || "dashboard";

    // Page titles
    const pageTitles = {
        dashboard: "Staff Dashboard",
        profile: "My Profile",
        registration: "Student Registration",
        students: "Manage Students",
        grades: "Grade & Section Management",
        promotion: "Student Promotion",
        transfer: "Student Transfer",
        documents: "Student Documents",
        parents: "Parent Information",
        certificates: "Certificates & ID Cards",
        "student-reports": "Student Reports",
        attendance: "Staff Attendance",
        schedule: "Work Schedule",
        tasks: "Tasks",
        leave: "Leave Request",
        salary: "Salary Information",
        announcements: "Announcements",
        messages: "Messages",
        // "staff-reports": "Staff Reports",
        settings: "Settings",
    };

    // Navigate between pages
    const handleNavigate = (targetPage) => {
        navigate(`/registrar/${targetPage}`);
    };

    // Render selected page
    const pages = {
        dashboard: <StaffDashboard />,
        profile: <MyProfile />,
        registration: <StudentRegistration />,
        students: <ManageStudents />,
        grades: <GradeSectionManagement />,
        promotion: <StudentPromotion />,
        transfer: <StudentTransfer />,
        documents: <StudentDocuments />,
        parents: <ParentInformation />,
        certificates: <CertificatesIDCards />,
        "student-reports": <StudentReports />,
        attendance: <StaffAttendance />,
        schedule: <WorkSchedule />,
        tasks: <Tasks />,
        leave: <LeaveRequest />,
        salary: <SalaryInformation />,
        announcements: <Announcements />,
        messages: <Messages />,
        "staff-reports": <StaffReports />,
        settings: <Settings />,
    };

    const content = pages[page] || (
        <div style={{ padding: "25px" }}>
            <h2>Page Not Found</h2>
            <p>The requested Registrar page does not exist.</p>
        </div>
    );

    return (
        <RegistrarLayout
            title={pageTitles[page] || "Registrar Panel"}
            activePage={page}
            onNavigate={handleNavigate}
        >
            <Suspense fallback={<div role="status">Loading...</div>}>
                {content}
            </Suspense>
        </RegistrarLayout>
    );
}

export default RegistrarRolePage;
