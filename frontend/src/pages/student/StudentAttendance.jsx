
import   { useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  CalendarCheck,
  CheckCircle2,
  XCircle,
  Clock,
  CalendarDays,
  Search,
  Filter,
  TrendingUp,
  Download,
  AlertCircle,
  ChevronDown,
} from "lucide-react";
import "./StudentAttendance.css";

const attendanceData = [
  { id: 1, date: "2026-10-01", day: "Thursday", subject: "Mathematics", time: "08:00 AM", status: "Present" },
  { id: 2, date: "2026-10-02", day: "Friday", subject: "English", time: "09:00 AM", status: "Present" },
  { id: 3, date: "2026-10-05", day: "Monday", subject: "Database", time: "10:00 AM", status: "Absent" },
  { id: 4, date: "2026-10-06", day: "Tuesday", subject: "Java Programming", time: "08:00 AM", status: "Present" },
  { id: 5, date: "2026-10-07", day: "Wednesday", subject: "Networking", time: "11:00 AM", status: "Late" },
  { id: 6, date: "2026-10-08", day: "Thursday", subject: "Mathematics", time: "08:00 AM", status: "Present" },
  { id: 7, date: "2026-10-09", day: "Friday", subject: "English", time: "09:00 AM", status: "Excused" },
  { id: 8, date: "2026-10-12", day: "Monday", subject: "Database", time: "10:00 AM", status: "Present" },
  { id: 9, date: "2026-10-13", day: "Tuesday", subject: "Java Programming", time: "08:00 AM", status: "Present" },
  { id: 10, date: "2026-10-14", day: "Wednesday", subject: "Networking", time: "11:00 AM", status: "Present" },
];

const stats = [
  { title: "Present Days", value: "18", icon: CheckCircle2, color: "green", note: "Successfully attended" },
  { title: "Absent Days", value: "02", icon: XCircle, color: "red", note: "Missed classes" },
  { title: "Late Arrivals", value: "03", icon: Clock, color: "orange", note: "Arrived late" },
  { title: "Attendance Rate", value: "94%", icon: TrendingUp, color: "teal", note: "Overall attendance" },
];

