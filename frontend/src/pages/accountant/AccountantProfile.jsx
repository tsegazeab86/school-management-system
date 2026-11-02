
import   { useState } from "react";
import { motion } from "framer-motion";
import {
  User,
  Mail,
  Phone,
  MapPin,
  ShieldCheck,
  Bell,
  Lock,
  Camera,
  Save,
  X,
  KeyRound,
  CalendarDays,
  BriefcaseBusiness,
} from "lucide-react";
import "./AccountantProfile.css";

const initialProfile = {
  fullName: "Abebe Kebede",
  email: "accountant@school.edu",
  phone: "+251 911 234 567",
  address: "Injibara, Ethiopia",
  employeeId: "ACC-001",
  department: "Finance Department",
};

export default function ProfileSettings() {
  const [profile, setProfile] = useState(initialProfile);
  const [editProfile, setEditProfile] = useState(false);
  const [activeTab, setActiveTab] = useState("profile");
  const [notice, setNotice] = useState("");

  const [notifications, setNotifications] = useState({
    paymentNotifications: true,
    overdueReminders: true,
    newMessages: true,
    financialReports: false,
    systemAnnouncements: true,
  });

  const [passwords, setPasswords] = useState({
    current: "",
    newPassword: "",
    confirm: "",
  });

  const [showPasswords, setShowPasswords] = useState(false);

  const updateProfile = (event) => {
    const { name, value } = event.target;
    setProfile((previous) => ({ ...previous, [name]: value }));
  };

  const saveProfile = (event) => {
    event.preventDefault();
    setEditProfile(false);
    setNotice("Profile changes saved in this demonstration.");
  };

  const cancelProfileEdit = () => {
    setProfile(initialProfile);
    setEditProfile(false);
  };

  const updateNotification = (name) => {
    setNotifications((previous) => ({
      ...previous,
      [name]: !previous[name],
    }));
  };

  const saveNotifications = () => {
    setNotice("Notification preferences saved in this demonstration.");
  };

  const changePassword = (event) => {
    event.preventDefault();

    if (passwords.newPassword.length < 8) {
      setNotice("New password must contain at least 8 characters.");
      return;
    }

    if (passwords.newPassword !== passwords.confirm) {
      setNotice("New password and confirmation do not match.");
      return;
    }

    setPasswords({ current: "", newPassword: "", confirm: "" });
    setNotice(
      "Password form validated. Connect backend authentication to change the real password."
    );
  };

  return (
    <div className="accountant-profile-page container-fluid">
      <div className="profile-page-header">
        <div>
          <h2>Profile & Settings</h2>
          <p>Manage your personal account and preferences.</p>
        </div>
        <div className="profile-role-label">
          <ShieldCheck size={17} />
          Accountant Account
        </div>
      </div>

      {notice && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="profile-notice"
          role="status"
        >
          <span>{notice}</span>
          <button onClick={() => setNotice("")} aria-label="Close notice">
            <X size={17} />
          </button>
        </motion.div>
      )}

      <div className="profile-layout">
        <aside className="profile-sidebar-card">
          <div className="profile-avatar-area">
            <div className="profile-avatar">
              {profile.fullName.charAt(0).toUpperCase()}
            </div>
            <button
              className="profile-camera-button"
              title="Profile photo upload will be added later"
              onClick={() =>
                setNotice("Profile photo upload is not available yet.")
              }
            >
              <Camera size={15} />
            </button>
          </div>

          <h3>{profile.fullName}</h3>
          <p>{profile.department}</p>
          <span className="profile-account-status">
            <i /> Active Account
          </span>

          <div className="profile-sidebar-divider" />

          <button
            className={`profile-nav-item ${
              activeTab === "profile" ? "active" : ""
            }`}
            onClick={() => setActiveTab("profile")}
          >
            <User size={18} /> Personal Information
          </button>

          <button
            className={`profile-nav-item ${
              activeTab === "security" ? "active" : ""
            }`}
            onClick={() => setActiveTab("security")}
          >
            <Lock size={18} /> Security
          </button>

          <button
            className={`profile-nav-item ${
              activeTab === "notifications" ? "active" : ""
            }`}
            onClick={() => setActiveTab("notifications")}
          >
            <Bell size={18} /> Notifications
          </button>

          <div className="profile-sidebar-divider" />

          <div className="profile-sidebar-help">
            <ShieldCheck size={19} />
            <strong>Account Permissions</strong>
            <p>
              You can manage your own profile and preferences. System-wide
              settings are managed by the administrator.
            </p>
          </div>
        </aside>

        <main className="profile-content-card">
          {activeTab === "profile" && (
            <section>
              <div className="profile-section-heading">
                <div>
                  <h3>Personal Information</h3>
                  <p>View and update your personal account details.</p>
                </div>

                {!editProfile && (
                  <button
                    className="profile-primary-button"
                    onClick={() => setEditProfile(true)}
                  >
                    <User size={16} /> Edit Profile
                  </button>
                )}
              </div>

              <form onSubmit={saveProfile}>
                <div className="profile-form-grid">
                  <div className="profile-field">
                    <label>Full Name</label>
                    <div className="profile-input-wrap">
                      <User size={17} />
                      <input
                        name="fullName"
                        value={profile.fullName}
                        onChange={updateProfile}
                        disabled={!editProfile}
                        required
                      />
                    </div>
                  </div>

                  <div className="profile-field">
                    <label>Email Address</label>
                    <div className="profile-input-wrap">
                      <Mail size={17} />
                      <input
                        type="email"
                        name="email"
                        value={profile.email}
                        onChange={updateProfile}
                        disabled={!editProfile}
                        required
                      />
                    </div>
                  </div>

                  <div className="profile-field">
                    <label>Phone Number</label>
                    <div className="profile-input-wrap">
                      <Phone size={17} />
                      <input
                        name="phone"
                        value={profile.phone}
                        onChange={updateProfile}
                        disabled={!editProfile}
                      />
                    </div>
                  </div>

                  <div className="profile-field">
                    <label>Address</label>
                    <div className="profile-input-wrap">
                      <MapPin size={17} />
                      <input
                        name="address"
                        value={profile.address}
                        onChange={updateProfile}
                        disabled={!editProfile}
                      />
                    </div>
                  </div>

                  <div className="profile-field">
                    <label>Employee ID</label>
                    <div className="profile-input-wrap">
                      <BriefcaseBusiness size={17} />
                      <input value={profile.employeeId} disabled />
                    </div>
                  </div>

                  <div className="profile-field">
                    <label>Department</label>
                    <div className="profile-input-wrap">
                      <BriefcaseBusiness size={17} />
                      <input value={profile.department} disabled />
                    </div>
                  </div>
                </div>

                {editProfile && (
                  <div className="profile-form-actions">
                    <button
                      type="button"
                      className="profile-cancel-button"
                      onClick={cancelProfileEdit}
                    >
                      <X size={16} /> Cancel
                    </button>
                    <button
                      type="submit"
                      className="profile-primary-button"
                    >
                      <Save size={16} /> Save Changes
                    </button>
                  </div>
                )}
              </form>

              <div className="profile-account-info">
                <h4>Account Information</h4>
                <div>
                  <span>Account Role</span>
                  <strong>Accountant</strong>
                </div>
                <div>
                  <span>Employee ID</span>
                  <strong>{profile.employeeId}</strong>
                </div>
                <div>
                  <span>Account Status</span>
                  <strong className="profile-active-text">Active</strong>
                </div>
                <div>
                  <span>Last Updated</span>
                  <strong>
                    <CalendarDays size={14} /> October 2026
                  </strong>
                </div>
              </div>
            </section>
          )}

          {activeTab === "security" && (
            <section>
              <div className="profile-section-heading">
                <div>
                  <h3>Security Settings</h3>
                  <p>Change your account password.</p>
                </div>
                <div className="security-heading-icon">
                  <Lock size={22} />
                </div>
              </div>

              <div className="security-information">
                <ShieldCheck size={20} />
                <div>
                  <strong>Keep your account secure</strong>
                  <p>
                    Use a strong password and do not share it with other
                    people.
                  </p>
                </div>
              </div>

              <form className="security-form" onSubmit={changePassword}>
                <div className="profile-field">
                  <label>Current Password</label>
                  <input
                    type={showPasswords ? "text" : "password"}
                    className="form-control"
                    value={passwords.current}
                    onChange={(event) =>
                      setPasswords((previous) => ({
                        ...previous,
                        current: event.target.value,
                      }))
                    }
                    placeholder="Enter current password"
                    required
                  />
                </div>

                <div className="profile-field">
                  <label>New Password</label>
                  <input
                    type={showPasswords ? "text" : "password"}
                    className="form-control"
                    value={passwords.newPassword}
                    onChange={(event) =>
                      setPasswords((previous) => ({
                        ...previous,
                        newPassword: event.target.value,
                      }))
                    }
                    placeholder="Enter new password"
                    required
                    minLength={8}
                  />
                </div>

                <div className="profile-field">
                  <label>Confirm New Password</label>
                  <input
                    type={showPasswords ? "text" : "password"}
                    className="form-control"
                    value={passwords.confirm}
                    onChange={(event) =>
                      setPasswords((previous) => ({
                        ...previous,
                        confirm: event.target.value,
                      }))
                    }
                    placeholder="Confirm new password"
                    required
                  />
                </div>

                <label className="show-password-option">
                  <input
                    type="checkbox"
                    checked={showPasswords}
                    onChange={(event) =>
                      setShowPasswords(event.target.checked)
                    }
                  />
                  Show password fields
                </label>

                <button type="submit" className="profile-primary-button">
                  <KeyRound size={16} /> Validate Password Change
                </button>
              </form>
            </section>
          )}

          {activeTab === "notifications" && (
            <section>
              <div className="profile-section-heading">
                <div>
                  <h3>Notification Preferences</h3>
                  <p>Choose which account notifications you want to receive.</p>
                </div>
                <div className="notification-heading-icon">
                  <Bell size={22} />
                </div>
              </div>

              <div className="notification-list">
                <div className="notification-option">
                  <div>
                    <strong>Payment Notifications</strong>
                    <p>Receive updates when student payments are recorded.</p>
                  </div>
                  <label className="profile-switch">
                    <input
                      type="checkbox"
                      checked={notifications.paymentNotifications}
                      onChange={() =>
                        updateNotification("paymentNotifications")
                      }
                    />
                    <span />
                  </label>
                </div>

                <div className="notification-option">
                  <div>
                    <strong>Overdue Fee Reminders</strong>
                    <p>Receive reminders about outstanding student fees.</p>
                  </div>
                  <label className="profile-switch">
                    <input
                      type="checkbox"
                      checked={notifications.overdueReminders}
                      onChange={() => updateNotification("overdueReminders")}
                    />
                    <span />
                  </label>
                </div>

                <div className="notification-option">
                  <div>
                    <strong>New Messages</strong>
                    <p>Receive notifications when a new message arrives.</p>
                  </div>
                  <label className="profile-switch">
                    <input
                      type="checkbox"
                      checked={notifications.newMessages}
                      onChange={() => updateNotification("newMessages")}
                    />
                    <span />
                  </label>
                </div>

                <div className="notification-option">
                  <div>
                    <strong>Financial Reports</strong>
                    <p>Receive reminders about financial reporting tasks.</p>
                  </div>
                  <label className="profile-switch">
                    <input
                      type="checkbox"
                      checked={notifications.financialReports}
                      onChange={() => updateNotification("financialReports")}
                    />
                    <span />
                  </label>
                </div>

                <div className="notification-option">
                  <div>
                    <strong>System Announcements</strong>
                    <p>Receive important school announcements.</p>
                  </div>
                  <label className="profile-switch">
                    <input
                      type="checkbox"
                      checked={notifications.systemAnnouncements}
                      onChange={() => updateNotification("systemAnnouncements")}
                    />
                    <span />
                  </label>
                </div>
              </div>

              <button
                className="profile-primary-button notification-save-button"
                onClick={saveNotifications}
              >
                <Save size={16} /> Save Preferences
              </button>
            </section>
          )}
        </main>
      </div>
    </div>
  );
}
