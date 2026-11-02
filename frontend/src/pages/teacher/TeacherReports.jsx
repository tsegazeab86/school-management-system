
import   { useMemo, useState } from "react";
import {
  Search,
  Download,
  Printer,
  Users,
  GraduationCap,
  CalendarCheck,
  TrendingUp,
  FileBarChart,
  Filter,
  BookOpen,
} from "lucide-react";

import "./TeacherReports.css";

const students = [
  { id: "ST001", name: "Abebe Kebede", className: "Grade 10A", subject: "Mathematics", score: 85, attendance: 95 },
  { id: "ST002", name: "Meron Tesfaye", className: "Grade 10A", subject: "Mathematics", score: 92, attendance: 98 },
  { id: "ST003", name: "Dawit Alemu", className: "Grade 10A", subject: "Mathematics", score: 67, attendance: 88 },
  { id: "ST004", name: "Hana Worku", className: "Grade 10B", subject: "Mathematics", score: 78, attendance: 91 },
  { id: "ST005", name: "Mekdes Tadesse", className: "Grade 10B", subject: "Mathematics", score: 88, attendance: 96 },
  { id: "ST006", name: "Samuel Bekele", className: "Grade 11A", subject: "Computer Science", score: 94, attendance: 97 },
  { id: "ST007", name: "Liya Getachew", className: "Grade 11A", subject: "Computer Science", score: 73, attendance: 89 },
  { id: "ST008", name: "Yonas Mulu", className: "Grade 11B", subject: "Computer Science", score: 58, attendance: 80 },
  { id: "ST009", name: "Selamawit Abebe", className: "Grade 11B", subject: "Computer Science", score: 82, attendance: 93 },
];

const classData = [
  { name: "Grade 10A", average: 81, attendance: 92 },
  { name: "Grade 10B", average: 83, attendance: 94 },
  { name: "Grade 11A", average: 84, attendance: 93 },
  { name: "Grade 11B", average: 70, attendance: 87 },
];

