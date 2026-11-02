
import   { useMemo, useState } from "react";
import {
  CalendarCheck,
  CalendarDays,
  CheckCircle2,
  XCircle,
  Clock3,
  FileCheck,
  Search,
  Filter,
  Users,
  TrendingUp,
} from "lucide-react";
import { motion } from "framer-motion";
import "./ParentAttendance.css";

const attendanceData = [
  { id: 1, child: "Abebe Tadesse", studentId: "STU-2026-001", date: "2026-10-01", day: "Thursday", status: "Present", remark: "On time" },
  { id: 2, child: "Abebe Tadesse", studentId: "STU-2026-001", date: "2026-10-02", day: "Friday", status: "Present", remark: "On time" },
  { id: 3, child: "Abebe Tadesse", studentId: "STU-2026-001", date: "2026-10-03", day: "Saturday", status: "Absent", remark: "Not reported" },
  { id: 4, child: "Abebe Tadesse", studentId: "STU-2026-001", date: "2026-10-05", day: "Monday", status: "Late", remark: "Arrived late" },
  { id: 5, child: "Abebe Tadesse", studentId: "STU-2026-001", date: "2026-10-06", day: "Tuesday", status: "Present", remark: "On time" },
  { id: 6, child: "Abebe Tadesse", studentId: "STU-2026-001", date: "2026-10-07", day: "Wednesday", status: "Present", remark: "On time" },
  { id: 7, child: "Hana Tadesse", studentId: "STU-2026-002", date: "2026-10-01", day: "Thursday", status: "Present", remark: "On time" },
  { id: 8, child: "Hana Tadesse", studentId: "STU-2026-002", date: "2026-10-02", day: "Friday", status: "Excused", remark: "Approved absence" },
  { id: 9, child: "Hana Tadesse", studentId: "STU-2026-002", date: "2026-10-05", day: "Monday", status: "Present", remark: "On time" },
  { id: 10, child: "Hana Tadesse", studentId: "STU-2026-002", date: "2026-10-06", day: "Tuesday", status: "Late", remark: "Arrived late" },
  { id: 11, child: "Hana Tadesse", studentId: "STU-2026-002", date: "2026-10-07", day: "Wednesday", status: "Present", remark: "On time" },
];

const childrenOptions = ["All Children", "Abebe Tadesse", "Hana Tadesse"];

const statusClass = {
  Present: "pa-present",
  Absent: "pa-absent",
  Late: "pa-late",
  Excused: "pa-excused",
};

