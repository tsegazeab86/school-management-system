
import { useState } from "react";
import {
  UserRound,
  Mail,
  Phone,
  MapPin,
  BriefcaseBusiness,
  CalendarDays,
  Camera,
  Edit3,
  Save,
  X,
  ShieldCheck,
  GraduationCap,
  CheckCircle2,
} from "lucide-react";

import "../../styles/registrar/MyProfile.css";

const initialProfile = {
  name: "Tsegaye Mekonnen",
  email: "registrar@school.edu",
  phone: "+251 900 000 000",
  role: "School Registrar",
  department: "Administration",
  employeeId: "REG-2026-001",
  address: "Injibara, Ethiopia",
  joinedDate: "September 2025",
  gender: "Male",
  status: "Active",
};

function MyProfile() {
  const [profile, setProfile] = useState(initialProfile);
  const [avatar, setAvatar] = useState("");
  const [editing, setEditing] = useState(false);
  const [message, setMessage] = useState("");

  const updateField = (name, value) => {
    setProfile((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handlePhoto = (event) => {
    const file = event.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setMessage("Please select a valid image.");
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setMessage("Image size must be less than 2 MB.");
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      setAvatar(reader.result);
      setMessage("Profile photo updated in this session.");
    };

    reader.readAsDataURL(file);
  };

  const handleSave = () => {
    if (!profile.name.trim() || !profile.email.trim()) {
      setMessage("Name and email are required.");
      return;
    }

    setEditing(false);
    setMessage("Profile updated successfully in this session.");
  };

  const handleCancel = () => {
    setProfile(initialProfile);
    setEditing(false);
    setMessage("");
  };

  const profileImage =
    avatar ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(
      profile.name
    )}&background=7059D5&color=fff&size=200`;

  return (
    <div className="registrar-profile-page">

      {/* Page Heading */}
      <div className="profile-page-heading">
        <div>
          <span className="profile-eyebrow">ACCOUNT MANAGEMENT</span>
          <h2>My Profile</h2>
          <p>View and manage your personal account information.</p>
        </div>

        <div className="profile-heading-icon">
          <UserRound size={27} />
        </div>
      </div>

      {/* Profile Banner */}
      <div className="profile-cover">
        <div className="profile-cover-decoration decoration-one"></div>
        <div className="profile-cover-decoration decoration-two"></div>

        <div className="profile-cover-content">
          <div className="profile-avatar-wrapper">
            <img
              src={profileImage}
              alt="Registrar profile"
              onError={(event) => {
                event.currentTarget.src =
                  "https://ui-avatars.com/api/?name=Registrar&background=7059D5&color=fff";
              }}
            />

            {editing && (
              <label className="profile-camera-button" title="Change photo">
                <Camera size={17} />
                <input
                  type="file"
                  accept="image/*"
                  hidden
                  onChange={handlePhoto}
                />
              </label>
            )}
          </div>

          <div className="profile-cover-info">
            <h2>{profile.name}</h2>
            <p>{profile.role}</p>

            <span className="profile-status">
              <span></span>
              {profile.status}
            </span>
          </div>

          <div className="profile-cover-action">
            {!editing ? (
              <button
                className="profile-edit-button"
                onClick={() => {
                  setEditing(true);
                  setMessage("");
                }}
              >
                <Edit3 size={17} />
                Edit Profile
              </button>
            ) : (
              <div className="profile-edit-actions">
                <button
                  className="profile-cancel-button"
                  onClick={handleCancel}
                >
                  <X size={16} />
                  Cancel
                </button>

                <button
                  className="profile-save-button"
                  onClick={handleSave}
                >
                  <Save size={16} />
                  Save
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Profile Summary */}
      <div className="profile-summary-grid">
        <div className="profile-summary-card">
          <div className="profile-summary-icon purple">
            <BriefcaseBusiness size={21} />
          </div>
          <div>
            <span>Department</span>
            <strong>{profile.department}</strong>
          </div>
        </div>

        <div className="profile-summary-card">
          <div className="profile-summary-icon blue">
            <ShieldCheck size={21} />
          </div>
          <div>
            <span>Employee ID</span>
            <strong>{profile.employeeId}</strong>
          </div>
        </div>

        <div className="profile-summary-card">
          <div className="profile-summary-icon green">
            <CalendarDays size={21} />
          </div>
          <div>
            <span>Joined Date</span>
            <strong>{profile.joinedDate}</strong>
          </div>
        </div>
      </div>

      {/* Profile Information */}
      <div className="profile-information-grid">

        {/* Personal Information */}
        <section className="profile-info-card">
          <div className="profile-card-heading">
            <div>
              <h3>Personal Information</h3>
              <p>Your basic personal details.</p>
            </div>
            <UserRound size={22} />
          </div>

          <div className="profile-fields-grid">
            <div className="profile-field">
              <label>Full Name</label>
              {editing ? (
                <input
                  value={profile.name}
                  onChange={(e) => updateField("name", e.target.value)}
                />
              ) : (
                <strong>{profile.name}</strong>
              )}
            </div>

            <div className="profile-field">
              <label>Gender</label>
              {editing ? (
                <select
                  value={profile.gender}
                  onChange={(e) => updateField("gender", e.target.value)}
                >
                  <option>Male</option>
                  <option>Female</option>
                  <option>Other</option>
                </select>
              ) : (
                <strong>{profile.gender}</strong>
              )}
            </div>

            <div className="profile-field">
              <label>Email Address</label>
              {editing ? (
                <input
                  type="email"
                  value={profile.email}
                  onChange={(e) => updateField("email", e.target.value)}
                />
              ) : (
                <strong>{profile.email}</strong>
              )}
            </div>

            <div className="profile-field">
              <label>Phone Number</label>
              {editing ? (
                <input
                  value={profile.phone}
                  onChange={(e) => updateField("phone", e.target.value)}
                />
              ) : (
                <strong>{profile.phone}</strong>
              )}
            </div>

            <div className="profile-field profile-full-field">
              <label>Address</label>
              {editing ? (
                <input
                  value={profile.address}
                  onChange={(e) => updateField("address", e.target.value)}
                />
              ) : (
                <strong>{profile.address}</strong>
              )}
            </div>
          </div>
        </section>

        {/* Employment Information */}
        <section className="profile-info-card">
          <div className="profile-card-heading">
            <div>
              <h3>Employment Information</h3>
              <p>Your official school account details.</p>
            </div>
            <GraduationCap size={24} />
          </div>

          <div className="profile-detail-list">
            <div className="profile-detail-item">
              <span className="profile-detail-icon">
                <BriefcaseBusiness size={18} />
              </span>
              <div>
                <small>Position</small>
                <strong>{profile.role}</strong>
              </div>
            </div>

            <div className="profile-detail-item">
              <span className="profile-detail-icon">
                <ShieldCheck size={18} />
              </span>
              <div>
                <small>Employee ID</small>
                <strong>{profile.employeeId}</strong>
              </div>
            </div>

            <div className="profile-detail-item">
              <span className="profile-detail-icon">
                <MapPin size={18} />
              </span>
              <div>
                <small>Department</small>
                <strong>{profile.department}</strong>
              </div>
            </div>

            <div className="profile-detail-item">
              <span className="profile-detail-icon">
                <CalendarDays size={18} />
              </span>
              <div>
                <small>Joined Date</small>
                <strong>{profile.joinedDate}</strong>
              </div>
            </div>
          </div>

          <div className="profile-account-status">
            <CheckCircle2 size={19} />
            <div>
              <strong>Account is active</strong>
              <p>Your registrar account is currently enabled.</p>
            </div>
          </div>
        </section>
      </div>

      {/* Contact Information */}
      <section className="profile-contact-card">
        <div className="profile-card-heading">
          <div>
            <h3>Contact Information</h3>
            <p>Ways to contact your account.</p>
          </div>
        </div>

        <div className="profile-contact-grid">
          <div>
            <Mail size={20} />
            <span>
              <small>Email</small>
              <strong>{profile.email}</strong>
            </span>
          </div>

          <div>
            <Phone size={20} />
            <span>
              <small>Phone</small>
              <strong>{profile.phone}</strong>
            </span>
          </div>

          <div>
            <MapPin size={20} />
            <span>
              <small>Location</small>
              <strong>{profile.address}</strong>
            </span>
          </div>
        </div>
      </section>

      {message && (
        <div className="profile-feedback" role="status">
          {message}
        </div>
      )}
    </div>
  );
}

export default MyProfile;
