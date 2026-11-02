import   { useMemo, useState } from "react";
import { 
  BookOpen,
  Users,
  GraduationCap,
  Search,
  MapPin,
  Clock,
  CalendarDays,
  ChevronRight,
  X,
  Mail,
//   Phone,
  Filter,
  School,
  UserRound,
} from "lucide-react";
import "./MyClasses.css";

const initialClasses = [
  {
    id: 1,
    name: "Grade 10A",
    grade: "Grade 10",
    section: "A",
    room: "Room 101",
    students: 32,
    subjects: ["Mathematics", "Physics", "Computer Science"],
    schedule: "Monday - Friday",
    time: "8:00 AM - 2:00 PM",
    color: "purple",
    description: "Science-focused class with regular practical activities.",
    studentList: [
      { id: "STU001", name: "Abebe Kebede", gender: "Male", email: "abebe@example.com" },
      { id: "STU002", name: "Mekdes Alemu", gender: "Female", email: "mekdes@example.com" },
      { id: "STU003", name: "Dawit Tesfaye", gender: "Male", email: "dawit@example.com" },
      { id: "STU004", name: "Hana Bekele", gender: "Female", email: "hana@example.com" },
      { id: "STU005", name: "Samuel Girma", gender: "Male", email: "samuel@example.com" },
    ],
  },
  {
    id: 2,
    name: "Grade 10B",
    grade: "Grade 10",
    section: "B",
    room: "Room 102",
    students: 30,
    subjects: ["English", "Biology", "Mathematics"],
    schedule: "Monday - Friday",
    time: "8:00 AM - 2:00 PM",
    color: "blue",
    description: "General academic class with collaborative learning activities.",
    studentList: [
      { id: "STU006", name: "Rahel Worku", gender: "Female", email: "rahel@example.com" },
      { id: "STU007", name: "Yonas Tadesse", gender: "Male", email: "yonas@example.com" },
      { id: "STU008", name: "Selamawit Desta", gender: "Female", email: "selamawit@example.com" },
      { id: "STU009", name: "Bereket Mulu", gender: "Male", email: "bereket@example.com" },
    ],
  },
  {
    id: 3,
    name: "Grade 11A",
    grade: "Grade 11",
    section: "A",
    room: "Room 201",
    students: 28,
    subjects: ["Mathematics", "Physics", "Chemistry"],
    schedule: "Monday - Friday",
    time: "9:00 AM - 3:00 PM",
    color: "green",
    description: "Senior science class preparing for advanced academic studies.",
    studentList: [
      { id: "STU010", name: "Mihret Abebe", gender: "Female", email: "mihret@example.com" },
      { id: "STU011", name: "Fikru Tadesse", gender: "Male", email: "fikru@example.com" },
      { id: "STU012", name: "Eden Getachew", gender: "Female", email: "eden@example.com" },
    ],
  },
  {
    id: 4,
    name: "Grade 11B",
    grade: "Grade 11",
    section: "B",
    room: "Room 202",
    students: 35,
    subjects: ["Computer Science", "English", "Biology"],
    schedule: "Monday - Friday",
    time: "9:00 AM - 3:00 PM",
    color: "orange",
    description: "Technology and general studies class.",
    studentList: [
      { id: "STU013", name: "Nahom Worku", gender: "Male", email: "nahom@example.com" },
      { id: "STU014", name: "Marta Bekele", gender: "Female", email: "marta@example.com" },
      { id: "STU015", name: "Daniel Alemu", gender: "Male", email: "daniel@example.com" },
    ],
  },
];

