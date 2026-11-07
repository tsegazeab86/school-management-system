import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
    Archive, ArchiveRestore, Briefcase, Building2, CalendarDays, Check, ChevronDown, ChevronLeft,
    ChevronRight, ChevronsUpDown, ChevronUp, Clock, Download, Eye, EyeOff, LayoutGrid, List, Lock,
      Pencil, Phone, RefreshCw, Search, SlidersHorizontal, Trash2, UserCheck, UserPlus,
    Users, X,
} from "lucide-react";
import {
    ALL_JOB_TITLES, CURRENT_ACADEMIC_YEAR_LABEL, DEPARTMENTS, DEPARTMENT_COLORS, DEPARTMENT_JOBS,
    EMPLOYMENT_TYPES, QUALIFICATIONS, RELATIONSHIPS, SHIFTS, STAFF_STATUSES, WORK_LOCATIONS,
} from "../../data/staffSampleData";
import {
    StaffValidationError, addStaff, archiveStaff, bulkArchive, bulkChangeStatus, calculateAge,
    changeStaffStatus, deleteStaff, exportStaffToCSV, generateStaffId, getDepartmentDistribution,
    getStaff, getStaffStatistics, normalizeStaffInput, resetCorruptedStorage, restoreSampleStaff,
    restoreStaff, updateStaff, validateStaff,
} from "../../services/staffService";
import "../../styles/admin/ManageStaff.css";

/* ------------------------------ helpers ------------------------------ */
const fullName = (s) => [s.firstName, s.middleName, s.lastName].filter(Boolean).join(" ");
const initialsOf = (s) => `${s.firstName?.[0] ?? ""}${s.lastName?.[0] ?? ""}`.toUpperCase();
const fmtDate = (d) => (d ? new Date(`${d}T00:00:00`).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "-");
const fmtDateTime = (iso) => (iso ? new Date(iso).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "-");
const todayStr = () => new Date().toISOString().slice(0, 10);
const statusKey = (s) => (s.archived ? "Archived" : s.status);
const deptColor = (d) => DEPARTMENT_COLORS[d] ?? "#475569";
const slug = (t) => t.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
const money = (n) => (n === "" || n === null || n === undefined ? "-" : `ETB ${Number(n).toLocaleString("en-US")}`);
const tenure = (joined) => {
    if (!joined) return "-";
    const months = Math.max(0, Math.floor((Date.now() - new Date(`${joined}T00:00:00`).getTime()) / (30.44 * 864e5)));
    const y = Math.floor(months / 12);
    const m = months % 12;
    if (y === 0) return `${m} ${m === 1 ? "month" : "months"}`;
    return m ? `${y} ${y === 1 ? "year" : "years"}, ${m} mo` : `${y} ${y === 1 ? "year" : "years"}`;
};

const STATUS_CLASS = { Active: "hr-status--active", "On Leave": "hr-status--leave", Inactive: "hr-status--inactive", Archived: "hr-status--archived" };

function DotsIcon() {
    return (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
            <circle cx="8" cy="3" r="1.4" /><circle cx="8" cy="8" r="1.4" /><circle cx="8" cy="13" r="1.4" />
        </svg>
    );
}
function WarnIcon({ size = 24 }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z" />
            <line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
        </svg>
    );
}

function StatusBadge({ employee }) {
    const key = statusKey(employee);
    return <span className={`hr-status ${STATUS_CLASS[key] ?? ""}`}><i aria-hidden="true" />{key}</span>;
}

function Avatar({ employee, size = "md" }) {
    const [failed, setFailed] = useState(false);
    useEffect(() => setFailed(false), [employee.photoUrl]);
    if (employee.photoUrl && !failed) return <img src={employee.photoUrl} alt="" className={`hr-avatar hr-avatar--${size}`} onError={() => setFailed(true)} />;
    return (
        <span className={`hr-avatar hr-avatar--${size}`} style={{ "--dept": deptColor(employee.department) }} aria-hidden="true">
            {initialsOf(employee)}
        </span>
    );
}

/* ------------------------------ overlays (modal + side panel) ------------------------------ */
function Overlay({ variant = "modal", size = "lg", title, titleId, onClose, children, footer }) {
    const ref = useRef(null);
    const closeRef = useRef(onClose);
    closeRef.current = onClose;

    useEffect(() => {
        const previous = document.activeElement;
        document.body.classList.add("modal-open");
        ref.current?.focus();
        const onKey = (e) => {
            if (e.key === "Escape") closeRef.current();
            if (e.key === "Tab" && ref.current) {
                const nodes = ref.current.querySelectorAll('a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])');
                if (!nodes.length) return;
                const first = nodes[0];
                const last = nodes[nodes.length - 1];
                if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
                else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
            }
        };
        document.addEventListener("keydown", onKey);
        return () => {
            document.removeEventListener("keydown", onKey);
            document.body.classList.remove("modal-open");
            previous?.focus?.();
        };
    }, []);

    if (variant === "panel") {
        return (
            <>
                <div className="hr-backdrop" onMouseDown={() => closeRef.current()} />
                <aside className="hr-panel" role="dialog" aria-modal="true" aria-labelledby={titleId} tabIndex={-1} ref={ref}>
                    <h2 id={titleId} className="visually-hidden">{title}</h2>
                    <button type="button" className="hr-panel__close" aria-label="Close profile" onClick={() => closeRef.current()}><X size={18} /></button>
                    <div className="hr-panel__body">{children}</div>
                    {footer && <div className="hr-panel__footer">{footer}</div>}
                </aside>
            </>
        );
    }
    return (
        <>
            <div className="modal-backdrop show hr-backdrop-modal" />
            <div className="modal d-block hr-modal" role="dialog" aria-modal="true" aria-labelledby={titleId} tabIndex={-1} ref={ref} onMouseDown={(e) => e.target === e.currentTarget && closeRef.current()}>
                <div className={`modal-dialog modal-${size} modal-dialog-centered modal-dialog-scrollable`}>
                    <div className="modal-content">
                        <div className="modal-header">
                            <h2 className="modal-title fs-5" id={titleId}>{title}</h2>
                            <button type="button" className="btn-close" aria-label="Close dialog" onClick={() => closeRef.current()} />
                        </div>
                        <div className="modal-body">{children}</div>
                        {footer && <div className="modal-footer">{footer}</div>}
                    </div>
                </div>
            </div>
        </>
    );
}

/* ------------------------------ dropdown menu (fixed position) ------------------------------ */
function ActionMenu({ trigger, triggerClassName, triggerLabel, items, disabled }) {
    const [open, setOpen] = useState(false);
    const [pos, setPos] = useState({});
    const btnRef = useRef(null);
    const menuRef = useRef(null);

    const toggle = () => {
        if (open) return setOpen(false);
        const r = btnRef.current.getBoundingClientRect();
        const estimated = Math.min(items.length * 38 + 16, window.innerHeight * 0.7);
        const style = { right: Math.max(8, window.innerWidth - r.right) };
        if (r.bottom + estimated > window.innerHeight && r.top > estimated) style.bottom = window.innerHeight - r.top + 6;
        else style.top = r.bottom + 6;
        setPos(style);
        setOpen(true);
    };

    useEffect(() => {
        if (!open) return undefined;
        menuRef.current?.querySelector("button:not([disabled])")?.focus();
        const close = (e) => { if (e?.target && menuRef.current?.contains(e.target)) return; setOpen(false); };
        const onDown = (e) => { if (!menuRef.current?.contains(e.target) && !btnRef.current?.contains(e.target)) setOpen(false); };
        const onKey = (e) => {
            if (e.key === "Escape") { setOpen(false); btnRef.current?.focus(); }
            if (e.key === "ArrowDown" || e.key === "ArrowUp") {
                e.preventDefault();
                const nodes = [...menuRef.current.querySelectorAll("button:not([disabled])")];
                const i = nodes.indexOf(document.activeElement);
                nodes[e.key === "ArrowDown" ? (i + 1) % nodes.length : (i - 1 + nodes.length) % nodes.length]?.focus();
            }
        };
        document.addEventListener("mousedown", onDown);
        document.addEventListener("keydown", onKey);
        window.addEventListener("scroll", close, true);
        window.addEventListener("resize", close);
        return () => {
            document.removeEventListener("mousedown", onDown);
            document.removeEventListener("keydown", onKey);
            window.removeEventListener("scroll", close, true);
            window.removeEventListener("resize", close);
        };
    }, [open]);

    return (
        <>
            <button ref={btnRef} type="button" className={triggerClassName} aria-label={triggerLabel} title={triggerLabel} aria-haspopup="menu" aria-expanded={open} disabled={disabled} onClick={toggle}>
                {trigger}
            </button>
            {open && (
                <div ref={menuRef} className="hr-menu" role="menu" style={pos}>
                    {items.map((item, i) => {
                        if (item.type === "divider") return <div key={`d${i}`} className="hr-menu__divider" role="separator" />;
                        if (item.type === "header") return <div key={`h${i}`} className="hr-menu__header">{item.label}</div>;
                        const Icon = item.icon;
                        return (
                            <button key={`${item.label}-${i}`} type="button" role="menuitem" disabled={item.disabled} className={`hr-menu__item${item.danger ? " hr-menu__item--danger" : ""}`} onClick={() => { setOpen(false); item.onClick(); }}>
                                <span className="hr-menu__icon">{item.checked ? <Check size={15} /> : Icon ? <Icon size={15} /> : null}</span>
                                {item.label}
                            </button>
                        );
                    })}
                </div>
            )}
        </>
    );
}

