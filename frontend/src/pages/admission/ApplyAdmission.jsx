
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
    ArrowLeft,
    ArrowRight,
    Award,
    BookOpen,
    CalendarDays,
    Check,
    CheckCircle2,
    ChevronRight,
    CloudUpload,
    FileCheck2,
    FileText,
    GraduationCap,
    HeartHandshake,
    Mail,
    MapPin,
    Phone,
    ShieldCheck,
    Sparkles,
    User,
    Users,
    X,
} from "lucide-react";
import "./Admission.css";

const STORAGE_KEY = "edumanage_admission_draft";

const initialForm = {
    firstName: "",
    middleName: "",
    lastName: "",
    gender: "",
    dateOfBirth: "",
    email: "",
    phone: "",
    address: "",
    nationality: "Ethiopian",
    guardianName: "",
    guardianRelationship: "",
    guardianPhone: "",
    guardianEmail: "",
    guardianAddress: "",
    grade: "",
    academicYear: "2026/2027",
    previousSchool: "",
    previousGrade: "",
    admissionType: "New Admission",
    documents: {},
};

const steps = [
    { title: "Student Details", subtitle: "Personal information", icon: User },
    { title: "Guardian", subtitle: "Parent information", icon: Users },
    { title: "Academics", subtitle: "School information", icon: GraduationCap },
    { title: "Documents", subtitle: "Review and submit", icon: FileCheck2 },
];

function InputField({
    label,
    name,
    value,
    onChange,
    type = "text",
    placeholder,
    required = true,
    icon: Icon,
    children,
    ...props
}) {
    return (
        <div className="adm-field">
            <label htmlFor={name}>
                {label} {required && <span>*</span>}
            </label>

            <div className={`adm-input-wrap ${Icon ? "has-icon" : ""}`}>
                {Icon && <Icon size={18} className="adm-input-icon" />}

                {children || (
                    <input
                        id={name}
                        name={name}
                        type={type}
                        value={value || ""}
                        onChange={onChange}
                        placeholder={placeholder || `Enter ${label.toLowerCase()}`}
                        required={required}
                        {...props}
                    />
                )}
            </div>
        </div>
    );
}

function SelectField({
    label,
    name,
    value,
    onChange,
    options,
    required = true,
}) {
    return (
        <div className="adm-field">
            <label htmlFor={name}>
                {label} {required && <span>*</span>}
            </label>

            <div className="adm-input-wrap">
                <select
                    id={name}
                    name={name}
                    value={value || ""}
                    onChange={onChange}
                    required={required}
                >
                    <option value="">Select {label.toLowerCase()}</option>
                    {options.map((option) => (
                        <option key={option.value} value={option.value}>
                            {option.label}
                        </option>
                    ))}
                </select>
            </div>
        </div>
    );
}

function SectionHeading({ eyebrow, title, description }) {
    return (
        <div className="adm-section-heading">
            <span className="adm-eyebrow">{eyebrow}</span>
            <h2>{title}</h2>
            <p>{description}</p>
        </div>
    );
}

