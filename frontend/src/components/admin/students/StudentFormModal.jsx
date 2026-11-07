import { useState } from "react";
import {
  X,
  UserRound,
  GraduationCap,
  Users,
  MapPin,
  Camera,
  Link2,
  Save,
  AlertCircle,
  ImageOff,
} from "lucide-react";

import StudentAvatar from "./StudentAvatar";
import {
  STUDENT_GENDERS,
  STUDENT_GRADES,
  STUDENT_RELATIONSHIPS,
  STUDENT_SECTIONS,
  STUDENT_STATUSES,
  StudentValidationError,
  generateStudentNumber,
  getAcademicYearOptions,
  getDefaultAcademicYear,
} from "../../../services/studentService";

function getInitialStudentNumber(student) {
  if (student?.studentNumber) {
    return student.studentNumber;
  }

  try {
    return generateStudentNumber();
  } catch {
    return "";
  }
}

function buildInitialForm(student) {
  return {
    studentNumber: getInitialStudentNumber(student),
    firstName: student?.firstName || "",
    middleName: student?.middleName || "",
    lastName: student?.lastName || "",
    gender: student?.gender || "",
    dateOfBirth: student?.dateOfBirth || "",
    grade: student?.grade || "",
    section: student?.section || "",
    academicYear:
      student?.academicYear || getDefaultAcademicYear(),
    phone: student?.phone || "",
    email: student?.email || "",
    address: student?.address || "",
    parentName: student?.parent?.name || "",
    parentPhone: student?.parent?.phone || "",
    parentEmail: student?.parent?.email || "",
    parentRelationship: student?.parent?.relationship || "",
    parentAddress: student?.parent?.address || "",
    enrollmentStatus: student?.enrollmentStatus || "Active",
  };
}

function FieldError({ message }) {
  if (!message) {
    return null;
  }

  return <small className="admin-students-field-error">{message}</small>;
}

