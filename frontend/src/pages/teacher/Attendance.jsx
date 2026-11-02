
import  { useMemo, useState } from "react";
import {
  CalendarDays,
  Search,
  Users,
  CheckCircle2,
  XCircle,
  Clock,
  FileDown,
  Save,
  Filter,
  ClipboardCheck,
} from "lucide-react";
import "./Attendance.css";

const initialStudents = [
  { id: "STU001", name: "Abebe Kebede", gender: "Male" },
  { id: "STU002", name: "Mekdes Alemu", gender: "Female" },
  { id: "STU003", name: "Dawit Tesfaye", gender: "Male" },
  { id: "STU004", name: "Hana Getachew", gender: "Female" },
  { id: "STU005", name: "Samuel Bekele", gender: "Male" },
  { id: "STU006", name: "Rahel Worku", gender: "Female" },
  { id: "STU007", name: "Yohannes Tadesse", gender: "Male" },
  { id: "STU008", name: "Martha Girma", gender: "Female" },
  { id: "STU009", name: "Bereket Solomon", gender: "Male" },
  { id: "STU010", name: "Selamawit Fikru", gender: "Female" },
];

const classes = [
  { value: "Grade 10A", subject: "Mathematics" },
  { value: "Grade 10B", subject: "Mathematics" },
  { value: "Grade 11A", subject: "Computer Science" },
  { value: "Grade 11B", subject: "Computer Science" },
];

const statusOptions = ["Present", "Absent", "Late", "Excused"];

function getToday() {
  const date = new Date();
  const offset = date.getTimezoneOffset();
  return new Date(date.getTime() - offset * 60000).toISOString().slice(0, 10);
}

