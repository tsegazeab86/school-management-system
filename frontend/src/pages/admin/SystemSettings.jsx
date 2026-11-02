import { useState } from "react";
import {
  School,
  CalendarDays,
  GraduationCap,
  ClipboardCheck,
  Settings,
  Save,
  RotateCcw,
} from "lucide-react";
import "../../styles/admin/SystemSettings.css";

const initialSettings = {
  schoolName: "Injibara Secondary School",
  schoolEmail: "info@school.com",
  phone: "0912345678",
  address: "Injibara, Ethiopia",
  website: "www.school.com",
  academicYear: "2026/2027",
  startDate: "2026-09-01",
  endDate: "2027-06-30",
  semester1Start: "2026-09-01",
  semester1End: "2027-01-15",
  semester2Start: "2027-01-16",
  semester2End: "2027-06-30",
  passingGrade: 50,
  excellentGrade: 85,
  goodGrade: 70,
  averageGrade: 50,
  attendanceLimit: 75,
  lateAfter: 15,
  enableNotifications: true,
  enableParentAccess: true,
  enableStudentRegistration: true,
};

const settingTabs = [
  { id: "school", label: "School Profile", icon: School },
  { id: "academic", label: "Academic Year", icon: CalendarDays },
  { id: "grading", label: "Grading System", icon: GraduationCap },
  { id: "attendance", label: "Attendance", icon: ClipboardCheck },
  { id: "system", label: "System Preferences", icon: Settings },
];

