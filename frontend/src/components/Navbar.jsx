import { useLocation, useNavigate } from "react-router-dom";
import {
  Menu,
  Bell,
  Search,
  LogOut,
  ChevronDown,
} from "lucide-react";

function Navbar({ onMenuClick }) {
  const location = useLocation();
  const navigate = useNavigate();

  const role = location.pathname.split("/")[1] || "admin";
  const page = location.pathname.split("/")[2] || "dashboard";

  const pageTitle = page
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

  const handleLogout = () => {
    const confirmed = window.confirm("Are you sure you want to logout?");

    if (confirmed) {
      navigate("/login");
    }
  };

  return (
    <header className="top-navbar">
      <div className="navbar-left">
        <button className="menu-button" onClick={onMenuClick}>
          <Menu size={24} />
        </button>

        <div>
          <h2>{pageTitle}</h2>
          <p>Home / {pageTitle}</p>
        </div>
      </div>

      <div className="navbar-right">
        <div className="navbar-search">
          <Search size={18} />
          <input type="text" placeholder="Search..." />
        </div>

        <button className="notification-button" aria-label="Notifications">
          <Bell size={21} />
          <span></span>
        </button>

        <div className="navbar-user">
          <div className="navbar-avatar">
            {role.charAt(0).toUpperCase()}
          </div>

          <div className="navbar-user-info">
            <strong>{role.charAt(0).toUpperCase() + role.slice(1)}</strong>
            <span>Account</span>
          </div>

          <ChevronDown size={16} />
        </div>

        <button
          className="logout-button"
          onClick={handleLogout}
          title="Logout"
        >
          <LogOut size={19} />
        </button>
      </div>
    </header>
  );
}

export default Navbar;