
import { useMemo, useState } from "react";
import {
  Search,
  Plus,
  Eye,
  Edit,
  Trash2,
  Users,
  UserCheck,
  UserX,
  Download,
  X,
  Filter,
  GraduationCap,
  Phone,
  Mail,
  UserRound
} from "lucide-react";

import "../../styles/registrar/ManageStudents.css";

const initialStudents = [
  {
    id: "STU001",
    name: "Abebe Kebede",
    image: "https://i.pravatar.cc/150?img=12",
    gender: "Male",
    grade: "Grade 10",
    section: "A",
    phone: "0912345678",
    email: "abebe@example.com",
    parent: "Kebede Alemu",
    status: "Active",
  },
  {
    id: "STU002",
    name: "Martha Tadesse",
    image: "https://i.pravatar.cc/150?img=47",
    gender: "Female",
    grade: "Grade 9",
    section: "B",
    phone: "0923456789",
    email: "martha@example.com",
    parent: "Tadesse Bekele",
    status: "Active",
  },
  {
    id: "STU003",
    name: "Dawit Getachew",
    image: "https://i.pravatar.cc/150?img=13",
    gender: "Male",
    grade: "Grade 11",
    section: "A",
    phone: "0934567890",
    email: "dawit@example.com",
    parent: "Getachew Worku",
    status: "Inactive",
  },
  {
    id: "STU004",
    name: "Selamawit Alemu",
    image: "https://i.pravatar.cc/150?img=44",
    gender: "Female",
    grade: "Grade 8",
    section: "C",
    phone: "0945678901",
    email: "selamawit@example.com",
    parent: "Alemu Tesfaye",
    status: "Active",
  },
  {
    id: "STU005",
    name: "Bereket Tesfaye",
    image: "https://i.pravatar.cc/150?img=14",
    gender: "Male",
    grade: "Grade 12",
    section: "A",
    phone: "0956789012",
    email: "bereket@example.com",
    parent: "Tesfaye Abebe",
    status: "Active",
  },
];

