
import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Search,
    Megaphone,
    CalendarDays,
    Clock,
    X,
    Bell,
    Pin,
    BookOpen,
    PartyPopper,
    AlertCircle,
    CheckCircle,
    Filter,
} from "lucide-react";
import "./ParentAnnouncements.css";

const initialAnnouncements = [
    {
        id: 1,
        title: "First Semester Examination Schedule",
        category: "Academic",
        priority: "Important",
        date: "2026-11-05",
        time: "09:00 AM",
        author: "Academic Office",
        description:
            "The school would like to inform all parents that the first semester examination will begin soon. Please encourage your children to prepare properly and attend all revision sessions.",
        pinned: true,
        read: false,
    },
    {
        id: 2,
        title: "Parent-Teacher Meeting",
        category: "Meeting",
        priority: "Important",
        date: "2026-11-08",
        time: "10:00 AM",
        author: "School Administration",
        description:
            "Parents are invited to attend the upcoming parent-teacher meeting. The meeting will discuss student academic performance, attendance, and overall progress.",
        pinned: true,
        read: false,
    },
    {
        id: 3,
        title: "School Sports Day",
        category: "Event",
        priority: "Normal",
        date: "2026-11-12",
        time: "08:30 AM",
        author: "Sports Department",
        description:
            "Our annual school sports day will take place on the school playground. Parents are welcome to attend and support their children.",
        pinned: false,
        read: true,
    },
    {
        id: 4,
        title: "Tuition Fee Payment Reminder",
        category: "Finance",
        priority: "Important",
        date: "2026-11-15",
        time: "08:00 AM",
        author: "Finance Office",
        description:
            "This is a reminder for parents to review their children's outstanding school fees and contact the finance office if they need assistance.",
        pinned: false,
        read: false,
    },
    {
        id: 5,
        title: "Library Reading Program",
        category: "Academic",
        priority: "Normal",
        date: "2026-11-18",
        time: "11:00 AM",
        author: "School Library",
        description:
            "Students are encouraged to participate in the school reading program to improve their reading habits and knowledge.",
        pinned: false,
        read: true,
    },
];

const categories = [
    "All",
    "Academic",
    "Meeting",
    "Event",
    "Finance",
];

