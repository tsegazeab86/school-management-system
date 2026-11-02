
import { useState } from "react";
import {
    Award,
    BookOpen,
    GraduationCap,
    TrendingUp,
    Search,
    Trophy,
    ChartNoAxesColumnIncreasing,
    FileText,
    X,
    Download,
} from "lucide-react";
import { motion } from "framer-motion";
import "./ParentResults.css";

const resultsData = [
    {
        id: 1,
        child: "Abebe Tadesse",
        studentId: "STU-2026-001",
        grade: "Grade 5",
        semester: "Semester 1",
        subject: "Mathematics",
        assignment: 18,
        midterm: 25,
        final: 42,
        total: 85,
        letter: "A",
        remark: "Excellent",
    },
    {
        id: 2,
        child: "Abebe Tadesse",
        studentId: "STU-2026-001",
        grade: "Grade 5",
        semester: "Semester 1",
        subject: "Science",
        assignment: 17,
        midterm: 23,
        final: 40,
        total: 80,
        letter: "A",
        remark: "Very Good",
    },
    {
        id: 3,
        child: "Abebe Tadesse",
        studentId: "STU-2026-001",
        grade: "Grade 5",
        semester: "Semester 1",
        subject: "English",
        assignment: 19,
        midterm: 24,
        final: 45,
        total: 88,
        letter: "A",
        remark: "Excellent",
    },
    {
        id: 4,
        child: "Abebe Tadesse",
        studentId: "STU-2026-001",
        grade: "Grade 5",
        semester: "Semester 1",
        subject: "Social Studies",
        assignment: 15,
        midterm: 21,
        final: 36,
        total: 72,
        letter: "B",
        remark: "Good",
    },
    {
        id: 5,
        child: "Hana Tadesse",
        studentId: "STU-2026-002",
        grade: "Grade 3",
        semester: "Semester 1",
        subject: "Mathematics",
        assignment: 17,
        midterm: 22,
        final: 41,
        total: 80,
        letter: "A",
        remark: "Very Good",
    },
    {
        id: 6,
        child: "Hana Tadesse",
        studentId: "STU-2026-002",
        grade: "Grade 3",
        semester: "Semester 1",
        subject: "Science",
        assignment: 16,
        midterm: 20,
        final: 38,
        total: 74,
        letter: "B",
        remark: "Good",
    },
    {
        id: 7,
        child: "Hana Tadesse",
        studentId: "STU-2026-002",
        grade: "Grade 3",
        semester: "Semester 1",
        subject: "English",
        assignment: 19,
        midterm: 24,
        final: 44,
        total: 87,
        letter: "A",
        remark: "Excellent",
    },
    {
        id: 8,
        child: "Hana Tadesse",
        studentId: "STU-2026-002",
        grade: "Grade 3",
        semester: "Semester 1",
        subject: "Social Studies",
        assignment: 15,
        midterm: 19,
        final: 34,
        total: 68,
        letter: "C",
        remark: "Satisfactory",
    },
];

const children = ["All Children", "Abebe Tadesse", "Hana Tadesse"];