export default function ApplyAdmission() {
    const [step, setStep] = useState(0);
    const [form, setForm] = useState(() => {
        try {
            const saved = localStorage.getItem(STORAGE_KEY);
            if (!saved) return initialForm;

            const parsed = JSON.parse(saved);
            return { ...initialForm, ...parsed, documents: {} };
        } catch {
            return initialForm;
        }
    });

    const [errors, setErrors] = useState({});
    const [previews, setPreviews] = useState({});
    const [applicationNumber, setApplicationNumber] = useState("");
    const [submitted, setSubmitted] = useState(false);
    const [setSaving] = useState(false);

    const updateField = (event) => {
        const { name, value } = event.target;

        setForm((previous) => ({
            ...previous,
            [name]: value,
        }));

        setErrors((previous) => ({
            ...previous,
            [name]: "",
        }));
    };

    const handleFile = (event, key) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const allowedTypes = [
            "image/jpeg",
            "image/png",
            "application/pdf",
        ];

        if (!allowedTypes.includes(file.type)) {
            setErrors((previous) => ({
                ...previous,
                [key]: "Only JPG, PNG and PDF files are allowed.",
            }));
            event.target.value = "";
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            setErrors((previous) => ({
                ...previous,
                [key]: "File size must be less than 5 MB.",
            }));
            event.target.value = "";
            return;
        }

        setForm((previous) => ({
            ...previous,
            documents: {
                ...previous.documents,
                [key]: file,
            },
        }));

        setPreviews((previous) => ({
            ...previous,
            [key]: {
                name: file.name,
                url: URL.createObjectURL(file),
                type: file.type,
            },
        }));

        setErrors((previous) => ({
            ...previous,
            [key]: "",
        }));
    };
    const validateStep = () => {
        const nextErrors = {};

        const requiredFields = [
            ...(step === 0
                ? [
                    "firstName",
                    "lastName",
                    "gender",
                    "dateOfBirth",
                    "email",
                    "phone",
                    "address",
                ]
                : []),

            ...(step === 1
                ? [
                    "guardianName",
                    "guardianRelationship",
                    "guardianPhone",
                    "guardianAddress",
                ]
                : []),

            ...(step === 2 ? ["grade", "academicYear"] : []),
        ];

        requiredFields.forEach((field) => {
            if (!String(form[field] || "").trim()) {
                nextErrors[field] = "This field is required.";
            }
        });

        // Email validation
        if (step === 0 && form.email &&
            !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
            nextErrors.email = "Enter a valid email address.";
        }

        // Student phone validation
        if (step === 0 && form.phone &&
            !/^[0-9+\-\s()]{7,20}$/.test(form.phone)) {
            nextErrors.phone = "Enter a valid phone number.";
        }

        // Guardian phone validation
        if (step === 1 && form.guardianPhone &&
            !/^[0-9+\-\s()]{7,20}$/.test(form.guardianPhone)) {
            nextErrors.guardianPhone = "Enter a valid phone number.";
        }

        // Date of birth validation
        if (step === 0 && form.dateOfBirth) {
            const dob = new Date(form.dateOfBirth);

            if (dob >= new Date()) {
                nextErrors.dateOfBirth =
                    "Date of birth must be in the past.";
            }
        }


        setErrors(nextErrors);

        return Object.keys(nextErrors).length === 0;
    };

    const saveDraft = () => {
        setSaving(true);

        try {
            const { ...textData } = form;

            localStorage.setItem(
                STORAGE_KEY,
                JSON.stringify({
                    ...textData,
                    savedAt: new Date().toISOString(),
                })
            );
        } catch {
            alert("Unable to save your draft in this browser.");
        }

        setTimeout(() => setSaving(false), 500);
    };

    const nextStep = () => {
        if (!validateStep()) return;

        saveDraft();
        setStep((previous) => Math.min(previous + 1, steps.length - 1));
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const previousStep = () => {
        setStep((previous) => Math.max(previous - 1, 0));
        setErrors({});
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const submitApplication = (event) => {
        event.preventDefault();

        if (!validateStep()) return;

        const number = `ADM-${new Date().getFullYear()}-${Math.random()
            .toString(36)
            .slice(2, 8)
            .toUpperCase()}`;

        const application = {
            ...form,
            documents: Object.entries(previews).map(([key, file]) => ({
                type: key,
                name: file.name,
            })),
            applicationNumber: number,
            submittedAt: new Date().toISOString(),
            status: "Submitted locally",
        };

        try {
            const existing = JSON.parse(
                localStorage.getItem("edumanage_applications") || "[]"
            );

            localStorage.setItem(
                "edumanage_applications",
                JSON.stringify([...existing, application])
            );

            localStorage.removeItem(STORAGE_KEY);

            setApplicationNumber(number);
            setSubmitted(true);
            window.scrollTo({ top: 0, behavior: "smooth" });
        } catch {
            alert("Unable to save the application. Browser storage may be full.");
        }
    };

    const renderField = (name, label, options = {}) => (
        <div>
            <InputField
                name={name}
                label={label}
                value={form[name]}
                onChange={updateField}
                {...options}
            />
            {errors[name] && (
                <small className="adm-error">{errors[name]}</small>
            )}
        </div>
    );

    const renderSelect = (name, label, options) => (
        <div>
            <SelectField
                name={name}
                label={label}
                value={form[name]}
                onChange={updateField}
                options={options}
            />
            {errors[name] && (
                <small className="adm-error">{errors[name]}</small>
            )}
        </div>
    );

    const uploadCard = (key, title, description, required = false) => (
        <div className="adm-upload-card" key={key}>
            <div className="adm-upload-top">
                <div className="adm-upload-icon">
                    <FileText size={22} />
                </div>
                <div>
                    <h4>{title}</h4>
                    <p>{description}</p>
                </div>
                {previews[key] && (
                    <CheckCircle2 className="adm-upload-check" size={21} />
                )}
            </div>

            <label className="adm-dropzone">
                <CloudUpload size={26} />
                <strong>
                    {previews[key] ? "Change file" : "Click to upload"}
                </strong>
                <span>PDF, JPG or PNG · Maximum 5 MB</span>
                <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={(event) => handleFile(event, key)}
                />
            </label>

            {previews[key] && (
                <div className="adm-file-selected">
                    <FileCheck2 size={17} />
                    <span>{previews[key].name}</span>
                    <button
                        type="button"
                        onClick={() => {
                            setForm((previous) => {
                                const documents = { ...previous.documents };
                                delete documents[key];
                                return { ...previous, documents };
                            });

                            URL.revokeObjectURL(previews[key].url);
                            setPreviews((previous) => {
                                const next = { ...previous };
                                delete next[key];
                                return next;
                            });
                        }}
                        aria-label={`Remove ${title}`}
                    >
                        <X size={17} />
                    </button>
                </div>
            )}

            {required && !previews[key] && (
                <small className="adm-upload-hint">Required document</small>
            )}

            {errors[key] && (
                <small className="adm-error">{errors[key]}</small>
            )}
        </div>
    );

    if (submitted) {
        return (
            <main className="adm-page">
                <div className="adm-success">
                    <motion.div
                        initial={{ scale: 0, rotate: -30 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ type: "spring", stiffness: 160 }}
                        className="adm-success-icon"
                    >
                        <Check size={48} />
                    </motion.div>

                    <span className="adm-eyebrow">APPLICATION COMPLETED</span>
                    <h1>Thank you for applying!</h1>
                    <p>
                        Your application has been saved in this browser.
                        Keep your application reference number for your records.
                    </p>

                    <div className="adm-reference">
                        <span>APPLICATION REFERENCE</span>
                        <strong>{applicationNumber}</strong>
                    </div>

                    <button
                        className="adm-primary-btn"
                        onClick={() => window.print()}
                    >
                        <FileText size={18} />
                        Print confirmation
                    </button>

                    <button
                        className="adm-text-btn"
                        onClick={() => window.location.href = "/"}
                    >
                        Return to homepage <ChevronRight size={17} />
                    </button>

                    <p className="adm-demo-note">
                        Frontend-only mode: this confirmation does not mean
                        the school has received your application.
                    </p>
                </div>
            </main>
        );
    }

    return (
        <main className="adm-page">
            {/* HERO */}
            <section className="adm-hero">
                <div className="adm-hero-glow adm-glow-one" />
                <div className="adm-hero-glow adm-glow-two" />

                <nav className="adm-navbar">
                    <a href="/" className="adm-brand">
                        <span className="adm-brand-icon">
                            <GraduationCap size={26} />
                        </span>
                        <span>
                            <strong>EduManage</strong>
                            <small>EDUCATION PORTAL</small>
                        </span>
                    </a>

                    <div className="adm-nav-links">
                        <a href="/">Home</a>
                        <a href="/login">Login</a>
                        <a href="#application" className="adm-nav-apply">
                            Apply Now <ArrowRight size={16} />
                        </a>
                    </div>
                </nav>

                <div className="adm-hero-content">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        className="adm-hero-text"
                    >
                        <div className="adm-hero-badge">
                            <Sparkles size={15} />
                            ADMISSIONS OPEN · 2026/2027
                        </div>

                        <h1>
                            Your Future
                            <br />
                            <span>Starts Here.</span>
                        </h1>

                        <p>
                            Take the first step toward an exceptional education.
                            Join a community where curiosity grows, talent develops,
                            and futures are shaped.
                        </p>

                        <div className="adm-hero-actions">
                            <a href="#application" className="adm-hero-button">
                                Start Application <ArrowRight size={18} />
                            </a>
                            <div className="adm-secure-label">
                                <ShieldCheck size={19} />
                                Simple & secure application
                            </div>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, x: 35 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        className="adm-hero-card"
                    >
                        <div className="adm-hero-card-icon">
                            <GraduationCap size={32} />
                        </div>
                        <span>NEW ADMISSIONS</span>
                        <h3>Build a brighter tomorrow.</h3>
                        <p>
                            Begin your learning journey with EduManage today.
                        </p>
                        <div className="adm-hero-card-footer">
                            <span><CheckCircle2 size={16} /> Easy application</span>
                            <span><CheckCircle2 size={16} /> Guided process</span>
                        </div>
                    </motion.div>
                </div>

                <div className="adm-hero-bottom">
                    <span>EXCELLENCE IN EDUCATION</span>
                    <span>LEARN · GROW · ACHIEVE</span>
                </div>
            </section>

            {/* INTRODUCTION */}
            <section className="adm-intro">
                <div>
                    <span className="adm-eyebrow">ADMISSION PROCESS</span>
                    <h2>Start your journey in four simple steps.</h2>
                    <p>
                        Complete your details, provide academic information,
                        attach your documents, and review your application.
                    </p>
                </div>

                <div className="adm-intro-features">
                    <div>
                        <BookOpen size={23} />
                        <strong>Quality Education</strong>
                        <span>A foundation for success</span>
                    </div>
                    <div>
                        <HeartHandshake size={23} />
                        <strong>Student Support</strong>
                        <span>Guidance at every step</span>
                    </div>
                    <div>
                        <Award size={23} />
                        <strong>Future Ready</strong>
                        <span>Learn with confidence</span>
                    </div>
                </div>
            </section>

            {/* APPLICATION */}
            <section className="adm-application" id="application">
                <div className="adm-application-heading">
                    <span className="adm-eyebrow">ONLINE ENROLLMENT</span>
                    <h2>Application Form</h2>
                    <p>Complete each section carefully. Fields marked with * are required.</p>
                </div>

                <div className="adm-form-shell">
                    <aside className="adm-step-sidebar">
                        <span className="adm-sidebar-label">YOUR APPLICATION</span>
                        <h3>Let's get you started.</h3>
                        <p>Follow the steps to complete your admission application.</p>

                        <div className="adm-step-list">
                            {steps.map((item, index) => {
                                const Icon = item.icon;
                                const active = step === index;
                                const complete = step > index;

                                return (
                                    <button
                                        type="button"
                                        key={item.title}
                                        className={`adm-step-item ${active ? "active" : ""} ${complete ? "complete" : ""}`}
                                        onClick={() => {
                                            if (index < step) {
                                                setStep(index);
                                                setErrors({});
                                            }
                                        }}
                                        disabled={index > step}
                                    >
                                        <span className="adm-step-icon">
                                            {complete ? <Check size={19} /> : <Icon size={19} />}
                                        </span>
                                        <span className="adm-step-label">
                                            <strong>{item.title}</strong>
                                            <small>{item.subtitle}</small>
                                        </span>
                                        {active && <ChevronRight size={18} />}
                                    </button>
                                );
                            })}
                        </div>

                        <div className="adm-help-card">
                            <div><ShieldCheck size={21} /></div>
                            <strong>Your information</strong>
                            <p>Your draft is stored locally in this browser.</p>
                        </div>
                    </aside>

                    <div className="adm-form-content">
                        <div className="adm-progress-top">
                            <span>STEP {step + 1} OF {steps.length}</span>
                            <strong>{Math.round(((step + 1) / steps.length) * 100)}% completed</strong>
                        </div>

                        <div className="adm-progress-track">
                            <motion.div
                                className="adm-progress-fill"
                                animate={{ width: `${((step + 1) / steps.length) * 100}%` }}
                            />
                        </div>

                        <form onSubmit={submitApplication}>
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={step}
                                    initial={{ opacity: 0, x: 18 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -18 }}
                                    transition={{ duration: 0.25 }}
                                >
                                    {step === 0 && (
                                        <>
                                            <SectionHeading
                                                eyebrow="STEP 01 — PERSONAL DETAILS"
                                                title="Tell us about yourself"
                                                description="Let's begin with your basic personal information."
                                            />

                                            <div className="adm-form-grid">
                                                {renderField("firstName", "First name")}
                                                {renderField("middleName", "Middle name", { required: false })}
                                                {renderField("lastName", "Last name")}
                                                {renderSelect("gender", "Gender", [
                                                    { value: "Male", label: "Male" },
                                                    { value: "Female", label: "Female" },
                                                    { value: "Other", label: "Other" },
                                                ])}
                                                {renderField("dateOfBirth", "Date of birth", { type: "date" })}
                                                {renderField("nationality", "Nationality", { required: false })}
                                                {renderField("email", "Email address", { type: "email", icon: Mail })}
                                                {renderField("phone", "Phone number", { type: "tel", icon: Phone })}
                                                <div className="adm-full-width">
                                                    {renderField("address", "Residential address", { icon: MapPin })}
                                                </div>
                                            </div>
                                        </>
                                    )}

                                    {step === 1 && (
                                        <>
                                            <SectionHeading
                                                eyebrow="STEP 02 — PARENT / GUARDIAN"
                                                title="Who should we contact?"
                                                description="Provide the details of a parent or responsible guardian."
                                            />

                                            <div className="adm-form-grid">
                                                {renderField("guardianName", "Guardian full name")}
                                                {renderSelect("guardianRelationship", "Relationship", [
                                                    { value: "Father", label: "Father" },
                                                    { value: "Mother", label: "Mother" },
                                                    { value: "Guardian", label: "Legal guardian" },
                                                    { value: "Other", label: "Other" },
                                                ])}
                                                {renderField("guardianPhone", "Guardian phone", { type: "tel", icon: Phone })}
                                                {renderField("guardianEmail", "Guardian email", { type: "email", required: false, icon: Mail })}
                                                <div className="adm-full-width">
                                                    {renderField("guardianAddress", "Guardian residential address")}
                                                </div>
                                            </div>
                                        </>
                                    )}

                                    {step === 2 && (
                                        <>
                                            <SectionHeading
                                                eyebrow="STEP 03 — ACADEMIC DETAILS"
                                                title="Your educational background"
                                                description="Tell us about the class you want to join."
                                            />

                                            <div className="adm-form-grid">
                                                {renderSelect("grade", "Applying for grade", [
                                                    ...Array.from({ length: 12 }, (_, i) => ({
                                                        value: `Grade ${i + 1}`,
                                                        label: `Grade ${i + 1}`,
                                                    })),
                                                ])}

                                                {renderSelect("academicYear", "Academic year", [
                                                    { value: "2026/2027", label: "2026/2027" },
                                                    { value: "2027/2028", label: "2027/2028" },
                                                ])}

                                                {renderField("previousSchool", "Previous school", { required: false })}

                                                {renderSelect("previousGrade", "Last completed grade", [
                                                    { value: "Grade 1", label: "Grade 1" },
                                                    ...Array.from({ length: 11 }, (_, i) => ({
                                                        value: `Grade ${i + 2}`,
                                                        label: `Grade ${i + 2}`,
                                                    })),
                                                    { value: "Not applicable", label: "Not applicable" },
                                                ])}

                                                {renderSelect("admissionType", "Admission type", [
                                                    { value: "New Admission", label: "New admission" },
                                                    { value: "Transfer", label: "Transfer student" },
                                                    { value: "Returning", label: "Returning student" },
                                                ])}
                                            </div>

                                            <div className="adm-info-banner">
                                                <CalendarDays size={21} />
                                                <div>
                                                    <strong>Academic year 2026/2027</strong>
                                                    <p>Check that you have selected the correct enrollment year.</p>
                                                </div>
                                            </div>
                                        </>
                                    )}

                                    {step === 3 && (
                                        <>
                                            <SectionHeading
                                                eyebrow="STEP 04 — DOCUMENTS & REVIEW"
                                                title="Almost there!"
                                                description="Attach your supporting documents and review your information."
                                            />

                                            <div className="adm-upload-grid">
                                                {uploadCard("reportCard", "Previous report card", "Latest academic report", false)}
                                                {uploadCard("studentPhoto", "Student photograph", "Recent passport-style photo", false)}
                                            </div>

                                            <div className="adm-review">
                                                <div className="adm-review-heading">
                                                    <div>
                                                        <span className="adm-eyebrow">FINAL CHECK</span>
                                                        <h3>Review your application</h3>
                                                    </div>
                                                    <button type="button" onClick={() => setStep(0)}>
                                                        Edit details
                                                    </button>
                                                </div>

                                                <div className="adm-review-grid">
                                                    <div>
                                                        <small>STUDENT NAME</small>
                                                        <strong>{[form.firstName, form.middleName, form.lastName].filter(Boolean).join(" ") || "—"}</strong>
                                                    </div>
                                                    <div>
                                                        <small>EMAIL</small>
                                                        <strong>{form.email || "—"}</strong>
                                                    </div>
                                                    <div>
                                                        <small>GUARDIAN</small>
                                                        <strong>{form.guardianName || "—"}</strong>
                                                    </div>
                                                    <div>
                                                        <small>PHONE</small>
                                                        <strong>{form.phone || "—"}</strong>
                                                    </div>
                                                    <div>
                                                        <small>APPLYING FOR</small>
                                                        <strong>{form.grade || "—"}</strong>
                                                    </div>
                                                    <div>
                                                        <small>ACADEMIC YEAR</small>
                                                        <strong>{form.academicYear || "—"}</strong>
                                                    </div>
                                                </div>
                                            </div>

                                            <label className="adm-consent">
                                                <input type="checkbox" required />
                                                <span>
                                                    I confirm that the information provided is accurate
                                                    and complete to the best of my knowledge.
                                                </span>
                                            </label>
                                        </>
                                    )}
                                </motion.div>
                            </AnimatePresence>

                            <div className="adm-form-footer">
                                <button
                                    type="button"
                                    className="adm-back-btn"
                                    onClick={previousStep}
                                    disabled={step === 0}
                                >
                                    <ArrowLeft size={18} /> Previous
                                </button>

                                {step < 3 ? (
                                    <button type="button" className="adm-primary-btn" onClick={nextStep}>
                                        Continue <ArrowRight size={18} />
                                    </button>
                                ) : (
                                    <button type="submit" className="adm-primary-btn">
                                        Submit application <CheckCircle2 size={18} />
                                    </button>
                                )}
                            </div>
                        </form>
                    </div>
                </div>
            </section>

            {/* FOOTER */}
            <footer className="adm-footer">
                <a href="/" className="adm-brand">
                    <span className="adm-brand-icon">
                        <GraduationCap size={24} />
                    </span>
                    <span>
                        <strong>EduManage</strong>
                        <small>EDUCATION PORTAL</small>
                    </span>
                </a>

                <p>Empowering students. Building tomorrow.</p>
                <span>© {new Date().getFullYear()} EduManage. All rights reserved.</span>
            </footer>
        </main>
    );
}
