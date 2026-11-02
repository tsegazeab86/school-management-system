import { useState } from "react";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Eye,
  X,
  School,
  Users,
  Download,
} from "lucide-react";

import "../../styles/admin/ManageClasses.css";

const initialClasses = [
  {
    id: "CLS001",
    grade: "Grade 9",
    section: "A",
    teacher: "Abebe Kebede",
    capacity: 40,
    students: 35,
    room: "Room 101",
    status: "Active",
  },
  {
    id: "CLS002",
    grade: "Grade 9",
    section: "B",
    teacher: "Almaz Tesfaye",
    capacity: 40,
    students: 38,
    room: "Room 102",
    status: "Active",
  },
  {
    id: "CLS003",
    grade: "Grade 10",
    section: "A",
    teacher: "Dawit Alemu",
    capacity: 45,
    students: 40,
    room: "Room 201",
    status: "Active",
  },
  {
    id: "CLS004",
    grade: "Grade 11",
    section: "A",
    teacher: "Marta Bekele",
    capacity: 40,
    students: 32,
    room: "Room 301",
    status: "Active",
  },
];

const emptyForm = {
  id: "",
  grade: "Grade 9",
  section: "A",
  teacher: "",
  capacity: 40,
  students: 0,
  room: "",
  status: "Active",
};

const teachers = [
  "Abebe Kebede",
  "Almaz Tesfaye",
  "Dawit Alemu",
  "Marta Bekele",
];

