
import   { useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  BookOpen,
  BookCheck,
  RotateCcw,
  AlertTriangle,
  Download,
  Search,
  TrendingUp,
  CalendarDays,
  BarChart3,
  PieChart,
  FileText,
} from "lucide-react";
import "./LibraryReports.css";

const monthlyData = [
  { month: "May", issued: 32, returned: 25 },
  { month: "Jun", issued: 45, returned: 37 },
  { month: "Jul", issued: 38, returned: 34 },
  { month: "Aug", issued: 55, returned: 48 },
  { month: "Sep", issued: 62, returned: 51 },
  { month: "Oct", issued: 72, returned: 59 },
];

const categoryData = [
  { name: "Mathematics", count: 42, color: "#3b82f6" },
  { name: "Computer Science", count: 35, color: "#8b5cf6" },
  { name: "Language", count: 31, color: "#10b981" },
  { name: "Science", count: 28, color: "#f59e0b" },
  { name: "Biology", count: 20, color: "#ec4899" },
  { name: "History", count: 18, color: "#64748b" },
];

const borrowingRecords = [
  {
    id: "ISS-1001",
    student: "Abebe Bekele",
    book: "Introduction to Computer Science",
    category: "Computer Science",
    issueDate: "2026-10-20",
    dueDate: "2026-10-30",
    returnDate: "",
    status: "Issued",
  },
  {
    id: "ISS-1002",
    student: "Mekdes Alemu",
    book: "Basic Mathematics",
    category: "Mathematics",
    issueDate: "2026-10-15",
    dueDate: "2026-10-25",
    returnDate: "",
    status: "Overdue",
  },
  {
    id: "ISS-1003",
    student: "Dawit Tadesse",
    book: "English Grammar",
    category: "Language",
    issueDate: "2026-10-22",
    dueDate: "2026-11-05",
    returnDate: "",
    status: "Issued",
  },
  {
    id: "ISS-1004",
    student: "Hana Getachew",
    book: "Physics for Beginners",
    category: "Science",
    issueDate: "2026-10-10",
    dueDate: "2026-10-20",
    returnDate: "2026-10-28",
    status: "Returned",
  },
  {
    id: "ISS-1005",
    student: "Samuel Girma",
    book: "Database Management Systems",
    category: "Computer Science",
    issueDate: "2026-10-24",
    dueDate: "2026-11-07",
    returnDate: "",
    status: "Issued",
  },
  {
    id: "ISS-1006",
    student: "Daniel Worku",
    book: "Introduction to Biology",
    category: "Biology",
    issueDate: "2026-10-12",
    dueDate: "2026-10-22",
    returnDate: "2026-10-27",
    status: "Returned",
  },
];

const popularBooks = [
  { title: "Introduction to Computer Science", category: "Computer Science", borrows: 48 },
  { title: "Basic Mathematics", category: "Mathematics", borrows: 42 },
  { title: "English Grammar", category: "Language", borrows: 36 },
  { title: "Physics for Beginners", category: "Science", borrows: 31 },
  { title: "Database Management Systems", category: "Computer Science", borrows: 27 },
];

