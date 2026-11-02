import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Search,
    Bell,
    Menu,
    UserRound,
    Settings,
    LogOut,
    ChevronDown,
    X,
} from "lucide-react";

import "../../styles/registrar/RegistrarHeader.css";

function RegistrarHeader({
    title = "Staff Dashboard",
    subtitle = "Welcome back! Here's what's happening at your school.",
    onMenuClick = () => { },
    onLogout = () => { },
    onNavigate = () => { },
}) {
    const [search, setSearch] = useState("");
    const [showNotifications, setShowNotifications] = useState(false);
    const [showProfile, setShowProfile] = useState(false);

    const notifications = [
        {
            id: 1,
            title: "New student registration",
            message: "A new student registration needs review.",
            time: "5 minutes ago",
        },
        {
            id: 2,
            title: "Staff meeting",
            message: "Staff meeting scheduled for tomorrow.",
            time: "1 hour ago",
        },
        {
            id: 3,
            title: "Academic year",
            message: "Academic year information was updated.",
            time: "Yesterday",
        },
    ];

    const handleSearch = (event) => {
        event.preventDefault();

        if (search.trim()) {
            console.log("Search:", search);
        }
    };

    return (
        <motion.header
            className="registrar-header"
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
        >
            <div className="registrar-header-left">
                <button
                    className="registrar-mobile-menu"
                    onClick={onMenuClick}
                    aria-label="Open sidebar"
                >
                    <Menu size={23} />
                </button>

                <div className="registrar-page-heading">
                    <h1>{title}</h1>
                    <p>{subtitle}</p>
                </div>
            </div>

            <div className="registrar-header-right">
                <form className="registrar-search" onSubmit={handleSearch}>
                    <Search size={19} />

                    <input
                        type="search"
                        placeholder="Search..."
                        value={search}
                        onChange={(event) => setSearch(event.target.value)}
                    />

                    {search && (
                        <button
                            type="button"
                            className="registrar-search-clear"
                            onClick={() => setSearch("")}
                            aria-label="Clear search"
                        >
                            <X size={16} />
                        </button>
                    )}
                </form>

                {/* Notifications */}
                <div className="registrar-header-dropdown">
                    <button
                        className={`registrar-icon-button ${showNotifications ? "active" : ""
                            }`}
                        onClick={() => {
                            setShowNotifications(!showNotifications);
                            setShowProfile(false);
                        }}
                        aria-label="Notifications"
                    >
                        <Bell size={21} />
                        <span className="registrar-notification-dot"></span>
                    </button>

                    <AnimatePresence>
                        {showNotifications && (
                            <motion.div
                                className="registrar-dropdown registrar-notifications"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 10 }}
                            >
                                <div className="registrar-dropdown-heading">
                                    <h3>Notifications</h3>
                                    <span>{notifications.length} new</span>
                                </div>

                                {notifications.map((notification) => (
                                    <div
                                        className="registrar-notification-item"
                                        key={notification.id}
                                    >
                                        <div className="notification-icon">
                                            <Bell size={17} />
                                        </div>

                                        <div>
                                            <h4>{notification.title}</h4>
                                            <p>{notification.message}</p>
                                            <small>{notification.time}</small>
                                        </div>
                                    </div>
                                ))}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Profile */}
                <div className="registrar-header-dropdown">
                    <button
                        className="registrar-profile-button"
                        onClick={() => {
                            setShowProfile(!showProfile);
                            setShowNotifications(false);
                        }}
                    >
                        <div className="registrar-avatar">R</div>

                        <div className="registrar-profile-info">
                            <strong>Registrar</strong>
                            <span>Staff Account</span>
                        </div>

                        <ChevronDown size={17} />
                    </button>

                    <AnimatePresence>
                        {showProfile && (
                            <motion.div
                                className="registrar-dropdown registrar-profile-dropdown"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 10 }}
                            >
                                <button
                                    onClick={() => {
                                        onNavigate("profile");
                                        setShowProfile(false);
                                    }}
                                >
                                    <UserRound size={17} />
                                    My Profile
                                </button>

                                <button
                                    onClick={() => {
                                        onNavigate("settings");
                                        setShowProfile(false);
                                    }}
                                >
                                    <Settings size={17} />
                                    Settings
                                </button>

                                <button
                                    className="registrar-logout-option"
                                    onClick={onLogout}
                                >
                                    <LogOut size={17} />
                                    Logout
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </motion.header>
    );
}

export default RegistrarHeader;