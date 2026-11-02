
import { useMemo, useState } from "react";
import {
  Plus, Search, Edit, Trash2, X, Users,
  GraduationCap, BookOpen, UserRound, Filter
} from "lucide-react";
import "../../styles/registrar/GradeSectionManagement.css";

const initialClasses = [
  { id: 1, grade: "Grade 1", section: "A", teacher: "Abebe Kebede", capacity: 40, students: 35, room: "Room 101" },
  { id: 2, grade: "Grade 1", section: "B", teacher: "Martha Tadesse", capacity: 40, students: 38, room: "Room 102" },
  { id: 3, grade: "Grade 2", section: "A", teacher: "Dawit Getachew", capacity: 40, students: 32, room: "Room 201" },
  { id: 4, grade: "Grade 3", section: "A", teacher: "Selamawit Alemu", capacity: 40, students: 40, room: "Room 301" },
  { id: 5, grade: "Grade 4", section: "A", teacher: "Bereket Tesfaye", capacity: 45, students: 36, room: "Room 401" },
  { id: 6, grade: "Grade 5", section: "B", teacher: "Hana Worku", capacity: 45, students: 29, room: "Room 502" },
];

const emptyForm = {
  grade: "Grade 1",
  section: "A",
  teacher: "",
  capacity: 40,
  students: 0,
  room: "",
};