/* ------------------------------ dashboard widgets ------------------------------ */
function KpiCard({ icon: Icon, label, value, hint, tone }) {
    return (
        <div className={`hr-kpi hr-kpi--${tone}`}>
            <div className="hr-kpi__icon"><Icon size={20} aria-hidden="true" /></div>
            <div className="hr-kpi__body">
                <div className="hr-kpi__label">{label}</div>
                <div className="hr-kpi__value">{value}</div>
                <div className="hr-kpi__hint">{hint}</div>
            </div>
        </div>
    );
}

function DepartmentDistribution({ distribution, total, activeDepartment, onPick }) {
    const populated = distribution.filter((d) => d.count > 0);
    const empty = distribution.length - populated.length;
    const max = Math.max(1, ...populated.map((d) => d.count));
    return (
        <section className="hr-panel-card" aria-labelledby="dist-title">
            <div className="hr-panel-card__head">
                <div>
                    <h2 id="dist-title" className="hr-panel-card__title"><Building2 size={18} aria-hidden="true" /> Department Distribution</h2>
                    <p className="hr-panel-card__sub">Headcount by department. Select a bar to filter the directory.</p>
                </div>
                <span className="hr-chip">{total} employees</span>
            </div>
            {populated.length === 0 ? (
                <p className="text-muted small mb-0">No employees to display yet.</p>
            ) : (
                <ul className="hr-dist" role="list">
                    {populated.map((d) => (
                        <li key={d.department}>
                            <button type="button" className={`hr-dist__row${activeDepartment === d.department ? " is-active" : ""}`} style={{ "--dept": deptColor(d.department) }} onClick={() => onPick(activeDepartment === d.department ? "" : d.department)} aria-pressed={activeDepartment === d.department}>
                                <span className="hr-dist__name">{d.department}</span>
                                <span className="hr-dist__track"><span className="hr-dist__fill" style={{ width: `${(d.count / max) * 100}%` }} /></span>
                                <span className="hr-dist__count">{d.count}<small>{d.percent}%</small></span>
                            </button>
                        </li>
                    ))}
                </ul>
            )}
            {empty > 0 && populated.length > 0 && <p className="hr-panel-card__foot">{empty} {empty === 1 ? "department has" : "departments have"} no employees yet.</p>}
        </section>
    );
}

function SplitBar({ segments }) {
    const total = segments.reduce((a, s) => a + s.value, 0);
    return (
        <>
            <div className="hr-split" role="img" aria-label={segments.map((s) => `${s.label}: ${s.value}`).join(", ")}>
                {total > 0 ? segments.map((s) => <span key={s.label} className={`hr-split__seg hr-split__seg--${s.tone}`} style={{ width: `${(s.value / total) * 100}%` }} />) : <span className="hr-split__seg hr-split__seg--empty" style={{ width: "100%" }} />}
            </div>
            <ul className="hr-legend">
                {segments.map((s) => <li key={s.label}><i className={`hr-legend__dot hr-split__seg--${s.tone}`} />{s.label}<strong>{s.value}</strong></li>)}
            </ul>
        </>
    );
}

/* ------------------------------ employee card + list ------------------------------ */
function EmployeeCard({ employee: e, selected, onSelect, onView, onEdit, menuItems, busy }) {
    return (
        <article className={`hr-card${selected ? " is-selected" : ""}${e.archived ? " is-archived" : ""}`} style={{ "--dept": deptColor(e.department) }}>
            <div className="hr-card__band">
                <input type="checkbox" className="form-check-input hr-card__check" aria-label={`Select ${fullName(e)}`} checked={selected} onChange={() => onSelect(e.id)} />
                <ActionMenu triggerClassName="hr-iconbtn hr-iconbtn--light" triggerLabel={`More actions for ${fullName(e)}`} trigger={<DotsIcon />} items={menuItems} disabled={busy} />
            </div>
            <div className="hr-card__head">
                <Avatar employee={e} size="lg" />
                <h3 className="hr-card__name">{fullName(e)}</h3>
                <div className="hr-card__title">{e.jobTitle}</div>
                <span className="hr-card__id">{e.id}</span>
            </div>
            <div className="hr-card__dept"><i aria-hidden="true" />{e.department}</div>
            <dl className="hr-card__meta">
                <div><dt><Phone size={13} aria-hidden="true" /><span className="visually-hidden">Phone</span></dt><dd>{e.phone}</dd></div>
                <div><dt><CalendarDays size={13} aria-hidden="true" /><span className="visually-hidden">Joined</span></dt><dd>Joined {fmtDate(e.joiningDate)}</dd></div>
            </dl>
            <div className="hr-card__tags"><span className="hr-type">{e.employmentType}</span><StatusBadge employee={e} /></div>
            <div className="hr-card__actions">
                <button type="button" className="btn btn-sm hr-btn-outline" onClick={() => onView(e.id)}><Eye size={14} /> View Profile</button>
                <button type="button" className="hr-iconbtn" title="Edit employee" aria-label={`Edit ${fullName(e)}`} onClick={() => onEdit(e)}><Pencil size={15} /></button>
            </div>
        </article>
    );
}

/* ------------------------------ form ------------------------------ */
const FORM_SECTIONS = [
    { key: "personal", label: "Personal Details", letter: "A", fields: ["firstName", "middleName", "lastName", "gender", "dateOfBirth", "email", "phone", "address", "photoUrl"] },
    { key: "employment", label: "Employment Details", letter: "B", fields: ["id", "department", "jobTitle", "employmentType", "status", "joiningDate", "workLocation", "reportingManager", "shift"] },
    { key: "education", label: "Education & Skills", letter: "C", fields: ["qualification", "institution", "graduationYear", "certifications", "skills", "previousExperience"] },
    { key: "emergency", label: "Emergency Contact", letter: "D", fields: ["emergencyName", "emergencyRelationship", "emergencyPhone", "emergencyAddress"] },
    { key: "admin", label: "Administrative", letter: "E", fields: ["salary", "contractStart", "contractEnd", "notes"] },
];

const blankForm = (staff) => ({
    id: generateStaffId(staff),
    firstName: "", middleName: "", lastName: "", gender: "", dateOfBirth: "", email: "", phone: "", address: "", photoUrl: "",
    department: "", jobTitle: "", employmentType: "Full-time", status: "Active", joiningDate: "", workLocation: "", reportingManager: "", shift: SHIFTS[0],
    qualification: "", institution: "", graduationYear: "", certifications: "", skills: "", previousExperience: "",
    emergencyName: "", emergencyRelationship: "", emergencyPhone: "", emergencyAddress: "",
    salary: "", contractStart: "", contractEnd: "", notes: "",
});

function Field({ id, label, error, required, hint, children, className = "col-md-6" }) {
    return (
        <div className={className}>
            <label htmlFor={id} className="form-label">{label}{required && <span className="text-danger" aria-hidden="true"> *</span>}</label>
            {children}
            {hint && !error && <div className="hr-hint">{hint}</div>}
            {error && <div className="hr-error" id={`${id}-err`} role="alert">{error}</div>}
        </div>
    );
}