function MyClasses() {
  const [classes] = useState(initialClasses);
  const [searchTerm, setSearchTerm] = useState("");
  const [gradeFilter, setGradeFilter] = useState("All");
  const [selectedClass, setSelectedClass] = useState(null);

  const filteredClasses = useMemo(() => {
    return classes.filter((item) => {
      const matchesSearch =
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.room.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.subjects.some((subject) =>
          subject.toLowerCase().includes(searchTerm.toLowerCase())
        );

      const matchesGrade =
        gradeFilter === "All" || item.grade === gradeFilter;

      return matchesSearch && matchesGrade;
    });
  }, [classes, searchTerm, gradeFilter]);

  const totalStudents = classes.reduce(
    (total, item) => total + item.students,
    0
  );

  return (
    <div className="myclasses-page">
      {/* Hero */}
      <section className="myclasses-hero">
        <div className="myclasses-hero-content">
          <span className="myclasses-eyebrow">
            <GraduationCap size={16} /> TEACHER WORKSPACE
          </span>
          <h1>My Classes</h1>
          <p>
            Manage your assigned classes, explore student information,
            and keep track of your teaching schedule.
          </p>

          <div className="myclasses-hero-info">
            <span><School size={16} /> {classes.length} Assigned Classes</span>
            <span><Users size={16} /> {totalStudents} Students</span>
          </div>
        </div>

        <div className="myclasses-hero-art">
          <div className="myclasses-art-circle circle-one" />
          <div className="myclasses-art-circle circle-two" />
          <div className="myclasses-art-icon">
            <BookOpen size={70} strokeWidth={1.4} />
          </div>
        </div>
      </section>

      {/* Statistics */}
      <section className="myclasses-stats">
        <div className="myclasses-stat-card">
          <div className="myclasses-stat-icon purple">
            <School size={23} />
          </div>
          <div>
            <p>Assigned Classes</p>
            <h2>{classes.length}</h2>
            <small>Your teaching groups</small>
          </div>
        </div>

        <div className="myclasses-stat-card">
          <div className="myclasses-stat-icon blue">
            <Users size={23} />
          </div>
          <div>
            <p>Total Students</p>
            <h2>{totalStudents}</h2>
            <small>Across all classes</small>
          </div>
        </div>

        <div className="myclasses-stat-card">
          <div className="myclasses-stat-icon green">
            <BookOpen size={23} />
          </div>
          <div>
            <p>Subjects</p>
            <h2>
              {new Set(classes.flatMap((item) => item.subjects)).size}
            </h2>
            <small>Unique subjects</small>
          </div>
        </div>

        <div className="myclasses-stat-card">
          <div className="myclasses-stat-icon orange">
            <GraduationCap size={23} />
          </div>
          <div>
            <p>Grade Levels</p>
            <h2>{new Set(classes.map((item) => item.grade)).size}</h2>
            <small>Different grades</small>
          </div>
        </div>
      </section>

      {/* Class listing */}
      <section className="myclasses-content">
        <div className="myclasses-heading">
          <div>
            <h2>Assigned Classes</h2>
            <p>View and manage your classroom information.</p>
          </div>
          <span className="myclasses-count">
            {filteredClasses.length} Classes
          </span>
        </div>

        <div className="myclasses-toolbar">
          <div className="myclasses-search">
            <Search size={19} />
            <input
              type="text"
              placeholder="Search class, room or subject..."
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
            />
          </div>

          <div className="myclasses-filter">
            <Filter size={18} />
            <select
              value={gradeFilter}
              onChange={(event) => setGradeFilter(event.target.value)}
            >
              <option value="All">All Grade Levels</option>
              <option value="Grade 10">Grade 10</option>
              <option value="Grade 11">Grade 11</option>
            </select>
          </div>
        </div>

        <div className="myclasses-grid">
          {filteredClasses.map((item) => (
            <article
              className={`myclass-card ${item.color}`}
              key={item.id}
            >
              <div className="myclass-card-top">
                <div className="myclass-card-icon">
                  <BookOpen size={25} />
                </div>
                <span className="myclass-status">
                  <span /> Assigned
                </span>
              </div>

              <div className="myclass-title">
                <span>{item.grade} • Section {item.section}</span>
                <h3>{item.name}</h3>
                <p>{item.description}</p>
              </div>

              <div className="myclass-details">
                <div>
                  <Users size={17} />
                  <span>{item.students} Students</span>
                </div>
                <div>
                  <MapPin size={17} />
                  <span>{item.room}</span>
                </div>
                <div>
                  <Clock size={17} />
                  <span>{item.time}</span>
                </div>
                <div>
                  <CalendarDays size={17} />
                  <span>{item.schedule}</span>
                </div>
              </div>

              <div className="myclass-subjects">
                <strong>Subjects</strong>
                <div>
                  {item.subjects.map((subject) => (
                    <span key={subject}>{subject}</span>
                  ))}
                </div>
              </div>

              <button
                className="myclass-view-btn"
                onClick={() => setSelectedClass(item)}
              >
                View Class Details <ChevronRight size={18} />
              </button>
            </article>
          ))}

          {filteredClasses.length === 0 && (
            <div className="myclasses-empty">
              <Search size={35} />
              <h3>No classes found</h3>
              <p>Try another search term or grade filter.</p>
            </div>
          )}
        </div>
      </section>

      {/* Class details modal */}
      {selectedClass && (
        <div
          className="myclass-modal-overlay"
          onClick={() => setSelectedClass(null)}
        >
          <div
            className="myclass-modal"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="myclass-modal-header">
              <div>
                <span>CLASS INFORMATION</span>
                <h2>{selectedClass.name}</h2>
                <p>{selectedClass.grade} • Section {selectedClass.section}</p>
              </div>
              <button
                className="myclass-close-btn"
                onClick={() => setSelectedClass(null)}
                aria-label="Close class details"
              >
                <X size={21} />
              </button>
            </div>

            <div className="myclass-modal-info">
              <div>
                <MapPin size={18} />
                <span><strong>Room</strong>{selectedClass.room}</span>
              </div>
              <div>
                <Users size={18} />
                <span><strong>Total Students</strong>{selectedClass.students}</span>
              </div>
              <div>
                <Clock size={18} />
                <span><strong>Class Time</strong>{selectedClass.time}</span>
              </div>
            </div>

            <div className="myclass-modal-section">
              <h3>Assigned Subjects</h3>
              <div className="myclass-modal-subjects">
                {selectedClass.subjects.map((subject) => (
                  <span key={subject}><BookOpen size={15} /> {subject}</span>
                ))}
              </div>
            </div>

            <div className="myclass-modal-section">
              <div className="myclass-student-heading">
                <h3>Student List</h3>
                <span>{selectedClass.studentList.length} sample records</span>
              </div>

              <div className="myclass-student-list">
                {selectedClass.studentList.map((student) => (
                  <div className="myclass-student-row" key={student.id}>
                    <div className="myclass-student-avatar">
                      {student.name.charAt(0)}
                    </div>
                    <div className="myclass-student-details">
                      <strong>{student.name}</strong>
                      <small>{student.id} • {student.gender}</small>
                    </div>
                    <a
                      href={`mailto:${student.email}`}
                      title={`Email ${student.name}`}
                    >
                      <Mail size={17} />
                    </a>
                  </div>
                ))}
              </div>
            </div>

            <div className="myclass-modal-footer">
              <span>
                <UserRound size={16} /> Teacher view
              </span>
              <button onClick={() => setSelectedClass(null)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default MyClasses;