function StudentAttendance() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [month, setMonth] = useState("2026-10");

  const filteredData = useMemo(() => {
    return attendanceData.filter((item) => {
      const matchesSearch =
        item.subject.toLowerCase().includes(search.toLowerCase()) ||
        item.date.includes(search);

      const matchesStatus =
        filter === "All" || item.status === filter;

      const matchesMonth = item.date.startsWith(month);

      return matchesSearch && matchesStatus && matchesMonth;
    });
  }, [search, filter, month]);

  const exportCSV = () => {
    const headers = ["Date", "Day", "Subject", "Time", "Status"];
    const rows = filteredData.map((item) => [
      item.date,
      item.day,
      item.subject,
      item.time,
      item.status,
    ]);

    const csv = [headers, ...rows]
      .map((row) => row.map((value) => `"${value}"`).join(","))
      .join("\n");

    const blob = new Blob([csv], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "student-attendance.csv";
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <motion.div
      className="student-attendance-page"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Header */}
      <div className="attendance-header">
        <div>
          <span className="attendance-eyebrow">STUDENT PORTAL / ATTENDANCE</span>
          <h1>My Attendance</h1>
          <p>Monitor your attendance and keep track of your class participation.</p>
        </div>

        <button className="attendance-export-btn" onClick={exportCSV}>
          <Download size={18} />
          Export Report
        </button>
      </div>

      {/* Hero */}
      <motion.section
        className="attendance-hero"
        whileHover={{ scale: 1.005 }}
      >
        <div className="attendance-hero-content">
          <span className="hero-small-label">YOUR ATTENDANCE PERFORMANCE</span>
          <h2>Stay Consistent. Keep Growing.</h2>
          <p>
            Regular attendance helps you stay engaged and make
            progress in your studies.
          </p>

          <div className="hero-student">
            <div className="hero-avatar">S</div>
            <div>
              <strong>Alex Johnson</strong>
              <span>STU-2026-001 · Grade 10A</span>
            </div>
          </div>
        </div>

        <div className="hero-attendance-circle">
          <div>
            <strong>94%</strong>
            <span>Attendance</span>
          </div>
        </div>
        <div className="attendance-hero-decoration"></div>
      </motion.section>

      {/* Statistics */}
      <div className="attendance-stats">
        {stats.map((item, index) => {
          const Icon = item.icon;

          return (
            <motion.div
              className={`attendance-stat-card ${item.color}`}
              key={item.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -7, scale: 1.02 }}
            >
              <div className="attendance-stat-icon">
                <Icon size={24} />
              </div>
              <h2>{item.value}</h2>
              <h4>{item.title}</h4>
              <p>{item.note}</p>
            </motion.div>
          );
        })}
      </div>

      {/* Monthly Overview */}
      <section className="attendance-overview">
        <div className="attendance-section-title">
          <div>
            <h2>Monthly Overview</h2>
            <p>Your attendance progress for this month</p>
          </div>
          <CalendarDays size={23} />
        </div>

        <div className="attendance-progress-info">
          <div>
            <span>Attendance Progress</span>
            <strong>94%</strong>
          </div>
          <div className="attendance-progress-track">
            <motion.div
              className="attendance-progress-fill"
              initial={{ width: 0 }}
              animate={{ width: "94%" }}
              transition={{ duration: 1.2 }}
            />
          </div>
          <div className="attendance-progress-bottom">
            <span>18 Days Present</span>
            <span>Target: 90%</span>
          </div>
        </div>
      </section>

      {/* Attendance History */}
      <section className="attendance-history">
        <div className="attendance-section-title">
          <div>
            <h2>Attendance History</h2>
            <p>Review your daily attendance records</p>
          </div>
          <CalendarCheck size={23} />
        </div>

        <div className="attendance-filters">
          <div className="attendance-search">
            <Search size={18} />
            <input
              type="text"
              placeholder="Search subject or date..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="attendance-filter-control">
            <Filter size={17} />
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            >
              <option value="All">All Status</option>
              <option value="Present">Present</option>
              <option value="Absent">Absent</option>
              <option value="Late">Late</option>
              <option value="Excused">Excused</option>
            </select>
            <ChevronDown size={15} />
          </div>

          <div className="attendance-month-control">
            <CalendarDays size={17} />
            <input
              type="month"
              value={month}
              onChange={(e) => setMonth(e.target.value)}
            />
          </div>
        </div>

        <div className="attendance-table-wrapper">
          <table className="attendance-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Day</th>
                <th>Subject</th>
                <th>Class Time</th>
                <th>Status</th>
              </tr>
            </thead>

            <tbody>
              {filteredData.length > 0 ? (
                filteredData.map((item) => (
                  <motion.tr
                    key={item.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    <td>{item.date}</td>
                    <td>{item.day}</td>
                    <td className="attendance-subject">{item.subject}</td>
                    <td>{item.time}</td>
                    <td>
                      <span className={`attendance-badge ${item.status.toLowerCase()}`}>
                        {item.status === "Present" && <CheckCircle2 size={14} />}
                        {item.status === "Absent" && <XCircle size={14} />}
                        {item.status === "Late" && <Clock size={14} />}
                        {item.status === "Excused" && <AlertCircle size={14} />}
                        {item.status}
                      </span>
                    </td>
                  </motion.tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="attendance-empty">
                    No attendance records found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="attendance-table-footer">
          <span>Showing {filteredData.length} attendance records</span>
          <span>Student ID: STU-2026-001</span>
        </div>
      </section>

      <div className="attendance-note">
        <AlertCircle size={19} />
        <p>
          If you believe an attendance record is incorrect, contact your
          teacher or school administrator. Students cannot edit attendance records.
        </p>
      </div>

      <footer className="attendance-footer">
        © 2026 EduManage School Management System
      </footer>
    </motion.div>
  );
}

export default StudentAttendance;