function EmployeeForm({ employee, staff, onSubmit, saving, formError }) {
    const isEdit = Boolean(employee);
    const [form, setForm] = useState(() => (employee ? { ...blankForm(staff), ...employee } : blankForm(staff)));
    const [errors, setErrors] = useState({});
    const [section, setSection] = useState("personal");

    const jobSuggestions = useMemo(() => (form.department ? DEPARTMENT_JOBS[form.department] ?? [] : ALL_JOB_TITLES), [form.department]);
    const managers = useMemo(() => staff.filter((s) => !s.archived && s.id !== employee?.id).map(fullName).sort(), [staff, employee]);

    const update = (key) => (ev) => {
        const value = ev.target.value;
        setForm((f) => ({ ...f, [key]: value }));
        if (errors[key]) setErrors((x) => ({ ...x, [key]: undefined }));
    };
    const attrs = (key) => ({
        id: `s-${key}`, value: form[key] ?? "", onChange: update(key),
        className: `form-control${errors[key] ? " is-invalid" : ""}`,
        "aria-invalid": Boolean(errors[key]), "aria-describedby": errors[key] ? `s-${key}-err` : undefined,
    });
    const sel = (key) => ({ ...attrs(key), className: `form-select${errors[key] ? " is-invalid" : ""}` });

    const errorCount = (sec) => sec.fields.filter((f) => errors[f]).length;
    const idx = FORM_SECTIONS.findIndex((s) => s.key === section);

    const showFirstError = (errs) => {
        const key = Object.keys(errs).find((k) => errs[k]);
        if (!key) return;
        const sec = FORM_SECTIONS.find((s) => s.fields.includes(key));
        if (sec) setSection(sec.key);
        setTimeout(() => document.getElementById(`s-${key}`)?.focus(), 60);
    };

    const submit = async (ev) => {
        ev.preventDefault();
        if (saving) return;
        const data = normalizeStaffInput(form);
        const found = validateStaff(data, staff, { currentId: employee?.id ?? null });
        setErrors(found);
        if (Object.keys(found).length) return showFirstError(found);
        const result = await onSubmit(data);
        if (result?.errors) { setErrors(result.errors); showFirstError(result.errors); }
    };

    return (
        <form id="staff-form" onSubmit={submit} noValidate className="hr-form">
            <nav className="hr-form__nav" aria-label="Form sections">
                {FORM_SECTIONS.map((sec) => (
                    <button key={sec.key} type="button" className={`hr-form__navitem${section === sec.key ? " is-active" : ""}`} aria-current={section === sec.key ? "step" : undefined} onClick={() => setSection(sec.key)}>
                        <span className="hr-form__letter">{sec.letter}</span>
                        <span className="hr-form__navlabel">{sec.label}</span>
                        {errorCount(sec) > 0 && <span className="hr-form__err-badge" aria-label={`${errorCount(sec)} errors`}>{errorCount(sec)}</span>}
                    </button>
                ))}
            </nav>

            <div className="hr-form__content">
                {formError && <div className="alert alert-danger py-2" role="alert">{formError}</div>}

                {section === "personal" && (
                    <div className="row g-3">
                        <Field id="s-firstName" label="First Name" required error={errors.firstName}><input autoComplete="given-name" {...attrs("firstName")} /></Field>
                        <Field id="s-middleName" label="Middle Name"><input {...attrs("middleName")} /></Field>
                        <Field id="s-lastName" label="Last Name" required error={errors.lastName}><input autoComplete="family-name" {...attrs("lastName")} /></Field>
                        <Field id="s-gender" label="Gender" required error={errors.gender}>
                            <select {...sel("gender")}><option value="">Select gender</option><option>Male</option><option>Female</option></select>
                        </Field>
                        <Field id="s-dateOfBirth" label="Date of Birth" required error={errors.dateOfBirth}><input type="date" min="1945-01-01" max={todayStr()} {...attrs("dateOfBirth")} /></Field>
                        <Field id="s-phone" label="Phone" required error={errors.phone}><input type="tel" placeholder="09XXXXXXXX" autoComplete="tel" {...attrs("phone")} /></Field>
                        <Field id="s-email" label="Email" error={errors.email}><input type="email" autoComplete="email" {...attrs("email")} /></Field>
                        <Field id="s-address" label="Address"><input {...attrs("address")} /></Field>
                        <Field id="s-photoUrl" label="Profile Image URL" error={errors.photoUrl} hint="Optional. Initials are shown when empty." className="col-12"><input type="url" placeholder="https://..." {...attrs("photoUrl")} /></Field>
                    </div>
                )}

                {section === "employment" && (
                    <div className="row g-3">
                        <Field id="s-id" label="Employee ID" required error={errors.id} hint={isEdit ? "The ID cannot be changed." : "Suggested automatically. You may edit it."}><input readOnly={isEdit} {...attrs("id")} /></Field>
                        <Field id="s-department" label="Department" required error={errors.department}>
                            <select {...sel("department")}><option value="">Select department</option>{DEPARTMENTS.map((d) => <option key={d}>{d}</option>)}</select>
                        </Field>
                        <Field id="s-jobTitle" label="Job Title" required error={errors.jobTitle} hint="Pick a suggestion or type another non-teaching title.">
                            <input list="hr-job-titles" autoComplete="off" {...attrs("jobTitle")} />
                            <datalist id="hr-job-titles">{jobSuggestions.map((j) => <option key={j} value={j} />)}</datalist>
                        </Field>
                        <Field id="s-employmentType" label="Employment Type" required error={errors.employmentType}><select {...sel("employmentType")}>{EMPLOYMENT_TYPES.map((x) => <option key={x}>{x}</option>)}</select></Field>
                        <Field id="s-status" label="Employment Status" required error={errors.status}><select {...sel("status")}>{STAFF_STATUSES.map((x) => <option key={x}>{x}</option>)}</select></Field>
                        <Field id="s-joiningDate" label="Joining Date" required error={errors.joiningDate}><input type="date" {...attrs("joiningDate")} /></Field>
                        <Field id="s-workLocation" label="Work Location" error={errors.workLocation}>
                            <input list="hr-locations" {...attrs("workLocation")} />
                            <datalist id="hr-locations">{WORK_LOCATIONS.map((l) => <option key={l} value={l} />)}</datalist>
                        </Field>
                        <Field id="s-reportingManager" label="Reporting Manager">
                            <input list="hr-managers" {...attrs("reportingManager")} />
                            <datalist id="hr-managers">{managers.map((m) => <option key={m} value={m} />)}</datalist>
                        </Field>
                        <Field id="s-shift" label="Shift / Working Schedule" className="col-12"><select {...sel("shift")}>{SHIFTS.map((x) => <option key={x}>{x}</option>)}</select></Field>
                    </div>
                )}

                {section === "education" && (
                    <div className="row g-3">
                        <Field id="s-qualification" label="Highest Qualification" required error={errors.qualification}>
                            <select {...sel("qualification")}><option value="">Select qualification</option>{QUALIFICATIONS.map((q) => <option key={q}>{q}</option>)}</select>
                        </Field>
                        <Field id="s-institution" label="Institution"><input {...attrs("institution")} /></Field>
                        <Field id="s-graduationYear" label="Graduation Year" error={errors.graduationYear}><input type="number" min="1960" max={new Date().getFullYear()} step="1" inputMode="numeric" {...attrs("graduationYear")} /></Field>
                        <Field id="s-certifications" label="Certifications" hint="Separate several with commas."><input {...attrs("certifications")} /></Field>
                        <Field id="s-skills" label="Skills" hint="Separate several with commas." className="col-12"><input {...attrs("skills")} /></Field>
                        <Field id="s-previousExperience" label="Previous Work Experience" className="col-12"><textarea rows={3} {...attrs("previousExperience")} /></Field>
                    </div>
                )}

                {section === "emergency" && (
                    <div className="row g-3">
                        <Field id="s-emergencyName" label="Contact Name"><input {...attrs("emergencyName")} /></Field>
                        <Field id="s-emergencyRelationship" label="Relationship"><select {...sel("emergencyRelationship")}><option value="">Select relationship</option>{RELATIONSHIPS.map((r) => <option key={r}>{r}</option>)}</select></Field>
                        <Field id="s-emergencyPhone" label="Phone Number" error={errors.emergencyPhone}><input type="tel" {...attrs("emergencyPhone")} /></Field>
                        <Field id="s-emergencyAddress" label="Address"><input {...attrs("emergencyAddress")} /></Field>
                    </div>
                )}

                {section === "admin" && (
                    <div className="row g-3">
                        <div className="col-12"><div className="hr-note"><Lock size={15} aria-hidden="true" /> Sensitive administrative information. Do not enter passwords or login credentials here.</div></div>
                        <Field id="s-salary" label="Monthly Salary (ETB)" error={errors.salary} hint="Optional. Hidden by default in the profile and excluded from CSV exports."><input type="number" min="0" step="0.01" inputMode="decimal" {...attrs("salary")} /></Field>
                        <div className="col-md-6 d-none d-md-block" />
                        <Field id="s-contractStart" label="Contract Start Date" error={errors.contractStart} hint={form.employmentType === "Contract" ? "Required for contract staff." : undefined}><input type="date" {...attrs("contractStart")} /></Field>
                        <Field id="s-contractEnd" label="Contract End Date" error={errors.contractEnd}><input type="date" {...attrs("contractEnd")} /></Field>
                        <Field id="s-notes" label="Internal Notes" className="col-12"><textarea rows={4} {...attrs("notes")} /></Field>
                    </div>
                )}

                <div className="hr-form__step-actions">
                    <button type="button" className="btn btn-sm btn-outline-secondary" disabled={idx === 0} onClick={() => setSection(FORM_SECTIONS[idx - 1].key)}><ChevronLeft size={14} /> Previous</button>
                    <span className="small text-muted">Section {idx + 1} of {FORM_SECTIONS.length}</span>
                    <button type="button" className="btn btn-sm btn-outline-secondary" disabled={idx === FORM_SECTIONS.length - 1} onClick={() => setSection(FORM_SECTIONS[idx + 1].key)}>Next <ChevronRight size={14} /></button>
                </div>
            </div>
        </form>
    );
}

