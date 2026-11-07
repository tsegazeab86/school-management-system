import { useState, useEffect, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users,
  GraduationCap,
  BriefcaseBusiness,
  UserRound,
  BookOpen,
  School,
  Plus,
  Activity,
  Bell,
  TrendingUp,
  CalendarDays,
  ArrowUpRight,
  Clock,
  Sparkles,
  LogOut,
  Settings,
  User,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  X,
  ChevronDown,
  ArrowRight,
  Info,
  Calendar,
  Megaphone,
  FileBarChart,
  Check,
} from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";

import {
  getDashboardData,
  // saveDashboardData,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  dismissNotification,
  getAuthenticatedAdmin,
} from "../../utils/admin/dashboardStorage";

import "../../styles/admin/AdminDashboard.css";

// Chart Custom Tooltip Component
function CustomChartTooltip({ active, payload, label, unit = "" }) {
  if (active && payload && payload.length) {
    return (
      <div className="admin-chart-tooltip">
        <p className="admin-chart-tooltip-label">{label}</p>
        <div className="admin-chart-tooltip-list">
          {payload.map((entry, index) => (
            <div key={`item-${index}`} className="admin-chart-tooltip-item">
              <span
                className="admin-chart-tooltip-dot"
                style={{ backgroundColor: entry.color || entry.stroke || entry.fill }}
              />
              <span className="admin-chart-tooltip-name">{entry.name}:</span>
              <span className="admin-chart-tooltip-value">
                {entry.value.toLocaleString()} {unit}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  }
  return null;
}

export default function AdminDashboard() {
  const navigate = useNavigate();

  // Storage and authenticated admin state
  const [dashboardData, setDashboardData] = useState(() => getDashboardData());
  const [adminUser, setAdminUser] = useState(() => getAuthenticatedAdmin());

  // Interactive UI state
  const [activeChartFilter, setActiveChartFilter] = useState("year"); // 'year' | 'term' | 'recent'
  const [activityCategoryFilter, setActivityCategoryFilter] = useState("all");
  const [showNotificationsDropdown, setShowNotificationsDropdown] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [showQuickActionModal, setShowQuickActionModal] = useState(false);
  const [showDemoInfoModal, setShowDemoInfoModal] = useState(false);

  // References for click-outside detection
  const notifRef = useRef(null);
  const profileRef = useRef(null);

  // Refresh dashboard data on mount and listen to storage updates
  useEffect(() => {
    const handleStorageUpdate = () => {
      setDashboardData(getDashboardData());
      setAdminUser(getAuthenticatedAdmin());
    };

    window.addEventListener("adminDashboardUpdated", handleStorageUpdate);
    window.addEventListener("parentsUpdated", handleStorageUpdate);

    return () => {
      window.removeEventListener("adminDashboardUpdated", handleStorageUpdate);
      window.removeEventListener("parentsUpdated", handleStorageUpdate);
    };
  }, []);

  // Handle click outside dropdowns
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setShowNotificationsDropdown(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setShowProfileDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Handle keyboard escape for modals and dropdowns
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        setShowNotificationsDropdown(false);
        setShowProfileDropdown(false);
        setShowQuickActionModal(false);
        setShowDemoInfoModal(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Formatted date string
  const currentDateFormatted = useMemo(() => {
    return new Date().toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }, []);

  // Unread notification count
  const unreadCount = useMemo(() => {
    return dashboardData.notifications?.filter((n) => n.unread).length || 0;
  }, [dashboardData.notifications]);

  // Filtered recent activities
  const filteredActivities = useMemo(() => {
    if (!dashboardData.recentActivities) return [];
    if (activityCategoryFilter === "all") return dashboardData.recentActivities;
    return dashboardData.recentActivities.filter(
      (act) => act.type === activityCategoryFilter
    );
  }, [dashboardData.recentActivities, activityCategoryFilter]);

  // Dynamic enrollment data based on filter
  const enrollmentDisplayData = useMemo(() => {
    const data = dashboardData.enrollmentTrend || [];
    if (activeChartFilter === "term") {
      return data.slice(0, 4); // First semester
    }
    if (activeChartFilter === "recent") {
      return data.slice(-3); // Recent 3 months
    }
    return data;
  }, [dashboardData.enrollmentTrend, activeChartFilter]);

  // Statistics cards list with matching icons
  const statCards = [
    {
      key: "students",
      title: dashboardData.stats.students.label,
      value: dashboardData.stats.students.value.toLocaleString(),
      trend: dashboardData.stats.students.trend,
      trendPeriod: dashboardData.stats.students.trendPeriod,
      subLabel: dashboardData.stats.students.subLabel,
      icon: GraduationCap,
      color: "blue",
      path: "/admin/students",
    },
    {
      key: "teachers",
      title: dashboardData.stats.teachers.label,
      value: dashboardData.stats.teachers.value.toLocaleString(),
      trend: dashboardData.stats.teachers.trend,
      trendPeriod: dashboardData.stats.teachers.trendPeriod,
      subLabel: dashboardData.stats.teachers.subLabel,
      icon: Users,
      color: "purple",
      path: "/admin/teachers",
    },
    {
      key: "staff",
      title: dashboardData.stats.staff.label,
      value: dashboardData.stats.staff.value.toLocaleString(),
      trend: dashboardData.stats.staff.trend,
      trendPeriod: dashboardData.stats.staff.trendPeriod,
      subLabel: dashboardData.stats.staff.subLabel,
      icon: BriefcaseBusiness,
      color: "amber",
      path: "/admin/staff",
    },
    {
      key: "parents",
      title: dashboardData.stats.parents.label,
      value: dashboardData.stats.parents.value.toLocaleString(),
      trend: dashboardData.stats.parents.trend,
      trendPeriod: dashboardData.stats.parents.trendPeriod,
      subLabel: dashboardData.stats.parents.subLabel,
      icon: UserRound,
      color: "emerald",
      path: "/admin/parents",
    },
    {
      key: "classes",
      title: dashboardData.stats.classes.label,
      value: dashboardData.stats.classes.value.toLocaleString(),
      trend: dashboardData.stats.classes.trend,
      trendPeriod: dashboardData.stats.classes.trendPeriod,
      subLabel: dashboardData.stats.classes.subLabel,
      icon: School,
      color: "indigo",
      path: "/admin/classes",
    },
    {
      key: "subjects",
      title: dashboardData.stats.subjects.label,
      value: dashboardData.stats.subjects.value.toLocaleString(),
      trend: dashboardData.stats.subjects.trend,
      trendPeriod: dashboardData.stats.subjects.trendPeriod,
      subLabel: dashboardData.stats.subjects.subLabel,
      icon: BookOpen,
      color: "cyan",
      path: "/admin/subjects",
    },
  ];

  // Quick Action items navigating strictly to existing routes
  const quickActions = [
    {
      id: "qa-student",
      title: "Register Student",
      desc: "Enroll a new Grade 1–12 student",
      icon: GraduationCap,
      color: "blue",
      path: "/admin/students",
    },
    {
      id: "qa-teacher",
      title: "Register Teacher",
      desc: "Onboard faculty & assign subjects",
      icon: Users,
      color: "purple",
      path: "/admin/teachers",
    },
    {
      id: "qa-staff",
      title: "Add Staff Member",
      desc: "Add administration & support staff",
      icon: BriefcaseBusiness,
      color: "amber",
      path: "/admin/staff",
    },
    {
      id: "qa-parent",
      title: "Add Parent Portal",
      desc: "Link guardian to student records",
      icon: UserRound,
      color: "emerald",
      path: "/admin/parents",
    },
    {
      id: "qa-announcement",
      title: "Create Announcement",
      desc: "Publish campus or role notice",
      icon: Megaphone,
      color: "indigo",
      path: "/admin/announcements",
    },
    {
      id: "qa-reports",
      title: "View Reports",
      desc: "Generate academic & student reports",
      icon: FileBarChart,
      color: "cyan",
      path: "/admin/reports",
    },
  ];

  // Logout handler
  const handleSignOut = () => {
    if (window.confirm("Are you sure you want to sign out of the administrator panel?")) {
      localStorage.removeItem("token");
      sessionStorage.removeItem("token");
      navigate("/login");
    }
  };

  return (
    <div className="admin-dashboard-root">
      {/* ====================================================================
          1. DASHBOARD HEADER & TOP ACTION BAR
         ==================================================================== */}
      <header className="admin-dash-header">
        <div className="admin-dash-welcome">
          <div className="admin-dash-eyebrow">
            <span className="admin-eyebrow-chip">
              < Sparkles size={13} className="admin-sparkle-icon" />
              SCHOOL ADMINISTRATION PORTAL
            </span>
            <div className="admin-academic-badge">
              <Calendar size={13} />
              <span>{dashboardData.academicYear}</span>
            </div>
          </div>

          <h1 className="admin-dash-title">
            Welcome back, <span className="admin-name-highlight">{adminUser.name}</span>
          </h1>
          <p className="admin-dash-subtitle">
            Comprehensive Grade 1–12 School Management & Academic Operations Overview for{" "}
            <strong>{currentDateFormatted}</strong>.
          </p>
        </div>

        {/* Right Header Controls (Notifications, Profile, Quick Action) */}
        <div className="admin-dash-header-actions">
          {/* Demo Data Indicator Pill */}
          <button
            type="button"
            className="admin-demo-indicator"
            onClick={() => setShowDemoInfoModal(true)}
            title="Click to view data mode information"
          >
            <span className="admin-demo-dot" />
            <span className="admin-demo-text">Sample Metrics</span>
            <Info size={14} className="admin-demo-icon" />
          </button>

          {/* Quick Action Trigger Button */}
          <button
            type="button"
            className="admin-btn admin-btn-primary admin-dash-quick-btn"
            onClick={() => setShowQuickActionModal(true)}
          >
            <Plus size={16} />
            <span>Quick Action</span>
          </button>

          {/* Notifications Dropdown */}
          <div className="admin-dropdown-wrapper" ref={notifRef}>
            <button
              type="button"
              className={`admin-icon-btn ${unreadCount > 0 ? "has-unread" : ""}`}
              onClick={() => {
                setShowNotificationsDropdown(!showNotificationsDropdown);
                setShowProfileDropdown(false);
              }}
              aria-label="View notifications"
              title="Notifications"
            >
              <Bell size={19} />
              {unreadCount > 0 && (
                <span className="admin-notif-badge">{unreadCount}</span>
              )}
            </button>

            <AnimatePresence>
              {showNotificationsDropdown && (
                <motion.div
                  className="admin-dropdown-menu admin-notifications-dropdown"
                  initial={{ opacity: 0, y: 8, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 6, scale: 0.98 }}
                  transition={{ duration: 0.15 }}
                >
                  <div className="admin-dropdown-header">
                    <div className="admin-dropdown-title-group">
                      <h4>Notifications & Alerts</h4>
                      <span className="admin-badge admin-badge-info">
                        {unreadCount} unread
                      </span>
                    </div>
                    {unreadCount > 0 && (
                      <button
                        type="button"
                        className="admin-text-action-btn"
                        onClick={() => {
                          markAllNotificationsAsRead();
                          setDashboardData(getDashboardData());
                        }}
                      >
                        <Check size={13} />
                        Mark all as read
                      </button>
                    )}
                  </div>

                  <div className="admin-notifications-scroll">
                    {dashboardData.notifications && dashboardData.notifications.length > 0 ? (
                      dashboardData.notifications.map((item) => (
                        <div
                          key={item.id}
                          className={`admin-notif-item ${item.unread ? "unread" : ""}`}
                          onClick={() => {
                            if (item.unread) {
                              markNotificationAsRead(item.id);
                              setDashboardData(getDashboardData());
                            }
                          }}
                        >
                          <div className="admin-notif-status-dot" />
                          <div className="admin-notif-content">
                            <div className="admin-notif-item-top">
                              <span className="admin-notif-category">
                                {item.category}
                              </span>
                              <span className="admin-notif-time">{item.time}</span>
                            </div>
                            <h5 className="admin-notif-item-title">{item.title}</h5>
                            <p className="admin-notif-item-desc">{item.description}</p>
                          </div>
                          <button
                            type="button"
                            className="admin-notif-dismiss"
                            onClick={(e) => {
                              e.stopPropagation();
                              dismissNotification(item.id);
                              setDashboardData(getDashboardData());
                            }}
                            title="Dismiss notification"
                          >
                            <X size={13} />
                          </button>
                        </div>
                      ))
                    ) : (
                      <div className="admin-dropdown-empty">
                        <CheckCircle2 size={32} className="admin-empty-icon-svg" />
                        <p>All caught up! No active notifications.</p>
                      </div>
                    )}
                  </div>

                  <div className="admin-dropdown-footer">
                    <button
                      type="button"
                      className="admin-dropdown-link"
                      onClick={() => {
                        setShowNotificationsDropdown(false);
                        navigate("/admin/announcements");
                      }}
                    >
                      View All Announcements & Notifications <ArrowRight size={13} />
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Admin Profile Menu */}
          <div className="admin-dropdown-wrapper" ref={profileRef}>
            <button
              type="button"
              className="admin-profile-pill"
              onClick={() => {
                setShowProfileDropdown(!showProfileDropdown);
                setShowNotificationsDropdown(false);
              }}
              aria-label="Admin account menu"
            >
              <div className="admin-avatar">
                <span>{adminUser.initials}</span>
                <span className="admin-avatar-status" />
              </div>
              <div className="admin-profile-meta">
                <span className="admin-profile-name">{adminUser.name}</span>
                <span className="admin-profile-role">{adminUser.role}</span>
              </div>
              <ChevronDown size={14} className="admin-chevron-down" />
            </button>

            <AnimatePresence>
              {showProfileDropdown && (
                <motion.div
                  className="admin-dropdown-menu admin-profile-dropdown"
                  initial={{ opacity: 0, y: 8, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 6, scale: 0.98 }}
                  transition={{ duration: 0.15 }}
                >
                  <div className="admin-profile-dropdown-user">
                    <div className="admin-avatar admin-avatar-lg">
                      <span>{adminUser.initials}</span>
                    </div>
                    <div>
                      <strong>{adminUser.name}</strong>
                      <span className="admin-user-email">{adminUser.email}</span>
                      <span className="admin-badge admin-badge-success admin-role-chip">
                        <ShieldCheck size={11} /> {adminUser.role}
                      </span>
                    </div>
                  </div>

                  <div className="admin-profile-menu-links">
                    <button
                      type="button"
                      className="admin-profile-link-item"
                      onClick={() => {
                        setShowProfileDropdown(false);
                        navigate("/admin/profile");
                      }}
                    >
                      <User size={16} />
                      <span>My Profile & Security</span>
                    </button>
                    <button
                      type="button"
                      className="admin-profile-link-item"
                      onClick={() => {
                        setShowProfileDropdown(false);
                        navigate("/admin/settings");
                      }}
                    >
                      <Settings size={16} />
                      <span>System Settings</span>
                    </button>
                    <button
                      type="button"
                      className="admin-profile-link-item"
                      onClick={() => {
                        setShowProfileDropdown(false);
                        navigate("/admin/reports");
                      }}
                    >
                      <FileBarChart size={16} />
                      <span>Administrative Reports</span>
                    </button>
                  </div>

                  <div className="admin-profile-dropdown-footer">
                    <button
                      type="button"
                      className="admin-profile-signout-btn"
                      onClick={handleSignOut}
                    >
                      <LogOut size={15} />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </header>

      {/* ====================================================================
          2. QUICK ACTIONS SHORTCUTS BAR
         ==================================================================== */}
      <section className="admin-quick-actions-bar" aria-label="Administrative shortcuts">
        <div className="admin-section-header-compact">
          <div className="admin-section-label-group">
            <h3 className="admin-section-heading">Quick Actions</h3>
            <span className="admin-section-subheading">
              Frequently accessed administrative tasks
            </span>
          </div>
        </div>

        <div className="admin-quick-grid">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <button
                key={action.id}
                type="button"
                className={`admin-quick-card ${action.color}`}
                onClick={() => navigate(action.path)}
              >
                <div className="admin-quick-icon-wrapper">
                  <Icon size={20} />
                </div>
                <div className="admin-quick-content">
                  <strong className="admin-quick-title">{action.title}</strong>
                  <span className="admin-quick-desc">{action.desc}</span>
                </div>
                <ArrowRight size={15} className="admin-quick-arrow" />
              </button>
            );
          })}
        </div>
      </section>

      {/* ====================================================================
          3. KEY PERFORMANCE STATISTICS CARDS (6 CARDS)
         ==================================================================== */}
      <section className="admin-stats-section" aria-label="Key school statistics">
        <div className="admin-section-header-compact">
          <div className="admin-section-label-group">
            <h3 className="admin-section-heading">School Overview Statistics</h3>
            <span className="admin-section-subheading">
              Real-time student, faculty, and academic counts
            </span>
          </div>
        </div>

        <div className="admin-stats-grid">
          {statCards.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.key}
                className="admin-stat-card"
                onClick={() => navigate(item.path)}
                title={`Click to manage ${item.title}`}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    navigate(item.path);
                  }
                }}
              >
                <div className="admin-stat-top">
                  <div className={`admin-stat-icon-box ${item.color}`}>
                    <Icon size={22} />
                  </div>
                  <span className="admin-stat-trend-badge">
                    <TrendingUp size={12} />
                    <span>{item.trend}</span>
                  </span>
                </div>

                <div className="admin-stat-body">
                  <span className="admin-stat-label">{item.title}</span>
                  <h2 className="admin-stat-value">{item.value}</h2>
                  <p className="admin-stat-desc">{item.subLabel}</p>
                </div>

                <div className="admin-stat-footer">
                  <span className="admin-stat-period">{item.trendPeriod}</span>
                  <span className="admin-stat-link">
                    Manage <ArrowUpRight size={14} />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ====================================================================
          4. CHARTS & ANALYTICS SECTION (RECHARTS)
         ==================================================================== */}
      <section className="admin-analytics-section" aria-label="Charts and analytics">
        {/* Row 1: Enrollment Growth & Attendance Overview */}
        <div className="admin-charts-grid-two">
          {/* Chart 1: Student Enrollment Growth */}
          <div className="admin-card admin-chart-card">
            <div className="admin-card-header">
              <div>
                <h4 className="admin-card-title">Student Enrollment Growth</h4>
                <p className="admin-card-subtitle">
                  Monthly cumulative enrollment vs school capacity
                </p>
              </div>
              <div className="admin-chart-filter-pills">
                <button
                  type="button"
                  className={`admin-filter-pill ${activeChartFilter === "year" ? "active" : ""}`}
                  onClick={() => setActiveChartFilter("year")}
                >
                  Full Year
                </button>
                <button
                  type="button"
                  className={`admin-filter-pill ${activeChartFilter === "term" ? "active" : ""}`}
                  onClick={() => setActiveChartFilter("term")}
                >
                  Semester 1
                </button>
                <button
                  type="button"
                  className={`admin-filter-pill ${activeChartFilter === "recent" ? "active" : ""}`}
                  onClick={() => setActiveChartFilter("recent")}
                >
                  Recent
                </button>
              </div>
            </div>

            <div className="admin-card-body admin-chart-container">
              <ResponsiveContainer width="100%" height={260}>
                <AreaChart
                  data={enrollmentDisplayData}
                  margin={{ top: 10, right: 10, left: -15, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="enrollmentGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2563eb" stopOpacity={0.35} />
                      <stop offset="95%" stopColor="#2563eb" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis
                    dataKey="month"
                    stroke="#94a3b8"
                    fontSize={12}
                    tickLine={false}
                    axisLine={{ stroke: "#e2e8f0" }}
                  />
                  <YAxis
                    stroke="#94a3b8"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    domain={["dataMin - 50", "auto"]}
                  />
                  <Tooltip content={<CustomChartTooltip unit="students" />} />
                  <Area
                    type="monotone"
                    dataKey="students"
                    name="Enrolled Students"
                    stroke="#2563eb"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#enrollmentGrad)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <div className="admin-card-footer admin-chart-footer">
              <div className="admin-legend-item">
                <span className="admin-legend-dot blue" />
                <span>Enrolled: <strong>1,248</strong></span>
              </div>
              <div className="admin-legend-item">
                <span className="admin-legend-dot neutral" />
                <span>Max Capacity: <strong>1,300 (96% filled)</strong></span>
              </div>
            </div>
          </div>

          {/* Chart 2: Student Attendance Overview */}
          <div className="admin-card admin-chart-card">
            <div className="admin-card-header">
              <div>
                <h4 className="admin-card-title">Student Attendance Performance</h4>
                <p className="admin-card-subtitle">
                  Average weekly attendance rates across Grades 1–12
                </p>
              </div>
              <button
                type="button"
                className="admin-btn admin-btn-sm admin-btn-outline"
                onClick={() => navigate("/admin/attendance")}
              >
                Attendance Log <ArrowRight size={13} />
              </button>
            </div>

            <div className="admin-card-body admin-chart-container">
              <ResponsiveContainer width="100%" height={260}>
                <LineChart
                  data={dashboardData.attendanceOverview}
                  margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis
                    dataKey="week"
                    stroke="#94a3b8"
                    fontSize={12}
                    tickLine={false}
                    axisLine={{ stroke: "#e2e8f0" }}
                  />
                  <YAxis
                    stroke="#94a3b8"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    domain={[85, 100]}
                    tickFormatter={(val) => `${val}%`}
                  />
                  <Tooltip content={<CustomChartTooltip unit="%" />} />
                  <Legend
                    verticalAlign="bottom"
                    iconType="circle"
                    wrapperStyle={{ paddingTop: "12px", fontSize: "12px" }}
                  />
                  <Line
                    type="monotone"
                    dataKey="present"
                    name="Present"
                    stroke="#16a34a"
                    strokeWidth={2.5}
                    dot={{ r: 3, fill: "#16a34a" }}
                    activeDot={{ r: 5 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="absent"
                    name="Absent"
                    stroke="#dc2626"
                    strokeWidth={2}
                    dot={{ r: 3, fill: "#dc2626" }}
                  />
                  <Line
                    type="monotone"
                    dataKey="late"
                    name="Late Arrival"
                    stroke="#d97706"
                    strokeWidth={2}
                    dot={{ r: 3, fill: "#d97706" }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="admin-card-footer admin-chart-footer">
              <span>Overall Average Present Rate: <strong>94.5%</strong></span>
              <span className="admin-status-positive">Target 95% met</span>
            </div>
          </div>
        </div>

        {/* Row 2: Distribution by Grade (Grades 1–12) & Gender Breakdown */}
        <div className="admin-charts-grid-distribution">
          {/* Chart 3: Student Distribution by Grade */}
          <div className="admin-card admin-chart-card admin-grade-card">
            <div className="admin-card-header">
              <div>
                <h4 className="admin-card-title">Student Distribution by Grade</h4>
                <p className="admin-card-subtitle">
                  Enrollment headcount across Grades 1 through 12
                </p>
              </div>
              <span className="admin-badge admin-badge-neutral">
                12 Active Grades
              </span>
            </div>

            <div className="admin-card-body admin-chart-container">
              <ResponsiveContainer width="100%" height={260}>
                <BarChart
                  data={dashboardData.gradeDistribution}
                  margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis
                    dataKey="grade"
                    stroke="#94a3b8"
                    fontSize={11}
                    tickLine={false}
                    axisLine={{ stroke: "#e2e8f0" }}
                  />
                  <YAxis
                    stroke="#94a3b8"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip content={<CustomChartTooltip unit="students" />} />
                  <Bar
                    dataKey="students"
                    name="Students"
                    fill="#3b82f6"
                    radius={[5, 5, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="admin-card-footer admin-chart-footer">
              <span>Primary (Gr 1-4): <strong>410</strong></span>
              <span>Middle (Gr 5-8): <strong>425</strong></span>
              <span>High (Gr 9-12): <strong>413</strong></span>
            </div>
          </div>

          {/* Chart 4: Gender Distribution */}
          <div className="admin-card admin-chart-card admin-gender-card">
            <div className="admin-card-header">
              <div>
                <h4 className="admin-card-title">Gender Distribution</h4>
                <p className="admin-card-subtitle">School-wide demographic balance</p>
              </div>
              <span className="admin-badge admin-badge-info">Verified</span>
            </div>

            <div className="admin-card-body admin-donut-body">
              <div className="admin-donut-wrapper">
                <ResponsiveContainer width="100%" height={210}>
                  <PieChart>
                    <Pie
                      data={dashboardData.genderDistribution}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={58}
                      outerRadius={84}
                      paddingAngle={4}
                    >
                      {dashboardData.genderDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomChartTooltip unit="students" />} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="admin-donut-center-text">
                  <strong>1,248</strong>
                  <span>Total</span>
                </div>
              </div>

              <div className="admin-gender-legend-list">
                {dashboardData.genderDistribution.map((item) => (
                  <div key={item.name} className="admin-gender-legend-item">
                    <div className="admin-gender-meta">
                      <span
                        className="admin-gender-dot"
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="admin-gender-name">{item.name}</span>
                    </div>
                    <div className="admin-gender-numbers">
                      <strong>{item.value}</strong>
                      <span className="admin-gender-pct">({item.percentage})</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="admin-card-footer admin-chart-footer">
              <span className="admin-gender-summary-text">
                Balanced ratio across all secondary and primary grade levels
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ====================================================================
          5. OPERATIONAL DETAILS (ACTIVITIES, REGISTRATIONS, EVENTS, ACADEMIC)
         ==================================================================== */}
      <section className="admin-operations-grid" aria-label="Administrative operations">
        {/* LEFT COLUMN: Recent Administrative Activities & Recent Registrations */}
        <div className="admin-ops-left-column">
          {/* Recent Administrative Activities */}
          <div className="admin-card admin-ops-card">
            <div className="admin-card-header">
              <div>
                <h4 className="admin-card-title">Recent Administrative Activities</h4>
                <p className="admin-card-subtitle">
                  Live audit log of recent management and faculty operations
                </p>
              </div>

              {/* Activity category filter */}
              <div className="admin-activity-filter">
                <button
                  type="button"
                  className={`admin-filter-pill-sm ${activityCategoryFilter === "all" ? "active" : ""}`}
                  onClick={() => setActivityCategoryFilter("all")}
                >
                  All
                </button>
                <button
                  type="button"
                  className={`admin-filter-pill-sm ${activityCategoryFilter === "student" ? "active" : ""}`}
                  onClick={() => setActivityCategoryFilter("student")}
                >
                  Students
                </button>
                <button
                  type="button"
                  className={`admin-filter-pill-sm ${activityCategoryFilter === "academic" ? "active" : ""}`}
                  onClick={() => setActivityCategoryFilter("academic")}
                >
                  Academic
                </button>
              </div>
            </div>

            <div className="admin-card-body admin-activity-feed-body">
              {filteredActivities.length > 0 ? (
                <div className="admin-activity-timeline">
                  {filteredActivities.map((act) => (
                    <div key={act.id} className="admin-activity-row">
                      <div className="admin-activity-icon-container">
                        <Activity size={15} />
                      </div>
                      <div className="admin-activity-info">
                        <div className="admin-activity-headline">
                          <strong className="admin-activity-title">{act.title}</strong>
                          <span className="admin-badge admin-badge-neutral admin-activity-badge">
                            {act.badge}
                          </span>
                        </div>
                        <div className="admin-activity-meta">
                          <span>
                            By <strong>{act.actor}</strong> ({act.role})
                          </span>
                          <span className="admin-meta-sep">•</span>
                          <span className="admin-activity-time">
                            <Clock size={12} /> {act.time}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="admin-empty-state">
                  <div className="admin-empty-icon">
                    <Activity size={24} />
                  </div>
                  <h5 className="admin-empty-title">No activities found</h5>
                  <p className="admin-empty-desc">
                    There are no recorded events matching this filter category.
                  </p>
                </div>
              )}
            </div>

            <div className="admin-card-footer">
              <button
                type="button"
                className="admin-dropdown-link"
                onClick={() => navigate("/admin/reports")}
              >
                View Full System Audit Logs <ArrowRight size={13} />
              </button>
            </div>
          </div>

          {/* Recent Registrations Table */}
          <div className="admin-card admin-ops-card">
            <div className="admin-card-header">
              <div>
                <h4 className="admin-card-title">Recent Registrations</h4>
                <p className="admin-card-subtitle">
                  Latest admitted students and faculty onboarded
                </p>
              </div>
              <button
                type="button"
                className="admin-btn admin-btn-sm admin-btn-outline"
                onClick={() => navigate("/admin/students")}
              >
                Manage All <ArrowRight size={13} />
              </button>
            </div>

            <div className="admin-table-container admin-reg-table-container">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Individual</th>
                    <th>ID Code</th>
                    <th>Role / Assignment</th>
                    <th>Date</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {dashboardData.recentRegistrations.map((reg) => (
                    <tr key={reg.id}>
                      <td>
                        <div className="admin-table-user-cell">
                          <div className="admin-avatar admin-avatar-sm">
                            {reg.name.charAt(0)}
                          </div>
                          <strong>{reg.name}</strong>
                        </div>
                      </td>
                      <td>
                        <span className="admin-code-pill">{reg.regId}</span>
                      </td>
                      <td>
                        <span className="admin-assignment-text">
                          {reg.role} • {reg.gradeOrDept}
                        </span>
                      </td>
                      <td>
                        <span className="admin-date-muted">{reg.date}</span>
                      </td>
                      <td>
                        <span
                          className={`admin-badge ${
                            reg.status === "Active"
                              ? "admin-badge-success"
                              : "admin-badge-warning"
                          }`}
                        >
                          <span className="admin-badge-dot" />
                          {reg.status}
                        </span>
                      </td>
                      <td>
                        <button
                          type="button"
                          className="admin-table-action-link"
                          onClick={() => {
                            if (reg.role === "Student") navigate("/admin/students");
                            else navigate("/admin/teachers");
                          }}
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Academic Year Summary, Upcoming Events, Pending Alerts */}
        <div className="admin-ops-right-column">
          {/* Academic Overview Summary Card */}
          <div className="admin-card admin-summary-card">
            <div className="admin-card-header">
              <div className="admin-academic-header-title">
                <School size={18} className="admin-school-icon" />
                <div>
                  <h4 className="admin-card-title">Academic Year Status</h4>
                  <p className="admin-card-subtitle">Active session milestones</p>
                </div>
              </div>
              <span className="admin-badge admin-badge-success">Active Session</span>
            </div>

            <div className="admin-card-body">
              <div className="admin-academic-key-metric">
                <span className="admin-academic-year-text">
                  {dashboardData.academicYear}
                </span>
                <span className="admin-semester-pill">
                  {dashboardData.currentSemester}
                </span>
              </div>

              {/* Progress Bar for Semester Progress */}
              <div className="admin-term-progress-wrap">
                <div className="admin-term-progress-labels">
                  <span>Semester 1 Progress</span>
                  <strong>65% Elapsed</strong>
                </div>
                <div className="admin-term-track">
                  <div className="admin-term-fill" style={{ width: "65%" }} />
                </div>
              </div>

              {/* Quick stats grid */}
              <div className="admin-academic-mini-grid">
                <div className="admin-mini-stat">
                  <span>Total Grades</span>
                  <strong>12 (Gr 1–12)</strong>
                </div>
                <div className="admin-mini-stat">
                  <span>Active Sections</span>
                  <strong>36 Sections</strong>
                </div>
                <div className="admin-mini-stat">
                  <span>Curriculum</span>
                  <strong>28 Subjects</strong>
                </div>
                <div className="admin-mini-stat">
                  <span>Staff Assigned</span>
                  <strong>100% Covered</strong>
                </div>
              </div>
            </div>

            <div className="admin-card-footer">
              <button
                type="button"
                className="admin-dropdown-link"
                onClick={() => navigate("/admin/settings")}
              >
                Academic Calendar Settings <ArrowRight size={13} />
              </button>
            </div>
          </div>

          {/* Upcoming Events & Examinations */}
          <div className="admin-card admin-events-card">
            <div className="admin-card-header">
              <div>
                <h4 className="admin-card-title">Upcoming Events & Exams</h4>
                <p className="admin-card-subtitle">School calendar deadlines</p>
              </div>
              <CalendarDays size={18} className="admin-muted-icon" />
            </div>

            <div className="admin-card-body admin-events-list">
              {dashboardData.upcomingEvents.map((evt) => (
                <div key={evt.id} className="admin-event-item">
                  <div className="admin-event-date-box">
                    <span className="admin-event-month">
                      {evt.shortDate.split(" ")[0]}
                    </span>
                    <span className="admin-event-day">
                      {evt.shortDate.split(" ")[1]}
                    </span>
                  </div>
                  <div className="admin-event-details">
                    <div className="admin-event-header-row">
                      <strong className="admin-event-title">{evt.title}</strong>
                      <span className={`admin-badge admin-badge-${evt.badgeColor}`}>
                        {evt.category}
                      </span>
                    </div>
                    <span className="admin-event-time">
                      <Clock size={11} /> {evt.time}
                    </span>
                    <span className="admin-event-location">{evt.location}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="admin-card-footer">
              <button
                type="button"
                className="admin-dropdown-link"
                onClick={() => navigate("/admin/announcements")}
              >
                View Full School Calendar <ArrowRight size={13} />
              </button>
            </div>
          </div>

          {/* Pending Alerts & Administrative Action Items */}
          <div className="admin-card admin-alerts-card">
            <div className="admin-card-header">
              <div className="admin-card-title-icon-group">
                <AlertCircle size={18} className="admin-alert-card-icon" />
                <h4 className="admin-card-title">Pending Action Items</h4>
              </div>
              <span className="admin-badge admin-badge-warning">3 Urgent</span>
            </div>

            <div className="admin-card-body admin-pending-body">
              <div className="admin-pending-item">
                <div className="admin-pending-dot warning" />
                <div className="admin-pending-info">
                  <strong>5 New Student Admissions</strong>
                  <p>Applications awaiting review before enrollment</p>
                </div>
                <button
                  type="button"
                  className="admin-btn-action-pill"
                  onClick={() => navigate("/admin/students")}
                >
                  Review
                </button>
              </div>

              <div className="admin-pending-item">
                <div className="admin-pending-dot danger" />
                <div className="admin-pending-info">
                  <strong>Grade 11 Chemistry Teacher</strong>
                  <p>Section B lab session needs teacher assignment</p>
                </div>
                <button
                  type="button"
                  className="admin-btn-action-pill"
                  onClick={() => navigate("/admin/classes")}
                >
                  Assign
                </button>
              </div>

              <div className="admin-pending-item">
                <div className="admin-pending-dot info" />
                <div className="admin-pending-info">
                  <strong>Scheduled Database Backup</strong>
                  <p>Monthly system backup check due in 3 days</p>
                </div>
                <button
                  type="button"
                  className="admin-btn-action-pill"
                  onClick={() => navigate("/admin/settings")}
                >
                  Verify
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ====================================================================
          6. QUICK ACTIONS MODAL DIALOG
         ==================================================================== */}
      <AnimatePresence>
        {showQuickActionModal && (
          <div
            className="admin-modal-backdrop"
            onClick={() => setShowQuickActionModal(false)}
          >
            <motion.div
              className="admin-modal-container admin-quick-action-modal"
              onClick={(e) => e.stopPropagation()}
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.18 }}
            >
              <div className="admin-modal-header">
                <div>
                  <h3 className="admin-modal-title">Administrative Quick Actions</h3>
                  <p className="admin-card-subtitle">
                    Select an operational shortcut to navigate directly to the workflow
                  </p>
                </div>
                <button
                  type="button"
                  className="admin-btn-icon"
                  onClick={() => setShowQuickActionModal(false)}
                  aria-label="Close dialog"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="admin-modal-body admin-modal-quick-grid">
                {quickActions.map((action) => {
                  const Icon = action.icon;
                  return (
                    <button
                      key={`modal-${action.id}`}
                      type="button"
                      className={`admin-modal-action-card ${action.color}`}
                      onClick={() => {
                        setShowQuickActionModal(false);
                        navigate(action.path);
                      }}
                    >
                      <div className="admin-modal-action-icon">
                        <Icon size={22} />
                      </div>
                      <div className="admin-modal-action-text">
                        <strong>{action.title}</strong>
                        <span>{action.desc}</span>
                      </div>
                      <ArrowRight size={16} className="admin-modal-arrow" />
                    </button>
                  );
                })}
              </div>

              <div className="admin-modal-footer">
                <button
                  type="button"
                  className="admin-btn admin-btn-secondary"
                  onClick={() => setShowQuickActionModal(false)}
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ====================================================================
          7. DEMO DATA TRANSPARENCY MODAL
         ==================================================================== */}
      <AnimatePresence>
        {showDemoInfoModal && (
          <div
            className="admin-modal-backdrop"
            onClick={() => setShowDemoInfoModal(false)}
          >
            <motion.div
              className="admin-modal-container admin-info-modal"
              onClick={(e) => e.stopPropagation()}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
            >
              <div className="admin-modal-header">
                <div className="admin-demo-modal-title-group">
                  <Info size={20} className="admin-demo-modal-icon" />
                  <h3 className="admin-modal-title">Data Source Information</h3>
                </div>
                <button
                  type="button"
                  className="admin-btn-icon"
                  onClick={() => setShowDemoInfoModal(false)}
                >
                  <X size={18} />
                </button>
              </div>

              <div className="admin-modal-body">
                <p>
                  The statistics, charts, and activity records currently shown on the Admin Dashboard are loaded from the centralized <strong>LocalStorage Data Service</strong> (<code>dashboardStorage.js</code>).
                </p>
                <div className="admin-info-bullet-box">
                  <div>
                    <strong>• Grades 1–12 School Profile:</strong> Sample dataset includes 1,248 students, 84 teachers, 36 classes, and 28 subjects.
                  </div>
                  <div>
                    <strong>• Cross-module Sync:</strong> Registered parents in the registrar module are automatically linked and counted in real-time.
                  </div>
                  <div>
                    <strong>• Backend Ready:</strong> When your MySQL / Express backend endpoints are activated, the storage adapter can be swapped with zero UI changes.
                  </div>
                </div>
              </div>

              <div className="admin-modal-footer">
                <button
                  type="button"
                  className="admin-btn admin-btn-primary"
                  onClick={() => setShowDemoInfoModal(false)}
                >
                  Understood
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
