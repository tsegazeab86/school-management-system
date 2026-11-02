
import  { useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Filter,
  ClipboardList,
  CalendarDays,
//   Clock,
  BookOpen,
  User,
  Upload,
  FileText,
//   Download,
  X,
  CheckCircle2,
  AlertCircle,
  Hourglass,
  Eye,
  Send,
  FileCheck2,
} from "lucide-react";
import "./StudentAssignments.css";

const initialAssignments = [
  {
    id: 1,
    title: "Introduction to React Components",
    subject: "Web Development",
    teacher: "Mr. Daniel",
    className: "Grade 12 - Section A",
    assignedDate: "2026-10-20",
    dueDate: "2026-11-05",
    status: "Pending",
    description:
      "Create a React application that demonstrates reusable components and props.",
    instructions: [
      "Create at least three reusable React components.",
      "Use props to pass data between components.",
      "Apply CSS styling to your components.",
      "Submit your project as a ZIP file or PDF report.",
    ],
    marks: 20,
  },
  {
    id: 2,
    title: "Database Design and Normalization",
    subject: "Database Systems",
    teacher: "Mrs. Hana",
    className: "Grade 12 - Section A",
    assignedDate: "2026-10-15",
    dueDate: "2026-10-28",
    status: "Submitted",
    description:
      "Design a database for a school management system and explain normalization.",
    instructions: [
      "Create an ER diagram.",
      "Identify primary and foreign keys.",
      "Explain 1NF, 2NF, and 3NF.",
      "Submit your work as a PDF document.",
    ],
    marks: 25,
    submittedFile: "Database_Design.pdf",
    submittedDate: "2026-10-26",
  },
  {
    id: 3,
    title: "Data Structures: Linked Lists",
    subject: "Data Structures",
    teacher: "Mr. Samuel",
    className: "Grade 12 - Section A",
    assignedDate: "2026-10-18",
    dueDate: "2026-11-10",
    status: "Pending",
    description:
      "Explain linked lists and demonstrate insertion and deletion operations.",
    instructions: [
      "Explain singly linked lists.",
      "Draw a linked list diagram.",
      "Write a program demonstrating insertion.",
      "Write a program demonstrating deletion.",
    ],
    marks: 20,
  },
  {
    id: 4,
    title: "Computer Networking Assignment",
    subject: "Computer Networks",
    teacher: "Mrs. Selam",
    className: "Grade 12 - Section A",
    assignedDate: "2026-10-10",
    dueDate: "2026-10-25",
    status: "Graded",
    description:
      "Answer questions about LAN, WAN, IP addressing, and network devices.",
    instructions: [
      "Define LAN and WAN.",
      "Explain the function of a router.",
      "Describe IPv4 addressing.",
      "Submit a PDF document.",
    ],
    marks: 15,
    submittedFile: "Networking_Assignment.pdf",
    submittedDate: "2026-10-23",
    grade: 13,
    feedback: "Good work. Review subnetting examples for improvement.",
  },
];

const getStatusClass = (status) => {
  if (status === "Submitted") return "sa-submitted";
  if (status === "Graded") return "sa-graded";
  if (status === "Late") return "sa-late";
  return "sa-pending";
};

