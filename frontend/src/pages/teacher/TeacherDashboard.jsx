
import   { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
    Users,
    BookOpen,
    ClipboardCheck,
    FileText,
    CalendarDays,
    Clock,
    Bell,
    Search,
    ChevronRight,
    MapPin,
    Plus,
    Upload,
    GraduationCap,
    TrendingUp,
    CheckCircle2,
    Menu,
    MoreHorizontal,
    ArrowUpRight,
} from "lucide-react";
import "./TeacherDashboard.css";

const defaultTeacherImage =
    "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&h=300&fit=crop";

const timetable = [
    {
        time: "08:00 - 09:00",
        subject: "Mathematics",
        className: "Grade 10A",
        room: "Room 204",
        status: "Completed",
    },
    {
        time: "09:30 - 10:30",
        subject: "Mathematics",
        className: "Grade 10B",
        room: "Room 205",
        status: "In progress",
    },
    {
        time: "11:00 - 12:00",
        subject: "Computer Science",
        className: "Grade 11A",
        room: "Computer Lab",
        status: "Upcoming",
    },
    {
        time: "02:00 - 03:00",
        subject: "Computer Science",
        className: "Grade 11B",
        room: "Computer Lab",
        status: "Upcoming",
    },
];

const classes = [
    { name: "Grade 10A", subject: "Mathematics", students: 38, progress: 82 },
    { name: "Grade 10B", subject: "Mathematics", students: 35, progress: 74 },
    { name: "Grade 11A", subject: "Computer Science", students: 32, progress: 91 },
    { name: "Grade 11B", subject: "Computer Science", students: 30, progress: 68 },
];

const activities = [
    {
        title: "Attendance submitted",
        detail: "Grade 10A · Mathematics",
        time: "Today, 08:55 AM",
        icon: CheckCircle2,
    },
    {
        title: "New assignment created",
        detail: "Grade 11A · Computer Science",
        time: "Yesterday, 03:20 PM",
        icon: FileText,
    },
    {
        title: "Grades updated",
        detail: "Grade 10B · Mathematics",
        time: "Yesterday, 11:15 AM",
        icon: ClipboardCheck,
    },
];

