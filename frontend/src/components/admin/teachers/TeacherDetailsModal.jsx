import {
  Award,
  Banknote,
  BookOpen,
  BriefcaseBusiness,
  CalendarDays,
  Clock,
  GraduationCap,
  Mail,
  MapPin,
  Pencil,
  Phone,
  UserRound,
  Users,
  X,
} from "lucide-react";

import TeacherAvatar from "./TeacherAvatar";
import {
  formatTeacherCurrency,
  formatTeacherDate,
  formatTeacherExperience,
  formatTeacherList,
  getTeacherStatusClass,
} from "../../../utils/admin/teacherFormatters";

function DetailItem({ icon: Icon, label, value }) {
  return (
    <div className="admin-teachers-detail-item">
      <span className="admin-teachers-detail-icon">
        <Icon size={16} />
      </span>
      <div>
        <span className="admin-teachers-detail-label">{label}</span>
        <strong className="admin-teachers-detail-value">
          {value || "Not provided"}
        </strong>
      </div>
    </div>
  );
}

function TeacherDetailsModal({ teacher, onClose, onEdit }) {
  if (!teacher) {
    return null;
  }

  return (
    <div
      className="admin-teachers-modal-backdrop"
      onClick={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        className="admin-teachers-modal admin-teachers-details-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="admin-teachers-details-title"
      >
        <div className="admin-teachers-modal-header">
          <div>
            <h2 id="admin-teachers-details-title">Teacher Profile</h2>
            <p>Complete profile, teaching load, and employment details.</p>
          </div>

          <button
            type="button"
            className="admin-teachers-icon-btn"
            onClick={onClose}
            aria-label="Close teacher details"
          >
            <X size={20} />
          </button>
        </div>

        <div className="admin-teachers-modal-body">
          <div className="admin-teachers-details-hero">
            <TeacherAvatar teacher={teacher} size="xl" />

            <div className="admin-teachers-details-hero-copy">
              <h3>{teacher.fullName}</h3>
              <span className="admin-teachers-details-number">
                {teacher.teacherId}
              </span>

              <div className="admin-teachers-details-meta">
                <span className="admin-teachers-details-tag">
                  <BriefcaseBusiness size={13} />
                  {teacher.department || "Unassigned"}
                </span>
                <span className="admin-teachers-details-tag">
                  {teacher.employmentType || "Not provided"}
                </span>
                <span
                  className={`admin-teachers-status ${getTeacherStatusClass(
                    teacher.status
                  )}`}
                >
                  <span />
                  {teacher.status}
                </span>
              </div>
            </div>
          </div>

          <section className="admin-teachers-details-section">
            <h4>Personal Information</h4>
            <div className="admin-teachers-details-grid">
              <DetailItem
                icon={UserRound}
                label="Gender"
                value={teacher.gender}
              />
              <DetailItem
                icon={CalendarDays}
                label="Date of Birth"
                value={formatTeacherDate(teacher.dateOfBirth)}
              />
              <DetailItem
                icon={MapPin}
                label="Residential Address"
                value={teacher.address}
              />
            </div>
          </section>

          <section className="admin-teachers-details-section">
            <h4>Contact Information</h4>
            <div className="admin-teachers-details-grid">
              <DetailItem
                icon={Mail}
                label="Email Address"
                value={teacher.email}
              />
              <DetailItem
                icon={Phone}
                label="Phone Number"
                value={teacher.phone}
              />
              <DetailItem
                icon={Phone}
                label="Alternate Phone"
                value={teacher.alternatePhone}
              />
            </div>
          </section>

          <section className="admin-teachers-details-section">
            <h4>Professional Information</h4>
            <div className="admin-teachers-details-grid">
              <DetailItem
                icon={GraduationCap}
                label="Qualification"
                value={teacher.qualification}
              />
              <DetailItem
                icon={Award}
                label="Specialization"
                value={teacher.specialization}
              />
              <DetailItem
                icon={Clock}
                label="Experience"
                value={formatTeacherExperience(teacher.experienceYears)}
              />
              <DetailItem
                icon={BriefcaseBusiness}
                label="Department"
                value={teacher.department}
              />
              <DetailItem
                icon={BookOpen}
                label="Assigned Subjects"
                value={formatTeacherList(teacher.assignedSubjects)}
              />
              <DetailItem
                icon={Users}
                label="Assigned Classes"
                value={formatTeacherList(teacher.assignedClasses)}
              />
            </div>
          </section>

          <section className="admin-teachers-details-section">
            <h4>Employment Information</h4>
            <div className="admin-teachers-details-grid">
              <DetailItem
                icon={CalendarDays}
                label="Hire Date"
                value={formatTeacherDate(teacher.hireDate)}
              />
              <DetailItem
                icon={BriefcaseBusiness}
                label="Employment Type"
                value={teacher.employmentType}
              />
              <DetailItem
                icon={Banknote}
                label="Monthly Salary"
                value={formatTeacherCurrency(teacher.salary)}
              />
              <DetailItem
                icon={UserRound}
                label="Employment Status"
                value={teacher.status}
              />
              <DetailItem
                icon={CalendarDays}
                label="Profile Created"
                value={formatTeacherDate(teacher.createdAt)}
              />
              <DetailItem
                icon={CalendarDays}
                label="Last Updated"
                value={formatTeacherDate(teacher.updatedAt)}
              />
            </div>
          </section>
        </div>

        <div className="admin-teachers-modal-footer">
          <button
            type="button"
            className="admin-teachers-btn admin-teachers-btn-secondary"
            onClick={onClose}
          >
            Close
          </button>

          <button
            type="button"
            className="admin-teachers-btn admin-teachers-btn-primary"
            onClick={() => onEdit(teacher)}
          >
            <Pencil size={16} />
            Edit Teacher
          </button>
        </div>
      </div>
    </div>
  );
}

export default TeacherDetailsModal;
