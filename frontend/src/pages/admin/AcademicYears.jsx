import { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  Activity,
  AlertTriangle,
  Archive,
  ArchiveRestore,
  BookOpen,
  Calendar,
  CalendarDays,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  Copy,
  Download,
  Eye,
  GraduationCap,
  Info,
  Layers,
  LayoutGrid,
  List,
  MoreVertical,
  Pencil,
  Plus,
  RotateCcw,
  Search,
  SlidersHorizontal,
  Sparkles,
  Trash2,
  Users,
  X,
} from 'lucide-react';

import * as ay from '../../services/academicYearService';
import '../../styles/admin/AcademicYears.css';

/* ========================================================================== */
/* Constants and small helpers                                                */
/* ========================================================================== */

const DEFAULT_FILTERS = {
  q: '',
  status: 'all',
  calendar: 'all',
  fromYear: '',
  toYear: '',
  sort: 'newest',
};

const PAGE_SIZES = [10, 25, 50];

const STATUS_META = {
  current: { label: 'Current', icon: CheckCircle2 },
  upcoming: { label: 'Upcoming', icon: Clock },
  completed: { label: 'Completed', icon: CheckCircle2 },
  draft: { label: 'Draft', icon: Pencil },
  archived: { label: 'Archived', icon: Archive },
};

const TERM_LABEL = {
  upcoming: 'Scheduled',
  active: 'In progress',
  completed: 'Completed',
};

const ACTIVITY_LABEL = {
  created: 'Academic year created',
  updated: 'Academic year updated',
  'term-added': 'Term added',
  'term-updated': 'Term updated',
  'term-removed': 'Term removed',
  current: 'Current year changed',
  archived: 'Academic year archived',
  restored: 'Academic year restored',
  duplicated: 'Academic year duplicated',
};

const TAB_ITEMS = [
  { id: 'overview', label: 'Overview', icon: Info },
  { id: 'terms', label: 'Terms', icon: Layers },
  { id: 'calendar', label: 'Calendar', icon: CalendarDays },
  { id: 'summary', label: 'Academic Summary', icon: Users },
  { id: 'activity', label: 'Activity History', icon: Activity },
];

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

let localTermSequence = 0;
const makeLocalTermId = () => {
  localTermSequence += 1;
  return `term-${Date.now()}-${localTermSequence}`;
};

function loadYears() {
  try {
    return { years: ay.getAcademicYears(), error: '' };
  } catch (error) {
    return {
      years: [],
      error: error?.message || 'Could not load academic years.',
    };
  }
}

