
import { useState } from "react";
import {
    Plus, Search, CalendarDays, CheckCircle,
    XCircle, Clock, X, Save
} from "lucide-react";

import "../../styles/registrar/LeaveRequest.css";

const initialRequests = [
    {
        id: 1,
        name: "Abebe Kebede",
        role: "Teacher",
        type: "Sick Leave",
        from: "2026-11-03",
        to: "2026-11-05",
        reason: "Medical appointment",
        status: "Pending",
    },
    {
        id: 2,
        name: "Sara Tadesse",
        role: "Accountant",
        type: "Annual Leave",
        from: "2026-11-06",
        to: "2026-11-08",
        reason: "Family matter",
        status: "Approved",
    },
];

function LeaveRequest() {
    const [requests, setRequests] = useState(initialRequests);
    const [search, setSearch] = useState("");
    const [filter, setFilter] = useState("All");
    const [showModal, setShowModal] = useState(false);

    const emptyForm = {
        name: "",
        role: "",
        type: "Annual Leave",
        from: "",
        to: "",
        reason: "",
    };

    const [form, setForm] = useState(emptyForm);

    const filteredRequests = requests.filter((item) => {
        const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase());
        const matchesStatus = filter === "All" || item.status === filter;
        return matchesSearch && matchesStatus;
    });

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (form.to < form.from) {
            alert("End date must be after start date.");
            return;
        }

        setRequests((previous) => [
            ...previous,
            { ...form, id: Date.now(), status: "Pending" },
        ]);

        setForm(emptyForm);
        setShowModal(false);
    };

    const updateStatus = (id, status) => {
        setRequests((previous) =>
            previous.map((item) =>
                item.id === id ? { ...item, status } : item
            )
        );
    };

    const avatarUrl = (name) =>
        `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=E9E3FF&color=7059D5&size=128&bold=true`;

    return (
        <div className="leave-page">

            <div className="leave-heading">
                <div>
                    <span>STAFF MANAGEMENT</span>
                    <h2>Leave Requests</h2>
                    <p>Review and manage staff leave applications.</p>
                </div>

                <button className="leave-add-btn" onClick={() => setShowModal(true)}>
                    <Plus size={18} /> New Request
                </button>
            </div>

            <div className="leave-stats">
                <div className="leave-stat">
                    <CalendarDays />
                    <div><span>Total Requests</span><h3>{requests.length}</h3></div>
                </div>
                <div className="leave-stat">
                    <Clock />
                    <div><span>Pending</span><h3>{requests.filter(r => r.status === "Pending").length}</h3></div>
                </div>
                <div className="leave-stat">
                    <CheckCircle />
                    <div><span>Approved</span><h3>{requests.filter(r => r.status === "Approved").length}</h3></div>
                </div>
                <div className="leave-stat">
                    <XCircle />
                    <div><span>Rejected</span><h3>{requests.filter(r => r.status === "Rejected").length}</h3></div>
                </div>
            </div>

            <div className="leave-toolbar">
                <div className="leave-search">
                    <Search size={18} />
                    <input
                        placeholder="Search staff name..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>

                <select value={filter} onChange={(e) => setFilter(e.target.value)}>
                    <option value="All">All Status</option>
                    <option value="Pending">Pending</option>
                    <option value="Approved">Approved</option>
                    <option value="Rejected">Rejected</option>
                </select>
            </div>

            <div className="leave-table-card">
                <h3>Staff Leave Applications</h3>

                <div className="leave-table-wrap">
                    <table className="leave-table">
                        <thead>
                            <tr>
                                <th>Staff Member</th>
                                <th>Leave Type</th>
                                <th>Leave Period</th>
                                <th>Reason</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>

                        <tbody>
                            {filteredRequests.map((item) => (
                                <tr key={item.id}>
                                    <td>
                                        <div className="leave-staff">
                                            <img
                                                src={avatarUrl(item.name)}
                                                alt={item.name}
                                                onError={(e) => {
                                                    e.currentTarget.onerror = null;
                                                    e.currentTarget.src = avatarUrl("Staff");
                                                }}
                                            />
                                            <div>
                                                <strong>{item.name}</strong>
                                                <small>{item.role}</small>
                                            </div>
                                        </div>
                                    </td>
                                    <td>{item.type}</td>
                                    <td>{item.from} – {item.to}</td>
                                    <td>{item.reason}</td>
                                    <td>
                                        <span className={`leave-status ${item.status.toLowerCase()}`}>
                                            {item.status}
                                        </span>
                                    </td>
                                    <td>
                                        {item.status === "Pending" ? (
                                            <div className="leave-actions">
                                                <button
                                                    title="Approve"
                                                    onClick={() => updateStatus(item.id, "Approved")}
                                                >
                                                    <CheckCircle size={17} />
                                                </button>
                                                <button
                                                    title="Reject"
                                                    onClick={() => updateStatus(item.id, "Rejected")}
                                                >
                                                    <XCircle size={17} />
                                                </button>
                                            </div>
                                        ) : (
                                            <span className="leave-reviewed">Reviewed</span>
                                        )}
                                    </td>
                                </tr>
                            ))}

                            {filteredRequests.length === 0 && (
                                <tr>
                                    <td colSpan="6" className="leave-empty">
                                        No leave requests found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {showModal && (
                <div className="leave-modal-overlay">
                    <div className="leave-modal">
                        <div className="leave-modal-header">
                            <div>
                                <h3>New Leave Request</h3>
                                <p>Enter staff leave information.</p>
                            </div>
                            <button type="button" onClick={() => setShowModal(false)}>
                                <X />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit}>
                            <div className="leave-form-grid">
                                <label>
                                    Staff Name
                                    <input name="name" value={form.name} onChange={handleChange} required />
                                </label>
                                <label>
                                    Staff Role
                                    <input name="role" value={form.role} onChange={handleChange} required />
                                </label>
                                <label>
                                    Leave Type
                                    <select name="type" value={form.type} onChange={handleChange}>
                                        <option>Annual Leave</option>
                                        <option>Sick Leave</option>
                                        <option>Emergency Leave</option>
                                        <option>Maternity Leave</option>
                                        <option>Other</option>
                                    </select>
                                </label>
                                <label>
                                    Start Date
                                    <input type="date" name="from" value={form.from} onChange={handleChange} required />
                                </label>
                                <label>
                                    End Date
                                    <input type="date" name="to" value={form.to} onChange={handleChange} required />
                                </label>
                                <label className="leave-full">
                                    Reason
                                    <textarea name="reason" value={form.reason} onChange={handleChange} required />
                                </label>
                            </div>

                            <div className="leave-modal-actions">
                                <button type="button" onClick={() => setShowModal(false)}>
                                    Cancel
                                </button>
                                <button type="submit">
                                    <Save size={17} /> Submit Request
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default LeaveRequest;
