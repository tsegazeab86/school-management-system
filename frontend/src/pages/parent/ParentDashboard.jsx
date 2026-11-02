
import { useState } from "react";
import {
    Users,
    CalendarCheck,
    GraduationCap,
    Wallet,
    Bell,
    Search,
    ArrowUpRight,
    // LayoutDashboard,
    // ClipboardList,
    CalendarDays,
    Megaphone,
    MessageCircle,
    // FileBarChart,
    ArrowRight,
    BookOpen,

    Clock,
    CheckCircle2,
    School,
    // CalendarDays,
    TrendingUp,
    //   Eye,
    ChevronRight,
} from "lucide-react";
import { motion } from "framer-motion";
import "./ParentDashboard.css";

const children = [
    {
        id: 1,
        name: "Abebe Tadesse",
        grade: "Grade 10",
        section: "Section A",
        studentId: "STU-2026-001",
        attendance: 96,
        average: 88,
        initials: "AT",
        color: "blue",
    },
    {
        id: 2,
        name: "Hana Tadesse",
        grade: "Grade 7",
        section: "Section B",
        studentId: "STU-2026-002",
        attendance: 92,
        average: 84,
        initials: "HT",
        color: "pink",
    },
];

const announcements = [
    {
        id: 1,
        title: "Parent-Teacher Meeting",
        description: "Meeting with class teachers this Friday.",
        date: "Today",
        type: "meeting",
    },
    {
        id: 2,
        title: "Examination Schedule",
        description: "First semester examination timetable is available.",
        date: "Yesterday",
        type: "exam",
    },
    {
        id: 3,
        title: "School Holiday Notice",
        description: "School will be closed on the announced holiday.",
        date: "2 days ago",
        type: "notice",
    },
];

const messages = [
    {
        id: 1,
        sender: "Ms. Selamawit",
        role: "Class Teacher",
        message: "Abebe is doing well in mathematics.",
        time: "10:30 AM",
        initials: "MS",
    },
    {
        id: 2,
        sender: "School Administration",
        role: "Administration",
        message: "Please review the latest school announcement.",
        time: "Yesterday",
        initials: "SA",
    },
];

const summaryCards = [
    {
        title: "Total Children",
        value: "02",
        subtitle: "Registered students",
        icon: Users,
        color: "parent-blue",
        trend: "2 active children",
    },
    {
        title: "Average Attendance",
        value: "94%",
        subtitle: "Across your children",
        icon: CalendarCheck,
        color: "parent-green",
        trend: "Good attendance",
    },
    {
        title: "Latest Exam Results",
        value: "86%",
        subtitle: "Average performance",
        icon: GraduationCap,
        color: "parent-purple",
        trend: "Good performance",
    },
    {
        title: "Pending Fees",
        value: "ETB 2,000",
        subtitle: "Outstanding balance",
        icon: Wallet,
        color: "parent-orange",
        trend: "Payment required",
    },
];

