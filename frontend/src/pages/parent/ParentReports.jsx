
import { useState } from "react";
import { motion } from "framer-motion";
import {
  FileText,
  Download,
  CalendarDays,
  GraduationCap,
  ClipboardCheck,
  Wallet,
  TrendingUp,
  Users,
  Printer,
  Eye,
  X,
} from "lucide-react";
import "./ParentReports.css";

const reportData = [
  {
    id: 1,
    child: "Abebe Tadesse",
    grade: "Grade 10",
    attendance: 96,
    average: 88,
    assignments: 92,
    fees: "Paid",
    subjects: [
      { name: "Mathematics", score: 92 },
      { name: "English", score: 85 },
      { name: "Physics", score: 88 },
      { name: "Biology", score: 86 },
      { name: "Chemistry", score: 89 },
    ],
  },
  {
    id: 2,
    child: "Hana Tadesse",
    grade: "Grade 7",
    attendance: 92,
    average: 84,
    assignments: 88,
    fees: "Pending",
    subjects: [
      { name: "Mathematics", score: 86 },
      { name: "English", score: 82 },
      { name: "Science", score: 85 },
      { name: "Social Studies", score: 83 },
      { name: "Amharic", score: 84 },
    ],
  },
];

function ParentReports() {
  const [selectedChild, setSelectedChild] = useState("all");
  const [selectedReport, setSelectedReport] = useState(null);
  const [period, setPeriod] = useState("First Semester");

  const visibleChildren =
    selectedChild === "all"
      ? reportData
      : reportData.filter(
          (child) => child.id === Number(selectedChild)
        );

  const average = Math.round(
    visibleChildren.reduce(
      (total, child) => total + child.average,
      0
    ) / visibleChildren.length
  );

  const attendance = Math.round(
    visibleChildren.reduce(
      (total, child) => total + child.attendance,
      0
    ) / visibleChildren.length
  );

  const assignments = Math.round(
    visibleChildren.reduce(
      (total, child) => total + child.assignments,
      0
    ) / visibleChildren.length
  );

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    const rows = [
      ["Student", "Grade", "Attendance", "Average", "Assignments", "Fees"],
      ...visibleChildren.map((child) => [
        child.child,
        child.grade,
        `${child.attendance}%`,
        `${child.average}%`,
        `${child.assignments}%`,
        child.fees,
      ]),
    ];

    const csv = rows
      .map((row) =>
        row.map((value) => `"${String(value).replace(/"/g, '""')}"`).join(",")
      )
      .join("\n");

    const blob = new Blob([csv], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "parent-report.csv";
    link.click();

    URL.revokeObjectURL(url);
  };

  return (
    <div className="parent-reports-page">
      {/* Header */}
      <div className="reports-header">
        <div>
          <span className="reports-eyebrow">PARENT PORTAL</span>
          <h2>Children's Reports</h2>
          <p>
            Review academic performance, attendance, and school progress.
          </p>
        </div>

        <div className="reports-header-icon">
          <FileText size={32} />
        </div>
      </div>

      {/* Filters */}
      <div className="reports-filter-panel">
        <div className="report-filter-group">
          <label>Choose Child</label>
          <select
            value={selectedChild}
            onChange={(e) => setSelectedChild(e.target.value)}
          >
            <option value="all">All Children</option>
            {reportData.map((child) => (
              <option key={child.id} value={child.id}>
                {child.child}
              </option>
            ))}
          </select>
        </div>

        <div className="report-filter-group">
          <label>Academic Period</label>
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
          >
            <option>First Semester</option>
            <option>Second Semester</option>
            <option>Full Academic Year</option>
          </select>
        </div>

        <div className="report-actions">
          <button
            className="report-download-btn"
            onClick={handleDownload}
          >
            <Download size={17} />
            Export CSV
          </button>

          <button
            className="report-print-btn"
            onClick={handlePrint}
          >
            <Printer size={17} />
            Print
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="reports-summary-grid">
        <motion.div
          className="report-summary-card"
          whileHover={{ y: -5 }}
        >
          <div className="report-card-icon purple">
            <GraduationCap size={24} />
          </div>
          <div>
            <span>Average Academic Score</span>
            <h3>{average}%</h3>
            <small><TrendingUp size={14} /> Overall average</small>
          </div>
        </motion.div>

        <motion.div
          className="report-summary-card"
          whileHover={{ y: -5 }}
        >
          <div className="report-card-icon blue">
            <CalendarDays size={24} />
          </div>
          <div>
            <span>Average Attendance</span>
            <h3>{attendance}%</h3>
            <small>Attendance summary</small>
          </div>
        </motion.div>

        <motion.div
          className="report-summary-card"
          whileHover={{ y: -5 }}
        >
          <div className="report-card-icon green">
            <ClipboardCheck size={24} />
          </div>
          <div>
            <span>Assignment Completion</span>
            <h3>{assignments}%</h3>
            <small>Completed assignments</small>
          </div>
        </motion.div>

        <motion.div
          className="report-summary-card"
          whileHover={{ y: -5 }}
        >
          <div className="report-card-icon orange">
            <Users size={24} />
          </div>
          <div>
            <span>Children</span>
            <h3>{visibleChildren.length}</h3>
            <small>Selected children</small>
          </div>
        </motion.div>
      </div>

      {/* Children Reports */}
      <div className="reports-section">
        <div className="reports-section-heading">
          <div>
            <h3>Academic Performance</h3>
            <p>
              {period} · {visibleChildren.length} student(s)
            </p>
          </div>
        </div>

        <div className="reports-table-wrapper">
          <table className="table reports-table align-middle">
            <thead>
              <tr>
                <th>Student Name</th>
                <th>Grade</th>
                <th>Attendance</th>
                <th>Average Score</th>
                <th>Assignments</th>
                <th>Fee Status</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {visibleChildren.map((child) => (
                <tr key={child.id}>
                  <td>
                    <div className="report-student">
                      <div className="report-student-avatar">
                        {child.child
                          .split(" ")
                          .map((part) => part[0])
                          .join("")}
                      </div>
                      <strong>{child.child}</strong>
                    </div>
                  </td>

                  <td>{child.grade}</td>

                  <td>
                    <span className="report-percentage">
                      {child.attendance}%
                    </span>
                  </td>

                  <td>
                    <span className="report-percentage score">
                      {child.average}%
                    </span>
                  </td>

                  <td>{child.assignments}%</td>

                  <td>
                    <span
                      className={`report-fee-status ${
                        child.fees === "Paid" ? "paid" : "pending"
                      }`}
                    >
                      {child.fees}
                    </span>
                  </td>

                  <td>
                    <button
                      className="report-view-btn"
                      onClick={() => setSelectedReport(child)}
                    >
                      <Eye size={16} />
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Individual Report Cards */}
      <div className="individual-reports">
        <h3>Individual Student Reports</h3>

        <div className="row g-3">
          {visibleChildren.map((child) => (
            <div className="col-lg-6" key={child.id}>
              <motion.div
                className="individual-report-card"
                whileHover={{ y: -4 }}
              >
                <div className="individual-report-top">
                  <div>
                    <h4>{child.child}</h4>
                    <p>{child.grade} · {period}</p>
                  </div>

                  <span className="student-report-icon">
                    <GraduationCap size={23} />
                  </span>
                </div>

                <div className="report-progress-item">
                  <div>
                    <span>Academic Performance</span>
                    <strong>{child.average}%</strong>
                  </div>
                  <div className="progress">
                    <div
                      className="progress-bar bg-primary"
                      style={{ width: `${child.average}%` }}
                    />
                  </div>
                </div>

                <div className="report-progress-item">
                  <div>
                    <span>Attendance</span>
                    <strong>{child.attendance}%</strong>
                  </div>
                  <div className="progress">
                    <div
                      className="progress-bar bg-success"
                      style={{ width: `${child.attendance}%` }}
                    />
                  </div>
                </div>

                <div className="report-progress-item">
                  <div>
                    <span>Assignment Completion</span>
                    <strong>{child.assignments}%</strong>
                  </div>
                  <div className="progress">
                    <div
                      className="progress-bar bg-warning"
                      style={{ width: `${child.assignments}%` }}
                    />
                  </div>
                </div>

                <button
                  className="individual-view-btn"
                  onClick={() => setSelectedReport(child)}
                >
                  <Eye size={16} />
                  View Detailed Report
                </button>
              </motion.div>
            </div>
          ))}
        </div>
      </div>

      {/* Detailed Report Modal */}
      {selectedReport && (
        <div
          className="report-modal-overlay"
          onClick={() => setSelectedReport(null)}
        >
          <motion.div
            className="report-detail-modal"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="report-modal-header">
              <div>
                <span>STUDENT REPORT</span>
                <h3>{selectedReport.child}</h3>
                <p>{selectedReport.grade} · {period}</p>
              </div>

              <button
                onClick={() => setSelectedReport(null)}
                aria-label="Close report"
              >
                <X size={21} />
              </button>
            </div>

            <div className="report-detail-stats">
              <div>
                <span>Average Score</span>
                <strong>{selectedReport.average}%</strong>
              </div>
              <div>
                <span>Attendance</span>
                <strong>{selectedReport.attendance}%</strong>
              </div>
            </div>

            <h4>Subject Performance</h4>

            <div className="subject-report-list">
              {selectedReport.subjects.map((subject) => (
                <div className="subject-report-row" key={subject.name}>
                  <span>{subject.name}</span>
                  <div className="subject-score-track">
                    <div
                      style={{ width: `${subject.score}%` }}
                    />
                  </div>
                  <strong>{subject.score}%</strong>
                </div>
              ))}
            </div>

            <div className="report-modal-footer">
              <span>Fee status: {selectedReport.fees}</span>
              <button onClick={handlePrint}>
                <Printer size={16} /> Print Report
              </button>
            </div>
          </motion.div>
        </div>
      )}

      <div className="reports-disclaimer">
        <Wallet size={18} />
        <p>
          These reports are for viewing purposes. Only authorized
          school staff can change academic records and attendance.
        </p>
      </div>
    </div>
  );
}

export default ParentReports;
