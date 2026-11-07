 import { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react';
import {
  AlertTriangle,
  Archive,
  ArchiveRestore,
  ArrowRightLeft,
  Armchair,
  Building2,
  CalendarDays,
  Check,
  ChevronDown,
  Copy,
  DoorOpen,
  Download,
  Eye,
  Gauge,
  GraduationCap,
  Info,
  Layers,
  MoreVertical,
  Pencil,
  Plus,
  RotateCcw,
  Search,
  SlidersHorizontal,
  Trash2,
  UserCheck,
  UserPlus,
  Users,
  X,
} from 'lucide-react';
import '../../styles/admin/ManageClasses.css';
import {
  GRADE_NAMES,
  GRADE_STATUSES,
  POLICY,
  ROOM_AVAILABILITY,
  ROOM_TYPES,
  SECTION_STATUSES,
  addAcademicYear,
  addClassroom,
  addGrade,
  addSection,
  archiveAcademicYear,
  archiveGrade,
  archiveSection,
  assignClassTeacher,
  assignClassroom,
  canDeleteGrade,
  canDeleteSection,
  copyAcademicStructure,
  deleteGrade,
  deleteSection,
  downloadCsv,
  enrollStudent,
  generateReport,
  getAcademicSnapshot,
  getAllStats,
  getEnrollmentRows,
  getSectionStatistics,
  getUnenrolledStudents,
  moveStudent,
  previewCopyStructure,
  removeStudentFromSection,
  restoreAcademicYear,
  setActiveAcademicYear,
  updateClassroom,
  updateGrade,
  updateSection,
} from '../../services/academicService';

/* ========================================================================== */
/* Helpers                                                                    */
/* ========================================================================== */

const cx = (...parts) => parts.filter(Boolean).join(' ');

const EMPTY_FILTERS = { q: '', gradeId: '', status: '', classroomId: '', teacherId: '', occupancy: '' };

const PALETTE = [
  '#4F46E5', '#6366F1', '#7C3AED', '#8B5CF6', '#0D9488', '#14B8A6',
  '#0891B2', '#06B6D4', '#2563EB', '#3B82F6', '#7C3AED', '#4F46E5',
];
const gradeStyle = (n) => ({ '--gs-a': PALETTE[(n - 1) % 12], '--gs-b': PALETTE[(n + 3) % 12] });

const occLevel = (p) => (p >= 100 ? 'full' : p >= 85 ? 'high' : p >= 50 ? 'medium' : 'low');
const OCC_LABEL = { full: 'Full', high: 'Nearly full', medium: 'Filling', low: 'Open' };

const fmtDate = (iso) => {
  if (!iso) return 'Not set';
  const d = new Date(iso);
  return Number.isNaN(d.getTime())
    ? 'Not set'
    : d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
};

const floorLabel = (f) => (Number(f) === 0 ? 'Ground floor' : `Floor ${f}`);
const sectionTitle = (section, gradeMap) =>
  `${gradeMap.get(section.gradeId)?.name || 'Grade'} Section ${section.name}`;

function teacherOptions(teachers, sections, gradeMap, year, selfId, currentId) {
  const taken = new Map();
  sections
    .filter((s) => s.academicYear === year && s.status === 'active' && s.id !== selfId && s.classTeacherId)
    .forEach((s) => taken.set(s.classTeacherId, s));
  return teachers
    .filter((t) => !t.status || t.status === 'active' || t.id === currentId)
    .map((t) => {
      const clash = taken.get(t.id);
      return {
        value: t.id,
        label: clash
          ? `${t.name} (class teacher of ${sectionTitle(clash, gradeMap)})`
          : `${t.name}${t.subject ? ` (${t.subject})` : ''}`,
        disabled: !!clash && !POLICY.allowTeacherMultipleSections,
      };
    });
}

function classroomOptions(rooms, sections, gradeMap, year, selfId, capacity, currentId) {
  const used = new Map();
  sections
    .filter((s) => s.academicYear === year && s.status === 'active' && s.id !== selfId && s.classroomId)
    .forEach((s) => used.set(s.classroomId, s));
  return rooms.map((r) => {
    const clash = used.get(r.id);
    let note = '';
    let disabled = false;
    if (r.availability === 'maintenance' && r.id !== currentId) {
      note = ' - under maintenance';
      disabled = true;
    } else if (clash && !POLICY.allowSharedClassrooms) {
      note = ` - in use by ${sectionTitle(clash, gradeMap)}`;
      disabled = true;
    } else if (capacity && Number(capacity) > r.capacity) {
      note = ' - too small for this capacity';
      disabled = true;
    }
    return {
      value: r.id,
      label: `${r.name}, ${r.building}, ${floorLabel(r.floor)}, ${r.capacity} seats${note}`,
      disabled: disabled && r.id !== currentId,
    };
  });
}

/* ========================================================================== */
/* Small UI building blocks                                                   */
/* ========================================================================== */

let scrollLocks = 0;

function Modal({ title, subtitle, onClose, children, footer, size = 'md', variant = 'dialog' }) {
  const ref = useRef(null);
  const closeRef = useRef(onClose);
  const labelId = useId();
  closeRef.current = onClose;

  useEffect(() => {
    const node = ref.current;
    const previous = document.activeElement;
    const focusables = () =>
      Array.from(
        node.querySelectorAll(
          'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
        )
      );
    const firstField = node.querySelector(
      '.gs-modal-body input:not([disabled]), .gs-modal-body select:not([disabled]), .gs-modal-body textarea:not([disabled])'
    );
    (firstField || focusables()[0] || node).focus();

    const onKey = (e) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        closeRef.current();
        return;
      }
      if (e.key !== 'Tab') return;
      const list = focusables();
      if (!list.length) return;
      const first = list[0];
      const last = list[list.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    node.addEventListener('keydown', onKey);
    scrollLocks += 1;
    document.body.classList.add('gs-no-scroll');
    return () => {
      node.removeEventListener('keydown', onKey);
      scrollLocks -= 1;
      if (scrollLocks <= 0) document.body.classList.remove('gs-no-scroll');
      if (previous && previous.focus) previous.focus();
    };
  }, []);

  return (
    <div
      className={cx('gs-overlay', variant === 'drawer' && 'is-drawer')}
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={ref}
        className={cx('gs-modal', `gs-modal--${size}`, variant === 'drawer' && 'gs-drawer')}
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelId}
        tabIndex={-1}
      >
        <header className="gs-modal-head">
          <div>
            <h2 id={labelId}>{title}</h2>
            {subtitle && <p>{subtitle}</p>}
          </div>
          <button type="button" className="gs-icon-btn" onClick={onClose} aria-label="Close dialog">
            <X size={18} />
          </button>
        </header>
        <div className="gs-modal-body">{children}</div>
        {footer && <footer className="gs-modal-foot">{footer}</footer>}
      </div>
    </div>
  );
}

