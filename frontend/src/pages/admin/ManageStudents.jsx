import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  AlertTriangle, CalendarDays, Camera, CheckCircle2, ChevronDown, ChevronLeft,
  ChevronRight, ChevronsUpDown, ChevronUp, Download, Eye, FilterX, Mars, Pencil,
  RefreshCw, Search, Trash2, UserCheck, UserPlus, Users, Venus, X,
} from "lucide-react";
import {
  ACADEMIC_YEARS, CURRENT_ACADEMIC_YEAR_ID, GRADES, RELATIONSHIPS, SECTIONS, STATUSES,
} from "../../data/sampleStudents";
import {
  createStudent, deleteStudent, generateStudentId, getStudents, updateStudent,
  updateStudentsStatus,
} from "../../services/studentService";
import "../../styles/admin/ManageStudents.css";

/* ---------- helpers ---------- */
const gradeLabel = (id) => GRADES.find((g) => g.id === id)?.label ?? "-";
const gradeOrder = (id) => GRADES.find((g) => g.id === id)?.order ?? 0;
const sectionLabel = (id) => SECTIONS.find((s) => s.id === id)?.label ?? "-";
const yearLabel = (id) => ACADEMIC_YEARS.find((y) => y.id === id)?.label ?? "-";
const fullName = (s) => [s.firstName, s.middleName, s.lastName].filter(Boolean).join(" ");
const initials = (s) => `${s.firstName?.[0] ?? ""}${s.lastName?.[0] ?? ""}`.toUpperCase();
const todayStr = () => new Date().toISOString().slice(0, 10);
const fmtDate = (d) =>
  d ? new Date(d + "T00:00:00").toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "-";
const calcAge = (dob) => {
  if (!dob) return "-";
  const b = new Date(dob + "T00:00:00");
  const n = new Date();
  let age = n.getFullYear() - b.getFullYear();
  if (n.getMonth() < b.getMonth() || (n.getMonth() === b.getMonth() && n.getDate() < b.getDate())) age--;
  return age;
};
const PHONE_RE = /^(\+251|0)?[79]\d{8}$/;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const cleanPhone = (p) => p.replace(/[\s-]/g, "");

const STATUS_CLASS = {
  Active: "sm-badge--active", Inactive: "sm-badge--inactive", Graduated: "sm-badge--graduated",
  Suspended: "sm-badge--suspended", Pending: "sm-badge--pending",
};

function StatusBadge({ status }) {
  return <span className={`sm-badge ${STATUS_CLASS[status] ?? ""}`}>{status}</span>;
}

function Avatar({ student, size = "md" }) {
  return student.photo ? (
    <img src={student.photo} alt="" className={`sm-avatar sm-avatar--${size}`} />
  ) : (
    <span className={`sm-avatar sm-avatar--${size} sm-avatar--${student.gender === "Female" ? "f" : "m"}`} aria-hidden="true">
      {initials(student)}
    </span>
  );
}

