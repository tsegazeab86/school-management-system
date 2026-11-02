import { useMemo, useState } from "react";
import {
  Search,
  Plus,
  Edit,
  Trash2,
  Eye,
  X,
  BookOpen,
  Download,
  Clock,
  GraduationCap,
} from "lucide-react";
import "../../styles/admin/ManageSubjects.css";

const initialSubjects = [
  {
    id: 1,
    code: "MATH101",
    name: "Mathematics",
    grade: "Grade 9",
    teacher: "Abebe Kebede",
    hours: 5,
    status: "Active",
  },
  {
    id: 2,
    code: "ENG101",
    name: "English",
    grade: "Grade 9",
    teacher: "Martha Alemu",
    hours: 4,
    status: "Active",
  },
  {
    id: 3,
    code: "PHY101",
    name: "Physics",
    grade: "Grade 10",
    teacher: "Dawit Bekele",
    hours: 4,
    status: "Active",
  },
  {
    id: 4,
    code: "CHEM101",
    name: "Chemistry",
    grade: "Grade 10",
    teacher: "Selamawit Tesfaye",
    hours: 3,
    status: "Active",
  },
  {
    id: 5,
    code: "BIO101",
    name: "Biology",
    grade: "Grade 11",
    teacher: "Abebe Kebede",
    hours: 3,
    status: "Active",
  },
  {
    id: 6,
    code: "ICT101",
    name: "Information Technology",
    grade: "Grade 12",
    teacher: "Dawit Bekele",
    hours: 3,
    status: "Inactive",
  },
];

const emptyForm = {
  code: "",
  name: "",
  grade: "Grade 9",
  teacher: "",
  hours: 3,
  status: "Active",
};

const teachers = [
  "Abebe Kebede",
  "Martha Alemu",
  "Dawit Bekele",
  "Selamawit Tesfaye",
  "Other Teacher",
];

