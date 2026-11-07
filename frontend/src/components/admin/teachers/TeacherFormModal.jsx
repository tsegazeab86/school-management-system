import { useEffect, useState } from "react";
import {
  AlertCircle,
  BookOpen,
  BriefcaseBusiness,
  Camera,
  Check,
  ImageOff,
  Link2,
  Mail,
  Save,
  UserRound,
  Users,
  X,
} from "lucide-react";

import TeacherAvatar from "./TeacherAvatar";
import {
  TEACHER_CLASSES,
  TEACHER_DEPARTMENTS,
  TEACHER_EMPLOYMENT_TYPES,
  TEACHER_GENDERS,
  TEACHER_QUALIFICATIONS,
  TEACHER_STATUSES,
  TEACHER_SUBJECTS,
  TeacherValidationError,
  generateTeacherId,
} from "../../../services/teacherService";

const MAX_IMAGE_SIZE = 1024 * 1024;

function getTodayInputValue() {
  const now = new Date();
  const local = new Date(
    now.getTime() - now.getTimezoneOffset() * 60000
  );

  return local.toISOString().slice(0, 10);
}

function getInitialTeacherId(teacher) {
  if (teacher?.teacherId) {
    return teacher.teacherId;
  }

  try {
    return generateTeacherId();
  } catch {
    return "";
  }
}

function buildInitialForm(teacher) {
  return {
    teacherId: getInitialTeacherId(teacher),
    firstName: teacher?.firstName || "",
    middleName: teacher?.middleName || "",
    lastName: teacher?.lastName || "",
    gender: teacher?.gender || "",
    dateOfBirth: teacher?.dateOfBirth || "",
    email: teacher?.email || "",
    phone: teacher?.phone || "",
    alternatePhone: teacher?.alternatePhone || "",
    address: teacher?.address || "",
    qualification: teacher?.qualification || "",
    specialization: teacher?.specialization || "",
    experienceYears:
      teacher?.experienceYears === null ||
      teacher?.experienceYears === undefined
        ? ""
        : String(teacher.experienceYears),
    employmentType: teacher?.employmentType || "Full-Time",
    department: teacher?.department || "",
    assignedSubjects: Array.isArray(teacher?.assignedSubjects)
      ? teacher.assignedSubjects
      : [],
    assignedClasses: Array.isArray(teacher?.assignedClasses)
      ? teacher.assignedClasses
      : [],
    hireDate: teacher?.hireDate || getTodayInputValue(),
    salary:
      teacher?.salary === null || teacher?.salary === undefined
        ? ""
        : String(teacher.salary),
    status: teacher?.status || "Active",
    profileImage: teacher?.profileImage || "",
  };
}

function FieldError({ message }) {
  if (!message) {
    return null;
  }

  return <small className="admin-teachers-field-error">{message}</small>;
}

function FormSection({ icon: Icon, title, description, children }) {
  return (
    <section className="admin-teachers-form-section">
      <div className="admin-teachers-form-section-title">
        <span>
          <Icon size={17} />
        </span>
        <div>
          <h3>{title}</h3>
          <p>{description}</p>
        </div>
      </div>
      {children}
    </section>
  );
}

