
import   { useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  GraduationCap,
  Award,
  TrendingUp,
  BookOpen,
  Search,
  Download,
  Trophy,
  CheckCircle2,
  CalendarDays,
  ChevronDown,
  Target,
} from "lucide-react";

import "./StudentResults.css";

const results = [
  { id: 1, subject: "Mathematics", code: "MATH101", quiz: 17, assignment: 18, midterm: 25, final: 28, semester: "Semester 1" },
  { id: 2, subject: "English", code: "ENG101", quiz: 18, assignment: 17, midterm: 22, final: 25, semester: "Semester 1" },
  { id: 3, subject: "Database Management", code: "DB101", quiz: 19, assignment: 18, midterm: 24, final: 27, semester: "Semester 1" },
  { id: 4, subject: "Java Programming", code: "JAVA101", quiz: 18, assignment: 19, midterm: 23, final: 28, semester: "Semester 1" },
  { id: 5, subject: "Computer Networks", code: "NET101", quiz: 16, assignment: 18, midterm: 22, final: 25, semester: "Semester 1" },
  { id: 6, subject: "Mathematics", code: "MATH101", quiz: 16, assignment: 17, midterm: 22, final: 24, semester: "Semester 2" },
  { id: 7, subject: "English", code: "ENG101", quiz: 18, assignment: 18, midterm: 24, final: 26, semester: "Semester 2" },
  { id: 8, subject: "Database Management", code: "DB101", quiz: 19, assignment: 19, midterm: 25, final: 29, semester: "Semester 2" },
];

const getGrade = (total) => {
  if (total >= 90) return "A+";
  if (total >= 85) return "A";
  if (total >= 80) return "A-";
  if (total >= 75) return "B+";
  if (total >= 70) return "B";
  if (total >= 65) return "B-";
  if (total >= 60) return "C+";
  if (total >= 50) return "C";
  return "F";
};

const getRemark = (total) => {
  if (total >= 90) return "Excellent";
  if (total >= 80) return "Very Good";
  if (total >= 70) return "Good";
  if (total >= 50) return "Pass";
  return "Needs Improvement";
};