function ActionMenu({ label, icon: Icon, items, iconOnly = false, variant = 'light', align = 'end' }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    const onDown = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    const onKey = (e) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return (
    <div className="gs-menu" ref={ref}>
      <button
        type="button"
        className={cx('gs-btn', iconOnly ? 'gs-btn--icon' : `gs-btn--${variant}`)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={iconOnly ? label : undefined}
        onClick={() => setOpen((o) => !o)}
      >
        {Icon && <Icon size={16} />}
        {!iconOnly && <span>{label}</span>}
        {!iconOnly && <ChevronDown size={14} />}
      </button>
      {open && (
        <div className={cx('gs-menu-list', align === 'start' && 'is-start')} role="menu">
          {items.map((item, i) => {
            if (item.heading) return <div key={`h${i}`} className="gs-menu-heading">{item.heading}</div>;
            if (item.divider) return <div key={`d${i}`} className="gs-menu-divider" role="separator" />;
            const ItemIcon = item.icon;
            return (
              <button
                key={`${i}-${item.label}`}
                type="button"
                role="menuitem"
                className={cx('gs-menu-item', item.danger && 'is-danger')}
                disabled={item.disabled}
                onClick={() => {
                  setOpen(false);
                  item.onClick();
                }}
              >
                {ItemIcon && <ItemIcon size={15} />}
                {item.label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

function Field({ id, label, error, hint, required, children }) {
  return (
    <div className="gs-field">
      <label htmlFor={id} className="form-label">
        {label}
        {required && <span className="gs-req" aria-hidden="true"> *</span>}
      </label>
      {children}
      {hint && !error && <div className="gs-hint">{hint}</div>}
      {error && <div className="gs-error" id={`${id}-err`} role="alert">{error}</div>}
    </div>
  );
}

const fieldProps = (id, errors) => ({
  id,
  'aria-invalid': errors[id.replace(/^gs-f-/, '')] ? true : undefined,
  'aria-describedby': errors[id.replace(/^gs-f-/, '')] ? `${id}-err` : undefined,
});

function OccBar({ value, label }) {
  const level = occLevel(value);
  return (
    <div
      className="gs-occ"
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.min(Math.round(value), 100)}
    >
      <span className={`gs-occ-fill is-${level}`} style={{ width: `${Math.min(value, 100)}%` }} />
    </div>
  );
}

function StatusBadge({ status }) {
  return <span className={`gs-badge gs-badge--${status}`}>{status}</span>;
}

function EmptyState({ icon: Icon, title, text, action }) {
  return (
    <div className="gs-empty">
      <div className="gs-empty-icon"><Icon size={28} /></div>
      <h3>{title}</h3>
      <p>{text}</p>
      {action}
    </div>
  );
}

function FormAlert({ message }) {
  if (!message) return null;
  return (
    <div className="gs-alert" role="alert">
      <AlertTriangle size={16} />
      <span>{message}</span>
    </div>
  );
}

function ConfirmDialog({ title, message, children, confirmLabel, danger, blocked, secondary, onConfirm, onClose }) {
  const [error, setError] = useState('');
  const run = (fn) => {
    try {
      fn();
    } catch (e) {
      setError(e.message || 'That action could not be completed.');
    }
  };
  return (
    <Modal
      title={title}
      size="sm"
      onClose={onClose}
      footer={
        <>
          <button type="button" className="gs-btn gs-btn--light" onClick={onClose}>
            {blocked ? 'Close' : 'Cancel'}
          </button>
          {secondary && (
            <button type="button" className="gs-btn gs-btn--primary" onClick={() => run(secondary.onClick)}>
              {secondary.label}
            </button>
          )}
          {!blocked && (
            <button
              type="button"
              className={cx('gs-btn', danger ? 'gs-btn--danger' : 'gs-btn--primary')}
              onClick={() => run(onConfirm)}
            >
              {confirmLabel}
            </button>
          )}
        </>
      }
    >
      <div className={cx('gs-confirm', blocked && 'is-blocked')}>
        <div className="gs-confirm-icon">{blocked ? <Info size={22} /> : <AlertTriangle size={22} />}</div>
        <div>
          <p>{message}</p>
          {children}
        </div>
      </div>
      <FormAlert message={error} />
    </Modal>
  );
}

/* ========================================================================== */
/* Forms                                                                      */
/* ========================================================================== */

function useFormState(initial) {
  const [form, setForm] = useState(initial);
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');
  const set = (key) => (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setForm((f) => ({ ...f, [key]: value }));
  };
  const fail = (err) => {
    setErrors(err.errors || {});
    setFormError(err.message || 'Something went wrong.');
  };
  return { form, setForm, errors, formError, set, fail };
}

function GradeForm({ grade, years, defaultYear, onClose, onSaved }) {
  const editing = !!grade;
  const { form, errors, formError, set, fail } = useFormState({
    name: grade?.name || '',
    code: grade?.code || '',
    description: grade?.description || '',
    academicYear: grade?.academicYear || defaultYear,
    status: grade?.status || 'active',
    notes: grade?.notes || '',
  });

  const submit = (e) => {
    e.preventDefault();
    try {
      const saved = editing ? updateGrade(grade.id, form) : addGrade(form);
      onSaved(saved, editing);
    } catch (err) {
      fail(err);
    }
  };

  return (
    <Modal
      title={editing ? `Edit ${grade.name}` : 'Add grade'}
      subtitle="Grades group sections for one academic year."
      onClose={onClose}
      footer={
        <>
          <button type="button" className="gs-btn gs-btn--light" onClick={onClose}>Cancel</button>
          <button type="submit" form="gs-grade-form" className="gs-btn gs-btn--primary">
            {editing ? 'Save changes' : 'Add grade'}
          </button>
        </>
      }
    >
      <form id="gs-grade-form" onSubmit={submit} noValidate>
        <FormAlert message={formError} />
        <div className="row g-3">
          <div className="col-md-6">
            <Field id="gs-f-name" label="Grade name" required error={errors.name}>
              <select className="form-select" {...fieldProps('gs-f-name', errors)} value={form.name} onChange={set('name')}>
                <option value="">Select a grade</option>
                {GRADE_NAMES.map((n) => <option key={n} value={n}>{n}</option>)}
              </select>
            </Field>
          </div>
          <div className="col-md-6">
            <Field id="gs-f-code" label="Grade code" error={errors.code} hint="Leave blank to generate one, for example G05.">
              <input className="form-control" {...fieldProps('gs-f-code', errors)} value={form.code} onChange={set('code')} maxLength={12} />
            </Field>
          </div>
          <div className="col-md-6">
            <Field id="gs-f-academicYear" label="Academic year" required error={errors.academicYear}>
              <select
                className="form-select"
                {...fieldProps('gs-f-academicYear', errors)}
                value={form.academicYear}
                onChange={set('academicYear')}
              >
                {years
                  .filter((y) => y.status !== 'archived' || y.name === grade?.academicYear)
                  .map((y) => <option key={y.id} value={y.name}>{y.name}</option>)}
              </select>
            </Field>
          </div>
          <div className="col-md-6">
            <Field id="gs-f-status" label="Status" error={errors.status}>
              <select className="form-select" {...fieldProps('gs-f-status', errors)} value={form.status} onChange={set('status')}>
                {GRADE_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </Field>
          </div>
          <div className="col-12">
            <Field id="gs-f-description" label="Description">
              <input className="form-control" id="gs-f-description" value={form.description} onChange={set('description')} maxLength={160} />
            </Field>
          </div>
          <div className="col-12">
            <Field id="gs-f-notes" label="Notes">
              <textarea className="form-control" id="gs-f-notes" rows={2} value={form.notes} onChange={set('notes')} maxLength={300} />
            </Field>
          </div>
        </div>
      </form>
    </Modal>
  );
}

function SectionForm({ section, prefill, snap, defaultYear, enrolled, onClose, onSaved }) {
  const editing = !!section;
  const { form, setForm, errors, formError, set, fail } = useFormState({
    name: section?.name || '',
    code: section?.code || '',
    gradeId: section?.gradeId || prefill?.gradeId || '',
    academicYear: section?.academicYear || defaultYear,
    status: section?.status || 'active',
    classroomId: section?.classroomId || '',
    classTeacherId: section?.classTeacherId || '',
    assistantTeacherId: section?.assistantTeacherId || '',
    capacity: section?.capacity ?? '',
    enrollmentOpen: section ? section.enrollmentOpen !== false : true,
    notes: section?.notes || '',
  });

  const lockedStructure = editing && enrolled > 0;
  const gradeMap = useMemo(() => new Map(snap.grades.map((g) => [g.id, g])), [snap]);
  const gradeList = snap.grades
    .filter((g) => g.academicYear === form.academicYear && (g.status !== 'archived' || g.id === form.gradeId))
    .sort((a, b) => a.number - b.number);
  const rooms = classroomOptions(snap.classrooms, snap.sections, gradeMap, form.academicYear, section?.id, form.capacity, section?.classroomId);
  const teachers = teacherOptions(snap.teachers, snap.sections, gradeMap, form.academicYear, section?.id, section?.classTeacherId);
  const room = snap.classrooms.find((r) => r.id === form.classroomId);

  const onYear = (e) => {
    const academicYear = e.target.value;
    setForm((f) => ({
      ...f,
      academicYear,
      gradeId: snap.grades.some((g) => g.id === f.gradeId && g.academicYear === academicYear) ? f.gradeId : '',
    }));
  };

  const submit = (e) => {
    e.preventDefault();
    try {
      const saved = editing ? updateSection(section.id, form) : addSection(form);
      onSaved(saved, editing);
    } catch (err) {
      fail(err);
    }
  };

  return (
    <Modal
      title={editing ? `Edit ${sectionTitle(section, gradeMap)}` : 'Add section'}
      subtitle="Sections hold students, a class teacher and a classroom."
      size="lg"
      onClose={onClose}
      footer={
        <>
          <button type="button" className="gs-btn gs-btn--light" onClick={onClose}>Cancel</button>
          <button type="submit" form="gs-section-form" className="gs-btn gs-btn--primary">
            {editing ? 'Save changes' : 'Add section'}
          </button>
        </>
      }
    >
      <form id="gs-section-form" onSubmit={submit} noValidate>
        <FormAlert message={formError} />

        <fieldset className="gs-fieldset">
          <legend>Basic information</legend>
          <div className="row g-3">
            <div className="col-md-4">
              <Field id="gs-f-name" label="Section name" required error={errors.name} hint="For example A, B or C.">
                <input className="form-control" {...fieldProps('gs-f-name', errors)} value={form.name} onChange={set('name')} maxLength={3} />
              </Field>
            </div>
            <div className="col-md-4">
              <Field id="gs-f-code" label="Section code" error={errors.code} hint="Blank generates one, like G05-A.">
                <input className="form-control" {...fieldProps('gs-f-code', errors)} value={form.code} onChange={set('code')} maxLength={16} />
              </Field>
            </div>
            <div className="col-md-4">
              <Field id="gs-f-status" label="Status" error={errors.status}>
                <select className="form-select" {...fieldProps('gs-f-status', errors)} value={form.status} onChange={set('status')}>
                  {SECTION_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </Field>
            </div>
            <div className="col-md-6">
              <Field id="gs-f-academicYear" label="Academic year" required error={errors.academicYear}>
                <select
                  className="form-select"
                  {...fieldProps('gs-f-academicYear', errors)}
                  value={form.academicYear}
                  onChange={onYear}
                  disabled={lockedStructure}
                >
                  {snap.years
                    .filter((y) => y.status !== 'archived' || y.name === section?.academicYear)
                    .map((y) => <option key={y.id} value={y.name}>{y.name}</option>)}
                </select>
              </Field>
            </div>
            <div className="col-md-6">
              <Field
                id="gs-f-gradeId"
                label="Parent grade"
                required
                error={errors.gradeId}
                hint={lockedStructure ? 'Locked while students are enrolled.' : undefined}
              >
                <select
                  className="form-select"
                  {...fieldProps('gs-f-gradeId', errors)}
                  value={form.gradeId}
                  onChange={set('gradeId')}
                  disabled={lockedStructure}
                >
                  <option value="">Select a grade</option>
                  {gradeList.map((g) => <option key={g.id} value={g.id}>{g.name}</option>)}
                </select>
              </Field>
            </div>
          </div>
        </fieldset>

        <fieldset className="gs-fieldset">
          <legend>Classroom assignment</legend>
          <div className="row g-3">
            <div className="col-12">
              <Field id="gs-f-classroomId" label="Classroom" error={errors.classroomId} hint="Rooms that are in use, too small or under maintenance are disabled.">
                <select className="form-select" {...fieldProps('gs-f-classroomId', errors)} value={form.classroomId} onChange={set('classroomId')}>
                  <option value="">No classroom yet</option>
                  {rooms.map((r) => <option key={r.value} value={r.value} disabled={r.disabled}>{r.label}</option>)}
                </select>
              </Field>
            </div>
            {room && (
              <div className="col-12">
                <dl className="gs-roominfo">
                  <div><dt>Room</dt><dd>{room.name}</dd></div>
                  <div><dt>Building</dt><dd>{room.building}</dd></div>
                  <div><dt>Floor</dt><dd>{floorLabel(room.floor)}</dd></div>
                  <div><dt>Type</dt><dd>{room.type}</dd></div>
                  <div><dt>Room capacity</dt><dd>{room.capacity}</dd></div>
                </dl>
              </div>
            )}
          </div>
        </fieldset>

        <fieldset className="gs-fieldset">
          <legend>Teacher assignment</legend>
          <div className="row g-3">
            <div className="col-md-6">
              <Field id="gs-f-classTeacherId" label="Class teacher" error={errors.classTeacherId} hint="Demo teacher list. Connect your teacher records later.">
                <select className="form-select" {...fieldProps('gs-f-classTeacherId', errors)} value={form.classTeacherId} onChange={set('classTeacherId')}>
                  <option value="">Not assigned</option>
                  {teachers.map((t) => <option key={t.value} value={t.value} disabled={t.disabled}>{t.label}</option>)}
                </select>
              </Field>
            </div>
            <div className="col-md-6">
              <Field id="gs-f-assistantTeacherId" label="Assistant teacher (optional)" error={errors.assistantTeacherId}>
                <select className="form-select" {...fieldProps('gs-f-assistantTeacherId', errors)} value={form.assistantTeacherId} onChange={set('assistantTeacherId')}>
                  <option value="">Not assigned</option>
                  {snap.teachers
                    .filter((t) => t.id !== form.classTeacherId)
                    .map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
                </select>
              </Field>
            </div>
          </div>
        </fieldset>

        <fieldset className="gs-fieldset">
          <legend>Enrollment settings</legend>
          <div className="row g-3">
            <div className="col-md-4">
              <Field id="gs-f-capacity" label="Maximum student capacity" required error={errors.capacity}>
                <input
                  className="form-control"
                  type="number"
                  min={1}
                  max={200}
                  inputMode="numeric"
                  {...fieldProps('gs-f-capacity', errors)}
                  value={form.capacity}
                  onChange={set('capacity')}
                />
              </Field>
            </div>
            <div className="col-md-4">
              <Field id="gs-f-enrolled" label="Current enrollment" hint="Counted from enrollment records. Change it in Enrollment.">
                <input className="form-control" id="gs-f-enrolled" value={editing ? enrolled : 0} readOnly />
              </Field>
            </div>
            <div className="col-md-4 d-flex align-items-center">
              <div className="form-check form-switch mt-3">
                <input className="form-check-input" type="checkbox" role="switch" id="gs-f-enrollmentOpen" checked={form.enrollmentOpen} onChange={set('enrollmentOpen')} />
                <label className="form-check-label" htmlFor="gs-f-enrollmentOpen">Open for enrollment</label>
              </div>
            </div>
            <div className="col-12">
              <Field id="gs-f-notes" label="Notes">
                <textarea className="form-control" id="gs-f-notes" rows={2} value={form.notes} onChange={set('notes')} maxLength={300} />
              </Field>
            </div>
          </div>
        </fieldset>
      </form>
    </Modal>
  );
}

function AssignModal({ kind, section, snap, onClose, onSaved }) {
  const isTeacher = kind === 'teacher';
  const gradeMap = useMemo(() => new Map(snap.grades.map((g) => [g.id, g])), [snap]);
  const [value, setValue] = useState((isTeacher ? section.classTeacherId : section.classroomId) || '');
  const [error, setError] = useState('');
  const options = isTeacher
    ? teacherOptions(snap.teachers, snap.sections, gradeMap, section.academicYear, section.id, section.classTeacherId)
    : classroomOptions(snap.classrooms, snap.sections, gradeMap, section.academicYear, section.id, section.capacity, section.classroomId);

  const submit = (e) => {
    e.preventDefault();
    try {
      const saved = isTeacher ? assignClassTeacher(section.id, value) : assignClassroom(section.id, value);
      onSaved(saved);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <Modal
      title={isTeacher ? 'Assign class teacher' : 'Assign classroom'}
      subtitle={sectionTitle(section, gradeMap)}
      size="sm"
      onClose={onClose}
      footer={
        <>
          <button type="button" className="gs-btn gs-btn--light" onClick={onClose}>Cancel</button>
          <button type="submit" form="gs-assign-form" className="gs-btn gs-btn--primary">Save assignment</button>
        </>
      }
    >
      <form id="gs-assign-form" onSubmit={submit}>
        <FormAlert message={error} />
        <Field id="gs-f-assign" label={isTeacher ? 'Class teacher' : 'Classroom'} hint="Unavailable options are disabled and explain why.">
          <select className="form-select" id="gs-f-assign" value={value} onChange={(e) => setValue(e.target.value)}>
            <option value="">{isTeacher ? 'Not assigned' : 'No classroom'}</option>
            {options.map((o) => <option key={o.value} value={o.value} disabled={o.disabled}>{o.label}</option>)}
          </select>
        </Field>
      </form>
    </Modal>
  );
}

function ClassroomForm({ room, onClose, onSaved }) {
  const editing = !!room;
  const { form, errors, formError, set, fail } = useFormState({
    name: room?.name || '',
    building: room?.building || '',
    floor: room?.floor ?? 0,
    type: room?.type || ROOM_TYPES[0],
    capacity: room?.capacity ?? '',
    availability: room?.availability || 'available',
  });

  const submit = (e) => {
    e.preventDefault();
    try {
      const saved = editing ? updateClassroom(room.id, form) : addClassroom(form);
      onSaved(saved, editing);
    } catch (err) {
      fail(err);
    }
  };

  return (
    <Modal
      title={editing ? `Edit ${room.name}` : 'Add classroom'}
      onClose={onClose}
      footer={
        <>
          <button type="button" className="gs-btn gs-btn--light" onClick={onClose}>Cancel</button>
          <button type="submit" form="gs-room-form" className="gs-btn gs-btn--primary">{editing ? 'Save changes' : 'Add classroom'}</button>
        </>
      }
    >
      <form id="gs-room-form" onSubmit={submit} noValidate>
        <FormAlert message={formError} />
        <div className="row g-3">
          <div className="col-md-6">
            <Field id="gs-f-name" label="Room name or number" required error={errors.name}>
              <input className="form-control" {...fieldProps('gs-f-name', errors)} value={form.name} onChange={set('name')} maxLength={40} />
            </Field>
          </div>
          <div className="col-md-6">
            <Field id="gs-f-building" label="Building" required error={errors.building}>
              <input className="form-control" {...fieldProps('gs-f-building', errors)} value={form.building} onChange={set('building')} maxLength={40} />
            </Field>
          </div>
          <div className="col-md-4">
            <Field id="gs-f-floor" label="Floor" error={errors.floor} hint="0 is the ground floor.">
              <input className="form-control" type="number" min={0} max={30} {...fieldProps('gs-f-floor', errors)} value={form.floor} onChange={set('floor')} />
            </Field>
          </div>
          <div className="col-md-4">
            <Field id="gs-f-capacity" label="Maximum capacity" required error={errors.capacity}>
              <input className="form-control" type="number" min={1} max={500} {...fieldProps('gs-f-capacity', errors)} value={form.capacity} onChange={set('capacity')} />
            </Field>
          </div>
          <div className="col-md-4">
            <Field id="gs-f-availability" label="Availability" error={errors.availability}>
              <select className="form-select" {...fieldProps('gs-f-availability', errors)} value={form.availability} onChange={set('availability')}>
                {ROOM_AVAILABILITY.map((a) => <option key={a} value={a}>{a}</option>)}
              </select>
            </Field>
          </div>
          <div className="col-12">
            <Field id="gs-f-type" label="Room type" error={errors.type}>
              <select className="form-select" {...fieldProps('gs-f-type', errors)} value={form.type} onChange={set('type')}>
                {ROOM_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </Field>
          </div>
        </div>
      </form>
    </Modal>
  );
}

function YearForm({ onClose, onSaved }) {
  const { form, errors, formError, set, fail } = useFormState({ name: '' });
  const submit = (e) => {
    e.preventDefault();
    try {
      onSaved(addAcademicYear(form.name));
    } catch (err) {
      fail(err);
    }
  };
  return (
    <Modal
      title="Add academic year"
      size="sm"
      onClose={onClose}
      footer={
        <>
          <button type="button" className="gs-btn gs-btn--light" onClick={onClose}>Cancel</button>
          <button type="submit" form="gs-year-form" className="gs-btn gs-btn--primary">Add year</button>
        </>
      }
    >
      <form id="gs-year-form" onSubmit={submit} noValidate>
        <FormAlert message={formError} />
        <Field id="gs-f-name" label="Academic year" required error={errors.name} hint="Format: 2027/2028. The new year starts empty and inactive.">
          <input className="form-control" {...fieldProps('gs-f-name', errors)} value={form.name} onChange={set('name')} placeholder="2027/2028" maxLength={9} />
        </Field>
      </form>
    </Modal>
  );
}

function CopyStructureModal({ years, initialFrom, onClose, onDone }) {
  const writable = years.filter((y) => y.status !== 'archived');
  const [from, setFrom] = useState(initialFrom || years[0]?.name || '');
  const [to, setTo] = useState(writable.find((y) => y.name !== initialFrom)?.name || '');
  const [error, setError] = useState('');

  const { preview, previewError } = useMemo(() => {
    try {
      return { preview: previewCopyStructure(from, to), previewError: '' };
    } catch (e) {
      return { preview: null, previewError: e.message };
    }
  }, [from, to]);

  const nothing = preview && !preview.gradesToCreate.length && !preview.sectionsToCreate.length;

  const confirm = () => {
    try {
      onDone(copyAcademicStructure(from, to));
    } catch (e) {
      setError(e.message);
    }
  };

  return (
    <Modal
      title="Copy academic structure"
      subtitle="Creates grades and sections only. Students, teachers and classrooms are not copied."
      onClose={onClose}
      footer={
        <>
          <button type="button" className="gs-btn gs-btn--light" onClick={onClose}>Cancel</button>
          <button type="button" className="gs-btn gs-btn--primary" disabled={!preview || nothing} onClick={confirm}>
            Create records
          </button>
        </>
      }
    >
      <FormAlert message={error} />
      <div className="row g-3">
        <div className="col-md-6">
          <Field id="gs-f-from" label="Copy from">
            <select className="form-select" id="gs-f-from" value={from} onChange={(e) => setFrom(e.target.value)}>
              {years.map((y) => <option key={y.id} value={y.name}>{y.name}</option>)}
            </select>
          </Field>
        </div>
        <div className="col-md-6">
          <Field id="gs-f-to" label="Copy into">
            <select className="form-select" id="gs-f-to" value={to} onChange={(e) => setTo(e.target.value)}>
              <option value="">Select a year</option>
              {writable.map((y) => <option key={y.id} value={y.name}>{y.name}</option>)}
            </select>
          </Field>
        </div>
      </div>
      <div className="gs-preview" aria-live="polite">
        {previewError && <p className="gs-muted">{previewError}</p>}
        {preview && (
          <>
            <h3>Preview</h3>
            <ul>
              <li><strong>{preview.gradesToCreate.length}</strong> grades will be created{preview.gradesExisting.length ? ` (${preview.gradesExisting.length} already exist and are reused)` : ''}.</li>
              <li><strong>{preview.sectionsToCreate.length}</strong> sections will be created{preview.sectionsSkipped.length ? ` (${preview.sectionsSkipped.length} already exist and are skipped)` : ''}.</li>
            </ul>
            {preview.sectionsToCreate.length > 0 && (
              <p className="gs-muted">
                {preview.sectionsToCreate.slice(0, 8).map((s) => `${s.grade} ${s.section}`).join(', ')}
                {preview.sectionsToCreate.length > 8 ? ` and ${preview.sectionsToCreate.length - 8} more` : ''}
              </p>
            )}
            {nothing && <p className="gs-muted">There is nothing new to create for this pair of years.</p>}
          </>
        )}
      </div>
    </Modal>
  );
}

function EnrollModal({ mode, student, currentSectionId, year, sections, gradeMap, stats, preferredSectionId, onClose, onDone }) {
  const moving = mode === 'move';
  const options = useMemo(() => {
    const groups = new Map();
    sections
      .filter((s) => s.status === 'active' && s.enrollmentOpen)
      .forEach((s) => {
        const g = gradeMap.get(s.gradeId);
        if (!g) return;
        if (!groups.has(g.id)) groups.set(g.id, { grade: g, items: [] });
        const st = stats.sections[s.id];
        groups.get(g.id).items.push({
          id: s.id,
          label: `Section ${s.name}, ${st.enrolled} of ${s.capacity} seats used`,
          disabled: st.available <= 0 || s.id === currentSectionId,
        });
      });
    return Array.from(groups.values()).sort((a, b) => a.grade.number - b.grade.number);
  }, [sections, gradeMap, stats, currentSectionId]);

  const firstEnabled = options.flatMap((g) => g.items).find((i) => !i.disabled);
  const preferred = options.flatMap((g) => g.items).find((i) => i.id === preferredSectionId && !i.disabled);
  const [sectionId, setSectionId] = useState(preferred?.id || '');
  const [error, setError] = useState('');

  const submit = (e) => {
    e.preventDefault();
    try {
      if (moving) moveStudent(student.id, sectionId, year);
      else enrollStudent(student.id, sectionId, year);
      onDone();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <Modal
      title={moving ? 'Move student' : 'Enroll student'}
      subtitle={`${student.name} (${student.id}) in ${year}`}
      size="sm"
      onClose={onClose}
      footer={
        <>
          <button type="button" className="gs-btn gs-btn--light" onClick={onClose}>Cancel</button>
          <button type="submit" form="gs-enroll-form" className="gs-btn gs-btn--primary" disabled={!sectionId}>
            {moving ? 'Move student' : 'Enroll student'}
          </button>
        </>
      }
    >
      <form id="gs-enroll-form" onSubmit={submit}>
        <FormAlert message={error} />
        <Field
          id="gs-f-enroll"
          label="Section"
          hint={!firstEnabled ? 'No section has free seats and open enrollment.' : 'Full sections are disabled.'}
        >
          <select className="form-select" id="gs-f-enroll" value={sectionId} onChange={(e) => setSectionId(e.target.value)}>
            <option value="">Select a section</option>
            {options.map((g) => (
              <optgroup key={g.grade.id} label={g.grade.name}>
                {g.items.map((i) => <option key={i.id} value={i.id} disabled={i.disabled}>{i.label}</option>)}
              </optgroup>
            ))}
          </select>
        </Field>
        {moving && <p className="gs-muted">The previous enrollment is kept in history as moved.</p>}
      </form>
    </Modal>
  );
}

/* ========================================================================== */
/* Cards and detail drawers                                                   */
/* ========================================================================== */

function StatCard({ icon: Icon, label, value, support, tone }) {
  return (
    <article className={`gs-stat gs-stat--${tone}`}>
      <div className="gs-stat-icon"><Icon size={22} /></div>
      <div className="gs-stat-body">
        <p className="gs-stat-label">{label}</p>
        <p className="gs-stat-value">{value}</p>
        <p className="gs-stat-support">{support}</p>
      </div>
    </article>
  );
}

function GradeCard({ grade, stat, onDetails, onManage, menuItems }) {
  const level = occLevel(stat.occupancy);
  return (
    <article className={cx('gs-grade', grade.status === 'archived' && 'is-archived')} style={gradeStyle(grade.number)}>
      <div className="gs-grade-top">
        <div className="gs-grade-number" aria-hidden="true">{grade.number}</div>
        <div className="gs-grade-title">
          <h3>{grade.name}</h3>
          <p>{grade.code}</p>
        </div>
        <StatusBadge status={grade.status} />
        <ActionMenu label={`More actions for ${grade.name}`} icon={MoreVertical} iconOnly items={menuItems} />
      </div>
      <dl className="gs-grade-metrics">
        <div><dt>Sections</dt><dd>{stat.sectionCount}</dd></div>
        <div><dt>Students</dt><dd>{stat.enrolled}</dd></div>
        <div><dt>Capacity</dt><dd>{stat.capacity}</dd></div>
        <div><dt>Seats left</dt><dd>{stat.available}</dd></div>
        <div><dt>Class teachers</dt><dd>{stat.classTeacherCount}</dd></div>
      </dl>
      <div className="gs-grade-occ">
        <div className="gs-occ-row">
          <span>Occupancy</span>
          <strong>{stat.occupancy}%</strong>
          <span className={`gs-level is-${level}`}>{OCC_LABEL[level]}</span>
        </div>
        <OccBar value={stat.occupancy} label={`${grade.name} occupancy`} />
      </div>
      <div className="gs-card-actions">
        <button type="button" className="gs-btn gs-btn--light gs-btn--sm" onClick={onDetails}>
          <Eye size={15} /> View details
        </button>
        <button type="button" className="gs-btn gs-btn--primary gs-btn--sm" onClick={onManage}>
          <Layers size={15} /> Manage sections
        </button>
      </div>
    </article>
  );
}

function SectionCard({ section, grade, stat, room, teacher, selected, onSelect, onDetails, onEnrollment, menuItems }) {
  const level = occLevel(stat.occupancy);
  return (
    <article className={cx('gs-section', selected && 'is-selected', section.status === 'archived' && 'is-archived')}>
      <div className="gs-section-top">
        <input
          type="checkbox"
          className="form-check-input"
          checked={selected}
          onChange={onSelect}
          aria-label={`Select ${grade?.name || ''} Section ${section.name}`}
        />
        <div className="gs-section-name" style={gradeStyle(grade?.number || 1)}>{section.name}</div>
        <div className="gs-section-title">
          <h4>Section {section.name}</h4>
          <p>{section.id} &middot; {section.code}</p>
        </div>
        <StatusBadge status={section.status} />
        <ActionMenu label={`More actions for ${grade?.name || ''} Section ${section.name}`} icon={MoreVertical} iconOnly items={menuItems} />
      </div>
      <ul className="gs-section-facts">
        <li><DoorOpen size={14} /> {room ? `${room.name}, ${room.building}` : <em>No classroom</em>}</li>
        <li><UserCheck size={14} /> {teacher ? teacher.name : <em>No class teacher</em>}</li>
        <li><CalendarDays size={14} /> {section.academicYear}</li>
      </ul>
      <div className="gs-grade-occ">
        <div className="gs-occ-row">
          <span>{stat.enrolled} of {stat.capacity} seats</span>
          <strong>{stat.occupancy}%</strong>
          <span className={`gs-level is-${level}`}>{stat.available} left</span>
        </div>
        <OccBar value={stat.occupancy} label={`${grade?.name || ''} Section ${section.name} occupancy`} />
      </div>
      <div className="gs-card-actions">
        <button type="button" className="gs-btn gs-btn--light gs-btn--sm" onClick={onDetails}>
          <Eye size={15} /> Details
        </button>
        <button type="button" className="gs-btn gs-btn--primary gs-btn--sm" onClick={onEnrollment}>
          <Users size={15} /> Manage enrollment
        </button>
      </div>
    </article>
  );
}

function InfoPanel({ title, icon: Icon, children }) {
  return (
    <section className="gs-panel">
      <h3><Icon size={16} /> {title}</h3>
      {children}
    </section>
  );
}

function GradeDetail({ grade, stat, sections, stats, teacherMap, roomMap, onClose, onAddSection, onEdit, onOpenSection, onManage }) {
  return (
    <Modal
      variant="drawer"
      title={grade.name}
      subtitle={`${grade.code} - ${grade.academicYear}`}
      onClose={onClose}
      footer={
        <>
          <button type="button" className="gs-btn gs-btn--light" onClick={onEdit}><Pencil size={15} /> Edit grade</button>
          <button type="button" className="gs-btn gs-btn--light" onClick={onAddSection}><Plus size={15} /> Add section</button>
          <button type="button" className="gs-btn gs-btn--primary" onClick={onManage}><Layers size={15} /> Manage sections</button>
        </>
      }
    >
      <InfoPanel title="Overview" icon={GraduationCap}>
        <dl className="gs-kv">
          <div><dt>Status</dt><dd><StatusBadge status={grade.status} /></dd></div>
          <div><dt>Sections</dt><dd>{stat.sectionCount}</dd></div>
          <div><dt>Class teachers</dt><dd>{stat.classTeacherCount}</dd></div>
          <div><dt>Classrooms</dt><dd>{stat.classroomCount}</dd></div>
        </dl>
        {grade.description && <p className="gs-muted">{grade.description}</p>}
        {grade.notes && <p className="gs-muted">Notes: {grade.notes}</p>}
      </InfoPanel>
      <InfoPanel title="Capacity" icon={Gauge}>
        <dl className="gs-kv">
          <div><dt>Enrolled</dt><dd>{stat.enrolled}</dd></div>
          <div><dt>Capacity</dt><dd>{stat.capacity}</dd></div>
          <div><dt>Available</dt><dd>{stat.available}</dd></div>
          <div><dt>Occupancy</dt><dd>{stat.occupancy}%</dd></div>
        </dl>
        <OccBar value={stat.occupancy} label={`${grade.name} occupancy`} />
      </InfoPanel>
      <InfoPanel title="Sections" icon={Layers}>
        {sections.length === 0 ? (
          <p className="gs-muted">No sections yet. Add the first one to start enrolling students.</p>
        ) : (
          <ul className="gs-rows">
            {sections.map((s) => (
              <li key={s.id}>
                <div>
                  <strong>Section {s.name}</strong>
                  <span>{roomMap.get(s.classroomId)?.name || 'No classroom'} &middot; {teacherMap.get(s.classTeacherId)?.name || 'No class teacher'}</span>
                </div>
                <span className="gs-rows-num">{stats.sections[s.id].enrolled}/{s.capacity}</span>
                <StatusBadge status={s.status} />
                <button type="button" className="gs-btn gs-btn--light gs-btn--sm" onClick={() => onOpenSection(s.id)}>Open</button>
              </li>
            ))}
          </ul>
        )}
      </InfoPanel>
    </Modal>
  );
}

function SectionDetail({ section, grade, version, room, teacher, assistant, onClose, onEdit, onEnrollment }) {
  const detail = useMemo(() => getSectionStatistics(section.id), [section.id, version]);
  const students = detail?.students || [];
  return (
    <Modal
      variant="drawer"
      title={`${grade?.name || 'Grade'} Section ${section.name}`}
      subtitle={`${section.id} - ${section.code}`}
      onClose={onClose}
      footer={
        <>
          <button type="button" className="gs-btn gs-btn--light" onClick={onEdit}><Pencil size={15} /> Edit section</button>
          <button type="button" className="gs-btn gs-btn--primary" onClick={onEnrollment}><Users size={15} /> Manage enrollment</button>
        </>
      }
    >
      <InfoPanel title="Section overview" icon={Layers}>
        <dl className="gs-kv">
          <div><dt>Grade</dt><dd>{grade?.name}</dd></div>
          <div><dt>Academic year</dt><dd>{section.academicYear}</dd></div>
          <div><dt>Status</dt><dd><StatusBadge status={section.status} /></dd></div>
          <div><dt>Enrollment</dt><dd>{section.enrollmentOpen ? 'Open' : 'Closed'}</dd></div>
        </dl>
        {section.notes && <p className="gs-muted">Notes: {section.notes}</p>}
      </InfoPanel>
      <InfoPanel title="Capacity" icon={Gauge}>
        <dl className="gs-kv">
          <div><dt>Capacity</dt><dd>{detail?.capacity ?? section.capacity}</dd></div>
          <div><dt>Enrolled</dt><dd>{detail?.enrolled ?? 0}</dd></div>
          <div><dt>Available</dt><dd>{detail?.available ?? 0}</dd></div>
          <div><dt>Occupancy</dt><dd>{detail?.occupancy ?? 0}%</dd></div>
        </dl>
        <OccBar value={detail?.occupancy ?? 0} label="Section occupancy" />
      </InfoPanel>
      <InfoPanel title="Classroom" icon={Building2}>
        {room ? (
          <dl className="gs-kv">
            <div><dt>Room</dt><dd>{room.name}</dd></div>
            <div><dt>Building</dt><dd>{room.building}</dd></div>
            <div><dt>Floor</dt><dd>{floorLabel(room.floor)}</dd></div>
            <div><dt>Type</dt><dd>{room.type}</dd></div>
          </dl>
        ) : (
          <p className="gs-muted">No classroom assigned.</p>
        )}
      </InfoPanel>
      <InfoPanel title="Teachers" icon={UserCheck}>
        <dl className="gs-kv gs-kv--wide">
          <div>
            <dt>Class teacher</dt>
            <dd>{teacher ? teacher.name : 'Not assigned'}</dd>
            {teacher && <dd className="gs-muted">{[teacher.phone, teacher.email].filter(Boolean).join(' - ')}</dd>}
          </div>
          <div>
            <dt>Assistant teacher</dt>
            <dd>{assistant ? assistant.name : 'Not assigned'}</dd>
            {assistant && <dd className="gs-muted">{[assistant.phone, assistant.email].filter(Boolean).join(' - ')}</dd>}
          </div>
        </dl>
      </InfoPanel>
      <InfoPanel title={`Students (${students.length})`} icon={Users}>
        {students.length === 0 ? (
          <p className="gs-muted">No students are enrolled in this section.</p>
        ) : (
          <div className="gs-table-wrap gs-table-wrap--tall">
            <table className="table gs-table">
              <thead>
                <tr><th scope="col">Student ID</th><th scope="col">Name</th><th scope="col">Gender</th><th scope="col">Enrolled</th><th scope="col">Status</th></tr>
              </thead>
              <tbody>
                {students.map((s) => (
                  <tr key={s.enrollmentId}>
                    <td>{s.studentId}</td>
                    <td>{s.name}</td>
                    <td>{s.gender || '-'}</td>
                    <td>{fmtDate(s.enrolledAt)}</td>
                    <td><span className="gs-badge gs-badge--active">{s.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </InfoPanel>
    </Modal>
  );
}

/* ========================================================================== */
/* Tabs                                                                       */
/* ========================================================================== */

const PAGE = 50;

function EnrollmentTab({ year, version, grades, sections, gradeMap, stats, focus, setFocus, onEnroll, onMove, onRemove, yearLocked }) {
  const [q, setQ] = useState('');
  const [enrolledLimit, setEnrolledLimit] = useState(PAGE);
  const [openLimit, setOpenLimit] = useState(PAGE);

  const rows = useMemo(() => getEnrollmentRows(year), [year, version]);
  const unenrolled = useMemo(() => getUnenrolledStudents(year), [year, version]);
  const sectionsOfGrade = sections.filter((s) => !focus.gradeId || s.gradeId === focus.gradeId);
  const focusSection = sections.find((s) => s.id === focus.sectionId);
  const focusStat = focusSection ? stats.sections[focusSection.id] : null;
  const term = q.trim().toLowerCase();

  const enrolledRows = useMemo(
    () =>
      rows
        .filter((r) => (!focus.gradeId || r.gradeId === focus.gradeId) && (!focus.sectionId || r.sectionId === focus.sectionId))
        .filter((r) => !term || `${r.studentName} ${r.studentId}`.toLowerCase().includes(term))
        .sort((a, b) => a.gradeNumber - b.gradeNumber || a.sectionName.localeCompare(b.sectionName) || a.studentName.localeCompare(b.studentName)),
    [rows, focus, term]
  );

  const gradeNumber = focus.gradeId ? gradeMap.get(focus.gradeId)?.number : null;
  const openRows = useMemo(
    () =>
      unenrolled
        .filter((s) => !gradeNumber || s.gradeLevel === gradeNumber)
        .filter((s) => !term || `${s.name} ${s.id}`.toLowerCase().includes(term))
        .sort((a, b) => a.name.localeCompare(b.name)),
    [unenrolled, gradeNumber, term]
  );

  useEffect(() => {
    setEnrolledLimit(PAGE);
    setOpenLimit(PAGE);
  }, [focus, term]);

  return (
    <div>
      <div className="gs-toolbar gs-toolbar--inline">
        <div className="gs-search">
          <Search size={16} aria-hidden="true" />
          <input
            type="search"
            className="form-control"
            placeholder="Search students by name or ID"
            aria-label="Search students by name or ID"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>
        <select
          className="form-select"
          aria-label="Filter by grade"
          value={focus.gradeId}
          onChange={(e) => setFocus({ gradeId: e.target.value, sectionId: '' })}
        >
          <option value="">All grades</option>
          {grades.map((g) => <option key={g.id} value={g.id}>{g.name}</option>)}
        </select>
        <select
          className="form-select"
          aria-label="Filter by section"
          value={focus.sectionId}
          onChange={(e) => setFocus((f) => ({ ...f, sectionId: e.target.value }))}
        >
          <option value="">All sections</option>
          {sectionsOfGrade.map((s) => <option key={s.id} value={s.id}>{sectionTitle(s, gradeMap)}</option>)}
        </select>
      </div>

      {focusSection && focusStat && (
        <div className="gs-focus" aria-live="polite">
          <div>
            <strong>{sectionTitle(focusSection, gradeMap)}</strong>
            <span>{focusStat.enrolled} of {focusStat.capacity} seats used, {focusStat.available} left</span>
          </div>
          <OccBar value={focusStat.occupancy} label="Selected section occupancy" />
        </div>
      )}

      <div className="row g-3">
        <div className="col-xl-7">
          <section className="gs-panel">
            <h3><Users size={16} /> Enrolled students ({enrolledRows.length})</h3>
            {enrolledRows.length === 0 ? (
              <p className="gs-muted">No enrolled students match these filters.</p>
            ) : (
              <div className="gs-table-wrap gs-table-wrap--tall">
                <table className="table gs-table">
                  <thead>
                    <tr><th scope="col">Student</th><th scope="col">Section</th><th scope="col">Enrolled</th><th scope="col"><span className="visually-hidden">Actions</span></th></tr>
                  </thead>
                  <tbody>
                    {enrolledRows.slice(0, enrolledLimit).map((r) => (
                      <tr key={r.enrollmentId}>
                        <td><strong>{r.studentName}</strong><div className="gs-muted">{r.studentId}</div></td>
                        <td>{r.gradeName} {r.sectionName}</td>
                        <td>{fmtDate(r.enrolledAt)}</td>
                        <td className="gs-actions-cell">
                          <button type="button" className="gs-btn gs-btn--light gs-btn--sm" disabled={yearLocked} onClick={() => onMove(r)}>
                            <ArrowRightLeft size={14} /> Move
                          </button>
                          <button type="button" className="gs-btn gs-btn--ghost-danger gs-btn--sm" disabled={yearLocked} onClick={() => onRemove(r)}>
                            <X size={14} /> Remove
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            {enrolledRows.length > enrolledLimit && (
              <button type="button" className="gs-btn gs-btn--light gs-btn--sm" onClick={() => setEnrolledLimit((n) => n + PAGE)}>
                Show more ({enrolledRows.length - enrolledLimit} left)
              </button>
            )}
          </section>
        </div>
        <div className="col-xl-5">
          <section className="gs-panel">
            <h3><UserPlus size={16} /> Not enrolled this year ({openRows.length})</h3>
            {openRows.length === 0 ? (
              <p className="gs-muted">Every matching student already has a section for {year}.</p>
            ) : (
              <ul className="gs-rows gs-rows--tall">
                {openRows.slice(0, openLimit).map((s) => (
                  <li key={s.id}>
                    <div>
                      <strong>{s.name}</strong>
                      <span>{s.id}{s.gradeLevel ? ` - Grade ${s.gradeLevel} intake` : ''}</span>
                    </div>
                    <button type="button" className="gs-btn gs-btn--primary gs-btn--sm" disabled={yearLocked} onClick={() => onEnroll(s)}>
                      <UserPlus size={14} /> Assign
                    </button>
                  </li>
                ))}
              </ul>
            )}
            {openRows.length > openLimit && (
              <button type="button" className="gs-btn gs-btn--light gs-btn--sm" onClick={() => setOpenLimit((n) => n + PAGE)}>
                Show more ({openRows.length - openLimit} left)
              </button>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}

function ClassroomsTab({ classrooms, sections, gradeMap, onAdd, onEdit }) {
  const [q, setQ] = useState('');
  const [type, setType] = useState('');
  const usedBy = useMemo(() => {
    const m = new Map();
    sections.filter((s) => s.status === 'active' && s.classroomId).forEach((s) => m.set(s.classroomId, s));
    return m;
  }, [sections]);
  const term = q.trim().toLowerCase();
  const list = classrooms
    .filter((r) => (!type || r.type === type) && (!term || `${r.name} ${r.building} ${r.id}`.toLowerCase().includes(term)))
    .sort((a, b) => a.id.localeCompare(b.id));

  return (
    <div>
      <div className="gs-toolbar gs-toolbar--inline">
        <div className="gs-search">
          <Search size={16} aria-hidden="true" />
          <input type="search" className="form-control" placeholder="Search rooms" aria-label="Search rooms" value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
        <select className="form-select" aria-label="Filter by room type" value={type} onChange={(e) => setType(e.target.value)}>
          <option value="">All room types</option>
          {ROOM_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
        </select>
        <button type="button" className="gs-btn gs-btn--primary" onClick={onAdd}><Plus size={16} /> Add classroom</button>
      </div>
      {list.length === 0 ? (
        <EmptyState icon={DoorOpen} title="No classrooms found" text="Add a classroom or clear the search to see all rooms." />
      ) : (
        <div className="gs-table-wrap">
          <table className="table gs-table gs-table--rooms">
            <thead>
              <tr>
                <th scope="col">Room</th><th scope="col">Location</th><th scope="col">Type</th>
                <th scope="col">Capacity</th><th scope="col">Availability</th><th scope="col">Assigned to</th>
                <th scope="col"><span className="visually-hidden">Actions</span></th>
              </tr>
            </thead>
            <tbody>
              {list.map((r) => {
                const sec = usedBy.get(r.id);
                const state = r.availability === 'maintenance' ? 'maintenance' : sec ? 'in use' : 'available';
                return (
                  <tr key={r.id}>
                    <td><strong>{r.name}</strong><div className="gs-muted">{r.id}</div></td>
                    <td>{r.building}, {floorLabel(r.floor)}</td>
                    <td>{r.type}</td>
                    <td>{r.capacity}</td>
                    <td><span className={`gs-badge gs-badge--room-${state.replace(' ', '-')}`}>{state}</span></td>
                    <td>{sec ? sectionTitle(sec, gradeMap) : <span className="gs-muted">Not assigned</span>}</td>
                    <td className="gs-actions-cell">
                      <button type="button" className="gs-btn gs-btn--light gs-btn--sm" onClick={() => onEdit(r)}>
                        <Pencil size={14} /> Edit
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function YearsTab({ years, grades, sections, onAdd, onActivate, onArchive, onRestore, onCopy }) {
  return (
    <div>
      <div className="gs-toolbar gs-toolbar--inline">
        <p className="gs-muted gs-grow">Changing the active year never copies or deletes grades, sections or enrollments.</p>
        <button type="button" className="gs-btn gs-btn--primary" onClick={onAdd}><Plus size={16} /> Add academic year</button>
      </div>
      <div className="gs-years">
        {years.map((y) => {
          const g = grades.filter((x) => x.academicYear === y.name).length;
          const s = sections.filter((x) => x.academicYear === y.name).length;
          return (
            <article key={y.id} className={cx('gs-year', y.status === 'active' && 'is-active')}>
              <div className="gs-year-head">
                <h3>{y.name}</h3>
                <span className={`gs-badge gs-badge--year-${y.status}`}>{y.status}</span>
              </div>
              <p className="gs-muted">{g} grades, {s} sections</p>
              <div className="gs-card-actions">
                {y.status !== 'archived' && y.status !== 'active' && (
                  <button type="button" className="gs-btn gs-btn--primary gs-btn--sm" onClick={() => onActivate(y)}>
                    <Check size={14} /> Set active
                  </button>
                )}
                {y.status !== 'archived' && (
                  <button type="button" className="gs-btn gs-btn--light gs-btn--sm" onClick={() => onCopy(y)}>
                    <Copy size={14} /> Copy structure
                  </button>
                )}
                {y.status === 'inactive' && (
                  <button type="button" className="gs-btn gs-btn--light gs-btn--sm" onClick={() => onArchive(y)}>
                    <Archive size={14} /> Archive
                  </button>
                )}
                {y.status === 'archived' && (
                  <button type="button" className="gs-btn gs-btn--light gs-btn--sm" onClick={() => onRestore(y)}>
                    <ArchiveRestore size={14} /> Restore
                  </button>
                )}
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}

/* ========================================================================== */
/* Page                                                                       */
/* ========================================================================== */

const TABS = [
  { id: 'grades', label: 'Grades', icon: GraduationCap },
  { id: 'sections', label: 'Sections', icon: Layers },
  { id: 'enrollment', label: 'Enrollment', icon: Users },
  { id: 'classrooms', label: 'Classrooms', icon: DoorOpen },
  { id: 'years', label: 'Academic years', icon: CalendarDays },
];

export default function GradesSections() {
  const [version, setVersion] = useState(0);
  const [snap, setSnap] = useState(null);
  const [loadError, setLoadError] = useState('');
  const [year, setYear] = useState('');
  const [tab, setTab] = useState('grades');
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [sort, setSort] = useState({ key: 'grade', dir: 'asc' });
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [selected, setSelected] = useState([]);
  const [enrollFocus, setEnrollFocus] = useState({ gradeId: '', sectionId: '' });
  const [modal, setModal] = useState(null);
  const [toasts, setToasts] = useState([]);

  const refresh = useCallback(() => setVersion((v) => v + 1), []);

  const notify = useCallback((message, type = 'success') => {
    const id = `${Date.now()}-${Math.random()}`;
    setToasts((t) => [...t, { id, message, type }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 6000);
  }, []);

  /* ---- load ---- */
  useEffect(() => {
    try {
      const data = getAcademicSnapshot();
      setSnap(data);
      setLoadError('');
      setYear((current) => {
        if (current && data.years.some((y) => y.name === current)) return current;
        return (data.years.find((y) => y.status === 'active') || data.years[0] || {}).name || '';
      });
    } catch (e) {
      setLoadError(e.message || 'Grades and sections could not be loaded.');
    }
  }, [version]);

  const stats = useMemo(() => (snap ? getAllStats(year) : null), [snap, year]);
  const gradeMap = useMemo(() => new Map((snap?.grades || []).map((g) => [g.id, g])), [snap]);
  const roomMap = useMemo(() => new Map((snap?.classrooms || []).map((r) => [r.id, r])), [snap]);
  const teacherMap = useMemo(() => new Map((snap?.teachers || []).map((t) => [t.id, t])), [snap]);
  const yearObj = snap?.years.find((y) => y.name === year);
  const yearLocked = yearObj?.status === 'archived';

  const gradesY = useMemo(() => (snap ? snap.grades.filter((g) => g.academicYear === year) : []), [snap, year]);
  const sectionsY = useMemo(() => (snap ? snap.sections.filter((s) => s.academicYear === year) : []), [snap, year]);

  useEffect(() => {
    setSelected((cur) => cur.filter((id) => sectionsY.some((s) => s.id === id)));
  }, [sectionsY]);

  useEffect(() => {
    if (tab === 'grades' && filters.status === 'inactive') setFilters((f) => ({ ...f, status: '' }));
  }, [tab, filters.status]);

  /* ---- filtering and sorting ---- */
  const q = filters.q.trim().toLowerCase();
  const dir = sort.dir === 'asc' ? 1 : -1;

  const filteredSections = useMemo(() => {
    if (!stats) return [];
    const list = sectionsY.filter((s) => {
      const st = stats.sections[s.id];
      if (filters.gradeId && s.gradeId !== filters.gradeId) return false;
      if (filters.status && s.status !== filters.status) return false;
      if (filters.classroomId && s.classroomId !== filters.classroomId) return false;
      if (filters.teacherId && s.classTeacherId !== filters.teacherId && s.assistantTeacherId !== filters.teacherId) return false;
      if (filters.occupancy && occLevel(st.occupancy) !== filters.occupancy) return false;
      if (q) {
        const hay = [s.name, s.code, s.id, gradeMap.get(s.gradeId)?.name, roomMap.get(s.classroomId)?.name, teacherMap.get(s.classTeacherId)?.name]
          .join(' ')
          .toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
    const value = (s) => {
      const st = stats.sections[s.id];
      if (sort.key === 'enrollment') return st.enrolled;
      if (sort.key === 'capacity') return st.capacity;
      if (sort.key === 'occupancy') return st.occupancy;
      return 0;
    };
    return list.sort((a, b) => (sort.key === 'grade' ? a.name.localeCompare(b.name) * dir : (value(a) - value(b)) * dir));
  }, [sectionsY, stats, filters, q, sort, dir, gradeMap, roomMap, teacherMap]);

  const sectionFilterActive = !!(filters.classroomId || filters.teacherId || filters.occupancy || filters.status === 'inactive');

  const filteredGrades = useMemo(() => {
    if (!stats) return [];
    const list = gradesY.filter((g) => {
      if (filters.gradeId && g.id !== filters.gradeId) return false;
      if (filters.status && filters.status !== 'inactive' && g.status !== filters.status) return false;
      const hasSection = filteredSections.some((s) => s.gradeId === g.id);
      if (sectionFilterActive && !hasSection) return false;
      if (q && !`${g.name} ${g.code} ${g.description}`.toLowerCase().includes(q) && !hasSection) return false;
      return true;
    });
    const value = (g) => {
      const st = stats.grades[g.id];
      if (sort.key === 'enrollment') return st.enrolled;
      if (sort.key === 'capacity') return st.capacity;
      if (sort.key === 'occupancy') return st.occupancy;
      return g.number;
    };
    return list.sort((a, b) => (value(a) - value(b)) * dir);
  }, [gradesY, stats, filters, q, sort, dir, filteredSections, sectionFilterActive]);

  const activeFilterCount = Object.values(filters).filter(Boolean).length;
  const setFilter = (key) => (e) => setFilters((f) => ({ ...f, [key]: e.target.value }));

  const teachersInYear = useMemo(() => {
    const ids = new Set();
    sectionsY.forEach((s) => {
      if (s.classTeacherId) ids.add(s.classTeacherId);
      if (s.assistantTeacherId) ids.add(s.assistantTeacherId);
    });
    return (snap?.teachers || []).filter((t) => ids.has(t.id));
  }, [snap, sectionsY]);

  /* ---- actions ---- */
  const closeModal = () => setModal(null);
  const saved = (message) => {
    setModal(null);
    refresh();
    notify(message);
  };

  const attempt = (fn, successMessage) => {
    try {
      fn();
      refresh();
      if (successMessage) notify(successMessage);
      return true;
    } catch (e) {
      notify(e.message || 'That action could not be completed.', 'error');
      return false;
    }
  };

  const confirm = (config) => setModal({ type: 'confirm', ...config });

  const goEnrollment = (gradeId, sectionId) => {
    setEnrollFocus({ gradeId: gradeId || '', sectionId: sectionId || '' });
    setModal(null);
    setTab('enrollment');
  };

  const goSections = (gradeId) => {
    setFilters({ ...EMPTY_FILTERS, gradeId });
    setModal(null);
    setTab('sections');
  };

  const requestArchiveGrade = (g) => {
    const st = stats.grades[g.id];
    confirm({
      title: `Archive ${g.name}?`,
      message: `${g.name} and its ${st.sectionCount} ${st.sectionCount === 1 ? 'section' : 'sections'} will be archived.`,
      body: 'Students, teachers and enrollment history stay on record. Archived sections stop counting toward live capacity. You can restore the grade later; each section is restored individually.',
      confirmLabel: 'Archive grade',
      onConfirm: () => {
        archiveGrade(g.id);
        saved(`${g.name} archived.`);
      },
    });
  };

  const requestDeleteGrade = (g) => {
    const check = canDeleteGrade(g.id);
    if (!check.ok) {
      confirm({
        title: `${g.name} cannot be deleted`,
        message: check.reason,
        body: 'Deleting would remove records the school still needs. Safe options: archive the grade to keep its history, or move students out and archive its sections first.',
        blocked: true,
        secondary: g.status !== 'archived' ? { label: 'Archive instead', onClick: () => requestArchiveGrade(g) } : null,
      });
      return;
    }
    confirm({
      title: `Delete ${g.name}?`,
      message: `${g.name} has no students and no active sections. This permanently removes it.`,
      confirmLabel: 'Delete grade',
      danger: true,
      onConfirm: () => {
        deleteGrade(g.id);
        saved(`${g.name} deleted.`);
      },
    });
  };

  const requestArchiveSection = (s) =>
    confirm({
      title: `Archive ${sectionTitle(s, gradeMap)}?`,
      message: 'The section stops counting toward live capacity and closes for enrollment.',
      body: 'Enrolled students keep their enrollment records. You can restore the section later if its teacher and room are still free.',
      confirmLabel: 'Archive section',
      onConfirm: () => {
        archiveSection(s.id);
        saved('Section archived.');
      },
    });

  const requestDeleteSection = (s) => {
    const check = canDeleteSection(s.id);
    if (!check.ok) {
      confirm({
        title: `${sectionTitle(s, gradeMap)} cannot be deleted`,
        message: check.reason,
        body: 'Move students to another section from the Enrollment tab, or archive this section to keep its history.',
        blocked: true,
        secondary: s.status !== 'archived' ? { label: 'Archive instead', onClick: () => requestArchiveSection(s) } : null,
      });
      return;
    }
    confirm({
      title: `Delete ${sectionTitle(s, gradeMap)}?`,
      message: 'This section has no enrollment records. This permanently removes it.',
      confirmLabel: 'Delete section',
      danger: true,
      onConfirm: () => {
        deleteSection(s.id);
        saved('Section deleted.');
      },
    });
  };

  const gradeMenu = (g) => [
    { label: 'Add section', icon: Plus, onClick: () => setModal({ type: 'section', prefill: { gradeId: g.id } }), disabled: yearLocked || g.status === 'archived' },
    { label: 'Edit grade', icon: Pencil, onClick: () => setModal({ type: 'grade', grade: g }) },
    { label: 'View students', icon: Users, onClick: () => goEnrollment(g.id, '') },
    { divider: true },
    g.status === 'archived'
      ? { label: 'Restore grade', icon: ArchiveRestore, onClick: () => attempt(() => updateGrade(g.id, { status: 'active' }), `${g.name} restored.`) }
      : { label: 'Archive grade', icon: Archive, onClick: () => requestArchiveGrade(g) },
    { label: 'Delete grade', icon: Trash2, danger: true, onClick: () => requestDeleteGrade(g) },
  ];

  const sectionMenu = (s) => [
    { label: 'Edit section', icon: Pencil, onClick: () => setModal({ type: 'section', section: s }) },
    { label: 'Assign class teacher', icon: UserCheck, onClick: () => setModal({ type: 'assign', kind: 'teacher', section: s }) },
    { label: 'Assign classroom', icon: DoorOpen, onClick: () => setModal({ type: 'assign', kind: 'classroom', section: s }) },
    { label: 'View students', icon: Users, onClick: () => goEnrollment(s.gradeId, s.id) },
    { divider: true },
    s.status === 'archived'
      ? { label: 'Restore section', icon: ArchiveRestore, onClick: () => attempt(() => updateSection(s.id, { status: 'active', enrollmentOpen: true }), 'Section restored.') }
      : { label: 'Archive section', icon: Archive, onClick: () => requestArchiveSection(s) },
    { label: 'Delete section', icon: Trash2, danger: true, onClick: () => requestDeleteSection(s) },
  ];

  /* bulk */
  const toggleSelect = (id) => setSelected((cur) => (cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id]));
  const allVisibleSelected = filteredSections.length > 0 && filteredSections.every((s) => selected.includes(s.id));
  const toggleAllVisible = () =>
    setSelected(allVisibleSelected ? [] : filteredSections.map((s) => s.id));

  const bulkRun = (label, fn, ids) => {
    let ok = 0;
    const problems = [];
    ids.forEach((id) => {
      try {
        fn(id);
        ok += 1;
      } catch (e) {
        problems.push(`${sectionTitle(sectionsY.find((s) => s.id === id) || { gradeId: '', name: id }, gradeMap)}: ${e.message}`);
      }
    });
    refresh();
    if (ok) notify(`${label}: ${ok} ${ok === 1 ? 'section' : 'sections'} updated.`);
    if (problems.length) notify(`${problems.length} skipped. ${problems.slice(0, 2).join(' ')}`, 'error');
    setSelected([]);
  };

  const bulkArchive = () => {
    const ids = selected.filter((id) => sectionsY.find((s) => s.id === id)?.status !== 'archived');
    if (!ids.length) {
      notify('The selected sections are already archived.', 'warning');
      return;
    }
    confirm({
      title: `Archive ${ids.length} ${ids.length === 1 ? 'section' : 'sections'}?`,
      message: 'Archived sections stop counting toward live capacity and close for enrollment.',
      body: 'Enrollment records are kept. Bulk deletion is not available.',
      confirmLabel: 'Archive sections',
      onConfirm: () => {
        setModal(null);
        bulkRun('Archive', (id) => archiveSection(id), ids);
      },
    });
  };

  const bulkStatus = (status) =>
    bulkRun(`Set ${status}`, (id) => updateSection(id, { status }), selected.filter((id) => sectionsY.find((s) => s.id === id)?.status !== 'archived'));

  /* export */
  const runReport = (kind, scope) => {
    try {
      const options = {};
      if (kind === 'grade' && scope === 'filtered') options.gradeIds = filteredGrades.map((g) => g.id);
      if (kind !== 'grade' && scope === 'filtered') options.sectionIds = filteredSections.map((s) => s.id);
      if (scope === 'selected') options.sectionIds = selected;
      const report = generateReport(kind, year, options);
      if (!report.count) {
        notify('There are no records to export for that selection.', 'warning');
        return;
      }
      downloadCsv(report.filename, report.csv);
      notify(`Exported ${report.count} ${report.count === 1 ? 'row' : 'rows'} to ${report.filename}.`);
    } catch (e) {
      notify(e.message || 'The export failed.', 'error');
    }
  };

  const exportItems = [
    { heading: 'Grade report' },
    { label: 'All grades', icon: Download, onClick: () => runReport('grade', 'all') },
    { label: 'Filtered grades', icon: Download, onClick: () => runReport('grade', 'filtered') },
    { divider: true },
    { heading: 'Section report' },
    { label: 'All sections', icon: Download, onClick: () => runReport('section', 'all') },
    { label: 'Filtered sections', icon: Download, onClick: () => runReport('section', 'filtered') },
    { label: `Selected sections (${selected.length})`, icon: Download, disabled: !selected.length, onClick: () => runReport('section', 'selected') },
    { divider: true },
    { heading: 'Enrollment report' },
    { label: 'All enrollments', icon: Download, onClick: () => runReport('enrollment', 'all') },
    { label: 'Filtered sections', icon: Download, onClick: () => runReport('enrollment', 'filtered') },
    { label: `Selected sections (${selected.length})`, icon: Download, disabled: !selected.length, onClick: () => runReport('enrollment', 'selected') },
  ];

  /* ---- render ---- */
  if (loadError) {
    return (
      <div className="gs-page">
        <div className="gs-state">
          <AlertTriangle size={28} />
          <h1>Grades and sections could not load</h1>
          <p>{loadError}</p>
          <button type="button" className="gs-btn gs-btn--primary" onClick={refresh}><RotateCcw size={16} /> Try again</button>
        </div>
      </div>
    );
  }

  if (!snap || !stats) {
    return (
      <div className="gs-page" aria-busy="true">
        <div className="gs-skel gs-skel--hero" />
        <div className="gs-stats">{Array.from({ length: 6 }, (_, i) => <div key={i} className="gs-skel gs-skel--stat" />)}</div>
        <div className="gs-skel gs-skel--block" />
        <span className="visually-hidden">Loading grades and sections</span>
      </div>
    );
  }

  if (!year) {
    return (
      <div className="gs-page">
        <EmptyState
          icon={CalendarDays}
          title="No academic years yet"
          text="Add an academic year before creating grades and sections."
          action={<button type="button" className="gs-btn gs-btn--primary" onClick={() => setModal({ type: 'year' })}><Plus size={16} /> Add academic year</button>}
        />
        {modal?.type === 'year' && (
          <YearForm onClose={closeModal} onSaved={(y) => { saved(`Academic year ${y.name} added.`); setYear(y.name); }} />
        )}
      </div>
    );
  }

  const o = stats.overall;
  const archivedGrades = gradesY.filter((g) => g.status === 'archived').length;
  const statCards = [
    { icon: GraduationCap, label: 'Total grades', value: o.totalGrades, support: archivedGrades ? `${archivedGrades} archived` : `In ${year}`, tone: 'indigo' },
    { icon: Layers, label: 'Total sections', value: o.totalSections, support: `${sectionsY.filter((s) => s.status === 'active').length} active`, tone: 'violet' },
    { icon: Users, label: 'Total students', value: o.totalStudents, support: `${o.unassignedStudents} not yet placed`, tone: 'teal' },
    { icon: Armchair, label: 'Available seats', value: o.availableSeats, support: `of ${o.totalCapacity} total seats`, tone: 'cyan' },
    { icon: DoorOpen, label: 'Classrooms assigned', value: o.classroomsAssigned, support: `${o.sectionsWithoutClassroom} active sections need a room`, tone: 'blue' },
    { icon: Gauge, label: 'Average occupancy', value: `${o.averageOccupancy}%`, support: 'Enrolled students divided by capacity', tone: 'purple' },
  ];

  const sectionGroups = filteredGrades
    .map((g) => ({ grade: g, sections: filteredSections.filter((s) => s.gradeId === g.id) }))
    .filter((grp) => grp.sections.length > 0);

  const showFilters = tab === 'grades' || tab === 'sections';
  const resultLabel =
    tab === 'grades'
      ? `Showing ${filteredGrades.length} of ${gradesY.length} grades`
      : `Showing ${filteredSections.length} of ${sectionsY.length} sections`;

  const modalNode = (() => {
    if (!modal) return null;
    switch (modal.type) {
      case 'grade':
        return (
          <GradeForm
            grade={modal.grade}
            years={snap.years}
            defaultYear={year}
            onClose={closeModal}
            onSaved={(g, editing) => {
              if (g.academicYear !== year) setYear(g.academicYear);
              saved(`${g.name} ${editing ? 'updated' : 'added'}.`);
            }}
          />
        );
      case 'section':
        return (
          <SectionForm
            section={modal.section}
            prefill={modal.prefill}
            snap={snap}
            defaultYear={year}
            enrolled={modal.section ? stats.sections[modal.section.id]?.enrolled || 0 : 0}
            onClose={closeModal}
            onSaved={(s, editing) => {
              if (s.academicYear !== year) setYear(s.academicYear);
              saved(`Section ${s.name} ${editing ? 'updated' : 'added'}.`);
            }}
          />
        );
      case 'assign':
        return (
          <AssignModal
            kind={modal.kind}
            section={modal.section}
            snap={snap}
            onClose={closeModal}
            onSaved={() => saved(modal.kind === 'teacher' ? 'Class teacher updated.' : 'Classroom updated.')}
          />
        );
      case 'gradeDetail': {
        const g = gradeMap.get(modal.id);
        if (!g) return null;
        return (
          <GradeDetail
            grade={g}
            stat={stats.grades[g.id]}
            sections={sectionsY.filter((s) => s.gradeId === g.id)}
            stats={stats}
            teacherMap={teacherMap}
            roomMap={roomMap}
            onClose={closeModal}
            onEdit={() => setModal({ type: 'grade', grade: g })}
            onAddSection={() => setModal({ type: 'section', prefill: { gradeId: g.id } })}
            onManage={() => goSections(g.id)}
            onOpenSection={(id) => setModal({ type: 'sectionDetail', id })}
          />
        );
      }
      case 'sectionDetail': {
        const s = sectionsY.find((x) => x.id === modal.id);
        if (!s) return null;
        return (
          <SectionDetail
            section={s}
            grade={gradeMap.get(s.gradeId)}
            version={version}
            room={roomMap.get(s.classroomId)}
            teacher={teacherMap.get(s.classTeacherId)}
            assistant={teacherMap.get(s.assistantTeacherId)}
            onClose={closeModal}
            onEdit={() => setModal({ type: 'section', section: s })}
            onEnrollment={() => goEnrollment(s.gradeId, s.id)}
          />
        );
      }
      case 'enroll':
        return (
          <EnrollModal
            mode={modal.mode}
            student={modal.student}
            currentSectionId={modal.currentSectionId}
            year={year}
            sections={sectionsY}
            gradeMap={gradeMap}
            stats={stats}
            preferredSectionId={enrollFocus.sectionId}
            onClose={closeModal}
            onDone={() => saved(modal.mode === 'move' ? 'Student moved.' : 'Student enrolled.')}
          />
        );
      case 'classroom':
        return (
          <ClassroomForm
            room={modal.room}
            onClose={closeModal}
            onSaved={(r, editing) => saved(`${r.name} ${editing ? 'updated' : 'added'}.`)}
          />
        );
      case 'year':
        return <YearForm onClose={closeModal} onSaved={(y) => saved(`Academic year ${y.name} added.`)} />;
      case 'copy':
        return (
          <CopyStructureModal
            years={snap.years}
            initialFrom={modal.from}
            onClose={closeModal}
            onDone={(r) => {
              saved(`Created ${r.createdGrades} grades and ${r.createdSections} sections.`);
            }}
          />
        );
      case 'confirm':
        return (
          <ConfirmDialog
            title={modal.title}
            message={modal.message}
            confirmLabel={modal.confirmLabel}
            danger={modal.danger}
            blocked={modal.blocked}
            secondary={modal.secondary}
            onConfirm={modal.onConfirm}
            onClose={closeModal}
          >
            {modal.body && <p className="gs-muted">{modal.body}</p>}
          </ConfirmDialog>
        );
      default:
        return null;
    }
  })();

  return (
    <div className="gs-page">
      <div className="gs-bg-shapes" aria-hidden="true" />

      <header className="gs-hero">
        <div className="gs-hero-main">
          <nav aria-label="Breadcrumb">
            <ol className="gs-crumbs">
              <li>Dashboard</li>
              <li>Academic Management</li>
              <li aria-current="page">Grades &amp; Sections</li>
            </ol>
          </nav>
          <h1>Grades &amp; Sections</h1>
          <p>Organize academic grades, sections, classrooms, and student capacity.</p>
        </div>
        <div className="gs-hero-tools">
          <div className="gs-year-select">
            <label htmlFor="gs-year"><CalendarDays size={15} /> Academic year</label>
            <select id="gs-year" className="form-select" value={year} onChange={(e) => setYear(e.target.value)}>
              {snap.years.map((y) => (
                <option key={y.id} value={y.name}>{y.name}{y.status === 'active' ? ' (active)' : y.status === 'archived' ? ' (archived)' : ''}</option>
              ))}
            </select>
          </div>
          <div className="gs-hero-buttons">
            <button type="button" className="gs-btn gs-btn--glass" disabled={yearLocked} onClick={() => setModal({ type: 'grade' })}>
              <Plus size={16} /> Add new grade
            </button>
            <button type="button" className="gs-btn gs-btn--glass" disabled={yearLocked} onClick={() => setModal({ type: 'section' })}>
              <Plus size={16} /> Add new section
            </button>
            <ActionMenu label="Export" icon={Download} variant="glass" items={exportItems} />
          </div>
        </div>
      </header>

      {snap.demo && (
        <div className="gs-notice" role="note">
          <Info size={16} />
          <span>
            You are viewing demonstration data stored in this browser (localStorage). Students and teachers come from a demo registry until you connect your real records.
          </span>
        </div>
      )}
      {yearLocked && (
        <div className="gs-notice gs-notice--warn" role="note">
          <Archive size={16} />
          <span>{year} is archived. You can browse and export it, but changes are disabled. Restore it from the Academic years tab to edit.</span>
        </div>
      )}

      <section className="gs-stats" aria-label="Academic overview">
        {statCards.map((c, i) => (
          <div key={c.label} style={{ '--gs-i': i }} className="gs-stat-wrap">
            <StatCard {...c} />
          </div>
        ))}
      </section>

      <nav className="gs-tabs" aria-label="Grades and sections views">
        {TABS.map((t) => {
          const TabIcon = t.icon;
          return (
            <button
              key={t.id}
              type="button"
              className={cx('gs-tab', tab === t.id && 'is-active')}
              aria-current={tab === t.id ? 'page' : undefined}
              onClick={() => setTab(t.id)}
            >
              <TabIcon size={16} /> {t.label}
            </button>
          );
        })}
      </nav>

      {showFilters && (
        <section className="gs-filters" aria-label="Search and filters">
          <div className="gs-filters-top">
            <div className="gs-search">
              <Search size={16} aria-hidden="true" />
              <input
                type="search"
                className="form-control"
                placeholder={tab === 'grades' ? 'Search grades' : 'Search sections, rooms or teachers'}
                aria-label="Search"
                value={filters.q}
                onChange={setFilter('q')}
              />
            </div>
            <button
              type="button"
              className="gs-btn gs-btn--light gs-filters-toggle"
              aria-expanded={filtersOpen}
              aria-controls="gs-filter-body"
              onClick={() => setFiltersOpen((v) => !v)}
            >
              <SlidersHorizontal size={16} /> Filters{activeFilterCount ? ` (${activeFilterCount})` : ''}
            </button>
          </div>
          <div id="gs-filter-body" className={cx('gs-filters-body', filtersOpen && 'is-open')}>
            <select className="form-select" aria-label="Filter by grade" value={filters.gradeId} onChange={setFilter('gradeId')}>
              <option value="">All grades</option>
              {gradesY.slice().sort((a, b) => a.number - b.number).map((g) => <option key={g.id} value={g.id}>{g.name}</option>)}
            </select>
            <select className="form-select" aria-label="Filter by status" value={filters.status} onChange={setFilter('status')}>
              <option value="">Any status</option>
              <option value="active">Active</option>
              {tab === 'sections' && <option value="inactive">Inactive</option>}
              <option value="archived">Archived</option>
            </select>
            <select className="form-select" aria-label="Filter by classroom" value={filters.classroomId} onChange={setFilter('classroomId')}>
              <option value="">Any classroom</option>
              {snap.classrooms.map((r) => <option key={r.id} value={r.id}>{r.name}, {r.building}</option>)}
            </select>
            <select className="form-select" aria-label="Filter by class teacher" value={filters.teacherId} onChange={setFilter('teacherId')}>
              <option value="">Any teacher</option>
              {teachersInYear.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
            <select className="form-select" aria-label="Filter by occupancy" value={filters.occupancy} onChange={setFilter('occupancy')}>
              <option value="">Any occupancy</option>
              <option value="low">Open (under 50%)</option>
              <option value="medium">Filling (50 to 84%)</option>
              <option value="high">Nearly full (85 to 99%)</option>
              <option value="full">Full (100%)</option>
            </select>
            <div className="gs-sort">
              <select className="form-select" aria-label="Sort by" value={sort.key} onChange={(e) => setSort((s) => ({ ...s, key: e.target.value }))}>
                <option value="grade">Sort: Grade</option>
                <option value="enrollment">Sort: Enrollment</option>
                <option value="capacity">Sort: Capacity</option>
                <option value="occupancy">Sort: Occupancy</option>
              </select>
              <button
                type="button"
                className="gs-btn gs-btn--light gs-btn--icon-sq"
                onClick={() => setSort((s) => ({ ...s, dir: s.dir === 'asc' ? 'desc' : 'asc' }))}
                aria-label={`Sort direction: ${sort.dir === 'asc' ? 'ascending' : 'descending'}. Activate to reverse.`}
              >
                <ArrowRightLeft size={16} style={{ transform: 'rotate(90deg)' }} />
                <span>{sort.dir === 'asc' ? 'Asc' : 'Desc'}</span>
              </button>
            </div>
          </div>
          <div className="gs-filters-foot" aria-live="polite">
            <span>{resultLabel}</span>
            {activeFilterCount > 0 && (
              <button type="button" className="gs-link" onClick={() => setFilters(EMPTY_FILTERS)}>
                <RotateCcw size={14} /> Clear all filters
              </button>
            )}
          </div>
        </section>
      )}

      <main className="gs-content">
        {tab === 'grades' && (
          filteredGrades.length === 0 ? (
            <EmptyState
              icon={GraduationCap}
              title={gradesY.length ? 'No grades match these filters' : `No grades in ${year} yet`}
              text={gradesY.length ? 'Clear a filter or change the search to see more grades.' : 'Add a grade, or copy the structure of another year from the Academic years tab.'}
              action={
                gradesY.length ? (
                  <button type="button" className="gs-btn gs-btn--light" onClick={() => setFilters(EMPTY_FILTERS)}>Clear filters</button>
                ) : (
                  <button type="button" className="gs-btn gs-btn--primary" disabled={yearLocked} onClick={() => setModal({ type: 'grade' })}><Plus size={16} /> Add grade</button>
                )
              }
            />
          ) : (
            <div className="gs-grid">
              {filteredGrades.map((g) => (
                <GradeCard
                  key={g.id}
                  grade={g}
                  stat={stats.grades[g.id]}
                  onDetails={() => setModal({ type: 'gradeDetail', id: g.id })}
                  onManage={() => goSections(g.id)}
                  menuItems={gradeMenu(g)}
                />
              ))}
            </div>
          )
        )}

        {tab === 'sections' && (
          <>
            {selected.length > 0 && (
              <div className="gs-bulk" role="region" aria-label="Bulk actions">
                <strong>{selected.length} selected</strong>
                <button type="button" className="gs-btn gs-btn--light gs-btn--sm" onClick={bulkArchive} disabled={yearLocked}><Archive size={14} /> Archive</button>
                <ActionMenu
                  label="Set status"
                  icon={Check}
                  items={[
                    { label: 'Set active', onClick: () => bulkStatus('active'), disabled: yearLocked },
                    { label: 'Set inactive', onClick: () => bulkStatus('inactive'), disabled: yearLocked },
                  ]}
                />
                <button type="button" className="gs-btn gs-btn--light gs-btn--sm" onClick={() => runReport('section', 'selected')}><Download size={14} /> Export</button>
                <button type="button" className="gs-btn gs-btn--light gs-btn--sm" onClick={() => setSelected([])}><X size={14} /> Clear selection</button>
              </div>
            )}
            {filteredSections.length > 0 && (
              <label className="gs-selectall">
                <input type="checkbox" className="form-check-input" checked={allVisibleSelected} onChange={toggleAllVisible} />
                Select all {filteredSections.length} visible sections
              </label>
            )}
            {sectionGroups.length === 0 ? (
              <EmptyState
                icon={Layers}
                title={sectionsY.length ? 'No sections match these filters' : `No sections in ${year} yet`}
                text={sectionsY.length ? 'Clear a filter or change the search to see more sections.' : 'Add a section under a grade to start assigning teachers, rooms and students.'}
                action={
                  sectionsY.length ? (
                    <button type="button" className="gs-btn gs-btn--light" onClick={() => setFilters(EMPTY_FILTERS)}>Clear filters</button>
                  ) : (
                    <button type="button" className="gs-btn gs-btn--primary" disabled={yearLocked || gradesY.length === 0} onClick={() => setModal({ type: 'section' })}><Plus size={16} /> Add section</button>
                  )
                }
              />
            ) : (
              sectionGroups.map(({ grade, sections }) => (
                <section key={grade.id} className="gs-group" aria-label={grade.name}>
                  <div className="gs-group-head" style={gradeStyle(grade.number)}>
                    <h3>{grade.name}</h3>
                    <span>{sections.length} {sections.length === 1 ? 'section' : 'sections'}</span>
                    <button type="button" className="gs-btn gs-btn--light gs-btn--sm" disabled={yearLocked || grade.status === 'archived'} onClick={() => setModal({ type: 'section', prefill: { gradeId: grade.id } })}>
                      <Plus size={14} /> Add section
                    </button>
                  </div>
                  <div className="gs-grid gs-grid--sections">
                    {sections.map((s) => (
                      <SectionCard
                        key={s.id}
                        section={s}
                        grade={grade}
                        stat={stats.sections[s.id]}
                        room={roomMap.get(s.classroomId)}
                        teacher={teacherMap.get(s.classTeacherId)}
                        selected={selected.includes(s.id)}
                        onSelect={() => toggleSelect(s.id)}
                        onDetails={() => setModal({ type: 'sectionDetail', id: s.id })}
                        onEnrollment={() => goEnrollment(s.gradeId, s.id)}
                        menuItems={sectionMenu(s)}
                      />
                    ))}
                  </div>
                </section>
              ))
            )}
          </>
        )}

        {tab === 'enrollment' && (
          <EnrollmentTab
            year={year}
            version={version}
            grades={gradesY.slice().sort((a, b) => a.number - b.number)}
            sections={sectionsY}
            gradeMap={gradeMap}
            stats={stats}
            focus={enrollFocus}
            setFocus={setEnrollFocus}
            yearLocked={yearLocked}
            onEnroll={(student) => setModal({ type: 'enroll', mode: 'enroll', student })}
            onMove={(row) =>
              setModal({ type: 'enroll', mode: 'move', student: { id: row.studentId, name: row.studentName }, currentSectionId: row.sectionId })
            }
            onRemove={(row) =>
              confirm({
                title: 'Remove from section?',
                message: `${row.studentName} will no longer be enrolled in ${row.gradeName} Section ${row.sectionName} for ${year}.`,
                body: 'The student record is not deleted. This enrollment stays in history as removed, and the seat becomes available.',
                confirmLabel: 'Remove student',
                danger: true,
                onConfirm: () => {
                  removeStudentFromSection(row.studentId, year);
                  saved(`${row.studentName} removed from the section.`);
                },
              })
            }
          />
        )}

        {tab === 'classrooms' && (
          <ClassroomsTab
            classrooms={snap.classrooms}
            sections={sectionsY}
            gradeMap={gradeMap}
            onAdd={() => setModal({ type: 'classroom' })}
            onEdit={(room) => setModal({ type: 'classroom', room })}
          />
        )}

        {tab === 'years' && (
          <YearsTab
            years={snap.years}
            grades={snap.grades}
            sections={snap.sections}
            onAdd={() => setModal({ type: 'year' })}
            onCopy={(y) => setModal({ type: 'copy', from: y.name })}
            onActivate={(y) =>
              confirm({
                title: `Make ${y.name} the active year?`,
                message: 'Only the active marker moves. No grades, sections or enrollments are copied, changed or deleted.',
                confirmLabel: 'Set active',
                onConfirm: () => {
                  setActiveAcademicYear(y.id);
                  setYear(y.name);
                  saved(`${y.name} is now the active year.`);
                },
              })
            }
            onArchive={(y) =>
              confirm({
                title: `Archive ${y.name}?`,
                message: 'Its records become read-only and stay available for reports. You can restore the year later.',
                confirmLabel: 'Archive year',
                onConfirm: () => {
                  archiveAcademicYear(y.id);
                  saved(`${y.name} archived.`);
                },
              })
            }
            onRestore={(y) => attempt(() => restoreAcademicYear(y.id), `${y.name} restored.`)}
          />
        )}
      </main>

      {modalNode}

      <div className="gs-toasts" aria-live="polite" role="status">
        {toasts.map((t) => (
          <div key={t.id} className={`gs-toast gs-toast--${t.type}`}>
            {t.type === 'success' ? <Check size={16} /> : t.type === 'warning' ? <Info size={16} /> : <AlertTriangle size={16} />}
            <span>{t.message}</span>
            <button type="button" className="gs-icon-btn" aria-label="Dismiss message" onClick={() => setToasts((l) => l.filter((x) => x.id !== t.id))}>
              <X size={14} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}