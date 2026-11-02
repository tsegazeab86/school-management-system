
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  GraduationCap,
  Menu,
  X,
  ArrowRight,
  BookOpen,
  Users,
  ClipboardCheck,
  BarChart3,
  CalendarDays,
  Wallet,
  Library,
  ShieldCheck,
  UserRound,
  School,
  CheckCircle2,
} from "lucide-react";
import { useState } from "react";
import "./Home.css";

const features = [
  {
    icon: Users,
    title: "Student Management",
    description: "Register students and manage their academic information.",
    color: "blue",
  },
  {
    icon: BookOpen,
    title: "Teacher Management",
    description: "Organize teachers, subjects, and class assignments.",
    color: "purple",
  },
  {
    icon: ClipboardCheck,
    title: "Attendance Tracking",
    description: "Record and monitor daily student attendance.",
    color: "green",
  },
  {
    icon: BarChart3,
    title: "Examination & Results",
    description: "Manage examinations, grades, and academic reports.",
    color: "orange",
  },
  {
    icon: Wallet,
    title: "Fee Management",
    description: "Manage student fees, payments, and receipts.",
    color: "pink",
  },
  {
    icon: Library,
    title: "Library Management",
    description: "Organize books, borrowing, and book returns.",
    color: "cyan",
  },
];

const roles = [
  "Administrator",
  "Teacher",
  "Student",
  "Parent / Guardian",
  "Accountant",
  "Librarian",
];