/* ------------------------------ profile panel ------------------------------ */
function Info({ label, value, wide }) {
    return (
        <div className={wide ? "col-12" : "col-sm-6"}>
            <div className="hr-info__label">{label}</div>
            <div className="hr-info__value">{value || "-"}</div>
        </div>
    );
}

function ProfilePanel({ employee: e, busy, onEdit, onStatus, onArchive, onRestore, onDelete }) {
    const [tab, setTab] = useState("overview");
    const [showSalary, setShowSalary] = useState(false);
    useEffect(() => setShowSalary(false), [e.id, tab]);
    const age = calculateAge(e.dateOfBirth);
    const tabs = [["overview", "Overview"], ["professional", "Professional"], ["admin", "Administrative"], ["history", "History"]];
    const history = [...(e.history ?? [])].reverse();

    return (
        <div className="hr-profile" style={{ "--dept": deptColor(e.department) }}>
            <div className="hr-profile__banner">
                <Avatar employee={e} size="xl" />
                <div className="hr-profile__id">
                    <h3 className="hr-profile__name">{fullName(e)}</h3>
                    <div className="hr-profile__role">{e.jobTitle} &middot; {e.department}</div>
                    <div className="hr-profile__chips">
                        <span className="hr-chip hr-chip--light">{e.id}</span>
                        <span className="hr-chip hr-chip--light">{e.employmentType}</span>
                        <StatusBadge employee={e} />
                    </div>
                </div>
            </div>

            <div className="hr-lifecycle" role="group" aria-label="Employment lifecycle">
                <span className="hr-lifecycle__label">Employment status</span>
                <div className="hr-lifecycle__steps">
                    {STAFF_STATUSES.map((s) => (
                        <button key={s} type="button" disabled={busy || e.archived || e.status === s} className={`hr-lifecycle__btn hr-lifecycle__btn--${s.replace(/\s/g, "").toLowerCase()}${!e.archived && e.status === s ? " is-current" : ""}`} onClick={() => onStatus(e, s)}>
                            {!e.archived && e.status === s && <Check size={13} aria-hidden="true" />}{s}
                        </button>
                    ))}
                </div>
                <div className="hr-lifecycle__more">
                    <button type="button" className="btn btn-sm btn-outline-primary" onClick={() => onEdit(e)}><Pencil size={14} /> Edit</button>
                    {e.archived
                        ? <button type="button" className="btn btn-sm btn-outline-secondary" disabled={busy} onClick={() => onRestore(e)}><ArchiveRestore size={14} /> Restore</button>
                        : <button type="button" className="btn btn-sm btn-outline-secondary" disabled={busy} onClick={() => onArchive(e)}><Archive size={14} /> Archive</button>}
                    <button type="button" className="btn btn-sm btn-outline-danger" disabled={busy} onClick={() => onDelete(e)}><Trash2 size={14} /> Delete</button>
                </div>
            </div>

            <ul className="hr-tabs nav" role="tablist" aria-label="Profile sections">
                {tabs.map(([k, l]) => <li key={k} role="presentation"><button type="button" role="tab" aria-selected={tab === k} className={`hr-tabs__btn${tab === k ? " is-active" : ""}`} onClick={() => setTab(k)}>{l}</button></li>)}
            </ul>

            <div className="hr-profile__content" role="tabpanel">
                {tab === "overview" && (
                    <>
                        <section className="hr-info-card"><h4><Users size={15} /> Personal Information</h4>
                            <div className="row g-3">
                                <Info label="Gender" value={e.gender} />
                                <Info label="Date of Birth" value={`${fmtDate(e.dateOfBirth)}${age !== null ? ` (${age} years)` : ""}`} />
                                <Info label="Email" value={e.email} /><Info label="Phone" value={e.phone} />
                                <Info label="Address" value={e.address} wide />
                                <Info label="Emergency Contact" value={e.emergencyName ? `${e.emergencyName}${e.emergencyRelationship ? ` (${e.emergencyRelationship})` : ""}` : ""} />
                                <Info label="Emergency Phone" value={e.emergencyPhone} />
                                {e.emergencyAddress && <Info label="Emergency Address" value={e.emergencyAddress} wide />}
                            </div>
                        </section>
                        <section className="hr-info-card"><h4><Briefcase size={15} /> Employment Information</h4>
                            <div className="row g-3">
                                <Info label="Employee ID" value={e.id} /><Info label="Department" value={e.department} />
                                <Info label="Job Title" value={e.jobTitle} /><Info label="Employment Type" value={e.employmentType} />
                                <Info label="Employment Status" value={statusKey(e)} /><Info label="Joining Date" value={`${fmtDate(e.joiningDate)} (${tenure(e.joiningDate)})`} />
                                <Info label="Work Location" value={e.workLocation} /><Info label="Reporting Manager" value={e.reportingManager} />
                                <Info label="Shift" value={e.shift} wide />
                            </div>
                        </section>
                    </>
                )}
                {tab === "professional" && (
                    <section className="hr-info-card"><h4><Briefcase size={15} /> Professional Information</h4>
                        <div className="row g-3">
                            <Info label="Highest Qualification" value={e.qualification} /><Info label="Institution" value={e.institution} />
                            <Info label="Graduation Year" value={e.graduationYear} /><Info label="Certifications" value={e.certifications} />
                            <Info label="Skills" value={e.skills} wide /><Info label="Previous Work Experience" value={e.previousExperience} wide />
                        </div>
                    </section>
                )}
                {tab === "admin" && (
                    <section className="hr-info-card hr-info-card--restricted">
                        <h4><Lock size={15} /> Restricted Administrative Information</h4>
                        <p className="small text-muted">Sensitive HR data. Only reveal it when you need it.</p>
                        <div className="row g-3">
                            <Info label="Contract Start" value={fmtDate(e.contractStart)} /><Info label="Contract End" value={fmtDate(e.contractEnd)} />
                            <div className="col-sm-6">
                                <div className="hr-info__label">Monthly Salary</div>
                                <div className="hr-info__value d-flex align-items-center gap-2">
                                    <span>{showSalary ? money(e.salary) : "ETB ••••••"}</span>
                                    <button type="button" className="btn btn-sm btn-outline-secondary" onClick={() => setShowSalary((v) => !v)} aria-pressed={showSalary}>
                                        {showSalary ? <><EyeOff size={14} /> Hide</> : <><Eye size={14} /> Reveal</>}
                                    </button>
                                </div>
                            </div>
                            <Info label="Internal Notes" value={e.notes} wide />
                        </div>
                    </section>
                )}
                {tab === "history" && (
                    <section className="hr-info-card"><h4><Clock size={15} /> Employment History</h4>
                        {history.length === 0 ? <p className="text-muted small mb-0">No history recorded yet.</p> : (
                            <ol className="hr-timeline">
                                {history.map((h, i) => <li key={`${h.at}-${i}`}><span className="hr-timeline__date">{fmtDateTime(h.at)}</span><span>{h.action}</span></li>)}
                            </ol>
                        )}
                    </section>
                )}
            </div>
        </div>
    );
}

/* ------------------------------ dialogs ------------------------------ */
function ConfirmDialog({ dialog, busy, onClose }) {
    const tone = dialog.tone ?? "primary";
    return (
        <Overlay size="md" title={dialog.title} titleId="confirm-title" onClose={onClose}
            footer={<>
                <button type="button" className="btn btn-outline-secondary" onClick={onClose} disabled={busy}>Cancel</button>
                <button type="button" className={`btn btn-${tone}`} onClick={dialog.onConfirm} disabled={busy}>{busy ? "Working..." : dialog.confirmLabel}</button>
            </>}>
            <div className="hr-confirm">
                <span className={`hr-confirm__icon hr-confirm__icon--${tone}`}><WarnIcon /></span>
                <p className="mb-0">{dialog.message}</p>
            </div>
        </Overlay>
    );
}

