 import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Archive, ArchiveRestore, CalendarDays, Camera, Check, ChevronDown, ChevronLeft, ChevronRight,
  ChevronsUpDown, ChevronUp, Clock, Download, Eye, GraduationCap, Mars, Pencil, RefreshCw, Search,
  Trash2, UserCheck, UserPlus, Users, Venus, X,
} from "lucide-react";
import {
  ALL_SUBJECTS, CURRENT_ACADEMIC_YEAR_LABEL, DEPARTMENTS, DEPARTMENT_SUBJECTS, EMPLOYMENT_TYPES,
  QUALIFICATIONS, TEACHER_STATUSES,
} from "../../data/teacherSampleData";
import {
  TeacherValidationError, addTeacher, archiveTeacher, bulkArchive, bulkChangeStatus, calculateAge,
  changeTeacherStatus, deleteTeacher, exportTeachersToCSV, generateTeacherId, getTeacherStatistics,
  getTeachers, normalizeTeacherInput, resetCorruptedStorage, restoreSampleTeachers, restoreTeacher,
  updateTeacher, validateTeacher,
} from "../../services/teacherService";
import "../../styles/admin/ManageTeachers.css";

/* ------------------------------ helpers ------------------------------ */
const fullName = (t) => [t.firstName, t.middleName, t.lastName].filter(Boolean).join(" ");
const initialsOf = (t) => `${t.firstName?.[0] ?? ""}${t.lastName?.[0] ?? ""}`.toUpperCase();
const fmtDate = (d) =>
  d ? new Date(`${d}T00:00:00`).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "-";
const todayStr = () => new Date().toISOString().slice(0, 10);
const yearsLabel = (n) => (n === "" || n === undefined || n === null ? "-" : `${n} ${Number(n) === 1 ? "year" : "years"}`);
const statusKey = (t) => (t.archived ? "Archived" : t.status);

const STATUS_CLASS = {
  Active: "tm-badge--active", "On Leave": "tm-badge--leave", Inactive: "tm-badge--inactive", Archived: "tm-badge--archived",
};

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

function StatusBadge({ teacher }) {
  const key = statusKey(teacher);
  return <span className={`tm-badge ${STATUS_CLASS[key] ?? ""}`}>{key}</span>;
}

function Avatar({ teacher, size = "md" }) {
  const [failed, setFailed] = useState(false);
  useEffect(() => setFailed(false), [teacher.photoUrl]);
  if (teacher.photoUrl && !failed) {
    return <img src={teacher.photoUrl} alt="" className={`tm-avatar tm-avatar--${size}`} onError={() => setFailed(true)} />;
  }
  return (
    <span className={`tm-avatar tm-avatar--${size} tm-avatar--${teacher.gender === "Female" ? "f" : "m"}`} aria-hidden="true">
      {initialsOf(teacher)}
    </span>
  );
}

