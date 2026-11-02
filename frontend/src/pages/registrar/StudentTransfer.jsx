
import { useMemo, useState } from "react";
import {
    Search, ArrowRightLeft, ArrowRight,
    //   Users, 
    Clock3,
    CheckCircle2, XCircle, Trash2, X, MapPin,
    //   CalendarDays,
    AlertTriangle, ClipboardList
} from "lucide-react";
import "../../styles/registrar/StudentTransfer.css";

const initialStudents = [
    { id: "STU001", name: "Abebe Kebede", grade: "Grade 8", section: "A" },
    { id: "STU002", name: "Martha Tadesse", grade: "Grade 8", section: "B" },
    { id: "STU003", name: "Dawit Getachew", grade: "Grade 9", section: "A" },
    { id: "STU004", name: "Selamawit Alemu", grade: "Grade 10", section: "C" },
    { id: "STU005", name: "Bereket Tesfaye", grade: "Grade 9", section: "B" },
];

const sections = ["A", "B", "C", "D"];

function StudentTransfer() {
    const [students] = useState(initialStudents);
    const [search, setSearch] = useState("");
    const [selectedStudentId, setSelectedStudentId] = useState("");
    const [destinationGrade, setDestinationGrade] = useState("");
    const [destinationSection, setDestinationSection] = useState("");
    const [transferDate, setTransferDate] = useState(
        new Date().toISOString().slice(0, 10)
    );
    const [reason, setReason] = useState("");
    const [otherReason, setOtherReason] = useState("");
    const [notes, setNotes] = useState("");
    const [requests, setRequests] = useState([]);
    const [message, setMessage] = useState("");
    const [deleteTarget, setDeleteTarget] = useState(null);

    const filteredStudents = useMemo(() => {
        const query = search.toLowerCase().trim();

        return students.filter((student) =>
            student.name.toLowerCase().includes(query) ||
            student.id.toLowerCase().includes(query)
        );
    }, [students, search]);

    const selectedStudent = students.find(
        (student) => student.id === selectedStudentId
    );

    const pendingCount = requests.filter(
        (request) => request.status === "Pending"
    ).length;

    const approvedCount = requests.filter(
        (request) => request.status === "Approved"
    ).length;

  const handleSubmit = (event) => {
    event.preventDefault();
    setMessage("");

    // Validate student first
    if (!selectedStudent) {
        setMessage("Please select a student.");
        return;
    }

    // Validate required fields
    if (
        !destinationGrade ||
        !destinationSection ||
        !reason ||
        !transferDate
    ) {
        setMessage("Please complete all required transfer fields.");
        return;
    }

    // Validate Other reason
    if (reason === "Other" && !otherReason.trim()) {
        setMessage("Please specify the transfer reason.");
        return;
    }

    // Validate destination
    if (
        selectedStudent.grade === destinationGrade &&
        selectedStudent.section === destinationSection
    ) {
        setMessage(
            "The destination must be different from the current class."
        );
        return;
    }

    // Generate request ID without Date.now()
    const newRequest = {
        id: `TR-${String(requests.length + 1).padStart(6, "0")}`,
        studentId: selectedStudent.id,
        studentName: selectedStudent.name,
        fromGrade: selectedStudent.grade,
        fromSection: selectedStudent.section,
        toGrade: destinationGrade,
        toSection: destinationSection,
        date: transferDate,
        reason: reason === "Other" ? otherReason : reason,
        notes,
        status: "Pending",
    };

    setRequests((previous) => [newRequest, ...previous]);

    // Reset form
    setSelectedStudentId("");
    setDestinationGrade("");
    setDestinationSection("");
    setTransferDate("");
    setReason("");
    setOtherReason("");
    setNotes("");
    setSearch("");

    setMessage("Transfer request submitted successfully.");
};

    const updateRequestStatus = (requestId, newStatus) => {
        setRequests((previous) =>
            previous.map((request) =>
                request.id === requestId
                    ? { ...request, status: newStatus }
                    : request
            )
        );
    };

    const confirmDelete = () => {
        if (!deleteTarget) return;

        setRequests((previous) =>
            previous.filter((request) => request.id !== deleteTarget.id)
        );

        setDeleteTarget(null);
    };

    return (
        <div className="transfer-page">
            <div className="transfer-heading">
                <div>
                    <h2>Student Transfer</h2>
                    <p>Manage student class transfers and transfer requests.</p>
                </div>

                <div className="transfer-heading-icon">
                    <ArrowRightLeft size={23} />
                    Transfer Management
                </div>
            </div>

            <div className="transfer-stats">
                <div className="transfer-stat-card">
                    <div className="transfer-stat-icon purple"><ClipboardList /></div>
                    <div>
                        <span>Total Requests</span>
                        <h3>{requests.length}</h3>
                    </div>
                </div>

                <div className="transfer-stat-card">
                    <div className="transfer-stat-icon orange"><Clock3 /></div>
                    <div>
                        <span>Pending Requests</span>
                        <h3>{pendingCount}</h3>
                    </div>
                </div>

                <div className="transfer-stat-card">
                    <div className="transfer-stat-icon green"><CheckCircle2 /></div>
                    <div>
                        <span>Approved Requests</span>
                        <h3>{approvedCount}</h3>
                    </div>
                </div>
            </div>

            <div className="transfer-content-grid">
                <section className="transfer-form-card">
                    <div className="transfer-card-heading">
                        <div>
                            <h3>Create Transfer Request</h3>
                            <p>Enter the student and destination class details.</p>
                        </div>
                        <ArrowRightLeft size={24} />
                    </div>

                    <form onSubmit={handleSubmit}>
                        <div className="transfer-form-section">
                            <h4>1. Select Student</h4>

                            <label className="transfer-field">
                                Search Student
                                <div className="transfer-search">
                                    <Search size={18} />
                                    <input
                                        value={search}
                                        onChange={(event) => setSearch(event.target.value)}
                                        placeholder="Search by student name or ID..."
                                    />
                                </div>
                            </label>

                            <label className="transfer-field">
                                Student
                                <select
                                    value={selectedStudentId}
                                    onChange={(event) => setSelectedStudentId(event.target.value)}
                                    required
                                >
                                    <option value="">Choose a student</option>
                                    {filteredStudents.map((student) => (
                                        <option key={student.id} value={student.id}>
                                            {student.name} — {student.id}
                                        </option>
                                    ))}
                                </select>
                            </label>

                            {selectedStudent && (
                                <div className="transfer-current-class">
                                    <div className="transfer-student-avatar">
                                        {selectedStudent.name
                                            .split(" ")
                                            .map((part) => part[0])
                                            .join("")
                                            .slice(0, 2)}
                                    </div>
                                    <div>
                                        <strong>{selectedStudent.name}</strong>
                                        <small>{selectedStudent.id}</small>
                                    </div>
                                    <div className="transfer-current-badge">
                                        {selectedStudent.grade} · Section {selectedStudent.section}
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="transfer-form-section">
                            <h4>2. Destination Class</h4>

                            <div className="transfer-destination-grid">
                                <label className="transfer-field">
                                    Destination Grade
                                    <select
                                        value={destinationGrade}
                                        onChange={(event) => setDestinationGrade(event.target.value)}
                                        required
                                    >
                                        <option value="">Select Grade</option>
                                        {Array.from({ length: 12 }, (_, index) => (
                                            <option key={index + 1}>Grade {index + 1}</option>
                                        ))}
                                    </select>
                                </label>

                                <label className="transfer-field">
                                    Destination Section
                                    <select
                                        value={destinationSection}
                                        onChange={(event) => setDestinationSection(event.target.value)}
                                        required
                                    >
                                        <option value="">Select Section</option>
                                        {sections.map((section) => (
                                            <option key={section} value={section}>
                                                Section {section}
                                            </option>
                                        ))}
                                    </select>
                                </label>
                            </div>

                            <div className="transfer-route-preview">
                                <div>
                                    <small>FROM</small>
                                    <strong>
                                        {selectedStudent
                                            ? `${selectedStudent.grade} · ${selectedStudent.section}`
                                            : "Select student"}
                                    </strong>
                                </div>
                                <ArrowRight size={21} />
                                <div>
                                    <small>TO</small>
                                    <strong>
                                        {destinationGrade && destinationSection
                                            ? `${destinationGrade} · ${destinationSection}`
                                            : "Select destination"}
                                    </strong>
                                </div>
                            </div>
                        </div>

                        <div className="transfer-form-section">
                            <h4>3. Transfer Information</h4>

                            <div className="transfer-destination-grid">
                                <label className="transfer-field">
                                    Transfer Date
                                    <input
                                        type="date"
                                        value={transferDate}
                                        onChange={(event) => setTransferDate(event.target.value)}
                                        required
                                    />
                                </label>

                                <label className="transfer-field">
                                    Transfer Reason
                                    <select
                                        value={reason}
                                        onChange={(event) => setReason(event.target.value)}
                                        required
                                    >
                                        <option value="">Select Reason</option>
                                        <option>Parent Request</option>
                                        <option>Academic Reason</option>
                                        <option>Class Balancing</option>
                                        <option>Administrative Decision</option>
                                        <option>Other</option>
                                    </select>
                                </label>
                            </div>

                            {reason === "Other" && (
                                <label className="transfer-field">
                                    Specify Reason
                                    <input
                                        value={otherReason}
                                        onChange={(event) => setOtherReason(event.target.value)}
                                        placeholder="Enter transfer reason"
                                        required
                                    />
                                </label>
                            )}

                            <label className="transfer-field">
                                Additional Notes
                                <textarea
                                    rows="3"
                                    value={notes}
                                    onChange={(event) => setNotes(event.target.value)}
                                    placeholder="Add any additional information..."
                                />
                            </label>
                        </div>

                        {message && (
                            <div className={`transfer-message ${message.includes("successfully") ? "success" : "error"
                                }`}>
                                {message}
                            </div>
                        )}

                        <button className="transfer-submit-btn" type="submit">
                            <ArrowRightLeft size={18} />
                            Submit Transfer Request
                        </button>
                    </form>
                </section>

                <aside className="transfer-guidance-card">
                    <div className="transfer-guidance-icon">
                        <MapPin size={24} />
                    </div>
                    <h3>Transfer Guidelines</h3>
                    <p>Review these items before submitting a transfer request.</p>

                    <ul>
                        <li>Confirm the student's identity and current class.</li>
                        <li>Verify that the destination grade and section are correct.</li>
                        <li>Record a clear reason for the transfer.</li>
                        <li>Follow the school's approval procedure.</li>
                        <li>Update the official student record after approval.</li>
                    </ul>

                    <div className="transfer-guidance-note">
                        <AlertTriangle size={18} />
                        <span>Pending requests do not automatically change the student's class.</span>
                    </div>
                </aside>
            </div>

            <section className="transfer-history-card">
                <div className="transfer-card-heading">
                    <div>
                        <h3>Transfer Request History</h3>
                        <p>Review, approve, reject or remove transfer requests.</p>
                    </div>
                    <span className="transfer-record-count">
                        {requests.length} Records
                    </span>
                </div>

                <div className="transfer-table-wrapper">
                    <table className="transfer-table">
                        <thead>
                            <tr>
                                <th>Request ID</th>
                                <th>Student</th>
                                <th>Current Class</th>
                                <th>Destination</th>
                                <th>Date</th>
                                <th>Reason</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {requests.length ? requests.map((request) => (
                                <tr key={request.id}>
                                    <td className="transfer-request-id">{request.id}</td>
                                    <td><strong>{request.studentName}</strong></td>
                                    <td>{request.fromGrade} · {request.fromSection}</td>
                                    <td>{request.toGrade} · {request.toSection}</td>
                                    <td>{request.date}</td>
                                    <td>{request.reason}</td>
                                    <td>
                                        <span className={`transfer-status ${request.status.toLowerCase()
                                            }`}>
                                            {request.status}
                                        </span>
                                    </td>
                                    <td>
                                        <div className="transfer-actions">
                                            {request.status === "Pending" && (
                                                <>
                                                    <button
                                                        type="button"
                                                        className="transfer-approve-btn"
                                                        title="Approve request"
                                                        onClick={() => updateRequestStatus(request.id, "Approved")}
                                                    >
                                                        <CheckCircle2 size={16} />
                                                    </button>
                                                    <button
                                                        type="button"
                                                        className="transfer-reject-btn"
                                                        title="Reject request"
                                                        onClick={() => updateRequestStatus(request.id, "Rejected")}
                                                    >
                                                        <XCircle size={16} />
                                                    </button>
                                                </>
                                            )}

                                            <button
                                                type="button"
                                                className="transfer-delete-btn"
                                                title="Delete request"
                                                onClick={() => setDeleteTarget(request)}
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan="8" className="transfer-empty">
                                        <ClipboardList size={30} />
                                        <strong>No transfer requests yet</strong>
                                        <span>Submitted requests will appear here.</span>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </section>

            {deleteTarget && (
                <div
                    className="transfer-delete-overlay"
                    onClick={() => setDeleteTarget(null)}
                >
                    <div
                        className="transfer-delete-modal"
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="transfer-delete-title"
                        onClick={(event) => event.stopPropagation()}
                    >
                        <button
                            type="button"
                            className="transfer-modal-close"
                            onClick={() => setDeleteTarget(null)}
                            aria-label="Close dialog"
                        >
                            <X size={19} />
                        </button>

                        <div className="transfer-delete-icon">
                            <Trash2 size={26} />
                        </div>

                        <h3 id="transfer-delete-title">Delete Transfer Request?</h3>
                        <p>
                            Are you sure you want to delete the transfer request for{" "}
                            <strong>{deleteTarget.studentName}</strong>?
                            This action cannot be undone.
                        </p>

                        <div className="transfer-delete-details">
                            <span>Request ID</span>
                            <strong>{deleteTarget.id}</strong>
                            <span>Transfer</span>
                            <strong>
                                {deleteTarget.fromGrade} · {deleteTarget.fromSection}
                                {" → "}
                                {deleteTarget.toGrade} · {deleteTarget.toSection}
                            </strong>
                        </div>

                        <div className="transfer-delete-actions">
                            <button
                                type="button"
                                className="transfer-keep-btn"
                                onClick={() => setDeleteTarget(null)}
                            >
                                Keep Request
                            </button>
                            <button
                                type="button"
                                className="transfer-confirm-delete-btn"
                                onClick={confirmDelete}
                            >
                                <Trash2 size={16} />
                                Yes, Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default StudentTransfer;
