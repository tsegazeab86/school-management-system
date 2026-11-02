
import   { useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  Search,
  RotateCcw,
  BookOpen,
//   Clock,
  CheckCircle,
  AlertTriangle,
  CalendarDays,
//   User,
  X,
  Check,
  History,
  Filter,
} from "lucide-react";
import "./ReturnBooks.css";

const initialRecords = [
  {
    id: "ISS-1001",
    studentId: "STU-001",
    student: "Abebe Bekele",
    grade: "Grade 10",
    book: "Introduction to Computer Science",
    category: "Computer Science",
    issueDate: "2026-10-20",
    dueDate: "2026-10-30",
    status: "Issued",
  },
  {
    id: "ISS-1002",
    studentId: "STU-002",
    student: "Mekdes Alemu",
    grade: "Grade 9",
    book: "Basic Mathematics",
    category: "Mathematics",
    issueDate: "2026-10-15",
    dueDate: "2026-10-25",
    status: "Overdue",
  },
  {
    id: "ISS-1003",
    studentId: "STU-003",
    student: "Dawit Tadesse",
    grade: "Grade 11",
    book: "English Grammar",
    category: "Language",
    issueDate: "2026-10-22",
    dueDate: "2026-11-05",
    status: "Issued",
  },
  {
    id: "ISS-1004",
    studentId: "STU-004",
    student: "Hana Getachew",
    grade: "Grade 10",
    book: "Physics for Beginners",
    category: "Science",
    issueDate: "2026-10-10",
    dueDate: "2026-10-20",
    status: "Overdue",
  },
  {
    id: "ISS-1005",
    studentId: "STU-005",
    student: "Samuel Girma",
    grade: "Grade 12",
    book: "Database Management Systems",
    category: "Computer Science",
    issueDate: "2026-10-24",
    dueDate: "2026-11-07",
    status: "Issued",
  },
];

const today = new Date().toISOString().slice(0, 10);

function getStatus(record) {
  if (record.status === "Returned") return "Returned";
  return record.dueDate < today ? "Overdue" : "Issued";
}

