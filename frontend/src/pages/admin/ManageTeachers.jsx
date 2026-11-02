import { useState } from "react";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Eye,
  X,
  Users,
  Download,
} from "lucide-react";

import "../../styles/admin/ManageTeachers.css";

const initialTeachers = [
  {
    id: "TCH001",
    name: "Abebe Kebede",
    email: "abebe@school.com",
    phone: "0912345678",
    subject: "Mathematics",
    qualification: "MSc Mathematics",
    gender: "Male",
    status: "Active",
  },
  {
    id: "TCH002",
    name: "Almaz Tesfaye",
    email: "almaz@school.com",
    phone: "0923456789",
    subject: "English",
    qualification: "BA English",
    gender: "Female",
    status: "Active",
  },
  {
    id: "TCH003",
    name: "Dawit Alemu",
    email: "dawit@school.com",
    phone: "0934567890",
    subject: "Physics",
    qualification: "MSc Physics",
    gender: "Male",
    status: "Inactive",
  },
  {
    id: "TCH004",
    name: "Marta Bekele",
    email: "marta@school.com",
    phone: "0945678901",
    subject: "Biology",
    qualification: "BSc Biology",
    gender: "Female",
    status: "Active",
  },
];

const emptyForm = {
  id: "",
  name: "",
  email: "",
  phone: "",
  subject: "Mathematics",
  qualification: "",
  gender: "Male",
  status: "Active",
};

