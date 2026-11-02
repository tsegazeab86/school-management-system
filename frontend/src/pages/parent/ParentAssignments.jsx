
import { useState } from "react";
import {
    ClipboardList,
    Search,
    Filter,
    CalendarDays,
    BookOpen,
    Clock,
    CheckCircle,
    AlertCircle,
    Eye,
    X,
    UserRound,
    GraduationCap,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import "./ParentAssignments.css";

const assignmentsData = [
    {
        id: 1,
        title: "Algebra Exercises",
        subject: "Mathematics",
        child: "Abebe Tadesse",
        grade: "Grade 10",
        teacher: "Mr. Daniel",
        assignedDate: "2026-10-27",
        dueDate: "2026-11-03",
        status: "Submitted",
        description:
            "Complete exercises from chapter four covering algebraic equations and expressions.",
        marks: "18/20",
    },
    {
        id: 2,
        title: "English Essay Writing",
        subject: "English",
        child: "Abebe Tadesse",
        grade: "Grade 10",
        teacher: "Mrs. Sara",
        assignedDate: "2026-10-29",
        dueDate: "2026-11-05",
        status: "Pending",
        description:
            "Write an essay about the importance of education in modern society.",
        marks: "Not graded",
    },
    {
        id: 3,
        title: "Physics Laboratory Report",
        subject: "Physics",
        child: "Abebe Tadesse",
        grade: "Grade 10",
        teacher: "Mr. Michael",
        assignedDate: "2026-10-25",
        dueDate: "2026-10-30",
        status: "Overdue",
        description:
            "Prepare a laboratory report based on the recent physics experiment.",
        marks: "Not graded",
    },
    {
        id: 4,
        title: "Science Project",
        subject: "Science",
        child: "Hana Tadesse",
        grade: "Grade 7",
        teacher: "Mrs. Almaz",
        assignedDate: "2026-10-28",
        dueDate: "2026-11-07",
        status: "Submitted",
        description:
            "Prepare a short project about environmental protection.",
        marks: "19/20",
    },
    {
        id: 5,
        title: "Amharic Reading",
        subject: "Amharic",
        child: "Hana Tadesse",
        grade: "Grade 7",
        teacher: "Mr. Getachew",
        assignedDate: "2026-10-30",
        dueDate: "2026-11-08",
        status: "Pending",
        description:
            "Read the assigned passage and prepare a short written summary.",
        marks: "Not graded",
    },
];

function ParentAssignments() {
    const [assignments] = useState(assignmentsData);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("All");
    const [childFilter, setChildFilter] = useState("All");
    const [selectedAssignment, setSelectedAssignment] = useState(null);

    const filteredAssignments = assignments.filter((assignment) => {
        const searchText = search.trim().toLowerCase();

        const matchesSearch =
            assignment.title.toLowerCase().includes(searchText) ||
            assignment.subject.toLowerCase().includes(searchText) ||
            assignment.child.toLowerCase().includes(searchText) ||
            assignment.teacher.toLowerCase().includes(searchText);

        const matchesStatus =
            statusFilter === "All" || assignment.status === statusFilter;

        const matchesChild =
            childFilter === "All" || assignment.child === childFilter;

        return matchesSearch && matchesStatus && matchesChild;
    });

    const submittedCount = assignments.filter(
        (item) => item.status === "Submitted"
    ).length;

    const pendingCount = assignments.filter(
        (item) => item.status === "Pending"
    ).length;

    const overdueCount = assignments.filter(
        (item) => item.status === "Overdue"
    ).length;

    const getStatusClass = (status) => {
        if (status === "Submitted") return "submitted";
        if (status === "Pending") return "pending";
        return "overdue";
    };

    const getStatusIcon = (status) => {
        if (status === "Submitted") return <CheckCircle size={15} />;
        if (status === "Pending") return <Clock size={15} />;
        return <AlertCircle size={15} />;
    };

    return (
        <div className="parent-assignments-page container-fluid">
            {/* Header */}
            <motion.div
                className="pa-header"
                initial={{ opacity: 0, y: -15 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <div>
                    <h2>Assignments</h2>
                    <p>
                        Monitor your children's homework, projects, and assignment progress.
                    </p>
                </div>

                <div className="pa-header-icon">
                    <ClipboardList size={30} />
                </div>
            </motion.div>

            {/* Statistics */}
            <div className="row g-4 pa-stats">
                <div className="col-12 col-sm-6 col-xl-4">
                    <motion.div className="pa-stat-card" whileHover={{ y: -5 }}>
                        <div className="pa-stat-icon purple">
                            <ClipboardList size={25} />
                        </div>
                        <div>
                            <span>Total Assignments</span>
                            <h3>{assignments.length}</h3>
                            <small>All children's assignments</small>
                        </div>
                    </motion.div>
                </div>

                <div className="col-12 col-sm-6 col-xl-4">
                    <motion.div className="pa-stat-card" whileHover={{ y: -5 }}>
                        <div className="pa-stat-icon green">
                            <CheckCircle size={25} />
                        </div>
                        <div>
                            <span>Submitted</span>
                            <h3>{submittedCount}</h3>
                            <small>Completed assignments</small>
                        </div>
                    </motion.div>
                </div>

                <div className="col-12 col-sm-6 col-xl-4">
                    <motion.div className="pa-stat-card" whileHover={{ y: -5 }}>
                        <div className="pa-stat-icon orange">
                            <Clock size={25} />
                        </div>
                        <div>
                            <span>Pending / Overdue</span>
                            <h3>{pendingCount + overdueCount}</h3>
                            <small>Need attention</small>
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* Status Summary */}
            <div className="pa-status-summary">
                <div>
                    <span className="pa-dot green-dot" />
                    Submitted: <strong>{submittedCount}</strong>
                </div>
                <div>
                    <span className="pa-dot orange-dot" />
                    Pending: <strong>{pendingCount}</strong>
                </div>
                <div>
                    <span className="pa-dot red-dot" />
                    Overdue: <strong>{overdueCount}</strong>
                </div>
            </div>

            {/* Search and Filters */}
            <div className="pa-filter-card">
                <div className="pa-search">
                    <Search size={19} />
                    <input
                        type="text"
                        placeholder="Search assignments, subjects, or children..."
                        value={search}
                        onChange={(event) => setSearch(event.target.value)}
                    />
                </div>

                <div className="pa-filter-control">
                    <Filter size={18} />
                    <select
                        className="form-select"
                        value={childFilter}
                        onChange={(event) => setChildFilter(event.target.value)}
                    >
                        <option value="All">All Children</option>
                        <option value="Abebe Tadesse">Abebe Tadesse</option>
                        <option value="Hana Tadesse">Hana Tadesse</option>
                    </select>
                </div>

                <div className="pa-filter-control">
                    <select
                        className="form-select"
                        value={statusFilter}
                        onChange={(event) => setStatusFilter(event.target.value)}
                    >
                        <option value="All">All Statuses</option>
                        <option value="Submitted">Submitted</option>
                        <option value="Pending">Pending</option>
                        <option value="Overdue">Overdue</option>
                    </select>
                </div>
            </div>

            {/* Assignments Table */}
            <div className="pa-table-card">
                <div className="pa-table-header">
                    <div>
                        <h4>Assignment List</h4>
                        <p>View assignment details and submission progress.</p>
                    </div>
                    <span>{filteredAssignments.length} results</span>
                </div>

                <div className="table-responsive">
                    <table className="table pa-table align-middle">
                        <thead>
                            <tr>
                                <th>Assignment</th>
                                <th>Child</th>
                                <th>Teacher</th>
                                <th>Due Date</th>
                                <th>Status</th>
                                <th>Marks</th>
                                <th>Action</th>
                            </tr>
                        </thead>

                        <tbody>
                            {filteredAssignments.map((assignment) => (
                                <motion.tr
                                    key={assignment.id}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                >
                                    <td>
                                        <div className="pa-assignment-name">
                                            <div className="pa-book-icon">
                                                <BookOpen size={18} />
                                            </div>
                                            <div>
                                                <strong>{assignment.title}</strong>
                                                <small>{assignment.subject}</small>
                                            </div>
                                        </div>
                                    </td>

                                    <td>
                                        <strong>{assignment.child}</strong>
                                        <small className="pa-secondary-text">
                                            {assignment.grade}
                                        </small>
                                    </td>

                                    <td>{assignment.teacher}</td>

                                    <td>
                                        <div className="pa-date">
                                            <CalendarDays size={15} />
                                            {assignment.dueDate}
                                        </div>
                                    </td>

                                    <td>
                                        <span
                                            className={`pa-status ${getStatusClass(
                                                assignment.status
                                            )}`}
                                        >
                                            {getStatusIcon(assignment.status)}
                                            {assignment.status}
                                        </span>
                                    </td>

                                    <td>{assignment.marks}</td>

                                    <td>
                                        <button
                                            className="pa-view-btn"
                                            onClick={() => setSelectedAssignment(assignment)}
                                            aria-label={`View ${assignment.title}`}
                                        >
                                            <Eye size={17} />
                                        </button>
                                    </td>
                                </motion.tr>
                            ))}
                        </tbody>
                    </table>

                    {filteredAssignments.length === 0 && (
                        <div className="pa-empty">
                            <ClipboardList size={40} />
                            <h5>No assignments found</h5>
                            <p>Try changing your search or filters.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Assignment Details Modal */}
            <AnimatePresence>
                {selectedAssignment && (
                    <motion.div
                        className="pa-modal-overlay"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setSelectedAssignment(null)}
                    >
                        <motion.div
                            className="pa-details-modal"
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            onClick={(event) => event.stopPropagation()}
                        >
                            <div className="pa-modal-header">
                                <div>
                                    <h4>Assignment Details</h4>
                                    <p>Detailed assignment information</p>
                                </div>

                                <button
                                    className="pa-close-icon"
                                    onClick={() => setSelectedAssignment(null)}
                                    aria-label="Close"
                                >
                                    <X size={21} />
                                </button>
                            </div>

                            <div className="pa-modal-title">
                                <div className="pa-modal-book-icon">
                                    <BookOpen size={27} />
                                </div>
                                <div>
                                    <h5>{selectedAssignment.title}</h5>
                                    <span>{selectedAssignment.subject}</span>
                                </div>
                            </div>

                            <div className="pa-detail-grid">
                                <div>
                                    <span>Student</span>
                                    <strong>
                                        <UserRound size={15} />
                                        {selectedAssignment.child}
                                    </strong>
                                </div>

                                <div>
                                    <span>Class</span>
                                    <strong>
                                        <GraduationCap size={16} />
                                        {selectedAssignment.grade}
                                    </strong>
                                </div>

                                <div>
                                    <span>Assigned Date</span>
                                    <strong>{selectedAssignment.assignedDate}</strong>
                                </div>

                                <div>
                                    <span>Due Date</span>
                                    <strong>{selectedAssignment.dueDate}</strong>
                                </div>

                                <div>
                                    <span>Teacher</span>
                                    <strong>{selectedAssignment.teacher}</strong>
                                </div>

                                <div>
                                    <span>Marks</span>
                                    <strong>{selectedAssignment.marks}</strong>
                                </div>
                            </div>

                            <div className="pa-description">
                                <h6>Assignment Description</h6>
                                <p>{selectedAssignment.description}</p>
                            </div>

                            <div className="pa-modal-status">
                                <span>Submission Status</span>
                                <strong
                                    className={`pa-status ${getStatusClass(
                                        selectedAssignment.status
                                    )}`}
                                >
                                    {getStatusIcon(selectedAssignment.status)}
                                    {selectedAssignment.status}
                                </strong>
                            </div>

                            <div className="pa-parent-notice">
                                <strong>Parent Access:</strong>
                                You can view assignment information and monitor progress.
                                Assignment submission and editing are handled by the student
                                and authorized teachers.
                            </div>

                            <button
                                className="btn pa-modal-close-btn"
                                onClick={() => setSelectedAssignment(null)}
                            >
                                Close
                            </button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

export default ParentAssignments;
