
import   { useMemo, useState } from "react";
import {
  BookOpen,
  BookPlus,
  Search,
  UserRound,
  CalendarDays,
  Clock,
  CheckCircle2,
  X,
  ArrowRight,
  Library,
  ClipboardList,
  AlertCircle,
  RotateCcw,
} from "lucide-react";
import "./IssueBooks.css";

const initialStudents = [
  { id: "STU-1001", name: "Abebe Kebede", grade: "Grade 10", className: "10A" },
  { id: "STU-1002", name: "Martha Alemu", grade: "Grade 11", className: "11B" },
  { id: "STU-1003", name: "Dawit Tadesse", grade: "Grade 12", className: "12A" },
  { id: "STU-1004", name: "Selamawit Bekele", grade: "Grade 9", className: "9C" },
  { id: "STU-1005", name: "Nahom Getachew", grade: "Grade 10", className: "10B" },
];

const initialBooks = [
  {
    id: 1,
    title: "Introduction to Algorithms",
    author: "Thomas H. Cormen",
    isbn: "9780262046305",
    category: "Computer Science",
    available: 14,
  },
  {
    id: 2,
    title: "Clean Code",
    author: "Robert C. Martin",
    isbn: "9780132350884",
    category: "Programming",
    available: 8,
  },
  {
    id: 3,
    title: "Database System Concepts",
    author: "Abraham Silberschatz",
    isbn: "9780073523323",
    category: "Database",
    available: 12,
  },
  {
    id: 4,
    title: "Operating System Concepts",
    author: "Abraham Silberschatz",
    isbn: "9780133594140",
    category: "Computer Science",
    available: 5,
  },
  {
    id: 5,
    title: "Computer Networks",
    author: "Andrew S. Tanenbaum",
    isbn: "9780132126953",
    category: "Networking",
    available: 10,
  },
  {
    id: 6,
    title: "Design Patterns",
    author: "Erich Gamma",
    isbn: "9780201633610",
    category: "Software Engineering",
    available: 0,
  },
];

const today = new Date().toISOString().slice(0, 10);

const addDays = (dateString, days) => {
  const date = new Date(`${dateString}T12:00:00`);
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
};

