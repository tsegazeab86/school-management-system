
import   { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Megaphone,
    Search,
    CalendarDays,
    UserRound,
    Pin,
    AlertTriangle,
    BookOpen,
    GraduationCap,
    PartyPopper,
    Wallet,
    Bell,
    X,
    CheckCheck,
    MailOpen,
    Clock,
} from "lucide-react";
import "./StudentAnnouncements.css";

const initialAnnouncements = [
    {
        id: 1,
        title: "Final Examination Schedule Announced",
        category: "Exam",
        priority: "Urgent",
        date: "2026-10-29",
        author: "Academic Office",
        description:
            "The final examination schedule for this semester has been published. All students should check their examination dates, times, and assigned rooms. Please arrive at least 30 minutes before each examination.",
        read: false,
        pinned: true,
    },
    {
        id: 2,
        title: "Mid-Semester Results Available",
        category: "Academic",
        priority: "Important",
        date: "2026-10-27",
        author: "Registrar Office",
        description:
            "Mid-semester examination results are now available on the student dashboard. Please review your results and contact your department if you notice any incorrect information.",
        read: false,
        pinned: true,
    },
    {
        id: 3,
        title: "Annual Student Technology Exhibition",
        category: "Event",
        priority: "Normal",
        date: "2026-10-25",
        author: "Computer Science Department",
        description:
            "Students are invited to participate in the annual technology exhibition. You can present software projects, research ideas, and creative technology solutions.",
        read: true,
        pinned: false,
    },
    {
        id: 4,
        title: "Tuition Fee Payment Reminder",
        category: "Fee",
        priority: "Important",
        date: "2026-10-23",
        author: "Finance Office",
        description:
            "Students who have outstanding tuition fees should check their payment status through the student portal and contact the Finance Office for assistance.",
        read: false,
        pinned: false,
    },
    {
        id: 5,
        title: "Library Working Hours Update",
        category: "General",
        priority: "Normal",
        date: "2026-10-20",
        author: "Library Department",
        description:
            "The library will operate from 8:00 AM to 6:00 PM, Monday through Saturday. Students are reminded to return borrowed books on time.",
        read: true,
        pinned: false,
    },
    {
        id: 6,
        title: "Assignment Submission Deadline",
        category: "Academic",
        priority: "Urgent",
        date: "2026-10-18",
        author: "Department Office",
        description:
            "Students should submit all outstanding assignments before the deadline shown in their assignment section. Late submissions may be subject to department rules.",
        read: true,
        pinned: false,
    },
];

const categories = ["All", "Academic", "Exam", "Event", "Fee", "General"];
const priorities = ["All", "Urgent", "Important", "Normal"];

const categoryIcons = {
    Academic: BookOpen,
    Exam: GraduationCap,
    Event: PartyPopper,
    Fee: Wallet,
    General: Bell,
};

function formatDate(date) {
    return new Date(`${date}T00:00:00`).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
    });
}

