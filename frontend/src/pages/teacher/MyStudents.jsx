
import   { useEffect, useMemo, useState } from "react";
import {
  Search,
  Plus,
  Users,
  GraduationCap,
  UserCheck,
  UserRound,
  Edit,
  Trash2,
  Eye,
  X,
  Upload,
  Image as ImageIcon,
  Download,
  Mail,
  Phone,
  MapPin,
  Filter,
  Camera,
} from "lucide-react";

import "./MyStudents.css";

const initialStudents = [
  {
    id: "STU001",
    name: "Abebe Kebede",
    email: "abebe@gmail.com",
    gender: "Male",
    className: "Grade 10A",
    phone: "0912345678",
    address: "Injibara",
    parent: "Kebede Abebe",
    image: "https://i.pravatar.cc/150?img=12",
  },
  {
    id: "STU002",
    name: "Sara Mekonnen",
    email: "sara@gmail.com",
    gender: "Female",
    className: "Grade 10A",
    phone: "0923456789",
    address: "Injibara",
    parent: "Mekonnen Tesfaye",
    image: "https://i.pravatar.cc/150?img=47",
  },
  {
    id: "STU003",
    name: "Daniel Tadesse",
    email: "daniel@gmail.com",
    gender: "Male",
    className: "Grade 10B",
    phone: "0934567890",
    address: "Bahir Dar",
    parent: "Tadesse Daniel",
    image: "https://i.pravatar.cc/150?img=13",
  },
  {
    id: "STU004",
    name: "Hana Getachew",
    email: "hana@gmail.com",
    gender: "Female",
    className: "Grade 11A",
    phone: "0945678901",
    address: "Injibara",
    parent: "Getachew Alemu",
    image: "https://i.pravatar.cc/150?img=44",
  },
  {
    id: "STU005",
    name: "Michael Worku",
    email: "michael@gmail.com",
    gender: "Male",
    className: "Grade 11B",
    phone: "0956789012",
    address: "Addis Ababa",
    parent: "Worku Michael",
    image: "https://i.pravatar.cc/150?img=14",
  },
  {
    id: "STU006",
    name: "Meron Alemu",
    email: "meron@gmail.com",
    gender: "Female",
    className: "Grade 10B",
    phone: "0967890123",
    address: "Injibara",
    parent: "Alemu Biruk",
    image: "https://i.pravatar.cc/150?img=45",
  },
];

const emptyForm = {
  id: "",
  name: "",
  email: "",
  gender: "Male",
  className: "Grade 10A",
  phone: "",
  address: "",
  parent: "",
  image: "",
};

