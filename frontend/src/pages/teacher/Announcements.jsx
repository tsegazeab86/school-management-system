
import { useMemo, useState } from "react";
import {
    Search,
    Plus,
    Megaphone,
    Bell,
    CalendarDays,
    Users,
    Edit,
    Trash2,
    Eye,
    X,
    Upload,
    Image as ImageIcon,
    AlertTriangle,
    Clock,
    Send,
    FileText,
    CheckCircle,
    Filter,
} from "lucide-react";

import "./Announcements.css";

const initialAnnouncements = [
    {
        id: 1,
        title: "Mathematics Examination",
        description:
            "The mathematics examination will take place next Monday. All students should prepare their notes and arrive on time.",
        className: "Grade 10A",
        priority: "Important",
        status: "Published",
        date: "2026-10-28",
        image: "",
    },
    {
        id: 2,
        title: "Assignment Submission Deadline",
        description:
            "Please submit your computer science assignment before Friday. Late submissions may not be accepted.",
        className: "Grade 10B",
        priority: "Urgent",
        status: "Published",
        date: "2026-10-27",
        image: "",
    },
    {
        id: 3,
        title: "Additional Learning Materials",
        description:
            "New learning materials have been uploaded. Please visit the Learning Materials section.",
        className: "All Classes",
        priority: "Normal",
        status: "Published",
        date: "2026-10-25",
        image: "",
    },
    {
        id: 4,
        title: "Extra Tutorial Class",
        description:
            "An additional tutorial session will be organized for students who need extra support.",
        className: "Grade 11A",
        priority: "Normal",
        status: "Draft",
        date: "2026-10-30",
        image: "",
    },
];

const emptyForm = {
    title: "",
    description: "",
    className: "All Classes",
    priority: "Normal",
    status: "Published",
    date: new Date().toISOString().slice(0, 10),
    image: "",
};

