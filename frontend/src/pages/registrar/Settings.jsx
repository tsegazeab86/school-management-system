
import { useState } from "react";
import {
    UserRound, School, Bell, ShieldCheck, Palette,
    Camera, Save, LockKeyhole,
    //  Mail, Phone,
    // MapPin, Globe, 
    Eye, EyeOff, CheckCircle2,
    Settings as SettingsIcon, Monitor, Moon, Sun,
    ChevronRight
} from "lucide-react";

import "../../styles/registrar/Settings.css";

const initialSettings = {
    name: "Tsegaye Mekonnen",
    email: "registrar@school.edu",
    phone: "+251 900 000 000",
    role: "School Registrar",
    schoolName: "Injibara Model School",
    schoolEmail: "info@school.edu",
    schoolPhone: "+251 900 000 001",
    address: "Injibara, Ethiopia",
    website: "www.school.edu",
    emailNotifications: true,
    announcementNotifications: true,
    attendanceNotifications: false,
    messageNotifications: true,
    theme: "Light",
    language: "English",
};

const sections = [
    { id: "profile", label: "My Profile", description: "Personal information", icon: UserRound },
    { id: "school", label: "School Information", description: "School details and contact", icon: School },
    { id: "notifications", label: "Notifications", description: "Manage your alerts", icon: Bell },
    { id: "security", label: "Security", description: "Password and account safety", icon: ShieldCheck },
    { id: "appearance", label: "Appearance", description: "Theme and language", icon: Palette },
];

