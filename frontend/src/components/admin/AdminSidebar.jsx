import { useState, useEffect, useMemo } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  BookOpen,
  CalendarCheck,
  ClipboardList,
  Wallet,
  Megaphone,
  BarChart3,
  Settings,
  UserCircle,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  School,
  UserRound,
  BriefcaseBusiness,
  UsersRound,
  Layers,
  CalendarDays,
  Database,
  ShieldCheck,
  Menu,
  X,
  LogOut,
} from "lucide-react";

import { getAuthenticatedAdmin } from "../../utils/admin/dashboardStorage";
import "../../styles/admin/AdminSidebar.css";

export default function AdminSidebar() {
  const location = useLocation();
  const navigate = useNavigate();

  // Persistent collapsed state for desktop
  const [collapsed, setCollapsed] = useState(() => {
    try {
      return localStorage.getItem("sms_admin_sidebar_collapsed") === "true";
    } catch {
      return false;
    }
  });

  const [mobileOpen, setMobileOpen] = useState(false);
  const [adminUser] = useState(() => getAuthenticatedAdmin());

  // On mobile drawer mode, always display full width and all labels
  const isEffectiveCollapsed = collapsed && !mobileOpen;

  // Menu groups definitions (exact routes, labels, and icons preserved)
  const menuGroups = useMemo(
    () => [
      {
        id: "users",
        label: "User Management",
        icon: Users,
        children: [
          { label: "Students", path: "/admin/students", icon: GraduationCap },
          { label: "Teachers", path: "/admin/teachers", icon: UserRound },
          { label: "Staff", path: "/admin/staff", icon: BriefcaseBusiness },
          { label: "Parents", path: "/admin/parents", icon: UsersRound },
          { label: "User Accounts", path: "/admin/users", icon: ShieldCheck },
        ],
      },
      {
        id: "academics",
        label: "Academic Management",
        icon: GraduationCap,
        children: [
          { label: "Grades & Sections", path: "/admin/classes", icon: Layers },
          { label: "Subjects", path: "/admin/subjects", icon: BookOpen },
          { label: "Academic Years", path: "/admin/academic-years", icon: CalendarDays },
        ],
      },
      {
        id: "system",
        label: "System Management",
        icon: Settings,
        children: [
          { label: "School Information", path: "/admin/school-information", icon: School },
          { label: "System Settings", path: "/admin/settings", icon: Settings },
          { label: "Database Backup", path: "/admin/database-backup", icon: Database },
          { label: "Logs & Security", path: "/admin/logs", icon: ShieldCheck },
        ],
      },
    ],
    []
  );

  // Group accordion state: automatically open group matching current route
  const [openMenus, setOpenMenus] = useState(() => {
    const initial = { users: true, academics: false, system: false };
    menuGroups.forEach((group) => {
      const hasActiveChild = group.children.some(
        (child) => location.pathname === child.path
      );
      if (hasActiveChild) {
        initial[group.id] = true;
      }
    });
    return initial;
  });

  // Keep openMenus synchronized when URL changes
  useEffect(() => {
    menuGroups.forEach((group) => {
      const hasActiveChild = group.children.some(
        (child) => location.pathname === child.path
      );
      if (hasActiveChild) {
        setOpenMenus((prev) => ({ ...prev, [group.id]: true }));
      }
    });
  }, [location.pathname, menuGroups]);

  // Synchronize CSS variable with MainLayout and persist preference
  useEffect(() => {
    try {
      localStorage.setItem("sms_admin_sidebar_collapsed", String(collapsed));
    } catch {
      // Storage unavailable fallback
    }
    const width = collapsed ? "80px" : "280px";
    document.documentElement.style.setProperty("--admin-sidebar-width", width);

    if (collapsed) {
      document.body.classList.add("admin-sidebar-collapsed");
    } else {
      document.body.classList.remove("admin-sidebar-collapsed");
    }

    return () => {
      document.body.classList.remove("admin-sidebar-collapsed");
    };
  }, [collapsed]);

  // Lock mobile body scroll while drawer is open
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  const toggleGroup = (groupId) => {
    if (isEffectiveCollapsed) {
      setCollapsed(false);
      setOpenMenus((prev) => ({ ...prev, [groupId]: true }));
    } else {
      setOpenMenus((prev) => ({ ...prev, [groupId]: !prev[groupId] }));
    }
  };

  const closeMobile = () => setMobileOpen(false);

  // Standalone top-level links
  const mainLinks = [
    { label: "Dashboard", path: "/admin/dashboard", icon: LayoutDashboard },
    { label: "Attendance Management", path: "/admin/attendance", icon: CalendarCheck },
    { label: "Examination & Results", path: "/admin/examinations", icon: ClipboardList },
    { label: "Fees & Finance", path: "/admin/finance", icon: Wallet },
    { label: "Announcements", path: "/admin/announcements", icon: Megaphone },
    { label: "Reports", path: "/admin/reports", icon: BarChart3 },
  ];

  const profileLink = {
    label: "My Profile",
    path: "/admin/profile",
    icon: UserCircle,
  };

  // Sign out preserving session cleanup
  const handleSignOut = () => {
    if (window.confirm("Are you sure you want to sign out of the administrator panel?")) {
      localStorage.removeItem("token");
      sessionStorage.removeItem("token");
      localStorage.removeItem("user");
      sessionStorage.removeItem("user");
      closeMobile();
      navigate("/login");
    }
  };

  // Render navigation link item
  const renderLink = (item, isSubmenu = false) => {
    const Icon = item.icon;
    const isCurrent = location.pathname === item.path;

    return (
      <NavLink
        key={item.path}
        to={item.path}
        onClick={closeMobile}
        data-tooltip={isEffectiveCollapsed ? item.label : undefined}
        className={({ isActive }) =>
          `admin-sidebar-link ${isSubmenu ? "is-submenu-child" : ""} ${
            isActive || isCurrent ? "active" : ""
          }`
        }
      >
        <span className="admin-link-active-bar" aria-hidden="true" />
        <span className="admin-link-icon-wrap">
          <Icon size={isSubmenu ? 17 : 19} />
        </span>
        {!isEffectiveCollapsed && <span className="admin-link-label">{item.label}</span>}
        {!isEffectiveCollapsed && isCurrent && (
          <span className="admin-link-active-indicator" aria-hidden="true" />
        )}
      </NavLink>
    );
  };

  // Render expandable group
  const renderGroup = (group) => {
    const Icon = group.icon;
    const isOpen = openMenus[group.id];
    const isAnyChildActive = group.children.some(
      (child) => location.pathname === child.path
    );

    return (
      <div
        className={`admin-sidebar-group ${isOpen ? "group-open" : ""} ${
          isAnyChildActive ? "child-is-active" : ""
        }`}
        key={group.id}
      >
        <button
          type="button"
          className={`admin-group-btn ${isAnyChildActive ? "group-active" : ""}`}
          onClick={() => toggleGroup(group.id)}
          data-tooltip={isEffectiveCollapsed ? group.label : undefined}
          aria-expanded={isOpen}
        >
          <span className="admin-link-active-bar" aria-hidden="true" />
          <span className="admin-link-icon-wrap">
            <Icon size={19} />
          </span>

          {/* Active dot badge for collapsed mode */}
          {isEffectiveCollapsed && isAnyChildActive && (
            <span
              className="admin-collapsed-child-active-dot"
              title="Active section inside"
              aria-hidden="true"
            />
          )}

          {!isEffectiveCollapsed && (
            <>
              <span className="admin-link-label">{group.label}</span>
              {isAnyChildActive && !isOpen && (
                <span
                  className="admin-group-dot-indicator"
                  title="Active section inside"
                  aria-hidden="true"
                />
              )}
              <ChevronDown
                className={`admin-group-chevron ${isOpen ? "rotated" : ""}`}
                size={16}
                aria-hidden="true"
              />
            </>
          )}
        </button>

        {!isEffectiveCollapsed && isOpen && (
          <div className="admin-sidebar-submenu">
            {group.children.map((item) => renderLink(item, true))}
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      {/* Mobile Drawer Floating Toggle Button */}
      <button
        type="button"
        className="admin-mobile-toggle-btn"
        onClick={() => setMobileOpen(!mobileOpen)}
        aria-label={mobileOpen ? "Close navigation menu" : "Open navigation menu"}
        aria-expanded={mobileOpen}
      >
        {mobileOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Mobile Backdrop with Blur */}
      {mobileOpen && (
        <div
          className="admin-mobile-drawer-backdrop"
          onClick={closeMobile}
          aria-hidden="true"
        />
      )}

      {/* Enterprise Admin Sidebar Container */}
      <aside
        className={`admin-sidebar-container ${isEffectiveCollapsed ? "is-collapsed" : ""} ${
          mobileOpen ? "is-mobile-open" : ""
        }`}
        aria-label="Admin Navigation Sidebar"
      >
        {/* Brand Header */}
        <div className="admin-sidebar-brand-bar">
          <div className="admin-brand-logo-box" title="EduManage School Management">
            <School size={22} className="admin-school-svg" />
          </div>

          {!isEffectiveCollapsed && (
            <div className="admin-brand-details">
              <h2 className="admin-brand-name">EduManage</h2>
              <div className="admin-brand-badge-row">
                <span className="admin-system-chip">
                  <span className="admin-chip-dot" />
                  ADMIN ERP
                </span>
              </div>
            </div>
          )}

          {/* Mobile Drawer Quick Close Button */}
          <button
            type="button"
            className="admin-mobile-drawer-close-btn"
            onClick={closeMobile}
            aria-label="Close navigation drawer"
          >
            <X size={18} />
          </button>

          {/* Desktop Collapse Toggle Button */}
          <button
            type="button"
            className="admin-collapse-toggle-btn"
            onClick={() => setCollapsed((prev) => !prev)}
            title={collapsed ? "Expand sidebar (280px)" : "Collapse sidebar (80px)"}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? <ChevronRight size={15} /> : <ChevronLeft size={15} />}
          </button>
        </div>

        {/* Scrollable Navigation Area with Slim Scrollbar */}
        <nav className="admin-sidebar-scroll-nav">
          {!isEffectiveCollapsed && (
            <p className="admin-nav-section-title">MAIN NAVIGATION</p>
          )}
          {mainLinks.slice(0, 1).map((item) => renderLink(item))}

          {!isEffectiveCollapsed && (
            <p className="admin-nav-section-title">CORE MANAGEMENT</p>
          )}
          {renderGroup(menuGroups[0])}
          {renderGroup(menuGroups[1])}

          {!isEffectiveCollapsed && (
            <p className="admin-nav-section-title">OPERATIONS</p>
          )}
          {mainLinks.slice(1).map((item) => renderLink(item))}

          {!isEffectiveCollapsed && (
            <p className="admin-nav-section-title">CONFIGURATION</p>
          )}
          {renderGroup(menuGroups[2])}

          <div className="admin-sidebar-nav-divider" />

          {renderLink(profileLink)}
        </nav>

        {/* Pinned Bottom User Profile Section */}
        <div className="admin-sidebar-profile-footer">
          <div
            className="admin-footer-avatar-wrap"
            data-tooltip={
              isEffectiveCollapsed
                ? `${adminUser.name} • ${adminUser.role}`
                : undefined
            }
          >
            <div className="admin-footer-avatar">
              <span>{adminUser.initials}</span>
              <span className="admin-online-badge" title="Online" />
            </div>
          </div>

          {!isEffectiveCollapsed && (
            <div className="admin-footer-user-meta">
              <strong className="admin-footer-user-name" title={adminUser.name}>
                {adminUser.name}
              </strong>
              <span className="admin-footer-user-role" title={adminUser.role}>
                {adminUser.role}
              </span>
            </div>
          )}

          {/* Logout Action Button */}
          <button
            type="button"
            className="admin-footer-logout-btn"
            onClick={handleSignOut}
            title="Sign out of system"
            aria-label="Sign out"
            data-tooltip={isEffectiveCollapsed ? "Sign Out" : undefined}
          >
            <LogOut size={16} />
          </button>
        </div>
      </aside>
    </>
  );
}
