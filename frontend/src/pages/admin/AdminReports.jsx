import { useMemo, useState } from "react";
import {
  Users,
  GraduationCap,
  ClipboardCheck,
  Wallet,
  BookOpen,
  Download,
  Printer,
  Search,
  FileBarChart,
} from "lucide-react";
import "../../styles/admin/AdminReports.css";

const reportData = {
  Students: [
    { name: "Total Students", detail: "All registered students", value: 450, status: "Available" },
    { name: "Male Students", detail: "Registered male students", value: 240, status: "Available" },
    { name: "Female Students", detail: "Registered female students", value: 210, status: "Available" },
    { name: "New Admissions", detail: "Newly admitted students", value: 65, status: "Available" },
  ],
  Teachers: [
    { name: "Total Teachers", detail: "All registered teachers", value: 32, status: "Available" },
    { name: "Active Teachers", detail: "Currently active teachers", value: 29, status: "Available" },
    { name: "Inactive Teachers", detail: "Currently inactive teachers", value: 3, status: "Available" },
    { name: "Assigned Teachers", detail: "Teachers assigned to classes", value: 27, status: "Available" },
  ],
  Attendance: [
    { name: "Present Students", detail: "Students marked present", value: 410, status: "Available" },
    { name: "Absent Students", detail: "Students marked absent", value: 25, status: "Available" },
    { name: "Late Students", detail: "Students arriving late", value: 15, status: "Available" },
    { name: "Attendance Rate", detail: "Sample attendance percentage", value: "91.1%", status: "Available" },
  ],
  Academic: [
    { name: "Total Classes", detail: "Registered class sections", value: 16, status: "Available" },
    { name: "Total Subjects", detail: "Registered school subjects", value: 12, status: "Available" },
    { name: "Completed Exams", detail: "Examinations completed", value: 8, status: "Available" },
    { name: "Assignments", detail: "Assignments created", value: 45, status: "Available" },
  ],
  Financial: [
    { name: "Expected Fees", detail: "Sample expected fee amount", value: "ETB 450,000", status: "Available" },
    { name: "Collected Fees", detail: "Sample collected fee amount", value: "ETB 375,000", status: "Available" },
    { name: "Outstanding Fees", detail: "Sample unpaid fee amount", value: "ETB 75,000", status: "Available" },
    { name: "Recorded Payments", detail: "Number of recorded payments", value: 320, status: "Available" },
  ],
};

const chartData = {
  Students: [
    { label: "Grade 9", value: 120 },
    { label: "Grade 10", value: 110 },
    { label: "Grade 11", value: 105 },
    { label: "Grade 12", value: 115 },
  ],
  Teachers: [
    { label: "Mathematics", value: 8 },
    { label: "English", value: 7 },
    { label: "Science", value: 9 },
    { label: "Other", value: 8 },
  ],
  Attendance: [
    { label: "Present", value: 410 },
    { label: "Absent", value: 25 },
    { label: "Late", value: 15 },
  ],
  Academic: [
    { label: "Classes", value: 16 },
    { label: "Subjects", value: 12 },
    { label: "Completed Exams", value: 8 },
    { label: "Assignments", value: 45 },
  ],
  Financial: [
    { label: "Collected", value: 375 },
    { label: "Outstanding", value: 75 },
  ],
};

const reportTabs = [
  { name: "Students", icon: Users },
  { name: "Teachers", icon: GraduationCap },
  { name: "Attendance", icon: ClipboardCheck },
  { name: "Academic", icon: BookOpen },
  { name: "Financial", icon: Wallet },
];