function ManageSubjects() {
  const [subjects, setSubjects] = useState(initialSubjects);
  const [search, setSearch] = useState("");
  const [gradeFilter, setGradeFilter] = useState("All");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState("");

  const filteredSubjects = useMemo(() => {
    return subjects.filter((subject) => {
      const matchesSearch =
        subject.name.toLowerCase().includes(search.toLowerCase()) ||
        subject.code.toLowerCase().includes(search.toLowerCase()) ||
        subject.teacher.toLowerCase().includes(search.toLowerCase());

      const matchesGrade =
        gradeFilter === "All" || subject.grade === gradeFilter;

      return matchesSearch && matchesGrade;
    });
  }, [subjects, search, gradeFilter]);

  const activeCount = subjects.filter(
    (subject) => subject.status === "Active"
  ).length;

  const totalHours = subjects.reduce(
    (total, subject) => total + Number(subject.hours),
    0
  );

  const openAddForm = () => {
    setForm(emptyForm);
    setEditingId(null);
    setError("");
    setShowForm(true);
  };

  const openEditForm = (subject) => {
    setForm({ ...subject });
    setEditingId(subject.id);
    setError("");
    setShowForm(true);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((previous) => ({
      ...previous,
      [name]: name === "hours" ? Number(value) : value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!form.code.trim() || !form.name.trim() || !form.teacher) {
      setError("Please complete all required fields.");
      return;
    }

    const duplicate = subjects.some(
      (subject) =>
        subject.code.toLowerCase() === form.code.trim().toLowerCase() &&
        subject.id !== editingId
    );

    if (duplicate) {
      setError("This subject code already exists.");
      return;
    }

    if (editingId) {
      setSubjects((previous) =>
        previous.map((subject) =>
          subject.id === editingId
            ? { ...form, id: editingId, code: form.code.trim().toUpperCase() }
            : subject
        )
      );
    } else {
      setSubjects((previous) => [
        ...previous,
        {
          ...form,
          id: Date.now(),
          code: form.code.trim().toUpperCase(),
        },
      ]);
    }

    setShowForm(false);
    setForm(emptyForm);
    setEditingId(null);
    setError("");
  };

  const handleDelete = (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this subject?"
    );

    if (confirmed) {
      setSubjects((previous) =>
        previous.filter((subject) => subject.id !== id)
      );
    }
  };

  const exportCSV = () => {
    const headers = [
      "Subject Code",
      "Subject Name",
      "Grade",
      "Teacher",
      "Weekly Hours",
      "Status",
    ];

    const rows = filteredSubjects.map((subject) => [
      subject.code,
      subject.name,
      subject.grade,
      subject.teacher,
      subject.hours,
      subject.status,
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
    link.download = "school-subjects.csv";
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="subjects-page">
      <div className="subjects-header">
        <div>
          <p className="subjects-breadcrumb">Administrator / Subjects</p>
          <h1>Manage Subjects</h1>
          <p className="subjects-subtitle">
            Create, assign, and manage school subjects.
          </p>
        </div>

        <button className="subject-primary-btn" onClick={openAddForm}>
          <Plus size={18} />
          Add Subject
        </button>
      </div>

      <div className="subject-stats">
        <div className="subject-stat-card">
          <div className="subject-stat-icon purple">
            <BookOpen size={22} />
          </div>
          <div>
            <p>Total Subjects</p>
            <h2>{subjects.length}</h2>
          </div>
        </div>

        <div className="subject-stat-card">
          <div className="subject-stat-icon green">
            <GraduationCap size={22} />
          </div>
          <div>
            <p>Active Subjects</p>
            <h2>{activeCount}</h2>
          </div>
        </div>

        <div className="subject-stat-card">
          <div className="subject-stat-icon orange">
            <Clock size={22} />
          </div>
          <div>
            <p>Total Weekly Hours</p>
            <h2>{totalHours}</h2>
          </div>
        </div>
      </div>

      <div className="subjects-content">
        <div className="subjects-toolbar">
          <div className="subject-search">
            <Search size={19} />
            <input
              type="text"
              placeholder="Search by subject, code, or teacher..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <select
            value={gradeFilter}
            onChange={(e) => setGradeFilter(e.target.value)}
            className="subject-filter"
          >
            <option value="All">All Grades</option>
            <option value="Grade 9">Grade 9</option>
            <option value="Grade 10">Grade 10</option>
            <option value="Grade 11">Grade 11</option>
            <option value="Grade 12">Grade 12</option>
          </select>

          <button className="subject-export-btn" onClick={exportCSV}>
            <Download size={17} />
            Export CSV
          </button>
        </div>

        <div className="subjects-table-wrapper">
          <table className="subjects-table">
            <thead>
              <tr>
                <th>Subject</th>
                <th>Subject Code</th>
                <th>Grade</th>
                <th>Assigned Teacher</th>
                <th>Weekly Hours</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {filteredSubjects.length > 0 ? (
                filteredSubjects.map((subject) => (
                  <tr key={subject.id}>
                    <td>
                      <div className="subject-name-cell">
                        <div className="subject-book-icon">
                          <BookOpen size={17} />
                        </div>
                        <strong>{subject.name}</strong>
                      </div>
                    </td>
                    <td>
                      <span className="subject-code">{subject.code}</span>
                    </td>
                    <td>{subject.grade}</td>
                    <td>{subject.teacher}</td>
                    <td>{subject.hours} hours</td>
                    <td>
                      <span
                        className={`subject-status ${
                          subject.status === "Active" ? "active" : "inactive"
                        }`}
                      >
                        {subject.status}
                      </span>
                    </td>
                    <td>
                      <div className="subject-actions">
                        <button
                          title="View subject"
                          onClick={() => setSelectedSubject(subject)}
                        >
                          <Eye size={17} />
                        </button>
                        <button
                          title="Edit subject"
                          onClick={() => openEditForm(subject)}
                        >
                          <Edit size={17} />
                        </button>
                        <button
                          title="Delete subject"
                          className="delete-action"
                          onClick={() => handleDelete(subject.id)}
                        >
                          <Trash2 size={17} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="subject-empty">
                    No subjects found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="subjects-footer">
          Showing {filteredSubjects.length} of {subjects.length} subjects
        </div>
      </div>

      {showForm && (
        <div className="subject-modal-overlay">
          <div className="subject-modal">
            <div className="subject-modal-header">
              <div>
                <h2>{editingId ? "Edit Subject" : "Add New Subject"}</h2>
                <p>Enter the subject information below.</p>
              </div>
              <button
                className="subject-close-btn"
                onClick={() => setShowForm(false)}
              >
                <X size={21} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="subject-form-grid">
                <div className="subject-form-group">
                  <label>Subject Code *</label>
                  <input
                    name="code"
                    value={form.code}
                    onChange={handleChange}
                    placeholder="e.g. MATH101"
                    required
                  />
                </div>

                <div className="subject-form-group">
                  <label>Subject Name *</label>
                  <input
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="e.g. Mathematics"
                    required
                  />
                </div>

                <div className="subject-form-group">
                  <label>Grade *</label>
                  <select
                    name="grade"
                    value={form.grade}
                    onChange={handleChange}
                  >
                    <option>Grade 9</option>
                    <option>Grade 10</option>
                    <option>Grade 11</option>
                    <option>Grade 12</option>
                  </select>
                </div>

                <div className="subject-form-group">
                  <label>Assigned Teacher *</label>
                  <select
                    name="teacher"
                    value={form.teacher}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select teacher</option>
                    {teachers.map((teacher) => (
                      <option key={teacher} value={teacher}>
                        {teacher}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="subject-form-group">
                  <label>Weekly Class Hours *</label>
                  <input
                    type="number"
                    name="hours"
                    min="1"
                    max="20"
                    value={form.hours}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="subject-form-group">
                  <label>Status</label>
                  <select
                    name="status"
                    value={form.status}
                    onChange={handleChange}
                  >
                    <option>Active</option>
                    <option>Inactive</option>
                  </select>
                </div>
              </div>

              {error && <p className="subject-form-error">{error}</p>}

              <div className="subject-modal-actions">
                <button
                  type="button"
                  className="subject-cancel-btn"
                  onClick={() => setShowForm(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="subject-save-btn">
                  {editingId ? "Update Subject" : "Save Subject"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {selectedSubject && (
        <div className="subject-modal-overlay">
          <div className="subject-modal subject-details-modal">
            <div className="subject-modal-header">
              <div>
                <h2>Subject Details</h2>
                <p>Complete information about this subject.</p>
              </div>
              <button
                className="subject-close-btn"
                onClick={() => setSelectedSubject(null)}
              >
                <X size={21} />
              </button>
            </div>

            <div className="subject-details-list">
              <p><span>Subject Name</span><strong>{selectedSubject.name}</strong></p>
              <p><span>Subject Code</span><strong>{selectedSubject.code}</strong></p>
              <p><span>Grade</span><strong>{selectedSubject.grade}</strong></p>
              <p><span>Assigned Teacher</span><strong>{selectedSubject.teacher}</strong></p>
              <p><span>Weekly Hours</span><strong>{selectedSubject.hours} hours</strong></p>
              <p><span>Status</span><strong>{selectedSubject.status}</strong></p>
            </div>

            <button
              className="subject-save-btn subject-details-close"
              onClick={() => setSelectedSubject(null)}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default ManageSubjects;