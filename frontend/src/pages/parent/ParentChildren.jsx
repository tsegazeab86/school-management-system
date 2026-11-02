
import { useState } from "react";
import {
  Search,
  Users,
  GraduationCap,
  CalendarCheck,
  BookOpen,
  Eye,
  X,
  UserRound,
  School,
  Phone,
  Mail,
  MapPin,
  TrendingUp,
  Award,
  Filter,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import "./ParentChildren.css";

const childrenData = [
  {
    id: 1,
    name: "Abebe Tadesse",
    grade: "Grade 10",
    section: "A",
    studentId: "STU-1001",
    gender: "Male",
    age: 16,
    attendance: 96,
    average: 88,
    status: "Active",
    phone: "+251 912 345 678",
    email: "abebe@example.com",
    address: "Injibara, Ethiopia",
    classTeacher: "Mr. Daniel",
    subjects: [
      { name: "Mathematics", score: 92 },
      { name: "English", score: 85 },
      { name: "Physics", score: 88 },
      { name: "Biology", score: 87 },
    ],
  },
  {
    id: 2,
    name: "Hana Tadesse",
    grade: "Grade 7",
    section: "B",
    studentId: "STU-7002",
    gender: "Female",
    age: 13,
    attendance: 92,
    average: 84,
    status: "Active",
    phone: "+251 911 222 333",
    email: "hana@example.com",
    address: "Injibara, Ethiopia",
    classTeacher: "Mrs. Almaz",
    subjects: [
      { name: "Mathematics", score: 86 },
      { name: "English", score: 82 },
      { name: "Science", score: 85 },
      { name: "Amharic", score: 83 },
    ],
  },
];

function ParentChildren() {
  const [children] = useState(childrenData);
  const [search, setSearch] = useState("");
  const [gradeFilter, setGradeFilter] = useState("All");
  const [selectedChild, setSelectedChild] = useState(null);

  const filteredChildren = children.filter((child) => {
    const searchText = search.trim().toLowerCase();

    const matchesSearch =
      child.name.toLowerCase().includes(searchText) ||
      child.studentId.toLowerCase().includes(searchText) ||
      child.grade.toLowerCase().includes(searchText);

    const matchesGrade =
      gradeFilter === "All" || child.grade === gradeFilter;

    return matchesSearch && matchesGrade;
  });

  const averageAttendance =
    children.length > 0
      ? Math.round(
          children.reduce((total, child) => total + child.attendance, 0) /
            children.length
        )
      : 0;

  const averagePerformance =
    children.length > 0
      ? Math.round(
          children.reduce((total, child) => total + child.average, 0) /
            children.length
        )
      : 0;

  const getProgressColor = (value) => {
    if (value >= 85) return "success";
    if (value >= 70) return "warning";
    return "danger";
  };

  return (
    <div className="parent-children-page container-fluid">
      {/* Page Header */}
      <motion.div
        className="children-header"
        initial={{ opacity: 0, y: -15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div>
          <h2>My Children</h2>
          <p>View your children's academic and personal information.</p>
        </div>

        <div className="children-header-icon">
          <Users size={30} />
        </div>
      </motion.div>

      {/* Summary Cards */}
      <div className="row g-4 children-summary">
        <div className="col-12 col-sm-6 col-xl-4">
          <motion.div
            className="children-stat-card"
            whileHover={{ y: -5 }}
          >
            <div className="children-stat-icon purple">
              <Users size={25} />
            </div>
            <div>
              <span>Total Children</span>
              <h3>{children.length}</h3>
              <small>Registered children</small>
            </div>
          </motion.div>
        </div>

        <div className="col-12 col-sm-6 col-xl-4">
          <motion.div
            className="children-stat-card"
            whileHover={{ y: -5 }}
          >
            <div className="children-stat-icon green">
              <CalendarCheck size={25} />
            </div>
            <div>
              <span>Average Attendance</span>
              <h3>{averageAttendance}%</h3>
              <small>Attendance percentage</small>
            </div>
          </motion.div>
        </div>

        <div className="col-12 col-sm-6 col-xl-4">
          <motion.div
            className="children-stat-card"
            whileHover={{ y: -5 }}
          >
            <div className="children-stat-icon orange">
              <TrendingUp size={25} />
            </div>
            <div>
              <span>Average Performance</span>
              <h3>{averagePerformance}%</h3>
              <small>Academic average</small>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="children-filter-card">
        <div className="children-search">
          <Search size={19} />
          <input
            type="text"
            placeholder="Search by name, student ID, or grade..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>

        <div className="children-grade-filter">
          <Filter size={18} />
          <select
            className="form-select"
            value={gradeFilter}
            onChange={(event) => setGradeFilter(event.target.value)}
          >
            <option value="All">All Grades</option>
            <option value="Grade 10">Grade 10</option>
            <option value="Grade 7">Grade 7</option>
          </select>
        </div>
      </div>

      {/* Children Cards */}
      <div className="children-section-title">
        <h4>Registered Children</h4>
        <span>{filteredChildren.length} children found</span>
      </div>

      <div className="row g-4">
        <AnimatePresence>
          {filteredChildren.map((child) => (
            <div
              className="col-12 col-md-6 col-xl-4"
              key={child.id}
            >
              <motion.div
                className="child-profile-card"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3 }}
                whileHover={{ y: -5 }}
              >
                <div className="child-card-top">
                  <div className="child-avatar">
                    <UserRound size={32} />
                  </div>

                  <span className="child-status">
                    {child.status}
                  </span>
                </div>

                <h5>{child.name}</h5>
                <p className="child-student-id">{child.studentId}</p>

                <div className="child-basic-info">
                  <div>
                    <School size={17} />
                    <span>{child.grade} - Section {child.section}</span>
                  </div>

                  <div>
                    <GraduationCap size={17} />
                    <span>{child.classTeacher}</span>
                  </div>
                </div>

                <div className="child-progress-area">
                  <div className="child-progress-heading">
                    <span>Attendance</span>
                    <strong>{child.attendance}%</strong>
                  </div>

                  <div className="progress">
                    <div
                      className={`progress-bar bg-${getProgressColor(
                        child.attendance
                      )}`}
                      style={{ width: `${child.attendance}%` }}
                    />
                  </div>

                  <div className="child-progress-heading mt-3">
                    <span>Academic Performance</span>
                    <strong>{child.average}%</strong>
                  </div>

                  <div className="progress">
                    <div
                      className={`progress-bar bg-${getProgressColor(
                        child.average
                      )}`}
                      style={{ width: `${child.average}%` }}
                    />
                  </div>
                </div>

                <div className="child-card-footer">
                  <button
                    className="btn child-view-btn"
                    onClick={() => setSelectedChild(child)}
                  >
                    <Eye size={17} />
                    View Details
                  </button>
                </div>
              </motion.div>
            </div>
          ))}
        </AnimatePresence>

        {filteredChildren.length === 0 && (
          <div className="col-12">
            <div className="children-empty">
              <Users size={42} />
              <h5>No children found</h5>
              <p>Try changing your search or grade filter.</p>
            </div>
          </div>
        )}
      </div>

      {/* Child Details Modal */}
      <AnimatePresence>
        {selectedChild && (
          <motion.div
            className="child-modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedChild(null)}
          >
            <motion.div
              className="child-details-modal"
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              onClick={(event) => event.stopPropagation()}
            >
              <div className="child-modal-header">
                <div>
                  <h4>Child Details</h4>
                  <p>Personal and academic information</p>
                </div>

                <button
                  className="child-modal-close"
                  onClick={() => setSelectedChild(null)}
                  aria-label="Close"
                >
                  <X size={22} />
                </button>
              </div>

              <div className="child-modal-profile">
                <div className="child-avatar large">
                  <UserRound size={38} />
                </div>
                <div>
                  <h5>{selectedChild.name}</h5>
                  <span>{selectedChild.studentId}</span>
                </div>
              </div>

              <div className="child-details-grid">
                <div>
                  <span>Grade</span>
                  <strong>{selectedChild.grade}</strong>
                </div>

                <div>
                  <span>Section</span>
                  <strong>{selectedChild.section}</strong>
                </div>

                <div>
                  <span>Age</span>
                  <strong>{selectedChild.age} years</strong>
                </div>

                <div>
                  <span>Gender</span>
                  <strong>{selectedChild.gender}</strong>
                </div>

                <div>
                  <span>Attendance</span>
                  <strong>{selectedChild.attendance}%</strong>
                </div>

                <div>
                  <span>Average Score</span>
                  <strong>{selectedChild.average}%</strong>
                </div>
              </div>

              <div className="child-contact-details">
                <h6>Contact Information</h6>

                <p>
                  <Phone size={17} />
                  {selectedChild.phone}
                </p>

                <p>
                  <Mail size={17} />
                  {selectedChild.email}
                </p>

                <p>
                  <MapPin size={17} />
                  {selectedChild.address}
                </p>
              </div>

              <div className="child-subjects">
                <h6>
                  <BookOpen size={18} />
                  Subject Performance
                </h6>

                {selectedChild.subjects.map((subject) => (
                  <div className="child-subject-row" key={subject.name}>
                    <span>{subject.name}</span>
                    <strong>
                      {subject.score}% <Award size={15} />
                    </strong>
                  </div>
                ))}
              </div>

              <div className="child-readonly-notice">
                <strong>Parent Permission:</strong>
                You can view your child's information, but only authorized
                school staff can edit academic records.
              </div>

              <button
                className="btn child-close-btn"
                onClick={() => setSelectedChild(null)}
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

export default ParentChildren;
