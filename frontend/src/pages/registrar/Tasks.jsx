
import { useState } from "react";
import {
    ClipboardList, Plus, Search, Edit, Trash2,
    X, Save, Clock, CheckCircle, AlertCircle,
    CalendarDays, 
    // User
} from "lucide-react";

import "../../styles/registrar/Tasks.css";

const initialTasks = [
    {
        id: 1,
        title: "Verify New Student Documents",
        description: "Review and verify newly registered student documents.",
        assignedTo: "Abebe Kebede",
        role: "Registrar",
        priority: "High",
        status: "Pending",
        dueDate: "2026-11-05",
    },
    {
        id: 2,
        title: "Prepare Student Records",
        description: "Organize student academic and personal records.",
        assignedTo: "Sara Tadesse",
        role: "Staff",
        priority: "Medium",
        status: "In Progress",
        dueDate: "2026-11-08",
    },
    {
        id: 3,
        title: "Update Grade Information",
        description: "Update grade and section information.",
        assignedTo: "Dawit Bekele",
        role: "Registrar",
        priority: "Low",
        status: "Completed",
        dueDate: "2026-11-02",
    },
];

function Tasks() {
    const [tasks, setTasks] = useState(initialTasks);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("All");
    const [showModal, setShowModal] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [deleteId, setDeleteId] = useState(null);

    const emptyForm = {
        title: "",
        description: "",
        assignedTo: "",
        role: "",
        priority: "Medium",
        status: "Pending",
        dueDate: "",
    };

    const [form, setForm] = useState(emptyForm);

    const filteredTasks = tasks.filter((task) => {
        const matchesSearch =
            task.title.toLowerCase().includes(search.toLowerCase()) ||
            task.assignedTo.toLowerCase().includes(search.toLowerCase());

        const matchesStatus =
            statusFilter === "All" || task.status === statusFilter;

        return matchesSearch && matchesStatus;
    });

    const openAddModal = () => {
        setEditingId(null);
        setForm(emptyForm);
        setShowModal(true);
    };

    const openEditModal = (task) => {
        setEditingId(task.id);
        setForm({
            title: task.title,
            description: task.description,
            assignedTo: task.assignedTo,
            role: task.role,
            priority: task.priority,
            status: task.status,
            dueDate: task.dueDate,
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

        if (editingId) {
            setTasks((previous) =>
                previous.map((task) =>
                    task.id === editingId
                        ? { ...form, id: editingId }
                        : task
                )
            );
        } else {
            setTasks((previous) => [
                ...previous,
                { ...form, id: Date.now() },
            ]);
        }

        setShowModal(false);
        setForm(emptyForm);
        setEditingId(null);
    };

    const confirmDelete = () => {
        setTasks((previous) =>
            previous.filter((task) => task.id !== deleteId)
        );
        setDeleteId(null);
    };

    const updateStatus = (id, status) => {
        setTasks((previous) =>
            previous.map((task) =>
                task.id === id ? { ...task, status } : task
            )
        );
    };

    const getAvatar = (name) =>
        `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=E9E3FF&color=7059D5&size=128&bold=true`;

    return (
        <div className="tasks-page">

            {/* Page Heading */}
            <div className="tasks-heading">
                <div>
                    <span className="tasks-eyebrow">STAFF MANAGEMENT</span>
                    <h2>Tasks Management</h2>
                    <p>Assign, track and manage staff tasks.</p>
                </div>

                <button className="tasks-add-btn" onClick={openAddModal}>
                    <Plus size={18} />
                    Add New Task
                </button>
            </div>

            {/* Statistics */}
            <div className="tasks-stats">

                <div className="tasks-stat-card">
                    <div className="tasks-stat-icon purple">
                        <ClipboardList size={23} />
                    </div>
                    <div>
                        <span>Total Tasks</span>
                        <h3>{tasks.length}</h3>
                    </div>
                </div>

                <div className="tasks-stat-card">
                    <div className="tasks-stat-icon orange">
                        <Clock size={23} />
                    </div>
                    <div>
                        <span>Pending</span>
                        <h3>{tasks.filter(t => t.status === "Pending").length}</h3>
                    </div>
                </div>

                <div className="tasks-stat-card">
                    <div className="tasks-stat-icon blue">
                        <AlertCircle size={23} />
                    </div>
                    <div>
                        <span>In Progress</span>
                        <h3>{tasks.filter(t => t.status === "In Progress").length}</h3>
                    </div>
                </div>

                <div className="tasks-stat-card">
                    <div className="tasks-stat-icon green">
                        <CheckCircle size={23} />
                    </div>
                    <div>
                        <span>Completed</span>
                        <h3>{tasks.filter(t => t.status === "Completed").length}</h3>
                    </div>
                </div>

            </div>

            {/* Toolbar */}
            <div className="tasks-toolbar">
                <div className="tasks-search">
                    <Search size={18} />
                    <input
                        type="text"
                        placeholder="Search task or staff..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>

                <select
                    className="tasks-filter"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                >
                    <option value="All">All Status</option>
                    <option value="Pending">Pending</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Completed">Completed</option>
                </select>
            </div>

            {/* Tasks Table */}
            <div className="tasks-table-card">
                <div className="tasks-table-heading">
                    <div>
                        <h3>All Tasks</h3>
                        <p>Monitor assigned staff responsibilities</p>
                    </div>
                    <ClipboardList size={24} />
                </div>

                <div className="tasks-table-wrap">
                    <table className="tasks-table">
                        <thead>
                            <tr>
                                <th>Task</th>
                                <th>Assigned To</th>
                                <th>Priority</th>
                                <th>Due Date</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>

                        <tbody>
                            {filteredTasks.map((task) => (
                                <tr key={task.id}>
                                    <td>
                                        <div className="task-title-cell">
                                            <strong>{task.title}</strong>
                                            <small>{task.description}</small>
                                        </div>
                                    </td>

                                    <td>
                                        <div className="task-assignee">
                                            <img
                                                src={getAvatar(task.assignedTo)}
                                                alt={task.assignedTo}
                                                className="task-avatar"
                                                onError={(e) => {
                                                    e.currentTarget.onerror = null;
                                                    e.currentTarget.src =
                                                        "https://ui-avatars.com/api/?name=Staff&background=E9E3FF&color=7059D5";
                                                }}
                                            />
                                            <div>
                                                <strong>{task.assignedTo}</strong>
                                                <small>{task.role}</small>
                                            </div>
                                        </div>
                                    </td>

                                    <td>
                                        <span className={`task-priority ${task.priority.toLowerCase()}`}>
                                            {task.priority}
                                        </span>
                                    </td>

                                    <td>
                                        <span className="task-date">
                                            <CalendarDays size={15} />
                                            {task.dueDate}
                                        </span>
                                    </td>

                                    <td>
                                        <select
                                            className={`task-status-select ${task.status.toLowerCase().replace(" ", "-")}`}
                                            value={task.status}
                                            onChange={(e) => updateStatus(task.id, e.target.value)}
                                        >
                                            <option>Pending</option>
                                            <option>In Progress</option>
                                            <option>Completed</option>
                                        </select>
                                    </td>

                                    <td>
                                        <div className="tasks-actions">
                                            <button
                                                title="Edit"
                                                onClick={() => openEditModal(task)}
                                            >
                                                <Edit size={16} />
                                            </button>
                                            <button
                                                title="Delete"
                                                onClick={() => setDeleteId(task.id)}
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}

                            {filteredTasks.length === 0 && (
                                <tr>
                                    <td colSpan="6" className="tasks-empty">
                                        No tasks found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Add / Edit Modal */}
            {showModal && (
                <div className="tasks-modal-overlay">
                    <div className="tasks-modal">
                        <div className="tasks-modal-header">
                            <div>
                                <h3>{editingId ? "Edit Task" : "Create New Task"}</h3>
                                <p>Enter task details and assign responsibility.</p>
                            </div>
                            <button onClick={() => setShowModal(false)}>
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit}>
                            <div className="tasks-form-grid">

                                <label className="tasks-full-width">
                                    Task Title
                                    <input
                                        name="title"
                                        value={form.title}
                                        onChange={handleChange}
                                        placeholder="Enter task title"
                                        required
                                    />
                                </label>

                                <label className="tasks-full-width">
                                    Description
                                    <textarea
                                        name="description"
                                        value={form.description}
                                        onChange={handleChange}
                                        placeholder="Describe the task..."
                                        required
                                    />
                                </label>

                                <label>
                                    Assigned Staff
                                    <input
                                        name="assignedTo"
                                        value={form.assignedTo}
                                        onChange={handleChange}
                                        placeholder="Staff name"
                                        required
                                    />
                                </label>

                                <label>
                                    Staff Role
                                    <input
                                        name="role"
                                        value={form.role}
                                        onChange={handleChange}
                                        placeholder="Enter role"
                                        required
                                    />
                                </label>

                                <label>
                                    Priority
                                    <select name="priority" value={form.priority} onChange={handleChange}>
                                        <option>Low</option>
                                        <option>Medium</option>
                                        <option>High</option>
                                    </select>
                                </label>

                                <label>
                                    Status
                                    <select name="status" value={form.status} onChange={handleChange}>
                                        <option>Pending</option>
                                        <option>In Progress</option>
                                        <option>Completed</option>
                                    </select>
                                </label>

                                <label className="tasks-full-width">
                                    Due Date
                                    <input
                                        type="date"
                                        name="dueDate"
                                        value={form.dueDate}
                                        onChange={handleChange}
                                        required
                                    />
                                </label>

                            </div>

                            <div className="tasks-modal-actions">
                                <button
                                    type="button"
                                    className="tasks-cancel-btn"
                                    onClick={() => setShowModal(false)}
                                >
                                    Cancel
                                </button>
                                <button type="submit" className="tasks-save-btn">
                                    <Save size={17} />
                                    {editingId ? "Update Task" : "Save Task"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {deleteId !== null && (
                <div className="tasks-modal-overlay">
                    <div className="tasks-delete-modal">
                        <div className="tasks-delete-icon">
                            <Trash2 size={25} />
                        </div>
                        <h3>Delete Task?</h3>
                        <p>Are you sure you want to delete this task?</p>
                        <div className="tasks-modal-actions">
                            <button
                                className="tasks-cancel-btn"
                                onClick={() => setDeleteId(null)}
                            >
                                Cancel
                            </button>
                            <button
                                className="tasks-delete-confirm"
                                onClick={confirmDelete}
                            >
                                Delete Task
                            </button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
}

export default Tasks;
