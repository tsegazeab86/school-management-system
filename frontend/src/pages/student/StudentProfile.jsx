
import   { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  UserRound,
  Mail,
//   Phone,
  MapPin,
  CalendarDays,
  GraduationCap,
  BookOpen,
  ShieldCheck,
  Camera,
  Edit3,
  Save,
//   UserRound,
  X,
  LockKeyhole,
  Eye,
  EyeOff,
  Users,
  IdCard,
  CheckCircle2,
  AlertCircle,
  KeyRound,
} from "lucide-react";
import "./StudentProfile.css";

const initialProfile = {
  firstName: "Abebe",
  lastName: "Tadesse",
  studentId: "STU-2026-0142",
  email: "abebe.student@school.edu",
  phone: "+251 912 345 678",
  gender: "Male",
  dateOfBirth: "2004-05-15",
  department: "Computer Science",
  program: "Undergraduate",
  year: "3rd Year",
  semester: "First Semester",
  section: "Section A",
  address: "Injibara, Ethiopia",
  admissionDate: "2024-09-15",
  guardianName: "Tadesse Abebe",
  guardianPhone: "+251 911 222 333",
  guardianEmail: "guardian@example.com",
  relationship: "Father",
};

function StudentProfile() {
  const [profile, setProfile] = useState(initialProfile);
  const [editMode, setEditMode] = useState(false);
  const [editedProfile, setEditedProfile] = useState(initialProfile);
  const [photo, setPhoto] = useState("");
  const [photoError, setPhotoError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [activeTab, setActiveTab] = useState("personal");

  const [passwordForm, setPasswordForm] = useState({
    current: "",
    newPassword: "",
    confirm: "",
  });

  const [showPasswords, setShowPasswords] = useState({
    current: false,
    newPassword: false,
    confirm: false,
  });

  const [passwordMessage, setPasswordMessage] = useState("");
  const [passwordError, setPasswordError] = useState("");

  useEffect(() => {
    return () => {
      if (photo) URL.revokeObjectURL(photo);
    };
  }, [photo]);

  const initials = `${profile.firstName.charAt(0)}${profile.lastName.charAt(0)}`;

  const handleEditChange = (event) => {
    const { name, value } = event.target;
    setEditedProfile((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleSaveProfile = (event) => {
    event.preventDefault();

    if (
      !editedProfile.firstName.trim() ||
      !editedProfile.lastName.trim() ||
      !editedProfile.email.trim() ||
      !editedProfile.phone.trim()
    ) {
      return;
    }

    setProfile({ ...editedProfile });
    setEditMode(false);
    setSuccessMessage("Your profile changes have been saved.");
    window.setTimeout(() => setSuccessMessage(""), 3500);
  };

  const handleCancelEdit = () => {
    setEditedProfile({ ...profile });
    setEditMode(false);
  };

  const handlePhotoChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setPhotoError("");

    if (!file.type.startsWith("image/")) {
      setPhotoError("Please select a valid image file.");
      event.target.value = "";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setPhotoError("Image size must be 5MB or less.");
      event.target.value = "";
      return;
    }

    setPhoto(URL.createObjectURL(file));
    event.target.value = "";
  };

  const togglePasswordVisibility = (field) => {
    setShowPasswords((previous) => ({
      ...previous,
      [field]: !previous[field],
    }));
  };

  const handlePasswordChange = (event) => {
    const { name, value } = event.target;
    setPasswordForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handlePasswordSubmit = (event) => {
    event.preventDefault();
    setPasswordError("");
    setPasswordMessage("");

    if (
      !passwordForm.current ||
      !passwordForm.newPassword ||
      !passwordForm.confirm
    ) {
      setPasswordError("Please complete all password fields.");
      return;
    }

    if (passwordForm.newPassword.length < 8) {
      setPasswordError("New password must contain at least 8 characters.");
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirm) {
      setPasswordError("New password and confirmation do not match.");
      return;
    }

    if (passwordForm.current === passwordForm.newPassword) {
      setPasswordError("Choose a different password from your current one.");
      return;
    }

    // Demo only: a real application must verify and update passwords on the server.
    setPasswordMessage(
      "Demo validation successful. Connect the backend to update your password."
    );

    setPasswordForm({
      current: "",
      newPassword: "",
      confirm: "",
    });
  };

  const renderPasswordInput = (label, field, placeholder) => (
    <div className="sp-form-group">
      <label htmlFor={`sp-${field}`}>{label}</label>
      <div className="sp-password-input">
        <input
          id={`sp-${field}`}
          className="form-control"
          type={showPasswords[field] ? "text" : "password"}
          name={field}
          placeholder={placeholder}
          value={passwordForm[field]}
          onChange={handlePasswordChange}
          autoComplete="off"
          required
        />
        <button
          type="button"
          onClick={() => togglePasswordVisibility(field)}
          aria-label={`Toggle ${label.toLowerCase()} visibility`}
        >
          {showPasswords[field] ? <EyeOff size={17} /> : <Eye size={17} />}
        </button>
      </div>
    </div>
  );

  return (
    <div className="sp-page container-fluid">
      {/* Page heading */}
      <motion.div
        className="sp-page-header"
        initial={{ opacity: 0, y: -15 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div>
          <div className="sp-eyebrow">
            <UserRound size={15} />
            STUDENT ACCOUNT
          </div>
          <h2>My Profile</h2>
          <p>View and manage your personal and academic information.</p>
        </div>

        {!editMode ? (
          <button
            className="sp-edit-button"
            onClick={() => {
              setEditedProfile({ ...profile });
              setEditMode(true);
              setActiveTab("personal");
            }}
          >
            <Edit3 size={17} />
            Edit Profile
          </button>
        ) : (
          <div className="sp-header-actions">
            <button className="sp-cancel-button" onClick={handleCancelEdit}>
              <X size={16} /> Cancel
            </button>
            <button
              className="sp-save-button"
              type="submit"
              form="sp-profile-form"
            >
              <Save size={16} /> Save Changes
            </button>
          </div>
        )}
      </motion.div>

      {successMessage && (
        <motion.div
          className="sp-success-alert"
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <CheckCircle2 size={18} />
          {successMessage}
        </motion.div>
      )}

      {/* Profile hero */}
      <motion.section
        className="sp-hero"
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <div className="sp-hero-pattern" />

        <div className="sp-hero-content">
          <div className="sp-photo-wrapper">
            <div className="sp-profile-photo">
              {photo ? (
                <img src={photo} alt="Student profile" />
              ) : (
                <span>{initials}</span>
              )}
            </div>

            <label className="sp-camera-button" title="Change profile photo">
              <Camera size={17} />
              <input
                type="file"
                accept="image/*"
                onChange={handlePhotoChange}
                hidden
              />
            </label>
          </div>

          <div className="sp-hero-details">
            <span className="sp-student-badge">
              <ShieldCheck size={14} /> Active Student
            </span>
            <h3>
              {profile.firstName} {profile.lastName}
            </h3>
            <p>{profile.department} Student</p>
            <div className="sp-hero-meta">
              <span>
                <IdCard size={15} /> {profile.studentId}
              </span>
              <span>
                <MapPin size={15} /> {profile.address}
              </span>
            </div>
          </div>

          <div className="sp-hero-academic">
            <span>ACADEMIC YEAR</span>
            <strong>{profile.year}</strong>
            <small>{profile.semester}</small>
          </div>
        </div>

        {photoError && (
          <div className="sp-photo-error">
            <AlertCircle size={15} /> {photoError}
          </div>
        )}
        <div className="sp-photo-hint">
          Profile photo: JPG, PNG or other image format, maximum 5MB.
        </div>
      </motion.section>

      {/* Overview cards */}
      <div className="row g-3 sp-overview-row">
        <div className="col-12 col-sm-6 col-xl-3">
          <div className="sp-overview-card">
            <div className="sp-overview-icon sp-green">
              <GraduationCap size={21} />
            </div>
            <div>
              <span>Department</span>
              <strong>{profile.department}</strong>
            </div>
          </div>
        </div>

        <div className="col-12 col-sm-6 col-xl-3">
          <div className="sp-overview-card">
            <div className="sp-overview-icon sp-purple">
              <BookOpen size={21} />
            </div>
            <div>
              <span>Program</span>
              <strong>{profile.program}</strong>
            </div>
          </div>
        </div>

        <div className="col-12 col-sm-6 col-xl-3">
          <div className="sp-overview-card">
            <div className="sp-overview-icon sp-orange">
              <CalendarDays size={21} />
            </div>
            <div>
              <span>Academic Year</span>
              <strong>{profile.year}</strong>
            </div>
          </div>
        </div>

        <div className="col-12 col-sm-6 col-xl-3">
          <div className="sp-overview-card">
            <div className="sp-overview-icon sp-blue">
              <Users size={21} />
            </div>
            <div>
              <span>Section</span>
              <strong>{profile.section}</strong>
            </div>
          </div>
        </div>
      </div>

      {/* Main profile content */}
      <div className="sp-content-layout">
        <aside className="sp-profile-nav">
          <div className="sp-nav-heading">PROFILE SETTINGS</div>

          <button
            className={activeTab === "personal" ? "active" : ""}
            onClick={() => setActiveTab("personal")}
          >
            <UserRound size={18} />
            Personal Information
          </button>

          <button
            className={activeTab === "academic" ? "active" : ""}
            onClick={() => setActiveTab("academic")}
          >
            <GraduationCap size={18} />
            Academic Information
          </button>

          <button
            className={activeTab === "guardian" ? "active" : ""}
            onClick={() => setActiveTab("guardian")}
          >
            <Users size={18} />
            Guardian Information
          </button>

          <button
            className={activeTab === "security" ? "active" : ""}
            onClick={() => setActiveTab("security")}
          >
            <LockKeyhole size={18} />
            Change Password
          </button>

          <div className="sp-security-note">
            <ShieldCheck size={19} />
            <strong>Your account matters</strong>
            <p>Keep your contact details up to date and protect your account.</p>
          </div>
        </aside>

        <main className="sp-information-panel">
          {/* Personal information */}
          {activeTab === "personal" && (
            <motion.div
              key="personal"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="sp-panel-heading">
                <div>
                  <h4>Personal Information</h4>
                  <p>Your basic personal details and contact information.</p>
                </div>
                <div className="sp-panel-icon">
                  <UserRound size={21} />
                </div>
              </div>

              <form id="sp-profile-form" onSubmit={handleSaveProfile}>
                <div className="sp-form-section-title">
                  <UserRound size={16} /> BASIC INFORMATION
                </div>

                <div className="row g-3">
                  <div className="col-12 col-md-6">
                    <div className="sp-form-group">
                      <label htmlFor="sp-firstName">First Name</label>
                      <input
                        id="sp-firstName"
                        className="form-control"
                        name="firstName"
                        value={editMode ? editedProfile.firstName : profile.firstName}
                        onChange={handleEditChange}
                        disabled={!editMode}
                        required
                      />
                    </div>
                  </div>

                  <div className="col-12 col-md-6">
                    <div className="sp-form-group">
                      <label htmlFor="sp-lastName">Last Name</label>
                      <input
                        id="sp-lastName"
                        className="form-control"
                        name="lastName"
                        value={editMode ? editedProfile.lastName : profile.lastName}
                        onChange={handleEditChange}
                        disabled={!editMode}
                        required
                      />
                    </div>
                  </div>

                  <div className="col-12 col-md-6">
                    <div className="sp-form-group">
                      <label htmlFor="sp-gender">Gender</label>
                      <select
                        id="sp-gender"
                        className="form-select"
                        name="gender"
                        value={editMode ? editedProfile.gender : profile.gender}
                        onChange={handleEditChange}
                        disabled={!editMode}
                      >
                        <option>Male</option>
                        <option>Female</option>
                        <option>Other</option>
                      </select>
                    </div>
                  </div>

                  <div className="col-12 col-md-6">
                    <div className="sp-form-group">
                      <label htmlFor="sp-dob">Date of Birth</label>
                      <input
                        id="sp-dob"
                        type="date"
                        className="form-control"
                        name="dateOfBirth"
                        value={
                          editMode
                            ? editedProfile.dateOfBirth
                            : profile.dateOfBirth
                        }
                        onChange={handleEditChange}
                        disabled={!editMode}
                      />
                    </div>
                  </div>
                </div>

                <div className="sp-form-section-title">
                  <Mail size={16} /> CONTACT INFORMATION
                </div>

                <div className="row g-3">
                  <div className="col-12 col-md-6">
                    <div className="sp-form-group">
                      <label htmlFor="sp-email">Email Address</label>
                      <input
                        id="sp-email"
                        type="email"
                        className="form-control"
                        name="email"
                        value={editMode ? editedProfile.email : profile.email}
                        onChange={handleEditChange}
                        disabled={!editMode}
                        required
                      />
                    </div>
                  </div>

                  <div className="col-12 col-md-6">
                    <div className="sp-form-group">
                      <label htmlFor="sp-phone">Phone Number</label>
                      <input
                        id="sp-phone"
                        type="tel"
                        className="form-control"
                        name="phone"
                        value={editMode ? editedProfile.phone : profile.phone}
                        onChange={handleEditChange}
                        disabled={!editMode}
                        required
                      />
                    </div>
                  </div>

                  <div className="col-12">
                    <div className="sp-form-group">
                      <label htmlFor="sp-address">Address</label>
                      <input
                        id="sp-address"
                        className="form-control"
                        name="address"
                        value={editMode ? editedProfile.address : profile.address}
                        onChange={handleEditChange}
                        disabled={!editMode}
                      />
                    </div>
                  </div>
                </div>

                {editMode && (
                  <div className="sp-form-actions">
                    <button
                      type="button"
                      className="sp-cancel-button"
                      onClick={handleCancelEdit}
                    >
                      Cancel
                    </button>
                    <button type="submit" className="sp-save-button">
                      <Save size={16} /> Save Information
                    </button>
                  </div>
                )}
              </form>
            </motion.div>
          )}

          {/* Academic information */}
          {activeTab === "academic" && (
            <motion.div
              key="academic"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="sp-panel-heading">
                <div>
                  <h4>Academic Information</h4>
                  <p>Your school registration and academic details.</p>
                </div>
                <div className="sp-panel-icon sp-purple">
                  <GraduationCap size={21} />
                </div>
              </div>

              <div className="sp-readonly-notice">
                <ShieldCheck size={17} />
                Academic records are managed by the school administration.
              </div>

              <div className="row g-3">
                {[
                  ["Student ID", profile.studentId],
                  ["Department", profile.department],
                  ["Program", profile.program],
                  ["Academic Year", profile.year],
                  ["Semester", profile.semester],
                  ["Section", profile.section],
                  ["Admission Date", profile.admissionDate],
                ].map(([label, value]) => (
                  <div className="col-12 col-md-6" key={label}>
                    <div className="sp-readonly-field">
                      <span>{label}</span>
                      <strong>{value}</strong>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Guardian information */}
          {activeTab === "guardian" && (
            <motion.div
              key="guardian"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="sp-panel-heading">
                <div>
                  <h4>Guardian Information</h4>
                  <p>Contact information for your parent or guardian.</p>
                </div>
                <div className="sp-panel-icon sp-orange">
                  <Users size={21} />
                </div>
              </div>

              <div className="sp-readonly-notice">
                <ShieldCheck size={17} />
                Contact the school office to update official guardian records.
              </div>

              <div className="sp-guardian-card">
                <div className="sp-guardian-avatar">
                  <Users size={26} />
                </div>
                <div>
                  <span>REGISTERED GUARDIAN</span>
                  <h5>{profile.guardianName}</h5>
                  <p>{profile.relationship}</p>
                </div>
              </div>

              <div className="row g-3 mt-2">
                <div className="col-12 col-md-6">
                  <div className="sp-readonly-field">
                    <span>Guardian Name</span>
                    <strong>{profile.guardianName}</strong>
                  </div>
                </div>

                <div className="col-12 col-md-6">
                  <div className="sp-readonly-field">
                    <span>Relationship</span>
                    <strong>{profile.relationship}</strong>
                  </div>
                </div>

                <div className="col-12 col-md-6">
                  <div className="sp-readonly-field">
                    <span>Phone Number</span>
                    <strong>{profile.guardianPhone}</strong>
                  </div>
                </div>

                <div className="col-12 col-md-6">
                  <div className="sp-readonly-field">
                    <span>Email Address</span>
                    <strong>{profile.guardianEmail}</strong>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Change password */}
          {activeTab === "security" && (
            <motion.div
              key="security"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="sp-panel-heading">
                <div>
                  <h4>Account Security</h4>
                  <p>Change your password to help protect your account.</p>
                </div>
                <div className="sp-panel-icon sp-green">
                  <LockKeyhole size={21} />
                </div>
              </div>

              <div className="sp-password-banner">
                <div>
                  <KeyRound size={25} />
                </div>
                <section>
                  <h5>Keep your account secure</h5>
                  <p>
                    Use a strong password that is difficult for others to
                    guess. Never share your password.
                  </p>
                </section>
              </div>

              <form className="sp-password-form" onSubmit={handlePasswordSubmit}>
                {passwordError && (
                  <div className="sp-error-alert">
                    <AlertCircle size={17} />
                    {passwordError}
                  </div>
                )}

                {passwordMessage && (
                  <div className="sp-success-alert">
                    <CheckCircle2 size={17} />
                    {passwordMessage}
                  </div>
                )}

                {renderPasswordInput(
                  "Current Password",
                  "current",
                  "Enter current password"
                )}

                {renderPasswordInput(
                  "New Password",
                  "newPassword",
                  "Enter new password (minimum 8 characters)"
                )}

                {renderPasswordInput(
                  "Confirm New Password",
                  "confirm",
                  "Enter new password again"
                )}

                <div className="sp-password-hint">
                  <CheckCircle2 size={15} />
                  Your new password must have at least 8 characters.
                </div>

                <button type="submit" className="sp-save-button sp-password-submit">
                  <LockKeyhole size={16} />
                  Update Password
                </button>
              </form>
            </motion.div>
          )}
        </main>
      </div>
    </div>
  );
}

export default StudentProfile;