function ParentDashboard() {
    const [search, setSearch] = useState("");
    const [notificationsOpen, setNotificationsOpen] = useState(false);

    const filteredChildren = children.filter((child) =>
        `${child.name} ${child.grade} ${child.studentId}`
            .toLowerCase()
            .includes(search.toLowerCase())
    );

    return (
        <div className="parent-dashboard">
            {/* Top header */}
            <header className="parent-header">
                <div className="parent-header-title">
                    <span className="parent-header-label">
                        <School size={15} />
                        PARENT PORTAL
                    </span>
                    <h1>Parent Dashboard</h1>
                    <p>Stay connected with your children's school journey.</p>
                </div>

                <div className="parent-header-actions">
                    <div className="parent-search">
                        <Search size={17} />
                        <input
                            type="search"
                            placeholder="Search children..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>

                    <div className="parent-notification-wrapper">
                        <button
                            className="parent-notification-btn"
                            onClick={() => setNotificationsOpen(!notificationsOpen)}
                            aria-label="Notifications"
                        >
                            <Bell size={20} />
                            <span className="parent-notification-count">3</span>
                        </button>

                        {notificationsOpen && (
                            <div className="parent-notification-dropdown">
                                <h4>Notifications</h4>
                                <div className="parent-notification-item">
                                    <CalendarCheck size={17} />
                                    <div>
                                        <strong>Attendance updated</strong>
                                        <span>Abebe's attendance was recorded.</span>
                                    </div>
                                </div>
                                <div className="parent-notification-item">
                                    <GraduationCap size={17} />
                                    <div>
                                        <strong>New examination result</strong>
                                        <span>A new result is available.</span>
                                    </div>
                                </div>
                                <div className="parent-notification-item">
                                    <Wallet size={17} />
                                    <div>
                                        <strong>Fee reminder</strong>
                                        <span>You have a pending fee balance.</span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="parent-profile-mini">
                        <div className="parent-profile-avatar">PT</div>
                        <div>
                            <strong>Parent User</strong>
                            <span>Parent Account</span>
                        </div>
                    </div>
                </div>
            </header>

            {/* Welcome hero */}
            <motion.section
                className="parent-welcome"
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <div className="parent-welcome-content">
                    <span className="parent-welcome-tag">
                        <GraduationCap size={15} />
                        YOUR FAMILY SCHOOL PORTAL
                    </span>

                    <h2>Welcome Back, Parent!</h2>
                    <p>
                        Follow your children's academic progress, attendance, school
                        activities, and important updates all in one place.
                    </p>

                    <div className="parent-welcome-details">
                        <div>
                            <Users size={17} />
                            <span>2 Children Registered</span>
                        </div>
                        <div>
                            <CalendarDays size={17} />
                            <span>Academic Year 2026/2027</span>
                        </div>
                    </div>

                    <button
                        className="parent-primary-btn"
                        onClick={() =>
                            document
                                .getElementById("parent-children")
                                ?.scrollIntoView({ behavior: "smooth" })
                        }
                    >
                        View My Children
                        <ArrowRight size={17} />
                    </button>
                </div>

                <div className="parent-welcome-image">
                    <img
                        src="/images/parent-dashboard.png"
                        alt="Parent and children using a school dashboard"
                    />
                </div>
            </motion.section>

            {/* Summary cards */}
            <section className="parent-summary-grid">
                {summaryCards.map((card, index) => {
                    const Icon = card.icon;

                    return (
                        <motion.div
                            className={`parent-summary-card ${card.color}`}
                            key={card.title}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.09 }}
                            whileHover={{ y: -6 }}
                        >
                            <div className="parent-summary-top">
                                <div className="parent-summary-icon">
                                    <Icon size={22} />
                                </div>
                                <ArrowUpRight size={19} className="parent-summary-arrow" />
                            </div>

                            <span className="parent-summary-title">{card.title}</span>
                            <h3>{card.value}</h3>
                            <p>{card.subtitle}</p>

                            <div className="parent-summary-trend">
                                <TrendingUp size={13} />
                                {card.trend}
                            </div>
                        </motion.div>
                    );
                })}
            </section>

            {/* Children section */}
            <section className="parent-section" id="parent-children">
                <div className="parent-section-heading">
                    <div>
                        <span className="parent-section-label">FAMILY OVERVIEW</span>
                        <h3>My Children</h3>
                        <p>Monitor the academic progress of your children.</p>
                    </div>

                    <span className="parent-count-badge">
                        {filteredChildren.length} Children
                    </span>
                </div>

                <div className="row g-4">
                    {filteredChildren.length > 0 ? (
                        filteredChildren.map((child, index) => (
                            <div className="col-md-6" key={child.id}>
                                <motion.div
                                    className="parent-child-card"
                                    initial={{ opacity: 0, y: 15 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: index * 0.1 }}
                                >
                                    <div className="parent-child-top">
                                        <div className={`parent-child-avatar ${child.color}`}>
                                            {child.initials}
                                        </div>

                                        <div className="parent-child-info">
                                            <h4>{child.name}</h4>
                                            <span>
                                                {child.grade} · {child.section}
                                            </span>
                                            <small>{child.studentId}</small>
                                        </div>

                                        <span className="parent-active-badge">
                                            <span />
                                            Active
                                        </span>
                                    </div>

                                    <div className="parent-child-stats">
                                        <div>
                                            <div className="parent-child-stat-heading">
                                                <span>Attendance</span>
                                                <strong>{child.attendance}%</strong>
                                            </div>
                                            <div className="parent-progress-track">
                                                <div
                                                    className="parent-progress-fill attendance-fill"
                                                    style={{ width: `${child.attendance}%` }}
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <div className="parent-child-stat-heading">
                                                <span>Academic Average</span>
                                                <strong>{child.average}%</strong>
                                            </div>
                                            <div className="parent-progress-track">
                                                <div
                                                    className="parent-progress-fill academic-fill"
                                                    style={{ width: `${child.average}%` }}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="parent-child-footer">
                                        <span>
                                            <CheckCircle2 size={15} />
                                            Academic information
                                        </span>
                                        <button
                                            onClick={() =>
                                                alert(
                                                    `Demo: View details for ${child.name}. Connect this button to the child profile page.`
                                                )
                                            }
                                        >
                                            View Details
                                            <ChevronRight size={16} />
                                        </button>
                                    </div>
                                </motion.div>
                            </div>
                        ))
                    ) : (
                        <div className="col-12">
                            <div className="parent-no-results">
                                No children match your search.
                            </div>
                        </div>
                    )}
                </div>
            </section>

            {/* Lower dashboard */}
            <div className="row g-4 parent-lower-grid">
                {/* Academic progress */}
                <div className="col-lg-7">
                    <section className="parent-content-card h-100">
                        <div className="parent-section-heading">
                            <div>
                                <span className="parent-section-label">ACADEMIC PERFORMANCE</span>
                                <h3>Academic Progress</h3>
                                <p>Latest subject performance of your children.</p>
                            </div>
                            <BookOpen size={21} className="parent-heading-icon" />
                        </div>

                        <div className="parent-academic-list">
                            {[
                                { subject: "Mathematics", score: 88, color: "math" },
                                { subject: "English", score: 92, color: "english" },
                                { subject: "Science", score: 85, color: "science" },
                                { subject: "Computer Science", score: 90, color: "computer" },
                            ].map((item) => (
                                <div className="parent-subject-row" key={item.subject}>
                                    <div className="parent-subject-info">
                                        <span>{item.subject}</span>
                                        <strong>{item.score}%</strong>
                                    </div>
                                    <div className="parent-progress-track">
                                        <div
                                            className={`parent-progress-fill ${item.color}`}
                                            style={{ width: `${item.score}%` }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="parent-academic-footer">
                            <div>
                                <GraduationCap size={19} />
                                <span>Latest average examination result</span>
                            </div>
                            <strong>86%</strong>
                        </div>
                    </section>
                </div>

                {/* School information */}
                <div className="col-lg-5">
                    <section className="parent-content-card h-100">
                        <div className="parent-section-heading">
                            <div>
                                <span className="parent-section-label">SCHOOL DETAILS</span>
                                <h3>School Information</h3>
                                <p>Your children's school information.</p>
                            </div>
                            <School size={22} className="parent-heading-icon" />
                        </div>

                        <div className="parent-school-banner">
                            <div className="parent-school-icon">
                                <School size={28} />
                            </div>
                            <div>
                                <strong>Injibara School</strong>
                                <span>School Management Portal</span>
                            </div>
                        </div>

                        <div className="parent-school-details">
                            <div>
                                <span>Academic Year</span>
                                <strong>2026/2027</strong>
                            </div>
                            <div>
                                <span>Current Semester</span>
                                <strong>Semester I</strong>
                            </div>
                            <div>
                                <span>Parent Account</span>
                                <strong>Active</strong>
                            </div>
                            <div>
                                <span>Registered Children</span>
                                <strong>2 Students</strong>
                            </div>
                        </div>
                    </section>
                </div>

                {/* Announcements */}
                <div className="col-lg-6">
                    <section className="parent-content-card h-100">
                        <div className="parent-section-heading">
                            <div>
                                <span className="parent-section-label">SCHOOL UPDATES</span>
                                <h3>Announcements</h3>
                                <p>Important news and notices from school.</p>
                            </div>
                            <Megaphone size={22} className="parent-heading-icon" />
                        </div>

                        <div className="parent-announcement-list">
                            {announcements.map((item) => (
                                <div className="parent-announcement-item" key={item.id}>
                                    <div className={`parent-announcement-icon ${item.type}`}>
                                        {item.type === "meeting" ? (
                                            <CalendarDays size={19} />
                                        ) : item.type === "exam" ? (
                                            <GraduationCap size={19} />
                                        ) : (
                                            <Megaphone size={19} />
                                        )}
                                    </div>

                                    <div className="parent-announcement-content">
                                        <strong>{item.title}</strong>
                                        <p>{item.description}</p>
                                    </div>

                                    <span className="parent-announcement-date">
                                        {item.date}
                                    </span>
                                </div>
                            ))}
                        </div>

                        <button className="parent-text-link">
                            View all announcements <ArrowRight size={15} />
                        </button>
                    </section>
                </div>

                {/* Messages */}
                <div className="col-lg-6">
                    <section className="parent-content-card h-100">
                        <div className="parent-section-heading">
                            <div>
                                <span className="parent-section-label">COMMUNICATION</span>
                                <h3>Messages</h3>
                                <p>Recent messages from teachers and school.</p>
                            </div>
                            <MessageCircle size={22} className="parent-heading-icon" />
                        </div>

                        <div className="parent-message-list">
                            {messages.map((message) => (
                                <div className="parent-message-item" key={message.id}>
                                    <div className="parent-message-avatar">
                                        {message.initials}
                                    </div>
                                    <div className="parent-message-content">
                                        <strong>{message.sender}</strong>
                                        <small>{message.role}</small>
                                        <p>{message.message}</p>
                                    </div>
                                    <span className="parent-message-time">{message.time}</span>
                                </div>
                            ))}
                        </div>

                        <button className="parent-text-link">
                            Open messages <ArrowRight size={15} />
                        </button>
                    </section>
                </div>

                {/* Fees */}
                <div className="col-12">
                    <section className="parent-fees-card">
                        <div className="parent-fees-left">
                            <div className="parent-fees-icon">
                                <Wallet size={25} />
                            </div>
                            <div>
                                <span className="parent-section-label">FINANCIAL OVERVIEW</span>
                                <h3>Fees & Payments</h3>
                                <p>Review your children's outstanding school fees.</p>
                            </div>
                        </div>

                        <div className="parent-fees-amount">
                            <span>Pending balance</span>
                            <strong>ETB 2,000</strong>
                            <small>Demo financial information</small>
                        </div>

                        <button
                            className="parent-fees-button"
                            onClick={() =>
                                alert("Demo: Connect this button to the Parent Fees page.")
                            }
                        >
                            View Payment Details
                            <ArrowUpRight size={17} />
                        </button>
                    </section>
                </div>
            </div>

            {/* Footer */}
            <footer className="parent-dashboard-footer">
                <span>Parent Portal · Academic Year 2026/2027</span>
                <span>
                    <Clock size={13} /> Last updated: Today
                </span>
            </footer>
        </div>
    );
}

export default ParentDashboard;