function ManageClasses() {
  const [classes, setClasses] = useState(initialClasses);
  const [search, setSearch] = useState("");
  const [gradeFilter, setGradeFilter] = useState("All");
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [viewClass, setViewClass] = useState(null);
  const [form, setForm] = useState(emptyForm);

  const filteredClasses = classes.filter((item) => {
    const matchesSearch =
      item.id.toLowerCase().includes(search.toLowerCase()) ||
      item.grade.toLowerCase().includes(search.toLowerCase()) ||
      item.teacher.toLowerCase().includes(search.toLowerCase()) ||
      item.section.toLowerCase().includes(search.toLowerCase());

    const matchesGrade =
      gradeFilter === "All" || item.grade === gradeFilter;

    return matchesSearch && matchesGrade;
  });

  const totalStudents = classes.reduce(
    (total, item) => total + Number(item.students),
    0
  );

  const openAddModal = () => {
    setEditingId(null);
    setForm(emptyForm);
    setShowModal(true);
  };

  const openEditModal = (item) => {
    setEditingId(item.id);
    setForm({ ...item });
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

    const capacity = Number(form.capacity);
    const students = Number(form.students);

    if (capacity < 1 || students < 0 || students > capacity) {
      alert("Check the class capacity and student count.");
      return;
    }

    const classData = {
      ...form,
      capacity,
      students,
    };

    if (editingId) {
      setClasses((current) =>
        current.map((item) =>
          item.id === editingId ? classData : item
        )
      );
    } else {
      if (classes.some((item) => item.id === form.id)) {
        alert("This class ID already exists.");
        return;
      }

      const duplicateSection = classes.some(
        (item) =>
          item.grade === form.grade &&
          item.section.toLowerCase() === form.section.toLowerCase()
      );

      if (duplicateSection) {
        alert("This section already exists for this grade.");
        return;
      }

      setClasses((current) => [...current, classData]);
    }

    setShowModal(false);
    setForm(emptyForm);
  };

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this class?")) {
      setClasses((current) =>
        current.filter((item) => item.id !== id)
      );
    }
  };

  const exportClasses = () => {
    const headers = [
      "ID",
      "Grade",
      "Section",
      "Teacher",
      "Capacity",
      "Students",
      "Room",
      "Status",
    ];

    const rows = filteredClasses.map((item) =>
      headers.map((header) => {
        const key = header.toLowerCase();
        return `"${String(item[key] ?? "").replace(/"/g, '""')}"`;
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
    link.download = "classes.csv";
    link.click();

    URL.revokeObjectURL(url);
  };

  return (
    <div className="classes-page">
      <div className="classes-heading">
        <div>
          <h1>Manage Classes</h1>
          <p>Create classes, manage sections, and assign teachers.</p>
        </div>

        <button className="add-class-btn" onClick={openAddModal}>
          <Plus size={18} />
          Add New Class
        </button>
      </div>

      <div className="class-summary">
        <div className="class-summary-card">
          <div className="class-summary-icon">
            <School size={23} />
          </div>
          <div>
            <span>Total Classes</span>
            <h2>{classes.length}</h2>
          </div>
        </div>

        <div className="class-summary-card">
          <div className="class-summary-icon class-students-icon">
            <Users size={23} />
          </div>
          <div>
            <span>Total Students</span>
            <h2>{totalStudents}</h2>
          </div>
        </div>

        <div className="class-summary-card">
          <div className="class-summary-icon class-capacity-icon">
            <School size={23} />
          </div>
          <div>
            <span>Total Capacity</span>
            <h2>
              {classes.reduce(
                (total, item) => total + Number(item.capacity),
                0
              )}
            </h2>
          </div>
        </div>
      </div>

      <div className="classes-table-panel">
        <div className="classes-toolbar">
          <div>
            <h3>Class List</h3>
            <p>All registered classes and sections</p>
          </div>

          <div className="class-filters">
            <div className="class-search">
              <Search size={18} />
              <input
                placeholder="Search classes..."
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
            </div>

            <select
              value={gradeFilter}
              onChange={(event) => setGradeFilter(event.target.value)}
            >
              <option value="All">All Grades</option>
              <option value="Grade 9">Grade 9</option>
              <option value="Grade 10">Grade 10</option>
              <option value="Grade 11">Grade 11</option>
              <option value="Grade 12">Grade 12</option>
            </select>

            <button className="export-class-btn" onClick={exportClasses}>
              <Download size={17} />
              Export
            </button>
          </div>
        </div>

        <div className="classes-table-wrapper">
          <table className="classes-table">
            <thead>
              <tr>
                <th>Class ID</th>
                <th>Grade</th>
                <th>Section</th>
                <th>Class Teacher</th>
                <th>Students</th>
                <th>Capacity</th>
                <th>Room</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {filteredClasses.map((item) => (
                <tr key={item.id}>
                  <td className="class-id">{item.id}</td>
                  <td>{item.grade}</td>
                  <td>
                    <span className="section-badge">{item.section}</span>
                  </td>
                  <td className="class-teacher">{item.teacher}</td>
                  <td>{item.students}</td>
                  <td>{item.capacity}</td>
                  <td>{item.room}</td>
                  <td>
                    <span className="class-status">{item.status}</span>
                  </td>
                  <td>
                    <div className="class-actions">
                      <button
                        title="View"
                        onClick={() => setViewClass(item)}
                      >
                        <Eye size={16} />
                      </button>

                      <button
                        title="Edit"
                        onClick={() => openEditModal(item)}
                      >
                        <Edit size={16} />
                      </button>

                      <button
                        title="Delete"
                        className="class-delete"
                        onClick={() => handleDelete(item.id)}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {filteredClasses.length === 0 && (
                <tr>
                  <td colSpan="9" className="class-empty">
                    No classes found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="classes-footer">
          Showing {filteredClasses.length} of {classes.length} classes
        </div>
      </div>

      {showModal && (
        <div className="class-modal-overlay">
          <div className="class-modal">
            <div className="class-modal-heading">
              <div>
                <h2>{editingId ? "Edit Class" : "Add New Class"}</h2>
                <p>Enter class and section information.</p>
              </div>

              <button onClick={() => setShowModal(false)}>
                <X size={21} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="class-form-grid">
                <label>
                  Class ID
                  <input
                    name="id"
                    value={form.id}
                    onChange={handleChange}
                    placeholder="e.g. CLS005"
                    disabled={Boolean(editingId)}
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
                  Section
                  <select
                    name="section"
                    value={form.section}
                    onChange={handleChange}
                  >
                    <option>A</option>
                    <option>B</option>
                    <option>C</option>
                    <option>D</option>
                  </select>
                </label>

                <label>
                  Class Teacher
                  <select
                    name="teacher"
                    value={form.teacher}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select Teacher</option>
                    {teachers.map((teacher) => (
                      <option key={teacher}>{teacher}</option>
                    ))}
                  </select>
                </label>

                <label>
                  Maximum Capacity
                  <input
                    name="capacity"
                    type="number"
                    min="1"
                    value={form.capacity}
                    onChange={handleChange}
                    required
                  />
                </label>

                <label>
                  Current Students
                  <input
                    name="students"
                    type="number"
                    min="0"
                    value={form.students}
                    onChange={handleChange}
                    required
                  />
                </label>

                <label>
                  Classroom
                  <input
                    name="room"
                    value={form.room}
                    onChange={handleChange}
                    placeholder="e.g. Room 401"
                    required
                  />
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

              <div className="class-modal-actions">
                <button
                  type="button"
                  className="class-cancel-btn"
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </button>

                <button type="submit" className="class-save-btn">
                  {editingId ? "Update Class" : "Save Class"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {viewClass && (
        <div className="class-modal-overlay">
          <div className="class-modal class-details-modal">
            <div className="class-modal-heading">
              <div>
                <h2>Class Details</h2>
                <p>Class and section information</p>
              </div>

              <button onClick={() => setViewClass(null)}>
                <X size={21} />
              </button>
            </div>

            <div className="class-details-list">
              {Object.entries(viewClass).map(([key, value]) => (
                <div key={key}>
                  <span>{key.charAt(0).toUpperCase() + key.slice(1)}</span>
                  <strong>{value}</strong>
                </div>
              ))}
            </div>

            <button
              className="class-save-btn"
              onClick={() => setViewClass(null)}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default ManageClasses;