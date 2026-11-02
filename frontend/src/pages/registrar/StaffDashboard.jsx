
// import   from "react";
import {
    Users,
    UserPlus,
    FileClock,
    School,
    ClipboardList,
    FileText,
    ArrowUpRight,
} from "lucide-react";

import "../../styles/registrar/StaffDashboard.css";

function StaffDashboard({ onNavigate = () => {} }) {

    const statistics = [
        {
            title: "Total Students",
            value: "1,248",
            icon: Users,
            color: "blue",
        },
        {
            title: "New Registrations",
            value: "86",
            icon: UserPlus,
            color: "purple",
        },
        {
            title: "Pending Documents",
            value: "24",
            icon: FileClock,
            color: "orange",
        },
        {
            title: "Total Classes",
            value: "32",
            icon: School,
            color: "green",
        },
    ];

    const recentStudents = [
        { id: "ST001", name: "Abebe Kebede", grade: "Grade 9", date: "Oct 28, 2026", status: "Approved" },
        { id: "ST002", name: "Sara Ahmed", grade: "Grade 10", date: "Oct 29, 2026", status: "Pending" },
        { id: "ST003", name: "Dawit Alemu", grade: "Grade 8", date: "Oct 30, 2026", status: "Approved" },
        { id: "ST004", name: "Martha Bekele", grade: "Grade 11", date: "Oct 31, 2026", status: "Pending" },
    ];

    const activities = [
        "New student registration submitted",
        "Student documents updated",
        "Grade 10 student record verified",
        "Parent information updated",
    ];

    const quickActions = [
        { label: "Register Student", icon: UserPlus, page: "registration" },
        { label: "Manage Students", icon: Users, page: "students" },
        { label: "Student Documents", icon: FileText, page: "documents" },
        { label: "Student Reports", icon: ClipboardList, page: "student-reports" },
    ];

    return (
        <div className="staff-dashboard">

            <div className="staff-welcome">
                <div>
                    <span className="staff-welcome-label">REGISTRAR PORTAL</span>
                    <h2>Welcome Back, Registrar!</h2>
                    <p>Manage student records and school registration activities.</p>
                </div>

                <div className="welcome-icon">
                    <School size={55} />
                </div>
            </div>

            <div className="staff-statistics">
                {statistics.map((item, index) => {
                    const Icon = item.icon;

                    return (
                        <div className="staff-stat-card" key={index}>
                            <div className={`staff-stat-icon ${item.color}`}>
                                <Icon size={23} />
                            </div>

                            <div>
                                <p>{item.title}</p>
                                <h3>{item.value}</h3>
                            </div>

                            <ArrowUpRight className="staff-stat-arrow" size={18} />
                        </div>
                    );
                })}
            </div>

            <div className="staff-dashboard-grid">

                <section className="staff-panel registrations-panel">
                    <div className="staff-panel-header">
                        <div>
                            <h3>Recent Registrations</h3>
                            <p>Recently registered students</p>
                        </div>

                        <button onClick={() => onNavigate("students")}>
                            View All
                        </button>
                    </div>

                    <div className="staff-table-wrapper">
                        <table className="staff-table">
                            <thead>
                                <tr>
                                    <th>Student ID</th>
                                    <th>Student Name</th>
                                    <th>Grade</th>
                                    <th>Date</th>
                                    <th>Status</th>
                                </tr>
                            </thead>

                            <tbody>
                                {recentStudents.map((student) => (
                                    <tr key={student.id}>
                                        <td>{student.id}</td>
                                        <td>{student.name}</td>
                                        <td>{student.grade}</td>
                                        <td>{student.date}</td>
                                        <td>
                                            <span className={`student-status ${student.status.toLowerCase()}`}>
                                                {student.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </section>

                <section className="staff-panel activities-panel">
                    <div className="staff-panel-header">
                        <div>
                            <h3>Recent Activities</h3>
                            <p>Latest registrar activities</p>
                        </div>
                    </div>

                    <div className="staff-activities-list">
                        {activities.map((activity, index) => (
                            <div className="staff-activity" key={index}>
                                <span className="activity-dot"></span>
                                <p>{activity}</p>
                            </div>
                        ))}
                    </div>
                </section>

            </div>

            <section className="staff-panel quick-actions-panel">
                <div className="staff-panel-header">
                    <div>
                        <h3>Quick Actions</h3>
                        <p>Frequently used registrar functions</p>
                    </div>
                </div>

                <div className="staff-quick-actions">
                    {quickActions.map((action) => {
                        const Icon = action.icon;

                        return (
                            <button
                                className="staff-action-button"
                                key={action.page}
                                onClick={() => onNavigate(action.page)}
                            >
                                <Icon size={22} />
                                <span>{action.label}</span>
                                <ArrowUpRight size={17} />
                            </button>
                        );
                    })}
                </div>
            </section>

        </div>
    );
}

export default StaffDashboard;
