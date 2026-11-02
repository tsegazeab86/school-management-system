
import   { useState } from "react";
import { motion } from "framer-motion";
import {
  Search,
  AlertTriangle,
  BookOpen,
  Users,
  Bell,
  CalendarDays,
  Eye,
  X,
  Download,
  Clock,
  CheckCircle,
  Filter,
} from "lucide-react";
import "./OverdueBooks.css";

const initialOverdueBooks = [
  {
    id: "ISS-1002",
    studentId: "STU-002",
    student: "Mekdes Alemu",
    grade: "Grade 9",
    phone: "0912345678",
    book: "Basic Mathematics",
    category: "Mathematics",
    issueDate: "2026-10-15",
    dueDate: "2026-10-25",
    reminder: "Not Sent",
  },
  {
    id: "ISS-1004",
    studentId: "STU-004",
    student: "Hana Getachew",
    grade: "Grade 10",
    phone: "0923456789",
    book: "Physics for Beginners",
    category: "Science",
    issueDate: "2026-10-10",
    dueDate: "2026-10-20",
    reminder: "Sent",
  },
  {
    id: "ISS-1006",
    studentId: "STU-006",
    student: "Daniel Worku",
    grade: "Grade 11",
    phone: "0934567890",
    book: "Introduction to Biology",
    category: "Biology",
    issueDate: "2026-10-12",
    dueDate: "2026-10-22",
    reminder: "Not Sent",
  },
  {
    id: "ISS-1007",
    studentId: "STU-007",
    student: "Rahel Tesfaye",
    grade: "Grade 12",
    phone: "0945678901",
    book: "Database Management Systems",
    category: "Computer Science",
    issueDate: "2026-10-05",
    dueDate: "2026-10-15",
    reminder: "Sent",
  },
  {
    id: "ISS-1008",
    studentId: "STU-008",
    student: "Yonas Kebede",
    grade: "Grade 9",
    phone: "0956789012",
    book: "English Grammar",
    category: "Language",
    issueDate: "2026-10-18",
    dueDate: "2026-10-28",
    reminder: "Not Sent",
  },
];

function calculateDaysLate(dueDate) {
  const due = new Date(`${dueDate}T00:00:00`);
  const now = new Date();
  const today = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate()
  );

  return Math.max(0, Math.floor((today - due) / 86400000));
}