function ParentAttendance() {
  const [selectedChild, setSelectedChild] = useState("All Children");
  const [selectedMonth, setSelectedMonth] = useState("2026-10");
  const [statusFilter, setStatusFilter] = useState("All");
  const [search, setSearch] = useState("");

  const monthDate = useMemo(
    () => new Date(`${selectedMonth}-01T12:00:00`),
    [selectedMonth]
  );

  const monthLabel = monthDate.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  const filteredAttendance = useMemo(() => {
    return attendanceData.filter((item) => {
      const matchesChild =
        selectedChild === "All Children" || item.child === selectedChild;

      const matchesMonth = item.date.startsWith(selectedMonth);

      const matchesStatus =
        statusFilter === "All" || item.status === statusFilter;

      const matchesSearch =
        item.child.toLowerCase().includes(search.toLowerCase()) ||
        item.studentId.toLowerCase().includes(search.toLowerCase()) ||
        item.remark.toLowerCase().includes(search.toLowerCase());

      return matchesChild && matchesMonth && matchesStatus && matchesSearch;
    });
  }, [selectedChild, selectedMonth, statusFilter, search]);

  const summary = useMemo(() => {
    const records = filteredAttendance;
    const count = (status) =>
      records.filter((item) => item.status === status).length;

    const present = count("Present");
    const absent = count("Absent");
    const late = count("Late");
    const excused = count("Excused");
    const total = records.length;

    const percentage =
      total > 0 ? Math.round((present / total) * 100) : 0;

    return { present, absent, late, excused, total, percentage };
  }, [filteredAttendance]);

  const calendarDays = useMemo(() => {
    const year = monthDate.getFullYear();
    const month = monthDate.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const totalDays = new Date(year, month + 1, 0).getDate();

    const cells = Array(firstDay).fill(null);

    for (let day = 1; day <= totalDays; day++) {
      const dateKey = `${selectedMonth}-${String(day).padStart(2, "0")}`;

      const record = filteredAttendance.find(
        (item) => item.date === dateKey
      );

      cells.push({ day, status: record?.status || null });
    }

    return cells;
  }, [monthDate, selectedMonth, filteredAttendance]);

  const changeMonth = (amount) => {
    const next = new Date(
      monthDate.getFullYear(),
      monthDate.getMonth() + amount,
      1
    );

    setSelectedMonth(
      `${next.getFullYear()}-${String(next.getMonth() + 1).padStart(2, "0")}`
    );
  };

  const formatDate = (date) =>
    new Date(`${date}T12:00:00`).toLocaleDateString("en-US", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });

  return (
    <div className="parent-attendance-page">
      {/* Header */}
      <div className="pa-header">
        <div>
          <span className="pa-eyebrow">
            <CalendarCheck size={16} />
            STUDENT MONITORING
          </span>
          <h1>Attendance Overview</h1>
          <p>
            Monitor your children's attendance records and monthly school
            participation.
          </p>
        </div>

        <div className="pa-header-icon">
          <CalendarDays size={29} />
        </div>
      </div>

      {/* Filters */}
      <div className="pa-filter-card">
        <div className="pa-filter-title">
          <Filter size={19} />
          <strong>Attendance Filters</strong>
        </div>

        <div className="row g-3">
          <div className="col-md-4">
            <label className="form-label">Select Child</label>
            <select
              className="form-select"
              value={selectedChild}
              onChange={(e) => setSelectedChild(e.target.value)}
            >
              {childrenOptions.map((child) => (
                <option key={child} value={child}>{child}</option>
              ))}
            </select>
          </div>

          <div className="col-md-4">
            <label className="form-label">Select Month</label>
            <input
              type="month"
              className="form-control"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
            />
          </div>

          <div className="col-md-4">
            <label className="form-label">Attendance Status</label>
            <select
              className="form-select"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="All">All Statuses</option>
              <option value="Present">Present</option>
              <option value="Absent">Absent</option>
              <option value="Late">Late</option>
              <option value="Excused">Excused</option>
            </select>
          </div>
        </div>
      </div>

      {/* Statistics */}
      <div className="row g-3 pa-stats-row">
        <div className="col-6 col-xl-3">
          <motion.div className="pa-stat-card pa-stat-green" whileHover={{ y: -4 }}>
            <div className="pa-stat-icon"><CheckCircle2 size={23} /></div>
            <span>Present Days</span>
            <h3>{summary.present}</h3>
            <small>Recorded present</small>
          </motion.div>
        </div>

        <div className="col-6 col-xl-3">
          <motion.div className="pa-stat-card pa-stat-red" whileHover={{ y: -4 }}>
            <div className="pa-stat-icon"><XCircle size={23} /></div>
            <span>Absent Days</span>
            <h3>{summary.absent}</h3>
            <small>Recorded absent</small>
          </motion.div>
        </div>

        <div className="col-6 col-xl-3">
          <motion.div className="pa-stat-card pa-stat-orange" whileHover={{ y: -4 }}>
            <div className="pa-stat-icon"><Clock3 size={23} /></div>
            <span>Late Days</span>
            <h3>{summary.late}</h3>
            <small>Late arrivals</small>
          </motion.div>
        </div>

        <div className="col-6 col-xl-3">
          <motion.div className="pa-stat-card pa-stat-blue" whileHover={{ y: -4 }}>
            <div className="pa-stat-icon"><FileCheck size={23} /></div>
            <span>Excused Days</span>
            <h3>{summary.excused}</h3>
            <small>Approved absences</small>
          </motion.div>
        </div>
      </div>

      <div className="row g-4 pa-main-row">
        {/* Calendar */}
        <div className="col-lg-7">
          <section className="pa-panel pa-calendar-panel">
            <div className="pa-panel-heading">
              <div>
                <h2>Monthly Attendance Calendar</h2>
                <p>Attendance records for {monthLabel}</p>
              </div>

              <div className="pa-month-controls">
                <button onClick={() => changeMonth(-1)} aria-label="Previous month">‹</button>
                <button onClick={() => changeMonth(1)} aria-label="Next month">›</button>
              </div>
            </div>

            <div className="pa-calendar">
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                <div className="pa-calendar-weekday" key={day}>{day}</div>
              ))}

              {calendarDays.map((item, index) => (
                <div className="pa-calendar-cell" key={index}>
                  {item && (
                    <span className={`pa-calendar-day ${item.status ? statusClass[item.status] : ""}`}>
                      {item.day}
                    </span>
                  )}
                </div>
              ))}
            </div>

            <div className="pa-calendar-legend">
              <span><i className="pa-dot pa-dot-green" /> Present</span>
              <span><i className="pa-dot pa-dot-red" /> Absent</span>
              <span><i className="pa-dot pa-dot-orange" /> Late</span>
              <span><i className="pa-dot pa-dot-blue" /> Excused</span>
            </div>
          </section>
        </div>

        {/* Attendance percentage */}
        <div className="col-lg-5">
          <section className="pa-panel pa-progress-panel">
            <div className="pa-panel-heading">
              <div>
                <h2>Attendance Rate</h2>
                <p>Based on the filtered records</p>
              </div>
              <TrendingUp size={22} className="pa-trend-icon" />
            </div>

            <div className="pa-rate-circle">
              <svg viewBox="0 0 180 180">
                <circle cx="90" cy="90" r="72" className="pa-rate-track" />
                <circle
                  cx="90"
                  cy="90"
                  r="72"
                  className="pa-rate-value"
                  style={{
                    strokeDasharray: `${(summary.percentage / 100) * 452} 452`,
                  }}
                />
              </svg>
              <div className="pa-rate-center">
                <strong>{summary.percentage}%</strong>
                <span>Attendance</span>
              </div>
            </div>

            <div className="pa-rate-description">
              <div>
                <Users size={20} />
                <span>Total Records</span>
                <strong>{summary.total}</strong>
              </div>
              <div>
                <CheckCircle2 size={20} />
                <span>Present Records</span>
                <strong>{summary.present}</strong>
              </div>
            </div>

            <p className="pa-rate-note">
              This percentage is calculated from the records currently
              displayed. It is a sample report, not an official school result.
            </p>
          </section>
        </div>
      </div>

      {/* Attendance history */}
      <section className="pa-panel pa-history-panel">
        <div className="pa-panel-heading pa-history-heading">
          <div>
            <h2>Attendance History</h2>
            <p>Detailed daily attendance records</p>
          </div>
          <span className="pa-record-count">
            {filteredAttendance.length} Records
          </span>
        </div>

        <div className="pa-table-search">
          <Search size={19} />
          <input
            type="search"
            placeholder="Search student, ID or remark..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="table-responsive">
          <table className="table pa-table align-middle">
            <thead>
              <tr>
                <th>Student</th>
                <th>Student ID</th>
                <th>Date</th>
                <th>Day</th>
                <th>Status</th>
                <th>Remark</th>
              </tr>
            </thead>
            <tbody>
              {filteredAttendance.length > 0 ? (
                filteredAttendance.map((item) => (
                  <tr key={item.id}>
                    <td className="pa-student-name">{item.child}</td>
                    <td>{item.studentId}</td>
                    <td>{formatDate(item.date)}</td>
                    <td>{item.day}</td>
                    <td>
                      <span className={`pa-status-badge ${statusClass[item.status]}`}>
                        {item.status}
                      </span>
                    </td>
                    <td>{item.remark}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="pa-no-records">
                    No attendance records found for these filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <div className="pa-notice">
        <CalendarCheck size={22} />
        <div>
          <strong>Parent viewing permissions</strong>
          <p>
            Parents can view attendance records for their own children.
            Attendance cannot be edited or changed from this page.
          </p>
        </div>
      </div>
    </div>
  );
}

export default ParentAttendance;