function ManageStudents() {
  const [students, setStudents] = useState(initialStudents);
  const [search, setSearch] = useState("");
  const [gradeFilter, setGradeFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [selectedStudent, setSelectedStudent] = useState(null);

  const filteredStudents = useMemo(() => {
    return students.filter((student) => {
      const matchesSearch =
        student.name.toLowerCase().includes(search.toLowerCase()) ||
        student.id.toLowerCase().includes(search.toLowerCase());

      const matchesGrade =
        gradeFilter === "All" || student.grade === gradeFilter;

      const matchesStatus =
        statusFilter === "All" || student.status === statusFilter;

      return matchesSearch && matchesGrade && matchesStatus;
    });
  }, [students, search, gradeFilter, statusFilter]);

  const activeCount = students.filter(
    (student) => student.status === "Active"
  ).length;

  const inactiveCount = students.length - activeCount;

  const deleteStudent = (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this student?"
    );

    if (confirmed) {
      setStudents((prev) =>
        prev.filter((student) => student.id !== id)
      );

      if (selectedStudent?.id === id) {
        setSelectedStudent(null);
      }
    }
  };

  const changeStatus = (id) => {
    setStudents((prev) =>
      prev.map((student) =>
        student.id === id
          ? {
            ...student,
            status:
              student.status === "Active" ? "Inactive" : "Active",
          }
          : student
      )
    );

    setSelectedStudent((prev) =>
      prev?.id === id
        ? {
          ...prev,
          status: prev.status === "Active" ? "Inactive" : "Active",
        }
        : prev
    );
  };

  const exportStudents = () => {
    const headers = [
      "Student ID",
      "Name",
      "Gender",
      "Grade",
      "Section",
      "Phone",
      "Email",
      "Parent",
      "Status",
    ];

    const rows = filteredStudents.map((student) => [
      student.id,
      student.name,
      student.gender,
      student.grade,
      student.section,
      student.phone,
      student.email,
      student.parent,
      student.status,
    ]);

    const csv = [headers, ...rows]
      .map((row) =>
        row
          .map((value) => `"${String(value ?? "").replace(/"/g, '""')}"`)
          .join(",")
      )
      .join("\n");

    const blob = new Blob(["\uFEFF" + csv], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "students.csv";
    link.click();

    URL.revokeObjectURL(url);
  };

  return (
    <div className="manage-students-page">

      {/* Page Header */}
      <div className="students-page-heading">
        <div>
          <h2>Manage Students</h2>
          <p>
            View, search, update and manage registered students.
          </p>
        </div>

        <button
          className="students-add-btn"
          onClick={() =>
            window.location.href = "/registrar/registration"
          }
        >
          <Plus size={18} />
          Register Student
        </button>
      </div>

      {/* Statistics */}
      <div className="students-stat-grid">

        <div className="students-stat-card">
          <div className="students-stat-icon purple">
            <Users size={23} />
          </div>
          <div>
            <span>Total Students</span>
            <h3>{students.length}</h3>
          </div>
        </div>

        <div className="students-stat-card">
          <div className="students-stat-icon green">
            <UserCheck size={23} />
          </div>
          <div>
            <span>Active Students</span>
            <h3>{activeCount}</h3>
          </div>
        </div>

        <div className="students-stat-card">
          <div className="students-stat-icon orange">
            <UserX size={23} />
          </div>
          <div>
            <span>Inactive Students</span>
            <h3>{inactiveCount}</h3>
          </div>
        </div>

      </div>

      {/* Student Table */}
      <div className="students-table-card">

        <div className="students-table-heading">
          <div>
            <h3>Student List</h3>
            <p>Manage all registered student records.</p>
          </div>

          <button
            className="students-export-btn"
            onClick={exportStudents}
          >
            <Download size={17} />
            Export CSV
          </button>
        </div>

        {/* Search and Filters */}
        <div className="students-filters">

          <div className="students-search">
            <Search size={19} />

            <input
              type="text"
              placeholder="Search by name or student ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="students-filter-control">
            <Filter size={17} />

            <select
              value={gradeFilter}
              onChange={(e) => setGradeFilter(e.target.value)}
            >
              <option value="All">All Grades</option>

              {Array.from({ length: 12 }, (_, i) => (
                <option key={i + 1}>
                  Grade {i + 1}
                </option>
              ))}
            </select>
          </div>

          <select
            className="students-status-filter"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="All">All Status</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>

        </div>

        {/* Table */}
        <div className="students-table-wrapper">

          <table className="students-table">

            <thead>
              <tr>
                <th>Student ID</th>
                <th>Student Profile</th>
                <th>Gender</th>
                <th>Grade</th>
                <th>Section</th>
                <th>Phone</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>

              {filteredStudents.length > 0 ? (

                filteredStudents.map((student) => (

                  <tr key={student.id}>

                    <td className="student-id">
                      {student.id}
                    </td>

                    <td>
                      <div className="student-profile-cell">

                        <div className="student-avatar-wrapper">
                          <img
                            src={student.image}
                            alt={student.name}
                            className="student-profile-image"
                            onError={(e) => {
                              e.currentTarget.style.display = "none";
                              e.currentTarget.nextElementSibling.style.display = "flex";
                            }}
                          />

                          <div className="student-avatar-fallback">
                            {student.name
                              .split(" ")
                              .map((word) => word[0])
                              .join("")
                              .slice(0, 2)
                              .toUpperCase()}
                          </div>
                        </div>

                        <div>
                          <strong>{student.name}</strong>
                          <small>{student.email}</small>
                        </div>

                      </div>
                    </td>

                    <td>{student.gender}</td>
                    <td>{student.grade}</td>
                    <td>{student.section}</td>
                    <td>{student.phone}</td>

                    <td>
                      <span
                        className={`student-status ${student.status === "Active"
                            ? "active"
                            : "inactive"
                          }`}
                      >
                        {student.status}
                      </span>
                    </td>

                    <td>
                      <div className="student-action-buttons">

                        <button
                          title="View Student"
                          onClick={() =>
                            setSelectedStudent(student)
                          }
                        >
                          <Eye size={17} />
                        </button>

                        <button
                          title="Change Status"
                          onClick={() =>
                            changeStatus(student.id)
                          }
                        >
                          <Edit size={17} />
                        </button>

                        <button
                          title="Delete Student"
                          className="delete-action"
                          onClick={() =>
                            deleteStudent(student.id)
                          }
                        >
                          <Trash2 size={17} />
                        </button>

                      </div>
                    </td>

                  </tr>

                ))

              ) : (

                <tr>
                  <td colSpan="8" className="students-empty">
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

      {/* Student Details Modal */}
      {selectedStudent && (

        <div
          className="student-modal-overlay"
          onClick={() => setSelectedStudent(null)}
        >

          <div
            className="student-details-modal"
            onClick={(e) => e.stopPropagation()}
          >

            <div className="student-modal-header">

              <div>
                <h3>Student Details</h3>
                <p>{selectedStudent.id}</p>
              </div>

              <button
                onClick={() => setSelectedStudent(null)}
                aria-label="Close"
              >
                <X size={20} />
              </button>

            </div>

            <div className="student-modal-profile">

              <img
                src={selectedStudent.image}
                alt={selectedStudent.name}
                className="student-modal-image"
              />

              <h3>{selectedStudent.name}</h3>

              <span className={`student-status ${selectedStudent.status === "Active"
                  ? "active"
                  : "inactive"
                }`}>
                {selectedStudent.status}
              </span>

            </div>

            <div className="student-modal-body">

              <p>
                <GraduationCap size={17} />
                <strong>Grade:</strong> {selectedStudent.grade}
              </p>

              <p>
                <Users size={17} />
                <strong>Section:</strong> {selectedStudent.section}
              </p>

              <p>
                <UserRound size={17} />
                <strong>Gender:</strong> {selectedStudent.gender}
              </p>

              <p>
                <Phone size={17} />
                <strong>Phone:</strong> {selectedStudent.phone}
              </p>

              <p>
                <Mail size={17} />
                <strong>Email:</strong> {selectedStudent.email}
              </p>

              <p>
                <UserRound size={17} />
                <strong>Parent:</strong> {selectedStudent.parent}
              </p>

            </div>

            <button
              className="student-modal-close"
              onClick={() => setSelectedStudent(null)}
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