function ParentAnnouncements() {
    const [announcements, setAnnouncements] = useState(
        initialAnnouncements
    );
    const [search, setSearch] = useState("");
    const [category, setCategory] = useState("All");
    const [status, setStatus] = useState("All");
    const [selected, setSelected] = useState(null);

    const filteredAnnouncements = useMemo(() => {
        return announcements.filter((item) => {
            const matchesSearch =
                item.title.toLowerCase().includes(search.toLowerCase()) ||
                item.description.toLowerCase().includes(search.toLowerCase()) ||
                item.author.toLowerCase().includes(search.toLowerCase());

            const matchesCategory =
                category === "All" || item.category === category;

            const matchesStatus =
                status === "All" ||
                (status === "Unread" && !item.read) ||
                (status === "Read" && item.read);

            return matchesSearch && matchesCategory && matchesStatus;
        });
    }, [announcements, search, category, status]);

    const unreadCount = announcements.filter(
        (item) => !item.read
    ).length;

    const markAsRead = (id) => {
        setAnnouncements((previous) =>
            previous.map((item) =>
                item.id === id ? { ...item, read: true } : item
            )
        );
    };

    const openAnnouncement = (item) => {
        markAsRead(item.id);
        setSelected(item);
    };

    const markAllAsRead = () => {
        setAnnouncements((previous) =>
            previous.map((item) => ({ ...item, read: true }))
        );
    };

    const getCategoryIcon = (value) => {
        switch (value) {
            case "Academic":
                return <BookOpen size={19} />;
            case "Meeting":
                return <CalendarDays size={19} />;
            case "Event":
                return <PartyPopper size={19} />;
            case "Finance":
                return <AlertCircle size={19} />;
            default:
                return <Megaphone size={19} />;
        }
    };

    return (
        <div className="parent-announcements">
            {/* Header */}
            <div className="announcement-header">
                <div>
                    <span className="announcement-label">
                        PARENT PORTAL
                    </span>
                    <h2>School Announcements</h2>
                    <p>
                        Stay informed about school news, events, and important
                        updates.
                    </p>
                </div>

                <div className="announcement-header-icon">
                    <Megaphone size={32} />
                </div>
            </div>

            {/* Statistics */}
            <div className="announcement-stats">
                <motion.div
                    className="announcement-stat-card total"
                    whileHover={{ y: -5 }}
                >
                    <div className="stat-icon">
                        <Bell size={23} />
                    </div>
                    <div>
                        <h3>{announcements.length}</h3>
                        <p>Total Announcements</p>
                    </div>
                </motion.div>

                <motion.div
                    className="announcement-stat-card unread"
                    whileHover={{ y: -5 }}
                >
                    <div className="stat-icon">
                        <AlertCircle size={23} />
                    </div>
                    <div>
                        <h3>{unreadCount}</h3>
                        <p>Unread Announcements</p>
                    </div>
                </motion.div>

                <motion.div
                    className="announcement-stat-card read"
                    whileHover={{ y: -5 }}
                >
                    <div className="stat-icon">
                        <CheckCircle size={23} />
                    </div>
                    <div>
                        <h3>{announcements.length - unreadCount}</h3>
                        <p>Read Announcements</p>
                    </div>
                </motion.div>
            </div>

            {/* Toolbar */}
            <div className="announcement-toolbar">
                <div className="announcement-search">
                    <Search size={19} />
                    <input
                        type="text"
                        placeholder="Search announcements..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>

                <div className="announcement-filters">
                    <Filter size={18} />

                    <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                    >
                        {categories.map((item) => (
                            <option key={item} value={item}>
                                {item === "All" ? "All Categories" : item}
                            </option>
                        ))}
                    </select>

                    <select
                        value={status}
                        onChange={(e) => setStatus(e.target.value)}
                    >
                        <option value="All">All Status</option>
                        <option value="Unread">Unread</option>
                        <option value="Read">Read</option>
                    </select>
                </div>

                <button
                    className="mark-all-btn"
                    onClick={markAllAsRead}
                    disabled={unreadCount === 0}
                >
                    <CheckCircle size={17} />
                    Mark all as read
                </button>
            </div>

            {/* Announcement List */}
            <div className="announcement-list">
                <div className="announcement-list-heading">
                    <div>
                        <h4>Latest Announcements</h4>
                        <p>
                            {filteredAnnouncements.length} announcement(s) found
                        </p>
                    </div>
                </div>

                {filteredAnnouncements.length === 0 ? (
                    <div className="announcement-empty">
                        <Megaphone size={42} />
                        <h4>No announcements found</h4>
                        <p>Try changing your search or filters.</p>
                    </div>
                ) : (
                    <AnimatePresence>
                        {filteredAnnouncements.map((item) => (
                            <motion.div
                                key={item.id}
                                className={`announcement-item ${!item.read ? "unread-item" : ""
                                    }`}
                                initial={{ opacity: 0, y: 15 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ duration: 0.25 }}
                                layout
                            >
                                <div className="announcement-item-icon">
                                    {getCategoryIcon(item.category)}
                                </div>

                                <div className="announcement-item-content">
                                    <div className="announcement-item-top">
                                        <div className="announcement-title-row">
                                            <h5>{item.title}</h5>

                                            {item.pinned && (
                                                <span className="pinned-label">
                                                    <Pin size={13} /> Pinned
                                                </span>
                                            )}

                                            {!item.read && (
                                                <span className="new-label">NEW</span>
                                            )}
                                        </div>

                                        <span
                                            className={`priority-label ${item.priority === "Important"
                                                    ? "priority-important"
                                                    : "priority-normal"
                                                }`}
                                        >
                                            {item.priority}
                                        </span>
                                    </div>

                                    <p className="announcement-description">
                                        {item.description}
                                    </p>

                                    <div className="announcement-meta">
                                        <span>
                                            {getCategoryIcon(item.category)}
                                            {item.category}
                                        </span>
                                        <span>
                                            <CalendarDays size={15} />
                                            {item.date}
                                        </span>
                                        <span>
                                            <Clock size={15} />
                                            {item.time}
                                        </span>
                                        <span className="announcement-author">
                                            By {item.author}
                                        </span>
                                    </div>
                                </div>

                                <button
                                    className="announcement-view-btn"
                                    onClick={() => openAnnouncement(item)}
                                >
                                    View Details
                                </button>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                )}
            </div>

            {/* Details Modal */}
            <AnimatePresence>
                {selected && (
                    <motion.div
                        className="announcement-modal-overlay"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setSelected(null)}
                    >
                        <motion.div
                            className="announcement-modal"
                            initial={{ opacity: 0, scale: 0.9, y: 25 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="announcement-modal-header">
                                <div className="modal-heading-icon">
                                    {getCategoryIcon(selected.category)}
                                </div>

                                <button
                                    className="modal-close-btn"
                                    onClick={() => setSelected(null)}
                                    aria-label="Close announcement"
                                >
                                    <X size={21} />
                                </button>
                            </div>

                            <span className="modal-category">
                                {selected.category}
                            </span>

                            <h3>{selected.title}</h3>

                            <div className="modal-date">
                                <CalendarDays size={16} />
                                {selected.date}
                                <Clock size={16} />
                                {selected.time}
                            </div>

                            <div className="modal-description">
                                {selected.description}
                            </div>

                            <div className="modal-author">
                                <span>Published by</span>
                                <strong>{selected.author}</strong>
                            </div>

                            <button
                                className="modal-done-btn"
                                onClick={() => setSelected(null)}
                            >
                                Close
                            </button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

export default ParentAnnouncements;
