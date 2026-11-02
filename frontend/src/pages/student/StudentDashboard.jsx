
// import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  BookOpen,
  CalendarCheck,
  ClipboardList,
  GraduationCap,
  Clock,
  Bell,
  ArrowUpRight,
//   TrendingUp,
  CheckCircle,
  AlertCircle,
  UserRound,
  Wallet,
  ChevronRight,
  BookMarked,
} from "lucide-react";

import "./StudentDashboard.css";

const stats = [
  {
    title: "Attendance",
    value: "94%",
    description: "Your attendance rate",
    icon: CalendarCheck,
    color: "blue",
    trend: "+2.5%",
  },
  {
    title: "Average Grade",
    value: "87.5%",
    description: "Your academic performance",
    icon: GraduationCap,
    color: "purple",
    trend: "+5.2%",
  },
  {
    title: "Assignments",
    value: "08",
    description: "Pending assignments",
    icon: ClipboardList,
    color: "orange",
    trend: "2 due soon",
  },
  {
    title: "Learning Materials",
    value: "24",
    description: "Available resources",
    icon: BookOpen,
    color: "green",
    trend: "New materials",
  },
];

const assignments = [
  {
    id: 1,
    title: "Database Management System",
    subject: "Database",
    dueDate: "Nov 03, 2026",
    status: "Pending",
  },
  {
    id: 2,
    title: "Java Programming Project",
    subject: "Java",
    dueDate: "Nov 05, 2026",
    status: "Submitted",
  },
  {
    id: 3,
    title: "Computer Networks Exercise",
    subject: "Networking",
    dueDate: "Nov 07, 2026",
    status: "Pending",
  },
];

const timetable = [
  {
    time: "08:00 - 09:00",
    subject: "Database Management",
    room: "Room 204",
    color: "blue",
  },
  {
    time: "09:00 - 10:00",
    subject: "Java Programming",
    room: "Lab 02",
    color: "purple",
  },
  {
    time: "10:30 - 11:30",
    subject: "Computer Networks",
    room: "Room 105",
    color: "orange",
  },
];

const announcements = [
  {
    title: "Midterm Examination Schedule",
    message: "The midterm examination schedule is now available.",
    date: "Today",
    type: "important",
  },
  {
    title: "Learning Materials Updated",
    message: "New study materials have been uploaded.",
    date: "Yesterday",
    type: "normal",
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.12 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 25 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5 },
  },
};