function ParentResults() {
    const [selectedChild, setSelectedChild] = useState("All Children");
    const [selectedSemester, setSelectedSemester] = useState("Semester 1");
    const [search, setSearch] = useState("");
    const [selectedResult, setSelectedResult] = useState(null);

    const filteredResults = resultsData.filter((result) => {
        const matchesChild =
            selectedChild === "All Children" || result.child === selectedChild;

        const matchesSemester =
            selectedSemester === "All Semesters" ||
            result.semester === selectedSemester;

        const matchesSearch =
            result.subject.toLowerCase().includes(search.toLowerCase()) ||
            result.child.toLowerCase().includes(search.toLowerCase()) ||
            result.studentId.toLowerCase().includes(search.toLowerCase());

        return matchesChild && matchesSemester && matchesSearch;
    });

    const average =
        filteredResults.length > 0
            ? Math.round(
                filteredResults.reduce((sum, item) => sum + item.total, 0) /
                filteredResults.length
            )
            : 0;

    const highest =
        filteredResults.length > 0
            ? Math.max(...filteredResults.map((item) => item.total))
            : 0;

    const passed = filteredResults.filter((item) => item.total >= 50).length;
    const excellent = filteredResults.filter((item) => item.total >= 80).length;

    const getGradeClass = (grade) => {
        if (grade === "A") return "pr-grade-a";
        if (grade === "B") return "pr-grade-b";
        if (grade === "C") return "pr-grade-c";
        if (grade === "D") return "pr-grade-d";
        return "pr-grade-f";
    };

    const printResults = () => {
        window.print();
    };

    return (
        <div className="parent-results-page">
            {/* Header */}
            <header className="pr-header">
                <div>
                    <span className="pr-eyebrow">
                        <GraduationCap size={17} />
                        ACADEMIC PERFORMANCE
                    </span>
                    <h1>Exams & Results</h1>
                    <p>
                        Follow your children's academic progress and examination
                        performance.
                    </p>
                </div>

                <button className="pr-print-btn" onClick={printResults}>
                    <Download size={18} />
                    Print Results
                </button>
            </header>

            {/* Filters */}
            <section className="pr-filter-section">
                <div className="pr-filter-heading">
                    <BookOpen size={20} />
                    <h2>Result Filters</h2>
                </div>

                <div className="row g-3">
                    <div className="col-md-4">
                        <label className="form-label">Select Child</label>
                        <select
                            className="form-select"
                            value={selectedChild}
                            onChange={(e) => setSelectedChild(e.target.value)}
                        >
                            {children.map((child) => (
                                <option key={child}>{child}</option>
                            ))}
                        </select>
                    </div>

                    <div className="col-md-4">
                        <label className="form-label">Academic Semester</label>
                        <select
                            className="form-select"
                            value={selectedSemester}
                            onChange={(e) => setSelectedSemester(e.target.value)}
                        >
                            <option>All Semesters</option>
                            <option>Semester 1</option>
                            <option>Semester 2</option>
                        </select>
                    </div>

                    <div className="col-md-4">
                        <label className="form-label">Search Results</label>
                        <div className="pr-search">
                            <Search size={19} />
                            <input
                                type="search"
                                placeholder="Search subject or student..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                    </div>
                </div>
            </section>

            {/* Statistics */}
            <div className="row g-3 pr-stat-row">
                <div className="col-6 col-xl-3">
                    <motion.div className="pr-stat-card pr-stat-purple" whileHover={{ y: -4 }}>
                        <div className="pr-stat-icon"><Award size={25} /></div>
                        <span>Average Score</span>
                        <h3>{average}%</h3>
                        <small>Across displayed subjects</small>
                    </motion.div>
                </div>

                <div className="col-6 col-xl-3">
                    <motion.div className="pr-stat-card pr-stat-green" whileHover={{ y: -4 }}>
                        <div className="pr-stat-icon"><Trophy size={25} /></div>
                        <span>Highest Score</span>
                        <h3>{highest}%</h3>
                        <small>Best subject performance</small>
                    </motion.div>
                </div>

                <div className="col-6 col-xl-3">
                    <motion.div className="pr-stat-card pr-stat-blue" whileHover={{ y: -4 }}>
                        <div className="pr-stat-icon"><BookOpen size={25} /></div>
                        <span>Passed Subjects</span>
                        <h3>{passed}/{filteredResults.length}</h3>
                        <small>Marks of 50% or above</small>
                    </motion.div>
                </div>

                <div className="col-6 col-xl-3">
                    <motion.div className="pr-stat-card pr-stat-orange" whileHover={{ y: -4 }}>
                        <div className="pr-stat-icon"><TrendingUp size={25} /></div>
                        <span>Excellent Results</span>
                        <h3>{excellent}</h3>
                        <small>Scores of 80% or above</small>
                    </motion.div>
                </div>
            </div>

            {/* Performance overview */}
            <div className="row g-4 pr-chart-row">
                <div className="col-lg-7">
                    <section className="pr-panel">
                        <div className="pr-panel-heading">
                            <div>
                                <h2>Subject Performance</h2>
                                <p>Compare scores across subjects</p>
                            </div>
                            <ChartNoAxesColumnIncreasing size={23} />
                        </div>

                        <div className="pr-chart">
                            {filteredResults.length > 0 ? (
                                filteredResults.map((item) => (
                                    <div className="pr-chart-item" key={item.id}>
                                        <div className="pr-chart-label">
                                            <span>{item.child.split(" ")[0]} · {item.subject}</span>
                                            <strong>{item.total}%</strong>
                                        </div>
                                        <div className="pr-chart-track">
                                            <motion.div
                                                className="pr-chart-fill"
                                                initial={{ width: 0 }}
                                                animate={{ width: `${item.total}%` }}
                                                transition={{ duration: 0.7 }}
                                            />
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="pr-empty">No results available for this filter.</p>
                            )}
                        </div>
                    </section>
                </div>

                <div className="col-lg-5">
                    <section className="pr-panel pr-grade-panel">
                        <div className="pr-panel-heading">
                            <div>
                                <h2>Grading Guide</h2>
                                <p>Understand the grading scale</p>
                            </div>
                            <Award size={23} />
                        </div>

                        {[
                            ["A", "80–100", "Excellent"],
                            ["B", "70–79", "Very Good"],
                            ["C", "60–69", "Good"],
                            ["D", "50–59", "Satisfactory"],
                            ["F", "Below 50", "Fail"],
                        ].map(([grade, range, label]) => (
                            <div className="pr-grade-guide" key={grade}>
                                <span className={`pr-grade-badge ${getGradeClass(grade)}`}>
                                    {grade}
                                </span>
                                <strong>{range}</strong>
                                <span>{label}</span>
                            </div>
                        ))}
                    </section>
                </div>
            </div>

            {/* Results table */}
            <section className="pr-panel pr-results-table-panel">
                <div className="pr-panel-heading">
                    <div>
                        <h2>Detailed Examination Results</h2>
                        <p>Subject marks and academic remarks</p>
                    </div>
                    <span className="pr-result-count">
                        {filteredResults.length} Subjects
                    </span>
                </div>

                <div className="table-responsive">
                    <table className="table pr-table align-middle">
                        <thead>
                            <tr>
                                <th>Student</th>
                                <th>Subject</th>
                                <th>Assignment</th>
                                <th>Midterm</th>
                                <th>Final</th>
                                <th>Total</th>
                                <th>Grade</th>
                                <th>Action</th>
                            </tr>
                        </thead>

                        <tbody>
                            {filteredResults.length > 0 ? (
                                filteredResults.map((item) => (
                                    <tr key={item.id}>
                                        <td className="pr-student-cell">{item.child}</td>
                                        <td>{item.subject}</td>
                                        <td>{item.assignment}/20</td>
                                        <td>{item.midterm}/30</td>
                                        <td>{item.final}/50</td>
                                        <td className="pr-total-cell">{item.total}/100</td>
                                        <td>
                                            <span className={`pr-grade-badge ${getGradeClass(item.letter)}`}>
                                                {item.letter}
                                            </span>
                                        </td>
                                        <td>
                                            <button
                                                className="pr-view-btn"
                                                onClick={() => setSelectedResult(item)}
                                            >
                                                <FileText size={16} />
                                                Details
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="8" className="pr-empty">
                                        No examination results found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </section>

            {/* Academic notice */}
            <div className="pr-notice">
                <GraduationCap size={23} />
                <div>
                    <strong>Parent access and academic permissions</strong>
                    <p>
                        Parents can view their children's examination results and
                        performance reports. Editing grades or examination records is
                        not permitted.
                    </p>
                </div>
            </div>

            {/* Result details modal */}
            {selectedResult && (
                <div
                    className="pr-modal-overlay"
                    onClick={() => setSelectedResult(null)}
                >
                    <motion.div
                        className="pr-modal"
                        initial={{ opacity: 0, scale: 0.95, y: 15 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="pr-modal-header">
                            <div>
                                <span>EXAMINATION REPORT</span>
                                <h3>Subject Result Details</h3>
                            </div>
                            <button
                                className="pr-close-btn"
                                onClick={() => setSelectedResult(null)}
                            >
                                <X size={21} />
                            </button>
                        </div>

                        <div className="pr-modal-student">
                            <div className="pr-modal-avatar">
                                {selectedResult.child.split(" ").map((part) => part[0]).join("")}
                            </div>
                            <div>
                                <h4>{selectedResult.child}</h4>
                                <p>{selectedResult.studentId} · {selectedResult.grade}</p>
                            </div>
                        </div>

                        <div className="pr-modal-subject">
                            <span>Subject</span>
                            <strong>{selectedResult.subject}</strong>
                        </div>

                        <div className="pr-mark-breakdown">
                            <div><span>Assignment</span><strong>{selectedResult.assignment}/20</strong></div>
                            <div><span>Midterm Examination</span><strong>{selectedResult.midterm}/30</strong></div>
                            <div><span>Final Examination</span><strong>{selectedResult.final}/50</strong></div>
                        </div>

                        <div className="pr-modal-total">
                            <span>Total Score</span>
                            <strong>{selectedResult.total}/100</strong>
                            <span className={`pr-grade-badge ${getGradeClass(selectedResult.letter)}`}>
                                Grade {selectedResult.letter}
                            </span>
                        </div>

                        <div className="pr-modal-remark">
                            <Award size={20} />
                            <div>
                                <strong>{selectedResult.remark}</strong>
                                <p>Academic performance remark</p>
                            </div>
                        </div>

                        <button
                            className="pr-modal-done"
                            onClick={() => setSelectedResult(null)}
                        >
                            Close Report
                        </button>
                    </motion.div>
                </div>
            )}
        </div>
    );
}

export default ParentResults;