function SystemSettings() {
  const [activeTab, setActiveTab] = useState("school");
  const [settings, setSettings] = useState(initialSettings);
  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setSettings((previous) => ({
      ...previous,
      [name]: type === "checkbox" ? checked : value,
    }));

    setMessage("");
  };

  const handleSave = (e) => {
    e.preventDefault();

    if (
      Number(settings.passingGrade) > 100 ||
      Number(settings.passingGrade) < 0 ||
      Number(settings.attendanceLimit) > 100 ||
      Number(settings.attendanceLimit) < 0
    ) {
      setMessage("Please enter valid percentages between 0 and 100.");
      return;
    }

    if (
      settings.startDate &&
      settings.endDate &&
      settings.startDate >= settings.endDate
    ) {
      setMessage("Academic year end date must be after the start date.");
      return;
    }

    setMessage("Settings saved successfully in this session.");
  };

  const handleReset = () => {
    const confirmed = window.confirm(
      "Reset all settings to their original sample values?"
    );

    if (confirmed) {
      setSettings(initialSettings);
      setMessage("Settings have been reset.");
    }
  };

  const renderSchoolProfile = () => (
    <div className="settings-section">
      <div className="settings-section-heading">
        <h2>School Profile</h2>
        <p>Manage your school's basic information and contact details.</p>
      </div>

      <div className="settings-form-grid">
        <div className="settings-field">
          <label>School Name *</label>
          <input
            name="schoolName"
            value={settings.schoolName}
            onChange={handleChange}
            required
          />
        </div>

        <div className="settings-field">
          <label>School Email *</label>
          <input
            type="email"
            name="schoolEmail"
            value={settings.schoolEmail}
            onChange={handleChange}
            required
          />
        </div>

        <div className="settings-field">
          <label>Phone Number</label>
          <input
            name="phone"
            value={settings.phone}
            onChange={handleChange}
          />
        </div>

        <div className="settings-field">
          <label>Website</label>
          <input
            name="website"
            value={settings.website}
            onChange={handleChange}
          />
        </div>

        <div className="settings-field full-width">
          <label>School Address</label>
          <textarea
            name="address"
            value={settings.address}
            onChange={handleChange}
            rows="3"
          />
        </div>
      </div>
    </div>
  );

  const renderAcademicSettings = () => (
    <div className="settings-section">
      <div className="settings-section-heading">
        <h2>Academic Year & Semesters</h2>
        <p>Configure the school's academic calendar.</p>
      </div>

      <div className="settings-form-grid">
        <div className="settings-field full-width">
          <label>Academic Year *</label>
          <input
            name="academicYear"
            value={settings.academicYear}
            onChange={handleChange}
            required
          />
        </div>

        <div className="settings-field">
          <label>Academic Year Start</label>
          <input
            type="date"
            name="startDate"
            value={settings.startDate}
            onChange={handleChange}
          />
        </div>

        <div className="settings-field">
          <label>Academic Year End</label>
          <input
            type="date"
            name="endDate"
            value={settings.endDate}
            onChange={handleChange}
          />
        </div>
      </div>

      <div className="settings-subsection">
        <h3>Semester 1</h3>
        <div className="settings-form-grid">
          <div className="settings-field">
            <label>Start Date</label>
            <input
              type="date"
              name="semester1Start"
              value={settings.semester1Start}
              onChange={handleChange}
            />
          </div>
          <div className="settings-field">
            <label>End Date</label>
            <input
              type="date"
              name="semester1End"
              value={settings.semester1End}
              onChange={handleChange}
            />
          </div>
        </div>
      </div>

      <div className="settings-subsection">
        <h3>Semester 2</h3>
        <div className="settings-form-grid">
          <div className="settings-field">
            <label>Start Date</label>
            <input
              type="date"
              name="semester2Start"
              value={settings.semester2Start}
              onChange={handleChange}
            />
          </div>
          <div className="settings-field">
            <label>End Date</label>
            <input
              type="date"
              name="semester2End"
              value={settings.semester2End}
              onChange={handleChange}
            />
          </div>
        </div>
      </div>
    </div>
  );

  const renderGradingSettings = () => (
    <div className="settings-section">
      <div className="settings-section-heading">
        <h2>Grading System</h2>
        <p>Set the grade percentages used to evaluate students.</p>
      </div>

      <div className="settings-grade-info">
        <div className="settings-grade-card">
          <span>Excellent</span>
          <strong>85–100%</strong>
        </div>
        <div className="settings-grade-card">
          <span>Good</span>
          <strong>70–84%</strong>
        </div>
        <div className="settings-grade-card">
          <span>Average</span>
          <strong>50–69%</strong>
        </div>
        <div className="settings-grade-card">
          <span>Below Passing</span>
          <strong>0–49%</strong>
        </div>
      </div>

      <div className="settings-form-grid">
        <div className="settings-field">
          <label>Passing Grade (%)</label>
          <input
            type="number"
            name="passingGrade"
            min="0"
            max="100"
            value={settings.passingGrade}
            onChange={handleChange}
          />
        </div>

        <div className="settings-field">
          <label>Excellent Grade Starts (%)</label>
          <input
            type="number"
            name="excellentGrade"
            min="0"
            max="100"
            value={settings.excellentGrade}
            onChange={handleChange}
          />
        </div>

        <div className="settings-field">
          <label>Good Grade Starts (%)</label>
          <input
            type="number"
            name="goodGrade"
            min="0"
            max="100"
            value={settings.goodGrade}
            onChange={handleChange}
          />
        </div>

        <div className="settings-field">
          <label>Average Grade Starts (%)</label>
          <input
            type="number"
            name="averageGrade"
            min="0"
            max="100"
            value={settings.averageGrade}
            onChange={handleChange}
          />
        </div>
      </div>
    </div>
  );

  const renderAttendanceSettings = () => (
    <div className="settings-section">
      <div className="settings-section-heading">
        <h2>Attendance Settings</h2>
        <p>Configure attendance rules for students.</p>
      </div>

      <div className="settings-form-grid">
        <div className="settings-field">
          <label>Minimum Attendance (%)</label>
          <input
            type="number"
            name="attendanceLimit"
            min="0"
            max="100"
            value={settings.attendanceLimit}
            onChange={handleChange}
          />
          <small>Minimum attendance percentage required.</small>
        </div>

        <div className="settings-field">
          <label>Late Arrival After (Minutes)</label>
          <input
            type="number"
            name="lateAfter"
            min="0"
            max="180"
            value={settings.lateAfter}
            onChange={handleChange}
          />
          <small>Minutes after the expected start time.</small>
        </div>
      </div>
    </div>
  );

  const renderSystemPreferences = () => (
    <div className="settings-section">
      <div className="settings-section-heading">
        <h2>System Preferences</h2>
        <p>Manage general features and access preferences.</p>
      </div>

      <div className="settings-options">
        <label className="settings-option">
          <div>
            <strong>Enable Notifications</strong>
            <p>Allow the system to show notification messages.</p>
          </div>
          <input
            type="checkbox"
            name="enableNotifications"
            checked={settings.enableNotifications}
            onChange={handleChange}
          />
        </label>

        <label className="settings-option">
          <div>
            <strong>Enable Parent Access</strong>
            <p>Allow parents to access their children's information.</p>
          </div>
          <input
            type="checkbox"
            name="enableParentAccess"
            checked={settings.enableParentAccess}
            onChange={handleChange}
          />
        </label>

        <label className="settings-option">
          <div>
            <strong>Enable Student Registration</strong>
            <p>Allow student registration through the system.</p>
          </div>
          <input
            type="checkbox"
            name="enableStudentRegistration"
            checked={settings.enableStudentRegistration}
            onChange={handleChange}
          />
        </label>
      </div>
    </div>
  );

  const renderActiveContent = () => {
    switch (activeTab) {
      case "school":
        return renderSchoolProfile();
      case "academic":
        return renderAcademicSettings();
      case "grading":
        return renderGradingSettings();
      case "attendance":
        return renderAttendanceSettings();
      case "system":
        return renderSystemPreferences();
      default:
        return renderSchoolProfile();
    }
  };

  return (
    <div className="system-settings-page">
      <div className="system-settings-header">
        <div>
          <p className="settings-breadcrumb">Administrator / Settings</p>
          <h1>System Settings</h1>
          <p className="settings-subtitle">
            Configure school information and system preferences.
          </p>
        </div>
      </div>

      <div className="system-settings-layout">
        <aside className="settings-sidebar">
          <h3>Settings Menu</h3>

          {settingTabs.map((tab) => {
            const Icon = tab.icon;

            return (
              <button
                key={tab.id}
                className={`settings-nav-item ${
                  activeTab === tab.id ? "active" : ""
                }`}
                onClick={() => {
                  setActiveTab(tab.id);
                  setMessage("");
                }}
              >
                <Icon size={19} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </aside>

        <main className="settings-main">
          <form onSubmit={handleSave}>
            {renderActiveContent()}

            {message && (
              <p
                className={`settings-message ${
                  message.includes("successfully") ||
                  message.includes("reset")
                    ? "success"
                    : "error"
                }`}
              >
                {message}
              </p>
            )}

            <div className="settings-footer">
              <button
                type="button"
                className="settings-reset-btn"
                onClick={handleReset}
              >
                <RotateCcw size={17} />
                Reset
              </button>

              <button type="submit" className="settings-save-btn">
                <Save size={17} />
                Save Settings
              </button>
            </div>
          </form>
        </main>
      </div>
    </div>
  );
}

export default SystemSettings;