function IssueBooks() {
  const [students] = useState(initialStudents);
  const [books, setBooks] = useState(initialBooks);
  const [studentSearch, setStudentSearch] = useState("");
  const [bookSearch, setBookSearch] = useState("");
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [selectedBook, setSelectedBook] = useState(null);
  const [borrowDate, setBorrowDate] = useState(today);
  const [returnDate, setReturnDate] = useState(addDays(today, 14));
  const [issuedRecords, setIssuedRecords] = useState([
    {
      id: "ISS-1001",
      student: "Abebe Kebede",
      studentId: "STU-1001",
      book: "Introduction to Algorithms",
      borrowDate: "2026-10-20",
      returnDate: "2026-11-03",
      status: "Issued",
    },
    {
      id: "ISS-1002",
      student: "Martha Alemu",
      studentId: "STU-1002",
      book: "Clean Code",
      borrowDate: "2026-10-22",
      returnDate: "2026-11-05",
      status: "Issued",
    },
    {
      id: "ISS-1003",
      student: "Dawit Tadesse",
      studentId: "STU-1003",
      book: "Database System Concepts",
      borrowDate: "2026-10-01",
      returnDate: "2026-10-15",
      status: "Overdue",
    },
  ]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const filteredStudents = useMemo(() => {
    const query = studentSearch.toLowerCase();

    return students.filter(
      (student) =>
        student.name.toLowerCase().includes(query) ||
        student.id.toLowerCase().includes(query)
    );
  }, [students, studentSearch]);

  const filteredBooks = useMemo(() => {
    const query = bookSearch.toLowerCase();

    return books.filter(
      (book) =>
        book.available > 0 &&
        (book.title.toLowerCase().includes(query) ||
          book.author.toLowerCase().includes(query) ||
          book.isbn.toLowerCase().includes(query))
    );
  }, [books, bookSearch]);

  const issueBook = (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!selectedStudent) {
      setError("Please select a student.");
      return;
    }

    if (!selectedBook) {
      setError("Please select an available book.");
      return;
    }

    if (!borrowDate || !returnDate) {
      setError("Please select both borrowing and return dates.");
      return;
    }

    if (borrowDate < today) {
      setError("Borrow date cannot be in the past.");
      return;
    }

    if (returnDate <= borrowDate) {
      setError("Return date must be after the borrow date.");
      return;
    }

    const bookStillAvailable = books.find(
      (book) => book.id === selectedBook.id
    );

    if (!bookStillAvailable || bookStillAvailable.available < 1) {
      setError("This book is no longer available.");
      setSelectedBook(null);
      return;
    }

    const newRecord = {
      id: `ISS-${Date.now()}`,
      student: selectedStudent.name,
      studentId: selectedStudent.id,
      book: selectedBook.title,
      borrowDate,
      returnDate,
      status: "Issued",
    };

    setIssuedRecords((prev) => [newRecord, ...prev]);

    setBooks((prev) =>
      prev.map((book) =>
        book.id === selectedBook.id
          ? { ...book, available: book.available - 1 }
          : book
      )
    );

    setSuccess(`${selectedBook.title} was issued to ${selectedStudent.name}.`);
    setSelectedStudent(null);
    setSelectedBook(null);
    setStudentSearch("");
    setBookSearch("");
    setBorrowDate(today);
    setReturnDate(addDays(today, 14));
  };

  const issuedCount = issuedRecords.filter(
    (record) => record.status === "Issued"
  ).length;

  const overdueCount = issuedRecords.filter(
    (record) => record.status === "Overdue"
  ).length;

  const totalAvailable = books.reduce(
    (sum, book) => sum + book.available,
    0
  );

  return (
    <div className="issue-books-page">
      {/* Header */}
      <div className="ib-page-header">
        <div>
          <div className="ib-breadcrumb">
            <Library size={15} />
            <span>Library</span>
            <span>/</span>
            <span>Issue Books</span>
          </div>

          <h1>Issue Books</h1>
          <p>Issue library books to registered students and manage borrowing records.</p>
        </div>

        <div className="ib-header-icon">
          <BookPlus size={32} />
        </div>
      </div>

      {/* Statistics */}
      <div className="ib-stats-grid">
        <div className="ib-stat-card">
          <div className="ib-stat-icon blue"><BookOpen size={22} /></div>
          <div>
            <span>Available Copies</span>
            <h2>{totalAvailable}</h2>
            <small>Ready to issue</small>
          </div>
        </div>

        <div className="ib-stat-card">
          <div className="ib-stat-icon green"><CheckCircle2 size={22} /></div>
          <div>
            <span>Active Issues</span>
            <h2>{issuedCount}</h2>
            <small>Currently borrowed</small>
          </div>
        </div>

        <div className="ib-stat-card">
          <div className="ib-stat-icon orange"><Clock size={22} /></div>
          <div>
            <span>Overdue Records</span>
            <h2>{overdueCount}</h2>
            <small>Past return date</small>
          </div>
        </div>

        <div className="ib-stat-card">
          <div className="ib-stat-icon purple"><UserRound size={22} /></div>
          <div>
            <span>Registered Students</span>
            <h2>{students.length}</h2>
            <small>Sample student records</small>
          </div>
        </div>
      </div>

      {/* Main layout */}
      <div className="ib-main-grid">
        <form className="ib-panel ib-issue-form" onSubmit={issueBook}>
          <div className="ib-panel-heading">
            <div className="ib-heading-icon"><BookPlus size={21} /></div>
            <div>
              <h2>New Book Issue</h2>
              <p>Complete the form to issue a book.</p>
            </div>
          </div>

          {/* Student selection */}
          <div className="ib-section-title">
            <span>01</span>
            <div>
              <h3>Select Student</h3>
              <p>Find the registered student who wants to borrow a book.</p>
            </div>
          </div>

          <div className="ib-search-field">
            <Search size={18} />
            <input
              type="text"
              placeholder="Search by student name or ID..."
              value={studentSearch}
              onChange={(e) => {
                setStudentSearch(e.target.value);
                setSelectedStudent(null);
              }}
            />
          </div>

          {!selectedStudent && studentSearch && (
            <div className="ib-selection-list">
              {filteredStudents.map((student) => (
                <button
                  type="button"
                  key={student.id}
                  onClick={() => {
                    setSelectedStudent(student);
                    setStudentSearch("");
                  }}
                >
                  <div className="ib-person-avatar">
                    {student.name.charAt(0)}
                  </div>
                  <span>
                    <strong>{student.name}</strong>
                    <small>{student.id} · {student.grade} · Class {student.className}</small>
                  </span>
                  <ArrowRight size={17} />
                </button>
              ))}

              {filteredStudents.length === 0 && (
                <p className="ib-no-match">No student found.</p>
              )}
            </div>
          )}

          {selectedStudent && (
            <div className="ib-selected-card">
              <div className="ib-person-avatar">{selectedStudent.name.charAt(0)}</div>
              <div className="ib-selected-info">
                <strong>{selectedStudent.name}</strong>
                <span>{selectedStudent.id} · {selectedStudent.grade} · Class {selectedStudent.className}</span>
              </div>
              <button
                type="button"
                title="Remove student"
                onClick={() => setSelectedStudent(null)}
              >
                <X size={17} />
              </button>
            </div>
          )}

          {/* Book selection */}
          <div className="ib-section-title ib-second-section">
            <span>02</span>
            <div>
              <h3>Select Book</h3>
              <p>Choose a book that is currently available.</p>
            </div>
          </div>

          <div className="ib-search-field">
            <Search size={18} />
            <input
              type="text"
              placeholder="Search book title, author or ISBN..."
              value={bookSearch}
              onChange={(e) => {
                setBookSearch(e.target.value);
                setSelectedBook(null);
              }}
            />
          </div>

          {!selectedBook && bookSearch && (
            <div className="ib-selection-list ib-book-results">
              {filteredBooks.map((book) => (
                <button
                  type="button"
                  key={book.id}
                  onClick={() => {
                    setSelectedBook(book);
                    setBookSearch("");
                  }}
                >
                  <div className="ib-book-result-icon"><BookOpen size={20} /></div>
                  <span>
                    <strong>{book.title}</strong>
                    <small>{book.author} · {book.available} copies available</small>
                  </span>
                  <ArrowRight size={17} />
                </button>
              ))}

              {filteredBooks.length === 0 && (
                <p className="ib-no-match">No available book found.</p>
              )}
            </div>
          )}

          {selectedBook && (
            <div className="ib-selected-card ib-selected-book">
              <div className="ib-book-result-icon"><BookOpen size={20} /></div>
              <div className="ib-selected-info">
                <strong>{selectedBook.title}</strong>
                <span>{selectedBook.author} · {selectedBook.available} copies available</span>
              </div>
              <button
                type="button"
                title="Remove book"
                onClick={() => setSelectedBook(null)}
              >
                <X size={17} />
              </button>
            </div>
          )}

          {/* Dates */}
          <div className="ib-section-title ib-second-section">
            <span>03</span>
            <div>
              <h3>Borrowing Period</h3>
              <p>Set the date the book is issued and when it must be returned.</p>
            </div>
          </div>

          <div className="ib-date-grid">
            <div className="ib-form-group">
              <label><CalendarDays size={15} /> Borrow Date</label>
              <input
                type="date"
                min={today}
                value={borrowDate}
                onChange={(e) => {
                  setBorrowDate(e.target.value);
                  if (returnDate <= e.target.value) {
                    setReturnDate(addDays(e.target.value, 14));
                  }
                }}
              />
            </div>

            <div className="ib-form-group">
              <label><RotateCcw size={15} /> Return Date</label>
              <input
                type="date"
                min={addDays(borrowDate, 1)}
                value={returnDate}
                onChange={(e) => setReturnDate(e.target.value)}
              />
            </div>
          </div>

          <div className="ib-period-note">
            <Clock size={17} />
            <span>Default borrowing period: 14 days. The return date can be adjusted according to library policy.</span>
          </div>

          {error && (
            <div className="ib-message error">
              <AlertCircle size={17} /> {error}
            </div>
          )}

          {success && (
            <div className="ib-message success">
              <CheckCircle2 size={17} /> {success}
            </div>
          )}

          <div className="ib-form-actions">
            <button
              type="button"
              className="ib-reset-btn"
              onClick={() => {
                setSelectedStudent(null);
                setSelectedBook(null);
                setStudentSearch("");
                setBookSearch("");
                setError("");
                setSuccess("");
                setBorrowDate(today);
                setReturnDate(addDays(today, 14));
              }}
            >
              Reset Form
            </button>

            <button type="submit" className="ib-submit-btn">
              <BookPlus size={18} />
              Issue Book
            </button>
          </div>
        </form>

        {/* Side panel */}
        <aside className="ib-side-column">
          <div className="ib-panel ib-instructions">
            <div className="ib-panel-heading">
              <div className="ib-heading-icon purple"><ClipboardList size={20} /></div>
              <div>
                <h2>Issuing Guidelines</h2>
                <p>Important library procedures</p>
              </div>
            </div>

            <div className="ib-guideline-list">
              <div>
                <span className="ib-guide-number">1</span>
                <p>Confirm that the student is registered in the school system.</p>
              </div>
              <div>
                <span className="ib-guide-number">2</span>
                <p>Check the book's availability before issuing it.</p>
              </div>
              <div>
                <span className="ib-guide-number">3</span>
                <p>Set a valid return date according to library policy.</p>
              </div>
              <div>
                <span className="ib-guide-number">4</span>
                <p>Remind the student to return the book on time.</p>
              </div>
            </div>
          </div>

          <div className="ib-panel ib-summary">
            <div className="ib-panel-heading">
              <div className="ib-heading-icon green"><CheckCircle2 size={20} /></div>
              <div>
                <h2>Issue Summary</h2>
                <p>Current form selection</p>
              </div>
            </div>

            <div className="ib-summary-row">
              <span>Selected Student</span>
              <strong>{selectedStudent ? selectedStudent.name : "Not selected"}</strong>
            </div>
            <div className="ib-summary-row">
              <span>Selected Book</span>
              <strong>{selectedBook ? selectedBook.title : "Not selected"}</strong>
            </div>
            <div className="ib-summary-row">
              <span>Borrow Date</span>
              <strong>{borrowDate}</strong>
            </div>
            <div className="ib-summary-row">
              <span>Return Date</span>
              <strong>{returnDate}</strong>
            </div>

            <div className="ib-summary-bottom">
              <span>Issue Status</span>
              <strong>Pending submission</strong>
            </div>
          </div>
        </aside>
      </div>

      {/* Issued records */}
      <section className="ib-panel ib-records-panel">
        <div className="ib-panel-heading">
          <div className="ib-heading-icon blue"><ClipboardList size={21} /></div>
          <div>
            <h2>Recent Issued Books</h2>
            <p>Latest borrowing records from the library.</p>
          </div>
        </div>

        <div className="ib-records-table-wrap">
          <table className="ib-records-table">
            <thead>
              <tr>
                <th>Issue ID</th>
                <th>Student</th>
                <th>Book Title</th>
                <th>Borrow Date</th>
                <th>Return Date</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {issuedRecords.map((record) => (
                <tr key={record.id}>
                  <td className="ib-record-id">{record.id}</td>
                  <td>
                    <strong>{record.student}</strong>
                    <small>{record.studentId}</small>
                  </td>
                  <td>{record.book}</td>
                  <td>{record.borrowDate}</td>
                  <td>{record.returnDate}</td>
                  <td>
                    <span className={`ib-record-status ${record.status.toLowerCase()}`}>
                      {record.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

export default IssueBooks;
