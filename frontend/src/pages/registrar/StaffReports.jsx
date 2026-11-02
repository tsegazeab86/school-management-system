 
import { useMemo, useState } from "react";
import {
    Users, UserCheck, UserX, Clock, Download,
    Search, CalendarDays, FileText, TrendingUp,
    Wallet, BriefcaseBusiness, Filter
} from "lucide-react";

import "../../styles/registrar/StaffReports.css";

const staffData = [
    { id: 1, name: "Abebe Kebede", role: "Mathematics Teacher", department: "Academic", attendance: "Present", days: 22, salary: 18000, leave: 1 },
    { id: 2, name: "Hana Getachew", role: "Administrator", department: "Administration", attendance: "Present", days: 23, salary: 22000, leave: 0 },
    { id: 3, name: "Dawit Tesfaye", role: "English Teacher", department: "Academic", attendance: "Absent", days: 19, salary: 17000, leave: 2 },
    { id: 4, name: "Meron Alemu", role: "Librarian", department: "Library", attendance: "Late", days: 21, salary: 15000, leave: 1 },
    { id: 5, name: "Samuel Bekele", role: "Accountant", department: "Finance", attendance: "Present", days: 24, salary: 20000, leave: 0 },
    { id: 6, name: "Selamawit Tadesse", role: "Registrar", department: "Administration", attendance: "Present", days: 22, salary: 19000, leave: 1 },
];