function Home() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="home-page">
      {/* NAVBAR */}
      <header className="home-navbar">
        <Link to="/" className="home-brand">
          <div className="home-logo">
            <GraduationCap size={29} />
          </div>
          <div>
            <strong>EduManage</strong>
            <span>SCHOOL MANAGEMENT SYSTEM</span>
          </div>
        </Link>

        <button
          className="mobile-menu-button"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle navigation"
        >
          {menuOpen ? <X /> : <Menu />}
        </button>

        <nav className={menuOpen ? "nav-links open" : "nav-links"}>
          <a href="#home" onClick={() => setMenuOpen(false)}>Home</a>
          <a href="#about" onClick={() => setMenuOpen(false)}>About</a>
          <a href="#features" onClick={() => setMenuOpen(false)}>Features</a>
          <a href="#roles" onClick={() => setMenuOpen(false)}>User Roles</a>

          <Link
            to="/login"
            className="nav-login"
            onClick={() => setMenuOpen(false)}
          >
            Login
          </Link>

          <Link
            to="/signup"
            className="nav-signup"
            onClick={() => setMenuOpen(false)}
          >
            Sign Up <ArrowRight size={16} />
          </Link>
        </nav>
      </header>

      {/* HERO SECTION */}
      <section className="hero-section" id="home">
        <div className="hero-background-shape shape-one" />
        <div className="hero-background-shape shape-two" />

        <div className="hero-content">
          <motion.div
            className="hero-text"
            initial={{ opacity: 0, x: -35 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="hero-label">
              <School size={17} />
              SMART SCHOOL MANAGEMENT PLATFORM
            </div>

            <h1>
              Transforming Education
              <br />
              Through <span>Smart Technology</span>
            </h1>

            <p>
              Manage your entire school in one place. Connect teachers,
              students, parents, administrators, accountants, and librarians
              through one powerful platform.
            </p>

            <div className="hero-buttons">
              <Link to="/login" className="hero-primary-button">
                Get Started <ArrowRight size={19} />
              </Link>

              <a href="#features" className="hero-secondary-button">
                Explore Features
              </a>
            </div>

            <div className="hero-trust">
              <ShieldCheck size={19} />
              <span>Organized. Connected. Secure.</span>
            </div>
          </motion.div>

          {/* DASHBOARD PREVIEW */}
          <motion.div
            className="hero-visual"
            initial={{ opacity: 0, y: 35, scale: 0.94 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.9, delay: 0.2 }}
          >
            <div className="preview-card">
              <div className="preview-topbar">
                <div className="preview-brand">
                  <GraduationCap size={22} />
                  <strong>EduManage</strong>
                </div>
                <span className="preview-status">School Portal</span>
              </div>

              <div className="preview-welcome">
                <div>
                  <small>WELCOME TO YOUR SCHOOL</small>
                  <h3>Management Dashboard</h3>
                </div>
                <div className="preview-avatar">
                  <UserRound size={23} />
                </div>
              </div>

              <div className="preview-stat-grid">
                <div className="preview-stat blue-stat">
                  <Users size={22} />
                  <small>Students</small>
                  <strong>Manage</strong>
                </div>
                <div className="preview-stat purple-stat">
                  <BookOpen size={22} />
                  <small>Teachers</small>
                  <strong>Manage</strong>
                </div>
                <div className="preview-stat green-stat">
                  <ClipboardCheck size={22} />
                  <small>Attendance</small>
                  <strong>Track</strong>
                </div>
                <div className="preview-stat orange-stat">
                  <BarChart3 size={22} />
                  <small>Results</small>
                  <strong>Monitor</strong>
                </div>
              </div>

              <div className="preview-bottom">
                <div>
                  <CalendarDays size={19} />
                  <span>Academic Activities</span>
                </div>
                <CheckCircle2 size={19} />
              </div>
            </div>

            <motion.div
              className="floating-card floating-card-one"
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 4, repeat: Infinity }}
            >
              <ShieldCheck size={23} />
              <div>
                <strong>Secure Access</strong>
                <small>Role-based system</small>
              </div>
            </motion.div>

            <motion.div
              className="floating-card floating-card-two"
              animate={{ y: [0, 10, 0] }}
              transition={{ duration: 4, repeat: Infinity, delay: 1 }}
            >
              <GraduationCap size={24} />
              <div>
                <strong>Smart Learning</strong>
                <small>Better school experience</small>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ABOUT SECTION */}
      <section className="about-section" id="about">
        <div className="section-heading">
          <span>ABOUT OUR SYSTEM</span>
          <h2>One Platform. Every School Activity.</h2>
          <p>
            EduManage simplifies school administration and makes academic
            information easier to manage and access.
          </p>
        </div>

        <div className="about-grid">
          <div className="about-card">
            <div className="about-icon">
              <School size={27} />
            </div>
            <h3>Centralized Management</h3>
            <p>
              Keep school information, records, and daily activities organized
              in one system.
            </p>
          </div>

          <div className="about-card">
            <div className="about-icon purple-icon">
              <Users size={27} />
            </div>
            <h3>Better Communication</h3>
            <p>
              Help parents, students, and teachers stay informed about school
              activities.
            </p>
          </div>

          <div className="about-card">
            <div className="about-icon green-icon">
              <BarChart3 size={27} />
            </div>
            <h3>Academic Monitoring</h3>
            <p>
              Access attendance, examinations, grades, and academic reports.
            </p>
          </div>
        </div>
      </section>

      {/* FEATURES SECTION */}
      <section className="features-section" id="features">
        <div className="section-heading">
          <span>OUR FEATURES</span>
          <h2>Everything Your School Needs</h2>
          <p>
            Powerful tools designed to support school operations and academic
            activities.
          </p>
        </div>

        <div className="features-grid">
          {features.map((feature, index) => {
            const Icon = feature.icon;

            return (
              <motion.div
                className={`feature-card ${feature.color}`}
                key={feature.title}
                initial={{ opacity: 0, y: 25 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.08 }}
                whileHover={{ y: -9 }}
              >
                <div className="feature-icon">
                  <Icon size={27} />
                </div>

                <h3>{feature.title}</h3>
                <p>{feature.description}</p>

                <a href="#roles">
                  Learn more <ArrowRight size={16} />
                </a>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* USER ROLES */}
      <section className="roles-section" id="roles">
        <div className="section-heading">
          <span>WHO CAN USE THE SYSTEM?</span>
          <h2>Designed for Every School Role</h2>
          <p>
            Each user receives access to the functions relevant to their role.
          </p>
        </div>

        <div className="roles-grid">
          {roles.map((role, index) => (
            <motion.div
              key={role}
              className="role-card"
              whileHover={{ scale: 1.04, y: -5 }}
              transition={{ duration: 0.2 }}
            >
              <div className="role-number">
                {String(index + 1).padStart(2, "0")}
              </div>
              <h3>{role}</h3>
              <CheckCircle2 size={20} />
            </motion.div>
          ))}
        </div>
      </section>

      {/* CALL TO ACTION */}
      <section className="cta-section">
        <div>
          <span>START YOUR DIGITAL SCHOOL JOURNEY</span>
          <h2>Ready to Manage Your School Smarter?</h2>
          <p>
            Sign in to access your school account and manage your activities.
          </p>
        </div>

        <div className="cta-buttons">
          <Link to="/login" className="cta-login">
            Login Now <ArrowRight size={18} />
          </Link>
          <Link to="/signup" className="cta-signup">
            Create Account
          </Link>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="home-footer">
        <Link to="/" className="footer-brand">
          <GraduationCap size={25} />
          EduManage
        </Link>

        <p>© 2026 EduManage School Management System. All rights reserved.</p>

        <div>
          <a href="#home">Home</a>
          <a href="#about">About</a>
          <a href="#features">Features</a>
        </div>
      </footer>
    </div>
  );
}

export default Home;
