
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  Users, UserCheck, Clock, Ban, Unlink, Link2, Plus, Download, MoreHorizontal, Search, SlidersHorizontal,
  LayoutGrid, List, X, Eye, Pencil, ShieldCheck, KeyRound, Trash2, Power, RefreshCw, Check, ChevronLeft,
  ChevronRight, AlertTriangle, Info, Lock, History, ScrollText,
} from 'lucide-react';
import '../../styles/admin/ManageUsers.css';
import {
  ROLES, ROLE_GROUPS, PERMISSION_MODULES, PERMISSION_ACTIONS, USER_STATUSES, PROFILE_TYPES, PROFILE_TYPE_LABELS, AUDIT_ACTIONS,
  initializeUserData, getSnapshot, getRole, getUserStatistics, matchesUserQuery, getCurrentActor, getAssignableRoles,
  checkUserAction, addUser, updateUser, deleteUser, bulkChangeStatus, bulkChangeRole, requestPasswordReset, saveRolePermissions,
  exportUsersToCSV, buildReportFilename, downloadCSV, toDateInputValue,
} from '../../services/userService';

/* ------------------------------------------------------------------ */
/* Constants + helpers                                                 */
/* ------------------------------------------------------------------ */

const PAGE_SIZES = [8, 12, 24, 48];
const DEFAULT_FILTERS = { query: '', roleId: '', status: '', profileType: '', linked: '', dateFrom: '', dateTo: '' };
const SORTS = [{ key: 'name', label: 'Name (A-Z)' }, { key: 'newest', label: 'Newest first' }, { key: 'lastLogin', label: 'Last login' }];
const TABS = [
  { key: 'directory', label: 'User Directory', icon: Users },
  { key: 'roles', label: 'Roles & Permissions', icon: ShieldCheck },
  { key: 'security', label: 'Security Center', icon: Lock },
  { key: 'audit', label: 'Audit Log', icon: ScrollText },
];
const STATUS_TONE = { Active: 'active', Pending: 'pending', Suspended: 'suspended', Inactive: 'inactive' };

const formatDate = (v) => {
  if (!v) return '-';
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? '-' : d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
};
const formatDateTime = (v) => {
  if (!v) return '-';
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? '-' : d.toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
};
const formatRelative = (iso) => {
  if (!iso) return 'Not available';
  const t = new Date(iso).getTime();
  if (Number.isNaN(t)) return 'Not available';
  const s = (Date.now() - t) / 1000;
  if (s < 60) return 'Just now';
  if (s < 3600) return `${Math.floor(s / 60)} min ago`;
  if (s < 86400) return `${Math.floor(s / 3600)} h ago`;
  if (s < 86400 * 30) return `${Math.floor(s / 86400)} d ago`;
  return formatDate(iso);
};
const hashIndex = (s, mod) => { let h = 0; for (let i = 0; i < s.length; i += 1) h = (h * 31 + s.charCodeAt(i)) >>> 0; return h % mod; };
const prefersReducedMotion = () => typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function useMediaQuery(query) {
  const [matches, setMatches] = useState(() => (typeof window !== 'undefined' && window.matchMedia ? window.matchMedia(query).matches : false));
  useEffect(() => {
    if (!window.matchMedia) return undefined;
    const mq = window.matchMedia(query);
    const h = (e) => setMatches(e.matches);
    setMatches(mq.matches);
    mq.addEventListener('change', h);
    return () => mq.removeEventListener('change', h);
  }, [query]);
  return matches;
}