function DeleteDialog({ employee, busy, onClose, onDelete }) {
    const [confirmed, setConfirmed] = useState(false);
    return (
        <Overlay size="md" title="Delete Employee Record" titleId="delete-title" onClose={onClose}
            footer={<>
                <button type="button" className="btn btn-outline-secondary" onClick={onClose} disabled={busy}>Cancel</button>
                <button type="button" className="btn btn-danger" onClick={onDelete} disabled={busy || !confirmed}>Delete Permanently</button>
            </>}>
            <div className="hr-confirm">
                <span className="hr-confirm__icon hr-confirm__icon--danger"><WarnIcon /></span>
                <div>
                    <p className="mb-2">You are about to permanently delete <strong>{fullName(employee)}</strong> ({employee.id}), {employee.jobTitle}.</p>
                    <p className="small text-muted mb-3">This removes the employment history and may affect related payroll, scheduling and reporting data. <strong>Archiving</strong> keeps the record and is usually the better choice.</p>
                    <div className="form-check">
                        <input className="form-check-input" type="checkbox" id="confirm-delete" checked={confirmed} onChange={(ev) => setConfirmed(ev.target.checked)} />
                        <label className="form-check-label small" htmlFor="confirm-delete">I understand that deletion cannot be undone.</label>
                    </div>
                </div>
            </div>
        </Overlay>
    );
}

/* ------------------------------ main page ------------------------------ */
const PAGE_SIZES = [6, 12, 24, 48];
const NO_FILTERS = { search: "", department: "", jobTitle: "", employmentType: "", status: "", gender: "", joinedFrom: "", joinedTo: "" };
const FILTER_LABELS = { department: "Department", jobTitle: "Job title", employmentType: "Type", status: "Status", gender: "Gender", joinedFrom: "Joined from", joinedTo: "Joined to", search: "Search" };
const SORT_VALUES = {
    name: (s) => fullName(s).toLowerCase(), id: (s) => s.id, department: (s) => s.department.toLowerCase(),
    title: (s) => s.jobTitle.toLowerCase(), type: (s) => s.employmentType, joined: (s) => s.joiningDate, status: (s) => statusKey(s),
};
const SORT_OPTIONS = [
    ["name:asc", "Name (A-Z)"], ["name:desc", "Name (Z-A)"], ["joined:desc", "Newest hires"], ["joined:asc", "Longest serving"],
    ["department:asc", "Department"], ["title:asc", "Job title"],
];