function AdminReports() {
  const [activeReport, setActiveReport] = useState("Students");
  const [search, setSearch] = useState("");

  const currentRows = useMemo(() => {
    return reportData[activeReport].filter((item) =>
      item.name.toLowerCase().includes(search.toLowerCase())
    );
  }, [activeReport, search]);

  const currentChart = chartData[activeReport];
  const maxValue = Math.max(...currentChart.map((item) => item.value), 1);

  const exportCSV = () => {
    const headers = ["Report", "Description", "Value", "Status"];
    const rows = currentRows.map((item) => [
      item.name,
      item.detail,
      item.value,
      item.status,
    ]);

    const csv = [headers, ...rows]
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
    link.download = `${activeReport.toLowerCase()}-report.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="admin-reports-page">
      <div className="admin-reports-header">
        <div>
          <p className="admin-reports-breadcrumb">Administrator / Reports</p>
          <h1>School Reports</h1>
          <p className="admin-reports-subtitle">
            Review school statistics and generate administrative reports.
          </p>
        </div>

        <div className="admin-reports-header-actions">
          <button className="reports-print-btn" onClick={() => window.print()}>
            <Printer size={17} />
            Print
          </button>
          <button className="reports-export-btn" onClick={exportCSV}>
            <Download size={17} />
            Export CSV
          </button>
        </div>
      </div>

      {/* Overview cards */}
      <div className="reports-overview">
        <div className="reports-overview-card">
          <div className="reports-overview-icon purple">
            <Users size={22} />
          </div>
          <div>
            <p>Total Students</p>
            <h2>450</h2>
            <span>Sample data</span>
          </div>
        </div>

        <div className="reports-overview-card">
          <div className="reports-overview-icon blue">
            <GraduationCap size={22} />
          </div>
          <div>
            <p>Total Teachers</p>
            <h2>32</h2>
            <span>Sample data</span>
          </div>
        </div>

        <div className="reports-overview-card">
          <div className="reports-overview-icon green">
            <ClipboardCheck size={22} />
          </div>
          <div>
            <p>Attendance Rate</p>
            <h2>91.1%</h2>
            <span>Sample data</span>
          </div>
        </div>

        <div className="reports-overview-card">
          <div className="reports-overview-icon orange">
            <Wallet size={22} />
          </div>
          <div>
            <p>Fees Collected</p>
            <h2>ETB 375K</h2>
            <span>Sample data</span>
          </div>
        </div>
      </div>

      {/* Report categories */}
      <div className="reports-panel">
        <div className="reports-panel-heading">
          <div>
            <h2>Report Categories</h2>
            <p>Select a category to view its report.</p>
          </div>
        </div>

        <div className="reports-tabs">
          {reportTabs.map((tab) => {
            const Icon = tab.icon;

            return (
              <button
                key={tab.name}
                className={`reports-tab ${
                  activeReport === tab.name ? "selected" : ""
                }`}
                onClick={() => {
                  setActiveReport(tab.name);
                  setSearch("");
                }}
              >
                <Icon size={18} />
                {tab.name}
              </button>
            );
          })}
        </div>

        {/* Chart */}
        <div className="reports-chart-section">
          <div className="reports-section-heading">
            <div>
              <h2>{activeReport} Overview</h2>
              <p>Illustrative figures for the selected report.</p>
            </div>
            <FileBarChart size={22} />
          </div>

          <div className="reports-bars">
            {currentChart.map((item) => (
              <div className="reports-bar-row" key={item.label}>
                <span className="reports-bar-label">{item.label}</span>
                <div className="reports-bar-track">
                  <div
                    className="reports-bar-fill"
                    style={{
                      width: `${(item.value / maxValue) * 100}%`,
                    }}
                  />
                </div>
                <strong>{item.value}</strong>
              </div>
            ))}
          </div>
        </div>

        {/* Report table */}
        <div className="reports-table-heading">
          <div>
            <h2>{activeReport} Report Details</h2>
            <p>Summary of the selected report category.</p>
          </div>

          <div className="reports-search">
            <Search size={17} />
            <input
              placeholder="Search report..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="reports-table-wrapper">
          <table className="admin-reports-table">
            <thead>
              <tr>
                <th>Report Name</th>
                <th>Description</th>
                <th>Value</th>
                <th>Status</th>
              </tr>
            </thead>

            <tbody>
              {currentRows.length > 0 ? (
                currentRows.map((item) => (
                  <tr key={item.name}>
                    <td><strong>{item.name}</strong></td>
                    <td>{item.detail}</td>
                    <td className="reports-value">{item.value}</td>
                    <td>
                      <span className="reports-available">
                        {item.status}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="reports-empty">
                    No matching report records found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="reports-table-footer">
          Showing {currentRows.length} report records
        </div>
      </div>

      <div className="reports-note">
        <strong>Note:</strong> All figures shown on this page are sample data.
        Actual school reports will be calculated from the MySQL database when
        backend integration is completed.
      </div>
    </div>
  );
}

export default AdminReports;