function ManageTeachers() {
  const [teachers, setTeachers] = useState(initialTeachers);
  const [search, setSearch] = useState("");
  const [subjectFilter, setSubjectFilter] = useState("All");
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [viewTeacher, setViewTeacher] = useState(null);
  const [form, setForm] = useState(emptyForm);

  const filteredTeachers = teachers.filter((teacher) => {
    const matchesSearch =
      teacher.name.toLowerCase().includes(search.toLowerCase()) ||
      teacher.id.toLowerCase().includes(search.toLowerCase()) ||
      teacher.email.toLowerCase().includes(search.toLowerCase());

    const matchesSubject =
      subjectFilter === "All" || teacher.subject === subjectFilter;

    return matchesSearch && matchesSubject;
  });

  const activeCount = teachers.filter(
    (teacher) => teacher.status === "Active"
  ).length;

  const openAddModal = () => {
    setEditingId(null);
    setForm(emptyForm);
    setShowModal(true);
  };

  const openEditModal = (teacher) => {
    setEditingId(teacher.id);
    setForm({ ...teacher });
    setShowModal(true);
  };

  const handleChange = (event) => {
    setForm({
      ...form,
      [event.target.name]: event.target.value,
    });
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    if (editingId) {
      setTeachers((current) =>
        current.map((teacher) =>
          teacher.id === editingId ? form : teacher
        )
      );
    } else {
      if (teachers.some((teacher) => teacher.id === form.id)) {
        alert("This teacher ID already exists.");
        return;
      }

      setTeachers((current) => [...current, form]);
    }

    setShowModal(false);
    setForm(emptyForm);
  };

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this teacher?")) {
      setTeachers((current) =>
        current.filter((teacher) => teacher.id !== id)
      );
    }
  };

  const exportTeachers = () => {
    const headers = [
      "ID",
      "Name",
      "Email",
      "Phone",
      "Subject",
      "Qualification",
      "Gender",
      "Status",
    ];

    const rows = filteredTeachers.map((teacher) =>
      headers.map((header) => {
        const key = header.toLowerCase();
        return `"${String(teacher[key] ?? "").replace(/"/g, '""')}"`;
      })
    );

    const csv = [headers, ...rows]
      .map((row) => row.join(","))
      .join("\n");

    const url = URL.createObjectURL(
      new Blob([csv], { type: "text/csv" })
    );

    const link = document.createElement("a");
    link.href = url;
    link.download = "teachers.csv";
    link.click();

    URL.revokeObjectURL(url);
  };

  return (
    <div className="teachers-page">
      <div className="teachers-heading">
        <div>
          <h1>Manage Teachers</h1>
          <p>Register, update, and manage teacher information.</p>
        </div>

        <button className="add-teacher-btn" onClick={openAddModal}>
          <Plus size={18} />
          Add New Teacher
        </button>
      </div>

      <div className="teacher-summary">
        <div className="teacher-summary-card">
          <div className="teacher-summary-icon">
            <Users size={23} />
          </div>
          <div>
            <span>Total Teachers</span>
            <h2>{teachers.length}</h2>
          </div>
        </div>

        <div className="teacher-summary-card">
          <div className="teacher-summary-icon teacher-active-icon">
            <Users size={23} />
          </div>
          <div>
            <span>Active Teachers</span>
            <h2>{activeCount}</h2>
          </div>
        </div>

        <div className="teacher-summary-card">
          <div className="teacher-summary-icon teacher-inactive-icon">
            <Users size={23} />
          </div>
          <div>
            <span>Inactive Teachers</span>
            <h2>{teachers.length - activeCount}</h2>
          </div>
        </div>
      </div>

      <div className="teachers-table-panel">
        <div className="teachers-toolbar">
          <div>
            <h3>Teacher List</h3>
            <p>All registered teachers</p>
          </div>

          <div className="teacher-filters">
            <div className="teacher-search">
              <Search size={18} />
              <input
                placeholder="Search teachers..."
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
            </div>

            <select
              value={subjectFilter}
              onChange={(event) => setSubjectFilter(event.target.value)}
            >
              <option value="All">All Subjects</option>
              <option value="Mathematics">Mathematics</option>
              <option value="English">English</option>
              <option value="Physics">Physics</option>
              <option value="Biology">Biology</option>
            </select>

            <button className="export-teachers-btn" onClick={exportTeachers}>
              <Download size={17} />
              Export
            </button>
          </div>
        </div>

        <div className="teachers-table-wrapper">
          <table className="teachers-table">
            <thead>
              <tr>
                <th>Teacher ID</th>
                <th>Teacher Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Subject</th>
                <th>Qualification</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {filteredTeachers.map((teacher) => (
                <tr key={teacher.id}>
                  <td className="teacher-id">{teacher.id}</td>
                  <td className="teacher-name">{teacher.name}</td>
                  <td>{teacher.email}</td>
                  <td>{teacher.phone}</td>
                  <td>{teacher.subject}</td>
                  <td>{teacher.qualification}</td>
                  <td>
                    <span
                      className={`teacher-status ${
                        teacher.status === "Active"
                          ? "teacher-status-active"
                          : "teacher-status-inactive"
                      }`}
                    >
                      {teacher.status}
                    </span>
                  </td>
                  <td>
                    <div className="teacher-actions">
                      <button
                        title="View"
                        onClick={() => setViewTeacher(teacher)}
                      >
                        <Eye size={16} />
                      </button>

                      <button
                        title="Edit"
                        onClick={() => openEditModal(teacher)}
                      >
                        <Edit size={16} />
                      </button>

                      <button
                        title="Delete"
                        className="teacher-delete"
                        onClick={() => handleDelete(teacher.id)}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {filteredTeachers.length === 0 && (
                <tr>
                  <td colSpan="8" className="teacher-empty">
                    No teachers found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="teachers-footer">
          Showing {filteredTeachers.length} of {teachers.length} teachers
        </div>
      </div>

      {showModal && (
        <div className="teacher-modal-overlay">
          <div className="teacher-modal">
            <div className="teacher-modal-heading">
              <div>
                <h2>{editingId ? "Edit Teacher" : "Add New Teacher"}</h2>
                <p>Enter teacher information below.</p>
              </div>

              <button onClick={() => setShowModal(false)}>
                <X size={21} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="teacher-form-grid">
                <label>
                  Teacher ID
                  <input
                    name="id"
                    value={form.id}
                    onChange={handleChange}
                    placeholder="e.g. TCH005"
                    disabled={Boolean(editingId)}
                    required
                  />
                </label>

                <label>
                  Full Name
                  <input
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="Enter full name"
                    required
                  />
                </label>

                <label>
                  Email
                  <input
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="teacher@school.com"
                    required
                  />
                </label>

                <label>
                  Phone Number
                  <input
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    placeholder="Enter phone number"
                    required
                  />
                </label>

                <label>
                  Subject
                  <select
                    name="subject"
                    value={form.subject}
                    onChange={handleChange}
                  >
                    <option>Mathematics</option>
                    <option>English</option>
                    <option>Physics</option>
                    <option>Biology</option>
                    <option>Chemistry</option>
                    <option>Computer Science</option>
                  </select>
                </label>

                <label>
                  Qualification
                  <input
                    name="qualification"
                    value={form.qualification}
                    onChange={handleChange}
                    placeholder="e.g. MSc Mathematics"
                    required
                  />
                </label>

                <label>
                  Gender
                  <select
                    name="gender"
                    value={form.gender}
                    onChange={handleChange}
                  >
                    <option>Male</option>
                    <option>Female</option>
                  </select>
                </label>

                <label>
                  Status
                  <select
                    name="status"
                    value={form.status}
                    onChange={handleChange}
                  >
                    <option>Active</option>
                    <option>Inactive</option>
                  </select>
                </label>
              </div>

              <div className="teacher-modal-actions">
                <button
                  type="button"
                  className="teacher-cancel-btn"
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </button>

                <button type="submit" className="teacher-save-btn">
                  {editingId ? "Update Teacher" : "Save Teacher"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {viewTeacher && (
        <div className="teacher-modal-overlay">
          <div className="teacher-modal teacher-details-modal">
            <div className="teacher-modal-heading">
              <div>
                <h2>Teacher Details</h2>
                <p>Teacher profile information</p>
              </div>

              <button onClick={() => setViewTeacher(null)}>
                <X size={21} />
              </button>
            </div>

            <div className="teacher-details-list">
              {Object.entries(viewTeacher).map(([key, value]) => (
                <div key={key}>
                  <span>{key.charAt(0).toUpperCase() + key.slice(1)}</span>
                  <strong>{value}</strong>
                </div>
              ))}
            </div>

            <button
              className="teacher-save-btn"
              onClick={() => setViewTeacher(null)}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default ManageTeachers;