function StudentDashboard() {
  return (
    <motion.div
      className="student-dashboard"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Welcome Header */}
      <motion.section
        className="student-welcome"
        variants={itemVariants}
      >
        <div className="welcome-content">
          <span className="welcome-label">
            STUDENT PORTAL
          </span>

          <h1>
            Welcome back, <span>Student!</span>
          </h1>

          <p>
            Keep learning, stay organized, and achieve
            your academic goals.
          </p>

          <div className="welcome-actions">
            <Link to="/student/assignments" className="welcome-btn">
              View Assignments
              <ArrowUpRight size={18} />
            </Link>

            <Link to="/student/results" className="welcome-secondary">
              View Results
            </Link>
          </div>
        </div>

        <div className="welcome-art">
          <div className="art-circle">
            <GraduationCap size={100} strokeWidth={1.3} />
          </div>
          <div className="art-small-icon">
            <BookOpen size={25} />
          </div>
          <div className="art-star">✦</div>
        </div>
      </motion.section>

      {/* Student Information */}
      <motion.div
        className="student-info-strip"
        variants={itemVariants}
      >
        <div className="student-info-item">
          <UserRound size={19} />
          <div>
            <span>Student Name</span>
            <strong>Alex Johnson</strong>
          </div>
        </div>

        <div className="student-info-item">
          <GraduationCap size={20} />
          <div>
            <span>Class</span>
            <strong>Grade 10A</strong>
          </div>
        </div>

        <div className="student-info-item">
          <BookMarked size={19} />
          <div>
            <span>Student ID</span>
            <strong>STU-2026-001</strong>
          </div>
        </div>

        <div className="student-info-item">
          <CalendarCheck size={19} />
          <div>
            <span>Academic Year</span>
            <strong>2026 / 2027</strong>
          </div>
        </div>
      </motion.div>

      {/* Statistics */}
      <motion.section
        className="student-stats-grid"
        variants={containerVariants}
      >
        {stats.map((stat, ) => {
          const Icon = stat.icon;

          return (
            <motion.div
              className={`student-stat-card ${stat.color}`}
              key={stat.title}
              variants={itemVariants}
              whileHover={{ y: -7, scale: 1.02 }}
              transition={{ duration: 0.25 }}
            >
              <div className="stat-top">
                <div className="stat-icon">
                  <Icon size={23} />
                </div>

                <span className="stat-trend">
                  {stat.trend}
                </span>
              </div>

              <h2>{stat.value}</h2>
              <h4>{stat.title}</h4>
              <p>{stat.description}</p>
            </motion.div>
          );
        })}
      </motion.section>

      {/* Main Content */}
      <div className="student-main-grid">

        {/* Assignments */}
        <motion.section
          className="student-panel assignments-panel"
          variants={itemVariants}
        >
          <div className="student-panel-header">
            <div>
              <h2>Recent Assignments</h2>
              <p>Track your academic tasks</p>
            </div>

            <Link to="/student/assignments" className="view-all">
              View All <ChevronRight size={17} />
            </Link>
          </div>

          <div className="assignment-list">
            {assignments.map((item) => (
              <div className="assignment-item" key={item.id}>
                <div className="assignment-icon">
                  <ClipboardList size={21} />
                </div>

                <div className="assignment-details">
                  <h4>{item.title}</h4>
                  <span>{item.subject}</span>
                  <small>
                    <Clock size={13} />
                    Due: {item.dueDate}
                  </small>
                </div>

                <span
                  className={`assignment-status ${
                    item.status === "Submitted"
                      ? "submitted"
                      : "pending"
                  }`}
                >
                  {item.status}
                </span>
              </div>
            ))}
          </div>
        </motion.section>

        {/* Attendance */}
        <motion.section
          className="student-panel attendance-panel"
          variants={itemVariants}
        >
          <div className="student-panel-header">
            <div>
              <h2>Attendance Overview</h2>
              <p>Your attendance summary</p>
            </div>

            <CalendarCheck size={22} />
          </div>

          <div className="attendance-chart">
            <div className="attendance-circle">
              <div className="attendance-circle-inner">
                <strong>94%</strong>
                <span>Attendance</span>
              </div>
            </div>
          </div>

          <div className="attendance-legend">
            <div>
              <span className="legend-dot present"></span>
              Present
              <strong>94%</strong>
            </div>

            <div>
              <span className="legend-dot absent"></span>
              Absent
              <strong>6%</strong>
            </div>
          </div>

          <Link to="/student/attendance" className="attendance-link">
            View Attendance Details
            <ArrowUpRight size={17} />
          </Link>
        </motion.section>

        {/* Timetable */}
        <motion.section
          className="student-panel timetable-panel"
          variants={itemVariants}
        >
          <div className="student-panel-header">
            <div>
              <h2>Today's Timetable</h2>
              <p>Your scheduled classes</p>
            </div>

            <Link to="/student/timetable" className="view-all">
              View All <ChevronRight size={17} />
            </Link>
          </div>

          <div className="timetable-list">
            {timetable.map((item, index) => (
              <div className="timetable-item" key={index}>
                <div className={`time-indicator ${item.color}`}></div>

                <div className="timetable-time">
                  <strong>{item.time}</strong>
                  <span>{item.room}</span>
                </div>

                <h4>{item.subject}</h4>
                <CheckCircle size={18} className="timetable-check" />
              </div>
            ))}
          </div>
        </motion.section>

        {/* Announcements */}
        <motion.section
          className="student-panel announcements-panel"
          variants={itemVariants}
        >
          <div className="student-panel-header">
            <div>
              <h2>Latest Announcements</h2>
              <p>Updates from your school</p>
            </div>

            <Bell size={22} />
          </div>

          <div className="announcement-list">
            {announcements.map((item, index) => (
              <div className="announcement-item" key={index}>
                <div className={`announcement-icon ${item.type}`}>
                  {item.type === "important" ? (
                    <AlertCircle size={20} />
                  ) : (
                    <Bell size={20} />
                  )}
                </div>

                <div>
                  <h4>{item.title}</h4>
                  <p>{item.message}</p>
                  <span>{item.date}</span>
                </div>
              </div>
            ))}
          </div>

          <Link
            to="/student/announcements"
            className="announcement-footer"
          >
            Read All Announcements
            <ArrowUpRight size={17} />
          </Link>
        </motion.section>
      </div>

      {/* Quick Access */}
      <motion.section
        className="student-quick-access"
        variants={itemVariants}
      >
        <div className="student-panel-header">
          <div>
            <h2>Quick Access</h2>
            <p>Navigate to your student services</p>
          </div>
        </div>

        <div className="quick-access-grid">
          <Link to="/student/profile" className="quick-access-card">
            <UserRound size={25} />
            <span>My Profile</span>
            <ArrowUpRight size={16} />
          </Link>

          <Link to="/student/results" className="quick-access-card">
            <GraduationCap size={25} />
            <span>Exams & Results</span>
            <ArrowUpRight size={16} />
          </Link>

          <Link to="/student/materials" className="quick-access-card">
            <BookOpen size={25} />
            <span>Study Materials</span>
            <ArrowUpRight size={16} />
          </Link>

          <Link to="/student/fees" className="quick-access-card">
            <Wallet size={25} />
            <span>Fees & Payments</span>
            <ArrowUpRight size={16} />
          </Link>
        </div>
      </motion.section>

      <footer className="student-dashboard-footer">
        <p>© 2026 EduManage School Management System</p>
        <span>Student Portal • Version 1.0</span>
      </footer>
    </motion.div>
  );
}

export default StudentDashboard;