function MyStudents() {
  const [students, setStudents] = useState(initialStudents);
  const [search, setSearch] = useState("");
  const [classFilter, setClassFilter] = useState("All");
  const [genderFilter, setGenderFilter] = useState("All");

  const [showModal, setShowModal] = useState(false);
  const [viewStudent, setViewStudent] = useState(null);
  const [editingId, setEditingId] = useState(null);

  const [form, setForm] = useState(emptyForm);
  const [imageUrl, setImageUrl] = useState("");
  const [imageError, setImageError] = useState("");

  const maleCount = students.filter(
    (student) => student.gender === "Male"
  ).length;

  const femaleCount = students.filter(
    (student) => student.gender === "Female"
  ).length;

  const classCount = new Set(
    students.map((student) => student.className)
  ).size;

  const filteredStudents = useMemo(() => {
    return students.filter((student) => {
      const matchesSearch =
        student.name.toLowerCase().includes(search.toLowerCase()) ||
        student.id.toLowerCase().includes(search.toLowerCase()) ||
        student.email.toLowerCase().includes(search.toLowerCase());

      const matchesClass =
        classFilter === "All" ||
        student.className === classFilter;

      const matchesGender =
        genderFilter === "All" ||
        student.gender === genderFilter;

      return matchesSearch && matchesClass && matchesGender;
    });
  }, [students, search, classFilter, genderFilter]);

  const updateField = (e) => {
    const { name, value } = e.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const openAddModal = () => {
    setEditingId(null);

    setForm({
      ...emptyForm,
      id: `STU${String(Date.now()).slice(-5)}`,
    });

    setImageUrl("");
    setImageError("");
    setShowModal(true);
  };

  const openEditModal = (student) => {
    setEditingId(student.id);
    setForm({ ...student });
    setImageUrl(student.image || "");
    setImageError("");
    setShowModal(true);
  };

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setImageError("Please select a valid image.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setImageError("Image size must be less than 5MB.");
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      setForm((previous) => ({
        ...previous,
        image: reader.result,
      }));

      setImageUrl("");
      setImageError("");
    };

    reader.readAsDataURL(file);
  };

  const handleImageUrl = (e) => {
    const value = e.target.value;

    setImageUrl(value);
    setImageError("");

    setForm((previous) => ({
      ...previous,
      image: value,
    }));
  };

  const saveStudent = (e) => {
    e.preventDefault();

    if (!form.name.trim() || !form.email.trim()) {
      alert("Please enter the student name and email.");
      return;
    }

    const duplicateEmail = students.some(
      (student) =>
        student.email.toLowerCase() === form.email.toLowerCase() &&
        student.id !== editingId
    );

    if (duplicateEmail) {
      alert("This email address is already registered.");
      return;
    }

    if (editingId) {
      setStudents((previous) =>
        previous.map((student) =>
          student.id === editingId ? { ...form } : student
        )
      );
    } else {
      setStudents((previous) => [
        { ...form },
        ...previous,
      ]);
    }

    setShowModal(false);
    setForm(emptyForm);
  };

  const deleteStudent = (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this student?"
    );

    if (!confirmDelete) return;

    setStudents((previous) =>
      previous.filter((student) => student.id !== id)
    );
  };

  const exportCSV = () => {
    const headers = [
      "Student ID",
      "Name",
      "Email",
      "Gender",
      "Class",
      "Phone",
      "Address",
      "Parent",
    ];

    const rows = filteredStudents.map((student) => [
      student.id,
      student.name,
      student.email,
      student.gender,
      student.className,
      student.phone,
      student.address,
      student.parent,
    ]);

    const csv = [headers, ...rows]
      .map((row) =>
        row
          .map((value) => `"${String(value || "").replace(/"/g, '""')}"`)
          .join(",")
      )
      .join("\n");

    const blob = new Blob(["\uFEFF" + csv], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "teacher-students.csv";
    link.click();

    URL.revokeObjectURL(url);
  };

  useEffect(() => {
    return () => {
      // FileReader data URLs need no object URL cleanup.
    };
  }, []);

  return (
    <div className="students-page">

      {/* Header */}
      <div className="students-header">
        <div>
          <span className="students-breadcrumb">
            Teacher / Students
          </span>

          <h1>My Students</h1>

          <p>
            Manage your students, profiles and class information.
          </p>
        </div>

        <button
          className="add-student-btn"
          onClick={openAddModal}
        >
          <Plus size={19} />
          Add Student
        </button>
      </div>

      {/* Statistics */}
      <div className="student-stats">

        <div className="student-stat-card">
          <div className="student-stat-icon purple">
            <Users size={24} />
          </div>

          <div>
            <span>Total Students</span>
            <h2>{students.length}</h2>
            <small>Registered students</small>
          </div>
        </div>

        <div className="student-stat-card">
          <div className="student-stat-icon blue">
            <UserRound size={24} />
          </div>

          <div>
            <span>Male Students</span>
            <h2>{maleCount}</h2>
            <small>Male students</small>
          </div>
        </div>

        <div className="student-stat-card">
          <div className="student-stat-icon pink">
            <UserCheck size={24} />
          </div>

          <div>
            <span>Female Students</span>
            <h2>{femaleCount}</h2>
            <small>Female students</small>
          </div>
        </div>

        <div className="student-stat-card">
          <div className="student-stat-icon orange">
            <GraduationCap size={24} />
          </div>

          <div>
            <span>Classes</span>
            <h2>{classCount}</h2>
            <small>Assigned classes</small>
          </div>
        </div>

      </div>

      {/* Student table container */}
      <div className="students-content">

        <div className="students-content-header">
          <div>
            <h2>Student Directory</h2>
            <p>View and manage your registered students.</p>
          </div>

          <button
            className="export-students-btn"
            onClick={exportCSV}
          >
            <Download size={17} />
            Export CSV
          </button>
        </div>

        {/* Filters */}
        <div className="students-filters">

          <div className="student-search">
            <Search size={19} />

            <input
              type="text"
              placeholder="Search by name, ID or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="student-filter">
            <Filter size={17} />

            <select
              value={classFilter}
              onChange={(e) => setClassFilter(e.target.value)}
            >
              <option value="All">All Classes</option>
              <option value="Grade 10A">Grade 10A</option>
              <option value="Grade 10B">Grade 10B</option>
              <option value="Grade 11A">Grade 11A</option>
              <option value="Grade 11B">Grade 11B</option>
            </select>
          </div>

          <div className="student-filter">
            <select
              value={genderFilter}
              onChange={(e) => setGenderFilter(e.target.value)}
            >
              <option value="All">All Gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
            </select>
          </div>

        </div>

        {/* Table */}
        <div className="students-table-wrapper">
          <table className="students-table">

            <thead>
              <tr>
                <th>Student</th>
                <th>Student ID</th>
                <th>Class</th>
                <th>Gender</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {filteredStudents.map((student) => (
                <tr key={student.id}>

                  <td>
                    <div className="student-info">

                      <img
                        src={
                          student.image ||
                          "https://placehold.co/100x100?text=Student"
                        }
                        alt={student.name}
                        onError={(e) => {
                          e.currentTarget.onerror = null;
                          e.currentTarget.src =
                            "https://placehold.co/100x100?text=Student";
                        }}
                      />

                      <div>
                        <strong>{student.name}</strong>
                        <span>{student.address}</span>
                      </div>

                    </div>
                  </td>

                  <td>
                    <span className="student-id">
                      {student.id}
                    </span>
                  </td>

                  <td>{student.className}</td>

                  <td>
                    <span
                      className={`gender-badge ${
                        student.gender === "Male" ? "male" : "female"
                      }`}
                    >
                      {student.gender}
                    </span>
                  </td>

                  <td>{student.email}</td>

                  <td>{student.phone}</td>

                  <td>
                    <div className="student-actions">

                      <button
                        title="View student"
                        className="view-action"
                        onClick={() => setViewStudent(student)}
                      >
                        <Eye size={17} />
                      </button>

                      <button
                        title="Edit student"
                        className="edit-action"
                        onClick={() => openEditModal(student)}
                      >
                        <Edit size={17} />
                      </button>

                      <button
                        title="Delete student"
                        className="delete-action"
                        onClick={() => deleteStudent(student.id)}
                      >
                        <Trash2 size={17} />
                      </button>

                    </div>
                  </td>

                </tr>
              ))}

              {filteredStudents.length === 0 && (
                <tr>
                  <td colSpan="7" className="students-empty">
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

      {/* Add / Edit Modal */}
      {showModal && (
        <div
          className="student-modal-overlay"
          onClick={() => setShowModal(false)}
        >
          <div
            className="student-modal"
            onClick={(e) => e.stopPropagation()}
          >

            <div className="student-modal-header">
              <div>
                <h2>
                  {editingId ? "Edit Student" : "Add New Student"}
                </h2>

                <p>Enter student information below.</p>
              </div>

              <button
                type="button"
                onClick={() => setShowModal(false)}
              >
                <X size={22} />
              </button>
            </div>

            <form onSubmit={saveStudent}>

              {/* Photo */}
              <div className="student-photo-section">

                <div className="student-photo-preview">
                  {form.image ? (
                    <img
                      src={form.image}
                      alt="Student preview"
                      onError={() => setImageError("Unable to load this image URL.")}
                    />
                  ) : (
                    <Camera size={32} />
                  )}
                </div>

                <div className="student-photo-controls">
                  <strong>Student Profile Photo</strong>

                  <label className="upload-photo-btn">
                    <Upload size={16} />
                    Upload Image

                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                    />
                  </label>

                  <span>PNG, JPG or JPEG (maximum 5MB)</span>
                </div>

              </div>

              <div className="student-url-field">
                <label>Or enter image URL</label>

                <div className="student-url-input">
                  <ImageIcon size={18} />

                  <input
                    type="url"
                    placeholder="https://example.com/photo.jpg"
                    value={imageUrl}
                    onChange={handleImageUrl}
                  />
                </div>
              </div>

              {imageError && (
                <p className="student-image-error">{imageError}</p>
              )}

              {/* Form fields */}
              <div className="student-form-grid">

                <div className="student-form-group">
                  <label>Student ID</label>
                  <input
                    name="id"
                    value={form.id}
                    readOnly
                  />
                </div>

                <div className="student-form-group">
                  <label>Full Name *</label>
                  <input
                    name="name"
                    value={form.name}
                    onChange={updateField}
                    placeholder="Enter full name"
                    required
                  />
                </div>

                <div className="student-form-group">
                  <label>Email *</label>
                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={updateField}
                    placeholder="student@email.com"
                    required
                  />
                </div>

                <div className="student-form-group">
                  <label>Phone Number</label>
                  <input
                    name="phone"
                    value={form.phone}
                    onChange={updateField}
                    placeholder="09XXXXXXXX"
                  />
                </div>

                <div className="student-form-group">
                  <label>Gender</label>
                  <select
                    name="gender"
                    value={form.gender}
                    onChange={updateField}
                  >
                    <option>Male</option>
                    <option>Female</option>
                  </select>
                </div>

                <div className="student-form-group">
                  <label>Class</label>
                  <select
                    name="className"
                    value={form.className}
                    onChange={updateField}
                  >
                    <option>Grade 10A</option>
                    <option>Grade 10B</option>
                    <option>Grade 11A</option>
                    <option>Grade 11B</option>
                  </select>
                </div>

                <div className="student-form-group">
                  <label>Parent Name</label>
                  <input
                    name="parent"
                    value={form.parent}
                    onChange={updateField}
                    placeholder="Parent full name"
                  />
                </div>

                <div className="student-form-group">
                  <label>Address</label>
                  <input
                    name="address"
                    value={form.address}
                    onChange={updateField}
                    placeholder="Student address"
                  />
                </div>

              </div>

              <div className="student-modal-footer">

                <button
                  type="button"
                  className="cancel-student-btn"
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="save-student-btn"
                >
                  {editingId ? "Update Student" : "Save Student"}
                </button>

              </div>

            </form>

          </div>
        </div>
      )}

      {/* View Student Modal */}
      {viewStudent && (
        <div
          className="student-modal-overlay"
          onClick={() => setViewStudent(null)}
        >
          <div
            className="student-view-modal"
            onClick={(e) => e.stopPropagation()}
          >

            <button
              className="student-view-close"
              onClick={() => setViewStudent(null)}
            >
              <X size={22} />
            </button>

            <img
              className="student-view-avatar"
              src={
                viewStudent.image ||
                "https://placehold.co/150x150?text=Student"
              }
              alt={viewStudent.name}
            />

            <h2>{viewStudent.name}</h2>
            <span className="student-view-id">{viewStudent.id}</span>

            <div className="student-view-details">

              <p>
                <Mail size={17} />
                {viewStudent.email}
              </p>

              <p>
                <Phone size={17} />
                {viewStudent.phone || "Not provided"}
              </p>

              <p>
                <GraduationCap size={17} />
                {viewStudent.className}
              </p>

              <p>
                <UserRound size={17} />
                {viewStudent.gender}
              </p>

              <p>
                <MapPin size={17} />
                {viewStudent.address || "Not provided"}
              </p>

              <p>
                <Users size={17} />
                Parent: {viewStudent.parent || "Not provided"}
              </p>

            </div>

            <button
              className="save-student-btn view-done-btn"
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

export default MyStudents;