export default function LibraryReports() {
  const [records] = useState(borrowingRecords);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [period, setPeriod] = useState("Last 6 Months");

  const stats = [
    {
      title: "Total Books",
      value: "174",
      description: "Books in library",
      icon: BookOpen,
      color: "blue",
    },
    {
      title: "Currently Issued",
      value: "48",
      description: "Books with students",
      icon: BookCheck,
      color: "purple",
    },
    {
      title: "Returned Books",
      value: "126",
      description: "Returned successfully",
      icon: RotateCcw,
      color: "green",
    },
    {
      title: "Overdue Books",
      value: "12",
      description: "Need follow-up",
      icon: AlertTriangle,
      color: "red",
    },
  ];

  const filteredRecords = useMemo(() => {
    return records.filter((record) => {
      const keyword = search.toLowerCase();

      const matchesSearch =
        record.id.toLowerCase().includes(keyword) ||
        record.student.toLowerCase().includes(keyword) ||
        record.book.toLowerCase().includes(keyword);

      const matchesStatus =
        statusFilter === "All" || record.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [records, search, statusFilter]);

  const maxMonthlyValue = Math.max(
    ...monthlyData.map((item) => Math.max(item.issued, item.returned))
  );

  const maxCategoryValue = Math.max(
    ...categoryData.map((item) => item.count)
  );

  const exportCSV = () => {
    const headers = [
      "Issue ID",
      "Student",
      "Book",
      "Category",
      "Issue Date",
      "Due Date",
      "Return Date",
      "Status",
    ];

    const rows = filteredRecords.map((record) => [
      record.id,
      record.student,
      record.book,
      record.category,
      record.issueDate,
      record.dueDate,
      record.returnDate || "Not returned",
      record.status,
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
    link.download = "library-report.csv";
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="library-reports-page">
      <div className="library-reports-header">
        <div>
          <span className="library-reports-eyebrow">LIBRARY MANAGEMENT</span>
          <h2>Library Reports</h2>
          <p>Monitor borrowing activities and library performance.</p>
        </div>

        <button className="library-report-export" onClick={exportCSV}>
          <Download size={17} />
          Export Report
        </button>
      </div>

      <div className="library-report-stats">
        {stats.map((stat, index) => {
          const Icon = stat.icon;

          return (
            <motion.div
              key={stat.title}
              className="library-report-stat"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.08 }}
            >
              <div className={`library-report-stat-icon ${stat.color}`}>
                <Icon size={22} />
              </div>
              <div>
                <span>{stat.title}</span>
                <h3>{stat.value}</h3>
                <small>{stat.description}</small>
              </div>
            </motion.div>
          );
        })}
      </div>

      <div className="library-report-charts">
        <section className="library-report-card monthly-card">
          <div className="library-report-card-heading">
            <div>
              <h3>
                <BarChart3 size={19} />
                Monthly Borrowing Activity
              </h3>
              <p>Books issued and returned each month.</p>
            </div>

            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
            >
              <option>Last 6 Months</option>
              <option>Last 3 Months</option>
              <option>This Year</option>
            </select>
          </div>

          <div className="library-chart-legend">
            <span><i className="issued-dot" /> Issued</span>
            <span><i className="returned-dot" /> Returned</span>
          </div>

          <div className="monthly-chart">
            {monthlyData.map((item) => {
              const visible =
                period === "Last 3 Months"
                  ? ["Aug", "Sep", "Oct"].includes(item.month)
                  : true;

              if (!visible) return null;

              return (
                <div className="monthly-chart-column" key={item.month}>
                  <div className="monthly-bars">
                    <div
                      className="monthly-bar issued-bar"
                      style={{
                        height: `${(item.issued / maxMonthlyValue) * 100}%`,
                      }}
                      title={`Issued: ${item.issued}`}
                    />
                    <div
                      className="monthly-bar returned-bar"
                      style={{
                        height: `${(item.returned / maxMonthlyValue) * 100}%`,
                      }}
                      title={`Returned: ${item.returned}`}
                    />
                  </div>
                  <span>{item.month}</span>
                </div>
              );
            })}
          </div>
        </section>

        <section className="library-report-card category-report-card">
          <div className="library-report-card-heading">
            <div>
              <h3>
                <PieChart size={19} />
                Books by Category
              </h3>
              <p>Distribution of library collection.</p>
            </div>
          </div>

          <div className="category-report-list">
            {categoryData.map((category) => (
              <div className="category-report-item" key={category.name}>
                <div className="category-report-label">
                  <span>{category.name}</span>
                  <strong>{category.count}</strong>
                </div>
                <div className="category-report-track">
                  <div
                    className="category-report-fill"
                    style={{
                      width: `${(category.count / maxCategoryValue) * 100}%`,
                      background: category.color,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      <section className="library-report-card popular-books-card">
        <div className="library-report-card-heading">
          <div>
            <h3>
              <TrendingUp size={19} />
              Most Borrowed Books
            </h3>
            <p>Popular books based on sample borrowing counts.</p>
          </div>
        </div>

        <div className="popular-books-list">
          {popularBooks.map((book, index) => (
            <div className="popular-book-item" key={book.title}>
              <span className="popular-book-rank">{index + 1}</span>
              <div className="popular-book-info">
                <strong>{book.title}</strong>
                <small>{book.category}</small>
              </div>
              <div className="popular-book-count">
                <strong>{book.borrows}</strong>
                <span>borrows</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="library-report-card library-records-card">
        <div className="library-report-card-heading">
          <div>
            <h3>
              <FileText size={19} />
              Borrowing Records
            </h3>
            <p>Search and review library transactions.</p>
          </div>
          <span className="library-record-count">
            {filteredRecords.length} records
          </span>
        </div>

        <div className="library-record-toolbar">
          <div className="library-record-search">
            <Search size={18} />
            <input
              type="text"
              placeholder="Search student, book, issue ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <select
            className="library-record-filter"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="All">All Status</option>
            <option value="Issued">Issued</option>
            <option value="Returned">Returned</option>
            <option value="Overdue">Overdue</option>
          </select>
        </div>

        <div className="library-record-table-wrap">
          <table className="library-record-table">
            <thead>
              <tr>
                <th>Issue ID</th>
                <th>Student</th>
                <th>Book</th>
                <th>Issue Date</th>
                <th>Due Date</th>
                <th>Return Date</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredRecords.map((record) => (
                <tr key={record.id}>
                  <td><strong>{record.id}</strong></td>
                  <td>{record.student}</td>
                  <td>{record.book}</td>
                  <td>{record.issueDate}</td>
                  <td>{record.dueDate}</td>
                  <td>{record.returnDate || "—"}</td>
                  <td>
                    <span className={`library-record-status ${record.status.toLowerCase()}`}>
                      {record.status}
                    </span>
                  </td>
                </tr>
              ))}

              {filteredRecords.length === 0 && (
                <tr>
                  <td colSpan="7" className="library-record-empty">
                    No records found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <div className="library-report-footer">
        <CalendarDays size={17} />
        <span>Report data shown here is sample data for the frontend demonstration.</span>
      </div>
    </div>
  );
}
