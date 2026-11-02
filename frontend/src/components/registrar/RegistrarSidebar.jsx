
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  GraduationCap,
  LayoutDashboard,
  UserRound,
  Users,
  FolderOpen,
  BriefcaseBusiness,
  MessageSquare,
  ChartNoAxesColumnIncreasing,
  ChevronDown,
  UserPlus,
  UserRoundSearch,
  Layers,
  TrendingUp,
  ArrowLeftRight,
  FileText,
  UsersRound,
  Award,
  ClipboardCheck,
  CalendarDays,
  ListTodo,
  CalendarOff,
  Wallet,
  Megaphone,
  MessagesSquare,
  Settings,
  PanelLeftClose,
  PanelLeftOpen,
  X,
} from "lucide-react";

import "../../styles/registrar/RegistrarSidebar.css";

const menuGroups = [
  {
    title: "My Account",
    icon: UserRound,
    items: [
      { label: "My Profile", page: "profile", icon: UserRound },
      { label: "Settings", page: "settings", icon: Settings },
    ],
  },
  {
    title: "Student Management",
    icon: Users,
    items: [
      { label: "Student Registration", page: "registration", icon: UserPlus },
      { label: "Manage Students", page: "students", icon: UserRoundSearch },
      { label: "Grade & Section", page: "grades", icon: Layers },
      { label: "Student Promotion", page: "promotion", icon: TrendingUp },
      { label: "Student Transfer", page: "transfer", icon: ArrowLeftRight },
    ],
  },
  {
    title: "Student Records",
    icon: FolderOpen,
    items: [
      { label: "Student Documents", page: "documents", icon: FileText },
      { label: "Parent Information", page: "parents", icon: UsersRound },
      { label: "Certificates & ID Cards", page: "certificates", icon: Award },
    ],
  },
  {
    title: "Staff Services",
    icon: BriefcaseBusiness,
    items: [
      { label: "Attendance", page: "attendance", icon: ClipboardCheck },
      { label: "Work Schedule", page: "schedule", icon: CalendarDays },
      { label: "Tasks", page: "tasks", icon: ListTodo },
      { label: "Leave Request", page: "leave", icon: CalendarOff },
      { label: "Salary Information", page: "salary", icon: Wallet },
    ],
  },
  {
    title: "Communication",
    icon: MessageSquare,
    items: [
      { label: "Announcements", page: "announcements", icon: Megaphone },
      { label: "Messages", page: "messages", icon: MessagesSquare },
    ],
  },
  {
    title: "Reports",
    icon: ChartNoAxesColumnIncreasing,
    items: [
      { label: "Student Reports", page: "student-reports", icon: FileText },
      {
        label: "Staff Reports",
        page: "staff-reports",
        icon: ChartNoAxesColumnIncreasing,
      },
    ],
  },
];

function RegistrarSidebar({
  activePage = "dashboard",
  onNavigate = () => {},
  collapsed = false,
  onToggleCollapse = () => {},
  mobileOpen = false,
  onCloseMobile = () => {},
}) {
  const [openGroups, setOpenGroups] = useState([
    "Student Management",
  ]);

  const toggleGroup = (groupTitle) => {
    setOpenGroups((previous) =>
      previous.includes(groupTitle)
        ? previous.filter((item) => item !== groupTitle)
        : [...previous, groupTitle]
    );
  };

  const navigate = (page) => {
    onNavigate(page);
    onCloseMobile();
  };

  const isGroupActive = (group) =>
    group.items.some((item) => item.page === activePage);

  const sidebarContent = (
    <>
      {/* Sidebar Brand */}
      <div className="registrar-sidebar-brand">
        <div className="registrar-brand-icon">
          <GraduationCap size={25} />
        </div>

        {!collapsed && (
          <div className="registrar-brand-text">
            <h2>Registrar</h2>
            <span>Staff Account</span>
          </div>
        )}

        <button
          className="registrar-mobile-close"
          onClick={onCloseMobile}
          aria-label="Close sidebar"
        >
          <X size={20} />
        </button>
      </div>

      {/* Main Menu */}
      <div className="registrar-sidebar-menu">
        <p className="registrar-menu-label">
          {!collapsed ? "MAIN MENU" : "MENU"}
        </p>

        {/* Dashboard */}
        <button
          className={`registrar-menu-item ${
            activePage === "dashboard" ? "active" : ""
          }`}
          onClick={() => navigate("dashboard")}
          title="Dashboard"
        >
          <LayoutDashboard size={19} />
          {!collapsed && <span>Dashboard</span>}
        </button>

        {/* Menu Groups */}
        {!collapsed && (
          <div className="registrar-menu-groups">
            {menuGroups.map((group) => {
              const GroupIcon = group.icon;
              const isOpen = openGroups.includes(group.title);
              const groupActive = isGroupActive(group);

              return (
                <div className="registrar-menu-group" key={group.title}>
                  <button
                    className={`registrar-group-button ${
                      groupActive ? "group-active" : ""
                    }`}
                    onClick={() => toggleGroup(group.title)}
                  >
                    <GroupIcon size={19} />
                    <span>{group.title}</span>

                    <motion.span
                      className="registrar-chevron"
                      animate={{ rotate: isOpen ? 180 : 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <ChevronDown size={16} />
                    </motion.span>
                  </button>

                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        className="registrar-submenu"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25 }}
                      >
                        {group.items.map((item) => {
                          const ItemIcon = item.icon;

                          return (
                            <button
                              key={item.page}
                              className={`registrar-submenu-item ${
                                activePage === item.page ? "active" : ""
                              }`}
                              onClick={() => navigate(item.page)}
                            >
                              <ItemIcon size={16} />
                              <span>{item.label}</span>
                            </button>
                          );
                        })}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        )}

        {/* Collapsed Menu */}
        {collapsed && (
          <div className="registrar-collapsed-menu">
            {menuGroups.map((group) => {
              const GroupIcon = group.icon;

              return (
                <button
                  key={group.title}
                  className={`registrar-collapsed-item ${
                    isGroupActive(group) ? "active" : ""
                  }`}
                  title={group.title}
                  onClick={() => {
                    onToggleCollapse();
                    setOpenGroups((previous) =>
                      previous.includes(group.title)
                        ? previous
                        : [...previous, group.title]
                    );
                  }}
                >
                  <GroupIcon size={19} />
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Bottom: Collapse Sidebar Only */}
      <div className="registrar-sidebar-bottom">
        <button
          className="registrar-collapse-button"
          onClick={onToggleCollapse}
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? (
            <PanelLeftOpen size={19} />
          ) : (
            <PanelLeftClose size={19} />
          )}

          {!collapsed && <span>Collapse Sidebar</span>}
        </button>
      </div>
    </>
  );

  return (
    <>
      {mobileOpen && (
        <div
          className="registrar-sidebar-overlay"
          onClick={onCloseMobile}
        />
      )}

      <aside
        className={`registrar-sidebar ${
          collapsed ? "collapsed" : ""
        } ${mobileOpen ? "mobile-open" : ""}`}
      >
        {sidebarContent}
      </aside>
    </>
  );
}

export default RegistrarSidebar;
