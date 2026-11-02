
import { useMemo, useState } from "react";
import {
    FileText,
    Users,
    UserRound,
    GraduationCap,
    Search,
    Download,
    Printer,
    Filter,
    TrendingUp,
} from "lucide-react";

import "../../styles/registrar/StudentReports.css";

const students = [
    { id: 1, studentId: "STU-001", name: "Abebe Kebede", gender: "Male", grade: "Grade 10", section: "A", status: "Active", attendance: 95, average: 85 },
    { id: 2, studentId: "STU-002", name: "Sara Tadesse", gender: "Female", grade: "Grade 12", section: "B", status: "Active", attendance: 98, average: 92 },
    { id: 3, studentId: "STU-003", name: "Dawit Bekele", gender: "Male", grade: "Grade 8", section: "C", status: "Active", attendance: 88, average: 76 },
    { id: 4, studentId: "STU-004", name: "Hana Alemu", gender: "Female", grade: "Grade 12", section: "A", status: "Active", attendance: 96, average: 89 },
    { id: 5, studentId: "STU-005", name: "Mekdes Girma", gender: "Female", grade: "Grade 9", section: "B", status: "Transferred", attendance: 80, average: 72 },
    { id: 6, studentId: "STU-006", name: "Yonas Worku", gender: "Male", grade: "Grade 11", section: "A", status: "Active", attendance: 91, average: 81 },
];