function StudentFormModal({ student, onClose, onSave }) {
  const isEditing = Boolean(student);
  const [formData, setFormData] = useState(() =>
    buildInitialForm(student)
  );
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState("");
  const [photo, setPhoto] = useState(student?.photo || "");
  const [photoUrl, setPhotoUrl] = useState(
    student?.photo && !student.photo.startsWith("data:")
      ? student.photo
      : ""
  );
  const [photoFileName, setPhotoFileName] = useState("");

  const academicYearOptions = getAcademicYearOptions(
    formData.academicYear
  );
  const previewPhoto = photo || photoUrl;

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((current) => ({
      ...current,
      [name]: value,
    }));

    setErrors((current) => {
      if (!current[name] && !current.photo) {
        return current;
      }

      const nextErrors = { ...current };
      delete nextErrors[name];
      delete nextErrors.photo;
      return nextErrors;
    });

    setSubmitError("");
  };

  const handlePhotoUpload = (event) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      setErrors((current) => ({
        ...current,
        photo: "Please select an image file.",
      }));
      event.target.value = "";
      return;
    }

    if (file.size > 1024 * 1024) {
      setErrors((current) => ({
        ...current,
        photo: "Profile photo must be 1 MB or smaller.",
      }));
      event.target.value = "";
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      setPhoto(String(reader.result || ""));
      setPhotoUrl("");
      setPhotoFileName(file.name);
      setErrors((current) => {
        const nextErrors = { ...current };
        delete nextErrors.photo;
        return nextErrors;
      });
    };

    reader.readAsDataURL(file);
  };

  const handlePhotoUrlChange = (event) => {
    const value = event.target.value;

    setPhotoUrl(value);
    setPhoto(value.trim());
    setPhotoFileName("");
    setErrors((current) => {
      if (!current.photo) {
        return current;
      }

      const nextErrors = { ...current };
      delete nextErrors.photo;
      return nextErrors;
    });
  };

  const handleRemovePhoto = () => {
    setPhoto("");
    setPhotoUrl("");
    setPhotoFileName("");

    setErrors((current) => {
      if (!current.photo) {
        return current;
      }

      const nextErrors = { ...current };
      delete nextErrors.photo;
      return nextErrors;
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
        photo: "Enter a valid photo URL starting with http:// or https://.",
      }));
      return;
    }

    const payload = {
      studentNumber: formData.studentNumber,
      firstName: formData.firstName,
      middleName: formData.middleName,
      lastName: formData.lastName,
      gender: formData.gender,
      dateOfBirth: formData.dateOfBirth,
      grade: formData.grade,
      section: formData.section,
      academicYear: formData.academicYear,
      phone: formData.phone,
      email: formData.email,
      address: formData.address,
      parent: {
        name: formData.parentName,
        phone: formData.parentPhone,
        email: formData.parentEmail,
        relationship: formData.parentRelationship,
        address: formData.parentAddress,
      },
      photo: normalizedPhotoUrl || photo,
      enrollmentStatus: formData.enrollmentStatus,
    };

    try {
      onSave(payload);
    } catch (error) {
      if (error instanceof StudentValidationError) {
        setErrors(error.errors);
        setSubmitError(
          "Some fields need attention before this record can be saved."
        );
      } else {
        setSubmitError(
          error?.message || "Unable to save this student record."
        );
      }
    }
  };

  const inputClass = (field) =>
    `admin-students-input ${errors[field] ? "has-error" : ""}`;

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
        className="admin-students-modal admin-students-form-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="admin-students-form-title"
      >
        <div className="admin-students-modal-header">
          <div>
            <h2 id="admin-students-form-title">
              {isEditing ? "Edit Student" : "Add New Student"}
            </h2>
            <p>
              {isEditing
                ? "Update the student profile and enrollment information."
                : "Create a student profile. No login account is created."}
            </p>
          </div>

          <button
            type="button"
            className="admin-students-icon-btn"
            onClick={onClose}
            aria-label="Close student form"
          >
            <X size={20} />
          </button>
        </div>

        <form
          className="admin-students-form"
          onSubmit={handleSubmit}
          noValidate
        >
          <div className="admin-students-modal-body">
            {submitError && (
              <div className="admin-students-form-alert">
                <AlertCircle size={17} />
                <span>{submitError}</span>
              </div>
            )}

            <section className="admin-students-form-section">
              <div className="admin-students-form-section-title">
                <span>
                  <UserRound size={17} />
                </span>
                <div>
                  <h3>Personal Information</h3>
                  <p>Student identity and profile photo.</p>
                </div>
              </div>

              <div className="admin-students-form-grid">
                <label className="admin-students-field">
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

                <label className="admin-students-field">
                  <span>
                    Middle Name
                  </span>
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

                <label className="admin-students-field">
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

                <label className="admin-students-field">
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
                    {STUDENT_GENDERS.map((gender) => (
                      <option key={gender} value={gender}>
                        {gender}
                      </option>
                    ))}
                  </select>
                  <FieldError message={errors.gender} />
                </label>

                <label className="admin-students-field">
                  <span>
                    Date of Birth <b>*</b>
                  </span>
                  <input
                    className={inputClass("dateOfBirth")}
                    type="date"
                    name="dateOfBirth"
                    value={formData.dateOfBirth}
                    onChange={handleChange}
                  />
                  <FieldError message={errors.dateOfBirth} />
                </label>

                <label className="admin-students-field">
                  <span>
                    Student Number <b>*</b>
                  </span>
                  <input
                    className={inputClass("studentNumber")}
                    name="studentNumber"
                    value={formData.studentNumber}
                    onChange={handleChange}
                    placeholder="e.g. STU-2026-0001"
                  />
                  <FieldError message={errors.studentNumber} />
                </label>
              </div>

              <div className="admin-students-photo-row">
                <div className="admin-students-photo-preview">
                  {previewPhoto ? (
                    <StudentAvatar
                      student={{
                        photo: previewPhoto,
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
                    <span className="admin-students-photo-placeholder">
                      <Camera size={23} />
                    </span>
                  )}

                  <div>
                    <strong>Profile Photo</strong>
                    <small>
                      Optional. Upload an image up to 1 MB or paste a URL.
                    </small>
                    {photoFileName && (
                      <small className="admin-students-photo-name">
                        {photoFileName}
                      </small>
                    )}
                  </div>
                </div>

                <div className="admin-students-photo-actions">
                  <label className="admin-students-upload-btn">
                    <Camera size={16} />
                    Upload Photo
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoUpload}
                    />
                  </label>

                  <div className="admin-students-photo-url">
                    <Link2 size={16} />
                    <input
                      type="url"
                      value={photoUrl}
                      onChange={handlePhotoUrlChange}
                      placeholder="https://example.com/photo.jpg"
                    />
                  </div>

                  {previewPhoto && (
                    <button
                      type="button"
                      className="admin-students-photo-remove"
                      onClick={handleRemovePhoto}
                    >
                      <ImageOff size={15} />
                      Remove
                    </button>
                  )}
                </div>
              </div>

              <FieldError message={errors.photo} />
            </section>

            <section className="admin-students-form-section">
              <div className="admin-students-form-section-title">
                <span>
                  <GraduationCap size={17} />
                </span>
                <div>
                  <h3>Academic & Enrollment</h3>
                  <p>Assign class placement and enrollment status.</p>
                </div>
              </div>

              <div className="admin-students-form-grid">
                <label className="admin-students-field">
                  <span>
                    Grade <b>*</b>
                  </span>
                  <select
                    className={inputClass("grade")}
                    name="grade"
                    value={formData.grade}
                    onChange={handleChange}
                  >
                    <option value="">Select grade</option>
                    {STUDENT_GRADES.map((grade) => (
                      <option key={grade} value={grade}>
                        {grade}
                      </option>
                    ))}
                  </select>
                  <FieldError message={errors.grade} />
                </label>

                <label className="admin-students-field">
                  <span>
                    Section <b>*</b>
                  </span>
                  <select
                    className={inputClass("section")}
                    name="section"
                    value={formData.section}
                    onChange={handleChange}
                  >
                    <option value="">Select section</option>
                    {STUDENT_SECTIONS.map((section) => (
                      <option key={section} value={section}>
                        Section {section}
                      </option>
                    ))}
                  </select>
                  <FieldError message={errors.section} />
                </label>

                <label className="admin-students-field">
                  <span>
                    Academic Year <b>*</b>
                  </span>
                  <select
                    className={inputClass("academicYear")}
                    name="academicYear"
                    value={formData.academicYear}
                    onChange={handleChange}
                  >
                    {academicYearOptions.map((academicYear) => (
                      <option key={academicYear} value={academicYear}>
                        {academicYear}
                      </option>
                    ))}
                  </select>
                  <FieldError message={errors.academicYear} />
                </label>

                <label className="admin-students-field">
                  <span>
                    Enrollment Status <b>*</b>
                  </span>
                  <select
                    className={inputClass("enrollmentStatus")}
                    name="enrollmentStatus"
                    value={formData.enrollmentStatus}
                    onChange={handleChange}
                  >
                    {STUDENT_STATUSES.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                  <FieldError message={errors.enrollmentStatus} />
                </label>

                <label className="admin-students-field">
                  <span>Phone Number</span>
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

                <label className="admin-students-field">
                  <span>Email Address</span>
                  <input
                    className={inputClass("email")}
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="student@example.com"
                    autoComplete="email"
                  />
                  <FieldError message={errors.email} />
                </label>
              </div>

              <label className="admin-students-field">
                <span>Residential Address</span>
                <textarea
                  className={inputClass("address")}
                  name="address"
                  rows="2"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="Region, city, kebele, and street details"
                />
                <FieldError message={errors.address} />
              </label>
            </section>

            <section className="admin-students-form-section">
              <div className="admin-students-form-section-title">
                <span>
                  <Users size={17} />
                </span>
                <div>
                  <h3>Parent / Guardian</h3>
                  <p>
                    Primary guardian contact. This is separate from any
                    login account.
                  </p>
                </div>
              </div>

              <div className="admin-students-form-grid">
                <label className="admin-students-field">
                  <span>
                    Full Name <b>*</b>
                  </span>
                  <input
                    className={inputClass("parentName")}
                    name="parentName"
                    value={formData.parentName}
                    onChange={handleChange}
                    placeholder="Parent or guardian name"
                  />
                  <FieldError message={errors.parentName} />
                </label>

                <label className="admin-students-field">
                  <span>
                    Phone Number <b>*</b>
                  </span>
                  <input
                    className={inputClass("parentPhone")}
                    type="tel"
                    name="parentPhone"
                    value={formData.parentPhone}
                    onChange={handleChange}
                    placeholder="e.g. 0912345678"
                  />
                  <FieldError message={errors.parentPhone} />
                </label>

                <label className="admin-students-field">
                  <span>Email Address</span>
                  <input
                    className={inputClass("parentEmail")}
                    type="email"
                    name="parentEmail"
                    value={formData.parentEmail}
                    onChange={handleChange}
                    placeholder="parent@example.com"
                  />
                  <FieldError message={errors.parentEmail} />
                </label>

                <label className="admin-students-field">
                  <span>Relationship</span>
                  <select
                    className={inputClass("parentRelationship")}
                    name="parentRelationship"
                    value={formData.parentRelationship}
                    onChange={handleChange}
                  >
                    <option value="">Select relationship</option>
                    {STUDENT_RELATIONSHIPS.map((relationship) => (
                      <option key={relationship} value={relationship}>
                        {relationship}
                      </option>
                    ))}
                  </select>
                  <FieldError message={errors.parentRelationship} />
                </label>
              </div>

              <label className="admin-students-field">
                <span>Parent / Guardian Address</span>
                <textarea
                  className={inputClass("parentAddress")}
                  name="parentAddress"
                  rows="2"
                  value={formData.parentAddress}
                  onChange={handleChange}
                  placeholder="Parent or guardian residential address"
                />
                <FieldError message={errors.parentAddress} />
              </label>
            </section>

            <div className="admin-students-form-note">
              <MapPin size={16} />
              <span>
                Student profiles are stored separately from system login
                accounts. A student can be registered here without a portal
                account.
              </span>
            </div>
          </div>

          <div className="admin-students-modal-footer">
            <button
              type="button"
              className="admin-students-btn admin-students-btn-secondary"
              onClick={onClose}
            >
              Cancel
            </button>

            <button
              type="submit"
              className="admin-students-btn admin-students-btn-primary"
            >
              <Save size={16} />
              {isEditing ? "Update Student" : "Save Student"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default StudentFormModal;