function exportCsv(rows, filename) {
  const headers = ["Student ID", "First Name", "Middle Name", "Last Name", "Gender", "Date of Birth", "Email", "Phone", "Address", "Grade", "Section", "Academic Year", "Admission Date", "Status", "Parent/Guardian", "Relationship", "Parent Phone", "Parent Email"];
  const esc = (v) => `"${String(v ?? "").replace(/"/g, '""')}"`;
  const lines = rows.map((s) =>
    [s.id, s.firstName, s.middleName, s.lastName, s.gender, s.dateOfBirth, s.email, s.phone, s.address,
    gradeLabel(s.gradeId), sectionLabel(s.sectionId), yearLabel(s.academicYearId), s.admissionDate, s.status,
    s.parentName, s.parentRelationship, s.parentPhone, s.parentEmail].map(esc).join(",")
  );
  const blob = new Blob(["\uFEFF" + [headers.map(esc).join(","), ...lines].join("\n")], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}

/* ---------- accessible modal ---------- */
function Modal({ title, titleId, onClose, size = "lg", children, footer }) {
  const ref = useRef(null);
  useEffect(() => {
    const prev = document.activeElement;
    document.body.classList.add("modal-open");
    ref.current?.focus();
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
      if (e.key === "Tab" && ref.current) {
        const f = ref.current.querySelectorAll('a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])');
        if (!f.length) return;
        const first = f[0], last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.classList.remove("modal-open");
      prev?.focus?.();
    };
  }, [onClose]);

  return (
    <>
      <div className="modal-backdrop show sm-backdrop" onClick={onClose} />
      <div className="modal d-block sm-modal" role="dialog" aria-modal="true" aria-labelledby={titleId} tabIndex={-1} ref={ref} onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
        <div className={`modal-dialog modal-${size} modal-dialog-centered modal-dialog-scrollable`}>
          <div className="modal-content">
            <div className="modal-header">
              <h2 className="modal-title fs-5" id={titleId}>{title}</h2>
              <button type="button" className="btn-close" aria-label="Close" onClick={onClose} />
            </div>
            <div className="modal-body">{children}</div>
            {footer && <div className="modal-footer">{footer}</div>}
          </div>
        </div>
      </div>
    </>
  );
}

/* ---------- stat card ---------- */
function StatCard({ icon: Icon, label, value, hint, tone }) {
  return (
    <div className="sm-stat">
      <span className={`sm-stat__icon sm-tone--${tone}`}><Icon size={22} aria-hidden="true" /></span>
      <div className="sm-stat__body">
        <div className="sm-stat__value">{value}</div>
        <div className="sm-stat__label">{label}</div>
        {hint && <div className="sm-stat__hint">{hint}</div>}
      </div>
    </div>
  );
}

/* ---------- form ---------- */
const emptyForm = (students) => ({
  id: generateStudentId(students),
  firstName: "", middleName: "", lastName: "", gender: "", dateOfBirth: "", email: "", phone: "",
  address: "", photo: "",
  gradeId: "", sectionId: "", academicYearId: CURRENT_ACADEMIC_YEAR_ID, admissionDate: "", status: "Pending",
  parentId: "", parentName: "", parentRelationship: "", parentPhone: "", parentEmail: "",
  emergencyContact: "", notes: "", hasAccount: false,
});

function validate(f, students, isEdit) {
  const e = {};
  const req = (k, msg) => { if (!String(f[k] ?? "").trim()) e[k] = msg; };
  req("firstName", "First name is required.");
  req("lastName", "Last name is required.");
  req("gender", "Select a gender.");
  req("dateOfBirth", "Date of birth is required.");
  req("phone", "Phone number is required.");
  req("gradeId", "Select a grade.");
  req("sectionId", "Select a section.");
  req("academicYearId", "Select an academic year.");
  req("admissionDate", "Admission date is required.");
  req("status", "Select a status.");
  req("parentName", "Parent/guardian name is required.");
  req("parentRelationship", "Select a relationship.");
  req("parentPhone", "Parent/guardian phone is required.");

  if (f.dateOfBirth && !e.dateOfBirth) {
    const age = calcAge(f.dateOfBirth);
    if (f.dateOfBirth > todayStr()) e.dateOfBirth = "Date of birth cannot be in the future.";
    else if (age < 3 || age > 30) e.dateOfBirth = "Enter a realistic date of birth (age 3-30).";
  }
  if (f.admissionDate && !e.admissionDate) {
    if (f.dateOfBirth && f.admissionDate < f.dateOfBirth) e.admissionDate = "Admission cannot be before date of birth.";
    else if (f.admissionDate > new Date(Date.now() + 366 * 864e5).toISOString().slice(0, 10)) e.admissionDate = "Admission date is too far in the future.";
  }
  if (f.email.trim() && !EMAIL_RE.test(f.email.trim())) e.email = "Enter a valid email address.";
  if (f.parentEmail.trim() && !EMAIL_RE.test(f.parentEmail.trim())) e.parentEmail = "Enter a valid email address.";
  if (f.phone.trim() && !PHONE_RE.test(cleanPhone(f.phone))) e.phone = "Use an Ethiopian number, e.g. 0912345678.";
  if (f.parentPhone.trim() && !PHONE_RE.test(cleanPhone(f.parentPhone))) e.parentPhone = "Use an Ethiopian number, e.g. 0911223344.";
  if (f.emergencyContact.trim() && !PHONE_RE.test(cleanPhone(f.emergencyContact))) e.emergencyContact = "Enter a valid phone number.";
  if (!isEdit && students.some((s) => s.id.toLowerCase() === f.id.trim().toLowerCase())) e.id = "This student ID already exists.";
  return e;
}

function Field({ id, label, error, required, children, className = "col-md-6" }) {
  return (
    <div className={className}>
      <label htmlFor={id} className="form-label">{label}{required && <span className="text-danger"> *</span>}</label>
      {children}
      {error && <div className="sm-error" id={`${id}-err`} role="alert">{error}</div>}
    </div>
  );
}

function StudentForm({ student, students, onSubmit, onCancel, saving, serverError }) {
  const isEdit = Boolean(student);
  const [form, setForm] = useState(() => (student ? { ...emptyForm(students), ...student } : emptyForm(students)));
  const [errors, setErrors] = useState({});
  const [photoErr, setPhotoErr] = useState("");

  const parents = useMemo(() => {
    const map = new Map();
    students.forEach((s) => {
      if (s.parentId && !map.has(s.parentId))
        map.set(s.parentId, { id: s.parentId, name: s.parentName, rel: s.parentRelationship, phone: s.parentPhone, email: s.parentEmail });
    });
    return [...map.values()].sort((a, b) => a.name.localeCompare(b.name));
  }, [students]);

  const set = (k) => (e) => {
    const v = e.target.value;
    setForm((f) => ({ ...f, [k]: v }));
    if (errors[k]) setErrors((x) => ({ ...x, [k]: undefined }));
  };
  const props = (k) => ({
    id: `f-${k}`, value: form[k] ?? "", onChange: set(k),
    className: `form-control${errors[k] ? " is-invalid" : ""}`,
    "aria-invalid": Boolean(errors[k]), "aria-describedby": errors[k] ? `f-${k}-err` : undefined,
  });
  const selProps = (k) => ({ ...props(k), className: `form-select${errors[k] ? " is-invalid" : ""}` });

  const pickParent = (e) => {
    const p = parents.find((x) => x.id === e.target.value);
    setForm((f) => p
      ? { ...f, parentId: p.id, parentName: p.name, parentRelationship: p.rel, parentPhone: p.phone, parentEmail: p.email || "" }
      : { ...f, parentId: "" });
  };

  const onPhoto = (e) => {
    const file = e.target.files?.[0];
    setPhotoErr("");
    if (!file) return;
    if (!file.type.startsWith("image/")) return setPhotoErr("Please choose an image file.");
    if (file.size > 300 * 1024) return setPhotoErr("Image must be smaller than 300 KB.");
    const r = new FileReader();
    r.onload = () => setForm((f) => ({ ...f, photo: r.result }));
    r.readAsDataURL(file);
  };

  const submit = (e) => {
    e.preventDefault();
    if (saving) return;
    const errs = validate(form, students, isEdit);
    setErrors(errs);
    if (Object.keys(errs).length) {
      document.getElementById(`f-${Object.keys(errs)[0]}`)?.focus();
      return;
    }
    const trim = (v) => (typeof v === "string" ? v.trim() : v);
    const clean = Object.fromEntries(Object.entries(form).map(([k, v]) => [k, k === "photo" ? v : trim(v)]));
    clean.phone = cleanPhone(clean.phone);
    clean.parentPhone = cleanPhone(clean.parentPhone);
    if (clean.emergencyContact) clean.emergencyContact = cleanPhone(clean.emergencyContact);
    if (!clean.parentId) clean.parentId = `PAR-${Date.now().toString(36).toUpperCase()}`;
    onSubmit(clean);
  };

  return (
    <form id="student-form" onSubmit={submit} noValidate>
      {serverError && <div className="alert alert-danger py-2" role="alert">{serverError}</div>}

      <fieldset className="sm-section">
        <legend>Personal Information</legend>
        <div className="row g-3">
          <Field id="f-firstName" label="First Name" required error={errors.firstName}><input {...props("firstName")} autoComplete="given-name" /></Field>
          <Field id="f-middleName" label="Middle Name"><input {...props("middleName")} /></Field>
          <Field id="f-lastName" label="Last Name" required error={errors.lastName}><input {...props("lastName")} autoComplete="family-name" /></Field>
          <Field id="f-gender" label="Gender" required error={errors.gender}>
            <select {...selProps("gender")}><option value="">Select gender</option><option>Male</option><option>Female</option></select>
          </Field>
          <Field id="f-dateOfBirth" label="Date of Birth" required error={errors.dateOfBirth}>
            <input type="date" max={todayStr()} min="1990-01-01" {...props("dateOfBirth")} />
          </Field>
          <Field id="f-phone" label="Phone" required error={errors.phone}><input type="tel" placeholder="09XXXXXXXX" {...props("phone")} /></Field>
          <Field id="f-email" label="Email" error={errors.email}><input type="email" {...props("email")} /></Field>
          <Field id="f-address" label="Address"><input {...props("address")} /></Field>
          <div className="col-12">
            <label className="form-label d-block">Profile Photo <span className="text-muted">(optional, max 300 KB)</span></label>
            <div className="d-flex align-items-center gap-3">
              {form.photo ? <img src={form.photo} alt="Profile preview" className="sm-avatar sm-avatar--lg" /> : <span className="sm-avatar sm-avatar--lg sm-avatar--m" aria-hidden="true"><Camera size={20} /></span>}
              <input type="file" accept="image/*" className="form-control" aria-label="Profile photo" onChange={onPhoto} />
              {form.photo && <button type="button" className="btn btn-outline-secondary btn-sm" onClick={() => setForm((f) => ({ ...f, photo: "" }))}>Remove</button>}
            </div>
            {photoErr && <div className="sm-error" role="alert">{photoErr}</div>}
          </div>
        </div>
      </fieldset>

      <fieldset className="sm-section">
        <legend>Academic Information</legend>
        <div className="row g-3">
          <Field id="f-id" label="Student ID" error={errors.id}>
            <input {...props("id")} readOnly={isEdit} disabled={isEdit} />
          </Field>
          <Field id="f-gradeId" label="Grade" required error={errors.gradeId}>
            <select {...selProps("gradeId")}><option value="">Select grade</option>{GRADES.map((g) => <option key={g.id} value={g.id}>{g.label}</option>)}</select>
          </Field>
          <Field id="f-sectionId" label="Section" required error={errors.sectionId}>
            <select {...selProps("sectionId")}><option value="">Select section</option>{SECTIONS.map((s) => <option key={s.id} value={s.id}>Section {s.label}</option>)}</select>
          </Field>
          <Field id="f-academicYearId" label="Academic Year" required error={errors.academicYearId}>
            <select {...selProps("academicYearId")}>{ACADEMIC_YEARS.map((y) => <option key={y.id} value={y.id}>{y.label}</option>)}</select>
          </Field>
          <Field id="f-admissionDate" label="Admission Date" required error={errors.admissionDate}><input type="date" {...props("admissionDate")} /></Field>
          <Field id="f-status" label="Enrollment Status" required error={errors.status}>
            <select {...selProps("status")}>{STATUSES.map((s) => <option key={s}>{s}</option>)}</select>
          </Field>
        </div>
      </fieldset>

      <fieldset className="sm-section">
        <legend>Parent / Guardian Information</legend>
        <div className="row g-3">
          <Field id="f-parentPick" label="Select Existing Parent / Guardian" className="col-12">
            <select id="f-parentPick" className="form-select" value={form.parentId && parents.some((p) => p.id === form.parentId) ? form.parentId : ""} onChange={pickParent}>
              <option value="">Enter a new parent / guardian below</option>
              {parents.map((p) => <option key={p.id} value={p.id}>{p.name} ({p.rel}) - {p.phone}</option>)}
            </select>
          </Field>
          <Field id="f-parentName" label="Parent / Guardian Name" required error={errors.parentName}><input {...props("parentName")} /></Field>
          <Field id="f-parentRelationship" label="Relationship" required error={errors.parentRelationship}>
            <select {...selProps("parentRelationship")}><option value="">Select relationship</option>{RELATIONSHIPS.map((r) => <option key={r}>{r}</option>)}</select>
          </Field>
          <Field id="f-parentPhone" label="Phone" required error={errors.parentPhone}><input type="tel" {...props("parentPhone")} /></Field>
          <Field id="f-parentEmail" label="Email" error={errors.parentEmail}><input type="email" {...props("parentEmail")} /></Field>
        </div>
      </fieldset>

      <fieldset className="sm-section mb-0">
        <legend>Additional Information</legend>
        <div className="row g-3">
          <Field id="f-emergencyContact" label="Emergency Contact" error={errors.emergencyContact}><input type="tel" {...props("emergencyContact")} /></Field>
          <Field id="f-notes" label="Notes" className="col-12"><textarea rows={3} {...props("notes")} /></Field>
        </div>
      </fieldset>
    </form>
  );
}

/* ---------- details ---------- */
function Info({ label, value }) {
  return (
    <div className="col-sm-6">
      <div className="sm-info__label">{label}</div>
      <div className="sm-info__value">{value || "-"}</div>
    </div>
  );
}

function StudentDetails({ student: s }) {
  const [tab, setTab] = useState("personal");
  const tabs = [["personal", "Personal"], ["academic", "Academic"], ["guardian", "Parent / Guardian"], ["account", "Account"]];
  return (
    <>
      <div className="sm-profile-head">
        <Avatar student={s} size="xl" />
        <div>
          <div className="sm-profile-head__name">{fullName(s)}</div>
          <div className="text-muted small">{s.id} &middot; {gradeLabel(s.gradeId)} - Section {sectionLabel(s.sectionId)}</div>
          <StatusBadge status={s.status} />
        </div>
      </div>
      <ul className="nav nav-pills sm-tabs" role="tablist">
        {tabs.map(([k, l]) => (
          <li className="nav-item" role="presentation" key={k}>
            <button type="button" role="tab" aria-selected={tab === k} className={`nav-link${tab === k ? " active" : ""}`} onClick={() => setTab(k)}>{l}</button>
          </li>
        ))}
      </ul>
      <div className="row g-3 sm-info" role="tabpanel">
        {tab === "personal" && <>
          <Info label="Student ID" value={s.id} /><Info label="Full Name" value={fullName(s)} />
          <Info label="Gender" value={s.gender} /><Info label="Date of Birth" value={fmtDate(s.dateOfBirth)} />
          <Info label="Age" value={`${calcAge(s.dateOfBirth)} years`} /><Info label="Phone" value={s.phone} />
          <Info label="Email" value={s.email} /><Info label="Address" value={s.address} />
        </>}
        {tab === "academic" && <>
          <Info label="Grade" value={gradeLabel(s.gradeId)} /><Info label="Section" value={sectionLabel(s.sectionId)} />
          <Info label="Academic Year" value={yearLabel(s.academicYearId)} /><Info label="Admission Date" value={fmtDate(s.admissionDate)} />
          <Info label="Enrollment Status" value={s.status} />
        </>}
        {tab === "guardian" && <>
          <Info label="Name" value={s.parentName} /><Info label="Relationship" value={s.parentRelationship} />
          <Info label="Phone" value={s.parentPhone} /><Info label="Email" value={s.parentEmail} />
          <Info label="Emergency Contact" value={s.emergencyContact} />
          {s.notes && <div className="col-12"><div className="sm-info__label">Notes</div><div className="sm-info__value">{s.notes}</div></div>}
        </>}
        {tab === "account" && <>
          <Info label="Login Account" value={s.hasAccount ? "Has a login account" : "No login account"} />
          <Info label="Account Status" value={s.hasAccount ? (s.status === "Active" ? "Enabled" : "Disabled (student not active)") : "Not applicable"} />
        </>}
      </div>
    </>
  );
}

/* ---------- main page ---------- */
const PAGE_SIZES = [5, 10, 25, 50];
const NO_FILTERS = { search: "", grade: "", section: "", gender: "", status: "", year: "" };

export default function ManageStudents() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [filters, setFilters] = useState(NO_FILTERS);
  const [sort, setSort] = useState({ key: "admissionDate", dir: "desc" });
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [selected, setSelected] = useState(() => new Set());
  const [modal, setModal] = useState(null); // {type:'view'|'form'|'delete', student?}
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");
  const [toast, setToast] = useState(null);
  const [bulkStatus, setBulkStatus] = useState("");
  const toastTimer = useRef();

  const notify = useCallback((type, message) => {
    setToast({ type, message });
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 4000);
  }, []);
  useEffect(() => () => clearTimeout(toastTimer.current), []);

  const load = useCallback(async () => {
    setLoading(true); setLoadError("");
    try { setStudents(await getStudents()); }
    catch (err) { setLoadError(err.message || "Failed to load students."); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { load(); }, [load]);

  /* stats (computed from data) */
  const stats = useMemo(() => {
    const total = students.length;
    const active = students.filter((s) => s.status === "Active").length;
    const male = students.filter((s) => s.gender === "Male").length;
    const female = students.filter((s) => s.gender === "Female").length;
    const cutoff = new Date(Date.now() - 60 * 864e5).toISOString().slice(0, 10);
    const fresh = students.filter((s) => s.admissionDate >= cutoff && s.admissionDate <= todayStr()).length;
    const pct = (n) => (total ? `${Math.round((n / total) * 100)}% of total` : "-");
    return { total, active, male, female, fresh, pct };
  }, [students]);

  /* filter + sort */
  const filtered = useMemo(() => {
    const q = filters.search.trim().toLowerCase();
    const list = students.filter((s) => {
      if (q && ![fullName(s), s.id, s.email, s.phone].some((v) => (v ?? "").toLowerCase().includes(q))) return false;
      if (filters.grade && s.gradeId !== filters.grade) return false;
      if (filters.section && s.sectionId !== filters.section) return false;
      if (filters.gender && s.gender !== filters.gender) return false;
      if (filters.status && s.status !== filters.status) return false;
      if (filters.year && s.academicYearId !== filters.year) return false;
      return true;
    });
    const dir = sort.dir === "asc" ? 1 : -1;
    const val = {
      name: (s) => fullName(s).toLowerCase(), id: (s) => s.id,
      grade: (s) => gradeOrder(s.gradeId), admissionDate: (s) => s.admissionDate,
    }[sort.key];
    return [...list].sort((a, b) => (val(a) > val(b) ? dir : val(a) < val(b) ? -dir : 0));
  }, [students, filters, sort]);

  const pages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage = Math.min(page, pages);
  const rows = filtered.slice((safePage - 1) * pageSize, safePage * pageSize);
  const hasFilters = Object.values(filters).some(Boolean);

  const setFilter = (k) => (e) => { setFilters((f) => ({ ...f, [k]: e.target.value })); setPage(1); };
  const toggleSort = (key) => {
    setSort((s) => (s.key === key ? { key, dir: s.dir === "asc" ? "desc" : "asc" } : { key, dir: "asc" }));
  };
  const SortIcon = ({ k }) => sort.key !== k ? <ChevronsUpDown size={14} aria-hidden="true" /> : sort.dir === "asc" ? <ChevronUp size={14} aria-hidden="true" /> : <ChevronDown size={14} aria-hidden="true" />;
  const sortAria = (k) => (sort.key === k ? (sort.dir === "asc" ? "ascending" : "descending") : "none");

  /* selection */
  const pageIds = rows.map((s) => s.id);
  const allOnPage = pageIds.length > 0 && pageIds.every((id) => selected.has(id));
  const someOnPage = pageIds.some((id) => selected.has(id));
  const toggleAll = () => setSelected((prev) => {
    const n = new Set(prev);
    allOnPage ? pageIds.forEach((id) => n.delete(id)) : pageIds.forEach((id) => n.add(id));
    return n;
  });
  const toggleOne = (id) => setSelected((prev) => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  const selectAllRef = useRef();
  useEffect(() => { if (selectAllRef.current) selectAllRef.current.indeterminate = someOnPage && !allOnPage; }, [someOnPage, allOnPage]);

  const closeModal = useCallback(() => { if (!saving) { setModal(null); setFormError(""); } }, [saving]);

  /* actions */
  const handleSave = async (data) => {
    setSaving(true); setFormError("");
    try {
      if (modal.student) {
        const updated = await updateStudent(modal.student.id, data);
        setStudents((l) => l.map((s) => (s.id === updated.id ? updated : s)));
        notify("success", `${fullName(updated)} was updated.`);
      } else {
        const created = await createStudent(data);
        setStudents((l) => [created, ...l]);
        notify("success", `${fullName(created)} was added as ${created.id}.`);
      }
      setModal(null);
    } catch (err) {
      setFormError(err.message || "Could not save the student.");
    } finally { setSaving(false); }
  };

  const handleDeactivate = async (s) => {
    setSaving(true);
    try {
      const u = await updateStudent(s.id, { status: "Inactive" });
      setStudents((l) => l.map((x) => (x.id === u.id ? u : x)));
      notify("success", `${fullName(u)} was marked Inactive.`);
      setModal(null);
    } catch (err) { notify("danger", err.message); } finally { setSaving(false); }
  };

  const handleDelete = async (s) => {
    setSaving(true);
    try {
      await deleteStudent(s.id);
      setStudents((l) => l.filter((x) => x.id !== s.id));
      setSelected((p) => { const n = new Set(p); n.delete(s.id); return n; });
      notify("success", `${fullName(s)} was permanently deleted.`);
      setModal(null);
    } catch (err) { notify("danger", err.message); } finally { setSaving(false); }
  };

  const applyBulkStatus = async () => {
    if (!bulkStatus) return;
    setSaving(true);
    try {
      const ids = [...selected];
      await updateStudentsStatus(ids, bulkStatus);
      setStudents((l) => l.map((s) => (selected.has(s.id) ? { ...s, status: bulkStatus } : s)));
      notify("success", `${ids.length} student(s) set to ${bulkStatus}.`);
      setSelected(new Set()); setBulkStatus("");
    } catch (err) { notify("danger", err.message); } finally { setSaving(false); }
  };

  const exportAll = () => {
    if (!filtered.length) return notify("danger", "There are no students to export.");
    exportCsv(filtered, `students-${todayStr()}.csv`);
    notify("success", `Exported ${filtered.length} student(s).`);
  };
  const exportSelected = () => {
    const list = students.filter((s) => selected.has(s.id));
    exportCsv(list, `students-selected-${todayStr()}.csv`);
    notify("success", `Exported ${list.length} selected student(s).`);
  };

  const yearName = yearLabel(CURRENT_ACADEMIC_YEAR_ID);

  return (
    <div className="students-page">
      {/* header */}
      <header className="sm-header">
        <div>
          <nav aria-label="breadcrumb">
            <ol className="breadcrumb sm-breadcrumb mb-1">
              <li className="breadcrumb-item">Dashboard</li>
              <li className="breadcrumb-item">User Management</li>
              <li className="breadcrumb-item active" aria-current="page">Students</li>
            </ol>
          </nav>
          <h1 className="sm-title">Students Management</h1>
          <p className="sm-subtitle">Manage student records, enrollment, academic information and status.</p>
        </div>
        <div className="sm-header__actions">
          <span className="sm-year"><CalendarDays size={16} aria-hidden="true" /> Academic Year {yearName}</span>
          <button type="button" className="btn btn-outline-secondary sm-btn" onClick={exportAll}><Download size={16} /> Export</button>
          <button type="button" className="btn btn-primary sm-btn" onClick={() => { setFormError(""); setModal({ type: "form" }); }}><UserPlus size={16} /> Add New Student</button>
        </div>
      </header>

      {/* stats */}
      <section className="sm-stats" aria-label="Student statistics">
        <StatCard icon={Users} tone="blue" label="Total Students" value={stats.total} hint="All records" />
        <StatCard icon={UserCheck} tone="green" label="Active Students" value={stats.active} hint={stats.pct(stats.active)} />
        <StatCard icon={Mars} tone="indigo" label="Male Students" value={stats.male} hint={stats.pct(stats.male)} />
        <StatCard icon={Venus} tone="pink" label="Female Students" value={stats.female} hint={stats.pct(stats.female)} />
        <StatCard icon={UserPlus} tone="teal" label="New Admissions" value={stats.fresh} hint="Last 60 days" />
      </section>

      {/* toolbar */}
      <section className="sm-card sm-toolbar" aria-label="Search and filters">
        <div className="sm-search">
          <Search size={16} className="sm-search__icon" aria-hidden="true" />
          <input type="search" className="form-control" placeholder="Search by name, ID, email or phone" aria-label="Search students" value={filters.search} onChange={setFilter("search")} />
        </div>
        <select className="form-select" aria-label="Filter by grade" value={filters.grade} onChange={setFilter("grade")}>
          <option value="">All Grades</option>{GRADES.map((g) => <option key={g.id} value={g.id}>{g.label}</option>)}
        </select>
        <select className="form-select" aria-label="Filter by section" value={filters.section} onChange={setFilter("section")}>
          <option value="">All Sections</option>{SECTIONS.map((s) => <option key={s.id} value={s.id}>Section {s.label}</option>)}
        </select>
        <select className="form-select" aria-label="Filter by gender" value={filters.gender} onChange={setFilter("gender")}>
          <option value="">All Genders</option><option>Male</option><option>Female</option>
        </select>
        <select className="form-select" aria-label="Filter by enrollment status" value={filters.status} onChange={setFilter("status")}>
          <option value="">All Statuses</option>{STATUSES.map((s) => <option key={s}>{s}</option>)}
        </select>
        <select className="form-select" aria-label="Filter by academic year" value={filters.year} onChange={setFilter("year")}>
          <option value="">All Years</option>{ACADEMIC_YEARS.map((y) => <option key={y.id} value={y.id}>{y.label}</option>)}
        </select>
        <button type="button" className="btn btn-outline-secondary sm-btn" onClick={() => { setFilters(NO_FILTERS); setPage(1); }} disabled={!hasFilters}>
          <FilterX size={16} /> Clear
        </button>
      </section>

      {/* bulk bar */}
      {selected.size > 0 && (
        <div className="sm-bulk" role="region" aria-label="Bulk actions">
          <strong>{selected.size} selected</strong>
          <div className="sm-bulk__actions">
            <button type="button" className="btn btn-sm btn-outline-primary" onClick={exportSelected}><Download size={14} /> Export selected</button>
            <select className="form-select form-select-sm" aria-label="Change status of selected" value={bulkStatus} onChange={(e) => setBulkStatus(e.target.value)}>
              <option value="">Change status to...</option>{STATUSES.map((s) => <option key={s}>{s}</option>)}
            </select>
            <button type="button" className="btn btn-sm btn-primary" disabled={!bulkStatus || saving} onClick={applyBulkStatus}>Apply</button>
            <button type="button" className="btn btn-sm btn-link text-secondary" onClick={() => setSelected(new Set())}>Clear selection</button>
          </div>
        </div>
      )}

      {/* table */}
      <section className="sm-card sm-tablecard">
        <div className="sm-tablecard__head">
          <span className="text-muted small" aria-live="polite">
            {loading ? "Loading..." : `${filtered.length} ${filtered.length === 1 ? "student" : "students"} found`}
          </span>
        </div>

        {loading ? (
          <div className="sm-state" role="status"><div className="spinner-border text-primary" aria-hidden="true" /><p>Loading students...</p></div>
        ) : loadError ? (
          <div className="sm-state"><AlertTriangle size={32} className="text-danger" /><p>{loadError}</p>
            <button type="button" className="btn btn-primary sm-btn" onClick={load}><RefreshCw size={16} /> Try again</button></div>
        ) : filtered.length === 0 ? (
          <div className="sm-state"><Users size={36} className="text-muted" />
            <p className="mb-1 fw-semibold">{students.length ? "No students match your filters" : "No students yet"}</p>
            <p className="text-muted small">{students.length ? "Try changing or clearing the filters." : "Add your first student to get started."}</p>
            {hasFilters && <button type="button" className="btn btn-outline-primary sm-btn" onClick={() => setFilters(NO_FILTERS)}>Clear filters</button>}
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table sm-table align-middle mb-0">
              <thead>
                <tr>
                  <th className="sm-col-check"><input ref={selectAllRef} type="checkbox" className="form-check-input" aria-label="Select all students on this page" checked={allOnPage} onChange={toggleAll} /></th>
                  <th aria-sort={sortAria("name")}><button type="button" className="sm-sort" onClick={() => toggleSort("name")}>Student <SortIcon k="name" /></button></th>
                  <th aria-sort={sortAria("id")}><button type="button" className="sm-sort" onClick={() => toggleSort("id")}>Student ID <SortIcon k="id" /></button></th>
                  <th>Gender</th>
                  <th aria-sort={sortAria("grade")}><button type="button" className="sm-sort" onClick={() => toggleSort("grade")}>Grade <SortIcon k="grade" /></button></th>
                  <th>Section</th>
                  <th>Parent / Guardian</th>
                  <th>Phone</th>
                  <th aria-sort={sortAria("admissionDate")}><button type="button" className="sm-sort" onClick={() => toggleSort("admissionDate")}>Admission <SortIcon k="admissionDate" /></button></th>
                  <th>Status</th>
                  <th className="text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((s) => (
                  <tr key={s.id} className={selected.has(s.id) ? "is-selected" : ""}>
                    <td><input type="checkbox" className="form-check-input" aria-label={`Select ${fullName(s)}`} checked={selected.has(s.id)} onChange={() => toggleOne(s.id)} /></td>
                    <td>
                      <div className="sm-person">
                        <Avatar student={s} />
                        <div className="sm-person__text"><div className="sm-person__name">{fullName(s)}</div><div className="sm-person__sub">{s.email || "No email"}</div></div>
                      </div>
                    </td>
                    <td className="sm-mono">{s.id}</td>
                    <td>{s.gender}</td>
                    <td>{gradeLabel(s.gradeId)}</td>
                    <td>{sectionLabel(s.sectionId)}</td>
                    <td><div>{s.parentName}</div><div className="sm-person__sub">{s.parentRelationship}</div></td>
                    <td className="text-nowrap">{s.phone}</td>
                    <td className="text-nowrap">{fmtDate(s.admissionDate)}</td>
                    <td><StatusBadge status={s.status} /></td>
                    <td>
                      <div className="sm-actions">
                        <button type="button" className="sm-iconbtn" title="View student" aria-label={`View ${fullName(s)}`} onClick={() => setModal({ type: "view", student: s })}><Eye size={16} /></button>
                        <button type="button" className="sm-iconbtn" title="Edit student" aria-label={`Edit ${fullName(s)}`} onClick={() => { setFormError(""); setModal({ type: "form", student: s }); }}><Pencil size={16} /></button>
                        <button type="button" className="sm-iconbtn sm-iconbtn--danger" title="Delete student" aria-label={`Delete ${fullName(s)}`} onClick={() => setModal({ type: "delete", student: s })}><Trash2 size={16} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {!loading && !loadError && filtered.length > 0 && (
          <div className="sm-pager">
            <label className="d-flex align-items-center gap-2 small text-muted mb-0">
              Rows per page
              <select className="form-select form-select-sm sm-pager__size" value={pageSize} onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1); }}>
                {PAGE_SIZES.map((n) => <option key={n}>{n}</option>)}
              </select>
            </label>
            <span className="small text-muted">
              {(safePage - 1) * pageSize + 1}-{Math.min(safePage * pageSize, filtered.length)} of {filtered.length}
            </span>
            <div className="btn-group">
              <button type="button" className="btn btn-sm btn-outline-secondary" aria-label="Previous page" disabled={safePage === 1} onClick={() => setPage(safePage - 1)}><ChevronLeft size={16} /></button>
              <span className="btn btn-sm btn-outline-secondary disabled">Page {safePage} / {pages}</span>
              <button type="button" className="btn btn-sm btn-outline-secondary" aria-label="Next page" disabled={safePage === pages} onClick={() => setPage(safePage + 1)}><ChevronRight size={16} /></button>
            </div>
          </div>
        )}
      </section>

      {/* modals */}
      {modal?.type === "view" && (
        <Modal title="Student Profile" titleId="view-title" onClose={closeModal}
          footer={<>
            <button type="button" className="btn btn-outline-secondary" onClick={closeModal}>Close</button>
            <button type="button" className="btn btn-primary" onClick={() => setModal({ type: "form", student: modal.student })}><Pencil size={16} /> Edit</button>
          </>}>
          <StudentDetails student={modal.student} />
        </Modal>
      )}

      {modal?.type === "form" && (
        <Modal size="xl" title={modal.student ? "Edit Student" : "Add New Student"} titleId="form-title" onClose={closeModal}
          footer={<>
            <button type="button" className="btn btn-outline-secondary" onClick={closeModal} disabled={saving}>Cancel</button>
            <button type="submit" form="student-form" className="btn btn-primary" disabled={saving}>
              {saving ? <><span className="spinner-border spinner-border-sm me-2" aria-hidden="true" />Saving...</> : modal.student ? "Save Changes" : "Save Student"}
            </button>
          </>}>
          <StudentForm student={modal.student} students={students} onSubmit={handleSave} onCancel={closeModal} saving={saving} serverError={formError} />
        </Modal>
      )}

      {modal?.type === "delete" && (
        <Modal size="md" title="Remove Student" titleId="delete-title" onClose={closeModal}
          footer={<>
            <button type="button" className="btn btn-outline-secondary" onClick={closeModal} disabled={saving}>Cancel</button>
            <button type="button" className="btn btn-outline-warning" disabled={saving || modal.student.status === "Inactive"} onClick={() => handleDeactivate(modal.student)}>Mark Inactive</button>
            <button type="button" className="btn btn-danger" disabled={saving} onClick={() => handleDelete(modal.student)}>Delete Permanently</button>
          </>}>
          <div className="sm-delete">
            <span className="sm-delete__icon"><AlertTriangle size={24} /></span>
            <div>
              <p className="mb-2">You are about to remove <strong>{fullName(modal.student)}</strong> ({modal.student.id}), {gradeLabel(modal.student.gradeId)} - Section {sectionLabel(modal.student.sectionId)}.</p>
              <p className="small text-muted mb-0">Permanently deleting a student may affect related information such as attendance, grades, fees and parent links once those modules use this data. <strong>Mark Inactive</strong> keeps the record and is the recommended option.</p>
            </div>
          </div>
        </Modal>
      )}

      {toast && (
        <div className={`sm-toast sm-toast--${toast.type}`} role="status" aria-live="polite">
          {toast.type === "success" ? <CheckCircle2 size={18} /> : <AlertTriangle size={18} />}
          <span>{toast.message}</span>
          <button type="button" className="btn-close btn-close-white ms-2" aria-label="Dismiss" onClick={() => setToast(null)} />
        </div>
      )}
    </div>
  );
}