function Settings() {
    const [activeTab, setActiveTab] = useState("profile");
    const [settings, setSettings] = useState(initialSettings);
    const [avatar, setAvatar] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [passwords, setPasswords] = useState({
        current: "",
        newPassword: "",
        confirm: "",
    });
    const [saveMessage, setSaveMessage] = useState("");

    const updateSetting = (name, value) => {
        setSettings((previous) => ({ ...previous, [name]: value }));
        setSaveMessage("");
    };

    const handleAvatar = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!file.type.startsWith("image/")) {
            setSaveMessage("Please select an image file.");
            return;
        }

        if (file.size > 2 * 1024 * 1024) {
            setSaveMessage("Image must be smaller than 2 MB.");
            return;
        }

        const reader = new FileReader();
        reader.onload = () => setAvatar(reader.result);
        reader.readAsDataURL(file);
    };

    const saveChanges = () => {
        if (activeTab === "security") {
            if (!passwords.current || !passwords.newPassword || !passwords.confirm) {
                setSaveMessage("Please complete all password fields.");
                return;
            }
            if (passwords.newPassword.length < 8) {
                setSaveMessage("New password must contain at least 8 characters.");
                return;
            }
            if (passwords.newPassword !== passwords.confirm) {
                setSaveMessage("New password and confirmation do not match.");
                return;
            }

            setPasswords({ current: "", newPassword: "", confirm: "" });
            setSaveMessage("Demo password validation completed. Connect a backend to change your real password.");
            return;
        }

        setSaveMessage("Your changes have been saved in this demo session.");
    };

    const renderProfile = () => (
        <>
            <div className="settings-section-title">
                <div>
                    <h3>Personal Information</h3>
                    <p>Update your profile details and contact information.</p>
                </div>
                <UserRound />
            </div>

            <div className="settings-profile-upload">
                <img
                    src={avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(settings.name)}&background=7059D5&color=fff&size=160`}
                    alt="Profile"
                    onError={(e) => {
                        e.currentTarget.src = "https://ui-avatars.com/api/?name=Registrar&background=7059D5&color=fff";
                    }}
                />
                <div>
                    <strong>Profile Photo</strong>
                    <p>Upload a JPG or PNG image. Maximum size 2 MB.</p>
                    <label className="settings-upload-btn">
                        <Camera size={15} /> Change Photo
                        <input type="file" accept="image/*" onChange={handleAvatar} hidden />
                    </label>
                </div>
            </div>

            <div className="settings-form-grid">
                <label>
                    Full Name
                    <input
                        value={settings.name}
                        onChange={(e) => updateSetting("name", e.target.value)}
                    />
                </label>

                <label>
                    Email Address
                    <input
                        type="email"
                        value={settings.email}
                        onChange={(e) => updateSetting("email", e.target.value)}
                    />
                </label>

                <label>
                    Phone Number
                    <input
                        value={settings.phone}
                        onChange={(e) => updateSetting("phone", e.target.value)}
                    />
                </label>

                <label>
                    Role
                    <input value={settings.role} disabled />
                </label>
            </div>
        </>
    );

    const renderSchool = () => (
        <>
            <div className="settings-section-title">
                <div>
                    <h3>School Information</h3>
                    <p>Manage your school's official information.</p>
                </div>
                <School />
            </div>

            <div className="settings-school-banner">
                <div className="settings-school-icon"><School size={30} /></div>
                <div>
                    <span>SCHOOL PROFILE</span>
                    <h3>{settings.schoolName}</h3>
                    <p>{settings.address}</p>
                </div>
            </div>

            <div className="settings-form-grid">
                <label>
                    School Name
                    <input
                        value={settings.schoolName}
                        onChange={(e) => updateSetting("schoolName", e.target.value)}
                    />
                </label>

                <label>
                    School Email
                    <input
                        type="email"
                        value={settings.schoolEmail}
                        onChange={(e) => updateSetting("schoolEmail", e.target.value)}
                    />
                </label>

                <label>
                    School Phone
                    <input
                        value={settings.schoolPhone}
                        onChange={(e) => updateSetting("schoolPhone", e.target.value)}
                    />
                </label>

                <label>
                    Website
                    <input
                        value={settings.website}
                        onChange={(e) => updateSetting("website", e.target.value)}
                    />
                </label>

                <label className="settings-full-field">
                    School Address
                    <input
                        value={settings.address}
                        onChange={(e) => updateSetting("address", e.target.value)}
                    />
                </label>
            </div>
        </>
    );

    const notificationOptions = [
        {
            key: "emailNotifications",
            title: "Email Notifications",
            description: "Receive important updates through email.",
        },
        {
            key: "announcementNotifications",
            title: "School Announcements",
            description: "Get notified when new announcements are published.",
        },
        {
            key: "attendanceNotifications",
            title: "Attendance Alerts",
            description: "Receive staff attendance updates.",
        },
        {
            key: "messageNotifications",
            title: "New Messages",
            description: "Get alerts when someone sends you a message.",
        },
    ];

    const renderNotifications = () => (
        <>
            <div className="settings-section-title">
                <div>
                    <h3>Notification Preferences</h3>
                    <p>Choose which notifications you want to receive.</p>
                </div>
                <Bell />
            </div>

            <div className="settings-option-list">
                {notificationOptions.map((option) => (
                    <div className="settings-option-row" key={option.key}>
                        <div className="settings-option-icon"><Bell size={19} /></div>
                        <div className="settings-option-info">
                            <strong>{option.title}</strong>
                            <p>{option.description}</p>
                        </div>
                        <button
                            type="button"
                            role="switch"
                            aria-checked={settings[option.key]}
                            className={`settings-switch ${settings[option.key] ? "enabled" : ""}`}
                            onClick={() => updateSetting(option.key, !settings[option.key])}
                        >
                            <span />
                        </button>
                    </div>
                ))}
            </div>
        </>
    );

    const renderSecurity = () => (
        <>
            <div className="settings-section-title">
                <div>
                    <h3>Account Security</h3>
                    <p>Keep your account secure by updating your password.</p>
                </div>
                <ShieldCheck />
            </div>

            <div className="settings-security-notice">
                <LockKeyhole size={23} />
                <div>
                    <strong>Protect your account</strong>
                    <p>Use a strong password with at least 8 characters.</p>
                </div>
            </div>

            <div className="settings-password-form">
                {[
                    { key: "current", label: "Current Password" },
                    { key: "newPassword", label: "New Password" },
                    { key: "confirm", label: "Confirm New Password" },
                ].map((field) => (
                    <label key={field.key}>
                        {field.label}
                        <div className="settings-password-input">
                            <input
                                type={showPassword ? "text" : "password"}
                                value={passwords[field.key]}
                                onChange={(e) =>
                                    setPasswords((previous) => ({
                                        ...previous,
                                        [field.key]: e.target.value,
                                    }))
                                }
                                placeholder={`Enter ${field.label.toLowerCase()}`}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                title="Show or hide password"
                            >
                                {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                            </button>
                        </div>
                    </label>
                ))}
            </div>

            <div className="settings-security-tip">
                <ShieldCheck size={18} />
                <span>Never share your password with anyone.</span>
            </div>
        </>
    );

    const renderAppearance = () => (
        <>
            <div className="settings-section-title">
                <div>
                    <h3>Appearance & Language</h3>
                    <p>Customize how your dashboard looks.</p>
                </div>
                <Palette />
            </div>

            <div className="settings-appearance-block">
                <strong>Dashboard Theme</strong>
                <p>Choose your preferred dashboard appearance.</p>

                <div className="settings-theme-options">
                    {[
                        { name: "Light", icon: Sun, description: "Clean and bright" },
                        { name: "Dark", icon: Moon, description: "Comfortable at night" },
                        { name: "System", icon: Monitor, description: "Follow device settings" },
                    ].map((theme) => {
                        const Icon = theme.icon;
                        return (
                            <button
                                type="button"
                                key={theme.name}
                                className={`settings-theme-card ${settings.theme === theme.name ? "selected" : ""}`}
                                onClick={() => updateSetting("theme", theme.name)}
                            >
                                <Icon size={25} />
                                <strong>{theme.name}</strong>
                                <small>{theme.description}</small>
                                {settings.theme === theme.name && <CheckCircle2 className="settings-theme-check" />}
                            </button>
                        );
                    })}
                </div>
            </div>

            <div className="settings-language-block">
                <div>
                    <strong>Language</strong>
                    <p>Select your preferred dashboard language.</p>
                </div>
                <select
                    value={settings.language}
                    onChange={(e) => updateSetting("language", e.target.value)}
                >
                    <option>English</option>
                    <option>Amharic</option>
                </select>
            </div>
        </>
    );

    const content = {
        profile: renderProfile,
        school: renderSchool,
        notifications: renderNotifications,
        security: renderSecurity,
        appearance: renderAppearance,
    };

    const activeSection = sections.find((item) => item.id === activeTab);
    const ActiveIcon = activeSection.icon;

    return (
        <div className="registrar-settings-page">
            <div className="settings-page-heading">
                <div>
                    <span className="settings-eyebrow">PREFERENCES & CONTROL</span>
                    <h2>Settings</h2>
                    <p>Manage your account, school preferences and dashboard.</p>
                </div>
                <div className="settings-heading-icon">
                    <SettingsIcon size={25} />
                </div>
            </div>

            <div className="settings-layout">
                <aside className="settings-navigation">
                    <div className="settings-nav-title">SETTINGS MENU</div>

                    {sections.map((section) => {
                        const Icon = section.icon;
                        return (
                            <button
                                type="button"
                                key={section.id}
                                className={`settings-nav-item ${activeTab === section.id ? "active" : ""}`}
                                onClick={() => {
                                    setActiveTab(section.id);
                                    setSaveMessage("");
                                }}
                            >
                                <span className="settings-nav-icon"><Icon size={19} /></span>
                                <span className="settings-nav-text">
                                    <strong>{section.label}</strong>
                                    <small>{section.description}</small>
                                </span>
                                <ChevronRight size={16} className="settings-nav-arrow" />
                            </button>
                        );
                    })}

                    <div className="settings-help-card">
                        <ShieldCheck size={22} />
                        <strong>Need help?</strong>
                        <p>Contact your system administrator for account support.</p>
                    </div>
                </aside>

                <main className="settings-content">
                    <div className="settings-content-header">
                        <div className="settings-content-title-icon">
                            <ActiveIcon size={21} />
                        </div>
                        <div>
                            <h3>{activeSection.label}</h3>
                            <p>{activeSection.description}</p>
                        </div>
                    </div>

                    <div className="settings-content-body">
                        {content[activeTab]()}
                    </div>

                    <div className="settings-footer">
                        <div className="settings-save-feedback" aria-live="polite">
                            {saveMessage && (
                                <span className={saveMessage.startsWith("Your changes") ? "success" : "error"}>
                                    {saveMessage.startsWith("Your changes") && <CheckCircle2 size={16} />}
                                    {saveMessage}
                                </span>
                            )}
                        </div>

                        <button className="settings-save-btn" onClick={saveChanges}>
                            <Save size={17} /> Save Changes
                        </button>
                    </div>
                </main>
            </div>
        </div>
    );
}

export default Settings;
