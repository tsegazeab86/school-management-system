import {
  X,
  Mail,
  Phone,
  MapPin,
  GraduationCap,
  CalendarDays,
  UserRound,
  Users,
  Pencil,
  Power,
} from "lucide-react";

import StudentAvatar from "./StudentAvatar";

function formatDate(value) {
  if (!value) {
    return "Not provided";
  }

  const date = new Date(
    value.includes("T") ? value : `${value}T00:00:00`
  );

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function DetailItem({ icon: Icon, label, value }) {
  return (
    <div className="admin-students-detail-item">
      <span className="admin-students-detail-icon">
        <Icon size={16} />
      </span>
      <div>
        <span className="admin-students-detail-label">{label}</span>
        <strong className="admin-students-detail-value">
          {value || "Not provided"}
        </strong>
      </div>
    </div>
  );
}

function StudentDetailsModal({
  student,
  onClose,
  onEdit,
  onToggleStatus,
}) {
  if (!student) {
    return null;
  }

  return (
    <div
      className="admin-students-modal-backdrop"
      onClick={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        className="admin-students-modal admin-students-details-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="admin-students-details-title"
      >
        <div className="admin-students-modal-header">
          <div>
            <h2 id="admin-students-details-title">Student Details</h2>
            <p>Complete student profile and guardian information.</p>
          </div>

          <button
            type="button"
            className="admin-students-icon-btn"
            onClick={onClose}
            aria-label="Close student details"
          >
            <X size={20} />
          </button>
        </div>

        <div className="admin-students-modal-body">
          <div className="admin-students-details-hero">
            <StudentAvatar student={student} size="xl" />

            <div>
              <h3>{student.fullName}</h3>
              <span className="admin-students-details-number">
                {student.studentNumber}
              </span>
              <span
                className={`admin-students-status ${
                  student.enrollmentStatus === "Active"
                    ? "is-active"
                    : "is-inactive"
                }`}
              >
                {student.enrollmentStatus}
              </span>
            </div>
          </div>

          <section className="admin-students-details-section">
            <h4>Academic Information</h4>
            <div className="admin-students-details-grid">
              <DetailItem
                icon={GraduationCap}
                label="Grade"
                value={student.grade}
              />
              <DetailItem
                icon={Users}
                label="Section"
                value={student.section}
              />
              <DetailItem
                icon={CalendarDays}
                label="Academic Year"
                value={student.academicYear}
              />
              <DetailItem
                icon={CalendarDays}
                label="Date of Birth"
                value={formatDate(student.dateOfBirth)}
              />
              <DetailItem
                icon={UserRound}
                label="Gender"
                value={student.gender}
              />
              <DetailItem
                icon={CalendarDays}
                label="Registered On"
                value={formatDate(student.createdAt)}
              />
            </div>
          </section>

          <section className="admin-students-details-section">
            <h4>Contact Information</h4>
            <div className="admin-students-details-grid">
              <DetailItem
                icon={Phone}
                label="Phone"
                value={student.phone}
              />
              <DetailItem
                icon={Mail}
                label="Email"
                value={student.email}
              />
              <DetailItem
                icon={MapPin}
                label="Address"
                value={student.address}
              />
            </div>
          </section>

          <section className="admin-students-details-section">
            <h4>Parent / Guardian</h4>
            <div className="admin-students-details-grid">
              <DetailItem
                icon={UserRound}
                label="Full Name"
                value={student.parent.name}
              />
              <DetailItem
                icon={Users}
                label="Relationship"
                value={student.parent.relationship}
              />
              <DetailItem
                icon={Phone}
                label="Phone"
                value={student.parent.phone}
              />
              <DetailItem
                icon={Mail}
                label="Email"
                value={student.parent.email}
              />
              <DetailItem
                icon={MapPin}
                label="Address"
                value={student.parent.address}
              />
            </div>
          </section>
        </div>

        <div className="admin-students-modal-footer">
          <button
            type="button"
            className="admin-students-btn admin-students-btn-secondary"
            onClick={() => onToggleStatus(student)}
          >
            <Power size={16} />
            {student.enrollmentStatus === "Active"
              ? "Deactivate"
              : "Activate"}
          </button>

          <button
            type="button"
            className="admin-students-btn admin-students-btn-primary"
            onClick={() => onEdit(student)}
          >
            <Pencil size={16} />
            Edit Student
          </button>
        </div>
      </div>
    </div>
  );
}

export default StudentDetailsModal;
