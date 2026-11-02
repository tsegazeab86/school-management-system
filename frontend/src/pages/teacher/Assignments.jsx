
import  { useMemo, useState } from "react";
import {
  Plus,
  Search,
  FileText,
  CalendarDays,
  Users,
  Clock,
  CheckCircle2,
  MoreVertical,
  Pencil,
  Trash2,
  Download,
  X,
  BookOpen,
  ClipboardList,
  Send,
  Filter,
} from "lucide-react";
import "./Assignments.css";

const initialAssignments = [
  {
    id: 1,
    title: "Algebra and Equations",
    description: "Solve the assigned algebra problems from Chapter 4.",
    className: "Grade 10A",
    subject: "Mathematics",
    dueDate: "2026-11-05",
    totalStudents: 38,
    submitted: 29,
    status: "Published",
  },
  {
    id: 2,
    title: "Introduction to Algorithms",
    description: "Explain the basic concepts of algorithms and flowcharts.",
    className: "Grade 11A",
    subject: "Computer Science",
    dueDate: "2026-11-08",
    totalStudents: 32,
    submitted: 18,
    status: "Published",
  },
  {
    id: 3,
    title: "Geometry Exercises",
    description: "Complete exercises on triangles and geometric shapes.",
    className: "Grade 10B",
    subject: "Mathematics",
    dueDate: "2026-11-12",
    totalStudents: 35,
    submitted: 0,
    status: "Draft",
  },
  {
    id: 4,
    title: "Programming Fundamentals",
    description: "Write a short explanation of variables and data types.",
    className: "Grade 11B",
    subject: "Computer Science",
    dueDate: "2026-10-25",
    totalStudents: 30,
    submitted: 30,
    status: "Published",
  },
];

const emptyForm = {
  title: "",
  description: "",
  className: "Grade 10A",
  subject: "Mathematics",
  dueDate: "",
  status: "Published",
};

const classOptions = [
  { name: "Grade 10A", subject: "Mathematics" },
  { name: "Grade 10B", subject: "Mathematics" },
  { name: "Grade 11A", subject: "Computer Science" },
  { name: "Grade 11B", subject: "Computer Science" },
];

