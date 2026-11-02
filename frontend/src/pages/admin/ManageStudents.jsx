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

import "../../styles/admin/ManageStudents.css";

const initialStudents = [
  {
    id: "STU001",
    name: "Abebe Kebede",
    email: "abebe@gmail.com",
    grade: "Grade 9",
    gender: "Male",
    phone: "0912345678",
    status: "Active",
  },
  {

    
    id: "STU002",
    name: "Almaz Tesfaye",
    email: "almaz@gmail.com",
    grade: "Grade 10",
    gender: "Female",
    phone: "0923456789",
    status: "Active",
  },
  {
    id: "STU003",
    name: "Dawit Alemu",
    email: "dawit@gmail.com",
    grade: "Grade 11",
    gender: "Male",
    phone: "0934567890",
    status: "Inactive",
  },
  {
    id: "STU004",
    name: "Marta Bekele",
    email: "marta@gmail.com",
    grade: "Grade 12",
    gender: "Female",
    phone: "0945678901",
    status: "Active",
  },
];

const emptyForm = {
  id: "",
  name: "",
  email: "",
  grade: "Grade 9",
  gender: "Male",
  phone: "",
  status: "Active",
};

function ManageStudents() {
  const [students, setStudents] = useState(initialStudents);
  const [search, setSearch] = useState("");
  const [gradeFilter, setGradeFilter] = useState("All");
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [viewStudent, setViewStudent] = useState(null);

  const filteredStudents = students.filter((student) => {
    const matchesSearch =
      student.name.toLowerCase().includes(search.toLowerCase()) ||
      student.id.toLowerCase().includes(search.toLowerCase()) ||
      student.email.toLowerCase().includes(search.toLowerCase());

    const matchesGrade =
      gradeFilter === "All" || student.grade === gradeFilter;

    return matchesSearch && matchesGrade;
  });

  const openAddModal = () => {
    setEditingId(null);
    setForm(emptyForm);
    setShowModal(true);
  };

  const openEditModal = (student) => {
    setEditingId(student.id);
    setForm({ ...student });
    setShowModal(true);
  };

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (editingId) {
      setStudents((current) =>
        current.map((student) =>
          student.id === editingId ? form : student
        )
      );
    } else {
      if (students.some((student) => student.id === form.id)) {
        alert("This student ID already exists.");
        return;
      }

      setStudents((current) => [...current, form]);
    }

    setShowModal(false);
    setForm(emptyForm);
  };

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this student?")) {
      setStudents((current) =>
        current.filter((student) => student.id !== id)
      );
    }
  };

  const activeCount = students.filter(
    (student) => student.status === "Active"
  ).length;

  return (
    <div className="students-page">
      <div className="students-heading">
        <div>
          <h1>Manage Students</h1>
          <p>Register, update, and manage student information.</p>
        </div>

        <button className="add-student-btn" onClick={openAddModal}>
          <Plus size={18} />
          Add New Student
        </button>
      </div>

      <div className="student-summary">
        <div className="student-summary-card">
          <div className="summary-icon">
            <Users size={23} />
          </div>
          <div>
            <span>Total Students</span>
            <h2>{students.length}</h2>
          </div>
        </div>

        <div className="student-summary-card">
          <div className="summary-icon active-summary">
            <Users size={23} />
          </div>
          <div>
            <span>Active Students</span>
            <h2>{activeCount}</h2>
          </div>
        </div>

        <div className="student-summary-card">
          <div className="summary-icon inactive-summary">
            <Users size={23} />
          </div>
          <div>
            <span>Inactive Students</span>
            <h2>{students.length - activeCount}</h2>
          </div>
        </div>
      </div>

      <div className="students-table-panel">
        <div className="students-toolbar">
          <div>
            <h3>Student List</h3>
            <p>All registered students</p>
          </div>

          <div className="student-filters">
            <div className="student-search">
              <Search size={18} />
              <input
                type="text"
                placeholder="Search students..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <select
              value={gradeFilter}
              onChange={(e) => setGradeFilter(e.target.value)}
            >
              <option value="All">All Grades</option>
              <option value="Grade 9">Grade 9</option>
              <option value="Grade 10">Grade 10</option>
              <option value="Grade 11">Grade 11</option>
              <option value="Grade 12">Grade 12</option>
            </select>

            <button
              className="export-students-btn"
              onClick={() => {
                const csv = [
                  ["ID", "Name", "Email", "Grade", "Gender", "Phone", "Status"],
                  ...filteredStudents.map((s) => [
                    s.id, s.name, s.email, s.grade, s.gender, s.phone, s.status
                  ]),
                ]
                  .map((row) =>
                    row.map((value) => `"${String(value).replace(/"/g, '""')}"`).join(",")
                  )
                  .join("\n");

                const url = URL.createObjectURL(
                  new Blob([csv], { type: "text/csv" })
                );

                const link = document.createElement("a");
                link.href = url;
                link.download = "students.csv";
                link.click();
                URL.revokeObjectURL(url);
              }}
            >
              <Download size={17} />
              Export
            </button>
          </div>
        </div>

        <div className="students-table-wrapper">
          <table className="students-table">
            <thead>
              <tr>
                <th>Student ID</th>
                <th>Student Name</th>
                <th>Email</th>
                <th>Grade</th>
                <th>Gender</th>
                <th>Phone</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {filteredStudents.map((student) => (
                <tr key={student.id}>
                  <td className="student-id">{student.id}</td>
                  <td className="student-name">{student.name}</td>
                  <td>{student.email}</td>
                  <td>{student.grade}</td>
                  <td>{student.gender}</td>
                  <td>{student.phone}</td>
                  <td>
                    <span
                      className={`student-status ${
                        student.status === "Active" ? "status-active" : "status-inactive"
                      }`}
                    >
                      {student.status}
                    </span>
                  </td>
                  <td>
                    <div className="student-actions">
                      <button
                        title="View"
                        onClick={() => setViewStudent(student)}
                      >
                        <Eye size={16} />
                      </button>

                      <button
                        title="Edit"
                        onClick={() => openEditModal(student)}
                      >
                        <Edit size={16} />
                      </button>

                      <button
                        className="delete-action"
                        title="Delete"
                        onClick={() => handleDelete(student.id)}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {filteredStudents.length === 0 && (
                <tr>
                  <td colSpan="8" className="empty-students">
                    No students found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="students-table-footer">
          Showing {filteredStudents.length} of {students.length} students
        </div>
      </div>

      {showModal && (
        <div className="student-modal-overlay">
          <div className="student-modal">
            <div className="student-modal-heading">
              <div>
                <h2>{editingId ? "Edit Student" : "Add New Student"}</h2>
                <p>Enter the student's information below.</p>
              </div>

              <button onClick={() => setShowModal(false)}>
                <X size={21} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="student-form-grid">
                <label>
                  Student ID
                  <input
                    name="id"
                    value={form.id}
                    onChange={handleChange}
                    placeholder="e.g. STU005"
                    required
                    disabled={Boolean(editingId)}
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
                  Email Address
                  <input
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="student@example.com"
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
                  Grade
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

              <div className="student-modal-actions">
                <button
                  type="button"
                  className="cancel-student-btn"
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </button>

                <button type="submit" className="save-student-btn">
                  {editingId ? "Update Student" : "Save Student"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {viewStudent && (
        <div className="student-modal-overlay">
          <div className="student-modal student-details-modal">
            <div className="student-modal-heading">
              <div>
                <h2>Student Details</h2>
                <p>Student profile information</p>
              </div>

              <button onClick={() => setViewStudent(null)}>
                <X size={21} />
              </button>
            </div>

            <div className="student-details-list">
              {Object.entries(viewStudent).map(([key, value]) => (
                <div key={key}>
                  <span>{key.charAt(0).toUpperCase() + key.slice(1)}</span>
                  <strong>{value}</strong>
                </div>
              ))}
            </div>

            <button
              className="save-student-btn"
              onClick={() => setViewStudent(null)}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default ManageStudents;