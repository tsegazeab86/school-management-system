
import   { useMemo, useState } from "react";
import {
  Plus,
  Search,
  CalendarDays,
  Clock,
  BookOpen,
  Users,
  FileText,
  Download,
  Pencil,
  Trash2,
  MoreVertical,
  X,
  CheckCircle2,
  ClipboardList,
  GraduationCap,
  Sparkles,
  Filter,
  ArrowUpRight,
  Save,
} from "lucide-react";
import "./Exams.css";

const initialExams = [
  {
    id: 1,
    title: "Mathematics Midterm Examination",
    className: "Grade 10A",
    subject: "Mathematics",
    type: "Midterm",
    date: "2026-11-05",
    duration: 90,
    totalMarks: 100,
    passingMarks: 50,
    status: "Scheduled",
  },
  {
    id: 2,
    title: "Programming Fundamentals Quiz",
    className: "Grade 11A",
    subject: "Computer Science",
    type: "Quiz",
    date: "2026-11-08",
    duration: 30,
    totalMarks: 20,
    passingMarks: 10,
    status: "Scheduled",
  },
  {
    id: 3,
    title: "Geometry Final Examination",
    className: "Grade 10B",
    subject: "Mathematics",
    type: "Final",
    date: "2026-11-12",
    duration: 120,
    totalMarks: 100,
    passingMarks: 50,
    status: "Scheduled",
  },
  {
    id: 4,
    title: "Computer Science Test",
    className: "Grade 11B",
    subject: "Computer Science",
    type: "Quiz",
    date: "2026-10-20",
    duration: 45,
    totalMarks: 30,
    passingMarks: 15,
    status: "Completed",
  },
];

const classOptions = [
  { name: "Grade 10A", subject: "Mathematics" },
  { name: "Grade 10B", subject: "Mathematics" },
  { name: "Grade 11A", subject: "Computer Science" },
  { name: "Grade 11B", subject: "Computer Science" },
];

const emptyForm = {
  title: "",
  className: "Grade 10A",
  subject: "Mathematics",
  type: "Midterm",
  date: "",
  duration: 60,
  totalMarks: 100,
  passingMarks: 50,
  status: "Scheduled",
};