function TeacherFormModal({ teacher, onClose, onSave }) {
  const isEditing = Boolean(teacher);
  const [formData, setFormData] = useState(() =>
    buildInitialForm(teacher)
  );
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState("");
  const [photoUrl, setPhotoUrl] = useState(() => {
    const image = teacher?.profileImage || "";
    return /^https?:\/\//i.test(image) ? image : "";
  });
  const [photoFileName, setPhotoFileName] = useState("");

  const today = getTodayInputValue();
  const previewImage = formData.profileImage;

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  const clearFieldError = (field) => {
    setErrors((current) => {
      if (!current[field]) {
        return current;
      }

      const nextErrors = { ...current };
      delete nextErrors[field];
      return nextErrors;
    });
    setSubmitError("");
  };

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((current) => ({
      ...current,
      [name]: value,
    }));
    clearFieldError(name);
  };

  const handlePhotoUpload = (event) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      setErrors((current) => ({
        ...current,
        profileImage: "Please select an image file.",
      }));
      event.target.value = "";
      return;
    }

    if (file.size > MAX_IMAGE_SIZE) {
      setErrors((current) => ({
        ...current,
        profileImage: "Profile image must be 1 MB or smaller.",
      }));
      event.target.value = "";
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      setFormData((current) => ({
        ...current,
        profileImage: String(reader.result || ""),
      }));
      setPhotoUrl("");
      setPhotoFileName(file.name);
      clearFieldError("profileImage");
    };

    reader.readAsDataURL(file);
  };

  const handlePhotoUrlChange = (event) => {
    const value = event.target.value;

    setPhotoUrl(value);
    setPhotoFileName("");
    setFormData((current) => ({
      ...current,
      profileImage: value.trim(),
    }));
    clearFieldError("profileImage");
  };

  const handleRemovePhoto = () => {
    setFormData((current) => ({
      ...current,
      profileImage: "",
    }));
    setPhotoUrl("");
    setPhotoFileName("");
    clearFieldError("profileImage");
  };

  const toggleListValue = (field, value) => {
    setFormData((current) => {
      const list = current[field];
      const isSelected = list.includes(value);

      return {
        ...current,
        [field]: isSelected
          ? list.filter((item) => item !== value)
          : [...list, value],
      };
    });
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    setSubmitError("");

    const normalizedPhotoUrl = photoUrl.trim();

    if (
      normalizedPhotoUrl &&
      !/^https?:\/\//i.test(normalizedPhotoUrl)
    ) {
      setErrors((current) => ({
        ...current,
        profileImage:
          "Enter a valid image URL starting with http:// or https://.",
      }));
      return;
    }

    const payload = {
      ...formData,
      teacherId: formData.teacherId.trim(),
      profileImage: (
        normalizedPhotoUrl || formData.profileImage || ""
      ).trim(),
    };

    try {
      onSave(payload);
    } catch (error) {
      if (error instanceof TeacherValidationError) {
        setErrors(error.errors);
        setSubmitError(
          "Some fields need attention before this teacher can be saved."
        );
      } else {
        setSubmitError(
          error?.message || "Unable to save this teacher record."
        );
      }
    }
  };

  const inputClass = (field) =>
    `admin-teachers-input ${errors[field] ? "has-error" : ""}`;

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
        className="admin-teachers-modal admin-teachers-form-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="admin-teachers-form-title"
      >
        <div className="admin-teachers-modal-header">
          <div>
            <h2 id="admin-teachers-form-title">
              {isEditing ? "Edit Teacher" : "Add New Teacher"}
            </h2>
            <p>
              {isEditing
                ? "Update the teacher profile, qualifications, and employment information."
                : "Create a teaching staff profile. A login account is not created automatically."}
            </p>
          </div>

          <button
            type="button"
            className="admin-teachers-icon-btn"
            onClick={onClose}
            aria-label="Close teacher form"
          >
            <X size={20} />
          </button>
        </div>

        <form
          className="admin-teachers-form"
          onSubmit={handleSubmit}
          noValidate
        >
          <div className="admin-teachers-modal-body">
            {submitError && (
              <div className="admin-teachers-form-alert">
                <AlertCircle size={17} />
                <span>{submitError}</span>
              </div>
            )}

            <FormSection
              icon={UserRound}
              title="Personal Information"
              description="Teacher identity, demographics, and profile image."
            >
              <div className="admin-teachers-form-grid">
                <label className="admin-teachers-field">
                  <span>
                    First Name <b>*</b>
                  </span>
                  <input
                    className={inputClass("firstName")}
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    placeholder="e.g. Abebe"
                    autoComplete="given-name"
                  />
                  <FieldError message={errors.firstName} />
                </label>

                <label className="admin-teachers-field">
                  <span>Middle Name</span>
                  <input
                    className={inputClass("middleName")}
                    name="middleName"
                    value={formData.middleName}
                    onChange={handleChange}
                    placeholder="e.g. Tesfaye"
                    autoComplete="additional-name"
                  />
                  <FieldError message={errors.middleName} />
                </label>

                <label className="admin-teachers-field">
                  <span>
                    Last Name <b>*</b>
                  </span>
                  <input
                    className={inputClass("lastName")}
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    placeholder="e.g. Kebede"
                    autoComplete="family-name"
                  />
                  <FieldError message={errors.lastName} />
                </label>

                <label className="admin-teachers-field">
                  <span>
                    Gender <b>*</b>
                  </span>
                  <select
                    className={inputClass("gender")}
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                  >
                    <option value="">Select gender</option>
                    {TEACHER_GENDERS.map((gender) => (
                      <option key={gender} value={gender}>
                        {gender}
                      </option>
                    ))}
                  </select>
                  <FieldError message={errors.gender} />
                </label>

                <label className="admin-teachers-field">
                  <span>
                    Date of Birth <b>*</b>
                  </span>
                  <input
                    className={inputClass("dateOfBirth")}
                    type="date"
                    name="dateOfBirth"
                    max={today}
                    value={formData.dateOfBirth}
                    onChange={handleChange}
                  />
                  <FieldError message={errors.dateOfBirth} />
                </label>
              </div>

              <div className="admin-teachers-photo-row">
                <div className="admin-teachers-photo-preview">
                  {previewImage ? (
                    <TeacherAvatar
                      teacher={{
                        profileImage: previewImage,
                        firstName: formData.firstName,
                        lastName: formData.lastName,
                        fullName: [
                          formData.firstName,
                          formData.middleName,
                          formData.lastName,
                        ]
                          .filter(Boolean)
                          .join(" "),
                      }}
                      size="lg"
                    />
                  ) : (
                    <span className="admin-teachers-photo-placeholder">
                      <Camera size={23} />
                    </span>
                  )}

                  <div>
                    <strong>Profile Image</strong>
                    <small>
                      Optional. Upload an image up to 1 MB or paste a
                      public image URL.
                    </small>
                    {photoFileName && (
                      <small className="admin-teachers-photo-name">
                        {photoFileName}
                      </small>
                    )}
                  </div>
                </div>

                <div className="admin-teachers-photo-actions">
                  <label className="admin-teachers-upload-btn">
                    <Camera size={16} />
                    Upload Image
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoUpload}
                    />
                  </label>

                  <div className="admin-teachers-photo-url">
                    <Link2 size={16} />
                    <input
                      type="url"
                      value={photoUrl}
                      onChange={handlePhotoUrlChange}
                      placeholder="https://example.com/teacher.jpg"
                      aria-label="Profile image URL"
                    />
                  </div>

                  {previewImage && (
                    <button
                      type="button"
                      className="admin-teachers-photo-remove"
                      onClick={handleRemovePhoto}
                    >
                      <ImageOff size={15} />
                      Remove
                    </button>
                  )}
                </div>
              </div>

              <FieldError message={errors.profileImage} />
            </FormSection>

            <FormSection
              icon={Mail}
              title="Contact Information"
              description="How the school can reach this teacher."
            >
              <div className="admin-teachers-form-grid">
                <label className="admin-teachers-field">
                  <span>
                    Email Address <b>*</b>
                  </span>
                  <input
                    className={inputClass("email")}
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="teacher@school.com"
                    autoComplete="email"
                  />
                  <FieldError message={errors.email} />
                </label>

                <label className="admin-teachers-field">
                  <span>
                    Phone Number <b>*</b>
                  </span>
                  <input
                    className={inputClass("phone")}
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="e.g. 0912345678"
                    autoComplete="tel"
                  />
                  <FieldError message={errors.phone} />
                </label>

                <label className="admin-teachers-field">
                  <span>Alternate Phone</span>
                  <input
                    className={inputClass("alternatePhone")}
                    type="tel"
                    name="alternatePhone"
                    value={formData.alternatePhone}
                    onChange={handleChange}
                    placeholder="Optional secondary number"
                  />
                  <FieldError message={errors.alternatePhone} />
                </label>
              </div>

              <label className="admin-teachers-field admin-teachers-field-full">
                <span>Residential Address</span>
                <textarea
                  className={inputClass("address")}
                  name="address"
                  rows="2"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="Region, city, sub-city, and street details"
                />
                <FieldError message={errors.address} />
              </label>
            </FormSection>

            <FormSection
              icon={BookOpen}
              title="Professional Information"
              description="Qualifications, teaching expertise, and assignments."
            >
              <div className="admin-teachers-form-grid">
                <label className="admin-teachers-field">
                  <span>
                    Qualification <b>*</b>
                  </span>
                  <select
                    className={inputClass("qualification")}
                    name="qualification"
                    value={formData.qualification}
                    onChange={handleChange}
                  >
                    <option value="">Select qualification</option>
                    {TEACHER_QUALIFICATIONS.map((qualification) => (
                      <option
                        key={qualification}
                        value={qualification}
                      >
                        {qualification}
                      </option>
                    ))}
                  </select>
                  <FieldError message={errors.qualification} />
                </label>

                <label className="admin-teachers-field">
                  <span>
                    Specialization <b>*</b>
                  </span>
                  <input
                    className={inputClass("specialization")}
                    name="specialization"
                    value={formData.specialization}
                    onChange={handleChange}
                    placeholder="e.g. Algebra & Geometry"
                  />
                  <FieldError message={errors.specialization} />
                </label>

                <label className="admin-teachers-field">
                  <span>
                    Years of Experience <b>*</b>
                  </span>
                  <input
                    className={inputClass("experienceYears")}
                    type="number"
                    name="experienceYears"
                    min="0"
                    step="1"
                    value={formData.experienceYears}
                    onChange={handleChange}
                    placeholder="e.g. 5"
                  />
                  <FieldError message={errors.experienceYears} />
                </label>

                <label className="admin-teachers-field">
                  <span>
                    Employment Type <b>*</b>
                  </span>
                  <select
                    className={inputClass("employmentType")}
                    name="employmentType"
                    value={formData.employmentType}
                    onChange={handleChange}
                  >
                    {TEACHER_EMPLOYMENT_TYPES.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                  <FieldError message={errors.employmentType} />
                </label>

                <label className="admin-teachers-field">
                  <span>
                    Department <b>*</b>
                  </span>
                  <select
                    className={inputClass("department")}
                    name="department"
                    value={formData.department}
                    onChange={handleChange}
                  >
                    <option value="">Select department</option>
                    {TEACHER_DEPARTMENTS.map((department) => (
                      <option key={department} value={department}>
                        {department}
                      </option>
                    ))}
                  </select>
                  <FieldError message={errors.department} />
                </label>
              </div>

              <div className="admin-teachers-field admin-teachers-field-full">
                <span id="teacher-subjects-label">
                  Assigned Subjects
                  <em className="admin-teachers-pill-count">
                    {formData.assignedSubjects.length} selected
                  </em>
                </span>
                <div
                  className="admin-teachers-pill-group"
                  role="group"
                  aria-labelledby="teacher-subjects-label"
                >
                  {TEACHER_SUBJECTS.map((subject) => {
                    const isSelected =
                      formData.assignedSubjects.includes(subject);

                    return (
                      <button
                        type="button"
                        key={subject}
                        className={`admin-teachers-pill ${
                          isSelected ? "is-selected" : ""
                        }`}
                        aria-pressed={isSelected}
                        onClick={() =>
                          toggleListValue(
                            "assignedSubjects",
                            subject
                          )
                        }
                      >
                        {isSelected && <Check size={13} />}
                        {subject}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="admin-teachers-field admin-teachers-field-full">
                <span id="teacher-classes-label">
                  Assigned Classes
                  <em className="admin-teachers-pill-count">
                    {formData.assignedClasses.length} selected
                  </em>
                </span>
                <div
                  className="admin-teachers-pill-group"
                  role="group"
                  aria-labelledby="teacher-classes-label"
                >
                  {TEACHER_CLASSES.map((className) => {
                    const isSelected =
                      formData.assignedClasses.includes(className);

                    return (
                      <button
                        type="button"
                        key={className}
                        className={`admin-teachers-pill ${
                          isSelected ? "is-selected" : ""
                        }`}
                        aria-pressed={isSelected}
                        onClick={() =>
                          toggleListValue(
                            "assignedClasses",
                            className
                          )
                        }
                      >
                        {isSelected && <Check size={13} />}
                        {className}
                      </button>
                    );
                  })}
                </div>
              </div>
            </FormSection>

            <FormSection
              icon={BriefcaseBusiness}
              title="Employment Information"
              description="Official staff number, hire date, salary, and status."
            >
              <div className="admin-teachers-form-grid">
                <label className="admin-teachers-field">
                  <span>Teacher ID</span>
                  <input
                    className="admin-teachers-input admin-teachers-readonly"
                    name="teacherId"
                    value={formData.teacherId}
                    readOnly
                    tabIndex={-1}
                  />
                  <small className="admin-teachers-field-hint">
                    Generated automatically and preserved when editing.
                  </small>
                  <FieldError message={errors.teacherId} />
                </label>

                <label className="admin-teachers-field">
                  <span>
                    Hire Date <b>*</b>
                  </span>
                  <input
                    className={inputClass("hireDate")}
                    type="date"
                    name="hireDate"
                    value={formData.hireDate}
                    onChange={handleChange}
                  />
                  <FieldError message={errors.hireDate} />
                </label>

                <label className="admin-teachers-field">
                  <span>
                    Monthly Salary (ETB) <b>*</b>
                  </span>
                  <input
                    className={inputClass("salary")}
                    type="number"
                    name="salary"
                    min="0"
                    step="1"
                    value={formData.salary}
                    onChange={handleChange}
                    placeholder="e.g. 25000"
                  />
                  <FieldError message={errors.salary} />
                </label>

                <label className="admin-teachers-field">
                  <span>
                    Employment Status <b>*</b>
                  </span>
                  <select
                    className={inputClass("status")}
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                  >
                    {TEACHER_STATUSES.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                  <FieldError message={errors.status} />
                </label>
              </div>

              <div className="admin-teachers-form-note">
                <Users size={16} />
                <span>
                  Teachers are teaching employees. Non-teaching
                  employees are managed separately in Staff Management,
                  and this profile does not create a system login
                  account.
                </span>
              </div>
            </FormSection>
          </div>

          <div className="admin-teachers-modal-footer">
            <button
              type="button"
              className="admin-teachers-btn admin-teachers-btn-secondary"
              onClick={onClose}
            >
              Cancel
            </button>

            <button
              type="submit"
              className="admin-teachers-btn admin-teachers-btn-primary"
            >
              <Save size={16} />
              {isEditing ? "Update Teacher" : "Save Teacher"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default TeacherFormModal;
