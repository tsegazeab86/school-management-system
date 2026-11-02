import   { useMemo, useState } from "react";
import {
  Award,
  BookOpen,
  Download,
  Search,
  Users,
  TrendingUp,
  BarChart3,
  Filter,
  Save,
  GraduationCap,
  ClipboardList,
} from "lucide-react";
import "./Grades.css";

const initialStudents = [
  { id: "STU001", name: "Abebe Kebede", className: "Grade 10A", quiz: 8, assignment: 9, midterm: 25, final: 42 },
  { id: "STU002", name: "Mekdes Alemu", className: "Grade 10A", quiz: 9, assignment: 10, midterm: 28, final: 46 },
  { id: "STU003", name: "Dawit Tesfaye", className: "Grade 10A", quiz: 6, assignment: 7, midterm: 20, final: 35 },
  { id: "STU004", name: "Hana Bekele", className: "Grade 10A", quiz: 10, assignment: 9, midterm: 27, final: 45 },
  { id: "STU005", name: "Samuel Girma", className: "Grade 10A", quiz: 5, assignment: 6, midterm: 16, final: 28 },
  { id: "STU006", name: "Rahel Worku", className: "Grade 10A", quiz: 8, assignment: 8, midterm: 23, final: 39 },
  { id: "STU007", name: "Yonas Tadesse", className: "Grade 10B", quiz: 7, assignment: 8, midterm: 22, final: 38 },
  { id: "STU008", name: "Selamawit Desta", className: "Grade 10B", quiz: 9, assignment: 9, midterm: 26, final: 44 },
  { id: "STU009", name: "Bereket Mulu", className: "Grade 10B", quiz: 6, assignment: 7, midterm: 18, final: 32 },
];

const getTotal = (student) =>
  Number(student.quiz) +
  Number(student.assignment) +
  Number(student.midterm) +
  Number(student.final);

const getGrade = (total) => {
  if (total >= 90) return "A+";
  if (total >= 85) return "A";
  if (total >= 75) return "B";
  if (total >= 65) return "C";
  if (total >= 50) return "D";
  return "F";
};

const getRemark = (total) => {
  if (total >= 90) return "Excellent";
  if (total >= 75) return "Very Good";
  if (total >= 65) return "Good";
  if (total >= 50) return "Pass";
  return "Needs Improvement";
};