function TeacherDashboard() {
    const [teacherImage, setTeacherImage] = useState(defaultTeacherImage);
    const [teacherName, setTeacherName] = useState("Mr. John Anderson");
    const [searchTerm, setSearchTerm] = useState("");
    const fileInputRef = useRef(null);

    useEffect(() => {
        return () => {
            if (teacherImage.startsWith("blob:")) {
                URL.revokeObjectURL(teacherImage);
            }
        };
    }, [teacherImage]);

    const handleImageUpload = (event) => {
        const file = event.target.files?.[0];

        if (!file) return;

        if (!file.type.startsWith("image/")) {
            alert("Please select an image file.");
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            alert("Please select an image smaller than 5 MB.");
            return;
        }

        const imageUrl = URL.createObjectURL(file);
        setTeacherImage((oldImage) => {
            if (oldImage.startsWith("blob:")) {
                URL.revokeObjectURL(oldImage);
            }
            return imageUrl;
        });
    };

    const filteredClasses = classes.filter((item) =>
        `${item.name} ${item.subject}`
            .toLowerCase()
            .includes(searchTerm.toLowerCase())
    );

    return (
        <div className="teacher-dashboard">
            <header className="td-topbar">
                <div className="td-topbar-left">
                    <div className="td-mobile-menu">
                        <Menu size={22} />
                    </div>
                    <div>
                        <h2>Teacher Dashboard</h2>
                        <p>Welcome back! Here's your teaching overview.</p>
                    </div>
                </div>

                <div className="td-topbar-right">
                    <label className="td-search">
                        <Search size={18} />
                        <input
                            type="text"
                            placeholder="Search your classes..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </label>

                    <button className="td-notification" aria-label="Notifications">
                        <Bell size={20} />
                        <span />
                    </button>

                    <div className="td-date">
                        <CalendarDays size={17} />
                        <span>{new Date().toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                        })}</span>
                    </div>
                </div>
            </header>

            <main className="td-content">
                <section className="td-welcome">
                    <div className="td-welcome-text">
                        <span className="td-eyebrow">TEACHER PORTAL</span>
                        <h1>Good morning, {teacherName.split(" ")[1]}! 👋</h1>
                        <p>
                            Ready for another productive day? Here is what's happening in
                            your classes today.
                        </p>
                        <div className="td-welcome-actions">
                            <Link to="/teacher/attendance" className="td-primary-btn">
                                <ClipboardCheck size={17} />
                                Take Attendance
                            </Link>
                            <Link to="/teacher/assignments" className="td-secondary-btn">
                                <Plus size={17} />
                                Create Assignment
                            </Link>
                        </div>
                    </div>

                    <div className="td-profile-card">
                        <div className="td-profile-image-wrap">
                            <img src={teacherImage} alt="Teacher profile" />
                            <button
                                type="button"
                                className="td-upload-btn"
                                title="Upload profile photo"
                                onClick={() => fileInputRef.current?.click()}
                            >
                                <Upload size={15} />
                            </button>
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                hidden
                                onChange={handleImageUpload}
                            />
                        </div>
                        <div className="td-profile-info">
                            <h3>{teacherName}</h3>
                            <p>Senior Teacher</p>
                            <span>Mathematics & Computer Science</span>
                        </div>
                        <button
                            className="td-edit-profile"
                            onClick={() => {
                                const newName = window.prompt("Enter teacher name:", teacherName);
                                if (newName?.trim()) setTeacherName(newName.trim());
                            }}
                        >
                            Edit Profile
                        </button>
                    </div>
                </section>

                <section className="td-stats-grid">
                    <div className="td-stat-card">
                        <div className="td-stat-top">
                            <span className="td-stat-icon purple"><BookOpen size={21} /></span>
                            <span className="td-stat-trend"><TrendingUp size={14} /> 2 new</span>
                        </div>
                        <h2>4</h2>
                        <p>Assigned Classes</p>
                        <small>Across 2 grade levels</small>
                    </div>

                    <div className="td-stat-card">
                        <div className="td-stat-top">
                            <span className="td-stat-icon blue"><Users size={21} /></span>
                            <span className="td-stat-trend">Active</span>
                        </div>
                        <h2>135</h2>
                        <p>Total Students</p>
                        <small>In your assigned classes</small>
                    </div>

                    <div className="td-stat-card">
                        <div className="td-stat-top">
                            <span className="td-stat-icon green"><ClipboardCheck size={21} /></span>
                            <span className="td-stat-trend">Today</span>
                        </div>
                        <h2>92%</h2>
                        <p>Average Attendance</p>
                        <small>Based on sample records</small>
                    </div>

                    <div className="td-stat-card">
                        <div className="td-stat-top">
                            <span className="td-stat-icon orange"><FileText size={21} /></span>
                            <span className="td-stat-warning">Needs attention</span>
                        </div>
                        <h2>12</h2>
                        <p>Pending Grades</p>
                        <small>Assignments awaiting review</small>
                    </div>
                </section>

                <section className="td-main-grid">
                    <div className="td-panel td-timetable-panel">
                        <div className="td-panel-heading">
                            <div>
                                <h3>Today's Timetable</h3>
                                <p>Your scheduled lessons for today</p>
                            </div>
                            <Link to="/teacher/attendance" className="td-view-link">
                                View schedule <ChevronRight size={16} />
                            </Link>
                        </div>

                        <div className="td-timetable">
                            {timetable.map((lesson, index) => (
                                <div className="td-lesson" key={index}>
                                    <div className="td-lesson-time">
                                        <Clock size={15} />
                                        <span>{lesson.time}</span>
                                    </div>
                                    <div className="td-lesson-line">
                                        <span className={`td-lesson-dot dot-${index}`} />
                                    </div>
                                    <div className="td-lesson-details">
                                        <div>
                                            <h4>{lesson.subject}</h4>
                                            <p>{lesson.className}</p>
                                            <span><MapPin size={13} /> {lesson.room}</span>
                                        </div>
                                        <span className={`td-status ${lesson.status.toLowerCase().replace(" ", "-")}`}>
                                            {lesson.status}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="td-panel td-quick-panel">
                        <div className="td-panel-heading">
                            <div>
                                <h3>Quick Actions</h3>
                                <p>Frequently used tools</p>
                            </div>
                            <MoreHorizontal size={21} />
                        </div>

                        <div className="td-quick-actions">
                            <Link to="/teacher/attendance" className="td-quick-item">
                                <span className="quick-purple"><ClipboardCheck size={20} /></span>
                                <div><strong>Attendance</strong><small>Record student attendance</small></div>
                                <ChevronRight size={17} />
                            </Link>

                            <Link to="/teacher/assignments" className="td-quick-item">
                                <span className="quick-blue"><FileText size={20} /></span>
                                <div><strong>Assignments</strong><small>Create and manage tasks</small></div>
                                <ChevronRight size={17} />
                            </Link>

                            <Link to="/teacher/exams" className="td-quick-item">
                                <span className="quick-orange"><CalendarDays size={20} /></span>
                                <div><strong>Examinations</strong><small>Manage exams and schedules</small></div>
                                <ChevronRight size={17} />
                            </Link>

                            <Link to="/teacher/grades" className="td-quick-item">
                                <span className="quick-green"><GraduationCap size={20} /></span>
                                <div><strong>Manage Grades</strong><small>Enter and review marks</small></div>
                                <ChevronRight size={17} />
                            </Link>
                        </div>
                    </div>
                </section>

                <section className="td-bottom-grid">
                    <div className="td-panel">
                        <div className="td-panel-heading">
                            <div>
                                <h3>My Classes</h3>
                                <p>Your assigned classes and learning progress</p>
                            </div>
                            <Link to="/teacher/grades" className="td-view-link">
                                View all <ChevronRight size={16} />
                            </Link>
                        </div>

                        <div className="td-class-list">
                            {filteredClasses.length > 0 ? (
                                filteredClasses.map((item) => (
                                    <div className="td-class-row" key={item.name}>
                                        <div className="td-class-icon"><BookOpen size={20} /></div>
                                        <div className="td-class-name">
                                            <strong>{item.name}</strong>
                                            <span>{item.subject}</span>
                                        </div>
                                        <div className="td-class-students">
                                            <Users size={15} /> {item.students} students
                                        </div>
                                        <div className="td-progress-wrap">
                                            <div className="td-progress-label">
                                                <span>Progress</span><strong>{item.progress}%</strong>
                                            </div>
                                            <div className="td-progress-track">
                                                <div style={{ width: `${item.progress}%` }} />
                                            </div>
                                        </div>
                                        <button
                                            className="td-row-arrow"
                                            onClick={() => window.location.href = "/teacher/grades"}
                                            aria-label={`View ${item.name}`}
                                        >
                                            <ArrowUpRight size={17} />
                                        </button>
                                    </div>
                                ))
                            ) : (
                                <p className="td-empty">No matching classes found.</p>
                            )}
                        </div>
                    </div>

                    <div className="td-panel">
                        <div className="td-panel-heading">
                            <div>
                                <h3>Recent Activity</h3>
                                <p>Your latest teaching activities</p>
                            </div>
                            <MoreHorizontal size={21} />
                        </div>

                        <div className="td-activity-list">
                            {activities.map((activity, index) => {
                                const ActivityIcon = activity.icon;
                                return (
                                    <div className="td-activity" key={index}>
                                        <span className={`td-activity-icon activity-${index}`}>
                                            <ActivityIcon size={18} />
                                        </span>
                                        <div>
                                            <strong>{activity.title}</strong>
                                            <p>{activity.detail}</p>
                                            <small>{activity.time}</small>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </section>

                <footer className="td-footer">
                    <span>School Management System</span>
                    <span>Teacher Portal · Academic Year 2026/2027</span>
                </footer>
            </main>
        </div>
    );
}

export default TeacherDashboard;
