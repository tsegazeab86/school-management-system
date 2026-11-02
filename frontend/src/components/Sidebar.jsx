import { NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  BookOpen,
  CalendarCheck,
  ClipboardList,
  FileBarChart,
  FileText,
  Wallet,
  CreditCard,
  BookPlus,
  BookCheck,
  Tags,
  Clock,
  // Library,
  // BookMarked,
  Settings,
  TrendingDown,
  TrendingUp,
  School,
  
  X,
  Receipt,
  CalendarDays,
  Megaphone,
  MessageCircle,
  UserRound,
} from "lucide-react";

const menus = {
  admin: [
    { name: "Dashboard", path: "dashboard", icon: LayoutDashboard },
    { name: "Manage Students", path: "students", icon: GraduationCap },
    { name: "Manage Teachers", path: "teachers", icon: Users },
    { name: "Manage Classes", path: "classes", icon: School },
    { name: "Manage Subjects", path: "subjects", icon: BookOpen },
    { name: "Manage Users", path: "users", icon: Users },
    { name: "Reports", path: "reports", icon: FileText },
    { name: "Settings", path: "settings", icon: Settings },
  ],

  teacher: [
    { name: "Dashboard", path: "dashboard", icon: LayoutDashboard },
    { name: "My Students", path: "students", icon: Users },
    { name: "My Classes", path: "my-classes", icon: School },
    { name: "Attendance", path: "attendance", icon: CalendarCheck },
    { name: "Learning Materials", path: "materials", icon: BookOpen },
    { name: "Assignments", path: "assignments", icon: ClipboardList },
    { name: "Exams", path: "exams", icon: FileText },
    { name: "Grades", path: "grades", icon: GraduationCap },
    { name: "Announcements", path: "announcements", icon: Megaphone },
    { name: "Messages", path: "messages", icon: MessageCircle },
    { name: "Reports", path: "reports", icon: FileText },
  ],

  student: [
    { name: "Dashboard", path: "dashboard", icon: LayoutDashboard },
    { name: "My Profile", path: "profile", icon: UserRound },
    { name: "My Attendance", path: "attendance", icon: CalendarCheck },
    { name: "Exams & Results", path: "results", icon: GraduationCap },
    { name: "Assignments", path: "assignments", icon: ClipboardList },
    { name: "Learning Materials", path: "materials", icon: BookOpen },
    { name: "Timetable", path: "timetable", icon: CalendarCheck },
    { name: "Announcements", path: "announcements", icon: Megaphone },
    { name: "Messages", path: "messages", icon: MessageCircle },
    { name: "Fees & Payments", path: "fees", icon: Wallet },
  ],
  parent: [
    { name: "Dashboard", path: "dashboard", icon: LayoutDashboard },
    { name: "My Children", path: "children", icon: Users },
    { name: "Attendance", path: "attendance", icon: CalendarCheck },
    { name: "Exams & Results", path: "results", icon: GraduationCap },
    { name: "Assignments", path: "assignments", icon: ClipboardList },
    { name: "Timetable", path: "timetable", icon: CalendarDays },
    { name: "Fees & Payments", path: "fees", icon: Wallet },
    { name: "Announcements", path: "announcements", icon: Megaphone },
    { name: "Messages", path: "messages", icon: MessageCircle },
    { name: "Reports", path: "reports", icon: FileBarChart },
  ],

  accountant: [
    { name: "Dashboard", path: "dashboard", icon: LayoutDashboard },
    { name: "Student Fees", path: "fees", icon: Wallet },
    { name: "Payments", path: "payments", icon: CreditCard },
    { name: "Receipts", path: "receipts", icon: Receipt },
    { name: "Expenses", path: "expenses", icon: TrendingDown },
    { name: "Income", path: "income", icon: TrendingUp },
    { name: "Overdue Fees", path: "overdue", icon: CalendarDays },
    { name: "Financial Reports", path: "reports", icon: FileText },
    { name: "Messages", path: "messages", icon: MessageCircle },
    { name: "Profile & Settings", path: "profile", icon: Settings },
  ],
  librarian: [
    { name: "Dashboard", path: "dashboard", icon: LayoutDashboard },
    { name: "Manage Books", path: "books", icon: BookOpen },
    { name: "Issue Books", path: "issue", icon: BookPlus },
    { name: "Return Books", path: "return", icon: BookCheck },
    { name: "Overdue Books", path: "overdue", icon: Clock },
    { name: "Book Categories", path: "categories", icon: Tags },
    { name: "Library Reports", path: "reports", icon: FileText },
    { name: "Messages", path: "messages", icon: MessageCircle },
    { name: "Profile & Settings", path: "profile", icon: Settings },
  ],
};

function Sidebar({ open, onClose }) {
  const location = useLocation();
  const role = location.pathname.split("/")[1] || "admin";
  const roleMenus = menus[role] || menus.admin;

  return (
    <>
      {open && (
        <div className="sidebar-overlay" onClick={onClose}></div>
      )}

      <aside className={`sidebar ${open ? "sidebar-open" : ""}`}>
        <div className="sidebar-brand">
          <div className="brand-icon">
            <School size={25} />
          </div>

          <div>
            <h2>EduManage</h2>
            <span>School Management</span>
          </div>

          <button className="sidebar-close" onClick={onClose}>
            <X size={22} />
          </button>
        </div>

        <div className="sidebar-profile">
          <div className="profile-avatar">
            {role.charAt(0).toUpperCase()}
          </div>

          <div>
            <h4>{role.charAt(0).toUpperCase() + role.slice(1)}</h4>
            <span>System Account</span>
          </div>
        </div>

        <p className="menu-label">MAIN MENU</p>

        <nav className="sidebar-menu">
          {roleMenus.map((item) => {
            const Icon = item.icon;

            return (
              <NavLink
                key={item.path}
                to={`/${role}/${item.path}`}
                onClick={onClose}
                className={({ isActive }) =>
                  `sidebar-link ${isActive ? "active" : ""}`
                }
              >
                <Icon size={19} />
                <span>{item.name}</span>
              </NavLink>
            );
          })}
        </nav>

        <div className="sidebar-footer">
          <p>EduManage System</p>
          <span>Version 1.0.0</span>
        </div>
      </aside>
    </>
  );
}

export default Sidebar;