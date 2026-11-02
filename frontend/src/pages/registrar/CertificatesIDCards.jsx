
import { useMemo, useState } from "react";
import {
    Award, CreditCard, Search, Eye, Printer,
    // Download, 
    X, CheckCircle, Clock, FileText
} from "lucide-react";

import "../../styles/registrar/CertificatesIDCards.css";

const initialRecords = [
    {
        id: 1,
        studentId: "STU-2026-001",
        name: "Abebe Kebede",
        grade: "Grade 10",
        section: "A",
        type: "Student ID",
        status: "Issued",
        date: "2026-10-20",
    },
    {
        id: 2,
        studentId: "STU-2026-002",
        name: "Sara Tadesse",
        grade: "Grade 12",
        section: "B",
        type: "Completion Certificate",
        status: "Pending",
        date: "2026-10-25",
    },
    {
        id: 3,
        studentId: "STU-2026-003",
        name: "Dawit Bekele",
        grade: "Grade 8",
        section: "C",
        type: "Student ID",
        status: "Issued",
        date: "2026-10-22",
    },
    {
        id: 4,
        studentId: "STU-2026-004",
        name: "Hana Alemu",
        grade: "Grade 12",
        section: "A",
        type: "Completion Certificate",
        status: "Pending",
        date: "2026-10-28",
    },
];