export default function ManageStaff() {
    const [staff, setStaff] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadError, setLoadError] = useState(null);
    const [filters, setFilters] = useState(NO_FILTERS);
    const [filtersOpen, setFiltersOpen] = useState(true);
    const [view, setView] = useState("grid");
    const [sort, setSort] = useState({ key: "name", dir: "asc" });
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(12);
    const [selected, setSelected] = useState(() => new Set());
    const [modal, setModal] = useState(null);
    const [busy, setBusy] = useState(false);
    const [formError, setFormError] = useState("");
    const [toasts, setToasts] = useState([]);
    const toastId = useRef(0);
    const selectAllRef = useRef(null);

    const notify = useCallback((type, message) => {
        toastId.current += 1;
        const id = toastId.current;
        setToasts((list) => [...list.slice(-2), { id, type, message }]);
        setTimeout(() => setToasts((list) => list.filter((x) => x.id !== id)), 4500);
    }, []);

    const load = useCallback(async () => {
        setLoading(true);
        setLoadError(null);
        try { setStaff(await getStaff()); }
        catch (err) { setLoadError({ message: err.message || "Failed to load staff.", corrupted: Boolean(err.corrupted) }); }
        finally { setLoading(false); }
    }, []);
    useEffect(() => { load(); }, [load]);

    const run = useCallback(async (task, successMessage) => {
        if (busy) return false;
        setBusy(true);
        try {
            const result = await task();
            if (successMessage) notify("success", typeof successMessage === "function" ? successMessage(result) : successMessage);
            return true;
        } catch (err) {
            notify("danger", err.message || "Something went wrong.");
            return false;
        } finally { setBusy(false); }
    }, [busy, notify]);

    const stats = useMemo(() => getStaffStatistics(staff), [staff]);
    const distribution = useMemo(() => getDepartmentDistribution(staff), [staff]);
    const expiringContracts = useMemo(() => {
        const limit = new Date(Date.now() + 60 * 864e5).toISOString().slice(0, 10);
        return staff.filter((s) => !s.archived && s.employmentType === "Contract" && s.contractEnd && s.contractEnd >= todayStr() && s.contractEnd <= limit).length;
    }, [staff]);

    const jobOptions = useMemo(() => [...new Set([...ALL_JOB_TITLES, ...staff.map((s) => s.jobTitle).filter(Boolean)])].sort(), [staff]);
    const departmentOptions = useMemo(() => [...new Set([...DEPARTMENTS, ...staff.map((s) => s.department).filter(Boolean)])], [staff]);

    const filtered = useMemo(() => {
        const q = filters.search.trim().toLowerCase();
        const digits = q.replace(/\D/g, "");
        const list = staff.filter((s) => {
            if (filters.status === "Archived" ? !s.archived : s.archived) return false;
            if (filters.status && filters.status !== "Archived" && s.status !== filters.status) return false;
            if (filters.department && s.department !== filters.department) return false;
            if (filters.jobTitle && s.jobTitle !== filters.jobTitle) return false;
            if (filters.employmentType && s.employmentType !== filters.employmentType) return false;
            if (filters.gender && s.gender !== filters.gender) return false;
            if (filters.joinedFrom && s.joiningDate < filters.joinedFrom) return false;
            if (filters.joinedTo && s.joiningDate > filters.joinedTo) return false;
            if (q) {
                const textHit = [fullName(s), s.id, s.email].some((v) => (v ?? "").toLowerCase().includes(q));
                const phoneHit = digits.length >= 3 && (s.phone ?? "").replace(/\D/g, "").includes(digits);
                if (!textHit && !phoneHit) return false;
            }
            return true;
        });
        const getValue = SORT_VALUES[sort.key];
        const dir = sort.dir === "asc" ? 1 : -1;
        return [...list].sort((a, b) => { const x = getValue(a); const y = getValue(b); return x > y ? dir : x < y ? -dir : 0; });
    }, [staff, filters, sort]);

    const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));
    const currentPage = Math.min(page, pageCount);
    const rows = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);
    const activeFilters = Object.entries(filters).filter(([, v]) => v);
    const pageNumbers = useMemo(() => {
        const start = Math.max(1, Math.min(currentPage - 2, pageCount - 4));
        return Array.from({ length: Math.min(pageCount, start + 4) - start + 1 }, (_, i) => start + i);
    }, [currentPage, pageCount]);

    const setFilter = (key) => (ev) => { setFilters((f) => ({ ...f, [key]: ev.target.value })); setPage(1); };
    const setFilterValue = (key, value) => { setFilters((f) => ({ ...f, [key]: value })); setPage(1); };
    const clearFilters = () => { setFilters(NO_FILTERS); setPage(1); };
    const toggleSort = (key) => setSort((s) => (s.key === key ? { key, dir: s.dir === "asc" ? "desc" : "asc" } : { key, dir: "asc" }));
    const sortAria = (key) => (sort.key === key ? (sort.dir === "asc" ? "ascending" : "descending") : "none");
    const SortIcon = ({ k }) => (sort.key !== k ? <ChevronsUpDown size={14} aria-hidden="true" /> : sort.dir === "asc" ? <ChevronUp size={14} aria-hidden="true" /> : <ChevronDown size={14} aria-hidden="true" />);
    const filterChipText = (key, value) => (key === "joinedFrom" || key === "joinedTo" ? fmtDate(value) : value);

    /* selection */
    const pageIds = rows.map((s) => s.id);
    const allOnPage = pageIds.length > 0 && pageIds.every((id) => selected.has(id));
    const someOnPage = pageIds.some((id) => selected.has(id));
    useEffect(() => { if (selectAllRef.current) selectAllRef.current.indeterminate = someOnPage && !allOnPage; }, [someOnPage, allOnPage]);
    const toggleAll = () => setSelected((prev) => { const n = new Set(prev); pageIds.forEach((id) => (allOnPage ? n.delete(id) : n.add(id))); return n; });
    const toggleOne = useCallback((id) => setSelected((prev) => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; }), []);
    const selectedStaff = useMemo(() => staff.filter((s) => selected.has(s.id)), [staff, selected]);
    const selectedLive = selectedStaff.filter((s) => !s.archived);

    const closeModal = useCallback(() => { if (!busy) { setModal(null); setFormError(""); } }, [busy]);
    const replaceEmployee = (u) => setStaff((list) => list.map((s) => (s.id === u.id ? u : s)));
    const profileEmployee = modal?.type === "profile" ? staff.find((s) => s.id === modal.id) : null;

    /* actions */
    const handleSave = async (data) => {
        if (busy) return null;
        setBusy(true);
        setFormError("");
        try {
            if (modal.employee) {
                const updated = await updateStaff(modal.employee.id, data);
                replaceEmployee(updated);
                notify("success", `${fullName(updated)}'s profile was updated.`);
                setModal(modal.from === "profile" ? { type: "profile", id: updated.id } : null);
            } else {
                const created = await addStaff(data);
                setStaff((list) => [created, ...list]);
                notify("success", `${fullName(created)} was added as ${created.id}.`);
                setModal(null);
            }
            return null;
        } catch (err) {
            if (err instanceof StaffValidationError) return { errors: err.errors };
            setFormError(err.message || "Could not save the employee.");
            return null;
        } finally { setBusy(false); }
    };

    const askStatusChange = (e, status) => setConfirm({
        title: `Change status to ${status}`,
        message: `${fullName(e)} will be marked as ${status}. ${status === "Inactive" ? "Inactive employees stay in the directory but are treated as not currently working." : status === "On Leave" ? "The employee remains part of the workforce while on leave." : "The employee will be counted as active."}`,
        confirmLabel: `Mark ${status}`, tone: status === "Inactive" ? "warning" : "primary",
        onConfirm: async () => { const ok = await run(async () => replaceEmployee(await changeStaffStatus(e.id, status)), `${fullName(e)} is now ${status}.`); if (ok) setConfirm(null); },
    });
    const askArchive = (e) => setConfirm({
        title: "Archive employee", message: `${fullName(e)} will be hidden from the main directory. The record and employment history are kept, and you can restore it from the Archived filter.`,
        confirmLabel: "Archive", tone: "warning",
        onConfirm: async () => { const ok = await run(async () => replaceEmployee(await archiveStaff(e.id)), `${fullName(e)} was archived successfully.`); if (ok) { setConfirm(null); setModal(null); setSelected((p) => { const n = new Set(p); n.delete(e.id); return n; }); } },
    });
    const handleRestore = (e) => run(async () => replaceEmployee(await restoreStaff(e.id)), `${fullName(e)} was restored.`);
    const handleDelete = async (e) => {
        const ok = await run(async () => { await deleteStaff(e.id); setStaff((list) => list.filter((x) => x.id !== e.id)); }, `${fullName(e)} was permanently deleted.`);
        if (ok) { setModal(null); setSelected((p) => { const n = new Set(p); n.delete(e.id); return n; }); }
    };

    const [confirm, setConfirm] = useState(null);

    const askBulkStatus = (status) => {
        const ids = selectedLive.filter((s) => s.status !== status).map((s) => s.id);
        if (!ids.length) return notify("danger", `No selected employees need to change to ${status}.`);
        setConfirm({
            title: `${status === "Active" ? "Activate" : "Deactivate"} ${ids.length} employee(s)`, message: `${ids.length} selected employee(s) will be marked ${status}.`,
            confirmLabel: status === "Active" ? "Activate" : "Deactivate", tone: status === "Active" ? "primary" : "warning",
            onConfirm: async () => {
                const ok = await run(async () => { const n = await bulkChangeStatus(ids, status); const set = new Set(ids); setStaff((l) => l.map((s) => (set.has(s.id) ? { ...s, status } : s))); return n; }, (n) => `${n} employee(s) set to ${status}.`);
                if (ok) setConfirm(null);
            },
        });
    };
    const askBulkArchive = () => {
        const ids = selectedLive.map((s) => s.id);
        if (!ids.length) return notify("danger", "The selected employees are already archived.");
        setConfirm({
            title: `Archive ${ids.length} employee(s)`, message: "The selected employees will be hidden from the main directory. Records are kept and can be restored from the Archived filter.",
            confirmLabel: "Archive", tone: "warning",
            onConfirm: async () => {
                const ok = await run(async () => { const n = await bulkArchive(ids); const set = new Set(ids); setStaff((l) => l.map((s) => (set.has(s.id) ? { ...s, archived: true } : s))); return n; }, (n) => `${n} employee(s) archived successfully.`);
                if (ok) { setConfirm(null); setSelected(new Set()); }
            },
        });
    };

    /* export */
    const year = new Date().getFullYear();
    const doExport = (list, filename, label) => {
        try { const n = exportStaffToCSV(list, filename); notify("success", `Exported ${n} ${label} employee(s) to ${filename}.`); }
        catch (err) { notify("danger", err.message); }
    };
    const exportItems = [
        { type: "header", label: "Export workforce (CSV)" },
        { label: `All employees (${staff.length})`, icon: Download, disabled: staff.length === 0, onClick: () => doExport(staff, `school-workforce-report-${year}.csv`, "all") },
        { label: `Filtered results (${filtered.length})`, icon: Download, disabled: filtered.length === 0, onClick: () => doExport(filtered, `school-workforce-filtered-${year}.csv`, "filtered") },
        { label: `Selected (${selectedStaff.length})`, icon: Download, disabled: selectedStaff.length === 0, onClick: () => doExport(selectedStaff, `school-workforce-selected-${year}.csv`, "selected") },
        { type: "divider" },
        { type: "header", label: "By department" },
        ...distribution.filter((d) => d.count > 0).map((d) => ({ label: `${d.department} (${d.count})`, icon: Building2, onClick: () => doExport(staff.filter((s) => !s.archived && s.department === d.department), `school-workforce-${slug(d.department)}-${year}.csv`, d.department) })),
    ];

    const menuItemsFor = (e) => [
        { label: "View profile", icon: Eye, onClick: () => setModal({ type: "profile", id: e.id }) },
        { label: "Edit employee", icon: Pencil, onClick: () => { setFormError(""); setModal({ type: "form", employee: e }); } },
        { type: "divider" },
        { type: "header", label: "Change status" },
        ...STAFF_STATUSES.map((s) => ({ label: s, checked: !e.archived && e.status === s, disabled: e.archived || e.status === s, onClick: () => askStatusChange(e, s) })),
        { type: "divider" },
        e.archived ? { label: "Restore employee", icon: ArchiveRestore, onClick: () => handleRestore(e) } : { label: "Archive employee", icon: Archive, onClick: () => askArchive(e) },
        { label: "Delete permanently", icon: Trash2, danger: true, onClick: () => setModal({ type: "delete", employee: e }) },
    ];

    const recover = async (task, message) => {
        setBusy(true);
        try { setStaff(await task()); setLoadError(null); notify("success", message); }
        catch (err) { notify("danger", err.message); }
        finally { setBusy(false); }
    };

    const activePct = stats.total ? Math.round((stats.active / stats.total) * 100) : 0;
    const todayLabel = new Date().toLocaleDateString("en-GB", { weekday: "long", day: "2-digit", month: "long", year: "numeric" });
    const canUse = !loading && !loadError;

    return (
        <div className="hr-page">
            {/* ---------- hero ---------- */}
            <header className="hr-hero">
                <div className="hr-hero__main">
                    <nav aria-label="breadcrumb">
                        <ol className="breadcrumb hr-breadcrumb mb-2">
                            <li className="breadcrumb-item">Dashboard</li>
                            <li className="breadcrumb-item">User Management</li>
                            <li className="breadcrumb-item active" aria-current="page">Staff</li>
                        </ol>
                    </nav>
                    <h1 className="hr-hero__title">Human Resources</h1>
                    <p className="hr-hero__sub">Manage your school's workforce, departments, and employee records.</p>
                    <div className="hr-hero__meta">
                        <span><CalendarDays size={15} aria-hidden="true" /> {todayLabel}</span>
                        <span><Briefcase size={15} aria-hidden="true" /> Academic Year {CURRENT_ACADEMIC_YEAR_LABEL}</span>
                    </div>
                    <div className="hr-hero__actions">
                        <button type="button" className="btn hr-btn-accent" disabled={!canUse} onClick={() => { setFormError(""); setModal({ type: "form" }); }}><UserPlus size={17} /> Add New Employee</button>
                        <ActionMenu triggerClassName="btn hr-btn-ghost" triggerLabel="Export workforce" items={exportItems} disabled={!canUse} trigger={<><Download size={17} /> Export Workforce <ChevronDown size={14} /></>} />
                    </div>
                </div>
                <aside className="hr-hero__pulse" aria-label="Workforce pulse">
                    <div className="hr-ring" style={{ "--pct": activePct }} role="img" aria-label={`${activePct}% of employees are active`}>
                        <div className="hr-ring__inner"><strong>{activePct}%</strong><span>Active</span></div>
                    </div>
                    <ul className="hr-pulse">
                        <li><span>Workforce</span><strong>{stats.total}</strong></li>
                        <li><span>Men / Women</span><strong>{stats.male} / {stats.female}</strong></li>
                        <li>
                            <span>Contracts ending (60 days)</span>
                            {expiringContracts > 0
                                ? <button type="button" className="hr-pulse__alert" onClick={() => { setFilters({ ...NO_FILTERS, employmentType: "Contract" }); setPage(1); }}>{expiringContracts} review</button>
                                : <strong>0</strong>}
                        </li>
                    </ul>
                </aside>
            </header>

            {/* ---------- KPIs ---------- */}
            <section className="hr-kpis" aria-label="Workforce overview">
                <KpiCard icon={Users} tone="navy" label="Total Employees" value={stats.total} hint={`${stats.fullTime} full-time · ${stats.partTime} part-time · ${stats.contract} contract`} />
                <KpiCard icon={UserCheck} tone="teal" label="Active Employees" value={stats.active} hint={`${activePct}% of the workforce`} />
                <KpiCard icon={Clock} tone="amber" label="On Leave" value={stats.onLeave} hint={`${stats.inactive} inactive`} />
                <KpiCard icon={UserPlus} tone="sky" label="New Hires" value={stats.newHires} hint="Joined in the last 90 days" />
                <KpiCard icon={Building2} tone="violet" label="Non-Teaching Departments" value={stats.departmentsStaffed} hint={`of ${stats.departmentsTotal} departments staffed`} />
            </section>

            {/* ---------- analytics ---------- */}
            {canUse && (
                <div className="row g-3 hr-analytics">
                    <div className="col-xl-8">
                        <DepartmentDistribution distribution={distribution} total={stats.total} activeDepartment={filters.department} onPick={(d) => setFilterValue("department", d)} />
                    </div>
                    <div className="col-xl-4">
                        <section className="hr-panel-card h-100" aria-labelledby="mix-title">
                            <h2 id="mix-title" className="hr-panel-card__title"><Users size={18} aria-hidden="true" /> Workforce Mix</h2>
                            <p className="hr-panel-card__sub">Live from current employee records.</p>
                            <div className="hr-mix__label">Employment type</div>
                            <SplitBar segments={[{ label: "Full-time", value: stats.fullTime, tone: "navy" }, { label: "Part-time", value: stats.partTime, tone: "teal" }, { label: "Contract", value: stats.contract, tone: "amber" }]} />
                            <div className="hr-mix__label">Gender</div>
                            <SplitBar segments={[{ label: "Male", value: stats.male, tone: "navy" }, { label: "Female", value: stats.female, tone: "accent" }]} />
                            <div className="hr-mix__label">Status</div>
                            <SplitBar segments={[{ label: "Active", value: stats.active, tone: "teal" }, { label: "On Leave", value: stats.onLeave, tone: "amber" }, { label: "Inactive", value: stats.inactive, tone: "slate" }]} />
                        </section>
                    </div>
                </div>
            )}

            {/* ---------- directory ---------- */}
            <section className="hr-directory" aria-label="Employee directory">
                <div className="hr-directory__bar">
                    <h2 className="hr-directory__title">Employee Directory</h2>
                    <div className="hr-directory__tools">
                        <div className="hr-search">
                            <Search size={16} className="hr-search__icon" aria-hidden="true" />
                            <input type="search" className="form-control" placeholder="Search name, ID, email or phone" aria-label="Search employees" value={filters.search} onChange={setFilter("search")} />
                        </div>
                        <button type="button" className={`btn hr-btn-outline${filtersOpen ? " is-on" : ""}`} aria-expanded={filtersOpen} aria-controls="hr-filter-panel" onClick={() => setFiltersOpen((v) => !v)}>
                            <SlidersHorizontal size={16} /> Filters {activeFilters.filter(([k]) => k !== "search").length > 0 && <span className="hr-count">{activeFilters.filter(([k]) => k !== "search").length}</span>}
                        </button>
                        <div className="hr-toggle" role="group" aria-label="Directory view">
                            <button type="button" className={view === "grid" ? "is-active" : ""} aria-pressed={view === "grid"} onClick={() => setView("grid")} title="Grid view"><LayoutGrid size={16} /><span>Grid</span></button>
                            <button type="button" className={view === "list" ? "is-active" : ""} aria-pressed={view === "list"} onClick={() => setView("list")} title="List view"><List size={16} /><span>List</span></button>
                        </div>
                    </div>
                </div>

                {filtersOpen && (
                    <div className="hr-filters" id="hr-filter-panel">
                        <div>
                            <label className="hr-filters__label" htmlFor="f-department">Department</label>
                            <select id="f-department" className="form-select" value={filters.department} onChange={setFilter("department")}><option value="">All departments</option>{departmentOptions.map((d) => <option key={d}>{d}</option>)}</select>
                        </div>
                        <div>
                            <label className="hr-filters__label" htmlFor="f-job">Job title</label>
                            <select id="f-job" className="form-select" value={filters.jobTitle} onChange={setFilter("jobTitle")}><option value="">All job titles</option>{jobOptions.map((j) => <option key={j}>{j}</option>)}</select>
                        </div>
                        <div>
                            <label className="hr-filters__label" htmlFor="f-type">Employment type</label>
                            <select id="f-type" className="form-select" value={filters.employmentType} onChange={setFilter("employmentType")}><option value="">All types</option>{EMPLOYMENT_TYPES.map((t) => <option key={t}>{t}</option>)}</select>
                        </div>
                        <div>
                            <label className="hr-filters__label" htmlFor="f-status">Status</label>
                            <select id="f-status" className="form-select" value={filters.status} onChange={setFilter("status")}><option value="">All statuses</option>{STAFF_STATUSES.map((t) => <option key={t}>{t}</option>)}<option>Archived</option></select>
                        </div>
                        <div>
                            <label className="hr-filters__label" htmlFor="f-gender">Gender</label>
                            <select id="f-gender" className="form-select" value={filters.gender} onChange={setFilter("gender")}><option value="">All genders</option><option>Male</option><option>Female</option></select>
                        </div>
                        <div>
                            <label className="hr-filters__label" htmlFor="f-from">Joined from</label>
                            <input id="f-from" type="date" className="form-control" value={filters.joinedFrom} max={filters.joinedTo || undefined} onChange={setFilter("joinedFrom")} />
                        </div>
                        <div>
                            <label className="hr-filters__label" htmlFor="f-to">Joined to</label>
                            <input id="f-to" type="date" className="form-control" value={filters.joinedTo} min={filters.joinedFrom || undefined} onChange={setFilter("joinedTo")} />
                        </div>
                        <div className="hr-filters__clear">
                            <button type="button" className="btn hr-btn-outline w-100" disabled={activeFilters.length === 0} onClick={clearFilters}><X size={16} /> Clear all</button>
                        </div>
                    </div>
                )}

                <div className="hr-results">
                    <div className="hr-results__left">
                        {canUse && rows.length > 0 && (
                            <label className="hr-selectall"><input ref={selectAllRef} type="checkbox" className="form-check-input" checked={allOnPage} onChange={toggleAll} /> Select page</label>
                        )}
                        <span className="hr-results__count" aria-live="polite">{loading ? "Loading..." : loadError ? "Unable to load" : `${filtered.length} ${filtered.length === 1 ? "employee" : "employees"} found`}</span>
                        {activeFilters.map(([k, v]) => (
                            <button key={k} type="button" className="hr-pill" onClick={() => setFilterValue(k, "")} aria-label={`Remove ${FILTER_LABELS[k]} filter: ${filterChipText(k, v)}`}>
                                {FILTER_LABELS[k]}: {filterChipText(k, v)} <X size={12} />
                            </button>
                        ))}
                    </div>
                    {view === "grid" && canUse && (
                        <label className="hr-sortselect">Sort by
                            <select className="form-select form-select-sm" value={`${sort.key}:${sort.dir}`} onChange={(ev) => { const [key, dir] = ev.target.value.split(":"); setSort({ key, dir }); }}>
                                {SORT_OPTIONS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                                {!SORT_OPTIONS.some(([v]) => v === `${sort.key}:${sort.dir}`) && <option value={`${sort.key}:${sort.dir}`}>Custom sort</option>}
                            </select>
                        </label>
                    )}
                </div>

                {loading ? (
                    <div className="hr-state" role="status"><div className="spinner-border" aria-hidden="true" /><p>Loading workforce records...</p></div>
                ) : loadError ? (
                    <div className="hr-state">
                        <span className="hr-state__warn"><WarnIcon size={34} /></span>
                        <p className="fw-semibold">{loadError.message}</p>
                        <div className="d-flex flex-wrap gap-2 justify-content-center">
                            <button type="button" className="btn hr-btn-solid" onClick={load}><RefreshCw size={16} /> Try again</button>
                            {loadError.corrupted && <button type="button" className="btn btn-outline-danger" disabled={busy} onClick={() => recover(resetCorruptedStorage, "Sample data restored. The unreadable data was backed up in browser storage.")}>Back up and restore sample data</button>}
                        </div>
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="hr-state">
                        <Users size={40} aria-hidden="true" />
                        <p className="fw-semibold mb-0">{staff.length === 0 ? "No employees yet" : "No employees match your filters"}</p>
                        <p className="text-muted small">{staff.length === 0 ? "Add your first employee or load the demo records." : "Try a different search or clear the filters."}</p>
                        <div className="d-flex flex-wrap gap-2 justify-content-center">
                            {activeFilters.length > 0 && <button type="button" className="btn hr-btn-outline" onClick={clearFilters}>Clear all filters</button>}
                            {staff.length === 0 && <>
                                <button type="button" className="btn hr-btn-solid" onClick={() => setModal({ type: "form" })}><UserPlus size={16} /> Add New Employee</button>
                                <button type="button" className="btn hr-btn-outline" disabled={busy} onClick={() => recover(restoreSampleStaff, "Demo employees loaded.")}>Load demo employees</button>
                            </>}
                        </div>
                    </div>
                ) : view === "grid" ? (
                    <div className="hr-grid">
                        {rows.map((e) => (
                            <EmployeeCard key={e.id} employee={e} selected={selected.has(e.id)} onSelect={toggleOne} busy={busy}
                                onView={(id) => setModal({ type: "profile", id })} onEdit={(emp) => { setFormError(""); setModal({ type: "form", employee: emp }); }} menuItems={menuItemsFor(e)} />
                        ))}
                    </div>
                ) : (
                    <div className="table-responsive hr-listwrap">
                        <table className="table hr-table align-middle mb-0">
                            <thead>
                                <tr>
                                    <th className="hr-col-check"><input type="checkbox" className="form-check-input" aria-label="Select all employees on this page" checked={allOnPage} onChange={toggleAll} /></th>
                                    <th aria-sort={sortAria("name")}><button type="button" className="hr-sort" onClick={() => toggleSort("name")}>Employee <SortIcon k="name" /></button></th>
                                    <th aria-sort={sortAria("id")}><button type="button" className="hr-sort" onClick={() => toggleSort("id")}>ID <SortIcon k="id" /></button></th>
                                    <th aria-sort={sortAria("department")}><button type="button" className="hr-sort" onClick={() => toggleSort("department")}>Department <SortIcon k="department" /></button></th>
                                    <th aria-sort={sortAria("title")}><button type="button" className="hr-sort" onClick={() => toggleSort("title")}>Job Title <SortIcon k="title" /></button></th>
                                    <th aria-sort={sortAria("type")}><button type="button" className="hr-sort" onClick={() => toggleSort("type")}>Type <SortIcon k="type" /></button></th>
                                    <th>Phone</th>
                                    <th aria-sort={sortAria("joined")}><button type="button" className="hr-sort" onClick={() => toggleSort("joined")}>Joined <SortIcon k="joined" /></button></th>
                                    <th aria-sort={sortAria("status")}><button type="button" className="hr-sort" onClick={() => toggleSort("status")}>Status <SortIcon k="status" /></button></th>
                                    <th className="text-end">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {rows.map((e) => (
                                    <tr key={e.id} className={selected.has(e.id) ? "is-selected" : ""} style={{ "--dept": deptColor(e.department) }}>
                                        <td><input type="checkbox" className="form-check-input" aria-label={`Select ${fullName(e)}`} checked={selected.has(e.id)} onChange={() => toggleOne(e.id)} /></td>
                                        <td><div className="hr-person"><Avatar employee={e} /><div><div className="hr-person__name">{fullName(e)}</div><div className="hr-person__sub">{e.email || "No email"}</div></div></div></td>
                                        <td className="hr-mono">{e.id}</td>
                                        <td><span className="hr-deptlabel"><i aria-hidden="true" />{e.department}</span></td>
                                        <td>{e.jobTitle}</td>
                                        <td><span className="hr-type">{e.employmentType}</span></td>
                                        <td className="text-nowrap">{e.phone}</td>
                                        <td className="text-nowrap">{fmtDate(e.joiningDate)}</td>
                                        <td><StatusBadge employee={e} /></td>
                                        <td>
                                            <div className="hr-actions">
                                                <button type="button" className="hr-iconbtn" title="View profile" aria-label={`View profile of ${fullName(e)}`} onClick={() => setModal({ type: "profile", id: e.id })}><Eye size={16} /></button>
                                                <button type="button" className="hr-iconbtn" title="Edit employee" aria-label={`Edit ${fullName(e)}`} onClick={() => { setFormError(""); setModal({ type: "form", employee: e }); }}><Pencil size={16} /></button>
                                                <ActionMenu triggerClassName="hr-iconbtn" triggerLabel={`More actions for ${fullName(e)}`} trigger={<DotsIcon />} items={menuItemsFor(e)} disabled={busy} />
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {canUse && filtered.length > 0 && (
                    <div className="hr-pager">
                        <label className="d-flex align-items-center gap-2 small text-muted mb-0">Per page
                            <select className="form-select form-select-sm hr-pager__size" value={pageSize} onChange={(ev) => { setPageSize(Number(ev.target.value)); setPage(1); }}>{PAGE_SIZES.map((n) => <option key={n}>{n}</option>)}</select>
                        </label>
                        <span className="small text-muted">{(currentPage - 1) * pageSize + 1}-{Math.min(currentPage * pageSize, filtered.length)} of {filtered.length}</span>
                        <nav aria-label="Pagination">
                            <ul className="pagination pagination-sm mb-0">
                                <li className={`page-item${currentPage === 1 ? " disabled" : ""}`}><button type="button" className="page-link" aria-label="Previous page" disabled={currentPage === 1} onClick={() => setPage(currentPage - 1)}><ChevronLeft size={14} /></button></li>
                                {pageNumbers.map((n) => <li key={n} className={`page-item${n === currentPage ? " active" : ""}`}><button type="button" className="page-link" aria-current={n === currentPage ? "page" : undefined} onClick={() => setPage(n)}>{n}</button></li>)}
                                <li className={`page-item${currentPage === pageCount ? " disabled" : ""}`}><button type="button" className="page-link" aria-label="Next page" disabled={currentPage === pageCount} onClick={() => setPage(currentPage + 1)}><ChevronRight size={14} /></button></li>
                            </ul>
                        </nav>
                    </div>
                )}
            </section>

            {/* ---------- floating bulk bar ---------- */}
            {selected.size > 0 && (
                <div className="hr-bulk" role="region" aria-label="Bulk actions">
                    <span className="hr-bulk__count"><strong>{selected.size}</strong> selected</span>
                    <button type="button" className="hr-bulk__btn" onClick={() => doExport(selectedStaff, `school-workforce-selected-${year}.csv`, "selected")}><Download size={15} /> Export</button>
                    <button type="button" className="hr-bulk__btn" disabled={busy} onClick={() => askBulkStatus("Active")}><UserCheck size={15} /> Activate</button>
                    <button type="button" className="hr-bulk__btn" disabled={busy} onClick={() => askBulkStatus("Inactive")}>Deactivate</button>
                    <button type="button" className="hr-bulk__btn" disabled={busy} onClick={askBulkArchive}><Archive size={15} /> Archive</button>
                    <button type="button" className="hr-bulk__btn hr-bulk__btn--clear" onClick={() => setSelected(new Set())}><X size={15} /> Clear</button>
                </div>
            )}

            {/* ---------- overlays ---------- */}
            {profileEmployee && (
                <Overlay variant="panel" title={`Employee profile: ${fullName(profileEmployee)}`} titleId="profile-title" onClose={closeModal}>
                    <ProfilePanel employee={profileEmployee} busy={busy}
                        onEdit={(emp) => { setFormError(""); setModal({ type: "form", employee: emp, from: "profile" }); }}
                        onStatus={askStatusChange} onArchive={askArchive} onRestore={handleRestore} onDelete={(emp) => setModal({ type: "delete", employee: emp })} />
                </Overlay>
            )}

            {modal?.type === "form" && (
                <Overlay size="xl" title={modal.employee ? "Edit Employee" : "Add New Employee"} titleId="form-title" onClose={closeModal}
                    footer={<>
                        <button type="button" className="btn btn-outline-secondary" onClick={closeModal} disabled={busy}>Cancel</button>
                        <button type="submit" form="staff-form" className="btn hr-btn-solid" disabled={busy}>{busy ? <><span className="spinner-border spinner-border-sm me-2" aria-hidden="true" />Saving...</> : modal.employee ? "Save Changes" : "Save Employee"}</button>
                    </>}>
                    <EmployeeForm employee={modal.employee} staff={staff} onSubmit={handleSave} saving={busy} formError={formError} />
                </Overlay>
            )}

            {modal?.type === "delete" && <DeleteDialog employee={modal.employee} busy={busy} onClose={closeModal} onDelete={() => handleDelete(modal.employee)} />}

            {confirm && <ConfirmDialog dialog={confirm} busy={busy} onClose={() => { if (!busy) setConfirm(null); }} />}

            <div className="hr-toasts" aria-live="polite">
                {toasts.map((t) => (
                    <div key={t.id} className={`hr-toast hr-toast--${t.type}`} role="status">
                        {t.type === "success" ? <Check size={18} /> : <WarnIcon size={18} />}
                        <span>{t.message}</span>
                        <button type="button" className="btn-close btn-close-white ms-2" aria-label="Dismiss notification" onClick={() => setToasts((list) => list.filter((x) => x.id !== t.id))} />
                    </div>
                ))}
            </div>
        </div>
    );
}