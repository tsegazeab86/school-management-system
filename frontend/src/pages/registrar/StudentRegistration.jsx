
import { useState } from "react";
import {
    User,
    Users,
    GraduationCap,
    MapPin,
    Upload,
    Save,
    RotateCcw,
    UserPlus,
    Link as LinkIcon,
} from "lucide-react";

import { addOrUpdateParent } from "../../utils/registrar/parentStorage";
import "../../styles/registrar/StudentRegistration.css";

function StudentRegistration() {
    const initialForm = {
        firstName: "",
        middleName: "",
        lastName: "",
        gender: "",
        dateOfBirth: "",
        phone: "",
        email: "",

        parentName: "",
        parentPhone: "",
        parentEmail: "",
        relationship: "",
        parentPhotoUrl: "",
        parentAddress: "",

        grade: "",
        section: "",
        academicYear: "2026/2027",
        admissionDate: "",

        region: "",
        city: "",
        kebele: "",
        address: "",
    };

    const [formData, setFormData] = useState(initialForm);
    const [photo, setPhoto] = useState(null);

    const [parentPhoto, setParentPhoto] = useState("");
    const [parentPhotoFileName, setParentPhotoFileName] = useState("");

    const [errors, setErrors] = useState({});
    const [success, setSuccess] = useState("");

    // Handle normal input changes
    const handleChange = (e) => {
        const { name, value } = e.target;

        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));

        setErrors((prev) => ({
            ...prev,
            [name]: "",
        }));

        setSuccess("");
    };

    // Validate form
    const validateForm = () => {
        const newErrors = {};

        const requiredFields = [
            "firstName",
            "middleName",
            "lastName",
            "gender",
            "dateOfBirth",
            "parentName",
            "parentPhone",
            "relationship",
            "grade",
            "section",
            "admissionDate",
            "region",
            "city",
        ];

        requiredFields.forEach((field) => {
            if (!String(formData[field] || "").trim()) {
                newErrors[field] = "This field is required";
            }
        });

        if (
            formData.parentPhone &&
            !/^\+?[0-9]{9,15}$/.test(formData.parentPhone)
        ) {
            newErrors.parentPhone = "Enter a valid phone number";
        }

        if (
            formData.phone &&
            !/^\+?[0-9]{9,15}$/.test(formData.phone)
        ) {
            newErrors.phone = "Enter a valid phone number";
        }

        if (
            formData.email &&
            !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)
        ) {
            newErrors.email = "Enter a valid email address";
        }

        if (
            formData.parentEmail &&
            !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.parentEmail)
        ) {
            newErrors.parentEmail = "Enter a valid email address";
        }

        if (formData.parentPhotoUrl.trim()) {
            try {
                const url = new URL(formData.parentPhotoUrl);
                if (!["http:", "https:"].includes(url.protocol)) {
                    newErrors.parentPhotoUrl = "Enter a valid image URL";
                }
            } catch {
                newErrors.parentPhotoUrl = "Enter a valid image URL";
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Student photo upload
    const handlePhotoChange = (e) => {
        const file = e.target.files[0];

        if (!file) return;

        if (!file.type.startsWith("image/")) {
            alert("Please select an image file.");
            e.target.value = "";
            return;
        }

        setPhoto(file);
    };

    // Parent photo upload
    const handleParentPhotoChange = (e) => {
        const file = e.target.files[0];

        if (!file) return;

        if (!file.type.startsWith("image/")) {
            alert("Please select an image file.");
            e.target.value = "";
            return;
        }

        // Limit image size to 1 MB for localStorage demo
        if (file.size > 1024 * 1024) {
            alert("Parent photo must be 1 MB or smaller.");
            e.target.value = "";
            return;
        }

        const reader = new FileReader();

        reader.onload = () => {
            setParentPhoto(reader.result);
            setParentPhotoFileName(file.name);

            // Clear URL when uploading a photo
            setFormData((prev) => ({
                ...prev,
                parentPhotoUrl: "",
            }));

            setErrors((prev) => ({
                ...prev,
                parentPhotoUrl: "",
            }));
        };

        reader.readAsDataURL(file);
    };

    // Parent photo URL
    const handleParentPhotoUrlChange = (e) => {
        const value = e.target.value;

        setFormData((prev) => ({
            ...prev,
            parentPhotoUrl: value,
        }));

        setParentPhoto("");
        setParentPhotoFileName("");

        setErrors((prev) => ({
            ...prev,
            parentPhotoUrl: "",
        }));
    };

    // Submit registration
    const handleSubmit = (e) => {
        e.preventDefault();

        if (!validateForm()) {
            setSuccess("");
            return;
        }

        const finalParentPhoto =
            parentPhoto || formData.parentPhotoUrl.trim();

        const parentData = {
            name: formData.parentName.trim(),
            phone: formData.parentPhone.trim(),
            email: formData.parentEmail.trim(),
            relationship: formData.relationship,
            address: formData.parentAddress.trim(),
            photo: finalParentPhoto,
        };

        try {
            // Save parent information for ParentInformation page
            addOrUpdateParent(parentData);

            const studentData = {
                ...formData,
                photo,
                parent: parentData,
                registrationDate: new Date().toISOString(),
            };

            console.log("Registered Student:", studentData);

            setSuccess(
                "Student registered successfully! Parent information was also saved."
            );

            setErrors({});
        } catch (error) {
            console.error("Registration error:", error);
            setSuccess(
                "Unable to save parent information. Please try again."
            );
        }
    };

    // Reset form
    const handleReset = () => {
        setFormData(initialForm);
        setPhoto(null);
        setParentPhoto("");
        setParentPhotoFileName("");
        setErrors({});
        setSuccess("");
    };

    // Reusable input
    const renderInput = (
        label,
        name,
        type = "text",
        required = false
    ) => (
        <div className="registration-field">
            <label htmlFor={name}>
                {label}
                {required && <span className="required">*</span>}
            </label>

            <input
                id={name}
                type={type}
                name={name}
                value={formData[name]}
                onChange={handleChange}
                className={errors[name] ? "input-error" : ""}
            />

            {errors[name] && (
                <small className="field-error">
                    {errors[name]}
                </small>
            )}
        </div>
    );

    // Reusable select
    const renderSelect = (
        label,
        name,
        options,
        required = false
    ) => (
        <div className="registration-field">
            <label htmlFor={name}>
                {label}
                {required && <span className="required">*</span>}
            </label>

            <select
                id={name}
                name={name}
                value={formData[name]}
                onChange={handleChange}
                className={errors[name] ? "input-error" : ""}
            >
                <option value="">Select {label}</option>

                {options.map((option) => (
                    <option key={option} value={option}>
                        {option}
                    </option>
                ))}
            </select>

            {errors[name] && (
                <small className="field-error">
                    {errors[name]}
                </small>
            )}
        </div>
    );

    return (
        <div className="student-registration-page">

            {/* Page Heading */}
            <div className="registration-heading">
                <div>
                    <h2>Student Registration</h2>
                    <p>
                        Register a new student into the school system.
                    </p>
                </div>

                <div className="registration-heading-icon">
                    <UserPlus size={25} />
                </div>
            </div>

            {/* Success Message */}
            {success && (
                <div className="registration-success">
                    {success}
                </div>
            )}

            <form onSubmit={handleSubmit}>

                {/* Student Personal Information */}
                <section className="registration-card">
                    <div className="registration-section-title">
                        <User size={21} />

                        <div>
                            <h3>Student Personal Information</h3>
                            <p>
                                Enter the student's basic information.
                            </p>
                        </div>
                    </div>

                    <div className="registration-grid">
                        {renderInput(
                            "First Name",
                            "firstName",
                            "text",
                            true
                        )}

                        {renderInput(
                            "Middle Name",
                            "middleName",
                            "text",
                            true
                        )}

                        {renderInput(
                            "Last Name",
                            "lastName",
                            "text",
                            true
                        )}

                        {renderSelect(
                            "Gender",
                            "gender",
                            ["Male", "Female"],
                            true
                        )}

                        {renderInput(
                            "Date of Birth",
                            "dateOfBirth",
                            "date",
                            true
                        )}

                        {renderInput(
                            "Student Phone",
                            "phone",
                            "tel"
                        )}

                        {renderInput(
                            "Email Address",
                            "email",
                            "email"
                        )}
                    </div>

                    {/* Student Photo */}
                    <div className="registration-photo">
                        <label>Student Photo</label>

                        <div className="photo-upload-area">
                            <Upload size={25} />

                            <p>
                                {photo
                                    ? photo.name
                                    : "Upload student photo"}
                            </p>

                            <input
                                type="file"
                                accept="image/*"
                                onChange={handlePhotoChange}
                            />
                        </div>
                    </div>
                </section>

                {/* Parent / Guardian Information */}
                <section className="registration-card">
                    <div className="registration-section-title">
                        <Users size={21} />

                        <div>
                            <h3>Parent / Guardian Information</h3>
                            <p>
                                Enter parent contact details and upload
                                a photo or provide a photo URL.
                            </p>
                        </div>
                    </div>

                    <div className="registration-grid">
                        {renderInput(
                            "Parent / Guardian Name",
                            "parentName",
                            "text",
                            true
                        )}

                        {renderInput(
                            "Parent Phone",
                            "parentPhone",
                            "tel",
                            true
                        )}

                        {renderInput(
                            "Parent Email",
                            "parentEmail",
                            "email"
                        )}

                        {renderSelect(
                            "Relationship",
                            "relationship",
                            ["Father", "Mother", "Guardian", "Other"],
                            true
                        )}

                        {renderInput(
                            "Parent Address",
                            "parentAddress"
                        )}
                    </div>

                    {/* Parent Photo */}
                    <div className="parent-photo-section">
                        <h4>Parent / Guardian Photo</h4>

                        <div className="parent-photo-options">

                            {/* Upload Photo */}
                            <div className="parent-photo-upload">
                                <label htmlFor="parentPhoto">
                                    <Upload size={18} />
                                    Upload Parent Photo
                                </label>

                                <input
                                    id="parentPhoto"
                                    type="file"
                                    accept="image/*"
                                    onChange={handleParentPhotoChange}
                                />

                                {parentPhotoFileName && (
                                    <small>
                                        {parentPhotoFileName}
                                    </small>
                                )}
                            </div>

                            <div className="parent-photo-or">
                                OR
                            </div>

                            {/* Photo URL */}
                            <div className="registration-field">
                                <label htmlFor="parentPhotoUrl">
                                    <LinkIcon size={16} />
                                    Parent Photo URL
                                </label>

                                <input
                                    id="parentPhotoUrl"
                                    type="url"
                                    name="parentPhotoUrl"
                                    value={formData.parentPhotoUrl}
                                    onChange={handleParentPhotoUrlChange}
                                    placeholder="https://example.com/parent.jpg"
                                    className={
                                        errors.parentPhotoUrl
                                            ? "input-error"
                                            : ""
                                    }
                                />

                                {errors.parentPhotoUrl && (
                                    <small className="field-error">
                                        {errors.parentPhotoUrl}
                                    </small>
                                )}
                            </div>
                        </div>

                        {/* Photo Preview */}
                        {(parentPhoto || formData.parentPhotoUrl) && (
                            <div className="parent-photo-preview">
                                <img
                                    src={
                                        parentPhoto ||
                                        formData.parentPhotoUrl
                                    }
                                    alt="Parent preview"
                                    onError={(e) => {
                                        e.currentTarget.style.display =
                                            "none";
                                    }}
                                />

                                <span>Parent Photo Preview</span>
                            </div>
                        )}
                    </div>
                </section>

                {/* Academic Information */}
                <section className="registration-card">
                    <div className="registration-section-title">
                        <GraduationCap size={21} />

                        <div>
                            <h3>Academic Information</h3>
                            <p>
                                Assign the student to a grade and section.
                            </p>
                        </div>
                    </div>

                    <div className="registration-grid">
                        {renderSelect(
                            "Grade",
                            "grade",
                            Array.from(
                                { length: 12 },
                                (_, i) => `Grade ${i + 1}`
                            ),
                            true
                        )}

                        {renderSelect(
                            "Section",
                            "section",
                            ["A", "B", "C", "D"],
                            true
                        )}

                        {renderInput(
                            "Academic Year",
                            "academicYear"
                        )}

                        {renderInput(
                            "Admission Date",
                            "admissionDate",
                            "date",
                            true
                        )}
                    </div>
                </section>

                {/* Address Information */}
                <section className="registration-card">
                    <div className="registration-section-title">
                        <MapPin size={21} />

                        <div>
                            <h3>Address Information</h3>
                            <p>
                                Enter the student's residential address.
                            </p>
                        </div>
                    </div>

                    <div className="registration-grid">
                        {renderInput(
                            "Region",
                            "region",
                            "text",
                            true
                        )}

                        {renderInput(
                            "City / Town",
                            "city",
                            "text",
                            true
                        )}

                        {renderInput(
                            "Kebele",
                            "kebele"
                        )}

                        {renderInput(
                            "Full Address",
                            "address"
                        )}
                    </div>
                </section>

                {/* Form Actions */}
                <div className="registration-actions">
                    <button
                        type="button"
                        className="registration-reset-btn"
                        onClick={handleReset}
                    >
                        <RotateCcw size={17} />
                        Reset Form
                    </button>

                    <button
                        type="submit"
                        className="registration-save-btn"
                    >
                        <Save size={17} />
                        Register Student
                    </button>
                </div>

            </form>
        </div>
    );
}

export default StudentRegistration;
