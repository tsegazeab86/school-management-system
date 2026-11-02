
import { useState } from "react";
import {
    Plus, Search, Megaphone, CalendarDays,
    Users, Edit, Trash2, X, Save, Eye
} from "lucide-react";

import "../../styles/registrar/Announcements.css";

const initialAnnouncements = [
    {
        id: 1,
        title: "School Registration Announcement",
        message: "Student registration is now open for the new academic year.",
        audience: "Students",
        date: "2026-11-02",
        priority: "Important",
        status: "Published",
        author: "School Admin",
    },
    {
        id: 2,
        title: "Staff Meeting",
        message: "All teachers are invited to attend the monthly staff meeting.",
        audience: "Teachers",
        date: "2026-11-04",
        priority: "Normal",
        status: "Published",
        author: "Registrar",
    },
    {
        id: 3,
        title: "Parent Meeting",
        message: "Parents are invited to discuss student academic progress.",
        audience: "Parents",
        date: "2026-11-08",
        priority: "Important",
        status: "Draft",
        author: "Registrar",
    },
];

function Announcements() {
    const [announcements, setAnnouncements] = useState(initialAnnouncements);
    const [search, setSearch] = useState("");
    const [filter, setFilter] = useState("All");
    const [showModal, setShowModal] = useState(false);
    const [viewItem, setViewItem] = useState(null);
    const [editingId, setEditingId] = useState(null);
    const [deleteId, setDeleteId] = useState(null);

    const emptyForm = {
        title: "",
        message: "",
        audience: "Everyone",
        date: "",
        priority: "Normal",
        status: "Draft",
    };

    const [form, setForm] = useState(emptyForm);

    const filteredAnnouncements = announcements.filter((item) => {
        const matchesSearch =
            item.title.toLowerCase().includes(search.toLowerCase()) ||
            item.message.toLowerCase().includes(search.toLowerCase());

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
            title: item.title,
            message: item.message,
            audience: item.audience,
            date: item.date,
            priority: item.priority,
            status: item.status,
        });
        setShowModal(true);
    };

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (editingId) {
            setAnnouncements((previous) =>
                previous.map((item) =>
                    item.id === editingId
                        ? { ...item, ...form }
                        : item
                )
            );
        } else {
            setAnnouncements((previous) => [
                ...previous,
                {
                    ...form,
                    id: Date.now(),
                    author: "Registrar",
                },
            ]);
        }

        setShowModal(false);
        setEditingId(null);
        setForm(emptyForm);
    };

    const confirmDelete = () => {
        setAnnouncements((previous) =>
            previous.filter((item) => item.id !== deleteId)
        );
        setDeleteId(null);
    };

    const togglePublish = (id) => {
        setAnnouncements((previous) =>
            previous.map((item) =>
                item.id === id
                    ? {
                        ...item,
                        status: item.status === "Published" ? "Draft" : "Published",
                    }
                    : item
            )
        );
    };

    return (
        <div className="announcement-page">

            <div className="announcement-heading">
                <div>
                    <span>SCHOOL COMMUNICATION</span>
                    <h2>Announcements</h2>
                    <p>Create and manage school announcements.</p>
                </div>

                <button className="announcement-add-btn" onClick={openAddModal}>
                    <Plus size={18} /> Create Announcement
                </button>
            </div>

            {/* Statistics */}
            <div className="announcement-stats">
                <div className="announcement-stat">
                    <Megaphone />
                    <div>
                        <span>Total Announcements</span>
                        <h3>{announcements.length}</h3>
                    </div>
                </div>

                <div className="announcement-stat">
                    <Eye />
                    <div>
                        <span>Published</span>
                        <h3>{announcements.filter(a => a.status === "Published").length}</h3>
                    </div>
                </div>

                <div className="announcement-stat">
                    <Edit />
                    <div>
                        <span>Drafts</span>
                        <h3>{announcements.filter(a => a.status === "Draft").length}</h3>
                    </div>
                </div>

                <div className="announcement-stat">
                    <Users />
                    <div>
                        <span>Target Groups</span>
                        <h3>{new Set(announcements.map(a => a.audience)).size}</h3>
                    </div>
                </div>
            </div>

            {/* Search and Filter */}
            <div className="announcement-toolbar">
                <div className="announcement-search">
                    <Search size={18} />
                    <input
                        placeholder="Search announcements..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>

                <select value={filter} onChange={(e) => setFilter(e.target.value)}>
                    <option value="All">All Status</option>
                    <option value="Published">Published</option>
                    <option value="Draft">Draft</option>
                </select>
            </div>

            {/* Announcement Cards */}
            <div className="announcement-grid">
                {filteredAnnouncements.map((item) => (
                    <div className="announcement-card" key={item.id}>
                        <div className="announcement-card-top">
                            <div className="announcement-card-icon">
                                <Megaphone size={22} />
                            </div>

                            <span className={`announcement-priority ${item.priority.toLowerCase()}`}>
                                {item.priority}
                            </span>
                        </div>

                        <h3>{item.title}</h3>
                        <p className="announcement-message">{item.message}</p>

                        <div className="announcement-meta">
                            <span><Users size={15} /> {item.audience}</span>
                            <span><CalendarDays size={15} /> {item.date || "No date"}</span>
                        </div>

                        <div className="announcement-card-footer">
                            <span className={`announcement-status ${item.status.toLowerCase()}`}>
                                {item.status}
                            </span>

                            <div className="announcement-actions">
                                <button title="View" onClick={() => setViewItem(item)}>
                                    <Eye size={16} />
                                </button>
                                <button title="Edit" onClick={() => openEditModal(item)}>
                                    <Edit size={16} />
                                </button>
                                <button title="Delete" onClick={() => setDeleteId(item.id)}>
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>

                        <button
                            className="announcement-publish-btn"
                            onClick={() => togglePublish(item.id)}
                        >
                            {item.status === "Published" ? "Move to Draft" : "Publish"}
                        </button>
                    </div>
                ))}

                {filteredAnnouncements.length === 0 && (
                    <div className="announcement-empty">
                        No announcements found.
                    </div>
                )}
            </div>

            {/* Add/Edit Modal */}
            {showModal && (
                <div className="announcement-overlay">
                    <div className="announcement-modal">
                        <div className="announcement-modal-header">
                            <div>
                                <h3>{editingId ? "Edit Announcement" : "Create Announcement"}</h3>
                                <p>Enter announcement details.</p>
                            </div>
                            <button type="button" onClick={() => setShowModal(false)}>
                                <X />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit}>
                            <div className="announcement-form-grid">
                                <label className="announcement-full">
                                    Announcement Title
                                    <input
                                        name="title"
                                        value={form.title}
                                        onChange={handleChange}
                                        required
                                        placeholder="Enter title"
                                    />
                                </label>

                                <label className="announcement-full">
                                    Message
                                    <textarea
                                        name="message"
                                        value={form.message}
                                        onChange={handleChange}
                                        required
                                        placeholder="Write announcement..."
                                    />
                                </label>

                                <label>
                                    Target Audience
                                    <select name="audience" value={form.audience} onChange={handleChange}>
                                        <option>Everyone</option>
                                        <option>Students</option>
                                        <option>Teachers</option>
                                        <option>Parents</option>
                                        <option>Staff</option>
                                    </select>
                                </label>

                                <label>
                                    Date
                                    <input
                                        type="date"
                                        name="date"
                                        value={form.date}
                                        onChange={handleChange}
                                        required
                                    />
                                </label>

                                <label>
                                    Priority
                                    <select name="priority" value={form.priority} onChange={handleChange}>
                                        <option>Normal</option>
                                        <option>Important</option>
                                        <option>Urgent</option>
                                    </select>
                                </label>

                                <label>
                                    Status
                                    <select name="status" value={form.status} onChange={handleChange}>
                                        <option>Draft</option>
                                        <option>Published</option>
                                    </select>
                                </label>
                            </div>

                            <div className="announcement-modal-actions">
                                <button type="button" onClick={() => setShowModal(false)}>
                                    Cancel
                                </button>
                                <button type="submit">
                                    <Save size={17} />
                                    {editingId ? "Update" : "Save Announcement"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* View Modal */}
            {viewItem && (
                <div className="announcement-overlay">
                    <div className="announcement-view-modal">
                        <button className="announcement-view-close" onClick={() => setViewItem(null)}>
                            <X />
                        </button>
                        <Megaphone size={30} />
                        <h3>{viewItem.title}</h3>
                        <p>{viewItem.message}</p>
                        <div className="announcement-view-details">
                            <span>Audience: {viewItem.audience}</span>
                            <span>Date: {viewItem.date || "Not set"}</span>
                            <span>Priority: {viewItem.priority}</span>
                            <span>Status: {viewItem.status}</span>
                            <span>Created by: {viewItem.author}</span>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirmation */}
            {deleteId !== null && (
                <div className="announcement-overlay">
                    <div className="announcement-delete-modal">
                        <h3>Delete Announcement?</h3>
                        <p>Are you sure you want to delete this announcement?</p>
                        <div className="announcement-modal-actions">
                            <button onClick={() => setDeleteId(null)}>Cancel</button>
                            <button className="announcement-delete-confirm" onClick={confirmDelete}>
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Announcements;