function useCountUp(target) {
  const reducedMotion = prefersReducedMotion();
  const [v, setV] = useState(() => (reducedMotion ? target : 0));
  const prev = useRef(0);
  useEffect(() => {
    if (reducedMotion) { prev.current = target; return undefined; }
    const from = prev.current;
    const start = performance.now();
    let raf;
    const tick = (now) => {
      const p = Math.min(1, (now - start) / 700);
      setV(Math.round(from + (target - from) * (1 - (1 - p) ** 3)));
      if (p < 1) raf = requestAnimationFrame(tick); else prev.current = target;
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, reducedMotion]);
  return reducedMotion ? target : v;
}

/* ------------------------------------------------------------------ */
/* Overlay / menu / toast primitives                                   */
/* ------------------------------------------------------------------ */

const overlayStack = [];

function Overlay({ onClose, variant = 'modal', size = 'lg', labelledBy, closeOnBackdrop = true, children }) {
  const token = useRef({});
  const dialogRef = useRef(null);
  const closeRef = useRef(onClose);
  useLayoutEffect(() => {
    closeRef.current = onClose;
  }, [onClose]);
  useEffect(() => {
    const t = token.current;
    overlayStack.push(t);
    document.body.style.overflow = 'hidden';
    const onKey = (e) => { if (e.key === 'Escape' && overlayStack[overlayStack.length - 1] === t && closeRef.current) closeRef.current(); };
    document.addEventListener('keydown', onKey);
    if (dialogRef.current) dialogRef.current.focus({ preventScroll: true });
    return () => {
      document.removeEventListener('keydown', onKey);
      const i = overlayStack.indexOf(t);
      if (i >= 0) overlayStack.splice(i, 1);
      document.body.style.overflow = overlayStack.length ? 'hidden' : '';
    };
  }, []);
  const onDown = (e) => { if (closeOnBackdrop && e.target === e.currentTarget && closeRef.current) closeRef.current(); };
  return createPortal(
    <div className={`users-module um-overlay um-overlay--${variant}`} onMouseDown={onDown}>
      <div ref={dialogRef} tabIndex={-1} role="dialog" aria-modal="true" aria-labelledby={labelledBy} className={`um-dialog um-dialog--${variant} um-dialog--${size}`}>
        {children}
      </div>
    </div>,
    document.body,
  );
}

function DialogHeader({ id, title, subtitle, onClose, icon: Icon }) {
  return (
    <div className="um-dialog__header">
      {Icon && <span className="um-dialog__icon"><Icon size={20} /></span>}
      <div className="flex-grow-1">
        <h2 id={id} className="um-dialog__title">{title}</h2>
        {subtitle && <p className="um-dialog__subtitle">{subtitle}</p>}
      </div>
      <button type="button" className="um-icon-btn" onClick={onClose} aria-label="Close dialog"><X size={18} /></button>
    </div>
  );
}

function ActionMenu({ items, label = 'Actions', buttonClassName = 'um-icon-btn', buttonContent = null, width = 220 }) {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState({ top: 0, right: 0, up: false });
  const btnRef = useRef(null);
  const menuRef = useRef(null);
  const toggle = (e) => {
    e.stopPropagation();
    if (open) { setOpen(false); return; }
    const r = btnRef.current.getBoundingClientRect();
    const h = items.length * 40 + 16;
    const up = window.innerHeight - r.bottom < h + 12 && r.top > h;
    setPos({ top: up ? window.innerHeight - r.top + 6 : r.bottom + 6, right: Math.max(8, window.innerWidth - r.right), up });
    setOpen(true);
  };
  useEffect(() => {
    if (!open) return undefined;
    const down = (e) => { if ((menuRef.current && menuRef.current.contains(e.target)) || (btnRef.current && btnRef.current.contains(e.target))) return; setOpen(false); };
    const close = () => setOpen(false);
    const key = (e) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('mousedown', down);
    document.addEventListener('keydown', key);
    window.addEventListener('scroll', close, true);
    window.addEventListener('resize', close);
    return () => {
      document.removeEventListener('mousedown', down);
      document.removeEventListener('keydown', key);
      window.removeEventListener('scroll', close, true);
      window.removeEventListener('resize', close);
    };
  }, [open]);
  return (
    <>
      <button ref={btnRef} type="button" className={buttonClassName} aria-haspopup="menu" aria-expanded={open} aria-label={label} onClick={toggle}>
        {buttonContent || <MoreHorizontal size={18} />}
      </button>
      {open && createPortal(
        <div className="users-module">
          <div ref={menuRef} role="menu" className={`um-menu ${pos.up ? 'is-up' : ''}`} style={{ right: pos.right, width, ...(pos.up ? { bottom: pos.top } : { top: pos.top }) }}>
            {items.map((it, i) => (it.divider
              ? <div key={`d${i}`} className="um-menu__divider" role="separator" />
              : (
                <button
                  key={it.label} type="button" role="menuitem" disabled={it.disabled} title={it.disabled ? it.hint : undefined}
                  className={`um-menu__item ${it.danger ? 'is-danger' : ''}`}
                  onClick={() => { setOpen(false); it.onClick(); }}
                >
                  {it.icon && <it.icon size={16} />}<span>{it.label}</span>
                </button>
              )))}
          </div>
        </div>,
        document.body,
      )}
    </>
  );
}

function ToastStack({ toasts, onDismiss }) {
  return createPortal(
    <div className="users-module um-toast-stack" aria-live="polite">
      {toasts.map((t) => (
        <div key={t.id} className={`toast show um-toast um-toast--${t.type}`} role="status">
          <span className="um-toast__bar" />
          <div className="um-toast__body">{t.message}</div>
          <button type="button" className="um-icon-btn um-icon-btn--sm" aria-label="Dismiss notification" onClick={() => onDismiss(t.id)}><X size={14} /></button>
        </div>
      ))}
    </div>,
    document.body,
  );
}

/* ------------------------------------------------------------------ */
/* Small presentational components                                     */
/* ------------------------------------------------------------------ */

function Avatar({ name, size = 40 }) {
  const parts = (name || '?').trim().split(/\s+/);
  const initials = ((parts[0] || '?')[0] + (parts.length > 1 ? parts[parts.length - 1][0] : '')).toUpperCase();
  return <span className={`um-avatar um-avatar--${hashIndex(name || '', 5)}`} style={{ width: size, height: size, fontSize: size * 0.36 }} aria-hidden="true">{initials}</span>;
}

const RoleBadge = ({ role }) => (role ? <span className={`um-role um-role--${role.group}`}>{role.name}</span> : <span className="um-role">Unknown</span>);
const StatusBadge = ({ status }) => <span className={`um-status um-status--${STATUS_TONE[status] || 'inactive'}`}><i className="um-status__dot" />{status}</span>;

function ProfileCell({ user }) {
  if (!user.profileType) return <span className="um-unlinked"><Unlink size={13} /> Unlinked</span>;
  return (
    <div className="um-profile-cell">
      <span className={`um-ptype um-ptype--${user.profileType}`}>{PROFILE_TYPE_LABELS[user.profileType]}</span>
      <span className={`small ${user.profileMissing ? 'text-danger' : 'text-muted'}`}>{user.profileMissing ? 'Record not found' : user.profile.profileId}</span>
    </div>
  );
}

function KpiCard({ icon: Icon, label, value, sub, tone, index }) {
  const shown = useCountUp(value);
  return (
    <div className="col-12 col-sm-6 col-xl">
      <div className={`um-kpi um-kpi--${tone}`} style={{ '--um-i': index }}>
        <span className="um-kpi__icon"><Icon size={20} /></span>
        <div className="um-kpi__body">
          <div className="um-kpi__label">{label}</div>
          <div className="um-kpi__value">{shown}</div>
          <div className="um-kpi__sub">{sub}</div>
        </div>
      </div>
    </div>
  );
}

function EmptyState({ icon: Icon = Users, title, text, action }) {
  return (
    <div className="um-empty">
      <div className="um-empty__art"><Icon size={30} /></div>
      <h3>{title}</h3>
      <p>{text}</p>
      {action}
    </div>
  );
}

function Pagination({ page, totalPages, onPage }) {
  if (totalPages <= 1) return null;
  const start = Math.max(1, Math.min(page - 2, totalPages - 4));
  const nums = [];
  for (let i = start; i <= Math.min(totalPages, start + 4); i += 1) nums.push(i);
  return (
    <nav aria-label="User pages">
      <ul className="pagination um-pagination mb-0">
        <li className={`page-item ${page === 1 ? 'disabled' : ''}`}><button type="button" className="page-link" aria-label="Previous page" onClick={() => onPage(page - 1)}><ChevronLeft size={16} /></button></li>
        {nums.map((n) => (
          <li key={n} className={`page-item ${n === page ? 'active' : ''}`}><button type="button" className="page-link" aria-current={n === page ? 'page' : undefined} onClick={() => onPage(n)}>{n}</button></li>
        ))}
        <li className={`page-item ${page === totalPages ? 'disabled' : ''}`}><button type="button" className="page-link" aria-label="Next page" onClick={() => onPage(page + 1)}><ChevronRight size={16} /></button></li>
      </ul>
    </nav>
  );
}

function Field({ id, label, required, error, hint, className = 'col-md-6', children }) {
  return (
    <div className={className}>
      <label htmlFor={id} className="form-label um-label">{label}{required && <span className="text-danger ms-1" aria-hidden="true">*</span>}</label>
      {children}
      {hint && !error && <div className="form-text">{hint}</div>}
      {error && <div className="invalid-feedback d-block" role="alert">{error}</div>}
    </div>
  );
}

function RoleOptions({ assignable }) {
  const ok = new Set(assignable.map((r) => r.id));
  return ROLE_GROUPS.map((g) => (
    <optgroup key={g.id} label={g.label}>
      {ROLES.filter((r) => r.group === g.id).map((r) => (
        <option key={r.id} value={r.id} disabled={!ok.has(r.id)}>{r.name}{ok.has(r.id) ? '' : ' (requires higher authority)'}</option>
      ))}
    </optgroup>
  ));
}

/* ------------------------------------------------------------------ */
/* Profile picker (links to EXISTING profiles only)                    */
/* ------------------------------------------------------------------ */

function ProfilePicker({ profileType, profileId, roleId, profiles, users, excludeUserId, onChange, error }) {
  const role = getRole(roleId);
  const allowed = role ? role.profileTypes : PROFILE_TYPES;
  const [q, setQ] = useState('');
  const selected = profileType ? (profiles[profileType] || []).find((p) => p.id === profileId) : null;
  const options = useMemo(() => {
    if (!profileType) return [];
    const taken = new Set(users.filter((u) => u.id !== excludeUserId && u.profileType === profileType).map((u) => u.profileId));
    const ql = q.trim().toLowerCase();
    return (profiles[profileType] || [])
      .filter((p) => !taken.has(p.id))
      .filter((p) => !ql || `${p.fullName} ${p.profileId} ${p.detail}`.toLowerCase().includes(ql))
      .slice(0, 30);
  }, [profileType, profiles, users, excludeUserId, q]);

  return (
    <div className="um-picker">
      <div className="um-pills" role="radiogroup" aria-label="Profile type">
        <button type="button" role="radio" aria-checked={!profileType} className={`um-pill ${!profileType ? 'is-active' : ''}`} onClick={() => { onChange('', ''); setQ(''); }}>No profile</button>
        {allowed.map((t) => (
          <button key={t} type="button" role="radio" aria-checked={profileType === t} className={`um-pill ${profileType === t ? 'is-active' : ''}`} onClick={() => { onChange(t, ''); setQ(''); }}>{PROFILE_TYPE_LABELS[t]}</button>
        ))}
      </div>
      {profileType && !selected && (
        <>
          <div className="um-search um-search--sm mt-2">
            <Search size={16} />
            <input className="form-control" placeholder={`Search ${PROFILE_TYPE_LABELS[profileType].toLowerCase()} profiles by name or ID`} value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search profiles" />
          </div>
          <ul className="um-picker__list" role="listbox" aria-label="Available profiles">
            {options.length === 0 && <li className="um-picker__empty">No unlinked {PROFILE_TYPE_LABELS[profileType].toLowerCase()} profiles match. Profiles must already exist in their own module.</li>}
            {options.map((p) => (
              <li key={p.id}>
                <button type="button" role="option" aria-selected="false" className="um-picker__item" onClick={() => onChange(profileType, p.id)}>
                  <Avatar name={p.fullName} size={32} />
                  <span className="flex-grow-1 text-start"><strong>{p.fullName}</strong><span className="d-block small text-muted">{p.profileId}{p.detail ? ` · ${p.detail}` : ''}</span></span>
                  {p.isDemo && <span className="um-tag">Demo</span>}
                </button>
              </li>
            ))}
          </ul>
        </>
      )}
      {selected && (
        <div className="um-linked-card">
          <Avatar name={selected.fullName} size={40} />
          <div className="flex-grow-1">
            <div className="fw-semibold">{selected.fullName}</div>
            <div className="small text-muted">{PROFILE_TYPE_LABELS[profileType]} · {selected.profileId}{selected.detail ? ` · ${selected.detail}` : ''}</div>
          </div>
          <span className="um-status um-status--active"><i className="um-status__dot" />Linked</span>
          <button type="button" className="um-icon-btn um-icon-btn--sm" aria-label="Change selected profile" onClick={() => onChange(profileType, '')}><X size={14} /></button>
        </div>
      )}
      {!profileType && <div className="um-unlinked-note"><Unlink size={14} /> Unlinked: this account is not connected to any student, teacher, staff or parent record.</div>}
      {error && <div className="invalid-feedback d-block" role="alert">{error}</div>}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Add / edit form                                                     */
/* ------------------------------------------------------------------ */

const EMPTY_FORM = { firstName: '', middleName: '', lastName: '', username: '', email: '', phone: '', roleId: '', status: 'Pending', profileType: '', profileId: '', notes: '', setupMode: 'invitation' };

function UserFormModal({ user, snap, assignable, onSubmit, onClose, saving }) {
  const editing = Boolean(user);
  const [form, setForm] = useState(() => (user ? { ...EMPTY_FORM, ...user, setupMode: 'later' } : EMPTY_FORM));
  const [errors, setErrors] = useState({});
  const [userTouched, setUserTouched] = useState(editing);
  const bodyRef = useRef(null);

  const set = (name, value) => {
    setForm((f) => ({ ...f, [name]: value }));
    setErrors((e) => { if (!e[name]) return e; const n = { ...e }; delete n[name]; return n; });
  };
  const bind = (name) => ({ id: `uf-${name}`, value: form[name] || '', onChange: (e) => set(name, e.target.value), className: `form-control ${errors[name] ? 'is-invalid' : ''}`, 'aria-invalid': errors[name] ? true : undefined });

  const suggestUsername = () => {
    if (userTouched || !form.firstName.trim() || !form.lastName.trim()) return;
    set('username', `${form.firstName.trim()}.${form.lastName.trim()[0]}`.toLowerCase().replace(/[^a-z0-9._-]/g, ''));
  };

  const changeRole = (roleId) => {
    const role = getRole(roleId);
    setForm((f) => {
      const stillOk = !f.profileType || (role && role.profileTypes.includes(f.profileType));
      return { ...f, roleId, ...(stillOk ? {} : { profileType: '', profileId: '' }) };
    });
    setErrors((e) => { const n = { ...e }; delete n.roleId; return n; });
  };

  const submit = async (e) => {
    e.preventDefault();
    const result = await onSubmit({ ...form }, { setupMode: form.setupMode });
    if (result) {
      setErrors(result);
      requestAnimationFrame(() => { const el = bodyRef.current && bodyRef.current.querySelector('.is-invalid'); if (el) el.focus(); });
    }
  };

  return (
    <Overlay onClose={onClose} labelledBy="uf-title" size="xl" closeOnBackdrop={false}>
      <form onSubmit={submit} noValidate className="d-flex flex-column h-100">
        <DialogHeader id="uf-title" icon={editing ? Pencil : Plus} title={editing ? `Edit account - ${user.fullName}` : 'Add new user account'} subtitle={editing ? `${user.userId || ''} · changes are recorded in the audit log` : 'Creates a login account only. No student, teacher, staff or parent record is created.'} onClose={onClose} />
        <div ref={bodyRef} className="um-dialog__body">
          <section className="um-form-section">
            <h3><span>1</span> Account information</h3>
            <div className="row g-3">
              <Field id="uf-firstName" label="First name" required error={errors.firstName} className="col-md-4"><input {...bind('firstName')} autoComplete="off" /></Field>
              <Field id="uf-middleName" label="Middle name" className="col-md-4"><input {...bind('middleName')} autoComplete="off" /></Field>
              <Field id="uf-lastName" label="Last name" required error={errors.lastName} className="col-md-4"><input {...bind('lastName')} autoComplete="off" onBlur={suggestUsername} /></Field>
              <Field id="uf-username" label="Username" required error={errors.username} hint="Lowercase letters, numbers, dots, dashes, underscores. Must be unique.">
                <input {...bind('username')} autoComplete="off" onChange={(e) => { setUserTouched(true); set('username', e.target.value.toLowerCase()); }} />
              </Field>
              <Field id="uf-email" label="Email" required error={errors.email} hint="Must be unique across all accounts."><input {...bind('email')} type="email" autoComplete="off" /></Field>
              <Field id="uf-phone" label="Phone number" error={errors.phone} hint="Ethiopian format, e.g. +251 911 234 567."><input {...bind('phone')} type="tel" autoComplete="off" /></Field>
              <Field id="uf-created" label="Account creation date"><input id="uf-created" className="form-control" disabled value={editing ? formatDate(user.createdAt) : formatDate(toDateInputValue())} readOnly /></Field>
            </div>
          </section>

          <section className="um-form-section">
            <h3><span>2</span> Role & status</h3>
            <div className="row g-3">
              <Field id="uf-roleId" label="Account role" required error={errors.roleId} hint="You can only assign roles below your own authority.">
                <select {...bind('roleId')} onChange={(e) => changeRole(e.target.value)}>
                  <option value="">Select a role...</option>
                  <RoleOptions assignable={assignable} />
                </select>
              </Field>
              <Field id="uf-status" label="Account status" required error={errors.status}>
                <select {...bind('status')}>{USER_STATUSES.map((s) => <option key={s}>{s}</option>)}</select>
              </Field>
              {form.roleId && <div className="col-12"><div className="um-role-hint"><ShieldCheck size={16} /> <span><strong>{getRole(form.roleId)?.name}:</strong> {getRole(form.roleId)?.description} {(snap.rolePermissions[form.roleId] || []).length} permissions.</span></div></div>}
            </div>
          </section>

          <section className="um-form-section">
            <h3><span>3</span> Profile linking</h3>
            <p className="um-form-help">Link this account to an <strong>existing</strong> profile. A profile may also exist without any login account.</p>
            <ProfilePicker
              profileType={form.profileType} profileId={form.profileId} roleId={form.roleId} profiles={snap.profiles} users={snap.users}
              excludeUserId={user ? user.id : null} onChange={(t, id) => { setForm((f) => ({ ...f, profileType: t, profileId: id })); setErrors((e) => { const n = { ...e }; delete n.profileType; delete n.profileId; return n; }); }}
              error={errors.profileType || errors.profileId}
            />
          </section>

          <section className="um-form-section">
            <h3><span>4</span> Login setup</h3>
            {editing ? (
              <div className="um-callout"><Info size={16} /><span>Passwords are never shown or edited here. Use <strong>Reset password</strong> from the account menu once your backend supports it.</span></div>
            ) : (
              <>
                <div className="um-callout um-callout--warn"><AlertTriangle size={16} /><span><strong>No email or authentication service is connected.</strong> Choosing an invitation only queues the account as pending; <u>nothing is emailed</u> and no password is created. Credentials must be issued by your backend.</span></div>
                <div className="um-radio-row" role="radiogroup" aria-label="Login setup">
                  {[['invitation', 'Queue invitation (demo - not sent)', 'Marks the account as awaiting invitation.'], ['later', 'Set up login later', 'No credentials are prepared yet.']].map(([val, title, text]) => (
                    <label key={val} className={`um-radio ${form.setupMode === val ? 'is-active' : ''}`}>
                      <input type="radio" name="setupMode" value={val} checked={form.setupMode === val} onChange={() => set('setupMode', val)} />
                      <span><strong>{title}</strong><small>{text}</small></span>
                    </label>
                  ))}
                </div>
              </>
            )}
          </section>

          <section className="um-form-section">
            <h3><span>5</span> Administrative notes</h3>
            <label htmlFor="uf-notes" className="form-label um-label">Internal notes (optional)</label>
            <textarea {...bind('notes')} rows={3} placeholder="Visible to administrators only." />
          </section>
        </div>
        <div className="um-dialog__footer">
          <button type="button" className="btn um-btn-ghost" onClick={onClose} disabled={saving}>Cancel</button>
          <button type="submit" className="btn um-btn-primary" disabled={saving}>{saving ? 'Saving...' : (editing ? 'Save changes' : 'Create account')}</button>
        </div>
      </form>
    </Overlay>
  );
}

/* ------------------------------------------------------------------ */
/* Dialogs                                                             */
/* ------------------------------------------------------------------ */

function ConfirmDialog({ title, tone = 'primary', icon: Icon = Info, children, confirmLabel, requireText, onConfirm, onClose, busy }) {
  const [typed, setTyped] = useState('');
  const ok = !requireText || typed.trim() === requireText;
  return (
    <Overlay onClose={onClose} size="sm" labelledBy="cf-title">
      <div className={`um-confirm um-confirm--${tone}`}>
        <div className="um-confirm__icon"><Icon size={24} /></div>
        <h2 id="cf-title" className="um-dialog__title">{title}</h2>
        <div className="um-confirm__body">{children}</div>
        {requireText && (
          <div className="mt-3 text-start">
            <label htmlFor="cf-type" className="form-label um-label">Type <code>{requireText}</code> to confirm</label>
            <input id="cf-type" className="form-control" value={typed} onChange={(e) => setTyped(e.target.value)} autoComplete="off" />
          </div>
        )}
        <div className="um-confirm__actions">
          <button type="button" className="btn um-btn-ghost" onClick={onClose} disabled={busy}>Cancel</button>
          <button type="button" className={`btn ${tone === 'danger' ? 'um-btn-danger' : 'um-btn-primary'}`} disabled={!ok || busy} onClick={onConfirm}>{busy ? 'Working...' : confirmLabel}</button>
        </div>
      </div>
    </Overlay>
  );
}

function RoleDialog({ users, assignable, snap, onSubmit, onClose, busy }) {
  const [roleId, setRoleId] = useState('');
  const single = users.length === 1 ? users[0] : null;
  return (
    <Overlay onClose={onClose} size="md" labelledBy="rd-title">
      <DialogHeader id="rd-title" icon={ShieldCheck} title={single ? `Change role - ${single.fullName}` : `Change role for ${users.length} accounts`} subtitle={single ? `Current role: ${single.role ? single.role.name : 'Unknown'}` : 'Each account is checked individually; blocked accounts are skipped and reported.'} onClose={onClose} />
      <div className="um-dialog__body">
        <label htmlFor="rd-role" className="form-label um-label">New role</label>
        <select id="rd-role" className="form-select" value={roleId} onChange={(e) => setRoleId(e.target.value)}>
          <option value="">Select a role...</option>
          <RoleOptions assignable={assignable} />
        </select>
        {roleId && <div className="um-role-hint mt-3"><ShieldCheck size={16} /><span>{getRole(roleId).description} This role holds {(snap.rolePermissions[roleId] || []).length} permissions.</span></div>}
        <div className="um-callout um-callout--warn mt-3"><AlertTriangle size={16} /><span>Changing a role changes what the account is meant to access. Your backend must apply this change to be effective.</span></div>
      </div>
      <div className="um-dialog__footer">
        <button type="button" className="btn um-btn-ghost" onClick={onClose}>Cancel</button>
        <button type="button" className="btn um-btn-primary" disabled={!roleId || busy} onClick={() => onSubmit(roleId)}>{busy ? 'Saving...' : 'Apply role'}</button>
      </div>
    </Overlay>
  );
}

function LinkProfileDialog({ user, snap, onSubmit, onClose, busy }) {
  const [sel, setSel] = useState({ profileType: '', profileId: '' });
  const role = getRole(user.roleId);
  return (
    <Overlay onClose={onClose} size="md" labelledBy="lp-title">
      <DialogHeader id="lp-title" icon={Link2} title={`Link profile - ${user.fullName}`} subtitle={`${role ? role.name : ''} accounts can link to: ${(role ? role.profileTypes : PROFILE_TYPES).map((t) => PROFILE_TYPE_LABELS[t]).join(', ')}`} onClose={onClose} />
      <div className="um-dialog__body">
        <ProfilePicker profileType={sel.profileType} profileId={sel.profileId} roleId={user.roleId} profiles={snap.profiles} users={snap.users} excludeUserId={user.id} onChange={(t, id) => setSel({ profileType: t, profileId: id })} />
      </div>
      <div className="um-dialog__footer">
        <button type="button" className="btn um-btn-ghost" onClick={onClose}>Cancel</button>
        <button type="button" className="btn um-btn-primary" disabled={!sel.profileType || !sel.profileId || busy} onClick={() => onSubmit(sel.profileType, sel.profileId)}>{busy ? 'Linking...' : 'Link profile'}</button>
      </div>
    </Overlay>
  );
}

/* ------------------------------------------------------------------ */
/* User details drawer                                                 */
/* ------------------------------------------------------------------ */

const PASSWORD_TEXT = {
  set: 'A password is set (never displayed).',
  invitation_pending: 'Invitation queued (demo). No email has been sent from this interface.',
  not_set: 'No credentials have been set for this account.',
};

function Row({ label, children }) {
  return <div className="um-dl__row"><dt>{label}</dt><dd>{children || '-'}</dd></div>;
}

function UserDrawer({ user, snap, menuItems, onEdit, onClose, onOpenProfile }) {
  const [tab, setTab] = useState('account');
  const events = useMemo(() => snap.audit.filter((a) => a.targetUserId === user.id).slice(0, 25), [snap.audit, user.id]);
  const tabs = [['account', 'Account'], ['profile', 'Linked profile'], ['security', 'Security'], ['activity', 'Activity'], ['admin', 'Administrative']];
  const p = user.profile;
  return (
    <Overlay onClose={onClose} variant="drawer" size="lg" labelledBy="ud-title">
      <div className="um-drawer__hero">
        <button type="button" className="um-icon-btn um-icon-btn--light um-drawer__close" onClick={onClose} aria-label="Close details"><X size={18} /></button>
        <Avatar name={user.fullName} size={64} />
        <div className="flex-grow-1 min-w-0">
          <h2 id="ud-title" className="um-drawer__name">{user.fullName}</h2>
          <div className="um-drawer__meta">@{user.username} · {user.userId || 'No ID'}</div>
          <div className="d-flex flex-wrap gap-2 mt-2"><RoleBadge role={user.role} /><StatusBadge status={user.status} /></div>
        </div>
        <div className="d-flex gap-2 align-items-center">
          <button type="button" className="btn btn-sm um-btn-light" onClick={onEdit}><Pencil size={14} /> Edit</button>
          <ActionMenu items={menuItems} label="More account actions" buttonClassName="um-icon-btn um-icon-btn--light" />
        </div>
      </div>
      <div className="um-tabs um-tabs--inner" role="tablist">
        {tabs.map(([k, l]) => <button key={k} type="button" role="tab" aria-selected={tab === k} className={`um-tab ${tab === k ? 'is-active' : ''}`} onClick={() => setTab(k)}>{l}</button>)}
      </div>
      <div className="um-dialog__body um-fade" key={tab}>
        {tab === 'account' && (
          <dl className="um-dl">
            <Row label="Full name">{user.fullName}</Row><Row label="Username">{user.username}</Row><Row label="Email">{user.email}</Row>
            <Row label="Phone">{user.phone}</Row><Row label="Role">{user.role ? user.role.name : '-'}</Row><Row label="Account status"><StatusBadge status={user.status} /></Row>
            <Row label="Created">{formatDateTime(user.createdAt)}</Row><Row label="Last login">{user.lastLoginAt ? `${formatDateTime(user.lastLoginAt)} (${formatRelative(user.lastLoginAt)})` : 'Not available'}</Row>
          </dl>
        )}
        {tab === 'profile' && (user.profileType ? (
          <>
            <div className="um-linked-card">
              <Avatar name={p ? p.fullName : '?'} size={44} />
              <div className="flex-grow-1"><div className="fw-semibold">{p ? p.fullName : 'Profile record not found'}</div><div className="small text-muted">{PROFILE_TYPE_LABELS[user.profileType]} profile</div></div>
              <span className={`um-status um-status--${p ? 'active' : 'suspended'}`}><i className="um-status__dot" />{p ? 'Linked' : 'Broken link'}</span>
            </div>
            <dl className="um-dl mt-3">
              <Row label="Profile type">{PROFILE_TYPE_LABELS[user.profileType]}</Row><Row label="Profile ID">{p ? p.profileId : user.profileId}</Row>
              <Row label="Profile name">{p ? p.fullName : '-'}</Row><Row label={user.profileType === 'student' ? 'Grade / section' : 'Department / detail'}>{p ? p.detail : '-'}</Row>
            </dl>
            {p && p.isDemo && <div className="um-callout mt-3"><Info size={16} /><span>This profile comes from built-in demo data because the {PROFILE_TYPE_LABELS[user.profileType].toLowerCase()} module has no stored records yet.</span></div>}
            {!p && <div className="um-callout um-callout--warn mt-3"><AlertTriangle size={16} /><span>The linked profile no longer exists in its module. Unlink or re-link it from the account menu. No profile data was affected.</span></div>}
            {onOpenProfile && p && <button type="button" className="btn um-btn-ghost mt-3" onClick={() => onOpenProfile(user.profileType, p)}>View original profile</button>}
          </>
        ) : <EmptyState icon={Unlink} title="No linked profile" text="This account is not connected to a student, teacher, staff or parent record. Use Link profile from the account menu." />)}
        {tab === 'security' && (
          <>
            <dl className="um-dl">
              <Row label="Password status">{PASSWORD_TEXT[user.passwordStatus] || PASSWORD_TEXT.not_set}</Row>
              {['Last password change', 'Failed login attempts', 'Two-factor authentication', 'Active sessions'].map((l) => <Row key={l} label={l}><span className="um-tag">Requires backend</span> Not tracked by this interface</Row>)}
            </dl>
            <div className="um-callout mt-3"><Info size={16} /><span>Passwords and tokens are never displayed. Security metrics are shown only when real data exists.</span></div>
          </>
        )}
        {tab === 'activity' && (events.length ? (
          <ul className="um-timeline">
            {events.map((e) => (
              <li key={e.id}><i className="um-timeline__dot" /><div><div className="fw-semibold">{AUDIT_ACTIONS[e.action] || e.action}</div><div className="small">{e.description}</div><div className="small text-muted">{e.actorName} · {formatDateTime(e.timestamp)}</div></div></li>
            ))}
          </ul>
        ) : <EmptyState icon={History} title="No recorded activity" text="Changes made from this screen will appear here. Login events are not tracked by this interface." />)}
        {tab === 'admin' && (
          <dl className="um-dl">
            <Row label="Created by">{user.createdBy}</Row><Row label="Created">{formatDateTime(user.createdAt)}</Row>
            <Row label="Last updated by">{user.updatedBy}</Row><Row label="Last updated">{formatDateTime(user.updatedAt)}</Row>
            <Row label="Internal notes">{user.notes}</Row>
            {user.isDemo && <Row label="Data source"><span className="um-tag">Demo data</span> Fictional demonstration account</Row>}
          </dl>
        )}
      </div>
    </Overlay>
  );
}

/* ------------------------------------------------------------------ */
/* Analytics                                                           */
/* ------------------------------------------------------------------ */

function Analytics({ stats, onRole, onStatus, onLinked }) {
  const roleRows = ROLES.map((r) => ({ r, n: stats.byRole[r.id] })).filter((x) => x.n > 0).sort((a, b) => b.n - a.n);
  const max = Math.max(1, ...roleRows.map((x) => x.n));
  const linkedPct = stats.total ? Math.round((stats.linked / stats.total) * 100) : 0;
  return (
    <div className="row g-3 um-analytics">
      <div className="col-lg-5">
        <div className="um-card h-100">
          <h3 className="um-card__title">Users by role</h3>
          {roleRows.length === 0 && <p className="text-muted small mb-0">No accounts yet.</p>}
          <ul className="um-bars">
            {roleRows.map(({ r, n }) => (
              <li key={r.id}>
                <button type="button" className="um-bar" onClick={() => onRole(r.id)} aria-label={`Filter by ${r.name}: ${n} accounts`}>
                  <span className="um-bar__label">{r.name}</span>
                  <span className="um-bar__track"><i className={`um-bar__fill um-bar__fill--${r.group}`} style={{ width: `${(n / max) * 100}%` }} /></span>
                  <span className="um-bar__value">{n}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="col-md-6 col-lg-4">
        <div className="um-card h-100">
          <h3 className="um-card__title">Account status</h3>
          <div className="um-stack" role="img" aria-label="Account status distribution">
            {USER_STATUSES.filter((s) => stats.byStatus[s] > 0).map((s) => <i key={s} className={`um-stack__seg um-stack__seg--${STATUS_TONE[s]}`} style={{ flexGrow: stats.byStatus[s] }} title={`${s}: ${stats.byStatus[s]}`} />)}
          </div>
          <ul className="um-legend">
            {USER_STATUSES.map((s) => (
              <li key={s}><button type="button" onClick={() => onStatus(s)}><i className={`um-legend__dot um-legend__dot--${STATUS_TONE[s]}`} />{s}<strong>{stats.byStatus[s]}</strong><em>{stats.total ? Math.round((stats.byStatus[s] / stats.total) * 100) : 0}%</em></button></li>
            ))}
          </ul>
        </div>
      </div>
      <div className="col-md-6 col-lg-3">
        <div className="um-card h-100 text-center">
          <h3 className="um-card__title text-start">Profile linking</h3>
          <div className="um-donut" style={{ '--um-pct': `${linkedPct}%` }} role="img" aria-label={`${linkedPct}% of accounts are linked to a profile`}>
            <span><strong>{linkedPct}%</strong><small>linked</small></span>
          </div>
          <div className="um-legend um-legend--row">
            <button type="button" onClick={() => onLinked('linked')}><i className="um-legend__dot um-legend__dot--active" />Linked <strong>{stats.linked}</strong></button>
            <button type="button" onClick={() => onLinked('unlinked')}><i className="um-legend__dot um-legend__dot--pending" />Unlinked <strong>{stats.unlinked}</strong></button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Roles & permissions                                                 */
/* ------------------------------------------------------------------ */

function RolesPanel({ snap, users, actor, onSave, busy }) {
  const [roleId, setRoleId] = useState('teacher');
  const role = getRole(roleId);
  const stored = snap.rolePermissions[roleId] || [];
  const [draft, setDraft] = useState(() => new Set(stored));
  useEffect(() => { setDraft(new Set(snap.rolePermissions[roleId] || [])); }, [roleId, snap.rolePermissions]);

  const actorRole = getRole(actor.roleId);
  const actorPerms = new Set(snap.rolePermissions[actor.roleId] || []);
  let lockReason = '';
  if (roleId === 'super_admin') lockReason = 'Protected role: Super Admin always holds every permission.';
  else if (!actorPerms.has('users.manage')) lockReason = 'Your role lacks the "users.manage" permission.';
  else if (actorRole && actorRole.id !== 'super_admin' && role.level >= actorRole.level) lockReason = 'You cannot edit a role equal to or above your own.';
  const editable = !lockReason;
  const canToggle = (k) => editable && (draft.has(k) || actorPerms.has(k));
  const dirty = draft.size !== stored.length || stored.some((k) => !draft.has(k));
  const toggle = (k) => setDraft((d) => { const n = new Set(d); if (n.has(k)) n.delete(k); else n.add(k); return n; });
  const toggleRow = (m) => {
    const keys = PERMISSION_ACTIONS.map((a) => `${m}.${a}`).filter(canToggle);
    const all = keys.every((k) => draft.has(k));
    setDraft((d) => { const n = new Set(d); keys.forEach((k) => (all ? n.delete(k) : n.add(k))); return n; });
  };
  const assigned = users.filter((u) => u.roleId === roleId);

  return (
    <div className="row g-3">
      <div className="col-lg-4 col-xl-3">
        <div className="um-card um-rolelist">
          {ROLE_GROUPS.map((g) => (
            <div key={g.id}>
              <div className="um-rolelist__group">{g.label}</div>
              {ROLES.filter((r) => r.group === g.id).map((r) => (
                <button key={r.id} type="button" className={`um-rolelist__item ${r.id === roleId ? 'is-active' : ''}`} onClick={() => setRoleId(r.id)} aria-current={r.id === roleId}>
                  <span>{r.name}{r.protected && <Lock size={12} className="ms-1" aria-label="Protected role" />}</span>
                  <em>{users.filter((u) => u.roleId === r.id).length}</em>
                </button>
              ))}
            </div>
          ))}
        </div>
      </div>
      <div className="col-lg-8 col-xl-9">
        <div className="um-card">
          <div className="d-flex flex-wrap justify-content-between gap-2 align-items-start">
            <div>
              <h3 className="um-card__title mb-1">{role.name} <RoleBadge role={role} /></h3>
              <p className="text-muted mb-2">{role.description}</p>
            </div>
            <div className="um-role-stats"><div><strong>{assigned.length}</strong><span>assigned users</span></div><div><strong>{draft.size}</strong><span>permissions</span></div><div><strong>{role.level}</strong><span>authority level</span></div></div>
          </div>
          {assigned.length > 0 && <div className="um-chips mb-3">{assigned.slice(0, 8).map((u) => <span key={u.id} className="um-chip"><Avatar name={u.fullName} size={20} />{u.fullName}</span>)}{assigned.length > 8 && <span className="um-chip">+{assigned.length - 8} more</span>}</div>}
          {lockReason && <div className="um-callout um-callout--warn mb-3"><Lock size={16} /><span>{lockReason}</span></div>}
          <div className="um-callout mb-3"><Info size={16} /><span>This matrix is a frontend definition stored in this browser. It does <strong>not</strong> secure anything until your backend enforces it.</span></div>
          <div className="table-responsive um-matrix-wrap">
            <table className="table um-matrix align-middle mb-0">
              <thead><tr><th scope="col">Permission area</th>{PERMISSION_ACTIONS.map((a) => <th key={a} scope="col" className="text-center text-capitalize">{a}</th>)}<th scope="col" className="text-center">Row</th></tr></thead>
              <tbody>
                {PERMISSION_MODULES.map((m) => (
                  <tr key={m.key}>
                    <th scope="row">{m.label}</th>
                    {PERMISSION_ACTIONS.map((a) => {
                      const k = `${m.key}.${a}`;
                      return (
                        <td key={a} className="text-center">
                          <input type="checkbox" className="form-check-input um-check" checked={draft.has(k)} disabled={!canToggle(k)} onChange={() => toggle(k)} aria-label={`${role.name}: ${a} ${m.label}`} title={!canToggle(k) && editable ? 'You cannot grant a permission you do not hold.' : undefined} />
                        </td>
                      );
                    })}
                    <td className="text-center"><button type="button" className="btn btn-sm um-btn-link" disabled={!editable} onClick={() => toggleRow(m.key)}>Toggle</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="d-flex gap-2 justify-content-end mt-3">
            <button type="button" className="btn um-btn-ghost" disabled={!dirty} onClick={() => setDraft(new Set(stored))}>Discard changes</button>
            <button type="button" className="btn um-btn-primary" disabled={!dirty || !editable || busy} onClick={() => onSave(roleId, [...draft])}>{busy ? 'Saving...' : 'Save permissions'}</button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Security center + audit                                             */
/* ------------------------------------------------------------------ */

function EventList({ title, events, empty }) {
  return (
    <div className="um-card h-100">
      <h3 className="um-card__title">{title}</h3>
      {events.length === 0 ? <p className="text-muted small mb-0">{empty}</p> : (
        <ul className="um-timeline">
          {events.map((e) => <li key={e.id}><i className="um-timeline__dot" /><div><div className="small fw-semibold">{e.targetName || AUDIT_ACTIONS[e.action]}</div><div className="small">{e.description}</div><div className="small text-muted">{e.actorName} · {formatDateTime(e.timestamp)}</div></div></li>)}
        </ul>
      )}
    </div>
  );
}

function SecurityCenter({ stats, onReview }) {
  const tiles = [
    { label: 'Active accounts', value: stats.active, icon: UserCheck, tone: 'teal', go: { status: 'Active' } },
    { label: 'Suspended accounts', value: stats.suspended, icon: Ban, tone: 'red', go: { status: 'Suspended' } },
    { label: 'Pending accounts', value: stats.pending, icon: Clock, tone: 'amber', go: { status: 'Pending' } },
    { label: 'Without profile link', value: stats.unlinked, icon: Unlink, tone: 'blue', go: { linked: 'unlinked' } },
  ];
  return (
    <div className="d-grid gap-3">
      <div className="row g-3">
        {tiles.map((t) => (
          <div key={t.label} className="col-6 col-lg-3">
            <button type="button" className={`um-sec-tile um-sec-tile--${t.tone}`} onClick={() => onReview(t.go)}>
              <t.icon size={20} /><strong>{t.value}</strong><span>{t.label}</span><em>Review</em>
            </button>
          </div>
        ))}
      </div>
      <div className="um-card">
        <h3 className="um-card__title">Accounts with incomplete information</h3>
        <p className="mb-2">{stats.incomplete} of {stats.total} accounts are missing a phone number, an email or a profile link.</p>
        <button type="button" className="btn btn-sm um-btn-ghost" onClick={() => onReview({ linked: 'unlinked' })}>Review unlinked accounts</button>
      </div>
      <div className="row g-3">
        <div className="col-lg-4"><EventList title="Recent role changes" events={stats.recentRoleChanges} empty="No role changes recorded yet." /></div>
        <div className="col-lg-4"><EventList title="Recent status changes" events={stats.recentStatusChanges} empty="No status changes recorded yet." /></div>
        <div className="col-lg-4"><EventList title="Recent security events" events={stats.recentSecurityEvents} empty="No security events recorded yet." /></div>
      </div>
      <div className="um-callout"><Info size={16} /><span><strong>Not tracked by this interface:</strong> login history, failed login counts, active sessions, password expiry, two-factor status and security alerts. These need real backend data and are intentionally not shown or simulated.</span></div>
    </div>
  );
}

function AuditPanel({ audit }) {
  const [page, setPage] = useState(1);
  const per = 12;
  const pages = Math.max(1, Math.ceil(audit.length / per));
  const rows = audit.slice((Math.min(page, pages) - 1) * per, Math.min(page, pages) * per);
  return (
    <div className="um-card">
      <div className="um-callout um-callout--warn mb-3"><AlertTriangle size={16} /><span>This is a <strong>local demo log</strong> kept in this browser (latest 500 events). It is not a permanent or tamper-proof audit trail. Forward events to your Audit Log module with <code>setAuditSink(fn)</code> in <code>userService.js</code>. Passwords and tokens are never logged.</span></div>
      {audit.length === 0 ? <EmptyState icon={ScrollText} title="No audit events yet" text="Create, edit or change an account and the event will appear here." /> : (
        <>
          <div className="table-responsive">
            <table className="table um-table align-middle">
              <thead><tr><th>When</th><th>Action</th><th>Actor</th><th>Target</th><th>Description</th><th>Previous / new</th></tr></thead>
              <tbody>
                {rows.map((e) => (
                  <tr key={e.id}>
                    <td className="text-nowrap small">{formatDateTime(e.timestamp)}</td>
                    <td><span className="um-tag um-tag--action">{AUDIT_ACTIONS[e.action] || e.action}</span></td>
                    <td>{e.actorName}</td><td>{e.targetName || '-'}</td><td className="small">{e.description}</td>
                    <td className="small um-mono">{e.previousValue ? JSON.stringify(e.previousValue) : '-'}<br />{e.newValue ? `-> ${JSON.stringify(e.newValue)}` : ''}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="d-flex justify-content-end"><Pagination page={Math.min(page, pages)} totalPages={pages} onPage={setPage} /></div>
        </>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Filters                                                             */
/* ------------------------------------------------------------------ */

function FilterFields({ filters, onChange }) {
  return (
    <div className="row g-3">
      <div className="col-sm-6 col-lg-3"><label className="form-label um-label" htmlFor="f-role">Role</label>
        <select id="f-role" className="form-select" value={filters.roleId} onChange={(e) => onChange('roleId', e.target.value)}><option value="">All roles</option>{ROLES.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}</select></div>
      <div className="col-sm-6 col-lg-3"><label className="form-label um-label" htmlFor="f-status">Account status</label>
        <select id="f-status" className="form-select" value={filters.status} onChange={(e) => onChange('status', e.target.value)}><option value="">All statuses</option>{USER_STATUSES.map((s) => <option key={s}>{s}</option>)}</select></div>
      <div className="col-sm-6 col-lg-3"><label className="form-label um-label" htmlFor="f-ptype">Profile type</label>
        <select id="f-ptype" className="form-select" value={filters.profileType} onChange={(e) => onChange('profileType', e.target.value)}><option value="">All profile types</option>{PROFILE_TYPES.map((t) => <option key={t} value={t}>{PROFILE_TYPE_LABELS[t]}</option>)}</select></div>
      <div className="col-sm-6 col-lg-3"><label className="form-label um-label" htmlFor="f-linked">Profile link</label>
        <select id="f-linked" className="form-select" value={filters.linked} onChange={(e) => onChange('linked', e.target.value)}><option value="">Linked & unlinked</option><option value="linked">Linked only</option><option value="unlinked">Unlinked only</option></select></div>
      <div className="col-sm-6 col-lg-3"><label className="form-label um-label" htmlFor="f-from">Created from</label><input id="f-from" type="date" className="form-control" value={filters.dateFrom} onChange={(e) => onChange('dateFrom', e.target.value)} /></div>
      <div className="col-sm-6 col-lg-3"><label className="form-label um-label" htmlFor="f-to">Created to</label><input id="f-to" type="date" className="form-control" value={filters.dateTo} onChange={(e) => onChange('dateTo', e.target.value)} /></div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Main page                                                           */
/* ------------------------------------------------------------------ */

export default function ManageUsers({ currentUser, onOpenProfile }) {
  const actor = useMemo(() => currentUser || getCurrentActor(), [currentUser]);
  const isMobile = useMediaQuery('(max-width: 767.98px)');

  const [snap, setSnap] = useState(null);
  const [loadError, setLoadError] = useState(null);
  const [tab, setTab] = useState('directory');
  const [view, setView] = useState('table');
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [showFilters, setShowFilters] = useState(false);
  const [sortKey, setSortKey] = useState('name');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(12);
  const [selected, setSelected] = useState(() => new Set());
  const [dialog, setDialog] = useState(null);
  const [drawerId, setDrawerId] = useState(null);
  const [busy, setBusy] = useState(false);
  const [toasts, setToasts] = useState([]);
  const toastId = useRef(0);
  const timers = useRef([]);

  const pushToast = useCallback((type, message) => {
    toastId.current += 1;
    const id = toastId.current;
    setToasts((t) => [...t, { id, type, message }]);
    const timer = setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), type === 'danger' ? 7000 : 4500);
    timers.current.push(timer);
  }, []);
  useEffect(() => () => timers.current.forEach(clearTimeout), []);
  const dismissToast = (id) => setToasts((t) => t.filter((x) => x.id !== id));

  const load = useCallback(async (initial) => {
    try {
      if (initial) await initializeUserData();
      const s = await getSnapshot();
      setSnap(s);
      setLoadError(null);
    } catch (err) {
      setLoadError(err.message || 'Could not load user accounts.');
    }
  }, []);
  useEffect(() => { load(true); }, [load]);

  const handleError = useCallback((err) => {
    if (err && err.code === 'FORBIDDEN') pushToast('warning', err.message);
    else if (err && String(err.code).startsWith('STORAGE')) pushToast('danger', `Storage error: ${err.message}`);
    else pushToast('danger', (err && err.message) || 'Something went wrong.');
  }, [pushToast]);

  const act = useCallback(async (fn, success) => {
    setBusy(true);
    try {
      const result = await fn();
      await load(false);
      if (success) pushToast('success', typeof success === 'function' ? success(result) : success);
      return { ok: true, result };
    } catch (err) {
      handleError(err);
      return { ok: false, error: err };
    } finally { setBusy(false); }
  }, [load, pushToast, handleError]);

  const users = useMemo(() => {
    if (!snap) return [];
    return snap.users.map((u) => {
      const profile = u.profileType ? (snap.profiles[u.profileType] || []).find((p) => p.id === u.profileId) || null : null;
      return { ...u, role: getRole(u.roleId), profile, profileMissing: Boolean(u.profileType && !profile) };
    });
  }, [snap]);

  const stats = useMemo(() => (snap ? getUserStatistics(snap) : null), [snap]);
  const ctx = useMemo(() => (snap ? { users: snap.users, rolePermissions: snap.rolePermissions } : null), [snap]);
  const assignable = useMemo(() => getAssignableRoles(actor), [actor]);

  const filtered = useMemo(() => {
    const list = users.filter((u) => {
      if (filters.roleId && u.roleId !== filters.roleId) return false;
      if (filters.status && u.status !== filters.status) return false;
      if (filters.profileType && u.profileType !== filters.profileType) return false;
      if (filters.linked === 'linked' && !u.profileType) return false;
      if (filters.linked === 'unlinked' && u.profileType) return false;
      const created = (u.createdAt || '').slice(0, 10);
      if (filters.dateFrom && (!created || created < filters.dateFrom)) return false;
      if (filters.dateTo && (!created || created > filters.dateTo)) return false;
      return matchesUserQuery(u, filters.query);
    });
    const cmp = {
      name: (a, b) => a.fullName.localeCompare(b.fullName),
      newest: (a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''),
      lastLogin: (a, b) => (b.lastLoginAt || '').localeCompare(a.lastLoginAt || ''),
    }[sortKey];
    return [...list].sort(cmp);
  }, [users, filters, sortKey]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const pageRows = filtered.slice((safePage - 1) * pageSize, safePage * pageSize);

  useEffect(() => {
    setSelected((prev) => {
      const ids = new Set(users.map((u) => u.id));
      const next = new Set([...prev].filter((id) => ids.has(id)));
      return next.size === prev.size ? prev : next;
    });
  }, [users]);

  const setFilter = (k, v) => { setFilters((f) => ({ ...f, [k]: v })); setPage(1); };
  const applyFilters = (patch) => { setFilters({ ...DEFAULT_FILTERS, ...patch }); setPage(1); setTab('directory'); setShowFilters(Boolean(Object.keys(patch).length)); };
  const clearFilters = () => { setFilters(DEFAULT_FILTERS); setPage(1); };

  const chips = [];
  if (filters.query) chips.push(['query', `Search: "${filters.query}"`]);
  if (filters.roleId) chips.push(['roleId', `Role: ${getRole(filters.roleId)?.name}`]);
  if (filters.status) chips.push(['status', `Status: ${filters.status}`]);
  if (filters.profileType) chips.push(['profileType', `Profile: ${PROFILE_TYPE_LABELS[filters.profileType]}`]);
  if (filters.linked) chips.push(['linked', filters.linked === 'linked' ? 'Linked only' : 'Unlinked only']);
  if (filters.dateFrom) chips.push(['dateFrom', `From ${filters.dateFrom}`]);
  if (filters.dateTo) chips.push(['dateTo', `To ${filters.dateTo}`]);

  const effectiveView = isMobile ? 'cards' : view;
  const allPageSelected = pageRows.length > 0 && pageRows.every((u) => selected.has(u.id));
  const somePageSelected = pageRows.some((u) => selected.has(u.id));
  const selectedUsers = users.filter((u) => selected.has(u.id));
  const toggleOne = (id) => setSelected((s) => { const n = new Set(s); if (n.has(id)) n.delete(id); else n.add(id); return n; });
  const togglePage = () => setSelected((s) => { const n = new Set(s); if (allPageSelected) pageRows.forEach((u) => n.delete(u.id)); else pageRows.forEach((u) => n.add(u.id)); return n; });

  /* ---------- exports ---------- */
  const exportList = (list, scope) => {
    if (!list.length) { pushToast('warning', 'There are no accounts to export for this selection.'); return; }
    try {
      downloadCSV(exportUsersToCSV(list, snap.profiles), buildReportFilename(scope));
      pushToast('success', `Exported ${list.length} account${list.length === 1 ? '' : 's'} to CSV (no passwords or tokens included).`);
    } catch (err) { handleError(err); }
  };

  /* ---------- account actions ---------- */
  const check = (action, u, newStatus) => (ctx ? checkUserAction(actor, action, u, ctx, newStatus) : { allowed: false, reason: '' });

  const menuFor = (u) => {
    const it = (label, icon, action, onClick, extra = {}, newStatus) => { const r = check(action, u, newStatus); return { label, icon, onClick, disabled: !r.allowed, hint: r.reason, ...extra }; };
    const items = [
      { label: 'View details', icon: Eye, onClick: () => setDrawerId(u.id) },
      it('Edit account', Pencil, 'edit', () => setDialog({ type: 'form', user: u })),
      it('Change role', ShieldCheck, 'change_role', () => setDialog({ type: 'role', users: [u] })),
      { divider: true },
    ];
    if (u.status === 'Pending') items.push(it('Activate account', Power, 'change_status', () => setDialog({ type: 'status', users: [u], status: 'Active' }), {}, 'Active'));
    if (u.status === 'Suspended' || u.status === 'Inactive') items.push(it('Reactivate account', Power, 'change_status', () => setDialog({ type: 'status', users: [u], status: 'Active' }), {}, 'Active'));
    if (u.status !== 'Suspended') items.push(it('Suspend account', Ban, 'change_status', () => setDialog({ type: 'status', users: [u], status: 'Suspended' }), {}, 'Suspended'));
    if (u.status !== 'Inactive') items.push(it('Deactivate account', Power, 'change_status', () => setDialog({ type: 'status', users: [u], status: 'Inactive' }), {}, 'Inactive'));
    items.push({ divider: true });
    items.push(u.profileType
      ? it('Unlink profile', Unlink, 'link_profile', () => setDialog({ type: 'unlink', user: u }))
      : it('Link profile', Link2, 'link_profile', () => setDialog({ type: 'link', user: u })));
    items.push(it('Request password reset', KeyRound, 'reset_password', () => setDialog({ type: 'reset', user: u })));
    items.push({ divider: true });
    items.push(it('Delete account', Trash2, 'delete', () => setDialog({ type: 'delete', user: u }), { danger: true }));
    return items;
  };

  const handleFormSubmit = async (payload, opts) => {
    setBusy(true);
    try {
      if (dialog.user) await updateUser(dialog.user.id, payload, actor);
      else await addUser(payload, actor, opts);
      await load(false);
      pushToast('success', dialog.user ? 'Account updated successfully.' : (opts.setupMode === 'invitation' ? 'Account created. Invitation is queued only - no email was sent.' : 'Account created successfully.'));
      setDialog(null);
      return null;
    } catch (err) {
      if (err.code === 'VALIDATION') { pushToast('warning', 'Please fix the highlighted fields.'); return err.errors; }
      if (err.errors && Object.keys(err.errors).length) { handleError(err); return err.errors; }
      handleError(err);
      return null;
    } finally { setBusy(false); }
  };

  const summarize = (res, verb) => {
    if (res.changed.length) pushToast('success', `${verb} ${res.changed.length} account${res.changed.length === 1 ? '' : 's'}.`);
    if (res.skipped.length) pushToast('warning', `Skipped ${res.skipped.length}: ${res.skipped.slice(0, 2).map((s) => `${s.name} (${s.reason})`).join('; ')}${res.skipped.length > 2 ? '...' : ''}`);
  };

  const confirmStatus = async () => {
    const { users: targets, status } = dialog;
    if (targets.length === 1) {
      const r = await act(() => updateUser(targets[0].id, { status }, actor), `${targets[0].fullName} is now ${status.toLowerCase()}.`);
      if (r.ok) { setDialog(null); setSelected(new Set()); }
      return;
    }
    setBusy(true);
    try { const res = await bulkChangeStatus(targets.map((u) => u.id), status, actor); await load(false); summarize(res, `Set ${status.toLowerCase()} for`); setDialog(null); setSelected(new Set()); } catch (err) { handleError(err); } finally { setBusy(false); }
  };

  const submitRole = async (roleId) => {
    const targets = dialog.users;
    if (targets.length === 1) {
      const r = await act(() => updateUser(targets[0].id, { roleId }, actor), 'Role updated successfully.');
      if (r.ok) setDialog(null);
      return;
    }
    setBusy(true);
    try { const res = await bulkChangeRole(targets.map((u) => u.id), roleId, actor); await load(false); summarize(res, 'Changed role for'); setDialog(null); } catch (err) { handleError(err); } finally { setBusy(false); }
  };

  const statusCopy = {
    Suspended: { tone: 'danger', icon: Ban, label: 'Suspend', text: 'The account is marked suspended and should be blocked from signing in once your backend enforces status.' },
    Inactive: { tone: 'danger', icon: Power, label: 'Deactivate', text: 'The account is marked inactive. History and any linked profile are preserved.' },
    Active: { tone: 'primary', icon: Power, label: 'Activate', text: 'The account is marked active. Your backend decides whether credentials exist.' },
  };

  /* ---------- render guards ---------- */
  if (loadError) {
    return (
      <div className="users-module"><div className="um-page">
        <div className="um-card um-error" role="alert">
          <AlertTriangle size={28} /><h2>User accounts could not be loaded</h2><p>{loadError}</p>
          <button type="button" className="btn um-btn-primary" onClick={() => { setLoadError(null); load(true); }}><RefreshCw size={16} /> Try again</button>
        </div>
      </div></div>
    );
  }

  if (!snap) {
    return (
      <div className="users-module"><div className="um-page" aria-busy="true" aria-label="Loading user accounts">
        <div className="um-header um-skel" style={{ height: 150 }} />
        <div className="row g-3 mt-1">{[0, 1, 2, 3, 4].map((i) => <div key={i} className="col-12 col-sm-6 col-xl"><div className="um-card um-skel" style={{ height: 96 }} /></div>)}</div>
        <div className="um-card mt-3">{[0, 1, 2, 3, 4, 5].map((i) => <div key={i} className="um-skel um-skel--row" />)}</div>
      </div></div>
    );
  }

  const drawerUser = drawerId ? users.find((u) => u.id === drawerId) : null;
  const start = filtered.length ? (safePage - 1) * pageSize + 1 : 0;
  const kpis = [
    { icon: Users, label: 'Total accounts', value: stats.total, sub: `${stats.byStatus.Inactive} inactive`, tone: 'navy' },
    { icon: UserCheck, label: 'Active accounts', value: stats.active, sub: `${stats.activePct}% of all accounts`, tone: 'teal' },
    { icon: Clock, label: 'Pending invitations', value: stats.pending, sub: stats.pending ? 'Awaiting login setup' : 'Nothing awaiting setup', tone: 'amber' },
    { icon: Ban, label: 'Suspended accounts', value: stats.suspended, sub: `${stats.suspendedPct}% of all accounts`, tone: 'red' },
    { icon: Unlink, label: 'Without profile link', value: stats.unlinked, sub: `${stats.unlinkedPct}% of all accounts`, tone: 'blue' },
  ];

  const filterBody = <FilterFields filters={filters} onChange={setFilter} />;

  return (
    <div className="users-module">
      <div className="um-page">
        {/* Header */}
        <header className="um-header">
          <div className="um-header__text">
            <div className="um-eyebrow"><ShieldCheck size={14} /> Access & security</div>
            <h1>User Management</h1>
            <p>Manage user accounts, permissions, security, and system access across your school.</p>
            <div className="um-header__chips">
              <span className="um-hchip"><Users size={13} /> {stats.total} accounts</span>
              <span className="um-hchip"><RefreshCw size={13} /> Updated {formatRelative(snap.loadedAt)}</span>
              {actor.isDemo && <span className="um-hchip um-hchip--warn" title="No signed-in user was provided, so a demo actor is used. Pass currentUser from your AuthContext.">Demo actor: {actor.name}</span>}
            </div>
          </div>
          <div className="um-header__actions">
            <button type="button" className="btn um-btn-primary um-btn-lg" disabled={!check('create', null).allowed} title={check('create', null).reason || undefined} onClick={() => setDialog({ type: 'form', user: null })}><Plus size={18} /> Add new user</button>
            <ActionMenu label="Export users" buttonClassName="btn um-btn-light" buttonContent={<><Download size={16} /> Export users</>} items={[
              { label: `All accounts (${users.length})`, icon: Download, onClick: () => exportList(users, 'all') },
              { label: `Filtered results (${filtered.length})`, icon: Download, onClick: () => exportList(filtered, 'filtered') },
              { label: `Selected (${selectedUsers.length})`, icon: Check, disabled: !selectedUsers.length, hint: 'Select accounts in the directory first.', onClick: () => exportList(selectedUsers, 'selected') },
            ]} />
            <ActionMenu label="More actions" buttonClassName="um-icon-btn um-icon-btn--light" items={[
              { label: 'Refresh data', icon: RefreshCw, onClick: () => { load(false); pushToast('info', 'Data refreshed from storage.'); } },
              { label: 'Review roles & permissions', icon: ShieldCheck, onClick: () => setTab('roles') },
              { label: 'Open security center', icon: Lock, onClick: () => setTab('security') },
              { label: 'View audit log', icon: ScrollText, onClick: () => setTab('audit') },
            ]} />
          </div>
        </header>

        {/* KPIs */}
        <section className="row g-3 um-kpis" aria-label="Account overview">
          {kpis.map((k, i) => <KpiCard key={k.label} {...k} index={i} />)}
        </section>

        {/* Tabs */}
        <div className="um-tabs" role="tablist" aria-label="User management sections">
          {TABS.map((t) => (
            <button key={t.key} type="button" role="tab" aria-selected={tab === t.key} className={`um-tab ${tab === t.key ? 'is-active' : ''}`} onClick={() => setTab(t.key)}><t.icon size={16} /> {t.label}</button>
          ))}
        </div>

        <div className="um-fade" key={tab}>
          {tab === 'directory' && (
            <>
              <Analytics stats={stats}
                onRole={(id) => applyFilters({ roleId: id })} onStatus={(s) => applyFilters({ status: s })} onLinked={(l) => applyFilters({ linked: l })} />

              <section className="um-card um-directory" aria-label="User directory">
                <div className="um-toolbar">
                  <div className="um-search">
                    <Search size={18} />
                    <input className="form-control" type="search" placeholder="Search name, username, email or phone" value={filters.query} onChange={(e) => setFilter('query', e.target.value)} aria-label="Search users" />
                  </div>
                  <button type="button" className={`btn um-btn-ghost ${showFilters || chips.length > 1 ? 'is-on' : ''}`} aria-expanded={showFilters} onClick={() => setShowFilters((s) => !s)}>
                    <SlidersHorizontal size={16} /> Filters{chips.filter(([k]) => k !== 'query').length > 0 && <span className="um-count">{chips.filter(([k]) => k !== 'query').length}</span>}
                  </button>
                  <select className="form-select um-select-sm" value={sortKey} onChange={(e) => { setSortKey(e.target.value); setPage(1); }} aria-label="Sort users">{SORTS.map((s) => <option key={s.key} value={s.key}>{s.label}</option>)}</select>
                  {!isMobile && (
                    <div className="um-toggle" role="group" aria-label="Directory layout">
                      <button type="button" className={view === 'table' ? 'is-active' : ''} aria-pressed={view === 'table'} aria-label="Table view" onClick={() => setView('table')}><List size={16} /></button>
                      <button type="button" className={view === 'cards' ? 'is-active' : ''} aria-pressed={view === 'cards'} aria-label="Compact card view" onClick={() => setView('cards')}><LayoutGrid size={16} /></button>
                    </div>
                  )}
                </div>

                {!isMobile && <div className={`um-collapse ${showFilters ? 'is-open' : ''}`}><div><div className="um-filters">{filterBody}</div></div></div>}

                <div className="um-resultbar">
                  <span aria-live="polite"><strong>{filtered.length}</strong> {filtered.length === 1 ? 'account' : 'accounts'} found{filtered.length !== users.length ? ` of ${users.length}` : ''}</span>
                  <div className="um-chips">
                    {chips.map(([k, label]) => <button key={k} type="button" className="um-chip um-chip--btn" onClick={() => setFilter(k, '')} aria-label={`Remove filter ${label}`}>{label}<X size={12} /></button>)}
                    {chips.length > 0 && <button type="button" className="btn btn-sm um-btn-link" onClick={clearFilters}>Clear all filters</button>}
                  </div>
                </div>

                {selected.size > 0 && (
                  <div className="um-bulk" role="region" aria-label="Bulk actions">
                    <strong>{selected.size} selected</strong>
                    <div className="um-bulk__actions">
                      <button type="button" className="btn btn-sm um-btn-ghost" onClick={() => setDialog({ type: 'status', users: selectedUsers, status: 'Active' })}>Activate</button>
                      <button type="button" className="btn btn-sm um-btn-ghost" onClick={() => setDialog({ type: 'status', users: selectedUsers, status: 'Inactive' })}>Deactivate</button>
                      <button type="button" className="btn btn-sm um-btn-ghost" onClick={() => setDialog({ type: 'status', users: selectedUsers, status: 'Suspended' })}>Suspend</button>
                      <button type="button" className="btn btn-sm um-btn-ghost" onClick={() => setDialog({ type: 'role', users: selectedUsers })}>Change role</button>
                      <button type="button" className="btn btn-sm um-btn-ghost" onClick={() => exportList(selectedUsers, 'selected')}>Export</button>
                      {filtered.length > selected.size && <button type="button" className="btn btn-sm um-btn-link" onClick={() => setSelected(new Set(filtered.map((u) => u.id)))}>Select all {filtered.length} results</button>}
                      <button type="button" className="btn btn-sm um-btn-link" onClick={() => setSelected(new Set())}>Clear selection</button>
                    </div>
                  </div>
                )}

                {users.length === 0 ? (
                  <EmptyState icon={Users} title="No user accounts yet" text="Create the first account to start managing access." action={<button type="button" className="btn um-btn-primary" onClick={() => setDialog({ type: 'form', user: null })}><Plus size={16} /> Add new user</button>} />
                ) : filtered.length === 0 ? (
                  <EmptyState icon={Search} title="No accounts match your search" text="Try a different keyword or remove some filters." action={<button type="button" className="btn um-btn-ghost" onClick={clearFilters}>Clear all filters</button>} />
                ) : effectiveView === 'table' ? (
                  <div className="table-responsive um-fade" key="t">
                    <table className="table um-table align-middle mb-0">
                      <thead>
                        <tr>
                          <th scope="col" style={{ width: 40 }}><input type="checkbox" className="form-check-input um-check" checked={allPageSelected} ref={(el) => { if (el) el.indeterminate = !allPageSelected && somePageSelected; }} onChange={togglePage} aria-label="Select all users on this page" /></th>
                          <th scope="col">User</th><th scope="col">Username</th><th scope="col">Role</th><th scope="col">Linked profile</th><th scope="col">Status</th><th scope="col">Last login</th><th scope="col">Created</th><th scope="col" className="text-end">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {pageRows.map((u) => (
                          <tr key={u.id} className={selected.has(u.id) ? 'is-selected' : ''}>
                            <td><input type="checkbox" className="form-check-input um-check" checked={selected.has(u.id)} onChange={() => toggleOne(u.id)} aria-label={`Select ${u.fullName}`} /></td>
                            <td>
                              <div className="um-usercell">
                                <Avatar name={u.fullName} />
                                <div className="min-w-0">
                                  <button type="button" className="um-link" onClick={() => setDrawerId(u.id)}>{u.fullName}</button>
                                  <div className="small text-muted text-truncate">{u.email}</div>
                                  {u.phone && <div className="small text-muted">{u.phone}</div>}
                                </div>
                              </div>
                            </td>
                            <td className="um-mono">@{u.username}</td>
                            <td><RoleBadge role={u.role} /></td>
                            <td><ProfileCell user={u} /></td>
                            <td><StatusBadge status={u.status} /></td>
                            <td className="small" title={u.lastLoginAt ? formatDateTime(u.lastLoginAt) : undefined}>{formatRelative(u.lastLoginAt)}</td>
                            <td className="small text-nowrap">{formatDate(u.createdAt)}</td>
                            <td className="text-end"><ActionMenu items={menuFor(u)} label={`Actions for ${u.fullName}`} /></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="um-cards um-fade" key="c">
                    {pageRows.map((u, i) => (
                      <article key={u.id} className={`um-ucard ${selected.has(u.id) ? 'is-selected' : ''}`} style={{ '--um-i': i }}>
                        <div className="um-ucard__top">
                          <input type="checkbox" className="form-check-input um-check" checked={selected.has(u.id)} onChange={() => toggleOne(u.id)} aria-label={`Select ${u.fullName}`} />
                          <Avatar name={u.fullName} size={44} />
                          <div className="flex-grow-1 min-w-0">
                            <button type="button" className="um-link" onClick={() => setDrawerId(u.id)}>{u.fullName}</button>
                            <div className="small text-muted um-mono">@{u.username}</div>
                          </div>
                          <ActionMenu items={menuFor(u)} label={`Actions for ${u.fullName}`} />
                        </div>
                        <div className="um-ucard__meta"><RoleBadge role={u.role} /><StatusBadge status={u.status} /></div>
                        <dl className="um-ucard__dl">
                          <div><dt>Email</dt><dd className="text-truncate">{u.email}</dd></div>
                          <div><dt>Phone</dt><dd>{u.phone || '-'}</dd></div>
                          <div><dt>Profile</dt><dd><ProfileCell user={u} /></dd></div>
                          <div><dt>Last login</dt><dd>{formatRelative(u.lastLoginAt)}</dd></div>
                        </dl>
                      </article>
                    ))}
                  </div>
                )}

                {filtered.length > 0 && (
                  <div className="um-pager">
                    <div className="d-flex align-items-center gap-2 small text-muted">
                      <label htmlFor="um-ps" className="mb-0">Rows</label>
                      <select id="um-ps" className="form-select form-select-sm" style={{ width: 80 }} value={pageSize} onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1); }}>{PAGE_SIZES.map((n) => <option key={n}>{n}</option>)}</select>
                      <span>{start}-{Math.min(filtered.length, safePage * pageSize)} of {filtered.length}</span>
                    </div>
                    <Pagination page={safePage} totalPages={totalPages} onPage={setPage} />
                  </div>
                )}
              </section>
            </>
          )}

          {tab === 'roles' && <RolesPanel snap={snap} users={users} actor={actor} busy={busy} onSave={(roleId, keys) => act(() => saveRolePermissions(roleId, keys, actor), 'Permissions saved locally. Your backend must enforce them.')} />}
          {tab === 'security' && <SecurityCenter stats={stats} onReview={applyFilters} />}
          {tab === 'audit' && <AuditPanel audit={snap.audit} />}
        </div>
      </div>

      {/* Mobile filter drawer */}
      {isMobile && showFilters && tab === 'directory' && (
        <Overlay variant="drawer" size="md" onClose={() => setShowFilters(false)} labelledBy="mf-title">
          <DialogHeader id="mf-title" icon={SlidersHorizontal} title="Filter accounts" subtitle={`${filtered.length} results`} onClose={() => setShowFilters(false)} />
          <div className="um-dialog__body">{filterBody}</div>
          <div className="um-dialog__footer"><button type="button" className="btn um-btn-ghost" onClick={clearFilters}>Clear all</button><button type="button" className="btn um-btn-primary" onClick={() => setShowFilters(false)}>Show results</button></div>
        </Overlay>
      )}

      {/* Details drawer */}
      {drawerUser && (
        <UserDrawer user={drawerUser} snap={snap} menuItems={menuFor(drawerUser)} onOpenProfile={onOpenProfile}
          onEdit={() => setDialog({ type: 'form', user: drawerUser })} onClose={() => setDrawerId(null)} />
      )}

      {/* Dialogs */}
      {dialog && dialog.type === 'form' && <UserFormModal user={dialog.user} snap={snap} assignable={assignable} saving={busy} onSubmit={handleFormSubmit} onClose={() => setDialog(null)} />}
      {dialog && dialog.type === 'role' && <RoleDialog users={dialog.users} assignable={assignable} snap={snap} busy={busy} onSubmit={submitRole} onClose={() => setDialog(null)} />}
      {dialog && dialog.type === 'link' && <LinkProfileDialog user={dialog.user} snap={snap} busy={busy} onClose={() => setDialog(null)}
        onSubmit={async (t, id) => { const r = await act(() => updateUser(dialog.user.id, { profileType: t, profileId: id }, actor), 'Profile linked successfully.'); if (r.ok) setDialog(null); }} />}
      {dialog && dialog.type === 'unlink' && (
        <ConfirmDialog title="Unlink this profile?" icon={Unlink} confirmLabel="Unlink profile" busy={busy} onClose={() => setDialog(null)}
          onConfirm={async () => { const r = await act(() => updateUser(dialog.user.id, { profileType: '', profileId: '' }, actor), 'Profile unlinked. The profile record itself was not changed.'); if (r.ok) setDialog(null); }}>
          <p><strong>{dialog.user.fullName}</strong> will no longer be connected to {dialog.user.profileMissing ? 'a missing' : 'the'} {PROFILE_TYPE_LABELS[dialog.user.profileType]} profile{dialog.user.profile ? ` (${dialog.user.profile.fullName})` : ''}.</p>
          <p className="mb-0">The profile and all of its relationships are kept exactly as they are.</p>
        </ConfirmDialog>
      )}
      {dialog && dialog.type === 'status' && (
        <ConfirmDialog title={`${statusCopy[dialog.status].label} ${dialog.users.length === 1 ? 'this account' : `${dialog.users.length} accounts`}?`} tone={statusCopy[dialog.status].tone} icon={statusCopy[dialog.status].icon} confirmLabel={statusCopy[dialog.status].label} busy={busy} onClose={() => setDialog(null)} onConfirm={confirmStatus}>
          <p>{dialog.users.length === 1 ? <><strong>{dialog.users[0].fullName}</strong> (@{dialog.users[0].username})</> : `${dialog.users.length} selected accounts`}: {statusCopy[dialog.status].text}</p>
          <p className="mb-0 small text-muted">The change is recorded in the audit log. Accounts that violate safety rules are skipped and reported.</p>
        </ConfirmDialog>
      )}
      {dialog && dialog.type === 'reset' && (
        <ConfirmDialog title="Request a password reset?" icon={KeyRound} confirmLabel="Record request" busy={busy} onClose={() => setDialog(null)}
          onConfirm={async () => { const r = await act(() => requestPasswordReset(dialog.user.id, actor), 'Reset request recorded locally. No email was sent and no password was changed.'); if (r.ok) setDialog(null); }}>
          <div className="um-callout um-callout--warn text-start"><AlertTriangle size={16} /><span><strong>Demo only.</strong> No email service or authentication backend is connected. This records a request in the local audit log for <strong>{dialog.user.fullName}</strong>; it does not reset anything.</span></div>
        </ConfirmDialog>
      )}
      {dialog && dialog.type === 'delete' && (
        <ConfirmDialog title="Delete this account permanently?" tone="danger" icon={Trash2} confirmLabel="Delete account" requireText={dialog.user.username} busy={busy} onClose={() => setDialog(null)}
          onConfirm={async () => { const r = await act(() => deleteUser(dialog.user.id, actor), 'Account deleted. Linked profiles were not touched.'); if (r.ok) { setDialog(null); setDrawerId(null); } }}>
          <p>You are about to delete the login account of <strong>{dialog.user.fullName}</strong> (@{dialog.user.username}).</p>
          <ul className="um-confirm__list">
            <li>Student, teacher, staff and parent profiles are <strong>not</strong> deleted.</li>
            <li>Parent-student relationships are <strong>not</strong> affected.</li>
            <li>Audit history is preserved.</li>
          </ul>
          <p className="mb-0">Consider <strong>deactivating or suspending</strong> instead: it keeps the account recoverable.</p>
        </ConfirmDialog>
      )}

      <ToastStack toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}