export default function ReturnBooks() {
  const [records, setRecords] = useState(initialRecords);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [returnHistory, setReturnHistory] = useState([]);

  const activeRecords = records.filter(
    (record) => record.status !== "Returned"
  );

  const overdueRecords = activeRecords.filter(
    (record) => getStatus(record) === "Overdue"
  );

  const filteredRecords = useMemo(() => {
    return records.filter((record) => {
      const keyword = search.toLowerCase();

      const matchesSearch =
        record.id.toLowerCase().includes(keyword) ||
        record.student.toLowerCase().includes(keyword) ||
        record.studentId.toLowerCase().includes(keyword) ||
        record.book.toLowerCase().includes(keyword);

      const status = getStatus(record);
      const matchesStatus =
        statusFilter === "All" || status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [records, search, statusFilter]);

  const handleReturn = () => {
    if (!selectedRecord) return;

    const returnedRecord = {
      ...selectedRecord,
      status: "Returned",
      returnDate: today,
    };

    setRecords((previous) =>
      previous.map((record) =>
        record.id === selectedRecord.id ? returnedRecord : record
      )
    );

    setReturnHistory((previous) => [returnedRecord, ...previous]);
    setSelectedRecord(null);
    setShowConfirm(false);
  };

  const stats = [
    {
      title: "Active Issues",
      value: activeRecords.length,
      icon: BookOpen,
      color: "blue",
      description: "Books currently borrowed",
    },
    {
      title: "Overdue Books",
      value: overdueRecords.length,
      icon: AlertTriangle,
      color: "red",
      description: "Past their return date",
    },
    {
      title: "Returned Today",
      value: returnHistory.filter(
        (record) => record.returnDate === today
      ).length,
      icon: CheckCircle,
      color: "green",
      description: "Recorded in this session",
    },
    {
      title: "Total Records",
      value: records.length,
      icon: History,
      color: "purple",
      description: "All borrowing records",
    },
  ];

  return (
    <div className="return-page">
      <div className="return-header">
        <div>
          <span className="return-eyebrow">LIBRARY MANAGEMENT</span>
          <h2>Return Books</h2>
          <p>Manage borrowed books and record student returns.</p>
        </div>

        <div className="return-date">
          <CalendarDays size={18} />
          <span>{new Date().toLocaleDateString()}</span>
        </div>
      </div>

      <div className="return-stats">
        {stats.map((stat, index) => {
          const Icon = stat.icon;

          return (
            <motion.div
              className="return-stat-card"
              key={stat.title}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.08 }}
            >
              <div className={`return-stat-icon ${stat.color}`}>
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

      <div className="return-content">
        <section className="return-table-card">
          <div className="return-section-heading">
            <div>
              <h3>Borrowing Records</h3>
              <p>Find a borrowed book and process its return.</p>
            </div>
            <span className="return-record-count">
              {filteredRecords.length} records
            </span>
          </div>

          <div className="return-toolbar">
            <div className="return-search">
              <Search size={19} />
              <input
                type="text"
                placeholder="Search student, book, issue ID..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <div className="return-filter">
              <Filter size={17} />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="All">All Status</option>
                <option value="Issued">Issued</option>
                <option value="Overdue">Overdue</option>
                <option value="Returned">Returned</option>
              </select>
            </div>
          </div>

          <div className="return-table-wrap">
            <table className="return-table">
              <thead>
                <tr>
                  <th>Issue ID</th>
                  <th>Student</th>
                  <th>Book Title</th>
                  <th>Issue Date</th>
                  <th>Due Date</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>
                {filteredRecords.map((record) => {
                  const status = getStatus(record);

                  return (
                    <tr key={record.id}>
                      <td>
                        <strong className="return-id">{record.id}</strong>
                      </td>
                      <td>
                        <div className="return-student">
                          <div className="return-avatar">
                            {record.student.charAt(0)}
                          </div>
                          <div>
                            <strong>{record.student}</strong>
                            <small>{record.studentId}</small>
                          </div>
                        </div>
                      </td>
                      <td>
                        <strong>{record.book}</strong>
                        <small className="return-category">
                          {record.category}
                        </small>
                      </td>
                      <td>{record.issueDate}</td>
                      <td>{record.dueDate}</td>
                      <td>
                        <span className={`return-status ${status.toLowerCase()}`}>
                          {status}
                        </span>
                      </td>
                      <td>
                        {status !== "Returned" ? (
                          <button
                            className="return-action-btn"
                            onClick={() => {
                              setSelectedRecord(record);
                              setShowConfirm(true);
                            }}
                          >
                            <RotateCcw size={15} />
                            Return
                          </button>
                        ) : (
                          <span className="return-completed">
                            <Check size={15} /> Completed
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}

                {filteredRecords.length === 0 && (
                  <tr>
                    <td colSpan="7" className="return-empty">
                      No borrowing records found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        <section className="return-history-card">
          <div className="return-section-heading">
            <div>
              <h3>Recent Return History</h3>
              <p>Books returned during this session.</p>
            </div>
            <History size={20} />
          </div>

          {returnHistory.length === 0 ? (
            <div className="return-history-empty">
              <div className="return-empty-icon">
                <BookOpen size={25} />
              </div>
              <strong>No returns recorded yet</strong>
              <p>Returned books will appear here.</p>
            </div>
          ) : (
            <div className="return-history-list">
              {returnHistory.map((record) => (
                <div className="return-history-item" key={record.id}>
                  <div className="return-history-icon">
                    <CheckCircle size={18} />
                  </div>
                  <div>
                    <strong>{record.book}</strong>
                    <span>{record.student} · {record.id}</span>
                    <small>Returned: {record.returnDate}</small>
                  </div>
                  <span className="return-history-done">Returned</span>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      {showConfirm && selectedRecord && (
        <div
          className="return-modal-overlay"
          onClick={() => setShowConfirm(false)}
        >
          <motion.div
            className="return-modal"
            initial={{ opacity: 0, scale: 0.94 }}
            animate={{ opacity: 1, scale: 1 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="return-modal-header">
              <div className="return-modal-icon">
                <RotateCcw size={22} />
              </div>
              <button
                className="return-close-btn"
                onClick={() => setShowConfirm(false)}
              >
                <X size={20} />
              </button>
            </div>

            <h3>Confirm Book Return</h3>
            <p className="return-modal-description">
              Are you sure you want to record this book as returned?
            </p>

            <div className="return-confirm-details">
              <div>
                <span>Student</span>
                <strong>{selectedRecord.student}</strong>
              </div>
              <div>
                <span>Student ID</span>
                <strong>{selectedRecord.studentId}</strong>
              </div>
              <div>
                <span>Book</span>
                <strong>{selectedRecord.book}</strong>
              </div>
              <div>
                <span>Due Date</span>
                <strong>{selectedRecord.dueDate}</strong>
              </div>
              <div>
                <span>Return Date</span>
                <strong>{today}</strong>
              </div>
            </div>

            <div className="return-modal-actions">
              <button
                className="return-cancel-btn"
                onClick={() => setShowConfirm(false)}
              >
                Cancel
              </button>
              <button className="return-confirm-btn" onClick={handleReturn}>
                <Check size={17} />
                Confirm Return
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