function StudentResults() {
  const [search, setSearch] = useState("");
  const [semester, setSemester] = useState("All");

  const filteredResults = useMemo(() => {
    return results.filter((item) => {
      const matchesSearch =
        item.subject.toLowerCase().includes(search.toLowerCase()) ||
        item.code.toLowerCase().includes(search.toLowerCase());

      const matchesSemester =
        semester === "All" || item.semester === semester;

      return matchesSearch && matchesSemester;
    });
  }, [search, semester]);

  const totals = filteredResults.map(
    (item) => item.quiz + item.assignment + item.midterm + item.final
  );

  const average = totals.length
    ? totals.reduce((sum, value) => sum + value, 0) / totals.length
    : 0;

  const gradeCounts = [
    { grade: "A", count: filteredResults.filter((item) => getGrade(item.quiz + item.assignment + item.midterm + item.final).startsWith("A")).length },
    { grade: "B", count: filteredResults.filter((item) => getGrade(item.quiz + item.assignment + item.midterm + item.final).startsWith("B")).length },
    { grade: "C", count: filteredResults.filter((item) => getGrade(item.quiz + item.assignment + item.midterm + item.final).startsWith("C")).length },
    { grade: "F", count: filteredResults.filter((item) => getGrade(item.quiz + item.assignment + item.midterm + item.final) === "F").length },
  ];

  const exportCSV = () => {
    const headers = [
      "Subject", "Code", "Quiz", "Assignment",
      "Midterm", "Final", "Total", "Grade", "Semester",
    ];

    const rows = filteredResults.map((item) => {
      const total = item.quiz + item.assignment + item.midterm + item.final;

      return [
        item.subject,
        item.code,
        item.quiz,
        item.assignment,
        item.midterm,
        item.final,
        total,
        getGrade(total),
        item.semester,
      ];
    });

    const csv = [headers, ...rows]
      .map((row) => row.map((value) => `"${value}"`).join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "student-exam-results.csv";
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <motion.div
      className="student-results-page"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Page Header */}
      <header className="results-header">
        <div>
          <span className="results-eyebrow">STUDENT PORTAL / ACADEMICS</span>
          <h1>Exams & Results</h1>
          <p>Review your exam scores and academic performance.</p>
        </div>

        <button className="results-export-btn" onClick={exportCSV}>
          <Download size={18} />
          Export Results
        </button>
      </header>

      {/* Hero */}
      <motion.section
        className="results-hero"
        whileHover={{ scale: 1.005 }}
      >
        <div className="results-hero-content">
          <span>ACADEMIC PERFORMANCE</span>
          <h2>Your Progress, Your Achievement.</h2>
          <p>
            Every result represents your effort. Keep learning and
            continue improving your academic performance.
          </p>

          <div className="results-student">
            <div className="results-avatar">S</div>
            <div>
              <strong>Alex Johnson</strong>
              <small>STU-2026-001 · Grade 10A</small>
            </div>
          </div>
        </div>

        <div className="results-trophy">
          <Trophy size={90} strokeWidth={1.3} />
          <div className="trophy-star">✦</div>
        </div>
      </motion.section>

      {/* Statistics */}
      <div className="results-stats">
        <motion.div className="result-stat purple" whileHover={{ y: -7 }}>
          <div className="result-stat-icon"><Award size={23} /></div>
          <h2>{average.toFixed(1)}%</h2>
          <h4>Average Score</h4>
          <p>Based on filtered results</p>
        </motion.div>

        <motion.div className="result-stat blue" whileHover={{ y: -7 }}>
          <div className="result-stat-icon"><BookOpen size={23} /></div>
          <h2>{filteredResults.length}</h2>
          <h4>Subject Results</h4>
          <p>Subjects in this selection</p>
        </motion.div>

        <motion.div className="result-stat green" whileHover={{ y: -7 }}>
          <div className="result-stat-icon"><CheckCircle2 size={23} /></div>
          <h2>{totals.filter((value) => value >= 50).length}</h2>
          <h4>Passed Subjects</h4>
          <p>Based on sample pass mark</p>
        </motion.div>

        <motion.div className="result-stat orange" whileHover={{ y: -7 }}>
          <div className="result-stat-icon"><TrendingUp size={23} /></div>
          <h2>{totals.length ? Math.max(...totals) : 0}</h2>
          <h4>Highest Score</h4>
          <p>Best subject result</p>
        </motion.div>
      </div>

      {/* Performance Overview */}
      <div className="results-overview-grid">
        <section className="results-panel performance-panel">
          <div className="results-panel-title">
            <div>
              <h2>Performance Overview</h2>
              <p>Your average academic score</p>
            </div>
            <TrendingUp size={22} />
          </div>

          <div className="performance-score">
            <div className="performance-ring">
              <div>
                <strong>{average.toFixed(1)}%</strong>
                <span>Average</span>
              </div>
            </div>

            <div className="performance-description">
              <span className="performance-tag">
                <Target size={14} />
                {average >= 80 ? "Strong Performance" : average >= 50 ? "Good Progress" : "Keep Practicing"}
              </span>
              <h3>{average >= 80 ? "Great work!" : "Keep improving!"}</h3>
              <p>
                Continue studying regularly and reviewing your
                learning materials to improve your results.
              </p>
            </div>
          </div>
        </section>

        <section className="results-panel grade-panel">
          <div className="results-panel-title">
            <div>
              <h2>Grade Distribution</h2>
              <p>Grades in the selected results</p>
            </div>
            <GraduationCap size={23} />
          </div>

          <div className="grade-distribution">
            {gradeCounts.map((item, index) => {
              const colors = ["#7c3aed", "#2563eb", "#0891b2", "#ef4444"];
              const percentage = filteredResults.length
                ? (item.count / filteredResults.length) * 100
                : 0;

              return (
                <div className="grade-row" key={item.grade}>
                  <strong>{item.grade}</strong>
                  <div className="grade-track">
                    <motion.div
                      className="grade-fill"
                      style={{ background: colors[index] }}
                      initial={{ width: 0 }}
                      animate={{ width: `${percentage}%` }}
                      transition={{ duration: 0.8 }}
                    />
                  </div>
                  <span>{item.count}</span>
                </div>
              );
            })}
          </div>
        </section>
      </div>

      {/* Results Table */}
      <section className="results-panel results-table-panel">
        <div className="results-panel-title">
          <div>
            <h2>Examination Results</h2>
            <p>Detailed marks for each subject</p>
          </div>
          <CalendarDays size={22} />
        </div>

        <div className="results-filters">
          <div className="results-search">
            <Search size={18} />
            <input
              type="text"
              placeholder="Search subject or code..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="results-semester-filter">
            <select
              value={semester}
              onChange={(e) => setSemester(e.target.value)}
            >
              <option value="All">All Semesters</option>
              <option value="Semester 1">Semester 1</option>
              <option value="Semester 2">Semester 2</option>
            </select>
            <ChevronDown size={16} />
          </div>
        </div>

        <div className="results-table-wrapper">
          <table className="results-table">
            <thead>
              <tr>
                <th>Subject</th>
                <th>Quiz /20</th>
                <th>Assignment /20</th>
                <th>Midterm /30</th>
                <th>Final /30</th>
                <th>Total /100</th>
                <th>Grade</th>
                <th>Remark</th>
              </tr>
            </thead>

            <tbody>
              {filteredResults.length ? (
                filteredResults.map((item) => {
                  const total =
                    item.quiz + item.assignment + item.midterm + item.final;

                  const grade = getGrade(total);

                  return (
                    <motion.tr
                      key={item.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                    >
                      <td>
                        <strong className="result-subject">{item.subject}</strong>
                        <small className="result-code">{item.code}</small>
                      </td>
                      <td>{item.quiz}</td>
                      <td>{item.assignment}</td>
                      <td>{item.midterm}</td>
                      <td>{item.final}</td>
                      <td><strong className="result-total">{total}</strong></td>
                      <td><span className={`result-grade grade-${grade.replace("+", "plus").replace("-", "minus")}`}>{grade}</span></td>
                      <td>{getRemark(total)}</td>
                    </motion.tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="8" className="results-empty">
                    No examination results found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="results-table-footer">
          <span>Showing {filteredResults.length} subject results</span>
          <span>Student ID: STU-2026-001</span>
        </div>
      </section>

      {/* Notice */}
      <div className="results-notice">
        <Award size={20} />
        <p>
          These results are read-only. If you believe a mark is incorrect,
          contact your teacher or school administrator.
        </p>
      </div>

      <footer className="results-footer">
        © 2026 EduManage School Management System
      </footer>
    </motion.div>
  );
}

export default StudentResults;
