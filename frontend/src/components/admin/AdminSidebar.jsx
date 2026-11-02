
import { useState } from "react";
import { NavLink } from "react-router-dom";
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
} from "lucide-react";

import "../../styles/admin/AdminSidebar.css";

function AdminSidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openMenus, setOpenMenus] = useState({
    users: true,
    academics: false,
    system: false,
  });

  const toggleMenu = (menu) => {
    setOpenMenus((previous) => ({
      ...previous,
      [menu]: !previous[menu],
    }));
  };

  const closeMobile = () => setMobileOpen(false);

  const menuGroups = [
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
  ];

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

  const renderLink = (item) => {
    const Icon = item.icon;

    return (
      <NavLink
        key={item.path}
        to={item.path}
        onClick={closeMobile}
        title={collapsed ? item.label : ""}
        className={({ isActive }) =>
          `admin-nav-link ${isActive ? "active" : ""}`
        }
      >
        <Icon size={19} />
        {!collapsed && <span>{item.label}</span>}
      </NavLink>
    );
  };

  const renderGroup = (group) => {
    const Icon = group.icon;
    const isOpen = openMenus[group.id];

    return (
      <div className="admin-nav-group" key={group.id}>
        <button
          type="button"
          className="admin-group-button"
          title={collapsed ? group.label : ""}
          onClick={() => {
            if (collapsed) {
              setCollapsed(false);
              setOpenMenus((previous) => ({
                ...previous,
                [group.id]: true,
              }));
            } else {
              toggleMenu(group.id);
            }
          }}
        >
          <Icon size={19} />

          {!collapsed && (
            <>
              <span>{group.label}</span>
              <ChevronDown
                className={`admin-chevron ${isOpen ? "rotated" : ""}`}
                size={16}
              />
            </>
          )}
        </button>

        {!collapsed && isOpen && (
          <div className="admin-submenu">
            {group.children.map((item) => renderLink(item))}
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      <button
        type="button"
        className="admin-mobile-toggle"
        onClick={() => setMobileOpen(!mobileOpen)}
        aria-label="Toggle navigation"
      >
        {mobileOpen ? <X size={22} /> : <Menu size={22} />}
      </button>

      {mobileOpen && (
        <button
          type="button"
          className="admin-mobile-overlay"
          onClick={closeMobile}
          aria-label="Close navigation"
        />
      )}

      <aside
        className={`admin-sidebar ${collapsed ? "collapsed" : ""} ${
          mobileOpen ? "mobile-open" : ""
        }`}
      >
        <div className="admin-sidebar-brand">
          <div className="admin-brand-icon">
            <School size={24} />
          </div>

          {!collapsed && (
            <div className="admin-brand-text">
              <h2>School Management</h2>
              <span>Admin Panel</span>
            </div>
          )}

          <button
            type="button"
            className="admin-collapse-button"
            onClick={() => setCollapsed(!collapsed)}
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? (
              <ChevronRight size={18} />
            ) : (
              <ChevronLeft size={18} />
            )}
          </button>
        </div>

        <nav className="admin-sidebar-nav">
          {!collapsed && <p className="admin-section-label">MAIN MENU</p>}

          {mainLinks.slice(0, 1).map(renderLink)}

          {!collapsed && (
            <p className="admin-section-label">USER & ACADEMIC</p>
          )}

          {menuGroups.slice(0, 2).map(renderGroup)}

          {!collapsed && (
            <p className="admin-section-label">SCHOOL OPERATIONS</p>
          )}

          {mainLinks.slice(1).map(renderLink)}

          {!collapsed && (
            <p className="admin-section-label">CONFIGURATION</p>
          )}

          {renderGroup(menuGroups[2])}

          <div className="admin-sidebar-divider" />

          {renderLink(profileLink)}
        </nav>

        {!collapsed && (
          <div className="admin-sidebar-footer">
            <div className="admin-footer-icon">
              <ShieldCheck size={19} />
            </div>
            <div>
              <strong>Administrator</strong>
              <span>System Control</span>
            </div>
          </div>
        )}
      </aside>
    </>
  );
}

export default AdminSidebar;