function StudentAssignments() {
  const [assignments, setAssignments] = useState(initialAssignments);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [message, setMessage] = useState("");
  const fileInputRef = useRef(null);

  const filteredAssignments = useMemo(() => {
    return assignments.filter((assignment) => {
      const matchesSearch =
        assignment.title.toLowerCase().includes(search.toLowerCase()) ||
        assignment.subject.toLowerCase().includes(search.toLowerCase()) ||
        assignment.teacher.toLowerCase().includes(search.toLowerCase());

      const matchesStatus =
        statusFilter === "All" || assignment.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [assignments, search, statusFilter]);

  const pendingCount = assignments.filter(
    (item) => item.status === "Pending"
  ).length;

  const submittedCount = assignments.filter(
    (item) => item.status === "Submitted"
  ).length;

  const gradedCount = assignments.filter(
    (item) => item.status === "Graded"
  ).length;

  const handleFileChange = (event) => {
    const file = event.target.files?.[0];

    if (!file) return;

    const allowedExtensions = [
      "pdf",
      "doc",
      "docx",
      "ppt",
      "pptx",
      "zip",
    ];

    const extension = file.name.split(".").pop().toLowerCase();

    if (!allowedExtensions.includes(extension)) {
      setMessage("Please select a PDF, DOC, DOCX, PPT, PPTX, or ZIP file.");
      setSelectedFile(null);
      event.target.value = "";
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setMessage("File size must be 10MB or less.");
      setSelectedFile(null);
      event.target.value = "";
      return;
    }

    setSelectedFile(file);
    setMessage("");
  };

  const handleSubmit = () => {
    if (!selectedAssignment || !selectedFile) {
      setMessage("Please select a file before submitting.");
      return;
    }

    if (selectedAssignment.status === "Graded") {
      setMessage("This assignment has already been graded.");
      return;
    }

    const today = new Date().toISOString().slice(0, 10);
    const isLate = today > selectedAssignment.dueDate;

    setAssignments((previous) =>
      previous.map((item) =>
        item.id === selectedAssignment.id
          ? {
              ...item,
              status: isLate ? "Late" : "Submitted",
              submittedFile: selectedFile.name,
              submittedDate: today,
            }
          : item
      )
    );

    setMessage("Assignment submitted successfully!");

    setTimeout(() => {
      setSelectedAssignment(null);
      setSelectedFile(null);
      setMessage("");
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }, 1000);
  };

  const openAssignment = (assignment) => {
    setSelectedAssignment(assignment);
    setSelectedFile(null);
    setMessage("");
  };

  const closeModal = () => {
    setSelectedAssignment(null);
    setSelectedFile(null);
    setMessage("");
  };

  return (
    <div className="student-assignments">
      {/* Page Header */}
      <motion.div
        className="sa-header"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div>
          <span className="sa-eyebrow">STUDENT PORTAL</span>
          <h1>My Assignments</h1>
          <p>View your tasks, complete your work, and submit assignments.</p>
        </div>

        <div className="sa-header-icon">
          <ClipboardList size={34} />
        </div>
      </motion.div>

      {/* Statistics */}
      <div className="sa-stats">
        <motion.div
          className="sa-stat-card sa-stat-total"
          whileHover={{ y: -5 }}
        >
          <div className="sa-stat-icon">
            <BookOpen size={23} />
          </div>
          <div>
            <span>Total Assignments</span>
            <h2>{assignments.length}</h2>
          </div>
        </motion.div>

        <motion.div
          className="sa-stat-card sa-stat-pending"
          whileHover={{ y: -5 }}
        >
          <div className="sa-stat-icon">
            <Hourglass size={23} />
          </div>
          <div>
            <span>Pending</span>
            <h2>{pendingCount}</h2>
          </div>
        </motion.div>

        <motion.div
          className="sa-stat-card sa-stat-submitted"
          whileHover={{ y: -5 }}
        >
          <div className="sa-stat-icon">
            <FileCheck2 size={23} />
          </div>
          <div>
            <span>Submitted</span>
            <h2>{submittedCount}</h2>
          </div>
        </motion.div>

        <motion.div
          className="sa-stat-card sa-stat-graded"
          whileHover={{ y: -5 }}
        >
          <div className="sa-stat-icon">
            <CheckCircle2 size={23} />
          </div>
          <div>
            <span>Graded</span>
            <h2>{gradedCount}</h2>
          </div>
        </motion.div>
      </div>

      {/* Search and Filters */}
      <div className="sa-toolbar">
        <div className="sa-search">
          <Search size={19} />
          <input
            type="text"
            placeholder="Search assignments, subjects, teachers..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="sa-filter">
          <Filter size={18} />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="All">All Status</option>
            <option value="Pending">Pending</option>
            <option value="Submitted">Submitted</option>
            <option value="Late">Late</option>
            <option value="Graded">Graded</option>
          </select>
        </div>
      </div>

      {/* Assignment Cards */}
      <div className="sa-section-heading">
        <div>
          <h2>Assignment List</h2>
          <p>{filteredAssignments.length} assignments found</p>
        </div>
      </div>

      <div className="sa-assignment-grid">
        <AnimatePresence mode="popLayout">
          {filteredAssignments.map((assignment) => (
            <motion.div
              key={assignment.id}
              className="sa-assignment-card"
              layout
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              whileHover={{ y: -5 }}
            >
              <div className="sa-card-top">
                <div className="sa-subject-icon">
                  <FileText size={23} />
                </div>

                <span className={`sa-status ${getStatusClass(assignment.status)}`}>
                  {assignment.status}
                </span>
              </div>

              <span className="sa-subject-name">{assignment.subject}</span>
              <h3>{assignment.title}</h3>
              <p className="sa-card-description">
                {assignment.description}
              </p>

              <div className="sa-card-details">
                <div>
                  <User size={16} />
                  <span>{assignment.teacher}</span>
                </div>

                <div>
                  <CalendarDays size={16} />
                  <span>Due: {assignment.dueDate}</span>
                </div>

                <div>
                  <ClipboardList size={16} />
                  <span>{assignment.marks} Marks</span>
                </div>
              </div>

              {assignment.status === "Graded" && (
                <div className="sa-grade-preview">
                  <span>Your Score</span>
                  <strong>
                    {assignment.grade}/{assignment.marks}
                  </strong>
                </div>
              )}

              <button
                className="sa-view-btn"
                onClick={() => openAssignment(assignment)}
              >
                <Eye size={17} />
                View Details
              </button>
            </motion.div>
          ))}
        </AnimatePresence>

        {filteredAssignments.length === 0 && (
          <div className="sa-empty">
            <AlertCircle size={35} />
            <h3>No assignments found</h3>
            <p>Try changing your search or filter.</p>
          </div>
        )}
      </div>

      {/* Assignment Details Modal */}
      <AnimatePresence>
        {selectedAssignment && (
          <motion.div
            className="sa-modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeModal}
          >
            <motion.div
              className="sa-modal"
              initial={{ opacity: 0, y: 30, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.96 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="sa-modal-header">
                <div>
                  <span>ASSIGNMENT DETAILS</span>
                  <h2>{selectedAssignment.title}</h2>
                </div>

                <button
                  className="sa-close-btn"
                  onClick={closeModal}
                  aria-label="Close"
                >
                  <X size={22} />
                </button>
              </div>

              <div className="sa-modal-content">
                <div className="sa-modal-info">
                  <div>
                    <span>Subject</span>
                    <strong>{selectedAssignment.subject}</strong>
                  </div>
                  <div>
                    <span>Teacher</span>
                    <strong>{selectedAssignment.teacher}</strong>
                  </div>
                  <div>
                    <span>Due Date</span>
                    <strong>{selectedAssignment.dueDate}</strong>
                  </div>
                  <div>
                    <span>Total Marks</span>
                    <strong>{selectedAssignment.marks}</strong>
                  </div>
                </div>

                <div className="sa-instructions">
                  <h3>
                    <BookOpen size={19} />
                    Instructions
                  </h3>
                  <p>{selectedAssignment.description}</p>
                  <ul>
                    {selectedAssignment.instructions.map((instruction, index) => (
                      <li key={index}>{instruction}</li>
                    ))}
                  </ul>
                </div>

                {selectedAssignment.status === "Graded" && (
                  <div className="sa-feedback">
                    <h3>Teacher Feedback</h3>
                    <p>{selectedAssignment.feedback}</p>
                    <strong>
                      Score: {selectedAssignment.grade}/
                      {selectedAssignment.marks}
                    </strong>
                  </div>
                )}

                {selectedAssignment.submittedFile && (
                  <div className="sa-submitted-file">
                    <FileCheck2 size={20} />
                    <div>
                      <strong>{selectedAssignment.submittedFile}</strong>
                      <span>
                        Submitted: {selectedAssignment.submittedDate}
                      </span>
                    </div>
                  </div>
                )}

                {selectedAssignment.status !== "Graded" && (
                  <div className="sa-upload-section">
                    <h3>
                      <Upload size={19} />
                      Upload Your Assignment
                    </h3>

                    <p>
                      Accepted formats: PDF, DOC, DOCX, PPT, PPTX, ZIP.
                      Maximum size: 10MB.
                    </p>

                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".pdf,.doc,.docx,.ppt,.pptx,.zip"
                      onChange={handleFileChange}
                    />

                    {selectedFile && (
                      <div className="sa-selected-file">
                        <FileText size={19} />
                        <span>{selectedFile.name}</span>
                      </div>
                    )}

                    <button
                      className="sa-submit-btn"
                      onClick={handleSubmit}
                      disabled={!selectedFile}
                    >
                      <Send size={17} />
                      Submit Assignment
                    </button>
                  </div>
                )}

                {message && (
                  <div
                    className={`sa-message ${
                      message.includes("successfully") ? "sa-success" : "sa-error"
                    }`}
                  >
                    {message}
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default StudentAssignments;
