
import { useMemo, useState } from "react";
import {
    CalendarDays,
    Users,
    CheckCircle,
    XCircle,
    Clock,
    Search,
    Save,
    Download,
    // UserRound,
} from "lucide-react";

import "../../styles/registrar/StaffAttendance.css";

// Demo Staff Data
const initialStaff = [
    {
        id: 1,
        name: "Abebe Kebede",
        role: "Teacher",
        department: "Science",
        status: "Present",
        checkIn: "08:00 AM",
        image: "",
    },
    {
        id: 2,
        name: "Sara Tadesse",
        role: "Teacher",
        department: "Mathematics",
        status: "Present",
        checkIn: "08:10 AM",
        image: "",
    },
    {
        id: 3,
        name: "Dawit Bekele",
        role: "Accountant",
        department: "Finance",
        status: "Absent",
        checkIn: "-",
        image: "",
    },
    {
        id: 4,
        name: "Hana Alemu",
        role: "Librarian",
        department: "Library",
        status: "Late",
        checkIn: "09:15 AM",
        image: "",
    },
    {
        id: 5,
        name: "Yonas Worku",
        role: "Registrar",
        department: "Administration",
        status: "Present",
        checkIn: "07:55 AM",
        image: "",
    },
    {
        id: 6,
        name: "Mekdes Girma",
        role: "Teacher",
        department: "English",
        status: "Leave",
        checkIn: "-",
        image: "",
    },
];