/* ------------------------------ accessible modal ------------------------------ */
function Modal({ title, titleId, onClose, size = "lg", children, footer }) {
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
        const nodes = ref.current.querySelectorAll(
          'a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])'
        );
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

  return (
    <>
      <div className="modal-backdrop show tm-backdrop" />
      <div
        className="modal d-block tm-modal" role="dialog" aria-modal="true" aria-labelledby={titleId} tabIndex={-1} ref={ref}
        onMouseDown={(e) => e.target === e.currentTarget && closeRef.current()}
      >
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

/* ------------------------------ dropdown menu (fixed position, never clipped by table) ------------------------------ */
function ActionMenu({ trigger, triggerClassName, triggerLabel, items, disabled }) {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState({});
  const btnRef = useRef(null);
  const menuRef = useRef(null);

  const toggle = () => {
    if (open) return setOpen(false);
    const r = btnRef.current.getBoundingClientRect();
    const estimated = items.length * 38 + 16;
    const style = { right: Math.max(8, window.innerWidth - r.right) };
    if (r.bottom + estimated > window.innerHeight && r.top > estimated) style.bottom = window.innerHeight - r.top + 6;
    else style.top = r.bottom + 6;
    setPos(style);
    setOpen(true);
  };

  useEffect(() => {
    if (!open) return undefined;
    menuRef.current?.querySelector("button:not([disabled])")?.focus();
    const close = () => setOpen(false);
    const onDown = (e) => {
      if (!menuRef.current?.contains(e.target) && !btnRef.current?.contains(e.target)) close();
    };
    const onKey = (e) => {
      if (e.key === "Escape") { close(); btnRef.current?.focus(); }
      if (e.key === "ArrowDown" || e.key === "ArrowUp") {
        e.preventDefault();
        const nodes = [...menuRef.current.querySelectorAll("button:not([disabled])")];
        const i = nodes.indexOf(document.activeElement);
        const next = e.key === "ArrowDown" ? (i + 1) % nodes.length : (i - 1 + nodes.length) % nodes.length;
        nodes[next]?.focus();
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
      <button
        ref={btnRef} type="button" className={triggerClassName} aria-label={triggerLabel} title={triggerLabel}
        aria-haspopup="menu" aria-expanded={open} disabled={disabled} onClick={toggle}
      >
        {trigger}
      </button>
      {open && (
        <div ref={menuRef} className="tm-menu" role="menu" style={pos}>
          {items.map((item, i) => {
            if (item.type === "divider") return <div key={`d${i}`} className="tm-menu__divider" role="separator" />;
            if (item.type === "header") return <div key={`h${i}`} className="tm-menu__header">{item.label}</div>;
            const Icon = item.icon;
            return (
              <button
                key={item.label} type="button" role="menuitem" disabled={item.disabled}
                className={`tm-menu__item${item.danger ? " tm-menu__item--danger" : ""}`}
                onClick={() => { setOpen(false); item.onClick(); }}
              >
                <span className="tm-menu__icon">{item.checked ? <Check size={15} /> : Icon ? <Icon size={15} /> : null}</span>
                {item.label}
              </button>
            );
          })}
        </div>
      )}
    </>
  );
}

/* ------------------------------ stat card ------------------------------ */
function StatCard({ icon: Icon, label, value, total, tone, caption }) {
  const pct = total ? Math.round((value / total) * 100) : 0;
  return (
    <div className="tm-stat">
      <div className="tm-stat__top">
        <span className={`tm-stat__icon tm-tone--${tone}`}><Icon size={22} aria-hidden="true" /></span>
        <div>
          <div className="tm-stat__value">{value}</div>
          <div className="tm-stat__label">{label}</div>
        </div>
      </div>
      <div className="tm-stat__bar" role="img" aria-label={`${pct}% of teachers`}>
        <span className={`tm-stat__fill tm-fill--${tone}`} style={{ width: `${pct}%` }} />
      </div>
      <div className="tm-stat__caption">{caption ?? `${pct}% of teachers`}</div>
    </div>
  );
}

/* ------------------------------ form ------------------------------ */
const blankForm = (teachers) => ({
  id: generateTeacherId(teachers),
  firstName: "", middleName: "", lastName: "", gender: "", dateOfBirth: "", email: "", phone: "", address: "", photoUrl: "",
  department: "", subject: "", employmentType: "Full-time", status: "Active", joiningDate: "", experienceYears: "", salary: "",
  qualification: "", institution: "", graduationYear: "", certifications: "",
  emergencyName: "", emergencyPhone: "", biography: "",
});

function Field({ id, label, error, required, hint, children, className = "col-md-6" }) {
  return (
    <div className={className}>
      <label htmlFor={id} className="form-label">
        {label}{required && <span className="text-danger" aria-hidden="true"> *</span>}
      </label>
      {children}
      {hint && !error && <div className="tm-hint">{hint}</div>}
      {error && <div className="tm-error" id={`${id}-err`} role="alert">{error}</div>}
    </div>
  );
}

function TeacherForm({ teacher, teachers, onSubmit, saving, formError }) {
  const isEdit = Boolean(teacher);
  const [form, setForm] = useState(() => (teacher ? { ...blankForm(teachers), ...teacher } : blankForm(teachers)));
  const [errors, setErrors] = useState({});

  const subjects = useMemo(() => {
    const list = [...(DEPARTMENT_SUBJECTS[form.department] ?? [])];
    if (form.subject && !list.includes(form.subject)) list.push(form.subject);
    return list;
  }, [form.department, form.subject]);

  const update = (key) => (e) => {
    const value = e.target.value;
    setForm((f) => {
      const next = { ...f, [key]: value };
      if (key === "department" && !(DEPARTMENT_SUBJECTS[value] ?? []).includes(f.subject)) next.subject = "";
      return next;
    });
    if (errors[key]) setErrors((x) => ({ ...x, [key]: undefined }));
  };
  const attrs = (key) => ({
    id: `t-${key}`, value: form[key] ?? "", onChange: update(key),
    className: `form-control${errors[key] ? " is-invalid" : ""}`,
    "aria-invalid": Boolean(errors[key]), "aria-describedby": errors[key] ? `t-${key}-err` : undefined,
  });
  const selectAttrs = (key) => ({ ...attrs(key), className: `form-select${errors[key] ? " is-invalid" : ""}` });

  const submit = async (e) => {
    e.preventDefault();
    if (saving) return;
    const data = normalizeTeacherInput(form);
    const found = validateTeacher(data, teachers, { currentId: teacher?.id ?? null });
    setErrors(found);
    const firstKey = Object.keys(found)[0];
    if (firstKey) return document.getElementById(`t-${firstKey}`)?.focus();
    const result = await onSubmit(data);
    if (result?.errors) {
      setErrors(result.errors);
      document.getElementById(`t-${Object.keys(result.errors)[0]}`)?.focus();
    }
  };

  return (
    <form id="teacher-form" onSubmit={submit} noValidate>
      {formError && <div className="alert alert-danger py-2" role="alert">{formError}</div>}

      <fieldset className="tm-section">
        <legend>Personal Information</legend>
        <div className="row g-3">
          <Field id="t-firstName" label="First Name" required error={errors.firstName}><input {...attrs("firstName")} autoComplete="given-name" /></Field>
          <Field id="t-middleName" label="Middle Name"><input {...attrs("middleName")} /></Field>
          <Field id="t-lastName" label="Last Name" required error={errors.lastName}><input {...attrs("lastName")} autoComplete="family-name" /></Field>
          <Field id="t-gender" label="Gender" required error={errors.gender}>
            <select {...selectAttrs("gender")}><option value="">Select gender</option><option>Male</option><option>Female</option></select>
          </Field>
          <Field id="t-dateOfBirth" label="Date of Birth" required error={errors.dateOfBirth}>
            <input type="date" min="1945-01-01" max={todayStr()} {...attrs("dateOfBirth")} />
          </Field>
          <Field id="t-phone" label="Phone" required error={errors.phone}><input type="tel" placeholder="09XXXXXXXX" autoComplete="tel" {...attrs("phone")} /></Field>
          <Field id="t-email" label="Email" required error={errors.email}><input type="email" autoComplete="email" {...attrs("email")} /></Field>
          <Field id="t-address" label="Address"><input {...attrs("address")} /></Field>
          <Field id="t-photoUrl" label="Profile Image URL" error={errors.photoUrl} hint="Optional. Initials are shown when empty." className="col-12">
            <input type="url" placeholder="https://..." {...attrs("photoUrl")} />
          </Field>
        </div>
      </fieldset>

      <fieldset className="tm-section">
        <legend>Employment Information</legend>
        <div className="row g-3">
          <Field id="t-id" label="Teacher ID" required error={errors.id} hint={isEdit ? "The ID cannot be changed." : "Suggested automatically. You may edit it."}>
            <input {...attrs("id")} readOnly={isEdit} />
          </Field>
          <Field id="t-department" label="Department" required error={errors.department}>
            <select {...selectAttrs("department")}><option value="">Select department</option>{DEPARTMENTS.map((d) => <option key={d}>{d}</option>)}</select>
          </Field>
          <Field id="t-subject" label="Subject Specialization" required error={errors.subject}>
            <select {...selectAttrs("subject")} disabled={!form.department}>
              <option value="">{form.department ? "Select subject" : "Select a department first"}</option>
              {subjects.map((s) => <option key={s}>{s}</option>)}
            </select>
          </Field>
          <Field id="t-employmentType" label="Employment Type" required error={errors.employmentType}>
            <select {...selectAttrs("employmentType")}>{EMPLOYMENT_TYPES.map((x) => <option key={x}>{x}</option>)}</select>
          </Field>
          <Field id="t-status" label="Employment Status" required error={errors.status}>
            <select {...selectAttrs("status")}>{TEACHER_STATUSES.map((x) => <option key={x}>{x}</option>)}</select>
          </Field>
          <Field id="t-joiningDate" label="Joining Date" required error={errors.joiningDate}><input type="date" {...attrs("joiningDate")} /></Field>
          <Field id="t-experienceYears" label="Years of Experience" required error={errors.experienceYears}>
            <input type="number" min="0" max="50" step="1" inputMode="numeric" {...attrs("experienceYears")} />
          </Field>
          <Field id="t-salary" label="Salary (ETB)" error={errors.salary} hint="Optional. Not shown in the table or profile.">
            <input type="number" min="0" step="0.01" inputMode="decimal" {...attrs("salary")} />
          </Field>
        </div>
      </fieldset>

      <fieldset className="tm-section">
        <legend>Educational Background</legend>
        <div className="row g-3">
          <Field id="t-qualification" label="Highest Qualification" required error={errors.qualification}>
            <select {...selectAttrs("qualification")}><option value="">Select qualification</option>{QUALIFICATIONS.map((q) => <option key={q}>{q}</option>)}</select>
          </Field>
          <Field id="t-institution" label="Institution" required error={errors.institution}><input {...attrs("institution")} /></Field>
          <Field id="t-graduationYear" label="Graduation Year" required error={errors.graduationYear}>
            <input type="number" min="1960" max={new Date().getFullYear()} step="1" inputMode="numeric" {...attrs("graduationYear")} />
          </Field>
          <Field id="t-certifications" label="Certifications" hint="Separate several certifications with commas."><input {...attrs("certifications")} /></Field>
        </div>
      </fieldset>

      <fieldset className="tm-section mb-0">
        <legend>Additional Information</legend>
        <div className="row g-3">
          <Field id="t-emergencyName" label="Emergency Contact Name"><input {...attrs("emergencyName")} /></Field>
          <Field id="t-emergencyPhone" label="Emergency Contact Phone" error={errors.emergencyPhone}><input type="tel" {...attrs("emergencyPhone")} /></Field>
          <Field id="t-biography" label="Biography" className="col-12"><textarea rows={3} {...attrs("biography")} /></Field>
        </div>
      </fieldset>
    </form>
  );
}

/* ------------------------------ details view ------------------------------ */
function Info({ label, value, wide }) {
  return (
    <div className={wide ? "col-12" : "col-sm-6"}>
      <div className="tm-info__label">{label}</div>
      <div className="tm-info__value">{value || "-"}</div>
    </div>
  );
}

function TeacherDetails({ teacher: t }) {
  const [tab, setTab] = useState("personal");
  const tabs = [["personal", "Personal"], ["employment", "Employment"], ["education", "Education"], ["additional", "Additional"]];
  const age = calculateAge(t.dateOfBirth);
  return (
    <>
      <div className="tm-profile-head">
        <Avatar teacher={t} size="xl" />
        <div>
          <div className="tm-profile-head__name">{fullName(t)}</div>
          <div className="text-muted small mb-1">{t.id} &middot; {t.subject || "No subject"} &middot; {t.department || "No department"}</div>
          <StatusBadge teacher={t} />
        </div>
      </div>
      <ul className="nav nav-pills tm-tabs" role="tablist" aria-label="Teacher profile sections">
        {tabs.map(([key, label]) => (
          <li className="nav-item" role="presentation" key={key}>
            <button type="button" role="tab" aria-selected={tab === key} className={`nav-link${tab === key ? " active" : ""}`} onClick={() => setTab(key)}>{label}</button>
          </li>
        ))}
      </ul>
      <div className="row g-3 tm-info" role="tabpanel">
        {tab === "personal" && <>
          <Info label="Full Name" value={fullName(t)} /><Info label="Gender" value={t.gender} />
          <Info label="Date of Birth" value={`${fmtDate(t.dateOfBirth)}${age !== null ? ` (${age} years)` : ""}`} />
          <Info label="Phone" value={t.phone} /><Info label="Email" value={t.email} /><Info label="Address" value={t.address} />
        </>}
        {tab === "employment" && <>
          <Info label="Teacher ID" value={t.id} /><Info label="Department" value={t.department} />
          <Info label="Subject Specialization" value={t.subject} /><Info label="Employment Type" value={t.employmentType} />
          <Info label="Employment Status" value={statusKey(t)} /><Info label="Joining Date" value={fmtDate(t.joiningDate)} />
          <Info label="Years of Experience" value={yearsLabel(t.experienceYears)} />
        </>}
        {tab === "education" && <>
          <Info label="Highest Qualification" value={t.qualification} /><Info label="Institution" value={t.institution} />
          <Info label="Graduation Year" value={t.graduationYear} /><Info label="Certifications" value={t.certifications} />
        </>}
        {tab === "additional" && <>
          <Info label="Emergency Contact" value={t.emergencyName} /><Info label="Emergency Phone" value={t.emergencyPhone} />
          <Info label="Biography" value={t.biography} wide />
        </>}
      </div>
    </>
  );
}

/* ------------------------------ remove (archive / delete) dialog ------------------------------ */
function RemoveModal({ teacher, busy, onClose, onArchive, onRestore, onDelete }) {
  const [confirmed, setConfirmed] = useState(false);
  return (
    <Modal
      size="md" title={teacher.archived ? "Archived Teacher" : "Archive or Delete Teacher"} titleId="remove-title" onClose={onClose}
      footer={<>
        <button type="button" className="btn btn-outline-secondary" onClick={onClose} disabled={busy}>Cancel</button>
        {teacher.archived
          ? <button type="button" className="btn btn-outline-primary" onClick={onRestore} disabled={busy}><ArchiveRestore size={16} /> Restore</button>
          : <button type="button" className="btn btn-warning" onClick={onArchive} disabled={busy}><Archive size={16} /> Archive</button>}
        <button type="button" className="btn btn-danger" onClick={onDelete} disabled={busy || !confirmed}>Delete Permanently</button>
      </>}
    >
      <div className="tm-delete">
        <span className="tm-delete__icon"><WarnIcon /></span>
        <div>
          <p className="mb-2"><strong>{fullName(teacher)}</strong> ({teacher.id}) &middot; {teacher.subject}</p>
          <p className="small text-muted mb-3">
            {teacher.archived ? "This teacher is archived and hidden from the main list. " : "Archiving hides the teacher from the main list but keeps the record, and is the recommended option. "}
            Permanently deleting removes the record and may affect classes, timetables and other information linked to this teacher.
          </p>
          <div className="form-check">
            <input className="form-check-input" type="checkbox" id="confirm-delete" checked={confirmed} onChange={(e) => setConfirmed(e.target.checked)} />
            <label className="form-check-label small" htmlFor="confirm-delete">I understand that permanent deletion cannot be undone.</label>
          </div>
        </div>
      </div>
    </Modal>
  );
}

/* ------------------------------ main page ------------------------------ */
const PAGE_SIZES = [5, 10, 25, 50];
const NO_FILTERS = { search: "", subject: "", department: "", gender: "", status: "", qualification: "" };
const SORT_VALUES = {
  name: (t) => fullName(t).toLowerCase(),
  id: (t) => t.id,
  subject: (t) => (t.subject || "").toLowerCase(),
  department: (t) => (t.department || "").toLowerCase(),
  experience: (t) => Number(t.experienceYears) || 0,
  status: (t) => statusKey(t),
};

export default function ManageTeachers() {
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [filters, setFilters] = useState(NO_FILTERS);
  const [sort, setSort] = useState({ key: "name", dir: "asc" });
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
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
    try {
      setTeachers(await getTeachers());
    } catch (err) {
      setLoadError({ message: err.message || "Failed to load teachers.", corrupted: Boolean(err.corrupted) });
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => { load(); }, [load]);

  /* run a service call with a busy lock; returns true on success */
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
    } finally {
      setBusy(false);
    }
  }, [busy, notify]);

  const stats = useMemo(() => getTeacherStatistics(teachers), [teachers]);

  const subjectOptions = useMemo(() => [...new Set([...ALL_SUBJECTS, ...teachers.map((t) => t.subject).filter(Boolean)])].sort(), [teachers]);
  const departmentOptions = useMemo(() => [...new Set([...DEPARTMENTS, ...teachers.map((t) => t.department).filter(Boolean)])].sort(), [teachers]);

  const filtered = useMemo(() => {
    const q = filters.search.trim().toLowerCase();
    const digits = q.replace(/\D/g, "");
    const list = teachers.filter((t) => {
      if (filters.status === "Archived" ? !t.archived : t.archived) return false;
      if (filters.status && filters.status !== "Archived" && t.status !== filters.status) return false;
      if (filters.subject && t.subject !== filters.subject) return false;
      if (filters.department && t.department !== filters.department) return false;
      if (filters.gender && t.gender !== filters.gender) return false;
      if (filters.qualification && t.qualification !== filters.qualification) return false;
      if (q) {
        const textHit = [fullName(t), t.id, t.email].some((v) => (v ?? "").toLowerCase().includes(q));
        const phoneHit = digits.length >= 3 && (t.phone ?? "").replace(/\D/g, "").includes(digits);
        if (!textHit && !phoneHit) return false;
      }
      return true;
    });
    const getValue = SORT_VALUES[sort.key];
    const dir = sort.dir === "asc" ? 1 : -1;
    return [...list].sort((a, b) => {
      const x = getValue(a);
      const y = getValue(b);
      return x > y ? dir : x < y ? -dir : 0;
    });
  }, [teachers, filters, sort]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, pageCount);
  const rows = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  const hasFilters = Object.values(filters).some(Boolean);

  const pageNumbers = useMemo(() => {
    const start = Math.max(1, Math.min(currentPage - 2, pageCount - 4));
    const end = Math.min(pageCount, start + 4);
    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  }, [currentPage, pageCount]);

  const setFilter = (key) => (e) => { setFilters((f) => ({ ...f, [key]: e.target.value })); setPage(1); };
  const toggleSort = (key) => setSort((s) => (s.key === key ? { key, dir: s.dir === "asc" ? "desc" : "asc" } : { key, dir: "asc" }));
  const sortAria = (key) => (sort.key === key ? (sort.dir === "asc" ? "ascending" : "descending") : "none");
  const SortIcon = ({ k }) => (sort.key !== k ? <ChevronsUpDown size={14} aria-hidden="true" /> : sort.dir === "asc" ? <ChevronUp size={14} aria-hidden="true" /> : <ChevronDown size={14} aria-hidden="true" />);

  /* selection */
  const pageIds = rows.map((t) => t.id);
  const allOnPage = pageIds.length > 0 && pageIds.every((id) => selected.has(id));
  const someOnPage = pageIds.some((id) => selected.has(id));
  useEffect(() => { if (selectAllRef.current) selectAllRef.current.indeterminate = someOnPage && !allOnPage; }, [someOnPage, allOnPage]);
  const toggleAll = () => setSelected((prev) => {
    const next = new Set(prev);
    pageIds.forEach((id) => (allOnPage ? next.delete(id) : next.add(id)));
    return next;
  });
  const toggleOne = (id) => setSelected((prev) => { const next = new Set(prev); next.has(id) ? next.delete(id) : next.add(id); return next; });
  const selectedTeachers = useMemo(() => teachers.filter((t) => selected.has(t.id)), [teachers, selected]);

  const closeModal = useCallback(() => { if (!busy) { setModal(null); setFormError(""); } }, [busy]);
  const replaceTeacher = (updated) => setTeachers((list) => list.map((t) => (t.id === updated.id ? updated : t)));

  /* save (add / edit) */
  const handleSave = async (data) => {
    if (busy) return null;
    setBusy(true);
    setFormError("");
    try {
      if (modal.teacher) {
        const updated = await updateTeacher(modal.teacher.id, data);
        replaceTeacher(updated);
        notify("success", `${fullName(updated)}'s information was updated.`);
      } else {
        const created = await addTeacher(data);
        setTeachers((list) => [created, ...list]);
        notify("success", `${fullName(created)} was added as ${created.id}.`);
      }
      setModal(null);
      return null;
    } catch (err) {
      if (err instanceof TeacherValidationError) return { errors: err.errors };
      setFormError(err.message || "Could not save the teacher.");
      return null;
    } finally {
      setBusy(false);
    }
  };

  const handleChangeStatus = (t, status) =>
    run(async () => replaceTeacher(await changeTeacherStatus(t.id, status)), `${fullName(t)} is now ${status}.`);

  const handleArchive = async (t) => {
    const ok = await run(async () => replaceTeacher(await archiveTeacher(t.id)), `${fullName(t)} was archived successfully.`);
    if (ok) { setModal(null); setSelected((p) => { const n = new Set(p); n.delete(t.id); return n; }); }
  };
  const handleRestore = async (t) => {
    const ok = await run(async () => replaceTeacher(await restoreTeacher(t.id)), `${fullName(t)} was restored.`);
    if (ok) setModal(null);
  };
  const handleDelete = async (t) => {
    const ok = await run(async () => {
      await deleteTeacher(t.id);
      setTeachers((list) => list.filter((x) => x.id !== t.id));
    }, `${fullName(t)} was permanently deleted.`);
    if (ok) { setModal(null); setSelected((p) => { const n = new Set(p); n.delete(t.id); return n; }); }
  };

  /* bulk */
  const handleBulkStatus = async (status) => {
    const ids = selectedTeachers.filter((t) => !t.archived).map((t) => t.id);
    if (!ids.length) return notify("danger", "No selected teachers can change status.");
    await run(async () => {
      const count = await bulkChangeStatus(ids, status);
      const set = new Set(ids);
      setTeachers((list) => list.map((t) => (set.has(t.id) ? { ...t, status } : t)));
      return count;
    }, (count) => `${count} teacher(s) set to ${status}.`);
  };
  const handleBulkArchive = async () => {
    const ids = selectedTeachers.filter((t) => !t.archived).map((t) => t.id);
    const ok = await run(async () => {
      const count = await bulkArchive(ids);
      const set = new Set(ids);
      setTeachers((list) => list.map((t) => (set.has(t.id) ? { ...t, archived: true } : t)));
      return count;
    }, (count) => `${count} teacher(s) archived successfully.`);
    if (ok) { setModal(null); setSelected(new Set()); }
  };

  /* export */
  const doExport = (list, filename, label) => {
    try {
      const count = exportTeachersToCSV(list, filename);
      notify("success", `Exported ${count} ${label} teacher(s) to ${filename}.`);
    } catch (err) {
      notify("danger", err.message);
    }
  };
  const year = new Date().getFullYear();
  const exportItems = [
    { type: "header", label: "Export to CSV" },
    { label: `Filtered teachers (${filtered.length})`, icon: Download, disabled: filtered.length === 0, onClick: () => doExport(filtered, `teachers-filtered-${year}.csv`, "filtered") },
    { label: `All teachers (${teachers.length})`, icon: Download, disabled: teachers.length === 0, onClick: () => doExport(teachers, `teachers-report-${year}.csv`, "all") },
    { label: `Selected teachers (${selectedTeachers.length})`, icon: Download, disabled: selectedTeachers.length === 0, onClick: () => doExport(selectedTeachers, `teachers-selected-${year}.csv`, "selected") },
  ];

  const rowMenuItems = (t) => [
    { type: "header", label: "Change status" },
    ...TEACHER_STATUSES.map((s) => ({ label: s, checked: !t.archived && t.status === s, disabled: t.archived || t.status === s, onClick: () => handleChangeStatus(t, s) })),
    { type: "divider" },
    t.archived
      ? { label: "Restore teacher", icon: ArchiveRestore, onClick: () => handleRestore(t) }
      : { label: "Archive teacher", icon: Archive, onClick: () => setModal({ type: "remove", teacher: t }) },
    { label: "Delete permanently", icon: Trash2, danger: true, onClick: () => setModal({ type: "remove", teacher: t }) },
  ];

  const recover = async (task, message) => {
    setBusy(true);
    try {
      setTeachers(await task());
      setLoadError(null);
      notify("success", message);
    } catch (err) {
      notify("danger", err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="teachers-page">
      <header className="tm-header">
        <div>
          <nav aria-label="breadcrumb">
            <ol className="breadcrumb tm-breadcrumb mb-1">
              <li className="breadcrumb-item">Dashboard</li>
              <li className="breadcrumb-item">User Management</li>
              <li className="breadcrumb-item active" aria-current="page">Teachers</li>
            </ol>
          </nav>
          <h1 className="tm-title">Teachers Management</h1>
          <p className="tm-subtitle">Manage teaching staff, subject assignments, qualifications and employment status.</p>
        </div>
        <div className="tm-header__actions">
          <span className="tm-year"><CalendarDays size={16} aria-hidden="true" /> Academic Year {CURRENT_ACADEMIC_YEAR_LABEL}</span>
          <ActionMenu
            triggerClassName="btn btn-outline-secondary tm-btn" triggerLabel="Export teachers" items={exportItems}
            disabled={loading || Boolean(loadError)} trigger={<><Download size={16} /> Export <ChevronDown size={14} /></>}
          />
          <button type="button" className="btn btn-primary tm-btn" disabled={loading || Boolean(loadError)} onClick={() => { setFormError(""); setModal({ type: "form" }); }}>
            <UserPlus size={16} /> Add New Teacher
          </button>
        </div>
      </header>

      <section className="tm-stats" aria-label="Teacher statistics">
        <StatCard icon={Users} tone="blue" label="Total Teachers" value={stats.total} total={stats.total} caption={stats.archived ? `${stats.archived} archived` : "Excludes archived"} />
        <StatCard icon={UserCheck} tone="green" label="Active Teachers" value={stats.active} total={stats.total} />
        <StatCard icon={Clock} tone="amber" label="On Leave" value={stats.onLeave} total={stats.total} />
        <StatCard icon={Mars} tone="indigo" label="Male Teachers" value={stats.male} total={stats.total} />
        <StatCard icon={Venus} tone="pink" label="Female Teachers" value={stats.female} total={stats.total} />
      </section>

      <section className="tm-card tm-toolbar" aria-label="Search and filters">
        <div className="tm-search">
          <Search size={16} className="tm-search__icon" aria-hidden="true" />
          <input type="search" className="form-control" placeholder="Search by name, Teacher ID, email or phone" aria-label="Search teachers" value={filters.search} onChange={setFilter("search")} />
        </div>
        <select className="form-select" aria-label="Filter by subject" value={filters.subject} onChange={setFilter("subject")}>
          <option value="">All Subjects</option>{subjectOptions.map((s) => <option key={s}>{s}</option>)}
        </select>
        <select className="form-select" aria-label="Filter by department" value={filters.department} onChange={setFilter("department")}>
          <option value="">All Departments</option>{departmentOptions.map((d) => <option key={d}>{d}</option>)}
        </select>
        <select className="form-select" aria-label="Filter by gender" value={filters.gender} onChange={setFilter("gender")}>
          <option value="">All Genders</option><option>Male</option><option>Female</option>
        </select>
        <select className="form-select" aria-label="Filter by employment status" value={filters.status} onChange={setFilter("status")}>
          <option value="">All Statuses</option>{TEACHER_STATUSES.map((s) => <option key={s}>{s}</option>)}<option>Archived</option>
        </select>
        <select className="form-select" aria-label="Filter by qualification" value={filters.qualification} onChange={setFilter("qualification")}>
          <option value="">All Qualifications</option>{QUALIFICATIONS.map((q) => <option key={q}>{q}</option>)}
        </select>
        <button type="button" className="btn btn-outline-secondary tm-btn" disabled={!hasFilters} onClick={() => { setFilters(NO_FILTERS); setPage(1); }}>
          <X size={16} /> Clear
        </button>
      </section>

      {selected.size > 0 && (
        <div className="tm-bulk" role="region" aria-label="Bulk actions">
          <strong>{selected.size} selected</strong>
          <div className="tm-bulk__actions">
            <button type="button" className="btn btn-sm btn-outline-primary" onClick={() => doExport(selectedTeachers, `teachers-selected-${year}.csv`, "selected")}><Download size={14} /> Export selected</button>
            <button type="button" className="btn btn-sm btn-outline-success" disabled={busy} onClick={() => handleBulkStatus("Active")}><UserCheck size={14} /> Activate</button>
            <button type="button" className="btn btn-sm btn-outline-secondary" disabled={busy} onClick={() => handleBulkStatus("Inactive")}>Deactivate</button>
            <button type="button" className="btn btn-sm btn-outline-warning" disabled={busy || selectedTeachers.every((t) => t.archived)} onClick={() => setModal({ type: "bulk-archive" })}><Archive size={14} /> Archive</button>
            <button type="button" className="btn btn-sm btn-link text-secondary" onClick={() => setSelected(new Set())}>Clear selection</button>
          </div>
        </div>
      )}

      <section className="tm-card tm-tablecard">
        <div className="tm-tablecard__head">
          <span className="text-muted small" aria-live="polite">
            {loading ? "Loading..." : loadError ? "Unable to load" : `${filtered.length} ${filtered.length === 1 ? "teacher" : "teachers"} found`}
          </span>
        </div>

        {loading ? (
          <div className="tm-state" role="status"><div className="spinner-border text-primary" aria-hidden="true" /><p>Loading teachers...</p></div>
        ) : loadError ? (
          <div className="tm-state">
            <span className="tm-state__warn"><WarnIcon size={32} /></span>
            <p className="fw-semibold mb-0">{loadError.message}</p>
            <div className="d-flex flex-wrap gap-2 justify-content-center">
              <button type="button" className="btn btn-primary tm-btn" onClick={load}><RefreshCw size={16} /> Try again</button>
              {loadError.corrupted && (
                <button type="button" className="btn btn-outline-danger tm-btn" disabled={busy} onClick={() => recover(resetCorruptedStorage, "Sample data restored. The unreadable data was backed up in browser storage.")}>
                  Back up and restore sample data
                </button>
              )}
            </div>
          </div>
        ) : filtered.length === 0 ? (
          <div className="tm-state">
            <GraduationCap size={38} className="text-muted" aria-hidden="true" />
            <p className="fw-semibold mb-0">{teachers.length === 0 ? "No teachers yet" : "No teachers match your filters"}</p>
            <p className="text-muted small mb-1">{teachers.length === 0 ? "Add your first teacher or load the demo records." : "Try changing or clearing the filters."}</p>
            <div className="d-flex flex-wrap gap-2 justify-content-center">
              {hasFilters && <button type="button" className="btn btn-outline-primary tm-btn" onClick={() => setFilters(NO_FILTERS)}>Clear filters</button>}
              {teachers.length === 0 && <>
                <button type="button" className="btn btn-primary tm-btn" onClick={() => setModal({ type: "form" })}><UserPlus size={16} /> Add New Teacher</button>
                <button type="button" className="btn btn-outline-secondary tm-btn" disabled={busy} onClick={() => recover(restoreSampleTeachers, "Demo teachers loaded.")}>Load demo teachers</button>
              </>}
            </div>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table tm-table align-middle mb-0">
              <thead>
                <tr>
                  <th className="tm-col-check"><input ref={selectAllRef} type="checkbox" className="form-check-input" aria-label="Select all teachers on this page" checked={allOnPage} onChange={toggleAll} /></th>
                  <th aria-sort={sortAria("name")}><button type="button" className="tm-sort" onClick={() => toggleSort("name")}>Teacher <SortIcon k="name" /></button></th>
                  <th aria-sort={sortAria("id")}><button type="button" className="tm-sort" onClick={() => toggleSort("id")}>Teacher ID <SortIcon k="id" /></button></th>
                  <th>Gender</th>
                  <th aria-sort={sortAria("subject")}><button type="button" className="tm-sort" onClick={() => toggleSort("subject")}>Subject <SortIcon k="subject" /></button></th>
                  <th aria-sort={sortAria("department")}><button type="button" className="tm-sort" onClick={() => toggleSort("department")}>Department <SortIcon k="department" /></button></th>
                  <th>Qualification</th>
                  <th aria-sort={sortAria("experience")}><button type="button" className="tm-sort" onClick={() => toggleSort("experience")}>Experience <SortIcon k="experience" /></button></th>
                  <th>Phone</th>
                  <th aria-sort={sortAria("status")}><button type="button" className="tm-sort" onClick={() => toggleSort("status")}>Status <SortIcon k="status" /></button></th>
                  <th className="text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((t) => (
                  <tr key={t.id} className={selected.has(t.id) ? "is-selected" : ""}>
                    <td><input type="checkbox" className="form-check-input" aria-label={`Select ${fullName(t)}`} checked={selected.has(t.id)} onChange={() => toggleOne(t.id)} /></td>
                    <td>
                      <div className="tm-person">
                        <Avatar teacher={t} />
                        <div className="tm-person__text"><div className="tm-person__name">{fullName(t)}</div><div className="tm-person__sub">{t.email || "No email"}</div></div>
                      </div>
                    </td>
                    <td className="tm-mono">{t.id}</td>
                    <td>{t.gender}</td>
                    <td>{t.subject}</td>
                    <td>{t.department}</td>
                    <td className="text-nowrap">{t.qualification}</td>
                    <td className="text-nowrap">{yearsLabel(t.experienceYears)}</td>
                    <td className="text-nowrap">{t.phone}</td>
                    <td><StatusBadge teacher={t} /></td>
                    <td>
                      <div className="tm-actions">
                        <button type="button" className="tm-iconbtn" title="View details" aria-label={`View details of ${fullName(t)}`} onClick={() => setModal({ type: "view", teacher: t })}><Eye size={16} /></button>
                        <button type="button" className="tm-iconbtn" title="Edit teacher" aria-label={`Edit ${fullName(t)}`} onClick={() => { setFormError(""); setModal({ type: "form", teacher: t }); }}><Pencil size={16} /></button>
                        <ActionMenu triggerClassName="tm-iconbtn" triggerLabel={`More actions for ${fullName(t)}`} trigger={<DotsIcon />} items={rowMenuItems(t)} disabled={busy} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {!loading && !loadError && filtered.length > 0 && (
          <div className="tm-pager">
            <label className="d-flex align-items-center gap-2 small text-muted mb-0">
              Rows per page
              <select className="form-select form-select-sm tm-pager__size" value={pageSize} onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1); }}>
                {PAGE_SIZES.map((n) => <option key={n}>{n}</option>)}
              </select>
            </label>
            <span className="small text-muted">{(currentPage - 1) * pageSize + 1}-{Math.min(currentPage * pageSize, filtered.length)} of {filtered.length}</span>
            <nav aria-label="Pagination">
              <ul className="pagination pagination-sm mb-0">
                <li className={`page-item${currentPage === 1 ? " disabled" : ""}`}><button type="button" className="page-link" aria-label="Previous page" onClick={() => setPage(currentPage - 1)} disabled={currentPage === 1}><ChevronLeft size={14} /></button></li>
                {pageNumbers.map((n) => (
                  <li key={n} className={`page-item${n === currentPage ? " active" : ""}`}><button type="button" className="page-link" aria-current={n === currentPage ? "page" : undefined} onClick={() => setPage(n)}>{n}</button></li>
                ))}
                <li className={`page-item${currentPage === pageCount ? " disabled" : ""}`}><button type="button" className="page-link" aria-label="Next page" onClick={() => setPage(currentPage + 1)} disabled={currentPage === pageCount}><ChevronRight size={14} /></button></li>
              </ul>
            </nav>
          </div>
        )}
      </section>

      {modal?.type === "view" && (
        <Modal
          title="Teacher Profile" titleId="view-title" onClose={closeModal}
          footer={<>
            <button type="button" className="btn btn-outline-secondary" onClick={closeModal}>Close</button>
            <button type="button" className="btn btn-primary" onClick={() => setModal({ type: "form", teacher: modal.teacher })}><Pencil size={16} /> Edit</button>
          </>}
        >
          <TeacherDetails teacher={modal.teacher} />
        </Modal>
      )}

      {modal?.type === "form" && (
        <Modal
          size="xl" title={modal.teacher ? "Edit Teacher" : "Add New Teacher"} titleId="form-title" onClose={closeModal}
          footer={<>
            <button type="button" className="btn btn-outline-secondary" onClick={closeModal} disabled={busy}>Cancel</button>
            <button type="submit" form="teacher-form" className="btn btn-primary" disabled={busy}>
              {busy ? <><span className="spinner-border spinner-border-sm me-2" aria-hidden="true" />Saving...</> : modal.teacher ? "Save Changes" : "Save Teacher"}
            </button>
          </>}
        >
          <TeacherForm teacher={modal.teacher} teachers={teachers} onSubmit={handleSave} saving={busy} formError={formError} />
        </Modal>
      )}

      {modal?.type === "remove" && (
        <RemoveModal
          teacher={modal.teacher} busy={busy} onClose={closeModal}
          onArchive={() => handleArchive(modal.teacher)} onRestore={() => handleRestore(modal.teacher)} onDelete={() => handleDelete(modal.teacher)}
        />
      )}

      {modal?.type === "bulk-archive" && (
        <Modal
          size="md" title="Archive Selected Teachers" titleId="bulk-title" onClose={closeModal}
          footer={<>
            <button type="button" className="btn btn-outline-secondary" onClick={closeModal} disabled={busy}>Cancel</button>
            <button type="button" className="btn btn-warning" onClick={handleBulkArchive} disabled={busy}><Archive size={16} /> Archive {selectedTeachers.filter((t) => !t.archived).length} teacher(s)</button>
          </>}
        >
          <div className="tm-delete">
            <span className="tm-delete__icon tm-delete__icon--warn"><Archive size={24} /></span>
            <p className="mb-0">The selected teachers will be hidden from the main list. Their records are kept and can be restored from the <strong>Archived</strong> status filter.</p>
          </div>
        </Modal>
      )}

      <div className="tm-toasts" aria-live="polite">
        {toasts.map((t) => (
          <div key={t.id} className={`tm-toast tm-toast--${t.type}`} role="status">
            {t.type === "success" ? <Check size={18} /> : <WarnIcon size={18} />}
            <span>{t.message}</span>
            <button type="button" className="btn-close btn-close-white ms-2" aria-label="Dismiss notification" onClick={() => setToasts((list) => list.filter((x) => x.id !== t.id))} />
          </div>
        ))}
      </div>
    </div>
  );
}