function formatDate(value) {
  if (!value) return '—';
  const date = new Date(
    value.length === 10 ? `${value}T00:00:00` : value
  );
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

function formatDateTime(value) {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatRange(start, end) {
  if (!start && !end) return 'Dates not set';
  return `${formatDate(start)} – ${formatDate(end)}`;
}

function addDays(value, days) {
  if (!ay.isValidDate(value)) return '';
  const date = new Date(`${value}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

function inclusiveDays(start, end) {
  if (!ay.isValidDate(start) || !ay.isValidDate(end)) return 0;
  return (
    Math.round(
      (Date.parse(`${end}T00:00:00Z`) - Date.parse(`${start}T00:00:00Z`)) /
        (24 * 60 * 60 * 1000)
    ) + 1
  );
}

function buildSuggestedTerms(startDate, endDate) {
  const total = inclusiveDays(startDate, endDate);
  if (total < 6) return [];

  const span = Math.floor(total / 3);
  const firstEnd = addDays(startDate, span - 1);
  const secondStart = addDays(firstEnd, 3);
  const secondEnd = addDays(secondStart, span - 1);
  const thirdStart = addDays(secondEnd, 3);

  const candidates = [
    { name: 'Term 1', startDate, endDate: firstEnd },
    { name: 'Term 2', startDate: secondStart, endDate: secondEnd },
    { name: 'Term 3', startDate: thirdStart, endDate },
  ].filter(
    (term) =>
      ay.isValidDate(term.startDate) &&
      ay.isValidDate(term.endDate) &&
      term.startDate <= term.endDate &&
      term.endDate <= endDate
  );

  return candidates.map((term, index) => ({
    id: makeLocalTermId(),
    name: `Term ${index + 1}`,
    startDate: term.startDate,
    endDate: term.endDate,
    status: 'upcoming',
    description: '',
  }));
}

function sortYearRecords(list, sort) {
  const start = (year) => year.startDate || '';
  const end = (year) => year.endDate || '';
  const copy = [...list];

  switch (sort) {
    case 'oldest':
      return copy.sort(
        (a, b) =>
          (start(a) || '9999-12-31').localeCompare(start(b) || '9999-12-31') ||
          a.name.localeCompare(b.name)
      );
    case 'startAsc':
      return copy.sort(
        (a, b) =>
          (start(a) || '9999-12-31').localeCompare(start(b) || '9999-12-31')
      );
    case 'startDesc':
      return copy.sort(
        (a, b) =>
          (start(b) || '0000-01-01').localeCompare(start(a) || '0000-01-01')
      );
    case 'endAsc':
      return copy.sort(
        (a, b) =>
          (end(a) || '9999-12-31').localeCompare(end(b) || '9999-12-31')
      );
    case 'endDesc':
      return copy.sort(
        (a, b) =>
          (end(b) || '0000-01-01').localeCompare(end(a) || '0000-01-01')
      );
    case 'name':
      return copy.sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true }));
    case 'newest':
    default:
      return copy.sort(
        (a, b) =>
          (start(b) || '0000-01-01').localeCompare(start(a) || '0000-01-01') ||
          b.name.localeCompare(a.name)
      );
  }
}

function getPageNumbers(current, total) {
  if (total <= 7) {
    return Array.from({ length: total }, (_, index) => index + 1);
  }
  const visible = new Set([1, total, current - 1, current, current + 1]);
  const sorted = [...visible]
    .filter((page) => page >= 1 && page <= total)
    .sort((a, b) => a - b);
  const output = [];
  let previous = 0;
  sorted.forEach((page) => {
    if (page - previous > 1) output.push('…');
    output.push(page);
    previous = page;
  });
  return output;
}

function countFieldErrors(errors) {
  let count = 0;
  Object.entries(errors || {}).forEach(([key, value]) => {
    if (key === 'terms' && value && typeof value === 'object') {
      Object.values(value).forEach((termErrors) => {
        count += Object.keys(termErrors || {}).length;
      });
    } else {
      count += 1;
    }
  });
  return count;
}

/* ========================================================================== */
/* Small presentational components                                            */
/* ========================================================================== */

function StatusBadge({ status, size }) {
  const meta = STATUS_META[status] || STATUS_META.draft;
  const Icon = meta.icon;
  return (
    <span className={`ay-badge ay-badge--${status}${size ? ` ay-badge--${size}` : ''}`}>
      <Icon size={12} aria-hidden="true" />
      {meta.label}
    </span>
  );
}

function TermStatusBadge({ status }) {
  return (
    <span className={`ay-term-badge ay-term-badge--${status}`}>
      <span className="ay-term-badge-dot" aria-hidden="true" />
      {TERM_LABEL[status] || 'Scheduled'}
    </span>
  );
}

function ProgressBar({ progress, compact = false }) {
  if (!progress?.available) return null;
  return (
    <div className={`ay-progress${compact ? ' ay-progress--compact' : ''}`}>
      <div
        className="ay-progress-track"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={progress.percent}
        aria-label="Academic year progress"
      >
        <span
          className="ay-progress-fill"
          style={{ width: `${progress.percent}%` }}
        />
      </div>
      {!compact ? (
        <div className="ay-progress-meta">
          <span>{progress.percent}% elapsed</span>
          <span>
            {progress.daysRemaining} day{progress.daysRemaining === 1 ? '' : 's'} remaining
          </span>
        </div>
      ) : null}
    </div>
  );
}

function KpiCard({ index, icon: Icon, label, value, caption, tone }) {
  return (
    <article className={`ay-kpi ay-kpi--${tone}`} style={{ '--i': index }}>
      <div className="ay-kpi-top">
        <span className="ay-kpi-icon">
          <Icon size={20} aria-hidden="true" />
        </span>
      </div>
      <p className="ay-kpi-label">{label}</p>
      <p className="ay-kpi-value">{value}</p>
      <p className="ay-kpi-caption">{caption}</p>
    </article>
  );
}

function Field({ id, label, required, error, hint, children, className = '' }) {
  return (
    <div className={`ay-field ${className}`.trim()}>
      <label className="ay-label" htmlFor={id}>
        {label}
        {required ? (
          <span className="ay-required" aria-hidden="true">
            *
          </span>
        ) : null}
      </label>
      {children}
      {error ? (
        <p className="ay-error" role="alert">
          {error}
        </p>
      ) : hint ? (
        <p className="ay-hint">{hint}</p>
      ) : null}
    </div>
  );
}

function Modal({
  title,
  subtitle,
  onClose,
  children,
  wide = false,
  drawer = false,
  disableEscape = false,
}) {
  const titleId = useId();
  const panelRef = useRef(null);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const onKeyDown = (event) => {
      if (event.key === 'Escape' && !disableEscape) {
        event.stopPropagation();
        onClose();
      }
    };
    document.addEventListener('keydown', onKeyDown);
    const timer = window.setTimeout(() => panelRef.current?.focus(), 30);

    return () => {
      window.clearTimeout(timer);
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [onClose, disableEscape]);

  return createPortal(
    <div
      className="ay-backdrop"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        ref={panelRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className={`ay-modal${wide ? ' ay-modal--wide' : ''}${
          drawer ? ' ay-drawer' : ''
        }`}
      >
        <header className="ay-modal-head">
          <div className="ay-modal-heading">
            <h2 id={titleId} className="ay-modal-title">
              {title}
            </h2>
            {subtitle ? <p className="ay-modal-subtitle">{subtitle}</p> : null}
          </div>
          <button
            type="button"
            className="ay-icon-btn"
            onClick={onClose}
            aria-label="Close dialog"
          >
            <X size={18} />
          </button>
        </header>
        <div className={drawer ? 'ay-drawer-body' : 'ay-modal-body'}>
          {children}
        </div>
      </div>
    </div>,
    document.body
  );
}

function ConfirmDialog({
  title,
  message,
  detail,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  tone = 'primary',
  hideCancel = false,
  onConfirm,
  onCancel,
  children,
}) {
  const titleId = useId();
  const confirmRef = useRef(null);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKeyDown = (event) => {
      if (event.key === 'Escape') {
        event.stopPropagation();
        onCancel();
      }
    };
    document.addEventListener('keydown', onKeyDown);
    const timer = window.setTimeout(() => confirmRef.current?.focus(), 30);
    return () => {
      window.clearTimeout(timer);
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [onCancel]);

  const Icon =
    tone === 'danger' || tone === 'warning'
      ? AlertTriangle
      : tone === 'info'
        ? Info
        : CheckCircle2;
  const buttonClass =
    tone === 'danger'
      ? 'ay-btn--danger'
      : tone === 'warning'
        ? 'ay-btn--warning'
        : 'ay-btn--primary';

  return createPortal(
    <div
      className="ay-backdrop ay-backdrop--top"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onCancel();
      }}
    >
      <div className="ay-confirm" role="alertdialog" aria-modal="true" aria-labelledby={titleId}>
        <span className={`ay-confirm-icon ay-confirm-icon--${tone}`}>
          <Icon size={22} aria-hidden="true" />
        </span>
        <h2 id={titleId} className="ay-confirm-title">
          {title}
        </h2>
        {message ? <p className="ay-confirm-message">{message}</p> : null}
        {detail ? (
          <div className="ay-confirm-detail">
            {Array.isArray(detail) ? (
              <ul>
                {detail.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            ) : (
              <p>{detail}</p>
            )}
          </div>
        ) : null}
        {children}
        <div className="ay-confirm-actions">
          {!hideCancel ? (
            <button type="button" className="ay-btn ay-btn--ghost" onClick={onCancel}>
              {cancelLabel}
            </button>
          ) : null}
          <button
            ref={confirmRef}
            type="button"
            className={`ay-btn ${buttonClass}`}
            onClick={onConfirm}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}

function RowActions({
  year,
  status,
  showView = true,
  onView,
  onEdit,
  onSetCurrent,
  onDuplicate,
  onArchive,
  onRestore,
  onDelete,
}) {
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const triggerRef = useRef(null);
  const menuRef = useRef(null);

  const placeMenu = useCallback(() => {
    const trigger = triggerRef.current;
    if (!trigger) return;
    const rect = trigger.getBoundingClientRect();
    const width = 224;
    const menuHeight = 250;
    const left = Math.max(
      10,
      Math.min(rect.right - width, window.innerWidth - width - 10)
    );
    const top =
      rect.bottom + 8 + menuHeight > window.innerHeight
        ? Math.max(10, rect.top - menuHeight - 8)
        : rect.bottom + 8;
    setPosition({ top, left });
  }, []);

  useEffect(() => {
    if (!open) return undefined;
    const onPointerDown = (event) => {
      if (menuRef.current?.contains(event.target)) return;
      if (triggerRef.current?.contains(event.target)) return;
      setOpen(false);
    };
    const onKeyDown = (event) => {
      if (event.key === 'Escape') setOpen(false);
    };
    const onReposition = () => placeMenu();
    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    window.addEventListener('resize', onReposition);
    window.addEventListener('scroll', onReposition, true);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('resize', onReposition);
      window.removeEventListener('scroll', onReposition, true);
    };
  }, [open, placeMenu]);

  const run = (handler) => {
    setOpen(false);
    handler(year);
  };

  const isArchived = status === 'archived';
  const canSetCurrent = status !== 'current' && !isArchived && status !== 'draft';
  const canArchive = status === 'completed';

  return (
    <div className="ay-row-actions">
      {showView ? (
        <button
          type="button"
          className="ay-icon-btn"
          onClick={() => onView(year)}
          aria-label={`View ${year.name}`}
          title="View details"
        >
          <Eye size={16} />
        </button>
      ) : null}
      <button
        type="button"
        className="ay-icon-btn"
        onClick={() => onEdit(year)}
        disabled={isArchived}
        aria-label={`Edit ${year.name}`}
        title={isArchived ? 'Restore this year before editing' : 'Edit academic year'}
      >
        <Pencil size={16} />
      </button>
      <button
        ref={triggerRef}
        type="button"
        className={`ay-icon-btn${open ? ' is-open' : ''}`}
        onClick={() => {
          if (!open) placeMenu();
          setOpen((value) => !value);
        }}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={`More actions for ${year.name}`}
        title="More actions"
      >
        <MoreVertical size={17} />
      </button>

      {open
        ? createPortal(
            <div
              ref={menuRef}
              className="ay-menu"
              style={{ top: position.top, left: position.left }}
              role="menu"
              aria-label={`Actions for ${year.name}`}
            >
              <button
                type="button"
                role="menuitem"
                className="ay-menu-item"
                onClick={() => run(onSetCurrent)}
                disabled={!canSetCurrent}
                title={
                  !canSetCurrent
                    ? status === 'draft'
                      ? 'Publish the draft before making it current'
                      : status === 'archived'
                        ? 'Restore this year first'
                        : 'This year is already current'
                    : undefined
                }
              >
                <CheckCircle2 size={16} />
                <span>Set as current</span>
              </button>
              <button
                type="button"
                role="menuitem"
                className="ay-menu-item"
                onClick={() => run(onDuplicate)}
              >
                <Copy size={16} />
                <span>Duplicate</span>
              </button>
              {isArchived ? (
                <button
                  type="button"
                  role="menuitem"
                  className="ay-menu-item"
                  onClick={() => run(onRestore)}
                >
                  <ArchiveRestore size={16} />
                  <span>Restore</span>
                </button>
              ) : (
                <button
                  type="button"
                  role="menuitem"
                  className="ay-menu-item"
                  onClick={() => run(onArchive)}
                  disabled={!canArchive}
                  title={
                    !canArchive
                      ? 'Only completed academic years can be archived'
                      : undefined
                  }
                >
                  <Archive size={16} />
                  <span>Archive</span>
                </button>
              )}
              <div className="ay-menu-sep" role="separator" />
              <button
                type="button"
                role="menuitem"
                className="ay-menu-item ay-menu-item--danger"
                onClick={() => run(onDelete)}
              >
                <Trash2 size={16} />
                <span>Delete</span>
              </button>
            </div>,
            document.body
          )
        : null}
    </div>
  );
}

function ToastStack({ toasts, onDismiss }) {
  return (
    <div className="ay-toasts" aria-live="polite" aria-atomic="false">
      {toasts.map((toast) => {
        const Icon =
          toast.type === 'error'
            ? AlertTriangle
            : toast.type === 'info'
              ? Info
              : CheckCircle2;
        return (
          <div
            key={toast.id}
            className={`ay-toast ay-toast--${toast.type}`}
            role="status"
          >
            <span className="ay-toast-icon">
              <Icon size={17} aria-hidden="true" />
            </span>
            <span className="ay-toast-text">{toast.message}</span>
            <button
              type="button"
              className="ay-toast-close"
              onClick={() => onDismiss(toast.id)}
              aria-label="Dismiss notification"
            >
              <X size={14} />
            </button>
          </div>
        );
      })}
    </div>
  );
}

/* ========================================================================== */
/* Calendar                                                                   */
/* ========================================================================== */

function MonthCalendar({ year }) {
  const firstDate =
    (ay.isValidDate(year?.startDate) && year.startDate) || ay.getTodayIso();
  const [cursor, setCursor] = useState(() => {
    const date = new Date(`${firstDate}T00:00:00`);
    return { year: date.getFullYear(), month: date.getMonth() };
  });

  const events = useMemo(() => ay.getCalendarEvents(year), [year]);
  const eventsByDate = useMemo(() => {
    const map = new Map();
    events.forEach((event) => {
      const list = map.get(event.date) || [];
      list.push(event);
      map.set(event.date, list);
    });
    return map;
  }, [events]);

  const cells = useMemo(() => {
    const firstOfMonth = new Date(cursor.year, cursor.month, 1);
    const startOffset = firstOfMonth.getDay();
    const today = ay.getTodayIso();
    const list = [];
    for (let index = 0; index < 42; index += 1) {
      const dayNumber = index - startOffset + 1;
      const date = new Date(cursor.year, cursor.month, dayNumber);
      const iso = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
        2,
        '0'
      )}-${String(date.getDate()).padStart(2, '0')}`;
      list.push({
        iso,
        day: date.getDate(),
        inMonth: dayNumber >= 1 && dayNumber <= new Date(cursor.year, cursor.month + 1, 0).getDate(),
        isToday: iso === today,
        events: eventsByDate.get(iso) || [],
      });
    }
    return list;
  }, [cursor, eventsByDate]);

  const monthLabel = new Date(cursor.year, cursor.month, 1).toLocaleDateString(
    'en-GB',
    { month: 'long', year: 'numeric' }
  );

  const shiftMonth = (delta) => {
    setCursor((previous) => {
      const date = new Date(previous.year, previous.month + delta, 1);
      return { year: date.getFullYear(), month: date.getMonth() };
    });
  };

  const goToToday = () => {
    const date = new Date();
    setCursor({ year: date.getFullYear(), month: date.getMonth() });
  };

  return (
    <div className="ay-calendar">
      <div className="ay-calendar-head">
        <div className="ay-calendar-title">
          <CalendarDays size={18} aria-hidden="true" />
          <h4>{monthLabel}</h4>
        </div>
        <div className="ay-calendar-nav">
          <button
            type="button"
            className="ay-icon-btn"
            onClick={() => shiftMonth(-1)}
            aria-label="Previous month"
          >
            <ChevronLeft size={17} />
          </button>
          <button type="button" className="ay-btn ay-btn--ghost ay-btn--sm" onClick={goToToday}>
            Today
          </button>
          <button
            type="button"
            className="ay-icon-btn"
            onClick={() => shiftMonth(1)}
            aria-label="Next month"
          >
            <ChevronRight size={17} />
          </button>
        </div>
      </div>

      <div className="ay-calendar-weekdays" aria-hidden="true">
        {WEEKDAYS.map((day) => (
          <span key={day}>{day}</span>
        ))}
      </div>

      <div className="ay-calendar-grid" role="grid" aria-label={`${monthLabel} calendar`}>
        {cells.map((cell) => (
          <div
            key={cell.iso}
            role="gridcell"
            aria-label={`${cell.iso}${
              cell.events.length
                ? `: ${cell.events.map((event) => event.label).join(', ')}`
                : ''
            }`}
            title={cell.events.map((event) => event.label).join('\n') || undefined}
            className={`ay-cal-day${cell.inMonth ? '' : ' is-outside'}${
              cell.isToday ? ' is-today' : ''
            }${cell.events.length ? ' has-events' : ''}`}
          >
            <span className="ay-cal-number">{cell.day}</span>
            {cell.events.length ? (
              <>
                <span className="ay-cal-dots" aria-hidden="true">
                  {cell.events.slice(0, 3).map((event, index) => (
                    <i
                      key={`${event.type}-${index}`}
                      className={`ay-cal-dot ay-cal-dot--${event.type}`}
                    />
                  ))}
                </span>
                <span className="ay-cal-labels">
                  {cell.events.slice(0, 2).map((event, index) => (
                    <span
                      key={`${event.label}-${index}`}
                      className={`ay-cal-label ay-cal-label--${event.type}`}
                    >
                      {event.label}
                    </span>
                  ))}
                </span>
              </>
            ) : null}
          </div>
        ))}
      </div>

      <div className="ay-calendar-legend">
        <span>
          <i className="ay-cal-dot ay-cal-dot--year" /> Academic year
        </span>
        <span>
          <i className="ay-cal-dot ay-cal-dot--term" /> Term
        </span>
        <span>
          <i className="ay-cal-dot ay-cal-dot--registration" /> Registration
        </span>
        <span>
          <i className="ay-cal-dot ay-cal-dot--today" /> Today
        </span>
      </div>
    </div>
  );
}

/* ========================================================================== */
/* Academic year form                                                         */
/* ========================================================================== */