function TeacherAttendance() {
  const [selectedClass, setSelectedClass] = useState("Grade 10A");
  const [attendanceDate, setAttendanceDate] = useState(getToday());
  const [search, setSearch] = useState("");
  const [attendance, setAttendance] = useState(() =>
    Object.fromEntries(initialStudents.map((student) => [student.id, "Present"]))
  );
  const [saved, setSaved] = useState(false);

  const selectedSubject =
    classes.find((item) => item.value === selectedClass)?.subject || "";

  const filteredStudents = useMemo(() => {
    return initialStudents.filter((student) =>
      `${student.id} ${student.name}`
        .toLowerCase()
        .includes(search.toLowerCase())
    );
  }, [search]);

  const counts = useMemo(() => {
    return statusOptions.reduce(
      (result, status) => {
        result[status] = Object.values(attendance).filter(
          (value) => value === status
        ).length;
        return result;
      },
      {}
    );
  }, [attendance]);

  const updateStatus = (studentId, status) => {
    setAttendance((previous) => ({
      ...previous,
      [studentId]: status,
    }));
    setSaved(false);
  };

  const markAll = (status) => {
    setAttendance((previous) => {
      const updated = { ...previous };
      initialStudents.forEach((student) => {
        updated[student.id] = status;
      });
      return updated;
    });
    setSaved(false);
  };

  const saveAttendance = () => {
    const record = {
      className: selectedClass,
      subject: selectedSubject,
      date: attendanceDate,
      students: initialStudents.map((student) => ({
        ...student,
        status: attendance[student.id],
      })),
    };

    // Temporary demo save. Later, send this record to the backend API.
    console.log("Attendance record:", record);
    setSaved(true);
  };

  const exportCSV = () => {
    const rows = [
      ["Student ID", "Student Name", "Gender", "Class", "Subject", "Date", "Status"],
      ...initialStudents.map((student) => [
        student.id,
        student.name,
        student.gender,
        selectedClass,
        selectedSubject,
        attendanceDate,
        attendance[student.id],
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
    link.download = `attendance-${selectedClass.replace(/\s/g, "-")}-${attendanceDate}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const statusClass = (status) => status.toLowerCase();

  return (
    <div className="attendance-page">
      <div className="attendance-header">
        <div>
          <span className="attendance-eyebrow">TEACHER PORTAL</span>
          <h1>Attendance Management</h1>
          <p>Record, monitor, and manage your students' daily attendance.</p>
        </div>
        <div className="attendance-header-icon">
          <ClipboardCheck size={30} />
        </div>
      </div>

      <section className="attendance-filters">
        <div className="attendance-filter-group">
          <label htmlFor="attendance-class">Select Class</label>
          <select
            id="attendance-class"
            value={selectedClass}
            onChange={(event) => {
              setSelectedClass(event.target.value);
              setSaved(false);
            }}
          >
            {classes.map((item) => (
              <option key={item.value} value={item.value}>
                {item.value}
              </option>
            ))}
          </select>
        </div>

        <div className="attendance-filter-group">
          <label htmlFor="attendance-subject">Subject</label>
          <input id="attendance-subject" value={selectedSubject} readOnly />
        </div>

        <div className="attendance-filter-group">
          <label htmlFor="attendance-date">Attendance Date</label>
          <div className="attendance-date-input">
            <CalendarDays size={17} />
            <input
              id="attendance-date"
              type="date"
              value={attendanceDate}
              onChange={(event) => {
                setAttendanceDate(event.target.value);
                setSaved(false);
              }}
            />
          </div>
        </div>
      </section>

      <section className="attendance-stats">
        <div className="attendance-stat-card">
          <span className="attendance-stat-icon total"><Users size={21} /></span>
          <div><h2>{initialStudents.length}</h2><p>Total Students</p></div>
        </div>
        <div className="attendance-stat-card">
          <span className="attendance-stat-icon present"><CheckCircle2 size={21} /></span>
          <div><h2>{counts.Present}</h2><p>Present</p></div>
        </div>
        <div className="attendance-stat-card">
          <span className="attendance-stat-icon absent"><XCircle size={21} /></span>
          <div><h2>{counts.Absent}</h2><p>Absent</p></div>
        </div>
        <div className="attendance-stat-card">
          <span className="attendance-stat-icon late"><Clock size={21} /></span>
          <div><h2>{counts.Late}</h2><p>Late</p></div>
        </div>
        <div className="attendance-stat-card">
          <span className="attendance-stat-icon excused"><ClipboardCheck size={21} /></span>
          <div><h2>{counts.Excused}</h2><p>Excused</p></div>
        </div>
      </section>

      <section className="attendance-record-panel">
        <div className="attendance-record-heading">
          <div>
            <h2>Student Attendance List</h2>
            <p>{selectedClass} · {selectedSubject} · {attendanceDate}</p>
          </div>
          <button className="attendance-export-btn" onClick={exportCSV}>
            <FileDown size={17} /> Export CSV
          </button>
        </div>

        <div className="attendance-toolbar">
          <label className="attendance-search">
            <Search size={18} />
            <input
              type="search"
              placeholder="Search student name or ID..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </label>

          <div className="attendance-bulk-actions">
            <span><Filter size={15} /> Mark all:</span>
            <button onClick={() => markAll("Present")}>Present</button>
            <button onClick={() => markAll("Absent")}>Absent</button>
          </div>
        </div>

        <div className="attendance-table-wrap">
          <table className="attendance-table">
            <thead>
              <tr>
                <th>NO.</th>
                <th>STUDENT ID</th>
                <th>STUDENT NAME</th>
                <th>GENDER</th>
                <th>ATTENDANCE STATUS</th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.map((student, index) => (
                <tr key={student.id}>
                  <td>{index + 1}</td>
                  <td className="attendance-student-id">{student.id}</td>
                  <td className="attendance-student-name">{student.name}</td>
                  <td>{student.gender}</td>
                  <td>
                    <div className="attendance-status-buttons">
                      {statusOptions.map((status) => (
                        <button
                          key={status}
                          className={`attendance-status-btn ${statusClass(status)} ${
                            attendance[student.id] === status ? "selected" : ""
                          }`}
                          onClick={() => updateStatus(student.id, status)}
                          aria-pressed={attendance[student.id] === status}
                        >
                          {status}
                        </button>
                      ))}
                    </div>
                  </td>
                </tr>
              ))}
              {filteredStudents.length === 0 && (
                <tr>
                  <td colSpan="5" className="attendance-no-results">
                    No students found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="attendance-table-footer">
          <span>Showing {filteredStudents.length} of {initialStudents.length} students</span>
          <span>{counts.Present} present · {counts.Absent} absent · {counts.Late} late</span>
        </div>

        <div className="attendance-save-area">
          {saved && (
            <span className="attendance-saved-message">
              <CheckCircle2 size={17} /> Demo attendance record prepared successfully.
            </span>
          )}
          <button className="attendance-save-btn" onClick={saveAttendance}>
            <Save size={18} /> Save Attendance
          </button>
        </div>
      </section>
    </div>
  );
}

export default TeacherAttendance;
