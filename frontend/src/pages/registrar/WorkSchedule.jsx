
import { useState } from "react";
import {
    CalendarDays, Clock, Users, Plus,
    Search, Edit, Trash2, X, Save
} from "lucide-react";

import "../../styles/registrar/WorkSchedule.css";

const initialSchedules = [
    {
        id: 1,
        name: "Abebe Kebede",
        role: "Teacher",
        department: "Science",
        day: "Monday - Friday",
        start: "08:00",
        end: "05:00",
        shift: "Morning",
    },
    {
        id: 2,
        name: "Sara Tadesse",
        role: "Teacher",
        department: "Mathematics",
        day: "Monday - Friday",
        start: "08:00",
        end: "05:00",
        shift: "Morning",
    },
    {
        id: 3,
        name: "Dawit Bekele",
        role: "Accountant",
        department: "Finance",
        day: "Monday - Friday",
        start: "09:00",
        end: "06:00",
        shift: "Day",
    },
    {
        id: 4,
        name: "Hana Alemu",
        role: "Librarian",
        department: "Library",
        day: "Monday - Saturday",
        start: "07:00",
        end: "03:00",
        shift: "Morning",
    },
];

function WorkSchedule() {
    const [schedules, setSchedules] = useState(initialSchedules);
    const [search, setSearch] = useState("");
    const [showModal, setShowModal] = useState(false);
    const [editingId, setEditingId] = useState(null);

    const emptyForm = {
        name: "",
        role: "",
        department: "",
        day: "Monday - Friday",
        start: "08:00",
        end: "05:00",
        shift: "Morning",
    };

    const [form, setForm] = useState(emptyForm);

    const filteredSchedules = schedules.filter((item) =>
        item.name.toLowerCase().includes(search.toLowerCase()) ||
        item.department.toLowerCase().includes(search.toLowerCase())
    );

    const openAddModal = () => {
        setEditingId(null);
        setForm(emptyForm);
        setShowModal(true);
    };

    const openEditModal = (item) => {
        setEditingId(item.id);
        setForm({
            name: item.name,
            role: item.role,
            department: item.department,
            day: item.day,
            start: item.start,
            end: item.end,
            shift: item.shift,
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
            setSchedules((previous) =>
                previous.map((item) =>
                    item.id === editingId
                        ? { ...form, id: editingId }
                        : item
                )
            );
        } else {
            setSchedules((previous) => [
                ...previous,
                { ...form, id: Date.now() },
            ]);
        }

        setShowModal(false);
        setForm(emptyForm);
        setEditingId(null);
    };

    const handleDelete = (id) => {
        const confirmed = window.confirm(
            "Are you sure you want to delete this work schedule?"
        );

        if (confirmed) {
            setSchedules((previous) =>
                previous.filter((item) => item.id !== id)
            );
        }
    };

    return (
        <div className="work-schedule-page">

            <div className="work-schedule-heading">
                <div>
                    <span className="work-schedule-eyebrow">
                        STAFF MANAGEMENT
                    </span>
                    <h2>Work Schedule</h2>
                    <p>
                        Manage staff working days, shifts and working hours.
                    </p>
                </div>

                <button
                    className="work-add-btn"
                    onClick={openAddModal}
                >
                    <Plus size={18} />
                    Add Schedule
                </button>
            </div>

            <div className="work-schedule-stats">

                <div className="work-stat-card">
                    <div className="work-stat-icon purple">
                        <Users size={22} />
                    </div>
                    <div>
                        <span>Total Schedules</span>
                        <h3>{schedules.length}</h3>
                    </div>
                </div>

                <div className="work-stat-card">
                    <div className="work-stat-icon blue">
                        <CalendarDays size={22} />
                    </div>
                    <div>
                        <span>Morning Shifts</span>
                        <h3>
                            {schedules.filter(
                                (item) => item.shift === "Morning"
                            ).length}
                        </h3>
                    </div>
                </div>

                <div className="work-stat-card">
                    <div className="work-stat-icon green">
                        <Clock size={22} />
                    </div>
                    <div>
                        <span>Day Shifts</span>
                        <h3>
                            {schedules.filter(
                                (item) => item.shift === "Day"
                            ).length}
                        </h3>
                    </div>
                </div>

            </div>

            <div className="work-toolbar">
                <div className="work-search">
                    <Search size={18} />
                    <input
                        type="text"
                        placeholder="Search staff or department..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
            </div>

            <div className="work-table-card">

                <div className="work-table-heading">
                    <div>
                        <h3>Staff Work Schedules</h3>
                        <p>Manage employee working hours</p>
                    </div>
                    <CalendarDays size={24} />
                </div>

                <div className="work-table-wrap">
                    <table className="work-table">
                        <thead>
                            <tr>
                                <th>Staff Member</th>
                                <th>Department</th>
                                <th>Working Days</th>
                                <th>Start Time</th>
                                <th>End Time</th>
                                <th>Shift</th>
                                <th>Actions</th>
                            </tr>
                        </thead>

                        <tbody>
                            {filteredSchedules.map((item) => (
                                <tr key={item.id}>
                                    <td>
                                        <div className="work-staff-info">
                                            <img
                                                className="work-staff-avatar"
                                                src={
                                                    item.image ||
                                                    `https://ui-avatars.com/api/?name=${encodeURIComponent(
                                                        item.name
                                                    )}&background=E9E3FF&color=7059D5&size=128&bold=true`
                                                }
                                                alt={item.name}
                                                onError={(e) => {
                                                    e.currentTarget.src =
                                                        "https://ui-avatars.com/api/?name=Staff&background=E9E3FF&color=7059D5&size=128";
                                                }}
                                            />

                                            <div className="work-staff-details">
                                                <strong>{item.name}</strong>
                                                <small>{item.role}</small>
                                            </div>
                                        </div>
                                    </td>
                                    <td>{item.department}</td>
                                    <td>{item.day}</td>
                                    <td>{item.start}</td>
                                    <td>{item.end}</td>
                                    <td>
                                        <span className={`work-shift ${item.shift.toLowerCase()}`}>
                                            {item.shift}
                                        </span>
                                    </td>
                                    <td>
                                        <div className="work-actions">
                                            <button
                                                title="Edit"
                                                onClick={() => openEditModal(item)}
                                            >
                                                <Edit size={16} />
                                            </button>
                                            <button
                                                title="Delete"
                                                onClick={() => handleDelete(item.id)}
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}

                            {filteredSchedules.length === 0 && (
                                <tr>
                                    <td colSpan="7" className="work-empty">
                                        No schedules found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {showModal && (
                <div className="work-modal-overlay">
                    <div className="work-modal">

                        <div className="work-modal-header">
                            <div>
                                <h3>
                                    {editingId ? "Edit Schedule" : "Add Work Schedule"}
                                </h3>
                                <p>Enter staff working information.</p>
                            </div>

                            <button onClick={() => setShowModal(false)}>
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit}>

                            <div className="work-form-grid">

                                <label>
                                    Staff Name
                                    <input
                                        name="name"
                                        value={form.name}
                                        onChange={handleChange}
                                        placeholder="Enter staff name"
                                        required
                                    />
                                </label>

                                <label>
                                    Role
                                    <input
                                        name="role"
                                        value={form.role}
                                        onChange={handleChange}
                                        placeholder="Enter role"
                                        required
                                    />
                                </label>

                                <label>
                                    Department
                                    <input
                                        name="department"
                                        value={form.department}
                                        onChange={handleChange}
                                        placeholder="Enter department"
                                        required
                                    />
                                </label>

                                <label>
                                    Working Days
                                    <select
                                        name="day"
                                        value={form.day}
                                        onChange={handleChange}
                                    >
                                        <option>Monday - Friday</option>
                                        <option>Monday - Saturday</option>
                                        <option>Sunday - Thursday</option>
                                    </select>
                                </label>

                                <label>
                                    Start Time
                                    <input
                                        type="time"
                                        name="start"
                                        value={form.start}
                                        onChange={handleChange}
                                        required
                                    />
                                </label>

                                <label>
                                    End Time
                                    <input
                                        type="time"
                                        name="end"
                                        value={form.end}
                                        onChange={handleChange}
                                        required
                                    />
                                </label>

                                <label className="work-full-width">
                                    Shift
                                    <select
                                        name="shift"
                                        value={form.shift}
                                        onChange={handleChange}
                                    >
                                        <option>Morning</option>
                                        <option>Day</option>
                                        <option>Evening</option>
                                    </select>
                                </label>

                            </div>

                            <div className="work-modal-actions">
                                <button
                                    type="button"
                                    className="work-cancel-btn"
                                    onClick={() => setShowModal(false)}
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    className="work-save-btn"
                                >
                                    <Save size={17} />
                                    {editingId ? "Update Schedule" : "Save Schedule"}
                                </button>
                            </div>

                        </form>
                    </div>
                </div>
            )}

        </div>
    );
}

export default WorkSchedule;