function TeacherExams() {
  const [exams, setExams] = useState(initialExams);
  const [form, setForm] = useState(emptyForm);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [search, setSearch] = useState("");
  const [classFilter, setClassFilter] = useState("All Classes");
  const [typeFilter, setTypeFilter] = useState("All Types");
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [menuId, setMenuId] = useState(null);
  const [notice, setNotice] = useState("");

  const filteredExams = useMemo(() => {
    return exams.filter((exam) => {
      const matchesSearch =
        `${exam.title} ${exam.subject} ${exam.className}`
          .toLowerCase()
          .includes(search.toLowerCase());

      return (
        matchesSearch &&
        (classFilter === "All Classes" || exam.className === classFilter) &&
        (typeFilter === "All Types" || exam.type === typeFilter) &&
        (statusFilter === "All Status" || exam.status === statusFilter)
      );
    });
  }, [exams, search, classFilter, typeFilter, statusFilter]);

  const scheduled = exams.filter((exam) => exam.status === "Scheduled").length;
  const completed = exams.filter((exam) => exam.status === "Completed").length;
  const totalMarks = exams.reduce((sum, exam) => sum + Number(exam.totalMarks), 0);

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
    setShowModal(true);
  };

  const openEdit = (exam) => {
    setEditingId(exam.id);
    setForm({
      title: exam.title,
      className: exam.className,
      subject: exam.subject,
      type: exam.type,
      date: exam.date,
      duration: exam.duration,
      totalMarks: exam.totalMarks,
      passingMarks: exam.passingMarks,
      status: exam.status,
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

    const total = Number(form.totalMarks);
    const passing = Number(form.passingMarks);
    const duration = Number(form.duration);

    if (
      !form.title.trim() ||
      !form.date ||
      !Number.isFinite(total) ||
      !Number.isFinite(passing) ||
      !Number.isFinite(duration) ||
      total <= 0 ||
      passing < 0 ||
      passing > total ||
      duration <= 0
    ) {
      setNotice("Please check the exam details and marks.");
      return;
    }

    const updatedExam = {
      ...form,
      duration,
      totalMarks: total,
      passingMarks: passing,
    };

    if (editingId) {
      setExams((previous) =>
        previous.map((exam) =>
          exam.id === editingId ? { ...exam, ...updatedExam } : exam
        )
      );
      setNotice("Examination updated successfully.");
    } else {
      setExams((previous) => [
        { ...updatedExam, id: Date.now() },
        ...previous,
      ]);
      setNotice("New examination created successfully.");
    }

    setShowModal(false);
    setEditingId(null);
    setForm(emptyForm);
  };

  const deleteExam = (id) => {
    if (!window.confirm("Are you sure you want to delete this examination?")) {
      return;
    }

    setExams((previous) => previous.filter((exam) => exam.id !== id));
    setMenuId(null);
    setNotice("Examination deleted.");
  };

  const exportCSV = () => {
    const rows = [
      [
        "Exam Title",
        "Class",
        "Subject",
        "Type",
        "Date",
        "Duration",
        "Total Marks",
        "Passing Marks",
        "Status",
      ],
      ...filteredExams.map((exam) => [
        exam.title,
        exam.className,
        exam.subject,
        exam.type,
        exam.date,
        exam.duration,
        exam.totalMarks,
        exam.passingMarks,
        exam.status,
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
    link.download = "teacher-examinations.csv";
    link.click();
    URL.revokeObjectURL(url);
  };

  const formatDate = (date) =>
    new Date(`${date}T00:00:00`).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });

  const getDateLabel = (date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const examDate = new Date(`${date}T00:00:00`);
    const days = Math.ceil((examDate - today) / 86400000);

    if (days < 0) return "Date passed";
    if (days === 0) return "Today";
    if (days === 1) return "Tomorrow";
    return `${days} days remaining`;
  };

  return (
    <div className="exams-page">
      <header className="ex-header">
        <div>
          <span className="ex-eyebrow">TEACHER PORTAL / ASSESSMENT</span>
          <h1>Examination Management</h1>
          <p>Plan examinations, manage schedules, and organize assessments.</p>
        </div>

        <button className="ex-create-btn" onClick={openCreate}>
          <Plus size={19} /> Schedule Examination
        </button>
      </header>

      {notice && (
        <div className="ex-notice">
          <CheckCircle2 size={17} />
          <span>{notice}</span>
          <button onClick={() => setNotice("")} aria-label="Dismiss notice">
            <X size={16} />
          </button>
        </div>
      )}

      <section className="ex-hero">
        <div className="ex-hero-content">
          <div className="ex-hero-label">
            <Sparkles size={14} /> SMART ASSESSMENT CENTER
          </div>
          <h2>Prepare. Assess. Inspire.</h2>
          <p>
            Keep your examination schedule organized and help your students
            prepare for academic success.
          </p>
          <button onClick={openCreate}>
            <CalendarDays size={17} /> Schedule a New Exam
          </button>
        </div>

        <div className="ex-hero-art">
          <div className="ex-art-ring ring-a" />
          <div className="ex-art-ring ring-b" />
          <div className="ex-art-icon">
            <GraduationCap size={65} />
          </div>
          <span className="ex-floating-icon float-a"><FileText size={20} /></span>
          <span className="ex-floating-icon float-b"><CheckCircle2 size={20} /></span>
        </div>
      </section>

      <section className="ex-stats">
        <article className="ex-stat-card">
          <span className="ex-stat-icon violet"><ClipboardList size={22} /></span>
          <div><p>Total Examinations</p><h2>{exams.length}</h2><small>All examination records</small></div>
        </article>
        <article className="ex-stat-card">
          <span className="ex-stat-icon blue"><CalendarDays size={22} /></span>
          <div><p>Scheduled Exams</p><h2>{scheduled}</h2><small>Upcoming assessments</small></div>
        </article>
        <article className="ex-stat-card">
          <span className="ex-stat-icon green"><CheckCircle2 size={22} /></span>
          <div><p>Completed Exams</p><h2>{completed}</h2><small>Finished assessments</small></div>
        </article>
        <article className="ex-stat-card">
          <span className="ex-stat-icon orange"><BookOpen size={22} /></span>
          <div><p>Combined Total Marks</p><h2>{totalMarks}</h2><small>Marks across all exams</small></div>
        </article>
      </section>

      <section className="ex-list-panel">
        <div className="ex-list-heading">
          <div>
            <h2>Examination Schedule</h2>
            <p>Manage all your class examinations from one place.</p>
          </div>
          <button className="ex-export-btn" onClick={exportCSV}>
            <Download size={17} /> Export CSV
          </button>
        </div>

        <div className="ex-toolbar">
          <label className="ex-search">
            <Search size={18} />
            <input
              type="search"
              placeholder="Search exam, class, or subject..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </label>

          <div className="ex-filter">
            <Filter size={15} />
            <select value={classFilter} onChange={(e) => setClassFilter(e.target.value)}>
              <option>All Classes</option>
              {classOptions.map((item) => (
                <option key={item.name}>{item.name}</option>
              ))}
            </select>
          </div>

          <div className="ex-filter">
            <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
              <option>All Types</option>
              <option>Quiz</option>
              <option>Midterm</option>
              <option>Final</option>
            </select>
          </div>

          <div className="ex-filter">
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option>All Status</option>
              <option>Scheduled</option>
              <option>Completed</option>
            </select>
          </div>
        </div>

        <div className="ex-card-grid">
          {filteredExams.map((exam, index) => (
            <article
              className="ex-card"
              key={exam.id}
              style={{ animationDelay: `${index * 80}ms` }}
            >
              <div className="ex-card-top">
                <span className={`ex-card-symbol ex-symbol-${index % 4}`}>
                  <FileText size={24} />
                </span>

                <div className="ex-menu-wrap">
                  <button
                    className="ex-more-btn"
                    onClick={() => setMenuId(menuId === exam.id ? null : exam.id)}
                    aria-label="Exam options"
                  >
                    <MoreVertical size={19} />
                  </button>

                  {menuId === exam.id && (
                    <div className="ex-dropdown">
                      <button onClick={() => openEdit(exam)}>
                        <Pencil size={15} /> Edit exam
                      </button>
                      <button className="ex-delete" onClick={() => deleteExam(exam.id)}>
                        <Trash2 size={15} /> Delete exam
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div className="ex-card-body">
                <div className="ex-card-labels">
                  <span className={`ex-type type-${exam.type.toLowerCase()}`}>
                    {exam.type}
                  </span>
                  <span className={`ex-status ${exam.status.toLowerCase()}`}>
                    {exam.status}
                  </span>
                </div>

                <h3>{exam.title}</h3>
                <p className="ex-card-subject">{exam.subject}</p>

                <div className="ex-card-class">
                  <Users size={15} /> {exam.className}
                </div>
              </div>

              <div className="ex-details-grid">
                <div>
                  <CalendarDays size={16} />
                  <span><small>Exam Date</small><strong>{formatDate(exam.date)}</strong></span>
                </div>
                <div>
                  <Clock size={16} />
                  <span><small>Duration</small><strong>{exam.duration} minutes</strong></span>
                </div>
                <div>
                  <GraduationCap size={17} />
                  <span><small>Total Marks</small><strong>{exam.totalMarks} marks</strong></span>
                </div>
                <div>
                  <CheckCircle2 size={16} />
                  <span><small>Passing Marks</small><strong>{exam.passingMarks} marks</strong></span>
                </div>
              </div>

              <div className="ex-card-bottom">
                <span className="ex-date-label">{getDateLabel(exam.date)}</span>
                <button onClick={() => openEdit(exam)}>
                  Manage Exam <ArrowUpRight size={15} />
                </button>
              </div>
            </article>
          ))}

          {filteredExams.length === 0 && (
            <div className="ex-empty">
              <ClipboardList size={38} />
              <h3>No examinations found</h3>
              <p>Try another search or change your filters.</p>
              <button onClick={() => {
                setSearch("");
                setClassFilter("All Classes");
                setTypeFilter("All Types");
                setStatusFilter("All Status");
              }}>
                Clear Filters
              </button>
            </div>
          )}
        </div>

        <div className="ex-list-footer">
          Showing {filteredExams.length} of {exams.length} examinations
        </div>
      </section>

      {showModal && (
        <div
          className="ex-modal-overlay"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setShowModal(false);
          }}
        >
          <form className="ex-modal" onSubmit={handleSubmit}>
            <div className="ex-modal-heading">
              <div>
                <span>EXAMINATION CONFIGURATION</span>
                <h2>{editingId ? "Edit Examination" : "Schedule Examination"}</h2>
                <p>Enter the examination details below.</p>
              </div>
              <button
                type="button"
                className="ex-close-btn"
                onClick={() => setShowModal(false)}
                aria-label="Close"
              >
                <X size={20} />
              </button>
            </div>

            <div className="ex-form-group">
              <label htmlFor="ex-title">Examination Title *</label>
              <input
                id="ex-title"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="e.g. Mathematics Midterm Examination"
                required
              />
            </div>

            <div className="ex-form-row">
              <div className="ex-form-group">
                <label htmlFor="ex-class">Class *</label>
                <select
                  id="ex-class"
                  value={form.className}
                  onChange={(e) => handleClassChange(e.target.value)}
                >
                  {classOptions.map((item) => (
                    <option key={item.name}>{item.name}</option>
                  ))}
                </select>
              </div>
              <div className="ex-form-group">
                <label htmlFor="ex-subject">Subject</label>
                <input id="ex-subject" value={form.subject} readOnly />
              </div>
            </div>

            <div className="ex-form-row">
              <div className="ex-form-group">
                <label htmlFor="ex-type">Examination Type *</label>
                <select
                  id="ex-type"
                  value={form.type}
                  onChange={(e) => setForm({ ...form, type: e.target.value })}
                >
                  <option>Quiz</option>
                  <option>Midterm</option>
                  <option>Final</option>
                </select>
              </div>
              <div className="ex-form-group">
                <label htmlFor="ex-date">Examination Date *</label>
                <input
                  id="ex-date"
                  type="date"
                  value={form.date}
                  min={new Date().toISOString().slice(0, 10)}
                  onChange={(e) => setForm({ ...form, date: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="ex-form-row">
              <div className="ex-form-group">
                <label htmlFor="ex-duration">Duration (minutes) *</label>
                <input
                  id="ex-duration"
                  type="number"
                  min="1"
                  value={form.duration}
                  onChange={(e) => setForm({ ...form, duration: e.target.value })}
                  required
                />
              </div>
              <div className="ex-form-group">
                <label htmlFor="ex-status">Status</label>
                <select
                  id="ex-status"
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value })}
                >
                  <option>Scheduled</option>
                  <option>Completed</option>
                </select>
              </div>
            </div>

            <div className="ex-form-row">
              <div className="ex-form-group">
                <label htmlFor="ex-total">Total Marks *</label>
                <input
                  id="ex-total"
                  type="number"
                  min="1"
                  value={form.totalMarks}
                  onChange={(e) => setForm({ ...form, totalMarks: e.target.value })}
                  required
                />
              </div>
              <div className="ex-form-group">
                <label htmlFor="ex-passing">Passing Marks *</label>
                <input
                  id="ex-passing"
                  type="number"
                  min="0"
                  value={form.passingMarks}
                  onChange={(e) => setForm({ ...form, passingMarks: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="ex-modal-actions">
              <button
                type="button"
                className="ex-cancel-btn"
                onClick={() => setShowModal(false)}
              >
                Cancel
              </button>
              <button type="submit" className="ex-submit-btn">
                <Save size={17} />
                {editingId ? "Update Examination" : "Create Examination"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

export default TeacherExams;