function Announcements() {
    const [announcements, setAnnouncements] = useState(
        initialAnnouncements
    );

    const [search, setSearch] = useState("");
    const [classFilter, setClassFilter] = useState("All");
    const [priorityFilter, setPriorityFilter] = useState("All");
    const [statusFilter, setStatusFilter] = useState("All");

    const [showModal, setShowModal] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [selectedAnnouncement, setSelectedAnnouncement] =
        useState(null);

    const [form, setForm] = useState(emptyForm);
    const [imageUrl, setImageUrl] = useState("");
    const [imageError, setImageError] = useState("");

    const [imageFileName, setImageFileName] = useState("");

    const publishedCount = announcements.filter(
        (item) => item.status === "Published"
    ).length;

    const draftCount = announcements.filter(
        (item) => item.status === "Draft"
    ).length;

    const urgentCount = announcements.filter(
        (item) => item.priority === "Urgent"
    ).length;

    const filteredAnnouncements = useMemo(() => {
        return announcements.filter((item) => {
            const matchesSearch =
                item.title.toLowerCase().includes(search.toLowerCase()) ||
                item.description.toLowerCase().includes(search.toLowerCase());

            const matchesClass =
                classFilter === "All" ||
                item.className === classFilter;

            const matchesPriority =
                priorityFilter === "All" ||
                item.priority === priorityFilter;

            const matchesStatus =
                statusFilter === "All" ||
                item.status === statusFilter;

            return (
                matchesSearch &&
                matchesClass &&
                matchesPriority &&
                matchesStatus
            );
        });
    }, [
        announcements,
        search,
        classFilter,
        priorityFilter,
        statusFilter,
    ]);

    const updateField = (e) => {
        const { name, value } = e.target;

        setForm((previous) => ({
            ...previous,
            [name]: value,
        }));
    };

    const openAddModal = () => {
        setEditingId(null);
        setForm({
            ...emptyForm,
            date: new Date().toISOString().slice(0, 10),
        });
        setImageUrl("");
        setImageFileName("");
        setImageError("");
        setShowModal(true);
    };

    const openEditModal = (item) => {
        setEditingId(item.id);

        setForm({
            title: item.title,
            description: item.description,
            className: item.className,
            priority: item.priority,
            status: item.status,
            date: item.date,
            image: item.image || "",
        });

        setImageUrl(item.image || "");
        setImageFileName("");
        setImageError("");
        setShowModal(true);
    };

    const handleImageUpload = (e) => {
        const file = e.target.files?.[0];

        if (!file) return;

        if (!file.type.startsWith("image/")) {
            setImageError("Please select a valid image.");
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            setImageError("Image size must be less than 5MB.");
            return;
        }

        const reader = new FileReader();

        reader.onload = () => {
            setForm((previous) => ({
                ...previous,
                image: reader.result,
            }));

            setImageUrl("");
            setImageFileName(file.name);
            setImageError("");
        };

        reader.readAsDataURL(file);
    };

    const handleImageUrl = (e) => {
        const value = e.target.value;

        setImageUrl(value);
        setImageFileName("");
        setImageError("");

        setForm((previous) => ({
            ...previous,
            image: value,
        }));
    };

    const saveAnnouncement = (e) => {
        e.preventDefault();

        if (!form.title.trim() || !form.description.trim()) {
            alert("Please enter the announcement title and description.");
            return;
        }

        if (form.image && !form.image.startsWith("data:image/") &&
            !/^https?:\/\//i.test(form.image)) {
            setImageError("Please enter a valid image URL.");
            return;
        }

        const newAnnouncement = {
            ...form,
            id: editingId || Date.now(),
            title: form.title.trim(),
            description: form.description.trim(),
        };

        if (editingId) {
            setAnnouncements((previous) =>
                previous.map((item) =>
                    item.id === editingId ? newAnnouncement : item
                )
            );
        } else {
            setAnnouncements((previous) => [
                newAnnouncement,
                ...previous,
            ]);
        }

        setShowModal(false);
        setForm(emptyForm);
        setImageUrl("");
        setImageFileName("");
    };

    const deleteAnnouncement = (id) => {
        const confirmed = window.confirm(
            "Are you sure you want to delete this announcement?"
        );

        if (!confirmed) return;

        setAnnouncements((previous) =>
            previous.filter((item) => item.id !== id)
        );
    };

    const changeStatus = (id, status) => {
        setAnnouncements((previous) =>
            previous.map((item) =>
                item.id === id ? { ...item, status } : item
            )
        );
    };

    const priorityClass = (priority) => {
        return priority.toLowerCase();
    };

    return (
        <div className="announcement-page">

            {/* Header */}
            <div className="announcement-header">
                <div>
                    <span className="announcement-breadcrumb">
                        Teacher / Announcements
                    </span>

                    <h1>Announcements</h1>

                    <p>
                        Create and share important information with your students.
                    </p>
                </div>

                <button
                    className="announcement-add-btn"
                    onClick={openAddModal}
                >
                    <Plus size={19} />
                    Create Announcement
                </button>
            </div>

            {/* Statistics */}
            <div className="announcement-stats">

                <div className="announcement-stat-card">
                    <div className="announcement-stat-icon purple">
                        <Megaphone size={24} />
                    </div>
                    <div>
                        <span>Total Announcements</span>
                        <h2>{announcements.length}</h2>
                        <small>All announcements</small>
                    </div>
                </div>

                <div className="announcement-stat-card">
                    <div className="announcement-stat-icon green">
                        <CheckCircle size={24} />
                    </div>
                    <div>
                        <span>Published</span>
                        <h2>{publishedCount}</h2>
                        <small>Published announcements</small>
                    </div>
                </div>

                <div className="announcement-stat-card">
                    <div className="announcement-stat-icon orange">
                        <FileText size={24} />
                    </div>
                    <div>
                        <span>Drafts</span>
                        <h2>{draftCount}</h2>
                        <small>Unpublished announcements</small>
                    </div>
                </div>

                <div className="announcement-stat-card">
                    <div className="announcement-stat-icon red">
                        <AlertTriangle size={24} />
                    </div>
                    <div>
                        <span>Urgent</span>
                        <h2>{urgentCount}</h2>
                        <small>Urgent announcements</small>
                    </div>
                </div>

            </div>

            {/* Announcement content */}
            <div className="announcement-content">

                <div className="announcement-content-heading">
                    <div>
                        <h2>All Announcements</h2>
                        <p>Manage your announcements and publication status.</p>
                    </div>
                </div>

                {/* Search and filters */}
                <div className="announcement-filters">

                    <div className="announcement-search">
                        <Search size={19} />
                        <input
                            placeholder="Search announcements..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>

                    <div className="announcement-filter">
                        <Filter size={17} />
                        <select
                            value={classFilter}
                            onChange={(e) => setClassFilter(e.target.value)}
                        >
                            <option value="All">All Classes</option>
                            <option>All Classes</option>
                            <option>Grade 10A</option>
                            <option>Grade 10B</option>
                            <option>Grade 11A</option>
                            <option>Grade 11B</option>
                        </select>
                    </div>

                    <div className="announcement-filter">
                        <select
                            value={priorityFilter}
                            onChange={(e) => setPriorityFilter(e.target.value)}
                        >
                            <option value="All">All Priorities</option>
                            <option>Normal</option>
                            <option>Important</option>
                            <option>Urgent</option>
                        </select>
                    </div>

                    <div className="announcement-filter">
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                        >
                            <option value="All">All Status</option>
                            <option>Published</option>
                            <option>Draft</option>
                        </select>
                    </div>

                </div>

                {/* Announcement cards */}
                <div className="announcement-grid">

                    {filteredAnnouncements.map((item) => (
                        <div className="announcement-card" key={item.id}>

                            {item.image && (
                                <div className="announcement-image">
                                    <img src={item.image} alt={item.title} />
                                </div>
                            )}

                            <div className="announcement-card-top">
                                <span className={`announcement-priority ${priorityClass(item.priority)}`}>
                                    {item.priority}
                                </span>

                                <span className={`announcement-status ${item.status.toLowerCase()}`}>
                                    {item.status}
                                </span>
                            </div>

                            <div className="announcement-card-icon">
                                <Bell size={22} />
                            </div>

                            <h3>{item.title}</h3>

                            <p className="announcement-description">
                                {item.description}
                            </p>

                            <div className="announcement-meta">

                                <span>
                                    <Users size={15} />
                                    {item.className}
                                </span>

                                <span>
                                    <CalendarDays size={15} />
                                    {item.date}
                                </span>

                            </div>

                            <div className="announcement-card-actions">

                                <button
                                    className="announcement-view-btn"
                                    onClick={() => setSelectedAnnouncement(item)}
                                >
                                    <Eye size={16} />
                                    View
                                </button>

                                <button
                                    className="announcement-edit-btn"
                                    title="Edit"
                                    onClick={() => openEditModal(item)}
                                >
                                    <Edit size={16} />
                                </button>

                                {item.status === "Draft" && (
                                    <button
                                        className="announcement-publish-btn"
                                        title="Publish"
                                        onClick={() => changeStatus(item.id, "Published")}
                                    >
                                        <Send size={16} />
                                    </button>
                                )}

                                <button
                                    className="announcement-delete-btn"
                                    title="Delete"
                                    onClick={() => deleteAnnouncement(item.id)}
                                >
                                    <Trash2 size={16} />
                                </button>

                            </div>

                        </div>
                    ))}

                    {filteredAnnouncements.length === 0 && (
                        <div className="announcement-empty">
                            <Megaphone size={42} />
                            <h3>No announcements found</h3>
                            <p>Try changing your filters or create an announcement.</p>
                        </div>
                    )}

                </div>

                <div className="announcement-results">
                    Showing {filteredAnnouncements.length} of {announcements.length} announcements
                </div>

            </div>

            {/* Add/Edit modal */}
            {showModal && (
                <div
                    className="announcement-modal-overlay"
                    onClick={() => setShowModal(false)}
                >
                    <div
                        className="announcement-modal"
                        onClick={(e) => e.stopPropagation()}
                    >

                        <div className="announcement-modal-header">
                            <div>
                                <h2>
                                    {editingId ? "Edit Announcement" : "Create Announcement"}
                                </h2>
                                <p>Enter the announcement details below.</p>
                            </div>

                            <button
                                type="button"
                                onClick={() => setShowModal(false)}
                            >
                                <X size={22} />
                            </button>
                        </div>

                        <form onSubmit={saveAnnouncement}>

                            <div className="announcement-form-group">
                                <label>Announcement Title *</label>
                                <input
                                    name="title"
                                    value={form.title}
                                    onChange={updateField}
                                    placeholder="Enter announcement title"
                                    required
                                />
                            </div>

                            <div className="announcement-form-group">
                                <label>Description *</label>
                                <textarea
                                    name="description"
                                    value={form.description}
                                    onChange={updateField}
                                    rows="4"
                                    placeholder="Write your announcement..."
                                    required
                                />
                            </div>

                            <div className="announcement-form-row">

                                <div className="announcement-form-group">
                                    <label>Target Class</label>
                                    <select
                                        name="className"
                                        value={form.className}
                                        onChange={updateField}
                                    >
                                        <option>All Classes</option>
                                        <option>Grade 10A</option>
                                        <option>Grade 10B</option>
                                        <option>Grade 11A</option>
                                        <option>Grade 11B</option>
                                    </select>
                                </div>

                                <div className="announcement-form-group">
                                    <label>Priority</label>
                                    <select
                                        name="priority"
                                        value={form.priority}
                                        onChange={updateField}
                                    >
                                        <option>Normal</option>
                                        <option>Important</option>
                                        <option>Urgent</option>
                                    </select>
                                </div>

                            </div>

                            <div className="announcement-form-row">

                                <div className="announcement-form-group">
                                    <label>Publication Date</label>
                                    <input
                                        type="date"
                                        name="date"
                                        value={form.date}
                                        onChange={updateField}
                                        required
                                    />
                                </div>

                                <div className="announcement-form-group">
                                    <label>Status</label>
                                    <select
                                        name="status"
                                        value={form.status}
                                        onChange={updateField}
                                    >
                                        <option>Published</option>
                                        <option>Draft</option>
                                    </select>
                                </div>

                            </div>

                            {/* Image upload */}
                            <div className="announcement-form-group">
                                <label>Announcement Image (Optional)</label>

                                <div className="announcement-image-upload">

                                    {form.image ? (
                                        <img
                                            src={form.image}
                                            alt="Announcement preview"
                                            onError={() => setImageError("Unable to load this image.")}
                                        />
                                    ) : (
                                        <ImageIcon size={28} />
                                    )}

                                    <div>
                                        <label className="announcement-upload-btn">
                                            <Upload size={16} />
                                            Upload Image

                                            <input
                                                type="file"
                                                accept="image/*"
                                                hidden
                                                onChange={handleImageUpload}
                                            />
                                        </label>

                                        <span>
                                            {imageFileName || "PNG, JPG or JPEG. Maximum 5MB."}
                                        </span>
                                    </div>

                                </div>
                            </div>

                            <div className="announcement-form-group">
                                <label>Or enter Image URL</label>

                                <div className="announcement-url-input">
                                    <ImageIcon size={18} />
                                    <input
                                        type="url"
                                        placeholder="https://example.com/image.jpg"
                                        value={imageUrl}
                                        onChange={handleImageUrl}
                                    />
                                </div>
                            </div>

                            {imageError && (
                                <p className="announcement-image-error">
                                    {imageError}
                                </p>
                            )}

                            <div className="announcement-modal-footer">

                                <button
                                    type="button"
                                    className="announcement-cancel-btn"
                                    onClick={() => setShowModal(false)}
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    className="announcement-save-btn"
                                >
                                    {editingId ? "Update Announcement" : "Save Announcement"}
                                </button>

                            </div>

                        </form>

                    </div>
                </div>
            )}

            {/* View modal */}
            {selectedAnnouncement && (
                <div
                    className="announcement-modal-overlay"
                    onClick={() => setSelectedAnnouncement(null)}
                >
                    <div
                        className="announcement-view-modal"
                        onClick={(e) => e.stopPropagation()}
                    >

                        <button
                            className="announcement-view-close"
                            onClick={() => setSelectedAnnouncement(null)}
                        >
                            <X size={22} />
                        </button>

                        {selectedAnnouncement.image && (
                            <img
                                className="announcement-view-image"
                                src={selectedAnnouncement.image}
                                alt={selectedAnnouncement.title}
                            />
                        )}

                        <span className={`announcement-priority ${priorityClass(selectedAnnouncement.priority)}`}>
                            {selectedAnnouncement.priority}
                        </span>

                        <h2>{selectedAnnouncement.title}</h2>

                        <p>{selectedAnnouncement.description}</p>

                        <div className="announcement-view-info">
                            <span>
                                <Users size={17} />
                                {selectedAnnouncement.className}
                            </span>

                            <span>
                                <CalendarDays size={17} />
                                {selectedAnnouncement.date}
                            </span>

                            <span>
                                <Clock size={17} />
                                {selectedAnnouncement.status}
                            </span>
                        </div>

                        <button
                            className="announcement-save-btn announcement-close-btn"
                            onClick={() => setSelectedAnnouncement(null)}
                        >
                            Close
                        </button>

                    </div>
                </div>
            )}

        </div>
    );
}

export default Announcements;