function TeacherReports() {
  const [search, setSearch] = useState("");
  const [classFilter, setClassFilter] = useState("All");
  const [subjectFilter, setSubjectFilter] = useState("All");

  const filteredStudents = useMemo(() => {
    return students.filter((student) => {
      const matchesSearch =
        student.name.toLowerCase().includes(search.toLowerCase()) ||
        student.id.toLowerCase().includes(search.toLowerCase());

      const matchesClass =
        classFilter === "All" || student.className === classFilter;

      const matchesSubject =
        subjectFilter === "All" || student.subject === subjectFilter;

      return matchesSearch && matchesClass && matchesSubject;
    });
  }, [search, classFilter, subjectFilter]);

  const averageScore = filteredStudents.length
    ? (
        filteredStudents.reduce((sum, s) => sum + s.score, 0) /
        filteredStudents.length
      ).toFixed(1)
    : "0";

  const averageAttendance = filteredStudents.length
    ? (
        filteredStudents.reduce((sum, s) => sum + s.attendance, 0) /
        filteredStudents.length
      ).toFixed(1)
    : "0";

  const excellentStudents = filteredStudents.filter(
    (s) => s.score >= 80
  ).length;

  const getGrade = (score) => {
    if (score >= 90) return "A";
    if (score >= 80) return "B";
    if (score >= 70) return "C";
    if (score >= 60) return "D";
    return "F";
  };

  const exportCSV = () => {
    const header = [
      "Student ID",
      "Student Name",
      "Class",
      "Subject",
      "Score",
      "Grade",
      "Attendance",
    ];

    const rows = filteredStudents.map((s) => [
      s.id,
      s.name,
      s.className,
      s.subject,
      s.score,
      getGrade(s.score),
      s.attendance + "%",
    ]);

    const csv = [header, ...rows]
      .map((row) =>
        row.map((value) =>
          `"${String(value).replace(/"/g, '""')}"`
        ).join(",")
      )
      .join("\n");

    const blob = new Blob([csv], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "teacher-student-reports.csv";
    link.click();

    URL.revokeObjectURL(url);
  };

  const printReport = () => {
    window.print();
  };

  const gradeDistribution = [
    { grade: "A", count: filteredStudents.filter(s => s.score >= 90).length },
    { grade: "B", count: filteredStudents.filter(s => s.score >= 80 && s.score < 90).length },
    { grade: "C", count: filteredStudents.filter(s => s.score >= 70 && s.score < 80).length },
    { grade: "D", count: filteredStudents.filter(s => s.score >= 60 && s.score < 70).length },
    { grade: "F", count: filteredStudents.filter(s => s.score < 60).length },
  ];

  const maxGradeCount = Math.max(
    1,
    ...gradeDistribution.map((item) => item.count)
  );

  return (
    <div className="teacher-reports">

      {/* Header */}
      <div className="tr-header">
        <div>
          <h1>Academic Reports</h1>
          <p>Monitor student performance and attendance.</p>
        </div>

        <div className="tr-header-actions">
          <button onClick={printReport} className="tr-print-btn">
            <Printer size={17} />
            Print
          </button>

          <button onClick={exportCSV} className="tr-export-btn">
            <Download size={17} />
            Export CSV
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="tr-filters">
        <div className="tr-search">
          <Search size={18} />
          <input
            placeholder="Search student name or ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="tr-filter-control">
          <Filter size={17} />

          <select
            value={classFilter}
            onChange={(e) => setClassFilter(e.target.value)}
          >
            <option value="All">All Classes</option>
            <option>Grade 10A</option>
            <option>Grade 10B</option>
            <option>Grade 11A</option>
            <option>Grade 11B</option>
          </select>
        </div>

        <select
          className="tr-subject-filter"
          value={subjectFilter}
          onChange={(e) => setSubjectFilter(e.target.value)}
        >
          <option value="All">All Subjects</option>
          <option>Mathematics</option>
          <option>Computer Science</option>
        </select>
      </div>

      {/* Statistics */}
      <div className="tr-stat-grid">
        <div className="tr-stat-card">
          <div className="tr-stat-icon purple">
            <Users size={22} />
          </div>
          <div>
            <span>Total Students</span>
            <h2>{filteredStudents.length}</h2>
            <small>Matching your filters</small>
          </div>
        </div>

        <div className="tr-stat-card">
          <div className="tr-stat-icon blue">
            <GraduationCap size={22} />
          </div>
          <div>
            <span>Average Score</span>
            <h2>{averageScore}%</h2>
            <small>Average academic performance</small>
          </div>
        </div>

        <div className="tr-stat-card">
          <div className="tr-stat-icon green">
            <CalendarCheck size={22} />
          </div>
          <div>
            <span>Average Attendance</span>
            <h2>{averageAttendance}%</h2>
            <small>Attendance rate</small>
          </div>
        </div>

        <div className="tr-stat-card">
          <div className="tr-stat-icon orange">
            <TrendingUp size={22} />
          </div>
          <div>
            <span>Students Scoring 80+</span>
            <h2>{excellentStudents}</h2>
            <small>Good academic performance</small>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="tr-chart-grid">

        <div className="tr-panel">
          <div className="tr-panel-heading">
            <div>
              <h2>Class Performance</h2>
              <p>Average score by class</p>
            </div>
            <BookOpen size={21} />
          </div>

          <div className="tr-class-bars">
            {classData.map((item) => {
              const visible = classFilter === "All" ||
                classFilter === item.name;

              if (!visible) return null;

              return (
                <div className="tr-bar-item" key={item.name}>
                  <div className="tr-bar-label">
                    <span>{item.name}</span>
                    <strong>{item.average}%</strong>
                  </div>

                  <div className="tr-bar-track">
                    <div
                      className="tr-bar-fill"
                      style={{ width: `${item.average}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="tr-panel">
          <div className="tr-panel-heading">
            <div>
              <h2>Grade Distribution</h2>
              <p>Student grades based on current filters</p>
            </div>
            <FileBarChart size={21} />
          </div>

          <div className="tr-grade-list">
            {gradeDistribution.map((item) => (
              <div className="tr-grade-row" key={item.grade}>
                <strong>{item.grade}</strong>

                <div className="tr-grade-track">
                  <div
                    className={`tr-grade-fill grade-${item.grade}`}
                    style={{
                      width: `${(item.count / maxGradeCount) * 100}%`,
                    }}
                  />
                </div>

                <span>{item.count}</span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Student Table */}
      <div className="tr-table-panel">
        <div className="tr-table-heading">
          <div>
            <h2>Student Performance Details</h2>
            <p>Academic results and attendance records.</p>
          </div>

          <span>{filteredStudents.length} Students</span>
        </div>

        <div className="tr-table-wrapper">
          <table className="tr-table">
            <thead>
              <tr>
                <th>Student ID</th>
                <th>Student Name</th>
                <th>Class</th>
                <th>Subject</th>
                <th>Score</th>
                <th>Grade</th>
                <th>Attendance</th>
              </tr>
            </thead>

            <tbody>
              {filteredStudents.map((student) => (
                <tr key={student.id}>
                  <td>{student.id}</td>
                  <td className="tr-student-name">{student.name}</td>
                  <td>{student.className}</td>
                  <td>{student.subject}</td>
                  <td>{student.score}%</td>
                  <td>
                    <span className={`tr-grade-badge grade-${getGrade(student.score)}`}>
                      {getGrade(student.score)}
                    </span>
                  </td>
                  <td>
                    <div className="tr-attendance">
                      <span>{student.attendance}%</span>
                      <div>
                        <div
                          style={{ width: `${student.attendance}%` }}
                        />
                      </div>
                    </div>
                  </td>
                </tr>
              ))}

              {filteredStudents.length === 0 && (
                <tr>
                  <td colSpan="7" className="tr-no-results">
                    No student records found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}

export default TeacherReports;