function AcademicYearFormModal({ year, onClose, onSaved, notify }) {
  const isEdit = !!year;
  const initial = useMemo(() => {
    if (!year) {
      return {
        name: '',
        ecYear: '',
        gcYear: '',
        calendarSystem: 'BOTH',
        description: '',
        startDate: '',
        endDate: '',
        registrationStartDate: '',
        registrationEndDate: '',
        terms: [],
      };
    }
    return {
      name: year.name,
      ecYear: year.ecYear,
      gcYear: year.gcYear,
      calendarSystem: year.calendarSystem,
      description: year.description,
      startDate: year.startDate,
      endDate: year.endDate,
      registrationStartDate: year.registrationStartDate,
      registrationEndDate: year.registrationEndDate,
      terms: (year.terms || []).map((term) => ({ ...term })),
    };
  }, [year]);

  const [form, setForm] = useState(initial);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [confirmDiscard, setConfirmDiscard] = useState(false);
  const initialSnapshot = useMemo(() => JSON.stringify(initial), [initial]);
  const dirty = JSON.stringify(form) !== initialSnapshot;
  const errorCount = countFieldErrors(errors);
  const showDraftButton = !isEdit || year.isDraft;

  const setField = (key, value) => {
    setForm((previous) => ({ ...previous, [key]: value }));
    setErrors((previous) => {
      if (!previous[key]) return previous;
      const next = { ...previous };
      delete next[key];
      return next;
    });
  };

  const setTermField = (index, key, value) => {
    const termId = form.terms[index]?.id;
    setForm((previous) => ({
      ...previous,
      terms: previous.terms.map((term, termIndex) =>
        termIndex === index ? { ...term, [key]: value } : term
      ),
    }));
    setErrors((previous) => {
      if (!termId || !previous.terms?.[termId]) return previous;
      const nextTerms = { ...previous.terms };
      delete nextTerms[termId];
      const next = { ...previous };
      if (Object.keys(nextTerms).length) next.terms = nextTerms;
      else delete next.terms;
      return next;
    });
  };

  const addTerm = () => {
    setForm((previous) => ({
      ...previous,
      terms: [
        ...previous.terms,
        {
          id: makeLocalTermId(),
          name: `Term ${previous.terms.length + 1}`,
          startDate: '',
          endDate: '',
          status: 'upcoming',
          description: '',
        },
      ],
    }));
  };

  const removeTerm = (index) => {
    setForm((previous) => ({
      ...previous,
      terms: previous.terms.filter((_, termIndex) => termIndex !== index),
    }));
  };

  const addSuggestedTerms = () => {
    if (!ay.isValidDate(form.startDate) || !ay.isValidDate(form.endDate)) {
      notify('Set valid academic-year start and end dates before generating terms.', 'info');
      return;
    }
    const suggested = buildSuggestedTerms(form.startDate, form.endDate);
    if (!suggested.length) {
      notify('The academic period is too short to suggest three terms.', 'info');
      return;
    }
    setForm((previous) => ({ ...previous, terms: suggested }));
    setErrors((previous) => {
      if (!previous.terms) return previous;
      const next = { ...previous };
      delete next.terms;
      return next;
    });
  };

  const requestClose = () => {
    if (saving) return;
    if (dirty) setConfirmDiscard(true);
    else onClose();
  };

  const commit = (asDraft) => {
    if (saving) return;
    const payload = { ...form, isDraft: asDraft };
    const nextErrors = ay.validateAcademicYear(payload, year?.id ?? null, {
      draft: asDraft,
    });
    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors);
      notify('Please review the highlighted fields.', 'error');
      return;
    }

    setSaving(true);
    window.setTimeout(() => {
      try {
        if (isEdit) {
          ay.updateAcademicYear(year.id, payload, { asDraft });
        } else {
          ay.createAcademicYear(payload, { asDraft });
        }
        notify(
          isEdit
            ? asDraft
              ? 'Draft updated.'
              : 'Academic year updated.'
            : asDraft
              ? 'Draft academic year saved.'
              : 'Academic year created.',
          'success'
        );
        onSaved();
        onClose();
      } catch (error) {
        setErrors(error.errors || {});
        notify(error.message || 'Could not save the academic year.', 'error');
      } finally {
        setSaving(false);
      }
    }, 220);
  };

  const onSubmit = (event) => {
    event.preventDefault();
    commit(false);
  };

  const ecRequired = form.calendarSystem !== 'GC';
  const gcRequired = form.calendarSystem !== 'EC';

  return (
    <Modal
      title={isEdit ? 'Edit Academic Year' : 'Create Academic Year'}
      subtitle={
        isEdit
          ? 'Update calendar identity, dates and terms for this academic year.'
          : 'Configure a new Ethiopian and Gregorian academic period with its terms.'
      }
      onClose={requestClose}
      wide
      disableEscape={confirmDiscard}
    >
      <form className="ay-form" onSubmit={onSubmit} noValidate>
        {errorCount > 0 ? (
          <div className="ay-form-summary" role="alert">
            <AlertTriangle size={17} aria-hidden="true" />
            <span>
              {errorCount} field{errorCount === 1 ? '' : 's'} need
              {errorCount === 1 ? 's' : ''} attention. Review the messages below.
            </span>
          </div>
        ) : null}

        <section className="ay-form-section">
          <header className="ay-form-section-head">
            <span className="ay-step">1</span>
            <div>
              <h3>Basic information</h3>
              <p>Store Ethiopian and Gregorian identities explicitly. They are never assumed to match.</p>
            </div>
          </header>
          <div className="ay-field-grid">
            <Field
              id="ay-name"
              label="Academic year name"
              required
              error={errors.name}
              hint="Use a clear label such as 2027/2028 or 2020 E.C."
              className="ay-field--full"
            >
              <input
                id="ay-name"
                className={`ay-input${errors.name ? ' is-invalid' : ''}`}
                value={form.name}
                onChange={(event) => setField('name', event.target.value)}
                placeholder="e.g. 2027/2028"
                autoComplete="off"
              />
            </Field>

            <Field
              id="ay-ec"
              label="Ethiopian calendar year (E.C.)"
              required={ecRequired}
              error={errors.ecYear}
            >
              <input
                id="ay-ec"
                className={`ay-input${errors.ecYear ? ' is-invalid' : ''}`}
                value={form.ecYear}
                onChange={(event) => setField('ecYear', event.target.value)}
                placeholder="e.g. 2020 E.C."
                autoComplete="off"
              />
            </Field>

            <Field
              id="ay-gc"
              label="Gregorian calendar year (G.C.)"
              required={gcRequired}
              error={errors.gcYear}
            >
              <input
                id="ay-gc"
                className={`ay-input${errors.gcYear ? ' is-invalid' : ''}`}
                value={form.gcYear}
                onChange={(event) => setField('gcYear', event.target.value)}
                placeholder="e.g. 2027/2028 G.C."
                autoComplete="off"
              />
            </Field>

            <Field
              id="ay-calendar"
              label="Calendar system"
              required
              error={errors.calendarSystem}
            >
              <select
                id="ay-calendar"
                className="ay-select"
                value={form.calendarSystem}
                onChange={(event) => setField('calendarSystem', event.target.value)}
              >
                <option value="BOTH">Ethiopian &amp; Gregorian (both)</option>
                <option value="EC">Ethiopian calendar (E.C.)</option>
                <option value="GC">Gregorian calendar (G.C.)</option>
              </select>
            </Field>

            <Field
              id="ay-description"
              label="Description"
              className="ay-field--full"
              hint="Optional context shown in the academic-year details."
            >
              <textarea
                id="ay-description"
                className="ay-textarea"
                rows={3}
                value={form.description}
                onChange={(event) => setField('description', event.target.value)}
                placeholder="Notes about this academic period, curriculum focus or approvals…"
              />
            </Field>
          </div>
        </section>

        <section className="ay-form-section">
          <header className="ay-form-section-head">
            <span className="ay-step">2</span>
            <div>
              <h3>Academic period</h3>
              <p>Registration must end on or before the academic year ends.</p>
            </div>
          </header>
          <div className="ay-field-grid">
            <Field id="ay-start" label="Start date" required error={errors.startDate}>
              <input
                id="ay-start"
                type="date"
                className={`ay-input${errors.startDate ? ' is-invalid' : ''}`}
                value={form.startDate}
                onChange={(event) => setField('startDate', event.target.value)}
              />
            </Field>
            <Field id="ay-end" label="End date" required error={errors.endDate}>
              <input
                id="ay-end"
                type="date"
                className={`ay-input${errors.endDate ? ' is-invalid' : ''}`}
                value={form.endDate}
                onChange={(event) => setField('endDate', event.target.value)}
              />
            </Field>
            <Field
              id="ay-reg-start"
              label="Registration start date"
              error={errors.registrationStartDate}
            >
              <input
                id="ay-reg-start"
                type="date"
                className={`ay-input${
                  errors.registrationStartDate ? ' is-invalid' : ''
                }`}
                value={form.registrationStartDate}
                onChange={(event) =>
                  setField('registrationStartDate', event.target.value)
                }
              />
            </Field>
            <Field
              id="ay-reg-end"
              label="Registration end date"
              error={errors.registrationEndDate}
            >
              <input
                id="ay-reg-end"
                type="date"
                className={`ay-input${
                  errors.registrationEndDate ? ' is-invalid' : ''
                }`}
                value={form.registrationEndDate}
                onChange={(event) =>
                  setField('registrationEndDate', event.target.value)
                }
              />
            </Field>
          </div>
        </section>

        <section className="ay-form-section">
          <header className="ay-form-section-head ay-form-section-head--split">
            <div className="ay-form-section-title">
              <span className="ay-step">3</span>
              <div>
                <h3>Academic terms</h3>
                <p>Add as many terms as the school needs. Terms cannot overlap and are sorted chronologically.</p>
              </div>
            </div>
            <div className="ay-term-tools">
              {form.terms.length === 0 ? (
                <button
                  type="button"
                  className="ay-btn ay-btn--secondary ay-btn--sm"
                  onClick={addSuggestedTerms}
                  disabled={!ay.isValidDate(form.startDate) || !ay.isValidDate(form.endDate)}
                  title={
                    !ay.isValidDate(form.startDate) || !ay.isValidDate(form.endDate)
                      ? 'Set the academic period first'
                      : 'Generate a three-term structure'
                  }
                >
                  <Sparkles size={14} /> Suggest 3 terms
                </button>
              ) : null}
              <button
                type="button"
                className="ay-btn ay-btn--outline ay-btn--sm"
                onClick={addTerm}
              >
                <Plus size={14} /> Add term
              </button>
            </div>
          </header>

          {form.terms.length === 0 ? (
            <div className="ay-empty ay-empty--compact">
              <span className="ay-empty-icon">
                <Layers size={22} />
              </span>
              <h4>No terms configured</h4>
              <p>Add terms manually or generate a suggested three-term structure from the academic period.</p>
            </div>
          ) : (
            <div className="ay-term-editor">
              {form.terms.map((term, index) => {
                const termErrors = errors.terms?.[term.id] || {};
                return (
                  <article className="ay-term-editor-card" key={term.id}>
                    <header className="ay-term-editor-head">
                      <span className="ay-term-index">{index + 1}</span>
                      <h4>{term.name || `Term ${index + 1}`}</h4>
                      <button
                        type="button"
                        className="ay-icon-btn ay-icon-btn--danger"
                        onClick={() => removeTerm(index)}
                        aria-label={`Remove ${term.name || `term ${index + 1}`}`}
                        title="Remove term"
                      >
                        <Trash2 size={15} />
                      </button>
                    </header>
                    <div className="ay-field-grid ay-field-grid--terms">
                      <Field
                        id={`term-${term.id}-name`}
                        label="Term name"
                        required
                        error={termErrors.name}
                      >
                        <input
                          id={`term-${term.id}-name`}
                          className={`ay-input${termErrors.name ? ' is-invalid' : ''}`}
                          value={term.name}
                          onChange={(event) =>
                            setTermField(index, 'name', event.target.value)
                          }
                        />
                      </Field>
                      <Field id={`term-${term.id}-status`} label="Status">
                        <select
                          id={`term-${term.id}-status`}
                          className="ay-select"
                          value={term.status}
                          onChange={(event) =>
                            setTermField(index, 'status', event.target.value)
                          }
                        >
                          <option value="upcoming">Scheduled</option>
                          <option value="active">In progress</option>
                          <option value="completed">Completed</option>
                        </select>
                      </Field>
                      <Field
                        id={`term-${term.id}-start`}
                        label="Start date"
                        required
                        error={termErrors.startDate}
                      >
                        <input
                          id={`term-${term.id}-start`}
                          type="date"
                          className={`ay-input${
                            termErrors.startDate ? ' is-invalid' : ''
                          }`}
                          value={term.startDate}
                          onChange={(event) =>
                            setTermField(index, 'startDate', event.target.value)
                          }
                        />
                      </Field>
                      <Field
                        id={`term-${term.id}-end`}
                        label="End date"
                        required
                        error={termErrors.endDate}
                      >
                        <input
                          id={`term-${term.id}-end`}
                          type="date"
                          className={`ay-input${
                            termErrors.endDate ? ' is-invalid' : ''
                          }`}
                          value={term.endDate}
                          onChange={(event) =>
                            setTermField(index, 'endDate', event.target.value)
                          }
                        />
                      </Field>
                      <Field
                        id={`term-${term.id}-description`}
                        label="Description"
                        className="ay-field--full"
                      >
                        <input
                          id={`term-${term.id}-description`}
                          className="ay-input"
                          value={term.description}
                          onChange={(event) =>
                            setTermField(index, 'description', event.target.value)
                          }
                          placeholder="Optional term focus or notes"
                        />
                      </Field>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>

        <div className="ay-form-actions">
          <button
            type="button"
            className="ay-btn ay-btn--ghost"
            onClick={requestClose}
            disabled={saving}
          >
            Cancel
          </button>
          <div className="ay-form-actions-right">
            {showDraftButton ? (
              <button
                type="button"
                className="ay-btn ay-btn--secondary"
                onClick={() => commit(true)}
                disabled={saving}
              >
                {saving ? 'Saving…' : 'Save as draft'}
              </button>
            ) : null}
            <button type="submit" className="ay-btn ay-btn--primary" disabled={saving}>
              {saving
                ? 'Saving…'
                : isEdit
                  ? year.isDraft
                    ? 'Publish academic year'
                    : 'Save changes'
                  : 'Create Academic Year'}
            </button>
          </div>
        </div>
      </form>

      {confirmDiscard ? (
        <ConfirmDialog
          title="Discard unsaved changes?"
          message="Your edits to this academic year have not been saved."
          confirmLabel="Discard changes"
          cancelLabel="Keep editing"
          tone="warning"
          onCancel={() => setConfirmDiscard(false)}
          onConfirm={() => {
            setConfirmDiscard(false);
            onClose();
          }}
        />
      ) : null}
    </Modal>
  );
}

/* ========================================================================== */
/* Term form                                                                  */
/* ========================================================================== */

function TermFormModal({ year, term, onClose, onSaved, notify }) {
  const isEdit = !!term;
  const [form, setForm] = useState(() =>
    term
      ? { ...term }
      : {
          id: '',
          name: `Term ${(year.terms?.length || 0) + 1}`,
          startDate: '',
          endDate: '',
          status: 'upcoming',
          description: '',
        }
  );
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  const setField = (key, value) => {
    setForm((previous) => ({ ...previous, [key]: value }));
    setErrors((previous) => {
      if (!previous[key]) return previous;
      const next = { ...previous };
      delete next[key];
      return next;
    });
  };

  const onSubmit = (event) => {
    event.preventDefault();
    if (saving) return;

    const nextErrors = ay.validateTermForYear(form, year, term?.id ?? null);
    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors);
      return;
    }

    setSaving(true);
    try {
      if (isEdit) ay.updateTerm(year.id, term.id, form);
      else ay.addTerm(year.id, form);
      notify(isEdit ? 'Term updated.' : 'Term added.', 'success');
      onSaved();
      onClose();
    } catch (error) {
      setErrors(error.errors || {});
      notify(error.message || 'Could not save the term.', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      title={isEdit ? 'Edit term' : 'Add term'}
      subtitle={`${year.name} · ${year.ecYear || year.gcYear || 'Academic year'}`}
      onClose={onClose}
    >
      <form className="ay-form" onSubmit={onSubmit} noValidate>
        <div className="ay-field-grid">
          <Field id="term-name" label="Term name" required error={errors.name}>
            <input
              id="term-name"
              className={`ay-input${errors.name ? ' is-invalid' : ''}`}
              value={form.name}
              onChange={(event) => setField('name', event.target.value)}
              autoFocus
            />
          </Field>
          <Field id="term-status" label="Status">
            <select
              id="term-status"
              className="ay-select"
              value={form.status}
              onChange={(event) => setField('status', event.target.value)}
            >
              <option value="upcoming">Scheduled</option>
              <option value="active">In progress</option>
              <option value="completed">Completed</option>
            </select>
          </Field>
          <Field id="term-start" label="Start date" required error={errors.startDate}>
            <input
              id="term-start"
              type="date"
              className={`ay-input${errors.startDate ? ' is-invalid' : ''}`}
              value={form.startDate}
              onChange={(event) => setField('startDate', event.target.value)}
            />
          </Field>
          <Field id="term-end" label="End date" required error={errors.endDate}>
            <input
              id="term-end"
              type="date"
              className={`ay-input${errors.endDate ? ' is-invalid' : ''}`}
              value={form.endDate}
              onChange={(event) => setField('endDate', event.target.value)}
            />
          </Field>
          <Field
            id="term-description"
            label="Description"
            className="ay-field--full"
          >
            <textarea
              id="term-description"
              className="ay-textarea"
              rows={2}
              value={form.description}
              onChange={(event) => setField('description', event.target.value)}
            />
          </Field>
        </div>

        <p className="ay-term-window">
          Term dates must stay within {formatDate(year.startDate)} –{' '}
          {formatDate(year.endDate)} and must not overlap another term.
        </p>

        <div className="ay-form-actions">
          <button type="button" className="ay-btn ay-btn--ghost" onClick={onClose} disabled={saving}>
            Cancel
          </button>
          <button type="submit" className="ay-btn ay-btn--primary" disabled={saving}>
            {saving ? 'Saving…' : isEdit ? 'Save term' : 'Add term'}
          </button>
        </div>
      </form>
    </Modal>
  );
}

/* ========================================================================== */
/* Details drawer                                                             */
/* ========================================================================== */

function YearDetailsDrawer({ id, onClose, onEdit, onDuplicate, onSetCurrent, onRestore, onDelete, onChanged, notify }) {
  const year = ay.getAcademicYearById(id);
  const [tab, setTab] = useState('overview');
  const [termModal, setTermModal] = useState(null);
  const [confirmTerm, setConfirmTerm] = useState(null);

  const reload = useCallback(() => {
    onChanged();
  }, [onChanged]);

  if (!year) {
    return (
      <Modal title="Academic year" onClose={onClose}>
        <div className="ay-empty">
          <span className="ay-empty-icon">
            <Info size={22} />
          </span>
          <h3>Record not found</h3>
          <p>This academic year may have been deleted.</p>
          <button type="button" className="ay-btn ay-btn--primary" onClick={onClose}>
            Close
          </button>
        </div>
      </Modal>
    );
  }

  const status = ay.getAcademicYearStatus(year);
  const progress = ay.getAcademicYearProgress(year);
  const currentTerm = ay.getCurrentTerm(year);
  const summary = ay.getLinkedSummary(year.name);
  const events = ay.getCalendarEvents(year);
  const isArchived = status === 'archived';

  const summaryTiles = [
    {
      label: 'Grades',
      value: summary.grades,
      icon: GraduationCap,
      note: 'Grades & Sections',
    },
    {
      label: 'Sections',
      value: summary.sections,
      icon: Layers,
      note: 'Grades & Sections',
    },
    {
      label: 'Enrolled students',
      value: summary.students,
      icon: Users,
      note: 'Enrollment records',
    },
    { label: 'Subjects', value: null, icon: BookOpen, note: 'Not connected' },
    { label: 'Teachers', value: null, icon: Users, note: 'Not connected' },
    { label: 'Timetable', value: null, icon: Calendar, note: 'Not configured' },
  ];

  const handleRemoveTerm = (term) => setConfirmTerm(term);

  const removeSelectedTerm = () => {
    if (!confirmTerm) return;
    try {
      ay.removeTerm(year.id, confirmTerm.id);
      notify(`Term “${confirmTerm.name}” removed.`, 'success');
      setConfirmTerm(null);
      reload();
    } catch (error) {
      setConfirmTerm(null);
      notify(error.message || 'Could not remove the term.', 'error');
    }
  };

  return (
    <Modal
      title={year.name}
      subtitle={`${year.ecYear || 'E.C. not set'} · ${year.gcYear || 'G.C. not set'}`}
      onClose={onClose}
      drawer
      disableEscape={!!termModal || !!confirmTerm}
    >
      <div className="ay-detail-toolbar">
        <div className="ay-detail-status">
          <StatusBadge status={status} />
          <span className="ay-detail-id">{year.id}</span>
        </div>
        <div className="ay-detail-actions">
          <button
            type="button"
            className="ay-btn ay-btn--secondary ay-btn--sm"
            onClick={() => onEdit(year)}
            disabled={isArchived}
          >
            <Pencil size={14} /> Edit
          </button>
          <button
            type="button"
            className="ay-btn ay-btn--secondary ay-btn--sm"
            onClick={() => onDuplicate(year)}
          >
            <Copy size={14} /> Duplicate
          </button>
          {isArchived ? (
            <button
              type="button"
              className="ay-btn ay-btn--secondary ay-btn--sm"
              onClick={() => onRestore(year)}
            >
              <ArchiveRestore size={14} /> Restore
            </button>
          ) : (
            <button
              type="button"
              className="ay-btn ay-btn--secondary ay-btn--sm"
              onClick={() => onSetCurrent(year)}
              disabled={status === 'draft' || status === 'current'}
              title={
                status === 'draft'
                  ? 'Publish the draft before making it current'
                  : status === 'current'
                    ? 'This year is already current'
                    : undefined
              }
            >
              <CheckCircle2 size={14} /> Set current
            </button>
          )}
          {!isArchived && status !== 'current' ? (
            <button
              type="button"
              className="ay-btn ay-btn--danger-outline ay-btn--sm"
              onClick={() => onDelete(year)}
            >
              <Trash2 size={14} /> Delete
            </button>
          ) : null}
        </div>
      </div>

      <div className="ay-tabs" role="tablist" aria-label="Academic year details">
        {TAB_ITEMS.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              type="button"
              role="tab"
              aria-selected={tab === item.id}
              className={`ay-tab${tab === item.id ? ' is-active' : ''}`}
              onClick={() => setTab(item.id)}
            >
              <Icon size={15} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>

      <div className="ay-tab-panels">
        {tab === 'overview' ? (
          <div className="ay-tab-panel" key="overview">
            <div className="ay-detail-hero">
              <div>
                <span className="ay-detail-eyebrow">
                  <CalendarDays size={15} /> Academic year overview
                </span>
                <h3>{year.name}</h3>
                <p>{year.description || 'No description has been added for this academic year.'}</p>
              </div>
              {progress.available ? (
                <div className="ay-detail-progress">
                  <div className="ay-detail-progress-head">
                    <span>{progress.percent}% elapsed</span>
                    <span>
                      {progress.phase === 'completed'
                        ? 'Completed'
                        : `${progress.daysRemaining} days remaining`}
                    </span>
                  </div>
                  <ProgressBar progress={progress} compact />
                </div>
              ) : (
                <p className="ay-muted">
                  Progress is unavailable until valid start and end dates are set.
                </p>
              )}
            </div>

            <div className="ay-detail-info-grid">
              <div>
                <span>Ethiopian calendar</span>
                <strong>{year.ecYear || 'Not set'}</strong>
              </div>
              <div>
                <span>Gregorian calendar</span>
                <strong>{year.gcYear || 'Not set'}</strong>
              </div>
              <div>
                <span>Calendar system</span>
                <strong>{year.calendarSystem === 'BOTH' ? 'Ethiopian & Gregorian' : year.calendarSystem}</strong>
              </div>
              <div>
                <span>Start date</span>
                <strong>{formatDate(year.startDate)}</strong>
              </div>
              <div>
                <span>End date</span>
                <strong>{formatDate(year.endDate)}</strong>
              </div>
              <div>
                <span>Registration window</span>
                <strong>
                  {year.registrationStartDate || year.registrationEndDate
                    ? formatRange(year.registrationStartDate, year.registrationEndDate)
                    : 'Not configured'}
                </strong>
              </div>
              <div>
                <span>Terms</span>
                <strong>{year.terms.length}</strong>
              </div>
              <div>
                <span>Current / next term</span>
                <strong>{currentTerm ? currentTerm.name : 'Not configured'}</strong>
              </div>
              <div>
                <span>Created</span>
                <strong>{formatDateTime(year.createdAt)}</strong>
              </div>
              <div>
                <span>Last updated</span>
                <strong>{formatDateTime(year.updatedAt)}</strong>
              </div>
            </div>
          </div>
        ) : null}

        {tab === 'terms' ? (
          <div className="ay-tab-panel" key="terms">
            <div className="ay-panel-head">
              <div>
                <h3>Academic terms</h3>
                <p>Terms are validated against the academic period and cannot overlap.</p>
              </div>
              <button
                type="button"
                className="ay-btn ay-btn--primary ay-btn--sm"
                onClick={() => setTermModal({ mode: 'add' })}
                disabled={isArchived}
              >
                <Plus size={14} /> Add term
              </button>
            </div>

            {year.terms.length === 0 ? (
              <div className="ay-empty">
                <span className="ay-empty-icon">
                  <Layers size={22} />
                </span>
                <h3>No terms configured</h3>
                <p>Add the first term to this academic year so the active period can be tracked.</p>
                <button
                  type="button"
                  className="ay-btn ay-btn--primary"
                  onClick={() => setTermModal({ mode: 'add' })}
                  disabled={isArchived}
                >
                  <Plus size={15} /> Add term
                </button>
              </div>
            ) : (
              <div className="ay-term-list">
                {year.terms.map((term) => {
                  const termStatus = ay.getTermStatus(term);
                  const isCurrent =
                    currentTerm?.id === term.id &&
                    currentTerm?.derivedStatus === 'active';
                  return (
                    <article
                      key={term.id}
                      className={`ay-term${isCurrent ? ' is-current' : ''}`}
                    >
                      <div className="ay-term-main">
                        <div className="ay-term-heading">
                          <h4>{term.name}</h4>
                          {isCurrent ? (
                            <span className="ay-current-term-flag">
                              <CheckCircle2 size={12} /> Current term
                            </span>
                          ) : null}
                          <TermStatusBadge status={termStatus} />
                        </div>
                        <p className="ay-term-dates">
                          <CalendarDays size={14} />
                          {formatRange(term.startDate, term.endDate)}
                        </p>
                        {term.description ? (
                          <p className="ay-term-description">{term.description}</p>
                        ) : null}
                      </div>
                      <div className="ay-term-actions">
                        <button
                          type="button"
                          className="ay-icon-btn"
                          onClick={() => setTermModal({ mode: 'edit', term })}
                          disabled={isArchived}
                          aria-label={`Edit ${term.name}`}
                          title="Edit term"
                        >
                          <Pencil size={15} />
                        </button>
                        <button
                          type="button"
                          className="ay-icon-btn ay-icon-btn--danger"
                          onClick={() => handleRemoveTerm(term)}
                          disabled={isArchived}
                          aria-label={`Remove ${term.name}`}
                          title="Remove term"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </div>
        ) : null}

        {tab === 'calendar' ? (
          <div className="ay-tab-panel" key="calendar">
            <div className="ay-panel-head">
              <div>
                <h3>Academic calendar</h3>
                <p>Term boundaries, registration windows and academic-year dates.</p>
              </div>
            </div>
            <div className="ay-calendar-layout">
              <MonthCalendar year={year} />
              <aside className="ay-keydates">
                <h4>Key dates</h4>
                {events.length ? (
                  <ol>
                    {events.map((event, index) => (
                      <li key={`${event.date}-${event.label}-${index}`}>
                        <i className={`ay-cal-dot ay-cal-dot--${event.type}`} />
                        <time dateTime={event.date}>{formatDate(event.date)}</time>
                        <span>{event.label}</span>
                      </li>
                    ))}
                  </ol>
                ) : (
                  <p className="ay-muted">No calendar dates configured.</p>
                )}
              </aside>
            </div>
          </div>
        ) : null}

        {tab === 'summary' ? (
          <div className="ay-tab-panel" key="summary">
            <div className="ay-panel-head">
              <div>
                <h3>Academic summary</h3>
                <p>Live counts are shown only when the related module records data for this year.</p>
              </div>
            </div>

            <div className="ay-summary-grid">
              {summaryTiles.map((tile) => {
                const Icon = tile.icon;
                return (
                  <div className="ay-summary-tile" key={tile.label}>
                    <span className="ay-summary-icon">
                      <Icon size={18} />
                    </span>
                    <span className="ay-summary-label">{tile.label}</span>
                    <strong>
                      {typeof tile.value === 'number'
                        ? tile.value.toLocaleString()
                        : tile.note === 'Not configured'
                          ? 'Not configured'
                          : 'Not connected'}
                    </strong>
                    <span className="ay-summary-note">{tile.note}</span>
                  </div>
                );
              })}
            </div>

            {!summary.hasAny ? (
              <div className="ay-empty ay-empty--compact">
                <span className="ay-empty-icon">
                  <Info size={22} />
                </span>
                <h4>Linked modules have no records for this year yet</h4>
                <p>
                  Grades, sections, enrollments, subjects, teachers and timetable
                  information will appear here once those modules record data for{' '}
                  {year.name}.
                </p>
              </div>
            ) : null}
          </div>
        ) : null}

        {tab === 'activity' ? (
          <div className="ay-tab-panel" key="activity">
            <div className="ay-panel-head">
              <div>
                <h3>Activity history</h3>
                <p>Only actions recorded through this module are listed.</p>
              </div>
            </div>

            {year.activity.length === 0 ? (
              <div className="ay-empty">
                <span className="ay-empty-icon">
                  <Activity size={22} />
                </span>
                <h3>No activity recorded yet</h3>
                <p>Changes to this academic year will appear here as they happen.</p>
              </div>
            ) : (
              <ol className="ay-activity-list">
                {year.activity.map((entry) => (
                  <li key={entry.id}>
                    <span className="ay-activity-dot" aria-hidden="true" />
                    <div>
                      <strong>{ACTIVITY_LABEL[entry.action] || 'Academic year changed'}</strong>
                      <p>{entry.description}</p>
                      <time dateTime={entry.at}>{formatDateTime(entry.at)}</time>
                    </div>
                  </li>
                ))}
              </ol>
            )}
          </div>
        ) : null}
      </div>

      {termModal ? (
        <TermFormModal
          year={year}
          term={termModal.mode === 'edit' ? termModal.term : null}
          onClose={() => setTermModal(null)}
          onSaved={reload}
          notify={notify}
        />
      ) : null}

      {confirmTerm ? (
        <ConfirmDialog
          title={`Remove ${confirmTerm.name}?`}
          message="This removes the term from the academic year configuration."
          detail="No student, attendance, result or timetable records are deleted."
          confirmLabel="Remove term"
          tone="danger"
          onCancel={() => setConfirmTerm(null)}
          onConfirm={removeSelectedTerm}
        />
      ) : null}
    </Modal>
  );
}

/* ========================================================================== */
/* Duplicate and calendar dialogs                                             */
/* ========================================================================== */

function DuplicateModal({ source, onClose, onSaved, notify }) {
  const initial = useMemo(() => ay.getDuplicateDefaults(source), [source]);
  const [form, setForm] = useState(initial);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  const setField = (key, value) => {
    setForm((previous) => ({ ...previous, [key]: value }));
    setErrors((previous) => {
      if (!previous[key]) return previous;
      const next = { ...previous };
      delete next[key];
      return next;
    });
  };

  const onSubmit = (event) => {
    event.preventDefault();
    if (saving) return;

    const nextErrors = ay.validateAcademicYear(
      { ...form, isDraft: true },
      null,
      { draft: false }
    );
    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors);
      return;
    }

    setSaving(true);
    window.setTimeout(() => {
      try {
        const created = ay.duplicateAcademicYear(source.id, form);
        notify(`${source.name} duplicated as draft ${created.name}.`, 'success');
        onSaved();
        onClose();
      } catch (error) {
        setErrors(error.errors || {});
        notify(error.message || 'Could not duplicate the academic year.', 'error');
      } finally {
        setSaving(false);
      }
    }, 220);
  };

  return (
    <Modal
      title={`Duplicate ${source.name}`}
      subtitle="Creates a draft with the same terms and calendar structure."
      onClose={onClose}
      wide
    >
      <form className="ay-form" onSubmit={onSubmit} noValidate>
        <div className="ay-note">
          <Info size={16} aria-hidden="true" />
          <p>
            Only the academic-year configuration and its terms are copied. Students,
            attendance, results, timetables and other historical records are never copied.
          </p>
        </div>

        <div className="ay-field-grid">
          <Field
            id="duplicate-name"
            label="New academic year name"
            required
            error={errors.name}
            className="ay-field--full"
          >
            <input
              id="duplicate-name"
              className={`ay-input${errors.name ? ' is-invalid' : ''}`}
              value={form.name}
              onChange={(event) => setField('name', event.target.value)}
              autoComplete="off"
            />
          </Field>
          <Field
            id="duplicate-ec"
            label="Ethiopian calendar year (E.C.)"
            required={form.calendarSystem !== 'GC'}
            error={errors.ecYear}
          >
            <input
              id="duplicate-ec"
              className={`ay-input${errors.ecYear ? ' is-invalid' : ''}`}
              value={form.ecYear}
              onChange={(event) => setField('ecYear', event.target.value)}
            />
          </Field>
          <Field
            id="duplicate-gc"
            label="Gregorian calendar year (G.C.)"
            required={form.calendarSystem !== 'EC'}
            error={errors.gcYear}
          >
            <input
              id="duplicate-gc"
              className={`ay-input${errors.gcYear ? ' is-invalid' : ''}`}
              value={form.gcYear}
              onChange={(event) => setField('gcYear', event.target.value)}
            />
          </Field>
          <Field id="duplicate-start" label="Start date" required error={errors.startDate}>
            <input
              id="duplicate-start"
              type="date"
              className={`ay-input${errors.startDate ? ' is-invalid' : ''}`}
              value={form.startDate}
              onChange={(event) => setField('startDate', event.target.value)}
            />
          </Field>
          <Field id="duplicate-end" label="End date" required error={errors.endDate}>
            <input
              id="duplicate-end"
              type="date"
              className={`ay-input${errors.endDate ? ' is-invalid' : ''}`}
              value={form.endDate}
              onChange={(event) => setField('endDate', event.target.value)}
            />
          </Field>
          <Field
            id="duplicate-reg-start"
            label="Registration start date"
            error={errors.registrationStartDate}
          >
            <input
              id="duplicate-reg-start"
              type="date"
              className={`ay-input${
                errors.registrationStartDate ? ' is-invalid' : ''
              }`}
              value={form.registrationStartDate}
              onChange={(event) =>
                setField('registrationStartDate', event.target.value)
              }
            />
          </Field>
          <Field
            id="duplicate-reg-end"
            label="Registration end date"
            error={errors.registrationEndDate}
          >
            <input
              id="duplicate-reg-end"
              type="date"
              className={`ay-input${
                errors.registrationEndDate ? ' is-invalid' : ''
              }`}
              value={form.registrationEndDate}
              onChange={(event) =>
                setField('registrationEndDate', event.target.value)
              }
            />
          </Field>
        </div>

        <div className="ay-form-actions">
          <button type="button" className="ay-btn ay-btn--ghost" onClick={onClose} disabled={saving}>
            Cancel
          </button>
          <button type="submit" className="ay-btn ay-btn--primary" disabled={saving}>
            {saving ? 'Creating draft…' : 'Create draft copy'}
          </button>
        </div>
      </form>
    </Modal>
  );
}

function CalendarModal({ year, onClose, onEdit }) {
  if (!year) {
    return (
      <Modal title="Academic Calendar" onClose={onClose}>
        <div className="ay-empty">
          <span className="ay-empty-icon">
            <CalendarDays size={22} />
          </span>
          <h3>No academic year available</h3>
          <p>Create an academic year first to view its calendar.</p>
          <button type="button" className="ay-btn ay-btn--primary" onClick={onClose}>
            Close
          </button>
        </div>
      </Modal>
    );
  }

  const status = ay.getAcademicYearStatus(year);
  const events = ay.getCalendarEvents(year);

  return (
    <Modal
      title="Academic Calendar"
      subtitle={`${year.name} · ${year.ecYear || 'E.C. not set'} · ${
        year.gcYear || 'G.C. not set'
      }`}
      onClose={onClose}
      wide
    >
      <div className="ay-calendar-summary">
        <StatusBadge status={status} />
        <span>
          <CalendarDays size={14} /> {formatRange(year.startDate, year.endDate)}
        </span>
        <span>
          <Layers size={14} /> {year.terms.length} term{year.terms.length === 1 ? '' : 's'}
        </span>
      </div>

      <div className="ay-calendar-layout">
        <MonthCalendar year={year} />
        <aside className="ay-keydates">
          <h4>Key dates</h4>
          {events.length ? (
            <ol>
              {events.map((event, index) => (
                <li key={`${event.date}-${event.label}-${index}`}>
                  <i className={`ay-cal-dot ay-cal-dot--${event.type}`} />
                  <time dateTime={event.date}>{formatDate(event.date)}</time>
                  <span>{event.label}</span>
                </li>
              ))}
            </ol>
          ) : (
            <p className="ay-muted">No calendar dates configured.</p>
          )}
          <button
            type="button"
            className="ay-btn ay-btn--secondary ay-btn--sm"
            onClick={() => {
              onClose();
              onEdit(year);
            }}
            disabled={status === 'archived'}
          >
            <Pencil size={14} /> Edit year dates
          </button>
        </aside>
      </div>
    </Modal>
  );
}

/* ========================================================================== */
/* Main page                                                                  */
/* ========================================================================== */

export default function AcademicYears() {
  const [store, setStore] = useState(() => loadYears());
  const { years, error: loadError } = store;
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [view, setView] = useState('table');
  const [modal, setModal] = useState(null);
  const [confirmState, setConfirmState] = useState(null);
  const [toasts, setToasts] = useState([]);
  const toastSequence = useRef(0);
  const toastTimers = useRef([]);

  const refresh = useCallback(() => {
    setStore(loadYears());
  }, []);

  const notify = useCallback((message, type = 'success') => {
    toastSequence.current += 1;
    const id = toastSequence.current;
    setToasts((previous) => [...previous.slice(-3), { id, message, type }]);
    const timer = window.setTimeout(() => {
      setToasts((previous) => previous.filter((toast) => toast.id !== id));
      toastTimers.current = toastTimers.current.filter((item) => item !== timer);
    }, 4500);
    toastTimers.current.push(timer);
  }, []);

  const dismissToast = useCallback((id) => {
    setToasts((previous) => previous.filter((toast) => toast.id !== id));
  }, []);

  useEffect(
    () => () => {
      toastTimers.current.forEach((timer) => window.clearTimeout(timer));
    },
    []
  );

  const stats = useMemo(() => ay.getAcademicYearStats(years), [years]);
  const currentYear = stats.current;

  const filteredYears = useMemo(() => {
    const query = filters.q.trim().toLowerCase();
    const from = filters.fromYear === '' ? null : Number(filters.fromYear);
    const to = filters.toYear === '' ? null : Number(filters.toYear);

    const filtered = years.filter((year) => {
      const status = ay.getAcademicYearStatus(year);
      if (filters.status !== 'all' && status !== filters.status) return false;
      if (filters.calendar !== 'all' && year.calendarSystem !== filters.calendar) {
        return false;
      }

      const startYear = ay.getYearStartYear(year);
      if (from !== null && (startYear === null || startYear < from)) return false;
      if (to !== null && (startYear === null || startYear > to)) return false;

      if (query) {
        const haystack = [
          year.name,
          year.ecYear,
          year.gcYear,
          year.description,
          ...(year.terms || []).map((term) => term.name),
        ]
          .join(' ')
          .toLowerCase();
        if (!haystack.includes(query)) return false;
      }
      return true;
    });

    return sortYearRecords(filtered, filters.sort);
  }, [years, filters]);

  const total = filteredYears.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const currentPage = Math.min(page, totalPages);
  const startIndex = (currentPage - 1) * pageSize;
  const pageItems = filteredYears.slice(startIndex, startIndex + pageSize);
  const pageNumbers = getPageNumbers(currentPage, totalPages);

  const activeFilters = [
    filters.q
      ? { key: 'q', reset: '', label: `Search: “${filters.q}”` }
      : null,
    filters.status !== 'all'
      ? {
          key: 'status',
          reset: 'all',
          label: `Status: ${STATUS_META[filters.status]?.label || filters.status}`,
        }
      : null,
    filters.calendar !== 'all'
      ? {
          key: 'calendar',
          reset: 'all',
          label: `Calendar: ${filters.calendar === 'BOTH' ? 'E.C. & G.C.' : filters.calendar}`,
        }
      : null,
    filters.fromYear
      ? { key: 'fromYear', reset: '', label: `From ${filters.fromYear}` }
      : null,
    filters.toYear
      ? { key: 'toYear', reset: '', label: `To ${filters.toYear}` }
      : null,
  ].filter(Boolean);

  const setFilter = (key, value) => {
    setPage(1);
    setFilters((previous) => ({ ...previous, [key]: value }));
  };

  const clearFilters = () => {
    setPage(1);
    setFilters({ ...DEFAULT_FILTERS });
  };

  const openCreate = () => setModal({ type: 'form', year: null });
  const openEdit = (year) => setModal({ type: 'form', year });
  const openDetails = (year) => setModal({ type: 'details', yearId: year.id });
  const openDuplicate = (year) => setModal({ type: 'duplicate', source: year });

  const openCalendar = () => {
    const year =
      stats.current ||
      stats.upcoming ||
      years.find((item) => ay.getAcademicYearStatus(item) !== 'archived');
    if (!year) {
      notify('Create an academic year first to view the calendar.', 'info');
      return;
    }
    setModal({ type: 'calendar', yearId: year.id });
  };

  const openCalendarFor = (year) => setModal({ type: 'calendar', yearId: year.id });

  const handleSetCurrent = (year) => {
    if (currentYear?.id === year.id) {
      notify(`${year.name} is already the current academic year.`, 'info');
      return;
    }
    setConfirmState({
      title: `Set ${year.name} as current?`,
      message:
        'Only one academic year can be current at a time. The current-year marker will move; no student or academic records are changed.',
      detail: currentYear
        ? `${currentYear.name} will be marked as not current.`
        : 'No academic year is currently marked as current.',
      confirmLabel: 'Set as current',
      tone: 'primary',
      onConfirm: () => {
        ay.setCurrentAcademicYear(year.id);
        refresh();
        notify(`${year.name} is now the current academic year.`, 'success');
      },
    });
  };

  const handleArchive = (year) => {
    setConfirmState({
      title: `Archive ${year.name}?`,
      message:
        'Archived academic years become read-only but remain available for reports and historical records.',
      detail:
        'Students, grades, results, attendance and timetable records are never deleted when a year is archived.',
      confirmLabel: 'Archive year',
      tone: 'warning',
      onConfirm: () => {
        ay.archiveAcademicYear(year.id);
        refresh();
        notify(`${year.name} archived.`, 'success');
      },
    });
  };

  const handleRestore = (year) => {
    try {
      ay.restoreAcademicYear(year.id);
      refresh();
      notify(`${year.name} restored from archive.`, 'success');
    } catch (error) {
      notify(error.message || 'Could not restore the academic year.', 'error');
    }
  };

  const handleDelete = (year) => {
    const blockers = ay.getDeletionBlockers(year);
    if (blockers.length) {
      setConfirmState({
        title: `Cannot delete ${year.name}`,
        message:
          'This academic year still has dependent academic records. Deleting it would orphan real school data.',
        detail: blockers,
        confirmLabel: 'Close',
        hideCancel: true,
        tone: 'warning',
        onConfirm: () => {},
      });
      return;
    }

    setConfirmState({
      title: `Delete ${year.name}?`,
      message:
        'This permanently removes the academic-year configuration and its term structure.',
      detail:
        'Deletion is only allowed when no grades, sections or enrollments reference this year. This cannot be undone.',
      confirmLabel: 'Delete academic year',
      tone: 'danger',
      onConfirm: () => {
        ay.deleteAcademicYear(year.id);
        refresh();
        notify(`${year.name} deleted.`, 'success');
      },
    });
  };

  const handleExport = () => {
    try {
      const csv = ay.exportAcademicYears(filteredYears);
      ay.downloadCsv(
        `academic-years-${new Date().toISOString().slice(0, 10)}.csv`,
        csv
      );
      notify(
        `Exported ${filteredYears.length} academic year${
          filteredYears.length === 1 ? '' : 's'
        } to CSV.`,
        'success'
      );
    } catch (error) {
      notify(error.message || 'Could not export academic years.', 'error');
    }
  };

  const runConfirm = () => {
    if (!confirmState) return;
    const action = confirmState.onConfirm;
    setConfirmState(null);
    try {
      action?.();
    } catch (error) {
      notify(error.message || 'The action could not be completed.', 'error');
    }
  };

  const closeConfirm = () => setConfirmState(null);

  const calendarYear = modal?.type === 'calendar'
    ? ay.getAcademicYearById(modal.yearId)
    : null;
  const detailYearExists = modal?.type === 'details' ? ay.getAcademicYearById(modal.yearId) : null;

  return (
    <div className="ay-page">
      {loadError ? (
        <div className="ay-alert ay-alert--error" role="alert">
          <AlertTriangle size={18} aria-hidden="true" />
          <div>
            <strong>Academic years could not load</strong>
            <p>{loadError}</p>
          </div>
          <button type="button" className="ay-btn ay-btn--secondary ay-btn--sm" onClick={refresh}>
            <RotateCcw size={14} /> Retry
          </button>
        </div>
      ) : null}

      <header className="ay-hero">
        <span className="ay-orb ay-orb--one" aria-hidden="true" />
        <span className="ay-orb ay-orb--two" aria-hidden="true" />
        <span className="ay-orb ay-orb--three" aria-hidden="true" />
        <svg
          className="ay-hero-art"
          viewBox="0 0 720 360"
          aria-hidden="true"
          focusable="false"
        >
          <defs>
            <linearGradient id="ayHeroArtGradient" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.32" />
              <stop offset="100%" stopColor="#5eead4" stopOpacity="0.08" />
            </linearGradient>
          </defs>
          <circle cx="590" cy="76" r="150" fill="url(#ayHeroArtGradient)" />
          <circle cx="660" cy="270" r="88" fill="rgba(94,234,212,0.12)" />
          <path
            d="M0 286C118 220 218 318 340 258S556 202 720 272V360H0Z"
            fill="rgba(255,255,255,0.06)"
          />
          <path
            d="M0 318C138 262 236 344 356 292S574 238 720 308V360H0Z"
            fill="rgba(255,255,255,0.045)"
          />
        </svg>

        <div className="ay-hero-grid">
          <div className="ay-hero-copy">
            <nav className="ay-breadcrumb" aria-label="Breadcrumb">
              <span>Admin</span>
              <ChevronRight size={13} aria-hidden="true" />
              <span>Academic Management</span>
              <ChevronRight size={13} aria-hidden="true" />
              <strong aria-current="page">Academic Years</strong>
            </nav>

            <p className="ay-hero-eyebrow">
              <Sparkles size={14} aria-hidden="true" />
              Academic planning workspace
            </p>
            <h1 className="ay-hero-title">Academic Years Management</h1>
            <p className="ay-hero-subtitle">
              Plan Ethiopian and Gregorian school years, configure terms and keep
              exactly one active academic calendar for the entire school.
            </p>

            <div className="ay-hero-meta">
              <span className="ay-hero-chip">
                <CheckCircle2 size={14} />
                {currentYear ? `Current: ${currentYear.name}` : 'No current year set'}
              </span>
              <span className="ay-hero-chip">
                <CalendarDays size={14} />
                {years.length} year{years.length === 1 ? '' : 's'} on record
              </span>
              {stats.upcoming ? (
                <span className="ay-hero-chip">
                  <Clock size={14} />
                  Next: {stats.upcoming.name}
                </span>
              ) : null}
            </div>
          </div>

          <div className="ay-hero-actions">
            <button type="button" className="ay-btn ay-btn--glass" onClick={openCalendar}>
              <CalendarDays size={17} /> Academic Calendar
            </button>
            <button
              type="button"
              className="ay-btn ay-btn--hero-primary"
              onClick={openCreate}
            >
              <Plus size={18} /> Create Academic Year
            </button>
          </div>
        </div>
      </header>

      <section className="ay-kpis" aria-label="Academic year statistics">
        <KpiCard
          index={0}
          icon={Calendar}
          tone="blue"
          label="Total Academic Years"
          value={stats.total}
          caption={`${stats.counts.archived} archived · ${stats.counts.completed} completed`}
        />
        <KpiCard
          index={1}
          icon={CheckCircle2}
          tone="teal"
          label="Current Academic Year"
          value={currentYear ? currentYear.name : 'Not set'}
          caption={
            currentYear
              ? stats.currentTerm
                ? `Current term: ${stats.currentTerm.name}`
                : 'No active term configured'
              : 'Set a year as current to anchor the school calendar'
          }
        />
        <KpiCard
          index={2}
          icon={Clock}
          tone="indigo"
          label="Upcoming Academic Year"
          value={stats.upcoming ? stats.upcoming.name : 'Not scheduled'}
          caption={
            stats.upcoming
              ? `Starts ${formatDate(stats.upcoming.startDate)}`
              : 'Create or schedule the next academic year'
          }
        />
        <KpiCard
          index={3}
          icon={Layers}
          tone="amber"
          label="Total Terms"
          value={stats.totalTerms}
          caption={`Across ${stats.total} academic year${stats.total === 1 ? '' : 's'}`}
        />
      </section>

      <section className="ay-spotlight" aria-labelledby="ay-spotlight-title">
        {currentYear ? (
          <div className="ay-spotlight-card">
            <span className="ay-spotlight-orb ay-spotlight-orb--one" aria-hidden="true" />
            <span className="ay-spotlight-orb ay-spotlight-orb--two" aria-hidden="true" />
            <div className="ay-spotlight-main">
              <div className="ay-spotlight-head">
                <span className="ay-spotlight-eyebrow">
                  <CheckCircle2 size={15} /> Current academic year
                </span>
                <StatusBadge status="current" />
              </div>
              <h2 id="ay-spotlight-title" className="ay-spotlight-title">
                {currentYear.name}
              </h2>
              <p className="ay-spotlight-sub">
                <span>{currentYear.ecYear || 'E.C. not set'}</span>
                <span aria-hidden="true">·</span>
                <span>{currentYear.gcYear || 'G.C. not set'}</span>
              </p>

              <div className="ay-spotlight-stats">
                <div>
                  <span>Starts</span>
                  <strong>{formatDate(currentYear.startDate)}</strong>
                </div>
                <div>
                  <span>Ends</span>
                  <strong>{formatDate(currentYear.endDate)}</strong>
                </div>
                <div>
                  <span>Current term</span>
                  <strong>{stats.currentTerm ? stats.currentTerm.name : 'Not in session'}</strong>
                </div>
                <div>
                  <span>Terms</span>
                  <strong>{currentYear.terms.length}</strong>
                </div>
              </div>

              <div className="ay-spotlight-progress">
                {(() => {
                  const progress = ay.getAcademicYearProgress(currentYear);
                  if (!progress.available) {
                    return (
                      <p className="ay-spotlight-note ay-spotlight-note--muted">
                        Progress is unavailable until valid start and end dates are
                        set for this academic year.
                      </p>
                    );
                  }
                  return (
                    <>
                      <div className="ay-spotlight-progress-head">
                        <span>
                          {progress.phase === 'completed'
                            ? 'Academic year completed'
                            : progress.phase === 'upcoming'
                              ? 'Academic year starts soon'
                              : 'Academic year progress'}
                        </span>
                        <strong>{progress.percent}%</strong>
                      </div>
                      <ProgressBar progress={progress} />
                      <p className="ay-spotlight-note">
                        {progress.phase === 'completed'
                          ? 'This academic year has ended. It can now be archived.'
                          : `${progress.daysRemaining} day${
                              progress.daysRemaining === 1 ? '' : 's'
                            } remaining · day ${progress.daysElapsed} of ${progress.daysTotal}`}
                      </p>
                    </>
                  );
                })()}
              </div>
            </div>

            <aside className="ay-spotlight-side">
              <div className="ay-spotlight-term">
                <span className="ay-spotlight-side-label">
                  {stats.currentTerm?.derivedStatus === 'active'
                    ? 'Current term'
                    : stats.currentTerm?.derivedStatus === 'upcoming'
                      ? 'Next term'
                      : stats.currentTerm?.derivedStatus === 'completed'
                        ? 'Last term'
                        : 'Current term'}
                </span>
                <strong>
                  {stats.currentTerm ? stats.currentTerm.name : 'Not configured'}
                </strong>
                <span>
                  {stats.currentTerm
                    ? formatRange(stats.currentTerm.startDate, stats.currentTerm.endDate)
                    : 'Add terms to track the active period'}
                </span>
                {stats.currentTerm ? (
                  <TermStatusBadge status={ay.getTermStatus(stats.currentTerm)} />
                ) : null}
              </div>

              <div className="ay-spotlight-actions">
                <button
                  type="button"
                  className="ay-btn ay-btn--glass"
                  onClick={() => openDetails(currentYear)}
                >
                  <Eye size={16} /> View details
                </button>
                <button
                  type="button"
                  className="ay-btn ay-btn--glass"
                  onClick={() => openEdit(currentYear)}
                >
                  <Pencil size={16} /> Edit year
                </button>
                <button
                  type="button"
                  className="ay-btn ay-btn--glass"
                  onClick={() => openCalendarFor(currentYear)}
                >
                  <CalendarDays size={16} /> Calendar
                </button>
              </div>
            </aside>
          </div>
        ) : (
          <div className="ay-spotlight-card ay-spotlight-card--empty">
            <div className="ay-spotlight-main">
              <span className="ay-spotlight-eyebrow">
                <Info size={15} /> No current academic year
              </span>
              <h2 id="ay-spotlight-title" className="ay-spotlight-title">
                Anchor the school calendar
              </h2>
              <p className="ay-spotlight-sub">
                Set one academic year as current so admissions, attendance,
                results and reports all share the same active period.
              </p>
              <div className="ay-spotlight-actions">
                <button
                  type="button"
                  className="ay-btn ay-btn--hero-primary"
                  onClick={openCreate}
                >
                  <Plus size={16} /> Create academic year
                </button>
                {years.length ? (
                  <button
                    type="button"
                    className="ay-btn ay-btn--glass"
                    onClick={() => openDetails(years[0])}
                  >
                    <Eye size={16} /> Browse directory
                  </button>
                ) : null}
              </div>
            </div>
          </div>
        )}
      </section>

      <section className="ay-directory" aria-labelledby="ay-directory-title">
        <header className="ay-directory-head">
          <div>
            <h2 id="ay-directory-title">Academic years directory</h2>
            <p>Search, filter, export and manage every academic period.</p>
          </div>
          <div className="ay-directory-tools">
            <span className="ay-result-count">
              {total} result{total === 1 ? '' : 's'}
            </span>
            <div className="ay-view-toggle" role="group" aria-label="Directory view">
              <button
                type="button"
                className={`ay-view-btn${view === 'table' ? ' is-active' : ''}`}
                onClick={() => setView('table')}
                aria-pressed={view === 'table'}
                aria-label="Table view"
                title="Table view"
              >
                <List size={16} />
              </button>
              <button
                type="button"
                className={`ay-view-btn${view === 'cards' ? ' is-active' : ''}`}
                onClick={() => setView('cards')}
                aria-pressed={view === 'cards'}
                aria-label="Card view"
                title="Card view"
              >
                <LayoutGrid size={16} />
              </button>
            </div>
            <button
              type="button"
              className="ay-btn ay-btn--secondary ay-btn--sm"
              onClick={handleExport}
              disabled={total === 0}
            >
              <Download size={15} /> Export CSV
            </button>
          </div>
        </header>

        <div className="ay-toolbar">
          <div className="ay-search">
            <Search size={17} className="ay-search-icon" aria-hidden="true" />
            <input
              type="search"
              className="ay-input ay-search-input"
              placeholder="Search by year, E.C., G.C. or term…"
              value={filters.q}
              onChange={(event) => setFilter('q', event.target.value)}
              aria-label="Search academic years"
            />
            {filters.q ? (
              <button
                type="button"
                className="ay-search-clear"
                onClick={() => setFilter('q', '')}
                aria-label="Clear search"
              >
                <X size={14} />
              </button>
            ) : null}
          </div>

          <div className="ay-filter-row">
            <label className="ay-filter">
              <SlidersHorizontal size={15} aria-hidden="true" />
              <span>Status</span>
              <select
                className="ay-select ay-select--sm"
                value={filters.status}
                onChange={(event) => setFilter('status', event.target.value)}
              >
                <option value="all">All statuses</option>
                <option value="current">Current</option>
                <option value="upcoming">Upcoming</option>
                <option value="completed">Completed</option>
                <option value="draft">Draft</option>
                <option value="archived">Archived</option>
              </select>
            </label>

            <label className="ay-filter">
              <CalendarDays size={15} aria-hidden="true" />
              <span>Calendar</span>
              <select
                className="ay-select ay-select--sm"
                value={filters.calendar}
                onChange={(event) => setFilter('calendar', event.target.value)}
              >
                <option value="all">All calendars</option>
                <option value="BOTH">E.C. &amp; G.C.</option>
                <option value="EC">Ethiopian (E.C.)</option>
                <option value="GC">Gregorian (G.C.)</option>
              </select>
            </label>

            <label className="ay-filter ay-filter--year">
              <span>From year</span>
              <input
                type="number"
                className="ay-input ay-input--sm"
                value={filters.fromYear}
                onChange={(event) => setFilter('fromYear', event.target.value)}
                placeholder="e.g. 2020"
                min="1900"
                max="2300"
                aria-label="Filter from year"
              />
            </label>

            <label className="ay-filter ay-filter--year">
              <span>To year</span>
              <input
                type="number"
                className="ay-input ay-input--sm"
                value={filters.toYear}
                onChange={(event) => setFilter('toYear', event.target.value)}
                placeholder="e.g. 2030"
                min="1900"
                max="2300"
                aria-label="Filter to year"
              />
            </label>

            <label className="ay-filter">
              <span>Sort</span>
              <select
                className="ay-select ay-select--sm"
                value={filters.sort}
                onChange={(event) => setFilter('sort', event.target.value)}
              >
                <option value="newest">Newest first</option>
                <option value="oldest">Oldest first</option>
                <option value="startAsc">Start date ↑</option>
                <option value="startDesc">Start date ↓</option>
                <option value="endAsc">End date ↑</option>
                <option value="endDesc">End date ↓</option>
                <option value="name">Name A–Z</option>
              </select>
            </label>
          </div>
        </div>

        {activeFilters.length ? (
          <div className="ay-active-filters">
            <span className="ay-active-label">Active filters</span>
            {activeFilters.map((filter) => (
              <button
                key={filter.key}
                type="button"
                className="ay-chip"
                onClick={() => setFilter(filter.key, filter.reset)}
              >
                {filter.label}
                <X size={12} aria-hidden="true" />
              </button>
            ))}
            <button type="button" className="ay-link-btn" onClick={clearFilters}>
              Clear all
            </button>
          </div>
        ) : null}

        {years.length === 0 ? (
          <div className="ay-empty ay-empty--directory">
            <span className="ay-empty-icon">
              <CalendarDays size={24} />
            </span>
            <h3>No academic years yet</h3>
            <p>Create the first academic year to start planning terms and the school calendar.</p>
            <button type="button" className="ay-btn ay-btn--primary" onClick={openCreate}>
              <Plus size={16} /> Create Academic Year
            </button>
          </div>
        ) : total === 0 ? (
          <div className="ay-empty ay-empty--directory">
            <span className="ay-empty-icon">
              <Search size={24} />
            </span>
            <h3>No academic years match these filters</h3>
            <p>Try a different search, status, calendar or year range.</p>
            <button type="button" className="ay-btn ay-btn--secondary" onClick={clearFilters}>
              Clear filters
            </button>
          </div>
        ) : view === 'table' ? (
          <div className="ay-table-wrap">
            <table className="ay-table">
              <caption className="ay-sr-only">Academic years directory</caption>
              <thead>
                <tr>
                  <th scope="col">Academic year</th>
                  <th scope="col">Ethiopian</th>
                  <th scope="col">Gregorian</th>
                  <th scope="col">Period</th>
                  <th scope="col">Terms</th>
                  <th scope="col">Status</th>
                  <th scope="col" className="ay-col-optional">
                    Created
                  </th>
                  <th scope="col" className="ay-col-actions">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {pageItems.map((year, index) => {
                  const status = ay.getAcademicYearStatus(year);
                  const term = status === 'current' ? ay.getCurrentTerm(year) : null;
                  const activeTerm =
                    term && term.derivedStatus === 'active' ? term : null;
                  return (
                    <tr
                      key={year.id}
                      className={status === 'current' ? 'is-current' : ''}
                      style={{ '--i': index }}
                    >
                      <td>
                        <button
                          type="button"
                          className="ay-year-link"
                          onClick={() => openDetails(year)}
                        >
                          {year.name}
                        </button>
                        {year.isDraft ? (
                          <span className="ay-draft-flag">Draft</span>
                        ) : null}
                        <span className="ay-year-sub">
                          {year.description || 'No description'}
                        </span>
                      </td>
                      <td>
                        <span className="ay-cell-strong">{year.ecYear || '—'}</span>
                      </td>
                      <td>
                        <span className="ay-cell-strong">{year.gcYear || '—'}</span>
                      </td>
                      <td>
                        <span className="ay-cell-strong">
                          {formatDate(year.startDate)}
                        </span>
                        <span className="ay-year-sub">
                          to {formatDate(year.endDate)}
                        </span>
                      </td>
                      <td>
                        <span className="ay-cell-strong">
                          {year.terms.length} term{year.terms.length === 1 ? '' : 's'}
                        </span>
                        <span className="ay-year-sub">
                          {activeTerm ? activeTerm.name : 'No active term'}
                        </span>
                      </td>
                      <td>
                        <StatusBadge status={status} />
                      </td>
                      <td className="ay-col-optional">
                        <span className="ay-muted">
                          {formatDate(year.createdAt?.slice(0, 10))}
                        </span>
                      </td>
                      <td className="ay-col-actions">
                        <RowActions
                          year={year}
                          status={status}
                          onView={openDetails}
                          onEdit={openEdit}
                          onSetCurrent={handleSetCurrent}
                          onDuplicate={openDuplicate}
                          onArchive={handleArchive}
                          onRestore={handleRestore}
                          onDelete={handleDelete}
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="ay-cards">
            {pageItems.map((year, index) => {
              const status = ay.getAcademicYearStatus(year);
              const progress = ay.getAcademicYearProgress(year);
              const term = status === 'current' ? ay.getCurrentTerm(year) : null;
              return (
                <article
                  key={year.id}
                  className={`ay-year-card ay-year-card--${status}`}
                  style={{ '--i': index }}
                >
                  <div className="ay-year-card-top">
                    <span className="ay-year-card-icon">
                      <CalendarDays size={20} />
                    </span>
                    <StatusBadge status={status} />
                  </div>
                  <button
                    type="button"
                    className="ay-year-card-title"
                    onClick={() => openDetails(year)}
                  >
                    {year.name}
                  </button>
                  <p className="ay-year-card-sub">
                    {year.ecYear || 'E.C. not set'} · {year.gcYear || 'G.C. not set'}
                  </p>

                  <dl className="ay-year-card-meta">
                    <div>
                      <dt>Starts</dt>
                      <dd>{formatDate(year.startDate)}</dd>
                    </div>
                    <div>
                      <dt>Ends</dt>
                      <dd>{formatDate(year.endDate)}</dd>
                    </div>
                    <div>
                      <dt>Terms</dt>
                      <dd>{year.terms.length}</dd>
                    </div>
                    <div>
                      <dt>Current term</dt>
                      <dd>
                        {term && term.derivedStatus === 'active'
                          ? term.name
                          : 'Not in session'}
                      </dd>
                    </div>
                  </dl>

                  {progress.available ? <ProgressBar progress={progress} compact /> : null}

                  <div className="ay-year-card-footer">
                    <button
                      type="button"
                      className="ay-btn ay-btn--secondary ay-btn--sm"
                      onClick={() => openDetails(year)}
                    >
                      <Eye size={14} /> View details
                    </button>
                    <RowActions
                      year={year}
                      status={status}
                      showView={false}
                      onView={openDetails}
                      onEdit={openEdit}
                      onSetCurrent={handleSetCurrent}
                      onDuplicate={openDuplicate}
                      onArchive={handleArchive}
                      onRestore={handleRestore}
                      onDelete={handleDelete}
                    />
                  </div>
                </article>
              );
            })}
          </div>
        )}

        {total > 0 ? (
          <div className="ay-pagination">
            <div className="ay-page-info">
              Showing{' '}
              <strong>
                {startIndex + 1}–{Math.min(startIndex + pageSize, total)}
              </strong>{' '}
              of <strong>{total}</strong> academic year{total === 1 ? '' : 's'}
            </div>
            <div className="ay-page-controls">
              <label className="ay-page-size">
                <span>Rows</span>
                <select
                  className="ay-select ay-select--sm"
                  value={pageSize}
                  onChange={(event) => {
                    setPageSize(Number(event.target.value));
                    setPage(1);
                  }}
                >
                  {PAGE_SIZES.map((size) => (
                    <option key={size} value={size}>
                      {size}
                    </option>
                  ))}
                </select>
              </label>

              <button
                type="button"
                className="ay-page-btn"
                onClick={() => setPage(currentPage - 1)}
                disabled={currentPage <= 1}
                aria-label="Previous page"
              >
                <ChevronLeft size={16} />
              </button>

              {pageNumbers.map((pageNumber, index) =>
                pageNumber === '…' ? (
                  <span key={`ellipsis-${index}`} className="ay-page-ellipsis" aria-hidden="true">
                    …
                  </span>
                ) : (
                  <button
                    key={pageNumber}
                    type="button"
                    className={`ay-page-btn${pageNumber === currentPage ? ' is-active' : ''}`}
                    onClick={() => setPage(pageNumber)}
                    aria-current={pageNumber === currentPage ? 'page' : undefined}
                  >
                    {pageNumber}
                  </button>
                )
              )}

              <button
                type="button"
                className="ay-page-btn"
                onClick={() => setPage(currentPage + 1)}
                disabled={currentPage >= totalPages}
                aria-label="Next page"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        ) : null}
      </section>

      {modal?.type === 'form' ? (
        <AcademicYearFormModal
          year={modal.year}
          onClose={() => setModal(null)}
          onSaved={refresh}
          notify={notify}
        />
      ) : null}

      {modal?.type === 'details' && detailYearExists ? (
        <YearDetailsDrawer
          id={modal.yearId}
          onClose={() => setModal(null)}
          onEdit={openEdit}
          onDuplicate={openDuplicate}
          onSetCurrent={handleSetCurrent}
          onRestore={handleRestore}
          onDelete={handleDelete}
          onChanged={refresh}
          notify={notify}
        />
      ) : null}

      {modal?.type === 'calendar' ? (
        <CalendarModal
          year={calendarYear}
          onClose={() => setModal(null)}
          onEdit={openEdit}
        />
      ) : null}

      {modal?.type === 'duplicate' ? (
        <DuplicateModal
          source={modal.source}
          onClose={() => setModal(null)}
          onSaved={refresh}
          notify={notify}
        />
      ) : null}

      {confirmState ? (
        <ConfirmDialog
          title={confirmState.title}
          message={confirmState.message}
          detail={confirmState.detail}
          confirmLabel={confirmState.confirmLabel}
          cancelLabel={confirmState.cancelLabel}
          tone={confirmState.tone}
          hideCancel={confirmState.hideCancel}
          onCancel={closeConfirm}
          onConfirm={runConfirm}
        />
      ) : null}

      <ToastStack toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}