function TeacherGrades() {
  const [students, setStudents] = useState(initialStudents);
  const [selectedClass, setSelectedClass] = useState("Grade 10A");
  const [selectedSubject, setSelectedSubject] = useState("Mathematics");
  const [searchTerm, setSearchTerm] = useState("");
  const [gradeFilter, setGradeFilter] = useState("All");
  const [message, setMessage] = useState("");

  const classStudents = useMemo(() => {
    return students.filter((student) => {
      const matchesClass = student.className === selectedClass;
      const matchesSearch =
        student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.id.toLowerCase().includes(searchTerm.toLowerCase());
      const total = getTotal(student);
      const matchesGrade =
        gradeFilter === "All" || getGrade(total) === gradeFilter;

      return matchesClass && matchesSearch && matchesGrade;
    });
  }, [students, selectedClass, searchTerm, gradeFilter]);

  const allClassStudents = students.filter(
    (student) => student.className === selectedClass
  );

  const average = allClassStudents.length
    ? allClassStudents.reduce((sum, student) => sum + getTotal(student), 0) /
      allClassStudents.length
    : 0;

  const passed = allClassStudents.filter(
    (student) => getTotal(student) >= 50
  ).length;

  const updateMark = (studentId, field, value) => {
    const limits = {
      quiz: 10,
      assignment: 10,
      midterm: 30,
      final: 50,
    };

    if (value !== "" && (Number(value) < 0 || Number(value) > limits[field])) {
      return;
    }

    setStudents((previous) =>
      previous.map((student) =>
        student.id === studentId
          ? { ...student, [field]: value === "" ? "" : Number(value) }
          : student
      )
    );
    setMessage("");
  };

  const handleSave = () => {
    setMessage("Grades updated in this session successfully.");
    setTimeout(() => setMessage(""), 3000);
  };

  const exportCSV = () => {
    const headers = [
      "Student ID",
      "Student Name",
      "Class",
      "Quiz /10",
      "Assignment /10",
      "Midterm /30",
      "Final /50",
      "Total /100",
      "Grade",
      "Remark",
    ];

    const rows = classStudents.map((student) => {
      const total = getTotal(student);
      return [
        student.id,
        student.name,
        student.className,
        student.quiz,
        student.assignment,
        student.midterm,
        student.final,
        total,
        getGrade(total),
        getRemark(total),
      ];
    });

    const csv = [headers, ...rows]
      .map((row) =>
        row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")
      )
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${selectedClass}-${selectedSubject}-grades.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="grades-page">
      <div className="grades-hero">
        <div className="grades-hero-content">
          <span className="grades-eyebrow">
            <GraduationCap size={16} /> TEACHER PORTAL
          </span>
          <h1>Grades Management</h1>
          <p>
            Manage student marks, monitor academic performance, and review
            class results in one place.
          </p>
          <div className="grades-hero-details">
            <span><BookOpen size={16} /> {selectedSubject}</span>
            <span><Users size={16} /> {selectedClass}</span>
          </div>
        </div>
        <div className="grades-hero-icon">
          <Award size={76} strokeWidth={1.3} />
        </div>
      </div>

      <div className="grades-stat-grid">
        <div className="grades-stat-card">
          <div className="grades-stat-icon purple"><Users size={22} /></div>
          <div>
            <p>Total Students</p>
            <h2>{allClassStudents.length}</h2>
            <small>Selected class</small>
          </div>
        </div>

        <div className="grades-stat-card">
          <div className="grades-stat-icon blue"><TrendingUp size={22} /></div>
          <div>
            <p>Class Average</p>
            <h2>{average.toFixed(1)}%</h2>
            <small>Out of 100 marks</small>
          </div>
        </div>

        <div className="grades-stat-card">
          <div className="grades-stat-icon green"><Award size={22} /></div>
          <div>
            <p>Passed Students</p>
            <h2>{passed}</h2>
            <small>{allClassStudents.length ? ((passed / allClassStudents.length) * 100).toFixed(0) : 0}% pass rate</small>
          </div>
        </div>

        <div className="grades-stat-card">
          <div className="grades-stat-icon orange"><BarChart3 size={22} /></div>
          <div>
            <p>Failed Students</p>
            <h2>{allClassStudents.length - passed}</h2>
            <small>Below 50 marks</small>
          </div>
        </div>
      </div>

      <div className="grades-panel">
        <div className="grades-panel-heading">
          <div>
            <h2><ClipboardList size={21} /> Student Results</h2>
            <p>Enter marks for each assessment component.</p>
          </div>
          <button className="grades-export-btn" onClick={exportCSV}>
            <Download size={17} /> Export CSV
          </button>
        </div>

        <div className="grades-controls">
          <div className="grades-select-group">
            <label>Select Class</label>
            <select
              value={selectedClass}
              onChange={(event) => setSelectedClass(event.target.value)}
            >
              <option>Grade 10A</option>
              <option>Grade 10B</option>
            </select>
          </div>

          <div className="grades-select-group">
            <label>Select Subject</label>
            <select
              value={selectedSubject}
              onChange={(event) => setSelectedSubject(event.target.value)}
            >
              <option>Mathematics</option>
              <option>English</option>
              <option>Physics</option>
              <option>Biology</option>
              <option>Computer Science</option>
            </select>
          </div>

          <div className="grades-search">
            <Search size={18} />
            <input
              type="text"
              placeholder="Search student..."
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
            />
          </div>

          <div className="grades-filter">
            <Filter size={17} />
            <select
              value={gradeFilter}
              onChange={(event) => setGradeFilter(event.target.value)}
            >
              <option value="All">All Grades</option>
              <option value="A+">A+</option>
              <option value="A">A</option>
              <option value="B">B</option>
              <option value="C">C</option>
              <option value="D">D</option>
              <option value="F">F</option>
            </select>
          </div>
        </div>

        <div className="grades-mark-guide">
          <strong>Assessment limits:</strong>
          <span>Quiz: 10</span>
          <span>Assignment: 10</span>
          <span>Midterm: 30</span>
          <span>Final: 50</span>
          <span className="grades-total-guide">Total: 100</span>
        </div>

        <div className="grades-table-wrapper">
          <table className="grades-table">
            <thead>
              <tr>
                <th>Student</th>
                <th>Quiz<br /><small>/10</small></th>
                <th>Assignment<br /><small>/10</small></th>
                <th>Midterm<br /><small>/30</small></th>
                <th>Final<br /><small>/50</small></th>
                <th>Total<br /><small>/100</small></th>
                <th>Grade</th>
                <th>Remark</th>
              </tr>
            </thead>
            <tbody>
              {classStudents.map((student) => {
                const total = getTotal(student);
                const grade = getGrade(total);

                return (
                  <tr key={student.id}>
                    <td>
                      <div className="grades-student-cell">
                        <div className="grades-avatar">
                          {student.name.charAt(0)}
                        </div>
                        <div>
                          <strong>{student.name}</strong>
                          <small>{student.id}</small>
                        </div>
                      </div>
                    </td>

                    {["quiz", "assignment", "midterm", "final"].map((field) => (
                      <td key={field}>
                        <input
                          className="grades-mark-input"
                          type="number"
                          min="0"
                          max={
                            field === "quiz" || field === "assignment"
                              ? 10
                              : field === "midterm"
                              ? 30
                              : 50
                          }
                          value={student[field]}
                          onChange={(event) =>
                            updateMark(student.id, field, event.target.value)
                          }
                        />
                      </td>
                    ))}

                    <td>
                      <strong className="grades-total">{total}</strong>
                    </td>
                    <td>
                      <span className={`grades-letter grade-${grade.replace("+", "plus")}`}>
                        {grade}
                      </span>
                    </td>
                    <td>
                      <span className="grades-remark">{getRemark(total)}</span>
                    </td>
                  </tr>
                );
              })}

              {classStudents.length === 0 && (
                <tr>
                  <td colSpan="8" className="grades-empty">
                    No students found. Try changing your search or filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="grades-table-footer">
          <span>Showing {classStudents.length} of {allClassStudents.length} students</span>
          <button className="grades-save-btn" onClick={handleSave}>
            <Save size={17} /> Save Grades
          </button>
        </div>

        {message && <div className="grades-success-message">{message}</div>}
      </div>

      <div className="grades-note">
        <div className="grades-note-icon"><Award size={22} /></div>
        <div>
          <strong>Grading information</strong>
          <p>
            A+ = 90–100, A = 85–89, B = 75–84, C = 65–74,
            D = 50–64, F = below 50. These are sample grading rules and
            can be adjusted to match your school's policy.
          </p>
        </div>
      </div>
    </div>
  );
}

export default TeacherGrades;