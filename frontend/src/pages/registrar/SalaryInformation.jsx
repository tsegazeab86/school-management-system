
import { useState } from "react";
import {
    Search, Wallet, Users, CheckCircle,
    Clock, Plus, X, Save, Edit, Trash2
} from "lucide-react";

import "../../styles/registrar/SalaryInformation.css";

const initialSalaries = [
    {
        id: 1,
        name: "Abebe Kebede",
        role: "Teacher",
        department: "Science",
        salary: 18000,
        month: "November 2026",
        status: "Paid",
    },
    {
        id: 2,
        name: "Sara Tadesse",
        role: "Accountant",
        department: "Finance",
        salary: 22000,
        month: "November 2026",
        status: "Pending",
    },
    {
        id: 3,
        name: "Dawit Bekele",
        role: "Librarian",
        department: "Library",
        salary: 15000,
        month: "November 2026",
        status: "Paid",
    },
];

function SalaryInformation() {
    const [salaries, setSalaries] = useState(initialSalaries);
    const [search, setSearch] = useState("");
    const [filter, setFilter] = useState("All");
    const [showModal, setShowModal] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [deleteId, setDeleteId] = useState(null);

    const emptyForm = {
        name: "",
        role: "",
        department: "",
        salary: "",
        month: "November 2026",
        status: "Pending",
    };

    const [form, setForm] = useState(emptyForm);

    const filteredSalaries = salaries.filter((item) => {
        const matchesSearch =
            item.name.toLowerCase().includes(search.toLowerCase()) ||
            item.department.toLowerCase().includes(search.toLowerCase());

        const matchesFilter =
            filter === "All" || item.status === filter;

        return matchesSearch && matchesFilter;
    });

    const openAddModal = () => {
        setEditingId(null);
        setForm(emptyForm);
        setShowModal(true);
    };

    const openEditModal = (item) => {
        setEditingId(item.id);
        setForm({
            ...item,
            salary: String(item.salary),
        });
        setShowModal(true);
    };

    const handleChange = (e) => {
        setForm({
            ...form,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        const salaryData = {
            ...form,
            salary: Number(form.salary),
        };

        if (editingId) {
            setSalaries((previous) =>
                previous.map((item) =>
                    item.id === editingId
                        ? { ...salaryData, id: editingId }
                        : item
                )
            );
        } else {
            setSalaries((previous) => [
                ...previous,
                { ...salaryData, id: Date.now() },
            ]);
        }

        setShowModal(false);
        setForm(emptyForm);
        setEditingId(null);
    };

    const confirmDelete = () => {
        setSalaries((previous) =>
            previous.filter((item) => item.id !== deleteId)
        );
        setDeleteId(null);
    };

    const updateStatus = (id, status) => {
        setSalaries((previous) =>
            previous.map((item) =>
                item.id === id ? { ...item, status } : item
            )
        );
    };

    const getAvatar = (name) =>
        `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=E9E3FF&color=7059D5&size=128&bold=true`;

    const totalSalary = salaries.reduce(
        (total, item) => total + item.salary, 0
    );

    return (
        <div className="salary-page">

            <div className="salary-heading">
                <div>
                    <span>STAFF MANAGEMENT</span>
                    <h2>Salary Information</h2>
                    <p>Manage staff salaries and payment records.</p>
                </div>

                <button className="salary-add-btn" onClick={openAddModal}>
                    <Plus size={18} /> Add Salary
                </button>
            </div>

            {/* Statistics */}
            <div className="salary-stats">
                <div className="salary-stat-card">
                    <Wallet />
                    <div>
                        <span>Total Salary</span>
                        <h3>{totalSalary.toLocaleString()} ETB</h3>
                    </div>
                </div>

                <div className="salary-stat-card">
                    <Users />
                    <div>
                        <span>Total Staff</span>
                        <h3>{salaries.length}</h3>
                    </div>
                </div>

                <div className="salary-stat-card">
                    <CheckCircle />
                    <div>
                        <span>Paid</span>
                        <h3>{salaries.filter(s => s.status === "Paid").length}</h3>
                    </div>
                </div>

                <div className="salary-stat-card">
                    <Clock />
                    <div>
                        <span>Pending</span>
                        <h3>{salaries.filter(s => s.status === "Pending").length}</h3>
                    </div>
                </div>
            </div>

            {/* Search and Filter */}
            <div className="salary-toolbar">
                <div className="salary-search">
                    <Search size={18} />
                    <input
                        placeholder="Search staff or department..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>

                <select
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                >
                    <option value="All">All Payments</option>
                    <option value="Paid">Paid</option>
                    <option value="Pending">Pending</option>
                </select>
            </div>

            {/* Salary Table */}
            <div className="salary-table-card">
                <h3>Staff Salary Records</h3>

                <div className="salary-table-wrap">
                    <table className="salary-table">
                        <thead>
                            <tr>
                                <th>Staff Member</th>
                                <th>Department</th>
                                <th>Monthly Salary</th>
                                <th>Month</th>
                                <th>Payment Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>

                        <tbody>
                            {filteredSalaries.map((item) => (
                                <tr key={item.id}>
                                    <td>
                                        <div className="salary-staff">
                                            <img
                                                src={getAvatar(item.name)}
                                                alt={item.name}
                                                onError={(e) => {
                                                    e.currentTarget.onerror = null;
                                                    e.currentTarget.src = getAvatar("Staff");
                                                }}
                                            />
                                            <div>
                                                <strong>{item.name}</strong>
                                                <small>{item.role}</small>
                                            </div>
                                        </div>
                                    </td>

                                    <td>{item.department}</td>

                                    <td className="salary-amount">
                                        {item.salary.toLocaleString()} ETB
                                    </td>

                                    <td>{item.month}</td>

                                    <td>
                                        <select
                                            className={`salary-status ${item.status.toLowerCase()}`}
                                            value={item.status}
                                            onChange={(e) =>
                                                updateStatus(item.id, e.target.value)
                                            }
                                        >
                                            <option>Paid</option>
                                            <option>Pending</option>
                                        </select>
                                    </td>

                                    <td>
                                        <div className="salary-actions">
                                            <button
                                                title="Edit"
                                                onClick={() => openEditModal(item)}
                                            >
                                                <Edit size={16} />
                                            </button>
                                            <button
                                                title="Delete"
                                                onClick={() => setDeleteId(item.id)}
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}

                            {filteredSalaries.length === 0 && (
                                <tr>
                                    <td colSpan="6" className="salary-empty">
                                        No salary records found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Add/Edit Modal */}
            {showModal && (
                <div className="salary-modal-overlay">
                    <div className="salary-modal">
                        <div className="salary-modal-header">
                            <div>
                                <h3>{editingId ? "Edit Salary" : "Add Staff Salary"}</h3>
                                <p>Enter staff salary information.</p>
                            </div>
                            <button onClick={() => setShowModal(false)}>
                                <X />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit}>
                            <div className="salary-form-grid">
                                <label>
                                    Staff Name
                                    <input
                                        name="name"
                                        value={form.name}
                                        onChange={handleChange}
                                        required
                                    />
                                </label>

                                <label>
                                    Staff Role
                                    <input
                                        name="role"
                                        value={form.role}
                                        onChange={handleChange}
                                        required
                                    />
                                </label>

                                <label>
                                    Department
                                    <input
                                        name="department"
                                        value={form.department}
                                        onChange={handleChange}
                                        required
                                    />
                                </label>

                                <label>
                                    Monthly Salary (ETB)
                                    <input
                                        type="number"
                                        name="salary"
                                        min="0"
                                        value={form.salary}
                                        onChange={handleChange}
                                        required
                                    />
                                </label>

                                <label>
                                    Payment Month
                                    <input
                                        name="month"
                                        value={form.month}
                                        onChange={handleChange}
                                        required
                                    />
                                </label>

                                <label>
                                    Payment Status
                                    <select
                                        name="status"
                                        value={form.status}
                                        onChange={handleChange}
                                    >
                                        <option>Pending</option>
                                        <option>Paid</option>
                                    </select>
                                </label>
                            </div>

                            <div className="salary-modal-actions">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                >
                                    Cancel
                                </button>
                                <button type="submit">
                                    <Save size={17} />
                                    {editingId ? "Update Salary" : "Save Salary"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Delete Confirmation */}
            {deleteId !== null && (
                <div className="salary-modal-overlay">
                    <div className="salary-delete-modal">
                        <h3>Delete Salary Record?</h3>
                        <p>Are you sure you want to delete this record?</p>
                        <div className="salary-modal-actions">
                            <button onClick={() => setDeleteId(null)}>
                                Cancel
                            </button>
                            <button className="salary-delete-confirm" onClick={confirmDelete}>
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
}

export default SalaryInformation;