function StaffAttendance() {
    const [staff, setStaff] = useState(initialStaff);

    const [search, setSearch] = useState("");
    const [filter, setFilter] = useState("All");

    const [date, setDate] = useState(
        new Date().toLocaleDateString("en-CA")
    );

    const [message, setMessage] = useState("");

    // Filter Staff
    const filteredStaff = useMemo(() => {
        return staff.filter((person) => {
            const searchValue = search.toLowerCase();

            const matchesSearch =
                person.name.toLowerCase().includes(searchValue) ||
                person.role.toLowerCase().includes(searchValue) ||
                person.department.toLowerCase().includes(searchValue);

            const matchesFilter =
                filter === "All" || person.status === filter;

            return matchesSearch && matchesFilter;
        });
    }, [staff, search, filter]);

    // Attendance Statistics
    const countStatus = (status) =>
        staff.filter((person) => person.status === status).length;

    // Update Attendance
    const updateStatus = (id, status) => {
        setStaff((previous) =>
            previous.map((person) =>
                person.id === id
                    ? { ...person, status }
                    : person
            )
        );
    };

    // Save Attendance (Demo)
    const handleSave = () => {
        setMessage(
            `Attendance for ${date} saved successfully (Demo).`
        );

        setTimeout(() => setMessage(""), 3000);
    };

    // Export CSV
    const exportCSV = () => {
        const headers = [
            "Staff Name",
            "Role",
            "Department",
            "Check In",
            "Attendance Status",
        ];

        const rows = filteredStaff.map((person) => [
            person.name,
            person.role,
            person.department,
            person.checkIn,
            person.status,
        ]);

        const csv = [headers, ...rows]
            .map((row) =>
                row
                    .map((value) =>
                        `"${String(value).replace(/"/g, '""')}"`
                    )
                    .join(",")
            )
            .join("\n");

        const blob = new Blob(["\uFEFF" + csv], {
            type: "text/csv;charset=utf-8;",
        });

        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");

        link.href = url;
        link.download = `staff-attendance-${date}.csv`;

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        URL.revokeObjectURL(url);
    };

    return (
        <div className="staff-attendance-page">

            {/* PAGE HEADER */}
            <div className="staff-attendance-heading">

                <div>
                    <span className="staff-attendance-eyebrow">
                        STAFF MANAGEMENT
                    </span>

                    <h2>Staff Attendance</h2>

                    <p>
                        Record and monitor daily staff attendance.
                    </p>
                </div>

                <div className="staff-attendance-date">
                    <CalendarDays size={18} />

                    <input
                        type="date"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                    />
                </div>

            </div>

            {/* SUCCESS MESSAGE */}
            {message && (
                <div className="staff-attendance-message">
                    <CheckCircle size={18} />
                    <span>{message}</span>
                </div>
            )}

            {/* STATISTICS */}
            <div className="staff-attendance-stats">

                <div className="staff-attendance-stat">
                    <div className="attendance-icon purple">
                        <Users size={22} />
                    </div>

                    <div>
                        <span>Total Staff</span>
                        <h3>{staff.length}</h3>
                    </div>
                </div>

                <div className="staff-attendance-stat">
                    <div className="attendance-icon green">
                        <CheckCircle size={22} />
                    </div>

                    <div>
                        <span>Present</span>
                        <h3>{countStatus("Present")}</h3>
                    </div>
                </div>

                <div className="staff-attendance-stat">
                    <div className="attendance-icon red">
                        <XCircle size={22} />
                    </div>

                    <div>
                        <span>Absent</span>
                        <h3>{countStatus("Absent")}</h3>
                    </div>
                </div>

                <div className="staff-attendance-stat">
                    <div className="attendance-icon orange">
                        <Clock size={22} />
                    </div>

                    <div>
                        <span>Late</span>
                        <h3>{countStatus("Late")}</h3>
                    </div>
                </div>

            </div>

            {/* SEARCH AND FILTER */}
            <div className="staff-attendance-toolbar">

                <div className="staff-attendance-search">
                    <Search size={18} />

                    <input
                        type="text"
                        placeholder="Search staff name or role..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>

                <select
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                >
                    <option value="All">All Status</option>
                    <option value="Present">Present</option>
                    <option value="Absent">Absent</option>
                    <option value="Late">Late</option>
                    <option value="Leave">Leave</option>
                </select>

                <button
                    type="button"
                    className="attendance-export-btn"
                    onClick={exportCSV}
                >
                    <Download size={17} />
                    Export
                </button>

            </div>

            {/* ATTENDANCE TABLE */}
            <div className="staff-attendance-table-card">

                <div className="attendance-table-heading">

                    <div>
                        <h3>Daily Attendance Records</h3>

                        <p>
                            {filteredStaff.length} staff members displayed
                        </p>
                    </div>

                    <CalendarDays size={23} />

                </div>

                <div className="attendance-table-wrap">

                    <table className="attendance-table">

                        <thead>
                            <tr>
                                <th>Staff Member</th>
                                <th>Role</th>
                                <th>Department</th>
                                <th>Check In</th>
                                <th>Attendance Status</th>
                            </tr>
                        </thead>

                        <tbody>

                            {filteredStaff.map((person) => (

                                <tr key={person.id}>

                                    {/* STAFF IMAGE AND NAME */}
                                  <td>
    <div className="staff-member-cell">
        <img
            src={
                person.image ||
                `https://ui-avatars.com/api/?name=${encodeURIComponent(
                    person.name
                )}&background=E9E3FF&color=7059D5&size=128&bold=true`
            }
            alt={person.name}
            className="staff-profile-image"
            onError={(e) => {
                e.currentTarget.src =
                    "https://ui-avatars.com/api/?name=Staff&background=E9E3FF&color=7059D5&size=128";
            }}
        />

        <div className="staff-member-info">
            <strong>{person.name}</strong>
            <span>{person.role}</span>
        </div>
    </div>
</td>

                                    <td>{person.role}</td>

                                    <td>{person.department}</td>

                                    <td>{person.checkIn}</td>

                                    {/* ATTENDANCE STATUS */}
                                    <td>
                                        <select
                                            className={`attendance-status-select ${person.status.toLowerCase()}`}
                                            value={person.status}
                                            onChange={(e) =>
                                                updateStatus(
                                                    person.id,
                                                    e.target.value
                                                )
                                            }
                                        >
                                            <option value="Present">
                                                Present
                                            </option>

                                            <option value="Absent">
                                                Absent
                                            </option>

                                            <option value="Late">
                                                Late
                                            </option>

                                            <option value="Leave">
                                                Leave
                                            </option>

                                        </select>
                                    </td>

                                </tr>

                            ))}

                            {filteredStaff.length === 0 && (
                                <tr>
                                    <td colSpan="5" className="attendance-empty">
                                        No staff records found.
                                    </td>
                                </tr>
                            )}

                        </tbody>

                    </table>

                </div>

                {/* SAVE BUTTON */}
                <div className="attendance-save-area">

                    <button
                        type="button"
                        className="attendance-save-btn"
                        onClick={handleSave}
                    >
                        <Save size={17} />
                        Save Attendance
                    </button>

                </div>

            </div>

        </div>
    );
}

export default StaffAttendance;