export default function OverdueBooks() {
  const [books, setBooks] = useState(initialOverdueBooks);
  const [search, setSearch] = useState("");
  const [durationFilter, setDurationFilter] = useState("All");
  const [reminderFilter, setReminderFilter] = useState("All");
  const [selectedBook, setSelectedBook] = useState(null);
  const [showDetails, setShowDetails] = useState(false);

  const filteredBooks = books.filter((book) => {
    const keyword = search.toLowerCase();

    const matchesSearch =
      book.id.toLowerCase().includes(keyword) ||
      book.student.toLowerCase().includes(keyword) ||
      book.studentId.toLowerCase().includes(keyword) ||
      book.book.toLowerCase().includes(keyword);

    const daysLate = calculateDaysLate(book.dueDate);

    const matchesDuration =
      durationFilter === "All" ||
      (durationFilter === "1-7" && daysLate >= 1 && daysLate <= 7) ||
      (durationFilter === "8-14" && daysLate >= 8 && daysLate <= 14) ||
      (durationFilter === "15+" && daysLate >= 15);

    const matchesReminder =
      reminderFilter === "All" || book.reminder === reminderFilter;

    return matchesSearch && matchesDuration && matchesReminder;
  });

  const reminderCount = books.filter(
    (book) => book.reminder === "Sent"
  ).length;

  const stats = [
    {
      title: "Overdue Books",
      value: books.length,
      description: "Books not returned",
      icon: BookOpen,
      color: "blue",
    },
    {
      title: "Students Affected",
      value: new Set(books.map((book) => book.studentId)).size,
      description: "Students with overdue books",
      icon: Users,
      color: "purple",
    },
    {
      title: "Reminders Sent",
      value: reminderCount,
      description: "Marked as reminded",
      icon: Bell,
      color: "green",
    },
    {
      title: "Reminders Pending",
      value: books.length - reminderCount,
      description: "Still need follow-up",
      icon: AlertTriangle,
      color: "red",
    },
  ];

  const sendReminder = (id) => {
    setBooks((previous) =>
      previous.map((book) =>
        book.id === id ? { ...book, reminder: "Sent" } : book
      )
    );
  };

  const exportCSV = () => {
    const headers = [
      "Issue ID",
      "Student ID",
      "Student",
      "Grade",
      "Book",
      "Issue Date",
      "Due Date",
      "Days Late",
      "Reminder",
    ];

    const rows = filteredBooks.map((book) => [
      book.id,
      book.studentId,
      book.student,
      book.grade,
      book.book,
      book.issueDate,
      book.dueDate,
      calculateDaysLate(book.dueDate),
      book.reminder,
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
    link.download = "overdue-books.csv";
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="overdue-page">
      <div className="overdue-header">
        <div>
          <span className="overdue-eyebrow">LIBRARY MANAGEMENT</span>
          <h2>Overdue Books</h2>
          <p>Track late returns and follow up with students.</p>
        </div>

        <button className="overdue-export-btn" onClick={exportCSV}>
          <Download size={17} />
          Export CSV
        </button>
      </div>

      <div className="overdue-alert">
        <div className="overdue-alert-icon">
          <AlertTriangle size={21} />
        </div>
        <div>
          <strong>Overdue book follow-up</strong>
          <p>
            Review late borrowing records and remind students to return
            their books to the library.
          </p>
        </div>
      </div>

      <div className="overdue-stats">
        {stats.map((stat, index) => {
          const Icon = stat.icon;

          return (
            <motion.div
              className="overdue-stat-card"
              key={stat.title}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.08 }}
            >
              <div className={`overdue-stat-icon ${stat.color}`}>
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

      <section className="overdue-table-card">
        <div className="overdue-section-heading">
          <div>
            <h3>Overdue Borrowing Records</h3>
            <p>Students who have not returned borrowed books on time.</p>
          </div>
          <span className="overdue-count">
            {filteredBooks.length} records
          </span>
        </div>

        <div className="overdue-toolbar">
          <div className="overdue-search">
            <Search size={18} />
            <input
              type="text"
              placeholder="Search student, book, or issue ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="overdue-filter">
            <Filter size={16} />
            <select
              value={durationFilter}
              onChange={(e) => setDurationFilter(e.target.value)}
            >
              <option value="All">All durations</option>
              <option value="1-7">1–7 days late</option>
              <option value="8-14">8–14 days late</option>
              <option value="15+">15+ days late</option>
            </select>
          </div>

          <div className="overdue-filter">
            <Bell size={16} />
            <select
              value={reminderFilter}
              onChange={(e) => setReminderFilter(e.target.value)}
            >
              <option value="All">All reminders</option>
              <option value="Sent">Sent</option>
              <option value="Not Sent">Not sent</option>
            </select>
          </div>
        </div>

        <div className="overdue-table-wrap">
          <table className="overdue-table">
            <thead>
              <tr>
                <th>Issue ID</th>
                <th>Student</th>
                <th>Book Title</th>
                <th>Due Date</th>
                <th>Days Late</th>
                <th>Reminder</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {filteredBooks.map((book) => {
                const daysLate = calculateDaysLate(book.dueDate);

                return (
                  <tr key={book.id}>
                    <td>
                      <strong className="overdue-id">{book.id}</strong>
                    </td>

                    <td>
                      <div className="overdue-student">
                        <div className="overdue-avatar">
                          {book.student.charAt(0)}
                        </div>
                        <div>
                          <strong>{book.student}</strong>
                          <small>{book.studentId}</small>
                        </div>
                      </div>
                    </td>

                    <td>
                      <strong className="overdue-book-title">
                        {book.book}
                      </strong>
                      <small className="overdue-category">
                        {book.category}
                      </small>
                    </td>

                    <td>{book.dueDate}</td>

                    <td>
                      <span className="overdue-days">
                        <Clock size={13} />
                        {daysLate} days
                      </span>
                    </td>

                    <td>
                      <span
                        className={`overdue-reminder ${
                          book.reminder === "Sent" ? "sent" : "pending"
                        }`}
                      >
                        {book.reminder === "Sent" ? (
                          <CheckCircle size={13} />
                        ) : (
                          <AlertTriangle size={13} />
                        )}
                        {book.reminder}
                      </span>
                    </td>

                    <td>
                      <div className="overdue-actions">
                        <button
                          className="overdue-view-btn"
                          title="View details"
                          onClick={() => {
                            setSelectedBook(book);
                            setShowDetails(true);
                          }}
                        >
                          <Eye size={16} />
                        </button>

                        {book.reminder === "Not Sent" && (
                          <button
                            className="overdue-remind-btn"
                            onClick={() => sendReminder(book.id)}
                          >
                            <Bell size={14} />
                            Remind
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}

              {filteredBooks.length === 0 && (
                <tr>
                  <td colSpan="7" className="overdue-empty">
                    No overdue records match your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <div className="overdue-note">
        <CalendarDays size={18} />
        <span>
          Days late are calculated automatically using today's date and
          each book's due date.
        </span>
      </div>

      {showDetails && selectedBook && (
        <div
          className="overdue-modal-overlay"
          onClick={() => setShowDetails(false)}
        >
          <motion.div
            className="overdue-modal"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="overdue-modal-header">
              <div>
                <span>LIBRARY RECORD</span>
                <h3>Overdue Details</h3>
              </div>
              <button onClick={() => setShowDetails(false)}>
                <X size={20} />
              </button>
            </div>

            <div className="overdue-detail-grid">
              <div>
                <span>Issue ID</span>
                <strong>{selectedBook.id}</strong>
              </div>
              <div>
                <span>Student ID</span>
                <strong>{selectedBook.studentId}</strong>
              </div>
              <div>
                <span>Student Name</span>
                <strong>{selectedBook.student}</strong>
              </div>
              <div>
                <span>Grade</span>
                <strong>{selectedBook.grade}</strong>
              </div>
              <div>
                <span>Phone</span>
                <strong>{selectedBook.phone}</strong>
              </div>
              <div>
                <span>Book Title</span>
                <strong>{selectedBook.book}</strong>
              </div>
              <div>
                <span>Issue Date</span>
                <strong>{selectedBook.issueDate}</strong>
              </div>
              <div>
                <span>Due Date</span>
                <strong>{selectedBook.dueDate}</strong>
              </div>
              <div>
                <span>Days Late</span>
                <strong>
                  {calculateDaysLate(selectedBook.dueDate)} days
                </strong>
              </div>
              <div>
                <span>Reminder Status</span>
                <strong>{selectedBook.reminder}</strong>
              </div>
            </div>

            <div className="overdue-modal-footer">
              {selectedBook.reminder === "Not Sent" && (
                <button
                  className="overdue-remind-btn"
                  onClick={() => {
                    sendReminder(selectedBook.id);
                    setSelectedBook({
                      ...selectedBook,
                      reminder: "Sent",
                    });
                  }}
                >
                  <Bell size={15} />
                  Mark Reminder Sent
                </button>
              )}

              <button
                className="overdue-close-btn"
                onClick={() => setShowDetails(false)}
              >
                Close
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