function StudentReports() {
    const [search, setSearch] = useState("");
    const [gradeFilter, setGradeFilter] = useState("All");
    const [genderFilter, setGenderFilter] = useState("All");
    const [statusFilter, setStatusFilter] = useState("All");

    const filteredStudents = useMemo(() => {
        return students.filter((student) => {
            const matchesSearch =
                student.name.toLowerCase().includes(search.toLowerCase()) ||
                student.studentId.toLowerCase().includes(search.toLowerCase());

            const matchesGrade =
                gradeFilter === "All" || student.grade === gradeFilter;

            const matchesGender =
                genderFilter === "All" || student.gender === genderFilter;

            const matchesStatus =
                statusFilter === "All" || student.status === statusFilter;

            return matchesSearch && matchesGrade && matchesGender && matchesStatus;
        });
    }, [search, gradeFilter, genderFilter, statusFilter]);

    const totalStudents = filteredStudents.length;
    const maleStudents = filteredStudents.filter(s => s.gender === "Male").length;
    const femaleStudents = filteredStudents.filter(s => s.gender === "Female").length;

    const averageAttendance = totalStudents
        ? Math.round(filteredStudents.reduce((sum, s) => sum + s.attendance, 0) / totalStudents)
        : 0;

    const exportCSV = () => {
        const headers = [
            "Student ID", "Name", "Gender", "Grade",
            "Section", "Status", "Attendance", "Average"
        ];

        const rows = filteredStudents.map(s => [
            s.studentId, s.name, s.gender, s.grade,
            s.section, s.status, `${s.attendance}%`, s.average
        ]);

        const csv = [headers, ...rows]
            .map(row => row.map(value =>
                `"${String(value).replace(/"/g, '""')}"`
            ).join(","))
            .join("\n");

        const blob = new Blob(["\uFEFF" + csv], {
            type: "text/csv;charset=utf-8;"
        });

        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = "student-report.csv";
        link.click();
        URL.revokeObjectURL(url);
    };

    const resetFilters = () => {
        setSearch("");
        setGradeFilter("All");
        setGenderFilter("All");
        setStatusFilter("All");
    };

    return (
        <div className="student-reports-page">

            <div className="student-reports-heading">
                <div>
                    <span className="student-reports-eyebrow">
                        STUDENT MANAGEMENT
                    </span>
                    <h2>Student Reports</h2>
                    <p>
                        View, filter and export student information reports.
                    </p>
                </div>

                <div className="student-report-heading-actions">
                    <button className="student-report-print" onClick={() => window.print()}>
                        <Printer size={17} />
                        Print
                    </button>
                    <button className="student-report-export" onClick={exportCSV}>
                        <Download size={17} />
                        Export CSV
                    </button>
                </div>
            </div>

            <div className="student-report-stats">
                <div className="student-report-stat-card">
                    <div className="student-report-stat-icon purple">
                        <Users size={23} />
                    </div>
                    <div>
                        <span>Total Students</span>
                        <h3>{totalStudents}</h3>
                    </div>
                </div>

                <div className="student-report-stat-card">
                    <div className="student-report-stat-icon blue">
                        <UserRound size={23} />
                    </div>
                    <div>
                        <span>Male Students</span>
                        <h3>{maleStudents}</h3>
                    </div>
                </div>

                <div className="student-report-stat-card">
                    <div className="student-report-stat-icon pink">
                        <UserRound size={23} />
                    </div>
                    <div>
                        <span>Female Students</span>
                        <h3>{femaleStudents}</h3>
                    </div>
                </div>

                <div className="student-report-stat-card">
                    <div className="student-report-stat-icon green">
                        <TrendingUp size={23} />
                    </div>
                    <div>
                        <span>Average Attendance</span>
                        <h3>{averageAttendance}%</h3>
                    </div>
                </div>
            </div>

            <div className="student-report-filter-card">
                <div className="student-report-filter-heading">
                    <div>
                        <Filter size={19} />
                        <h3>Filter Student Reports</h3>
                    </div>
                    <button onClick={resetFilters}>Reset Filters</button>
                </div>

                <div className="student-report-filters">
                    <div className="student-report-search">
                        <Search size={18} />
                        <input
                            type="text"
                            placeholder="Search by student name or ID..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                        />
                    </div>

                    <select value={gradeFilter} onChange={e => setGradeFilter(e.target.value)}>
                        <option value="All">All Grades</option>
                        {Array.from({ length: 12 }, (_, i) => (
                            <option key={i + 1}>Grade {i + 1}</option>
                        ))}
                    </select>

                    <select value={genderFilter} onChange={e => setGenderFilter(e.target.value)}>
                        <option value="All">All Genders</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                    </select>

                    <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
                        <option value="All">All Statuses</option>
                        <option value="Active">Active</option>
                        <option value="Transferred">Transferred</option>
                    </select>
                </div>
            </div>

            <div className="student-report-table-card">
                <div className="student-report-table-heading">
                    <div>
                        <h3>Student Information Report</h3>
                        <p>Showing {filteredStudents.length} student records</p>
                    </div>
                    <FileText size={24} />
                </div>

                <div className="student-report-table-wrap">
                    <table className="student-report-table">
                        <thead>
                            <tr>
                                <th>Student ID</th>
                                <th>Student Name</th>
                                <th>Gender</th>
                                <th>Grade</th>
                                <th>Section</th>
                                <th>Status</th>
                                <th>Attendance</th>
                                <th>Average</th>
                            </tr>
                        </thead>

                        <tbody>
                            {filteredStudents.map(student => (
                                <tr key={student.id}>
                                    <td>{student.studentId}</td>
                                    <td><strong>{student.name}</strong></td>
                                    <td>{student.gender}</td>
                                    <td>{student.grade}</td>
                                    <td>{student.section}</td>
                                    <td>
                                        <span className={`student-report-status ${student.status.toLowerCase()}`}>
                                            {student.status}
                                        </span>
                                    </td>
                                    <td>
                                        <div className="student-report-progress">
                                            <div>
                                                <span style={{ width: `${student.attendance}%` }} />
                                            </div>
                                            <small>{student.attendance}%</small>
                                        </div>
                                    </td>
                                    <td><strong>{student.average}%</strong></td>
                                </tr>
                            ))}

                            {filteredStudents.length === 0 && (
                                <tr>
                                    <td colSpan="8" className="student-report-empty">
                                        No student records found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="student-report-note">
                <GraduationCap size={20} />
                <p>
                    This report currently uses demonstration data.
                    Connect the backend to display actual school records.
                </p>
            </div>

        </div>
    );
}

export default StudentReports;