function StudentAnnouncements() {
    const [announcements, setAnnouncements] = useState(initialAnnouncements);
    const [search, setSearch] = useState("");
    const [category, setCategory] = useState("All");
    const [priority, setPriority] = useState("All");
    const [activeTab, setActiveTab] = useState("All");
    const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);

    const unreadCount = announcements.filter((item) => !item.read).length;
    const readCount = announcements.filter((item) => item.read).length;

    const filteredAnnouncements = useMemo(() => {
        return announcements
            .filter((item) => {
                const searchMatch =
                    item.title.toLowerCase().includes(search.toLowerCase()) ||
                    item.description.toLowerCase().includes(search.toLowerCase()) ||
                    item.author.toLowerCase().includes(search.toLowerCase());

                const categoryMatch =
                    category === "All" || item.category === category;

                const priorityMatch =
                    priority === "All" || item.priority === priority;

                const tabMatch =
                    activeTab === "All" ||
                    (activeTab === "Unread" && !item.read) ||
                    (activeTab === "Read" && item.read);

                return searchMatch && categoryMatch && priorityMatch && tabMatch;
            })
            .sort((a, b) => {
                if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
                return new Date(b.date) - new Date(a.date);
            });
    }, [announcements, search, category, priority, activeTab]);

    const markAsRead = (id) => {
        setAnnouncements((previous) =>
            previous.map((item) =>
                item.id === id ? { ...item, read: true } : item
            )
        );
    };

    const markAllAsRead = () => {
        setAnnouncements((previous) =>
            previous.map((item) => ({ ...item, read: true }))
        );
    };

    const openAnnouncement = (item) => {
        setSelectedAnnouncement(item);
        markAsRead(item.id);
    };

    const closeAnnouncement = () => {
        setSelectedAnnouncement(null);
    };

    const clearFilters = () => {
        setSearch("");
        setCategory("All");
        setPriority("All");
        setActiveTab("All");
    };

    return (
        <div className="sa-page container-fluid py-4 px-3 px-lg-4">
            {/* Header */}
            <motion.div
                className="sa-header mb-4"
                initial={{ opacity: 0, y: -15 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <div>
                    <div className="sa-eyebrow">
                        <Megaphone size={16} />
                        STUDENT PORTAL
                    </div>
                    <h2>Announcements</h2>
                    <p>Stay updated with the latest school news and notices.</p>
                </div>

                <div className="sa-header-icon">
                    <Megaphone size={34} />
                    {unreadCount > 0 && <span>{unreadCount}</span>}
                </div>
            </motion.div>

            {/* Summary cards */}
            <div className="row g-3 mb-4">
                <div className="col-12 col-md-4">
                    <div className="sa-stat-card">
                        <div className="sa-stat-icon sa-stat-orange">
                            <Megaphone size={22} />
                        </div>
                        <div>
                            <span>Total announcements</span>
                            <h3>{announcements.length}</h3>
                        </div>
                    </div>
                </div>

                <div className="col-12 col-md-4">
                    <div className="sa-stat-card">
                        <div className="sa-stat-icon sa-stat-red">
                            <MailOpen size={22} />
                        </div>
                        <div>
                            <span>Unread announcements</span>
                            <h3>{unreadCount}</h3>
                        </div>
                    </div>
                </div>

                <div className="col-12 col-md-4">
                    <div className="sa-stat-card">
                        <div className="sa-stat-icon sa-stat-green">
                            <CheckCheck size={22} />
                        </div>
                        <div>
                            <span>Read announcements</span>
                            <h3>{readCount}</h3>
                        </div>
                    </div>
                </div>
            </div>

            {/* Featured announcement */}
            {announcements.find((item) => item.pinned) && (
                <motion.div
                    className="sa-featured mb-4"
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <div className="sa-featured-icon">
                        <Pin size={23} />
                    </div>
                    <div className="flex-grow-1">
                        <div className="sa-featured-label">PINNED ANNOUNCEMENT</div>
                        <h5>Important school updates</h5>
                        <p>
                            Check the pinned notices below for important academic
                            information and examination updates.
                        </p>
                    </div>
                    <span className="sa-featured-badge">Important</span>
                </motion.div>
            )}

            {/* Filters */}
            <div className="sa-filter-panel mb-4">
                <div className="sa-search-box">
                    <Search size={19} />
                    <input
                        type="text"
                        placeholder="Search announcements..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>

                <div className="row g-2 mt-2">
                    <div className="col-12 col-md-5">
                        <select
                            className="form-select sa-select"
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                        >
                            {categories.map((item) => (
                                <option key={item} value={item}>
                                    {item === "All" ? "All Categories" : item}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="col-12 col-md-5">
                        <select
                            className="form-select sa-select"
                            value={priority}
                            onChange={(e) => setPriority(e.target.value)}
                        >
                            {priorities.map((item) => (
                                <option key={item} value={item}>
                                    {item === "All" ? "All Priorities" : item}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="col-12 col-md-2">
                        <button
                            className="btn sa-clear-btn w-100"
                            onClick={clearFilters}
                        >
                            Clear
                        </button>
                    </div>
                </div>
            </div>

            {/* Tabs and mark all */}
            <div className="sa-list-heading">
                <div>
                    <h4>School Notices</h4>
                    <p>Browse announcements from your school.</p>
                </div>

                <button
                    className="sa-mark-all"
                    onClick={markAllAsRead}
                    disabled={unreadCount === 0}
                >
                    <CheckCheck size={17} />
                    Mark all as read
                </button>
            </div>

            <div className="sa-tabs mb-3">
                {["All", "Unread", "Read"].map((tab) => (
                    <button
                        key={tab}
                        className={activeTab === tab ? "active" : ""}
                        onClick={() => setActiveTab(tab)}
                    >
                        {tab}
                        {tab === "Unread" && unreadCount > 0 && (
                            <span className="sa-tab-count">{unreadCount}</span>
                        )}
                    </button>
                ))}
            </div>

            {/* Announcement cards */}
            <div className="row g-3">
                <AnimatePresence>
                    {filteredAnnouncements.map((item, index) => {
                        const CategoryIcon = categoryIcons[item.category] || Bell;

                        return (
                            <motion.div
                                className="col-12 col-lg-6"
                                key={item.id}
                                layout
                                initial={{ opacity: 0, y: 15 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.96 }}
                                transition={{ delay: index * 0.04 }}
                            >
                                <div
                                    className={`sa-announcement-card ${!item.read ? "sa-unread" : ""
                                        }`}
                                    onClick={() => openAnnouncement(item)}
                                    role="button"
                                    tabIndex={0}
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter") openAnnouncement(item);
                                    }}
                                >
                                    <div className="sa-card-top">
                                        <div className={`sa-category-icon sa-icon-${item.category.toLowerCase()}`}>
                                            <CategoryIcon size={21} />
                                        </div>

                                        <div className="sa-card-labels">
                                            <span className={`sa-category-badge sa-badge-${item.category.toLowerCase()}`}>
                                                {item.category}
                                            </span>
                                            <span className={`sa-priority sa-priority-${item.priority.toLowerCase()}`}>
                                                {item.priority === "Urgent" && (
                                                    <AlertTriangle size={12} />
                                                )}
                                                {item.priority}
                                            </span>
                                        </div>

                                        {item.pinned && (
                                            <span className="sa-pin-label">
                                                <Pin size={14} /> Pinned
                                            </span>
                                        )}

                                        {!item.read && <span className="sa-unread-dot" />}
                                    </div>

                                    <h5>{item.title}</h5>
                                    <p className="sa-card-description">
                                        {item.description}
                                    </p>

                                    <div className="sa-card-footer">
                                        <div className="sa-card-meta">
                                            <span>
                                                <CalendarDays size={14} />
                                                {formatDate(item.date)}
                                            </span>
                                            <span>
                                                <UserRound size={14} />
                                                {item.author}
                                            </span>
                                        </div>
                                        <span className="sa-read-more">Read more →</span>
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })}
                </AnimatePresence>
            </div>

            {/* Empty state */}
            {filteredAnnouncements.length === 0 && (
                <div className="sa-empty-state">
                    <div>
                        <Search size={30} />
                    </div>
                    <h5>No announcements found</h5>
                    <p>Try changing your search or filter options.</p>
                    <button className="btn sa-clear-btn" onClick={clearFilters}>
                        Clear filters
                    </button>
                </div>
            )}

            {/* Detail modal */}
            <AnimatePresence>
                {selectedAnnouncement && (
                    <motion.div
                        className="sa-modal-overlay"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={closeAnnouncement}
                    >
                        <motion.div
                            className="sa-modal"
                            initial={{ opacity: 0, y: 30, scale: 0.97 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 20, scale: 0.97 }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="sa-modal-header">
                                <div>
                                    <span className="sa-modal-eyebrow">
                                        SCHOOL ANNOUNCEMENT
                                    </span>
                                    <h4>Notice Details</h4>
                                </div>
                                <button
                                    className="sa-modal-close"
                                    onClick={closeAnnouncement}
                                    aria-label="Close"
                                >
                                    <X size={21} />
                                </button>
                            </div>

                            <div className="sa-modal-body">
                                <div className="d-flex flex-wrap gap-2 mb-3">
                                    <span className={`sa-category-badge sa-badge-${selectedAnnouncement.category.toLowerCase()}`}>
                                        {selectedAnnouncement.category}
                                    </span>
                                    <span className={`sa-priority sa-priority-${selectedAnnouncement.priority.toLowerCase()}`}>
                                        {selectedAnnouncement.priority}
                                    </span>
                                    {selectedAnnouncement.pinned && (
                                        <span className="sa-pin-label">
                                            <Pin size={14} /> Pinned
                                        </span>
                                    )}
                                </div>

                                <h3>{selectedAnnouncement.title}</h3>
                                <div className="sa-modal-meta">
                                    <span>
                                        <CalendarDays size={15} />
                                        {formatDate(selectedAnnouncement.date)}
                                    </span>
                                    <span>
                                        <UserRound size={15} />
                                        {selectedAnnouncement.author}
                                    </span>
                                    <span>
                                        <Clock size={15} />
                                        School notice
                                    </span>
                                </div>

                                <div className="sa-modal-description">
                                    {selectedAnnouncement.description}
                                </div>

                                <div className="sa-read-confirmation">
                                    <CheckCheck size={17} />
                                    You have marked this announcement as read.
                                </div>
                            </div>

                            <div className="sa-modal-footer">
                                <button
                                    className="btn sa-close-btn"
                                    onClick={closeAnnouncement}
                                >
                                    Close
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

export default StudentAnnouncements;