function TeacherAssignments() {
  const [assignments, setAssignments] = useState(initialAssignments);
  const [search, setSearch] = useState("");
  const [classFilter, setClassFilter] = useState("All Classes");
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [menuId, setMenuId] = useState(null);
  const [notice, setNotice] = useState("");

  const filteredAssignments = useMemo(() => {
    return assignments.filter((item) => {
      const matchesSearch =
        `${item.title} ${item.subject} ${item.className}`
          .toLowerCase()
          .includes(search.toLowerCase());

      const matchesClass =
        classFilter === "All Classes" || item.className === classFilter;

      const matchesStatus =
        statusFilter === "All Status" || item.status === statusFilter;

      return matchesSearch && matchesClass && matchesStatus;
    });
  }, [assignments, search, classFilter, statusFilter]);

  const publishedCount = assignments.filter(
    (item) => item.status === "Published"
  ).length;

  const totalSubmissions = assignments.reduce(
    (sum, item) => sum + item.submitted,
    0
  );

  const pendingSubmissions = assignments.reduce(
    (sum, item) => sum + Math.max(0, item.totalStudents - item.submitted),
    0
  );

  const openCreateModal = () => {
    setEditingId(null);
    setForm(emptyForm);
    setShowModal(true);
  };

  const openEditModal = (item) => {
    setEditingId(item.id);
    setForm({
      title: item.title,
      description: item.description,
      className: item.className,
      subject: item.subject,
      dueDate: item.dueDate,
      status: item.status,
    });
    setShowModal(true);
    setMenuId(null);
  };

  const handleClassChange = (className) => {
    const selected = classOptions.find((item) => item.name === className);
    setForm((previous) => ({
      ...previous,
      className,
      subject: selected?.subject || "",
    }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!form.title.trim() || !form.dueDate) {
      return;
    }

    if (editingId) {
      setAssignments((previous) =>
        previous.map((item) =>
          item.id === editingId
            ? { ...item, ...form }
            : item
        )
      );
      setNotice("Assignment updated successfully.");
    } else {
      const selectedClass = classOptions.find(
        (item) => item.name === form.className
      );

      const newAssignment = {
        ...form,
        id: Date.now(),
        totalStudents:
          form.className === "Grade 10A" ? 38 :
          form.className === "Grade 10B" ? 35 :
          form.className === "Grade 11A" ? 32 : 30,
        submitted: 0,
        subject: selectedClass?.subject || form.subject,
      };

      setAssignments((previous) => [newAssignment, ...previous]);
      setNotice("New assignment created successfully.");
    }

    setShowModal(false);
    setEditingId(null);
    setForm(emptyForm);
  };

  const deleteAssignment = (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this assignment?"
    );

    if (!confirmed) return;

    setAssignments((previous) =>
      previous.filter((item) => item.id !== id)
    );
    setMenuId(null);
    setNotice("Assignment deleted.");
  };

  const exportCSV = () => {
    const rows = [
      ["Title", "Class", "Subject", "Due Date", "Submitted", "Total Students", "Status"],
      ...filteredAssignments.map((item) => [
        item.title,
        item.className,
        item.subject,
        item.dueDate,
        item.submitted,
        item.totalStudents,
        item.status,
      ]),
    ];

    const csv = rows
      .map((row) =>
        row.map((value) => `"${String(value).replace(/"/g, '""')}"`).join(",")
      )
      .join("\n");

    const blob = new Blob(["\uFEFF" + csv], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "teacher-assignments.csv";
    link.click();
    URL.revokeObjectURL(url);
  };

  const getSubmissionPercentage = (item) =>
    item.totalStudents
      ? Math.round((item.submitted / item.totalStudents) * 100)
      : 0;

  const getDueLabel = (date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const due = new Date(`${date}T00:00:00`);
    const difference = Math.ceil((due - today) / 86400000);

    if (difference < 0) return "Past due";
    if (difference === 0) return "Due today";
    if (difference === 1) return "Due tomorrow";
    return `${difference} days left`;
  };

  return (
    <div className="assignments-page">
      <header className="as-header">
        <div>
          <span className="as-eyebrow">TEACHER PORTAL</span>
          <h1>Assignments</h1>
          <p>Create, organize, and track student assignments.</p>
        </div>

        <button className="as-create-btn" onClick={openCreateModal}>
          <Plus size={19} />
          Create Assignment
        </button>
      </header>

      {notice && (
        <div className="as-notice">
          <CheckCircle2 size={17} />
          {notice}
          <button onClick={() => setNotice("")} aria-label="Dismiss">
            <X size={16} />
          </button>
        </div>
      )}

      <section className="as-welcome-banner">
        <div className="as-banner-content">
          <span>ASSIGNMENT CENTER</span>
          <h2>Make learning more engaging.</h2>
          <p>
            Create meaningful tasks, follow student progress, and keep every
            class organized in one place.
          </p>
          <button onClick={openCreateModal}>
            <Plus size={17} /> Create New Assignment
          </button>
        </div>
        <div className="as-banner-decoration">
          <div className="as-decoration-circle circle-one" />
          <div className="as-decoration-circle circle-two" />
          <div className="as-decoration-icon">
            <ClipboardList size={64} />
          </div>
        </div>
      </section>

      <section className="as-stats">
        <div className="as-stat-card">
          <span className="as-stat-icon violet"><FileText size={22} /></span>
          <div>
            <p>Total Assignments</p>
            <h2>{assignments.length}</h2>
            <small>All created assignments</small>
          </div>
        </div>

        <div className="as-stat-card">
          <span className="as-stat-icon blue"><Send size={22} /></span>
          <div>
            <p>Published</p>
            <h2>{publishedCount}</h2>
            <small>Visible to students</small>
          </div>
        </div>

        <div className="as-stat-card">
          <span className="as-stat-icon green"><CheckCircle2 size={22} /></span>
          <div>
            <p>Submissions Received</p>
            <h2>{totalSubmissions}</h2>
            <small>Total student submissions</small>
          </div>
        </div>

        <div className="as-stat-card">
          <span className="as-stat-icon orange"><Clock size={22} /></span>
          <div>
            <p>Pending Submissions</p>
            <h2>{pendingSubmissions}</h2>
            <small>Across all assignments</small>
          </div>
        </div>
      </section>

      <section className="as-list-panel">
        <div className="as-list-heading">
          <div>
            <h2>My Assignments</h2>
            <p>Manage your tasks and monitor student submissions.</p>
          </div>

          <button className="as-export-btn" onClick={exportCSV}>
            <Download size={17} /> Export CSV
          </button>
        </div>

        <div className="as-toolbar">
          <label className="as-search">
            <Search size={18} />
            <input
              type="search"
              placeholder="Search assignment..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </label>

          <div className="as-filter">
            <Filter size={16} />
            <select
              value={classFilter}
              onChange={(event) => setClassFilter(event.target.value)}
            >
              <option>All Classes</option>
              {classOptions.map((item) => (
                <option key={item.name}>{item.name}</option>
              ))}
            </select>
          </div>

          <div className="as-filter">
            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
            >
              <option>All Status</option>
              <option>Published</option>
              <option>Draft</option>
            </select>
          </div>
        </div>

        <div className="as-assignment-grid">
          {filteredAssignments.map((item, index) => {
            const percentage = getSubmissionPercentage(item);

            return (
              <article
                className="as-assignment-card"
                key={item.id}
                style={{ animationDelay: `${index * 70}ms` }}
              >
                <div className="as-card-top">
                  <span className={`as-card-icon as-color-${index % 4}`}>
                    <BookOpen size={23} />
                  </span>

                  <div className="as-card-menu-wrap">
                    <button
                      className="as-more-btn"
                      onClick={() =>
                        setMenuId(menuId === item.id ? null : item.id)
                      }
                      aria-label="Assignment options"
                    >
                      <MoreVertical size={19} />
                    </button>

                    {menuId === item.id && (
                      <div className="as-dropdown">
                        <button onClick={() => openEditModal(item)}>
                          <Pencil size={15} /> Edit
                        </button>
                        <button
                          className="as-delete-option"
                          onClick={() => deleteAssignment(item.id)}
                        >
                          <Trash2 size={15} /> Delete
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <div className="as-card-body">
                  <span className="as-subject-label">{item.subject}</span>
                  <h3>{item.title}</h3>
                  <p>{item.description}</p>
                  <div className="as-class-tag">
                    <Users size={14} /> {item.className}
                  </div>
                </div>

                <div className="as-card-due">
                  <div>
                    <CalendarDays size={15} />
                    <span>Due: {item.dueDate}</span>
                  </div>
                  <span className={`as-due-label ${getDueLabel(item.dueDate) === "Past due" ? "past" : ""}`}>
                    {getDueLabel(item.dueDate)}
                  </span>
                </div>

                <div className="as-submission">
                  <div className="as-submission-heading">
                    <span>Submission progress</span>
                    <strong>{percentage}%</strong>
                  </div>
                  <div className="as-progress">
                    <div style={{ width: `${percentage}%` }} />
                  </div>
                  <div className="as-submission-footer">
                    <span>{item.submitted} submitted</span>
                    <span>{item.totalStudents} students</span>
                  </div>
                </div>

                <div className="as-card-footer">
                  <span className={`as-status ${item.status.toLowerCase()}`}>
                    {item.status === "Published" ? (
                      <CheckCircle2 size={13} />
                    ) : (
                      <FileText size={13} />
                    )}
                    {item.status}
                  </span>
                  <button
                    onClick={() => openEditModal(item)}
                    className="as-manage-btn"
                  >
                    Manage <span>→</span>
                  </button>
                </div>
              </article>
            );
          })}

          {filteredAssignments.length === 0 && (
            <div className="as-empty">
              <FileText size={35} />
              <h3>No assignments found</h3>
              <p>Try changing your search or filters.</p>
              <button onClick={() => {
                setSearch("");
                setClassFilter("All Classes");
                setStatusFilter("All Status");
              }}>
                Clear Filters
              </button>
            </div>
          )}
        </div>

        <div className="as-list-footer">
          Showing {filteredAssignments.length} of {assignments.length} assignments
        </div>
      </section>

      {showModal && (
        <div
          className="as-modal-overlay"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setShowModal(false);
          }}
        >
          <form className="as-modal" onSubmit={handleSubmit}>
            <div className="as-modal-heading">
              <div>
                <span>ASSIGNMENT DETAILS</span>
                <h2>{editingId ? "Edit Assignment" : "Create Assignment"}</h2>
                <p>Complete the information below.</p>
              </div>
              <button
                type="button"
                className="as-close-btn"
                onClick={() => setShowModal(false)}
                aria-label="Close"
              >
                <X size={20} />
              </button>
            </div>

            <div className="as-form-group">
              <label htmlFor="as-title">Assignment Title *</label>
              <input
                id="as-title"
                type="text"
                placeholder="Enter assignment title"
                value={form.title}
                onChange={(event) =>
                  setForm({ ...form, title: event.target.value })
                }
                required
              />
            </div>

            <div className="as-form-group">
              <label htmlFor="as-description">Description</label>
              <textarea
                id="as-description"
                rows="3"
                placeholder="Describe the assignment..."
                value={form.description}
                onChange={(event) =>
                  setForm({ ...form, description: event.target.value })
                }
              />
            </div>

            <div className="as-form-row">
              <div className="as-form-group">
                <label htmlFor="as-class">Class *</label>
                <select
                  id="as-class"
                  value={form.className}
                  onChange={(event) => handleClassChange(event.target.value)}
                >
                  {classOptions.map((item) => (
                    <option key={item.name}>{item.name}</option>
                  ))}
                </select>
              </div>

              <div className="as-form-group">
                <label htmlFor="as-subject">Subject</label>
                <input id="as-subject" value={form.subject} readOnly />
              </div>
            </div>

            <div className="as-form-row">
              <div className="as-form-group">
                <label htmlFor="as-due">Due Date *</label>
                <input
                  id="as-due"
                  type="date"
                  value={form.dueDate}
                  min={new Date().toISOString().slice(0, 10)}
                  onChange={(event) =>
                    setForm({ ...form, dueDate: event.target.value })
                  }
                  required
                />
              </div>

              <div className="as-form-group">
                <label htmlFor="as-status">Status</label>
                <select
                  id="as-status"
                  value={form.status}
                  onChange={(event) =>
                    setForm({ ...form, status: event.target.value })
                  }
                >
                  <option>Published</option>
                  <option>Draft</option>
                </select>
              </div>
            </div>

            <div className="as-modal-actions">
              <button
                type="button"
                className="as-cancel-btn"
                onClick={() => setShowModal(false)}
              >
                Cancel
              </button>
              <button type="submit" className="as-submit-btn">
                <SaveIcon /> {editingId ? "Update Assignment" : "Create Assignment"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

function SaveIcon() {
  return <CheckCircle2 size={17} />;
}

export default TeacherAssignments;