function GradeSectionManagement() {
  const [classes, setClasses] = useState(initialClasses);
  const [search, setSearch] = useState("");
  const [gradeFilter, setGradeFilter] = useState("All");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState("");

  const filteredClasses = useMemo(() => {
    return classes.filter((item) => {
      const text = `${item.grade} ${item.section} ${item.teacher} ${item.room}`.toLowerCase();
      return (
        text.includes(search.toLowerCase()) &&
        (gradeFilter === "All" || item.grade === gradeFilter)
      );
    });
  }, [classes, search, gradeFilter]);

  const totalStudents = classes.reduce((sum, item) => sum + Number(item.students), 0);
  const totalCapacity = classes.reduce((sum, item) => sum + Number(item.capacity), 0);
  const availableSeats = totalCapacity - totalStudents;

  const openAddModal = () => {
    setEditingId(null);
    setForm(emptyForm);
    setError("");
    setModalOpen(true);
  };

  const openEditModal = (item) => {
    setEditingId(item.id);
    setForm({
      grade: item.grade,
      section: item.section,
      teacher: item.teacher,
      capacity: item.capacity,
      students: item.students,
      room: item.room,
    });
    setError("");
    setModalOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!form.teacher.trim() || !form.room.trim()) {
      setError("Please complete the teacher and classroom fields.");
      return;
    }

    if (Number(form.capacity) < Number(form.students)) {
      setError("Capacity cannot be lower than the current student count.");
      return;
    }

    const duplicate = classes.some(
      (item) =>
        item.id !== editingId &&
        item.grade === form.grade &&
        item.section.toUpperCase() === form.section.trim().toUpperCase()
    );

    if (duplicate) {
      setError("This grade and section already exist.");
      return;
    }

    const cleanData = {
      ...form,
      id: editingId ?? Date.now(),
      section: form.section.trim().toUpperCase(),
      capacity: Number(form.capacity),
      students: Number(form.students),
      teacher: form.teacher.trim(),
      room: form.room.trim(),
    };

    if (editingId) {
      setClasses((prev) =>
        prev.map((item) => item.id === editingId ? cleanData : item)
      );
    } else {
      setClasses((prev) => [...prev, cleanData]);
    }

    setModalOpen(false);
    setForm(emptyForm);
    setError("");
  };

  const handleDelete = (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this class section?"
    );

    if (confirmed) {
      setClasses((prev) => prev.filter((item) => item.id !== id));
    }
  };

  return (
    <div className="grade-management-page">
      <div className="grade-page-heading">
        <div>
          <h2>Grade & Section Management</h2>
          <p>Manage school grades, class sections, teachers and student capacity.</p>
        </div>
        <button className="grade-primary-btn" onClick={openAddModal}>
          <Plus size={18} /> Add New Section
        </button>
      </div>

      <div className="grade-summary-grid">
        <div className="grade-summary-card">
          <div className="grade-summary-icon purple"><GraduationCap /></div>
          <div>
            <span>Total Sections</span>
            <h3>{classes.length}</h3>
          </div>
        </div>

        <div className="grade-summary-card">
          <div className="grade-summary-icon blue"><Users /></div>
          <div>
            <span>Total Students</span>
            <h3>{totalStudents}</h3>
          </div>
        </div>

        <div className="grade-summary-card">
          <div className="grade-summary-icon green"><BookOpen /></div>
          <div>
            <span>Total Capacity</span>
            <h3>{totalCapacity}</h3>
          </div>
        </div>

        <div className="grade-summary-card">
          <div className="grade-summary-icon orange"><UserRound /></div>
          <div>
            <span>Available Seats</span>
            <h3>{availableSeats}</h3>
          </div>
        </div>
      </div>

      <div className="grade-content-card">
        <div className="grade-content-heading">
          <div>
            <h3>Class Sections</h3>
            <p>View and manage all grade sections.</p>
          </div>
          <span className="grade-record-count">{filteredClasses.length} Records</span>
        </div>

        <div className="grade-toolbar">
          <div className="grade-search-box">
            <Search size={18} />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search grade, section, teacher or room..."
            />
          </div>

          <div className="grade-filter-box">
            <Filter size={17} />
            <select value={gradeFilter} onChange={(e) => setGradeFilter(e.target.value)}>
              <option value="All">All Grades</option>
              {Array.from({ length: 12 }, (_, i) => (
                <option key={i + 1}>Grade {i + 1}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="grade-table-wrapper">
          <table className="grade-table">
            <thead>
              <tr>
                <th>Grade / Section</th>
                <th>Class Teacher</th>
                <th>Classroom</th>
                <th>Students</th>
                <th>Capacity</th>
                <th>Availability</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredClasses.length ? filteredClasses.map((item) => {
                const percentage = Math.min(
                  100,
                  Math.round((item.students / item.capacity) * 100)
                );

                return (
                  <tr key={item.id}>
                    <td>
                      <div className="grade-name-cell">
                        <span className="grade-avatar">{item.section}</span>
                        <div>
                          <strong>{item.grade}</strong>
                          <small>Section {item.section}</small>
                        </div>
                      </div>
                    </td>
                    <td>{item.teacher}</td>
                    <td>{item.room}</td>
                    <td><strong>{item.students}</strong></td>
                    <td>{item.capacity}</td>
                    <td>
                      <div className="grade-capacity-cell">
                        <div className="grade-progress">
                          <span style={{ width: `${percentage}%` }} />
                        </div>
                        <small>{percentage}% occupied</small>
                      </div>
                    </td>
                    <td>
                      <div className="grade-actions">
                        <button title="Edit" onClick={() => openEditModal(item)}>
                          <Edit size={16} />
                        </button>
                        <button
                          title="Delete"
                          className="grade-delete-btn"
                          onClick={() => handleDelete(item.id)}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              }) : (
                <tr>
                  <td colSpan="7" className="grade-empty">
                    No class sections found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {modalOpen && (
        <div className="grade-modal-overlay" onClick={() => setModalOpen(false)}>
          <div className="grade-modal" onClick={(e) => e.stopPropagation()}>
            <div className="grade-modal-heading">
              <div>
                <h3>{editingId ? "Edit Class Section" : "Add New Section"}</h3>
                <p>Enter the class section information below.</p>
              </div>
              <button onClick={() => setModalOpen(false)}><X /></button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="grade-form-grid">
                <label>
                  Grade
                  <select
                    value={form.grade}
                    onChange={(e) => setForm({ ...form, grade: e.target.value })}
                  >
                    {Array.from({ length: 12 }, (_, i) => (
                      <option key={i + 1}>Grade {i + 1}</option>
                    ))}
                  </select>
                </label>

                <label>
                  Section
                  <input
                    required
                    maxLength="3"
                    value={form.section}
                    onChange={(e) => setForm({ ...form, section: e.target.value })}
                    placeholder="Example: A"
                  />
                </label>

                <label className="grade-full-field">
                  Class Teacher
                  <input
                    required
                    value={form.teacher}
                    onChange={(e) => setForm({ ...form, teacher: e.target.value })}
                    placeholder="Enter teacher name"
                  />
                </label>

                <label>
                  Classroom
                  <input
                    required
                    value={form.room}
                    onChange={(e) => setForm({ ...form, room: e.target.value })}
                    placeholder="Example: Room 101"
                  />
                </label>

                <label>
                  Student Capacity
                  <input
                    type="number"
                    min="1"
                    required
                    value={form.capacity}
                    onChange={(e) => setForm({ ...form, capacity: e.target.value })}
                  />
                </label>

                <label className="grade-full-field">
                  Current Students
                  <input
                    type="number"
                    min="0"
                    required
                    value={form.students}
                    onChange={(e) => setForm({ ...form, students: e.target.value })}
                  />
                </label>
              </div>

              {error && <p className="grade-form-error">{error}</p>}

              <div className="grade-modal-actions">
                <button type="button" className="grade-cancel-btn" onClick={() => setModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="grade-save-btn">
                  {editingId ? "Save Changes" : "Create Section"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default GradeSectionManagement;