function StaffReports() {
    const [staff] = useState(staffData);
    const [search, setSearch] = useState("");
    const [department, setDepartment] = useState("All");
    const [reportType, setReportType] = useState("All");
    const [period, setPeriod] = useState("This Month");

    const filteredStaff = useMemo(() => {
        return staff.filter((person) => {
            const matchesSearch =
                person.name.toLowerCase().includes(search.toLowerCase()) ||
                person.role.toLowerCase().includes(search.toLowerCase());

            const matchesDepartment =
                department === "All" || person.department === department;

            const matchesReport =
                reportType === "All" ||
                (reportType === "Present" && person.attendance === "Present") ||
                (reportType === "Absent" && person.attendance === "Absent") ||
                (reportType === "Late" && person.attendance === "Late");

            return matchesSearch && matchesDepartment && matchesReport;
        });
    }, [staff, search, department, reportType]);

    const totalStaff = staff.length;
    const present = staff.filter((p) => p.attendance === "Present").length;
    const absent = staff.filter((p) => p.attendance === "Absent").length;
    const late = staff.filter((p) => p.attendance === "Late").length;
    const totalSalary = staff.reduce((sum, p) => sum + p.salary, 0);
    const totalLeave = staff.reduce((sum, p) => sum + p.leave, 0);
    const averageAttendance = totalStaff
        ? Math.round(staff.reduce((sum, p) => sum + p.days, 0) / totalStaff)
        : 0;

    const exportCSV = () => {
        const headers = [
            "Staff Name", "Role", "Department",
            "Attendance", "Days Present", "Salary (ETB)", "Leave Days"
        ];

        const rows = filteredStaff.map((p) => [
            p.name, p.role, p.department,
            p.attendance, p.days, p.salary, p.leave
        ]);

        const csv = [headers, ...rows]
            .map((row) =>
                row.map((value) => `"${String(value).replace(/"/g, '""')}"`).join(",")
            )
            .join("\n");

        const blob = new Blob(["\uFEFF" + csv], {
            type: "text/csv;charset=utf-8;"
        });

        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = "staff-report.csv";
        link.click();
        URL.revokeObjectURL(url);
    };

    const formatCurrency = (amount) =>
        new Intl.NumberFormat("en-ET").format(amount);

    return (
        <div className="staff-reports-page">

            {/* Page Heading */}
            <div className="staff-reports-heading">
                <div>
                    <span className="staff-reports-eyebrow">REPORTS & ANALYTICS</span>
                    <h2>Staff Reports</h2>
                    <p>Monitor staff attendance, salary and leave information.</p>
                </div>

                <button className="staff-report-export" onClick={exportCSV}>
                    <Download size={18} />
                    Export CSV
                </button>
            </div>

            {/* Period Filter */}
            <div className="staff-report-period">
                <div>
                    <CalendarDays size={19} />
                    <span>Report Period</span>
                </div>

                <select value={period} onChange={(e) => setPeriod(e.target.value)}>
                    <option>This Month</option>
                    <option>Last Month</option>
                    <option>This Year</option>
                    <option>All Time</option>
                </select>
            </div>

            {/* Statistics */}
            <div className="staff-report-stat-grid">
                <div className="staff-report-stat purple">
                    <div className="staff-report-stat-icon"><Users /></div>
                    <div>
                        <span>Total Staff</span>
                        <h3>{totalStaff}</h3>
                        <small>Registered staff members</small>
                    </div>
                </div>

                <div className="staff-report-stat green">
                    <div className="staff-report-stat-icon"><UserCheck /></div>
                    <div>
                        <span>Present Today</span>
                        <h3>{present}</h3>
                        <small>Attendance recorded</small>
                    </div>
                </div>

                <div className="staff-report-stat red">
                    <div className="staff-report-stat-icon"><UserX /></div>
                    <div>
                        <span>Absent Today</span>
                        <h3>{absent}</h3>
                        <small>Staff not present</small>
                    </div>
                </div>

                <div className="staff-report-stat orange">
                    <div className="staff-report-stat-icon"><Clock /></div>
                    <div>
                        <span>Late Today</span>
                        <h3>{late}</h3>
                        <small>Late arrivals</small>
                    </div>
                </div>
            </div>

            {/* Overview Cards */}
            <div className="staff-report-overview">
                <div className="staff-report-overview-card">
                    <div className="staff-report-overview-heading">
                        <div className="overview-icon"><Wallet /></div>
                        <span>Total Monthly Salary</span>
                    </div>
                    <h3>{formatCurrency(totalSalary)} <small>ETB</small></h3>
                    <p><TrendingUp size={14} /> Combined staff salary</p>
                </div>

                <div className="staff-report-overview-card">
                    <div className="staff-report-overview-heading">
                        <div className="overview-icon"><CalendarDays /></div>
                        <span>Total Leave Days</span>
                    </div>
                    <h3>{totalLeave} <small>Days</small></h3>
                    <p>Recorded leave days</p>
                </div>

                <div className="staff-report-overview-card">
                    <div className="staff-report-overview-heading">
                        <div className="overview-icon"><BriefcaseBusiness /></div>
                        <span>Average Days Present</span>
                    </div>
                    <h3>{averageAttendance} <small>Days</small></h3>
                    <p>Average per staff member</p>
                </div>
            </div>

            {/* Attendance Summary */}
            <div className="staff-report-attendance-card">
                <div className="staff-report-section-heading">
                    <div>
                        <h3>Attendance Summary</h3>
                        <p>Staff attendance distribution in the current sample.</p>
                    </div>
                    <span>{totalStaff} Staff</span>
                </div>

                <div className="staff-report-progress-list">
                    <div className="staff-progress-item">
                        <div>
                            <span>Present</span>
                            <strong>{totalStaff ? Math.round((present / totalStaff) * 100) : 0}%</strong>
                        </div>
                        <div className="staff-progress-track">
                            <div className="staff-progress-fill present-fill"
                                style={{ width: `${totalStaff ? (present / totalStaff) * 100 : 0}%` }} />
                        </div>
                    </div>

                    <div className="staff-progress-item">
                        <div>
                            <span>Absent</span>
                            <strong>{totalStaff ? Math.round((absent / totalStaff) * 100) : 0}%</strong>
                        </div>
                        <div className="staff-progress-track">
                            <div className="staff-progress-fill absent-fill"
                                style={{ width: `${totalStaff ? (absent / totalStaff) * 100 : 0}%` }} />
                        </div>
                    </div>

                    <div className="staff-progress-item">
                        <div>
                            <span>Late</span>
                            <strong>{totalStaff ? Math.round((late / totalStaff) * 100) : 0}%</strong>
                        </div>
                        <div className="staff-progress-track">
                            <div className="staff-progress-fill late-fill"
                                style={{ width: `${totalStaff ? (late / totalStaff) * 100 : 0}%` }} />
                        </div>
                    </div>
                </div>
            </div>

            {/* Staff Report Table */}
            <div className="staff-report-table-card">
                <div className="staff-report-table-heading">
                    <div>
                        <h3>Staff Performance Details</h3>
                        <p>View individual staff report information.</p>
                    </div>
                    <FileText size={22} />
                </div>

                <div className="staff-report-filters">
                    <div className="staff-report-search">
                        <Search size={17} />
                        <input
                            placeholder="Search staff..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>

                    <select value={department} onChange={(e) => setDepartment(e.target.value)}>
                        <option value="All">All Departments</option>
                        <option value="Academic">Academic</option>
                        <option value="Administration">Administration</option>
                        <option value="Library">Library</option>
                        <option value="Finance">Finance</option>
                    </select>

                    <select value={reportType} onChange={(e) => setReportType(e.target.value)}>
                        <option value="All">All Attendance</option>
                        <option value="Present">Present</option>
                        <option value="Absent">Absent</option>
                        <option value="Late">Late</option>
                    </select>
                </div>

                <div className="staff-report-table-wrap">
                    <table className="staff-report-table">
                        <thead>
                            <tr>
                                <th>Staff Member</th>
                                <th>Department</th>
                                <th>Attendance</th>
                                <th>Days Present</th>
                                <th>Salary</th>
                                <th>Leave Days</th>
                            </tr>
                        </thead>

                        <tbody>
                            {filteredStaff.map((person) => (
                                <tr key={person.id}>
                                    <td>
                                        <div className="staff-report-person">
                                            <img
                                                src={`https://ui-avatars.com/api/?name=${encodeURIComponent(person.name)}&background=E9E3FF&color=7059D5&size=100&bold=true`}
                                                alt={person.name}
                                                onError={(e) => {
                                                    e.currentTarget.src = "https://ui-avatars.com/api/?name=Staff&background=E9E3FF&color=7059D5";
                                                }}
                                            />
                                            <div>
                                                <strong>{person.name}</strong>
                                                <small>{person.role}</small>
                                            </div>
                                        </div>
                                    </td>
                                    <td>{person.department}</td>
                                    <td>
                                        <span className={`staff-report-status ${person.attendance.toLowerCase()}`}>
                                            {person.attendance}
                                        </span>
                                    </td>
                                    <td>{person.days}</td>
                                    <td>{formatCurrency(person.salary)} ETB</td>
                                    <td>{person.leave}</td>
                                </tr>
                            ))}

                            {filteredStaff.length === 0 && (
                                <tr>
                                    <td colSpan="6" className="staff-report-no-data">
                                        No staff records found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="staff-report-table-footer">
                    <span>Showing {filteredStaff.length} of {staff.length} staff members</span>
                    <span><Filter size={14} /> Filters applied instantly</span>
                </div>``
            </div>
        </div>
    );
}

export default StaffReports;
