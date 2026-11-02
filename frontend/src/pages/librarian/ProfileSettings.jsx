import   { useState } from "react";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  CalendarDays,
  Camera,
  Save,
  Lock,
  Bell,
  ShieldCheck,
  BookOpen,
  Eye,
  EyeOff,
  CheckCircle,
  Settings,
} from "lucide-react";
import "./ProfileSettings.css";

function ProfileSettings() {
  const [profile, setProfile] = useState({
    fullName: "Abebe Kebede",
    email: "abebe@school.com",
    phone: "+251 912 345 678",
    address: "Injibara, Ethiopia",
    employeeId: "LIB-2026-001",
    role: "Librarian",
    department: "School Library",
    joinDate: "September 01, 2024",
  });

  const [notifications, setNotifications] = useState({
    newMessages: true,
    overdueAlerts: true,
    bookRequests: true,
    systemUpdates: false,
    weeklyReports: true,
  });

  const [password, setPassword] = useState({
    current: "",
    newPassword: "",
    confirm: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [activeTab, setActiveTab] = useState("profile");
  const [saved, setSaved] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState("");

  const updateProfile = (event) => {
    const { name, value } = event.target;
    setProfile((previous) => ({ ...previous, [name]: value }));
    setSaved(false);
  };

  const toggleNotification = (key) => {
    setNotifications((previous) => ({
      ...previous,
      [key]: !previous[key],
    }));
  };

  const saveProfile = (event) => {
    event.preventDefault();
    setSaved(true);
  };

  const updatePassword = (event) => {
    event.preventDefault();
    setPasswordMessage("");

    if (!password.current || !password.newPassword || !password.confirm) {
      setPasswordMessage("Please complete all password fields.");
      return;
    }

    if (password.newPassword.length < 8) {
      setPasswordMessage("New password must be at least 8 characters.");
      return;
    }

    if (password.newPassword !== password.confirm) {
      setPasswordMessage("New password and confirmation do not match.");
      return;
    }

    setPasswordMessage(
      "Password form validated. Connect a backend to update your real password."
    );
    setPassword({ current: "", newPassword: "", confirm: "" });
  };

  return (
    <div className="lib-profile-page">
      <div className="lib-profile-header">
        <div>
          <span className="lib-profile-eyebrow">ACCOUNT MANAGEMENT</span>
          <h1>Profile & Settings</h1>
          <p>Manage your personal information and account preferences.</p>
        </div>
        <div className="lib-profile-header-icon">
          <Settings size={27} />
        </div>
      </div>

      <div className="lib-profile-layout">
        <aside className="lib-profile-card">
          <div className="lib-profile-cover">
            <div className="lib-profile-avatar">
              <span>AK</span>
              <button
                type="button"
                title="Profile photo upload not available yet"
                onClick={() =>
                  window.alert("Profile photo upload will be added later.")
                }
              >
                <Camera size={15} />
              </button>
            </div>
          </div>

          <div className="lib-profile-identity">
            <h2>{profile.fullName}</h2>
            <span className="lib-profile-role">
              <BookOpen size={14} />
              Librarian
            </span>
            <p>{profile.email}</p>
          </div>

          <div className="lib-profile-info">
            <div>
              <Briefcase size={17} />
              <span>Employee ID</span>
              <strong>{profile.employeeId}</strong>
            </div>
            <div>
              <MapPin size={17} />
              <span>Location</span>
              <strong>{profile.address}</strong>
            </div>
            <div>
              <CalendarDays size={17} />
              <span>Joined</span>
              <strong>{profile.joinDate}</strong>
            </div>
          </div>

          <div className="lib-profile-status">
            <span className="lib-status-dot"></span>
            Active Account
          </div>
        </aside>

        <section className="lib-profile-main">
          <div className="lib-profile-tabs">
            <button
              className={activeTab === "profile" ? "active" : ""}
              onClick={() => setActiveTab("profile")}
            >
              <User size={17} />
              Personal Information
            </button>

            <button
              className={activeTab === "security" ? "active" : ""}
              onClick={() => setActiveTab("security")}
            >
              <ShieldCheck size={17} />
              Security
            </button>

            <button
              className={activeTab === "notifications" ? "active" : ""}
              onClick={() => setActiveTab("notifications")}
            >
              <Bell size={17} />
              Notifications
            </button>
          </div>

          {activeTab === "profile" && (
            <form className="lib-profile-section" onSubmit={saveProfile}>
              <div className="lib-section-heading">
                <div>
                  <h2>Personal Information</h2>
                  <p>Update your personal and contact details.</p>
                </div>
                <User size={23} />
              </div>

              <div className="lib-profile-form-grid">
                <div className="lib-form-group">
                  <label>Full Name</label>
                  <div className="lib-input-icon">
                    <User size={17} />
                    <input
                      name="fullName"
                      value={profile.fullName}
                      onChange={updateProfile}
                      required
                    />
                  </div>
                </div>

                <div className="lib-form-group">
                  <label>Email Address</label>
                  <div className="lib-input-icon">
                    <Mail size={17} />
                    <input
                      type="email"
                      name="email"
                      value={profile.email}
                      onChange={updateProfile}
                      required
                    />
                  </div>
                </div>

                <div className="lib-form-group">
                  <label>Phone Number</label>
                  <div className="lib-input-icon">
                    <Phone size={17} />
                    <input
                      name="phone"
                      value={profile.phone}
                      onChange={updateProfile}
                    />
                  </div>
                </div>

                <div className="lib-form-group">
                  <label>Address</label>
                  <div className="lib-input-icon">
                    <MapPin size={17} />
                    <input
                      name="address"
                      value={profile.address}
                      onChange={updateProfile}
                    />
                  </div>
                </div>

                <div className="lib-form-group">
                  <label>Department</label>
                  <div className="lib-input-icon">
                    <Briefcase size={17} />
                    <input value={profile.department} readOnly />
                  </div>
                </div>

                <div className="lib-form-group">
                  <label>Employee ID</label>
                  <div className="lib-input-icon">
                    <ShieldCheck size={17} />
                    <input value={profile.employeeId} readOnly />
                  </div>
                </div>
              </div>

              <div className="lib-profile-form-footer">
                {saved && (
                  <span className="lib-saved-message">
                    <CheckCircle size={16} />
                    Profile saved locally.
                  </span>
                )}
                <button type="submit" className="lib-save-btn">
                  <Save size={17} />
                  Save Changes
                </button>
              </div>
            </form>
          )}

          {activeTab === "security" && (
            <form className="lib-profile-section" onSubmit={updatePassword}>
              <div className="lib-section-heading">
                <div>
                  <h2>Security Settings</h2>
                  <p>Manage your account password.</p>
                </div>
                <Lock size={23} />
              </div>

              <div className="lib-password-fields">
                <div className="lib-form-group">
                  <label>Current Password</label>
                  <div className="lib-input-icon">
                    <Lock size={17} />
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password.current}
                      onChange={(event) =>
                        setPassword({
                          ...password,
                          current: event.target.value,
                        })
                      }
                      placeholder="Enter current password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="lib-password-eye"
                    >
                      {showPassword ? (
                        <EyeOff size={17} />
                      ) : (
                        <Eye size={17} />
                      )}
                    </button>
                  </div>
                </div>

                <div className="lib-form-group">
                  <label>New Password</label>
                  <div className="lib-input-icon">
                    <Lock size={17} />
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password.newPassword}
                      onChange={(event) =>
                        setPassword({
                          ...password,
                          newPassword: event.target.value,
                        })
                      }
                      placeholder="Enter new password"
                    />
                  </div>
                </div>

                <div className="lib-form-group">
                  <label>Confirm New Password</label>
                  <div className="lib-input-icon">
                    <Lock size={17} />
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password.confirm}
                      onChange={(event) =>
                        setPassword({
                          ...password,
                          confirm: event.target.value,
                        })
                      }
                      placeholder="Confirm new password"
                    />
                  </div>
                </div>
              </div>

              {passwordMessage && (
                <p className="lib-password-message">{passwordMessage}</p>
              )}

              <div className="lib-security-note">
                <ShieldCheck size={20} />
                <div>
                  <strong>Account security</strong>
                  <p>
                    Use a strong password and never share your login
                    credentials with other people.
                  </p>
                </div>
              </div>

              <div className="lib-profile-form-footer">
                <button type="submit" className="lib-save-btn">
                  <Lock size={17} />
                  Validate Password Form
                </button>
              </div>
            </form>
          )}

          {activeTab === "notifications" && (
            <div className="lib-profile-section">
              <div className="lib-section-heading">
                <div>
                  <h2>Notification Preferences</h2>
                  <p>Choose which notifications you want to receive.</p>
                </div>
                <Bell size={23} />
              </div>

              <div className="lib-notification-list">
                {[
                  {
                    key: "newMessages",
                    title: "New Messages",
                    description: "When students or staff send you a message.",
                  },
                  {
                    key: "overdueAlerts",
                    title: "Overdue Book Alerts",
                    description: "When a borrowed book becomes overdue.",
                  },
                  {
                    key: "bookRequests",
                    title: "Book Requests",
                    description: "When a student requests a library book.",
                  },
                  {
                    key: "systemUpdates",
                    title: "System Updates",
                    description: "Important school system announcements.",
                  },
                  {
                    key: "weeklyReports",
                    title: "Weekly Library Reports",
                    description: "Receive a weekly summary of library activity.",
                  },
                ].map((item) => (
                  <div className="lib-notification-item" key={item.key}>
                    <div>
                      <strong>{item.title}</strong>
                      <p>{item.description}</p>
                    </div>

                    <label className="lib-switch">
                      <input
                        type="checkbox"
                        checked={notifications[item.key]}
                        onChange={() => toggleNotification(item.key)}
                      />
                      <span className="lib-switch-slider"></span>
                    </label>
                  </div>
                ))}
              </div>

              <div className="lib-profile-form-footer">
                <span className="lib-notification-hint">
                  Preferences are currently stored in this page only.
                </span>
                <button
                  type="button"
                  className="lib-save-btn"
                  onClick={() =>
                    window.alert("Notification preferences saved locally.")
                  }
                >
                  <Save size={17} />
                  Save Preferences
                </button>
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

export default ProfileSettings;