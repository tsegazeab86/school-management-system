
import { useMemo, useState } from "react";
import {
  Search, GraduationCap, Users, ArrowRight,
  CheckCircle2, CalendarDays, Filter, X,
  AlertCircle, History
} from "lucide-react";
import "../../styles/registrar/StudentPromotion.css";

const initialStudents = [
  { id: "STU001", name: "Abebe Kebede", grade: "Grade 8", section: "A", average: 82, status: "Eligible" },
  { id: "STU002", name: "Martha Tadesse", grade: "Grade 8", section: "A", average: 91, status: "Eligible" },
  { id: "STU003", name: "Dawit Getachew", grade: "Grade 8", section: "B", average: 48, status: "Review Required" },
  { id: "STU004", name: "Selamawit Alemu", grade: "Grade 8", section: "B", average: 76, status: "Eligible" },
  { id: "STU005", name: "Bereket Tesfaye", grade: "Grade 9", section: "A", average: 85, status: "Eligible" },
  { id: "STU006", name: "Hana Worku", grade: "Grade 9", section: "A", average: 54, status: "Review Required" },
];

const gradeNumber = (grade) => Number(grade.replace("Grade ", ""));

function StudentPromotion() {
  const [students, setStudents] = useState(initialStudents);
  const [search, setSearch] = useState("");
  const [sourceGrade, setSourceGrade] = useState("Grade 8");
  const [targetGrade, setTargetGrade] = useState("Grade 9");
  const [targetYear, setTargetYear] = useState("2027/2028");
  const [selectedIds, setSelectedIds] = useState([]);
  const [showConfirm, setShowConfirm] = useState(false);
  const [history, setHistory] = useState([]);
  const [message, setMessage] = useState("");

  const availableStudents = useMemo(() => {
    return students.filter((student) => {
      const matchesGrade = student.grade === sourceGrade;
      const matchesSearch =
        student.name.toLowerCase().includes(search.toLowerCase()) ||
        student.id.toLowerCase().includes(search.toLowerCase());

      return matchesGrade && matchesSearch;
    });
  }, [students, sourceGrade, search]);

//   const selectedStudents = students.filter((student) =>
//     selectedIds.includes(student.id)
//   );

  const eligibleCount = availableStudents.filter(
    (student) => student.status === "Eligible"
  ).length;

  const toggleStudent = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id)
        ? prev.filter((studentId) => studentId !== id)
        : [...prev, id]
    );
    setMessage("");
  };

  const toggleSelectAll = () => {
    const eligibleIds = availableStudents
      .filter((student) => student.status === "Eligible")
      .map((student) => student.id);

    const allSelected = eligibleIds.every((id) =>
      selectedIds.includes(id)
    );

    setSelectedIds((prev) =>
      allSelected
        ? prev.filter((id) => !eligibleIds.includes(id))
        : [...new Set([...prev, ...eligibleIds])]
    );

    setMessage("");
  };

  const handleGradeChange = (value) => {
    setSourceGrade(value);
    setSelectedIds([]);
    setTargetGrade(
      gradeNumber(value) < 12
        ? `Grade ${gradeNumber(value) + 1}`
        : "Graduated"
    );
    setMessage("");
  };

  const handlePromotion = () => {
    if (selectedIds.length === 0) {
      setMessage("Please select at least one eligible student.");
      return;
    }

    if (sourceGrade === "Grade 12") {
      setMessage("Grade 12 students should be processed through graduation.");
      return;
    }

    setShowConfirm(true);
  };

  const confirmPromotion = () => {
    const promoted = students.filter((student) =>
      selectedIds.includes(student.id) &&
      student.status === "Eligible"
    );

    if (promoted.length === 0) {
      setMessage("No eligible students selected.");
      setShowConfirm(false);
      return;
    }

    setStudents((prev) =>
      prev.map((student) =>
        selectedIds.includes(student.id) &&
        student.status === "Eligible"
          ? { ...student, grade: targetGrade }
          : student
      )
    );

    setHistory((prev) => [
      {
        id: Date.now(),
        count: promoted.length,
        from: sourceGrade,
        to: targetGrade,
        year: targetYear,
        date: new Date().toLocaleDateString(),
      },
      ...prev,
    ]);

    setSelectedIds([]);
    setShowConfirm(false);
    setMessage(`${promoted.length} student(s) promoted successfully.`);
  };

  return (
    <div className="promotion-page">

      <div className="promotion-heading">
        <div>
          <h2>Student Promotion</h2>
          <p>Review student performance and promote eligible students.</p>
        </div>
        <div className="promotion-year-label">
          <CalendarDays size={17} />
          Academic Year {targetYear}
        </div>
      </div>

      <div className="promotion-stats">
        <div className="promotion-stat-card">
          <span className="promotion-stat-icon purple"><Users /></span>
          <div>
            <small>Students in Selected Grade</small>
            <h3>{availableStudents.length}</h3>
          </div>
        </div>

        <div className="promotion-stat-card">
          <span className="promotion-stat-icon green"><CheckCircle2 /></span>
          <div>
            <small>Eligible Students</small>
            <h3>{eligibleCount}</h3>
          </div>
        </div>

        <div className="promotion-stat-card">
          <span className="promotion-stat-icon orange"><AlertCircle /></span>
          <div>
            <small>Selected for Promotion</small>
            <h3>{selectedIds.length}</h3>
          </div>
        </div>
      </div>

      <div className="promotion-setup-card">
        <div className="promotion-section-title">
          <div>
            <h3>Promotion Setup</h3>
            <p>Choose the source grade and destination academic year.</p>
          </div>
          <GraduationCap size={25} />
        </div>

        <div className="promotion-setup-grid">
          <label>
            Current Grade
            <select
              value={sourceGrade}
              onChange={(e) => handleGradeChange(e.target.value)}
            >
              {Array.from({ length: 12 }, (_, i) => (
                <option key={i + 1}>Grade {i + 1}</option>
              ))}
            </select>
          </label>

          <div className="promotion-arrow">
            <ArrowRight size={22} />
          </div>

          <label>
            Promote To
            <input value={targetGrade} readOnly />
          </label>

          <label>
            Target Academic Year
            <select
              value={targetYear}
              onChange={(e) => setTargetYear(e.target.value)}
            >
              <option>2027/2028</option>
              <option>2028/2029</option>
              <option>2029/2030</option>
            </select>
          </label>
        </div>
      </div>

      <div className="promotion-students-card">
        <div className="promotion-table-heading">
          <div>
            <h3>Students for Promotion</h3>
            <p>Select students who meet the school's promotion criteria.</p>
          </div>
          <span>{availableStudents.length} Students</span>
        </div>

        <div className="promotion-toolbar">
          <div className="promotion-search">
            <Search size={18} />
            <input
              placeholder="Search student name or ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="promotion-filter-label">
            <Filter size={16} />
            {sourceGrade}
          </div>
        </div>

        <div className="promotion-table-wrapper">
          <table className="promotion-table">
            <thead>
              <tr>
                <th>
                  <input
                    type="checkbox"
                    checked={
                      availableStudents.filter((s) => s.status === "Eligible").length > 0 &&
                      availableStudents
                        .filter((s) => s.status === "Eligible")
                        .every((s) => selectedIds.includes(s.id))
                    }
                    onChange={toggleSelectAll}
                    aria-label="Select all eligible students"
                  />
                </th>
                <th>Student</th>
                <th>Student ID</th>
                <th>Current Grade</th>
                <th>Section</th>
                <th>Average Mark</th>
                <th>Promotion Status</th>
              </tr>
            </thead>
            <tbody>
              {availableStudents.length > 0 ? (
                availableStudents.map((student) => (
                  <tr key={student.id}>
                    <td>
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(student.id)}
                        disabled={student.status !== "Eligible"}
                        onChange={() => toggleStudent(student.id)}
                        aria-label={`Select ${student.name}`}
                      />
                    </td>
                    <td><strong>{student.name}</strong></td>
                    <td className="promotion-student-id">{student.id}</td>
                    <td>{student.grade}</td>
                    <td>{student.section}</td>
                    <td>
                      <strong>{student.average}%</strong>
                    </td>
                    <td>
                      <span className={`promotion-status ${
                        student.status === "Eligible" ? "eligible" : "review"
                      }`}>
                        {student.status}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="promotion-empty">
                    No students found in this grade.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {message && (
          <div className="promotion-message">
            {message}
          </div>
        )}

        <div className="promotion-footer">
          <span>{selectedIds.length} student(s) selected</span>
          <button
            className="promotion-submit-btn"
            onClick={handlePromotion}
            disabled={selectedIds.length === 0}
          >
            <GraduationCap size={18} />
            Promote Selected Students
          </button>
        </div>
      </div>

      <div className="promotion-history-card">
        <div className="promotion-section-title">
          <div>
            <h3><History size={19} /> Promotion History</h3>
            <p>Recent promotion actions in this session.</p>
          </div>
        </div>

        {history.length === 0 ? (
          <p className="promotion-history-empty">No promotion records yet.</p>
        ) : (
          <div className="promotion-history-list">
            {history.map((item) => (
              <div className="promotion-history-row" key={item.id}>
                <div>
                  <strong>{item.count} student(s)</strong>
                  <small>{item.from} → {item.to} · {item.year}</small>
                </div>
                <span>{item.date}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {showConfirm && (
        <div
          className="promotion-modal-overlay"
          onClick={() => setShowConfirm(false)}
        >
          <div
            className="promotion-confirm-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="promotion-modal-x"
              onClick={() => setShowConfirm(false)}
              aria-label="Close"
            >
              <X size={19} />
            </button>

            <div className="promotion-confirm-icon">
              <GraduationCap size={28} />
            </div>

            <h3>Confirm Student Promotion</h3>
            <p>
              You are about to promote <strong>{selectedIds.length}</strong>
              {" "}student(s) from <strong>{sourceGrade}</strong> to{" "}
              <strong>{targetGrade}</strong> for academic year{" "}
              <strong>{targetYear}</strong>.
            </p>

            <div className="promotion-modal-actions">
              <button
                className="promotion-cancel-btn"
                onClick={() => setShowConfirm(false)}
              >
                Cancel
              </button>
              <button
                className="promotion-confirm-btn"
                onClick={confirmPromotion}
              >
                Confirm Promotion
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default StudentPromotion;