function CertificatesIDCards() {
    const [records, setRecords] = useState(initialRecords);
    const [search, setSearch] = useState("");
    const [filter, setFilter] = useState("All");
    const [selected, setSelected] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [message, setMessage] = useState("");

    const [form, setForm] = useState({
        studentId: "",
        name: "",
        grade: "",
        section: "",
        type: "Student ID",
    });

    const filteredRecords = useMemo(() => {
        return records.filter((record) => {
            const matchesSearch =
                record.name.toLowerCase().includes(search.toLowerCase()) ||
                record.studentId.toLowerCase().includes(search.toLowerCase());

            const matchesFilter =
                filter === "All" || record.type === filter;

            return matchesSearch && matchesFilter;
        });
    }, [records, search, filter]);

    const issuedCount = records.filter(
        (record) => record.status === "Issued"
    ).length;

    const pendingCount = records.filter(
        (record) => record.status === "Pending"
    ).length;

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        const newRecord = {
            ...form,
            id: Date.now(),
            date: new Date().toISOString().slice(0, 10),
            status: "Pending",
        };

        setRecords((previous) => [newRecord, ...previous]);
        setForm({
            studentId: "",
            name: "",
            grade: "",
            section: "",
            type: "Student ID",
        });
        setShowForm(false);
        setMessage("Document request created successfully.");
        setTimeout(() => setMessage(""), 3000);
    };

    const handleIssue = (id) => {
        setRecords((previous) =>
            previous.map((record) =>
                record.id === id
                    ? { ...record, status: "Issued" }
                    : record
            )
        );

        setSelected((previous) =>
            previous?.id === id
                ? { ...previous, status: "Issued" }
                : previous
        );

        setMessage("Document marked as issued.");
        setTimeout(() => setMessage(""), 3000);
    };

    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="certificate-page">

            <div className="certificate-heading">
                <div>
                    <span className="certificate-eyebrow">
                        REGISTRAR MANAGEMENT
                    </span>
                    <h2>Certificates & ID Cards</h2>
                    <p>
                        Create, manage and issue student certificates
                        and identification cards.
                    </p>
                </div>

                <button
                    className="certificate-primary-btn"
                    onClick={() => setShowForm(true)}
                >
                    <FileText size={18} />
                    Create Document
                </button>
            </div>

            {message && (
                <div className="certificate-message">
                    <CheckCircle size={18} />
                    {message}
                </div>
            )}

            <div className="certificate-stat-grid">
                <div className="certificate-stat-card">
                    <div className="certificate-stat-icon purple">
                        <FileText size={23} />
                    </div>
                    <div>
                        <span>Total Documents</span>
                        <h3>{records.length}</h3>
                    </div>
                </div>

                <div className="certificate-stat-card">
                    <div className="certificate-stat-icon green">
                        <CheckCircle size={23} />
                    </div>
                    <div>
                        <span>Issued Documents</span>
                        <h3>{issuedCount}</h3>
                    </div>
                </div>

                <div className="certificate-stat-card">
                    <div className="certificate-stat-icon orange">
                        <Clock size={23} />
                    </div>
                    <div>
                        <span>Pending Requests</span>
                        <h3>{pendingCount}</h3>
                    </div>
                </div>

                <div className="certificate-stat-card">
                    <div className="certificate-stat-icon blue">
                        <CreditCard size={23} />
                    </div>
                    <div>
                        <span>Student ID Cards</span>
                        <h3>
                            {records.filter(
                                (r) => r.type === "Student ID"
                            ).length}
                        </h3>
                    </div>
                </div>
            </div>

            <div className="certificate-toolbar">
                <div className="certificate-search">
                    <Search size={18} />
                    <input
                        type="text"
                        placeholder="Search student name or ID..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>

                <select
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                >
                    <option value="All">All Documents</option>
                    <option value="Student ID">Student ID</option>
                    <option value="Completion Certificate">
                        Completion Certificate
                    </option>
                </select>
            </div>

            <div className="certificate-table-card">
                <div className="certificate-table-heading">
                    <div>
                        <h3>Document Records</h3>
                        <p>Manage student certificates and ID cards</p>
                    </div>
                    <Award size={25} />
                </div>

                <div className="certificate-table-wrap">
                    <table className="certificate-table">
                        <thead>
                            <tr>
                                <th>Student</th>
                                <th>Student ID</th>
                                <th>Grade</th>
                                <th>Document Type</th>
                                <th>Date</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>

                        <tbody>
                            {filteredRecords.map((record) => (
                                <tr key={record.id}>
                                    <td>
                                        <strong>{record.name}</strong>
                                    </td>
                                    <td>{record.studentId}</td>
                                    <td>
                                        {record.grade} - {record.section}
                                    </td>
                                    <td>{record.type}</td>
                                    <td>{record.date}</td>
                                    <td>
                                        <span className={`certificate-status ${
                                            record.status.toLowerCase()
                                        }`}>
                                            {record.status}
                                        </span>
                                    </td>
                                    <td>
                                        <div className="certificate-actions">
                                            <button
                                                title="View"
                                                onClick={() => setSelected(record)}
                                            >
                                                <Eye size={17} />
                                            </button>

                                            {record.status === "Pending" && (
                                                <button
                                                    title="Issue document"
                                                    onClick={() =>
                                                        handleIssue(record.id)
                                                    }
                                                >
                                                    <CheckCircle size={17} />
                                                </button>
                                            )}

                                            <button
                                                title="Print"
                                                onClick={() => {
                                                    setSelected(record);
                                                    setTimeout(handlePrint, 100);
                                                }}
                                            >
                                                <Printer size={17} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}

                            {filteredRecords.length === 0 && (
                                <tr>
                                    <td colSpan="7">
                                        <div className="certificate-empty">
                                            No document records found.
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {showForm && (
                <div className="certificate-modal-overlay">
                    <div className="certificate-modal">
                        <div className="certificate-modal-header">
                            <div>
                                <h3>Create Document Request</h3>
                                <p>Enter the student's information</p>
                            </div>
                            <button onClick={() => setShowForm(false)}>
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit}>
                            <div className="certificate-form-grid">
                                <label>
                                    Student ID
                                    <input
                                        name="studentId"
                                        value={form.studentId}
                                        onChange={handleChange}
                                        placeholder="STU-2026-005"
                                        required
                                    />
                                </label>

                                <label>
                                    Student Full Name
                                    <input
                                        name="name"
                                        value={form.name}
                                        onChange={handleChange}
                                        placeholder="Enter full name"
                                        required
                                    />
                                </label>

                                <label>
                                    Grade
                                    <select
                                        name="grade"
                                        value={form.grade}
                                        onChange={handleChange}
                                        required
                                    >
                                        <option value="">Select grade</option>
                                        {Array.from(
                                            { length: 12 },
                                            (_, i) => (
                                                <option key={i + 1}>
                                                    Grade {i + 1}
                                                </option>
                                            )
                                        )}
                                    </select>
                                </label>

                                <label>
                                    Section
                                    <select
                                        name="section"
                                        value={form.section}
                                        onChange={handleChange}
                                        required
                                    >
                                        <option value="">Select section</option>
                                        {["A", "B", "C", "D"].map((section) => (
                                            <option key={section}>
                                                {section}
                                            </option>
                                        ))}
                                    </select>
                                </label>

                                <label className="certificate-full-width">
                                    Document Type
                                    <select
                                        name="type"
                                        value={form.type}
                                        onChange={handleChange}
                                    >
                                        <option value="Student ID">
                                            Student ID Card
                                        </option>
                                        <option value="Completion Certificate">
                                            Completion Certificate
                                        </option>
                                    </select>
                                </label>
                            </div>

                            <div className="certificate-modal-actions">
                                <button
                                    type="button"
                                    className="certificate-cancel-btn"
                                    onClick={() => setShowForm(false)}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="certificate-primary-btn"
                                >
                                    Create Request
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {selected && (
                <div className="certificate-modal-overlay">
                    <div className="certificate-modal certificate-preview">
                        <div className="certificate-modal-header">
                            <div>
                                <h3>Document Preview</h3>
                                <p>Student document information</p>
                            </div>
                            <button onClick={() => setSelected(null)}>
                                <X size={20} />
                            </button>
                        </div>

                        <div className="certificate-print-area">
                            <div className="certificate-school-name">
                                <Award size={35} />
                                <h2>MY SCHOOL</h2>
                                <p>STUDENT DOCUMENT</p>
                            </div>

                            <div className="certificate-preview-content">
                                <h3>{selected.type}</h3>
                                <p><strong>Student Name:</strong> {selected.name}</p>
                                <p><strong>Student ID:</strong> {selected.studentId}</p>
                                <p><strong>Grade:</strong> {selected.grade}</p>
                                <p><strong>Section:</strong> {selected.section}</p>
                                <p><strong>Issue Date:</strong> {selected.date}</p>
                                <p><strong>Status:</strong> {selected.status}</p>
                            </div>

                            <div className="certificate-signatures">
                                <span>Registrar Signature</span>
                                <span>School Director</span>
                            </div>
                        </div>

                        <div className="certificate-modal-actions">
                            <button
                                className="certificate-cancel-btn"
                                onClick={() => setSelected(null)}
                            >
                                Close
                            </button>
                            <button
                                className="certificate-primary-btn"
                                onClick={handlePrint}
                            >
                                <Printer size={17} />
                                Print Document
                            </button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
}

export default CertificatesIDCards;
