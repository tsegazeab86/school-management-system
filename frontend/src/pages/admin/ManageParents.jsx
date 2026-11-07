 
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Link, useSearchParams } from 'react-router-dom';
import {
    AlertTriangle, Archive, ArchiveRestore, ArrowLeft, ArrowRight, Calendar, Check, CheckCircle2,
    ChevronDown, ChevronLeft, ChevronRight, Clock, Copy, Download, Eye, GraduationCap, Heart, Home, Info,
    LayoutGrid, Link2, List, Mail, Network, Pencil, Phone, Plus, Power, Save, Search, ShieldCheck,
    SlidersHorizontal, Star, Trash2, Unlink, User, UserCheck, UserPlus, Users, X,
} from 'lucide-react';

import '../../styles/admin/ManageParents.css';
import {
    RELATIONSHIPS, STATUSES, GENDERS, MARITAL_STATUSES, COMMUNICATION_PREFERENCES, SORT_OPTIONS, EMPTY_FILTERS,
    STORAGE_KEYS, ParentStorageError, ParentValidationError,
    getSnapshot, enrichParents, filterParents, sortParents, getParentStatistics,
    addParent, updateParent, deleteParent, changeParentStatus, bulkChangeParentStatus,
    linkStudentToParent, unlinkStudentFromParent, updateLinkRelationship, setPrimaryGuardian,
    validateParent, exportParentsToCSV, getAcademicYearLabel, toDialable, todayISO, backupAndResetStorageKey,
} from '../../services/parentService';

/* =============================== utilities =============================== */

const cx = (...a) => a.filter(Boolean).join(' ');
const REL_LABEL = Object.fromEntries(RELATIONSHIPS.map((r) => [r.value, r.label]));
const STATUS_LABEL = Object.fromEntries(STATUSES.map((s) => [s.value, s.label]));
const safeUrl = (u) => (/^(https?:\/\/|data:image\/)/i.test(u || '') ? u : '');
const initialsOf = (name) => String(name || '?').split(/\s+/).filter(Boolean).slice(0, 2).map((s) => s[0].toUpperCase()).join('') || '?';
const hashTone = (s) => { let h = 0; String(s).split('').forEach((c) => { h = (h * 31 + c.charCodeAt(0)) >>> 0; }); return h % 5; };
const gradeLabel = (s) => (s.grade ? `Grade ${s.grade}${s.section || ''}` : 'Grade not set');

const fmtDate = (iso) => {
    if (!iso) return '—';
    const d = new Date(`${String(iso).slice(0, 10)}T00:00:00`);
    return Number.isNaN(d.getTime()) ? '—' : d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
};
const fmtDateTime = (iso) => {
    const d = new Date(iso);
    return Number.isNaN(d.getTime()) ? '—' : d.toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
};

async function copyText(text) {
    try {
        await navigator.clipboard.writeText(text);
        return true;
    } catch {
        try {
            const ta = document.createElement('textarea');
            ta.value = text; ta.style.position = 'fixed'; ta.style.opacity = '0';
            document.body.appendChild(ta); ta.select();
            const ok = document.execCommand('copy');
            document.body.removeChild(ta);
            return ok;
        } catch { return false; }
    }
}

function pageWindow(page, total) {
    const set = new Set([1, total, page, page - 1, page + 1]);
    const arr = [...set].filter((n) => n >= 1 && n <= total).sort((a, b) => a - b);
    const out = [];
    arr.forEach((n, i) => { if (i && n - arr[i - 1] > 1) out.push(`gap-${n}`); out.push(n); });
    return out;
}

/* ================================= hooks ================================= */

function usePresence(open, ms = 240) {
    const [mounted, setMounted] = useState(open);
    const [visible, setVisible] = useState(false);
    if (open && !mounted) setMounted(true);
    useEffect(() => {
        if (open) {
            let r2;
            const r1 = requestAnimationFrame(() => { r2 = requestAnimationFrame(() => setVisible(true)); });
            return () => { cancelAnimationFrame(r1); cancelAnimationFrame(r2); };
        }
        const t0 = setTimeout(() => setVisible(false), 0);
        const t1 = setTimeout(() => setMounted(false), ms);
        return () => { clearTimeout(t0); clearTimeout(t1); };
    }, [open, ms]);
    return { mounted: mounted || open, visible: visible && open };
}

/** Keeps the last non-empty value so closing animations don't flash empty content. */
function useHeld(value) {
    const [held, setHeld] = useState(value);
    const has = value !== null && value !== undefined;
    if (has && value !== held) setHeld(value);
    return has ? value : held;
}

function useCountUp(target, ms = 900) {
    const [v, setV] = useState(0);
    const reduce = typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    useEffect(() => {
        if (reduce || !target) return undefined;
        let raf;
        const start = performance.now();
        const tick = (t) => {
            const p = Math.min(1, (t - start) / ms);
            setV(Math.round(target * (1 - (1 - p) ** 3)));
            if (p < 1) raf = requestAnimationFrame(tick);
        };
        raf = requestAnimationFrame(tick);
        return () => cancelAnimationFrame(raf);
    }, [target, ms, reduce]);
    return reduce || !target ? target : v;
}

function useToasts() {
    const [toasts, setToasts] = useState([]);
    const dismiss = useCallback((id) => setToasts((t) => t.filter((x) => x.id !== id)), []);
    const push = useCallback((type, title, message) => {
        const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
        setToasts((t) => [...t.slice(-3), { id, type, title, message }]);
        setTimeout(() => dismiss(id), type === 'danger' ? 8000 : 4500);
    }, [dismiss]);
    return { toasts, push, dismiss };
}

/* ============================ small UI pieces ============================ */

function Avatar({ name, src, size = 44, className }) {
    const [failedSrc, setFailedSrc] = useState('');
    const url = safeUrl(src);
    return (
        <span className={cx('pm-avatar', `pm-av-${hashTone(name)}`, className)} style={{ '--sz': `${size}px` }} aria-hidden="true">
            {url && failedSrc !== url ? <img src={url} alt="" onError={() => setFailedSrc(url)} /> : initialsOf(name)}
        </span>
    );
}

const StatusBadge = ({ status }) => (
    <span className={cx('pm-badge', `s-${status}`)}><span className="pm-dot" />{STATUS_LABEL[status] || status}</span>
);
const RelBadge = ({ value }) => <span className={cx('pm-badge', `b-${value}`)}>{REL_LABEL[value] || value}</span>;
const PrimaryBadge = ({ label = 'Primary guardian' }) => <span className="pm-badge b-primary"><Star size={12} />{label}</span>;

function Checkbox({ checked, indeterminate, onChange, label }) {
    const ref = useRef(null);
    useEffect(() => { if (ref.current) ref.current.indeterminate = Boolean(indeterminate) && !checked; }, [indeterminate, checked]);
    return (
        <label className="pm-check">
            <input ref={ref} type="checkbox" checked={checked} onChange={onChange} aria-label={label} />
            <span />
        </label>
    );
}

const DotsIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <circle cx="12" cy="5" r="1.8" /><circle cx="12" cy="12" r="1.8" /><circle cx="12" cy="19" r="1.8" />
    </svg>
);

function Field({ id, label, required, error, hint, children }) {
    return (
        <div className="pm-field">
            <label className="pm-label" htmlFor={id}>{label}{required && <span className="req" aria-hidden="true">*</span>}</label>
            {children}
            {error && <div className="pm-error" id={`${id}-err`} role="alert"><AlertTriangle size={13} />{error}</div>}
            {hint && !error && <div className="pm-hint">{hint}</div>}
        </div>
    );
}

function Info2({ label, value, wide }) {
    return (
        <div className={cx('pm-info', wide && 'wide')}>
            <dt>{label}</dt>
            <dd>{value || value === 0 ? value : <span className="pm-muted">Not provided</span>}</dd>
        </div>
    );
}

/* ============================== overlay shell ============================ */

let lockCount = 0;
const overlayStack = [];

function Overlay({ open, onClose, variant = 'modal', size = 'lg', label, children, dismissible = true }) {
    const { mounted, visible } = usePresence(open);
    const panelRef = useRef(null);
    const onCloseRef = useRef(onClose);
    useEffect(() => { onCloseRef.current = onClose; });

    useEffect(() => {
        if (!open) return undefined;
        const token = {};
        overlayStack.push(token);
        lockCount += 1;
        document.body.classList.add('pm-scroll-lock');
        const onKey = (e) => {
            if (e.key === 'Escape' && overlayStack[overlayStack.length - 1] === token && dismissible) onCloseRef.current();
        };
        document.addEventListener('keydown', onKey);
        return () => {
            document.removeEventListener('keydown', onKey);
            const i = overlayStack.indexOf(token);
            if (i > -1) overlayStack.splice(i, 1);
            lockCount = Math.max(0, lockCount - 1);
            if (lockCount === 0) document.body.classList.remove('pm-scroll-lock');
        };
    }, [open, dismissible]);

    useEffect(() => {
        if (!visible) return undefined;
        const prev = document.activeElement;
        if (panelRef.current) panelRef.current.focus({ preventScroll: true });
        return () => { if (prev && prev.focus) prev.focus({ preventScroll: true }); };
    }, [visible]);

    if (!mounted) return null;
    return createPortal(
        <div className={cx('pm-root', 'pm-layer', variant === 'offcanvas' && 'is-offcanvas')}>
            <div className={cx('pm-backdrop', visible && 'is-visible')} onMouseDown={dismissible ? onClose : undefined} />
            <div
                ref={panelRef}
                className={cx('pm-overlay', `pm-${variant}`, `pm-size-${size}`, visible && 'is-visible')}
                role="dialog"
                aria-modal="true"
                aria-label={label}
                tabIndex={-1}
            >
                {children}
            </div>
        </div>,
        document.body,
    );
}

function OverlayHead({ icon: Icon, title, subtitle, onClose }) {
    return (
        <div className="pm-ov-head">
            {Icon && <span className="pm-head-icon"><Icon size={20} /></span>}
            <div>
                <h2>{title}</h2>
                {subtitle && <p className="pm-muted" style={{ fontSize: '0.85rem' }}>{subtitle}</p>}
            </div>
            <button type="button" className="pm-icon-btn" onClick={onClose} aria-label="Close"><X size={18} /></button>
        </div>
    );
}

/* ================================ toasts ================================= */

function ToastStack({ toasts, dismiss }) {
    const icon = { success: CheckCircle2, warning: AlertTriangle, danger: AlertTriangle, info: Info };
    return createPortal(
        <div className="pm-root pm-toasts" role="status" aria-live="polite">
            {toasts.map((t) => {
                const Icon = icon[t.type] || Info;
                return (
                    <div key={t.id} className={cx('pm-toast', t.type)}>
                        <Icon size={18} className="ico" />
                        <div><strong>{t.title}</strong>{t.message && <p>{t.message}</p>}</div>
                        <button type="button" className="pm-icon-btn" onClick={() => dismiss(t.id)} aria-label="Dismiss notification"><X size={15} /></button>
                    </div>
                );
            })}
        </div>,
        document.body,
    );
}

/* =============================== action menu ============================= */

function ActionMenu({ items, label = 'Parent actions' }) {
    const [open, setOpen] = useState(false);
    const [pos, setPos] = useState({ top: 0, right: 0 });
    const btnRef = useRef(null);
    const menuRef = useRef(null);

    const toggle = () => {
        if (open) { setOpen(false); return; }
        const r = btnRef.current.getBoundingClientRect();
        const h = items.reduce((s, i) => s + (i.divider ? 9 : 40), 12);
        const flipUp = window.innerHeight - r.bottom < h + 12 && r.top > h;
        setPos({ top: flipUp ? r.top - h - 6 : r.bottom + 6, right: Math.max(8, window.innerWidth - r.right) });
        setOpen(true);
    };

    useEffect(() => {
        if (!open) return undefined;
        const close = () => setOpen(false);
        const onDoc = (e) => {
            if ((menuRef.current && menuRef.current.contains(e.target)) || (btnRef.current && btnRef.current.contains(e.target))) return;
            close();
        };
        const onKey = (e) => { if (e.key === 'Escape') { close(); if (btnRef.current) btnRef.current.focus(); } };
        document.addEventListener('mousedown', onDoc);
        document.addEventListener('keydown', onKey);
        window.addEventListener('scroll', close, true);
        window.addEventListener('resize', close);
        return () => {
            document.removeEventListener('mousedown', onDoc);
            document.removeEventListener('keydown', onKey);
            window.removeEventListener('scroll', close, true);
            window.removeEventListener('resize', close);
        };
    }, [open]);

    return (
        <>
            <button ref={btnRef} type="button" className="pm-icon-btn" aria-haspopup="menu" aria-expanded={open} aria-label={label} onClick={toggle}>
                <DotsIcon />
            </button>
            {open && createPortal(
                <div className="pm-root">
                    <div ref={menuRef} className="pm-menu" role="menu" style={{ top: pos.top, right: pos.right }}>
                        {items.map((it, i) => (it.divider
                            ? <div key={`d-${i}`} className="pm-menu-divider" role="separator" />
                            : (
                                <button
                                    key={it.key}
                                    type="button"
                                    role="menuitem"
                                    className={cx('pm-menu-item', it.danger && 'danger')}
                                    onClick={() => { setOpen(false); it.onClick(); }}
                                >
                                    <it.icon size={16} />{it.label}
                                </button>
                            )))}
                    </div>
                </div>,
                document.body,
            )}
        </>
    );
}

/* ============================== stat cards =============================== */

function StatCard({ icon: Icon, label, value, support, tone, progress, index }) {
    const n = useCountUp(value);
    const [ready, setReady] = useState(false);
    useEffect(() => { const t = setTimeout(() => setReady(true), 350); return () => clearTimeout(t); }, []);
    return (
        <article className={cx('pm-stat', tone && `tone-${tone}`)} style={{ '--i': index }}>
            <div className="pm-stat-top">
                <span className="pm-stat-icon"><Icon size={20} /></span>
                <span className="pm-stat-value" aria-label={`${label}: ${value}`}>{n}</span>
            </div>
            <div className="pm-stat-label">{label}</div>
            <div className="pm-stat-support">{support}</div>
            {progress !== undefined && (
                <div className="pm-bar" role="progressbar" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100} aria-label={`${label} progress`}>
                    <div className="pm-bar-fill" style={{ width: ready ? `${progress}%` : '0%' }} />
                </div>
            )}
        </article>
    );
}

/* ============================== parent card ============================== */

function ParentCard({ p, index, selected, onToggle, onView, onLink, items }) {
    const kids = p.children;
    const shown = kids.slice(0, 4);
    return (
        <article className={cx('pm-card', `tone-${p.relationship}`, selected && 'is-selected', p.status === 'archived' && 'is-archived')} style={{ '--i': Math.min(index, 12) }}>
            <span className="pm-card-spine" />
            <header className="pm-card-head">
                <Checkbox checked={selected} onChange={() => onToggle(p.id)} label={`Select ${p.fullName}`} />
                <button type="button" className="pm-card-identity" onClick={() => onView(p.id)} aria-label={`View profile of ${p.fullName}`}>
                    <Avatar name={p.fullName} src={p.photoUrl} size={48} />
                    <span>
                        <h3>{p.fullName}</h3>
                        <span className="pm-id">{p.id}</span>
                    </span>
                </button>
                <ActionMenu items={items} label={`Actions for ${p.fullName}`} />
            </header>

            <div className="pm-badges">
                <RelBadge value={p.relationship} />
                <StatusBadge status={p.status} />
                {p.isPrimaryGuardian && <PrimaryBadge />}
            </div>

            <ul className="pm-contact-list">
                <li><Phone size={15} /><span>{p.phone || 'No phone'}</span></li>
                <li><Mail size={15} /><span>{p.email || 'No email'}</span></li>
            </ul>

            <div className="pm-family">
                {kids.length > 0 ? (
                    <>
                        <div className="pm-strip" aria-hidden="true">
                            <Avatar name={p.fullName} src={p.photoUrl} size={28} />
                            <span className="pm-strip-line" />
                            <span className="pm-strip-kids">
                                {shown.map((c) => <Avatar key={c.student.id} name={c.student.fullName} src={c.student.photoUrl} size={28} />)}
                            </span>
                            {kids.length > shown.length && <span className="pm-strip-more">+{kids.length - shown.length}</span>}
                        </div>
                        <p className="pm-family-count">{kids.length} linked {kids.length === 1 ? 'student' : 'students'}</p>
                        <p className="pm-family-names">{kids.map((c) => c.student.fullName).join(', ')}</p>
                    </>
                ) : (
                    <button type="button" className="pm-add-link" onClick={() => onLink(p.id)}><Link2 size={15} />Link a student</button>
                )}
            </div>
        </article>
    );
}

/* ================================ table ================================== */

function ParentTable({ rows, selected, onToggle, onToggleAll, allOnPage, someOnPage, sort, onSort, onView, menuFor }) {
    const th = (key, text) => {
        const active = sort.key === key;
        return (
            <th aria-sort={active ? (sort.dir === 'asc' ? 'ascending' : 'descending') : 'none'}>
                <button type="button" className={cx('pm-sort', active && 'active', active && sort.dir === 'desc' && 'desc')} onClick={() => onSort(key)}>
                    {text}<ChevronDown size={14} />
                </button>
            </th>
        );
    };
    return (
        <div className="pm-table-wrap">
            <table className="pm-table">
                <thead>
                    <tr>
                        <th style={{ width: 44 }}><Checkbox checked={allOnPage} indeterminate={someOnPage} onChange={onToggleAll} label="Select all parents on this page" /></th>
                        {th('name', 'Parent')}
                        {th('id', 'Parent ID')}
                        {th('relationship', 'Relationship')}
                        <th>Phone</th>
                        <th>Email</th>
                        {th('childCount', 'Linked students')}
                        {th('registrationDate', 'Registered')}
                        {th('status', 'Status')}
                        <th style={{ width: 56 }}><span className="visually-hidden">Actions</span></th>
                    </tr>
                </thead>
                <tbody>
                    {rows.map((p, i) => (
                        <tr key={p.id} className={selected.has(p.id) ? 'is-selected' : ''} style={{ '--i': Math.min(i, 15) }}>
                            <td><Checkbox checked={selected.has(p.id)} onChange={() => onToggle(p.id)} label={`Select ${p.fullName}`} /></td>
                            <td>
                                <button type="button" className="pm-cell-parent" onClick={() => onView(p.id)}>
                                    <Avatar name={p.fullName} src={p.photoUrl} size={36} />
                                    <span><span className="nm">{p.fullName}</span>{p.isPrimaryGuardian && <span style={{ display: 'block' }}><PrimaryBadge label="Primary" /></span>}</span>
                                </button>
                            </td>
                            <td className="pm-id">{p.id}</td>
                            <td><RelBadge value={p.relationship} /></td>
                            <td style={{ whiteSpace: 'nowrap' }}>{p.phone || '—'}</td>
                            <td><span className="pm-ellipsis" title={p.email}>{p.email || '—'}</span></td>
                            <td style={{ minWidth: 170 }}>
                                {p.children.length ? p.children.map((c) => <span key={c.student.id} className="pm-chip-student">{c.student.fullName}</span>) : <span className="pm-muted">None</span>}
                            </td>
                            <td style={{ whiteSpace: 'nowrap' }}>{fmtDate(p.registrationDate)}</td>
                            <td><StatusBadge status={p.status} /></td>
                            <td><ActionMenu items={menuFor(p)} label={`Actions for ${p.fullName}`} /></td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

function Pagination({ page, totalPages, pageSize, total, onPage, onSize }) {
    const start = total ? (page - 1) * pageSize + 1 : 0;
    const end = Math.min(total, page * pageSize);
    return (
        <nav className="pm-pager" aria-label="Pagination">
            <div className="d-flex align-items-center gap-2">
                <span>Showing {start}–{end} of {total}</span>
                <select className="form-select form-select-sm" style={{ width: 'auto' }} value={pageSize} onChange={(e) => onSize(Number(e.target.value))} aria-label="Parents per page">
                    {[6, 12, 24, 48].map((n) => <option key={n} value={n}>{n} per page</option>)}
                </select>
            </div>
            <div className="pm-pages">
                <button type="button" className="pm-page-btn" disabled={page <= 1} onClick={() => onPage(page - 1)} aria-label="Previous page"><ChevronLeft size={16} /></button>
                {pageWindow(page, totalPages).map((n) => (typeof n === 'string'
                    ? <span key={n} className="pm-muted px-1">…</span>
                    : <button key={n} type="button" className={cx('pm-page-btn', n === page && 'active')} onClick={() => onPage(n)} aria-current={n === page ? 'page' : undefined}>{n}</button>))}
                <button type="button" className="pm-page-btn" disabled={page >= totalPages} onClick={() => onPage(page + 1)} aria-label="Next page"><ChevronRight size={16} /></button>
            </div>
        </nav>
    );
}

/* ============================= profile offcanvas ========================== */

const PROFILE_TABS = [
    { key: 'personal', label: 'Personal', icon: User },
    { key: 'family', label: 'Family', icon: Heart },
    { key: 'children', label: 'Linked children', icon: GraduationCap },
    { key: 'emergency', label: 'Emergency', icon: AlertTriangle },
    { key: 'registration', label: 'Registration', icon: ShieldCheck },
];

function CommunicationPanel({ p, onToast }) {
    const [copied, setCopied] = useState('');
    const doCopy = async (kind, value) => {
        const ok = await copyText(value);
        if (ok) {
            setCopied(kind);
            setTimeout(() => setCopied(''), 1600);
            onToast('success', kind === 'phone' ? 'Phone number copied' : 'Email address copied', value);
        } else {
            onToast('warning', 'Could not copy', 'Select the text and copy it manually.');
        }
    };
    return (
        <section className="pm-comm" style={{ margin: '0 0 1.1rem' }} aria-label="Contact">
            <div className="pm-comm-card">
                <div className="lbl"><Phone size={13} />Phone</div>
                <div className="val">{p.phone || 'Not provided'}</div>
                <div className="pm-comm-actions">
                    <button type="button" className="pm-btn pm-btn-soft pm-btn-sm" disabled={!p.phone} onClick={() => doCopy('phone', p.phone)}>
                        {copied === 'phone' ? <Check size={14} /> : <Copy size={14} />}Copy
                    </button>
                    {p.phone ? <a className="pm-btn pm-btn-teal pm-btn-sm text-decoration-none" href={`tel:${toDialable(p.phone)}`}><Phone size={14} />Call</a> : null}
                </div>
            </div>
            <div className="pm-comm-card">
                <div className="lbl"><Mail size={13} />Email</div>
                <div className="val">{p.email || 'Not provided'}</div>
                <div className="pm-comm-actions">
                    <button type="button" className="pm-btn pm-btn-soft pm-btn-sm" disabled={!p.email} onClick={() => doCopy('email', p.email)}>
                        {copied === 'email' ? <Check size={14} /> : <Copy size={14} />}Copy
                    </button>
                    {p.email ? <a className="pm-btn pm-btn-teal pm-btn-sm text-decoration-none" href={`mailto:${p.email}`}><Mail size={14} />Write email</a> : null}
                </div>
            </div>
            <div className="pm-comm-meta">
                <span>Prefers: <b>{p.communicationPreference || 'Not set'}</b></span>
                <span>Last contact: <b>{p.lastContactDate ? fmtDate(p.lastContactDate) : 'No record'}</b></span>
            </div>
        </section>
    );
}

function ProfileOffcanvas({ open, parent, onClose, ...rest }) {
    const p = useHeld(parent);
    return (
        <Overlay open={open} onClose={onClose} variant="offcanvas" label="Parent profile">
            {p && <ProfileContent key={p.id} p={p} onClose={onClose} {...rest} />}
        </Overlay>
    );
}

function ProfileContent({ p, onClose, onEdit, onManage, onStudent, onToast }) {
    const [tab, setTab] = useState('personal');
    return (
        <>
            <div className="pm-profile-hero">
                <button type="button" className="pm-icon-btn" onClick={onClose} aria-label="Close profile"><X size={18} /></button>
                <div className="pm-hero-row">
                    <Avatar name={p.fullName} src={p.photoUrl} size={72} />
                    <div>
                        <h2>{p.fullName}</h2>
                        <div className="pm-id mb-2">{p.id}</div>
                        <div className="pm-badges">
                            <RelBadge value={p.relationship} />
                            <StatusBadge status={p.status} />
                            {p.isPrimaryGuardian && <PrimaryBadge />}
                        </div>
                    </div>
                </div>
            </div>
            <div className="pm-tabs" role="tablist">
                {PROFILE_TABS.map((t) => (
                    <button key={t.key} type="button" role="tab" aria-selected={tab === t.key} className={cx('pm-tab', tab === t.key && 'active')} onClick={() => setTab(t.key)}>
                        <t.icon size={15} />{t.label}
                        {t.key === 'children' && <span className="pm-side-count">{p.childCount}</span>}
                    </button>
                ))}
            </div>
            <div className="pm-ov-body">
                <CommunicationPanel p={p} onToast={onToast} />
                <div key={tab} className="pm-section-in" role="tabpanel">
                    {tab === 'personal' && (
                        <dl className="pm-info-grid">
                            <Info2 label="First name" value={p.firstName} />
                            <Info2 label="Middle name" value={p.middleName} />
                            <Info2 label="Last name" value={p.lastName} />
                            <Info2 label="Gender" value={p.gender} />
                            <Info2 label="Date of birth" value={p.dateOfBirth ? fmtDate(p.dateOfBirth) : ''} />
                            <Info2 label="Occupation" value={p.occupation} />
                            <Info2 label="Phone" value={p.phone} />
                            <Info2 label="Alternative phone" value={p.altPhone} />
                            <Info2 label="Email" value={p.email} />
                            <Info2 label="Address" value={p.address} />
                            <Info2 label="City" value={p.city} />
                        </dl>
                    )}
                    {tab === 'family' && (
                        <dl className="pm-info-grid">
                            <Info2 label="Relationship to students" value={REL_LABEL[p.relationship]} />
                            <Info2 label="Marital status" value={p.maritalStatus} />
                            <Info2 label="Linked students" value={p.childCount} />
                            <Info2 label="Primary guardian" value={p.isPrimaryGuardian ? `Yes, for ${p.children.filter((c) => c.link.isPrimary).length} of ${p.childCount} students` : 'No'} />
                            <Info2 label="Relationship notes" value={p.relationshipNotes} wide />
                        </dl>
                    )}
                    {tab === 'children' && (
                        <>
                            {p.children.length === 0 && <div className="pm-alert info"><Info size={18} /><div>No students are linked to this parent yet.</div></div>}
                            {p.children.map((c) => (
                                <button key={c.student.id} type="button" className="pm-child-row" onClick={() => onStudent(c.student.id)}>
                                    <Avatar name={c.student.fullName} src={c.student.photoUrl} size={42} />
                                    <span className="grow">
                                        <strong>{c.student.fullName}</strong>
                                        <small className="pm-muted">{c.student.id}, {gradeLabel(c.student)}</small>
                                    </span>
                                    <span className="pm-badges"><RelBadge value={c.link.relationship} />{c.link.isPrimary && <PrimaryBadge label="Primary" />}</span>
                                    <ChevronRight size={16} className="pm-muted" />
                                </button>
                            ))}
                        </>
                    )}
                    {tab === 'emergency' && (
                        <dl className="pm-info-grid">
                            <Info2 label="Contact name" value={p.emergencyContact.name} />
                            <Info2 label="Relationship" value={p.emergencyContact.relationship} />
                            <Info2 label="Phone" value={p.emergencyContact.phone} />
                            <Info2 label="Address" value={p.emergencyContact.address} />
                            <Info2 label="Additional notes" value={p.notes} wide />
                        </dl>
                    )}
                    {tab === 'registration' && (
                        <dl className="pm-info-grid">
                            <Info2 label="Parent ID" value={p.id} />
                            <Info2 label="Registration date" value={fmtDate(p.registrationDate)} />
                            <Info2 label="Status" value={STATUS_LABEL[p.status]} />
                            <Info2 label="Last updated" value={fmtDateTime(p.updatedAt)} />
                        </dl>
                    )}
                </div>
            </div>
            <div className="pm-ov-foot">
                <button type="button" className="pm-btn pm-btn-soft" onClick={() => onManage(p.id)}><Network size={16} />Manage relationships</button>
                <button type="button" className="pm-btn pm-btn-primary" onClick={() => onEdit(p.id)}><Pencil size={16} />Edit profile</button>
            </div>
        </>
    );
}

function StudentPreview({ open, student, guardians, onClose }) {
    const s = useHeld(student);
    const g = useHeld(guardians) || [];
    return (
        <Overlay open={open} onClose={onClose} size="sm" label="Student preview">
            {s && (
                <>
                    <OverlayHead icon={GraduationCap} title={s.fullName} subtitle={`${s.id}, ${gradeLabel(s)}`} onClose={onClose} />
                    <div className="pm-ov-body">
                        <dl className="pm-info-grid" style={{ marginBottom: '1.1rem' }}>
                            <Info2 label="Gender" value={s.gender} />
                            <Info2 label="Grade and section" value={gradeLabel(s)} />
                        </dl>
                        <h3 className="pm-serif" style={{ fontSize: '1rem', marginBottom: '0.6rem' }}>Parents and guardians</h3>
                        {g.length === 0 && <div className="pm-alert warn"><AlertTriangle size={18} /><div>No guardian is linked to this student.</div></div>}
                        {g.map(({ parent, link }) => (
                            <div key={parent.id} className="pm-child-row" style={{ cursor: 'default' }}>
                                <Avatar name={parent.fullName} src={parent.photoUrl} size={38} />
                                <span className="grow"><strong>{parent.fullName}</strong><small className="pm-muted">{parent.phone}</small></span>
                                <span className="pm-badges"><RelBadge value={link.relationship} />{link.isPrimary && <PrimaryBadge label="Primary" />}</span>
                            </div>
                        ))}
                    </div>
                </>
            )}
        </Overlay>
    );
}

/* ============================== generic picker =========================== */

function PickerList({ items, onPick, placeholder, emptyText, actionLabel = 'Link' }) {
    const [q, setQ] = useState('');
    const shown = useMemo(() => {
        const s = q.trim().toLowerCase();
        return (s ? items.filter((i) => i.search.includes(s)) : items).slice(0, 50);
    }, [items, q]);
    return (
        <div className="pm-picker">
            <div className="pm-picker-search">
                <Search size={16} />
                <input
                    className="form-control"
                    value={q}
                    placeholder={placeholder}
                    aria-label={placeholder}
                    onChange={(e) => setQ(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') e.preventDefault(); }}
                />
            </div>
            <div className="pm-picker-list">
                {shown.length ? shown.map((i) => (
                    <button key={i.id} type="button" className="pm-picker-item" onClick={() => onPick(i)}>
                        <Avatar name={i.name} src={i.photoUrl} size={34} />
                        <span className="grow"><strong>{i.name}</strong><small>{i.sub}</small></span>
                        <span className="pm-badge b-mother"><Plus size={12} />{actionLabel}</span>
                    </button>
                )) : <div className="pm-picker-empty">{emptyText}</div>}
            </div>
        </div>
    );
}

const studentItem = (s) => ({
    id: s.id, name: s.fullName, sub: `${s.id}, ${gradeLabel(s)}`, photoUrl: s.photoUrl,
    search: `${s.fullName} ${s.id} grade ${s.grade} ${s.grade}${s.section}`.toLowerCase(),
});
const parentItem = (p) => ({
    id: p.id, name: p.fullName, sub: `${p.id}, ${REL_LABEL[p.relationship]}`, photoUrl: p.photoUrl,
    search: `${p.fullName} ${p.id} ${p.phone} ${p.email}`.toLowerCase(),
});

/* ================================ form modal ============================= */

const EMPTY_FORM = {
    firstName: '', middleName: '', lastName: '', gender: '', dateOfBirth: '', email: '', phone: '', altPhone: '', address: '', city: '',
    occupation: '', photoUrl: '', relationship: '', isPrimaryIntent: false, relationshipNotes: '', maritalStatus: '',
    emergencyName: '', emergencyRelationship: '', emergencyPhone: '', emergencyAddress: '',
    registrationDate: '', status: 'active', notes: '', communicationPreference: 'Phone call',
};

const FORM_SECTIONS = [
    { key: 'personal', label: 'Personal details', icon: User },
    { key: 'relationship', label: 'Relationship', icon: Heart },
    { key: 'students', label: 'Link students', icon: GraduationCap },
    { key: 'emergency', label: 'Emergency contact', icon: AlertTriangle },
    { key: 'extra', label: 'Additional info', icon: Info },
];

const FIELD_SECTION = {
    firstName: 'personal', middleName: 'personal', lastName: 'personal', gender: 'personal', dateOfBirth: 'personal', email: 'personal',
    phone: 'personal', altPhone: 'personal', address: 'personal', city: 'personal', occupation: 'personal', photoUrl: 'personal',
    relationship: 'relationship', primary: 'relationship', maritalStatus: 'relationship', students: 'students',
    emergencyPhone: 'emergency', registrationDate: 'extra', status: 'extra',
};

const formFromParent = (p) => ({
    ...EMPTY_FORM,
    firstName: p.firstName, middleName: p.middleName, lastName: p.lastName, gender: p.gender, dateOfBirth: p.dateOfBirth,
    email: p.email, phone: p.phone, altPhone: p.altPhone, address: p.address, city: p.city, occupation: p.occupation,
    photoUrl: p.photoUrl, relationship: p.relationship, relationshipNotes: p.relationshipNotes, maritalStatus: p.maritalStatus,
    emergencyName: p.emergencyContact.name, emergencyRelationship: p.emergencyContact.relationship,
    emergencyPhone: p.emergencyContact.phone, emergencyAddress: p.emergencyContact.address,
    registrationDate: p.registrationDate, status: p.status, notes: p.notes,
    communicationPreference: p.communicationPreference || 'Phone call',
    isPrimaryIntent: p.children.length > 0 && p.children.every((c) => c.link.isPrimary),
});

const buildPayload = (f) => ({
    firstName: f.firstName.trim(), middleName: f.middleName.trim(), lastName: f.lastName.trim(), gender: f.gender,
    dateOfBirth: f.dateOfBirth, email: f.email.trim(), phone: f.phone.trim(), altPhone: f.altPhone.trim(),
    address: f.address.trim(), city: f.city.trim(), occupation: f.occupation.trim(), photoUrl: f.photoUrl.trim(),
    relationship: f.relationship, relationshipNotes: f.relationshipNotes.trim(), maritalStatus: f.maritalStatus,
    communicationPreference: f.communicationPreference, registrationDate: f.registrationDate, status: f.status, notes: f.notes.trim(),
    emergencyContact: {
        name: f.emergencyName.trim(), relationship: f.emergencyRelationship.trim(), phone: f.emergencyPhone.trim(), address: f.emergencyAddress.trim(),
    },
});

function ParentFormModal({ session, onClose, ...rest }) {
    const held = useHeld(session);
    const title = held && held.parentId ? 'Edit parent' : 'Add new parent';
    return (
        <Overlay open={Boolean(session)} onClose={onClose} size="lg" label={title} dismissible={false}>
            {held && <ParentFormBody key={held.nonce} session={held} onClose={onClose} {...rest} />}
        </Overlay>
    );
}

function ParentFormBody({ session, students, guardiansByStudent, onClose, onSubmit }) {
    const editingId = session.parentId;
    const [form, setForm] = useState(() => session.initial.form);
    const [links, setLinks] = useState(() => session.initial.links);
    const [errors, setErrors] = useState({});
    const [section, setSection] = useState('personal');

    const set = (k, v) => {
        setForm((f) => ({ ...f, [k]: v }));
        setErrors((e) => { if (!e[k]) return e; const n = { ...e }; delete n[k]; return n; });
    };
    const bind = (k, extra = {}) => ({
        id: `pf-${k}`, value: form[k], onChange: (e) => set(k, e.target.value),
        'aria-invalid': errors[k] ? 'true' : undefined, 'aria-describedby': errors[k] ? `pf-${k}-err` : undefined, ...extra,
    });
    const cls = (k) => cx('form-control', errors[k] && 'is-invalid');
    const selCls = (k) => cx('form-select', errors[k] && 'is-invalid');

    const studentMap = useMemo(() => new Map(students.map((s) => [s.id, s])), [students]);
    const linkedIds = new Set(links.map((l) => l.studentId));
    const available = useMemo(() => students.filter((s) => !linkedIds.has(s.id)).map(studentItem), [students, links]); // eslint-disable-line react-hooks/exhaustive-deps

    const otherPrimary = (sid) => {
        const g = (guardiansByStudent.get(sid) || []).find((x) => x.link.isPrimary && x.parent.id !== editingId);
        return g ? g.parent : null;
    };
    const addLink = (item) => {
        const hasOther = Boolean(otherPrimary(item.id));
        setLinks((l) => [...l, { studentId: item.id, relationship: form.relationship || 'guardian', isPrimary: !hasOther || form.isPrimaryIntent }]);
        setErrors((e) => { const n = { ...e }; delete n.students; delete n.primary; return n; });
    };
    const applyLinks = (next) => {
        setLinks(next);
        setForm((f) => ({ ...f, isPrimaryIntent: next.length > 0 && next.every((x) => x.isPrimary) }));
    };
    const patchLink = (sid, patch) => applyLinks(links.map((x) => (x.studentId === sid ? { ...x, ...patch } : x)));
    const removeLink = (sid) => applyLinks(links.filter((x) => x.studentId !== sid));
    const togglePrimaryAll = (on) => {
        setForm((f) => ({ ...f, isPrimaryIntent: on }));
        setLinks((l) => l.map((x) => ({ ...x, isPrimary: on })));
        setErrors((e) => { const n = { ...e }; delete n.primary; return n; });
    };

    const errorSections = useMemo(() => {
        const s = {};
        Object.keys(errors).forEach((k) => { const sec = FIELD_SECTION[k]; if (sec) s[sec] = (s[sec] || 0) + 1; });
        return s;
    }, [errors]);

    const submit = (e) => {
        if (e) e.preventDefault();
        const found = validateParent(buildPayload(form));
        if (form.isPrimaryIntent && links.length === 0) found.primary = 'Link at least one student before marking this parent as a primary guardian.';
        if (Object.keys(found).length) {
            setErrors(found);
            const first = FORM_SECTIONS.find((s) => Object.keys(found).some((k) => FIELD_SECTION[k] === s.key));
            if (first) setSection(first.key);
            return;
        }
        const res = onSubmit(buildPayload(form), links, editingId);
        if (res && !res.ok && res.errors) {
            setErrors(res.errors);
            const first = FORM_SECTIONS.find((s) => Object.keys(res.errors).some((k) => FIELD_SECTION[k] === s.key));
            if (first) setSection(first.key);
        }
    };

    const idx = FORM_SECTIONS.findIndex((s) => s.key === section);
    const title = editingId ? 'Edit parent' : 'Add new parent';

    return (
        <>
            <OverlayHead icon={editingId ? Pencil : UserPlus} title={title} subtitle={editingId ? `Updating ${editingId}` : 'A parent ID is created when you save.'} onClose={onClose} />
            <div className="pm-form-tabs" role="tablist">
                {FORM_SECTIONS.map((s) => (
                    <button key={s.key} type="button" role="tab" aria-selected={section === s.key} className={cx('pm-tab', section === s.key && 'active')} onClick={() => setSection(s.key)}>
                        <s.icon size={15} />{s.label}{errorSections[s.key] ? <span className="dot-err" title="This section has errors" /> : null}
                    </button>
                ))}
            </div>
            <form onSubmit={submit} noValidate style={{ display: 'contents' }}>
                <div className="pm-ov-body">
                    {errors._form && <div className="pm-alert mb-3" role="alert"><AlertTriangle size={18} /><div>{errors._form}</div></div>}
                    <div key={section} className="pm-section-in">
                        {section === 'personal' && (
                            <div className="row g-3">
                                <div className="col-md-4"><Field id="pf-firstName" label="First name" required error={errors.firstName}><input className={cls('firstName')} {...bind('firstName', { autoComplete: 'given-name' })} /></Field></div>
                                <div className="col-md-4"><Field id="pf-middleName" label="Middle name"><input className="form-control" {...bind('middleName')} /></Field></div>
                                <div className="col-md-4"><Field id="pf-lastName" label="Last name" required error={errors.lastName}><input className={cls('lastName')} {...bind('lastName', { autoComplete: 'family-name' })} /></Field></div>
                                <div className="col-md-6">
                                    <Field id="pf-gender" label="Gender" required error={errors.gender}>
                                        <select className={selCls('gender')} {...bind('gender')}><option value="">Select gender</option>{GENDERS.map((g) => <option key={g} value={g}>{g}</option>)}</select>
                                    </Field>
                                </div>
                                <div className="col-md-6"><Field id="pf-dateOfBirth" label="Date of birth" error={errors.dateOfBirth}><input type="date" max={todayISO()} className={cls('dateOfBirth')} {...bind('dateOfBirth')} /></Field></div>
                                <div className="col-md-6"><Field id="pf-phone" label="Phone" required error={errors.phone} hint="Example: +251 911 234 567 or 0911234567"><input type="tel" className={cls('phone')} {...bind('phone', { autoComplete: 'tel' })} /></Field></div>
                                <div className="col-md-6"><Field id="pf-altPhone" label="Alternative phone" error={errors.altPhone}><input type="tel" className={cls('altPhone')} {...bind('altPhone')} /></Field></div>
                                <div className="col-md-6"><Field id="pf-email" label="Email" error={errors.email}><input type="email" className={cls('email')} {...bind('email', { autoComplete: 'email' })} /></Field></div>
                                <div className="col-md-6"><Field id="pf-occupation" label="Occupation"><input className="form-control" {...bind('occupation')} /></Field></div>
                                <div className="col-md-8"><Field id="pf-address" label="Address"><input className="form-control" {...bind('address')} /></Field></div>
                                <div className="col-md-4"><Field id="pf-city" label="City"><input className="form-control" {...bind('city')} /></Field></div>
                                <div className="col-12"><Field id="pf-photoUrl" label="Profile photo URL (optional)" error={errors.photoUrl} hint="Leave blank to show initials."><input type="url" className={cls('photoUrl')} {...bind('photoUrl')} placeholder="https://" /></Field></div>
                            </div>
                        )}

                        {section === 'relationship' && (
                            <div className="row g-3">
                                <div className="col-md-6">
                                    <Field id="pf-relationship" label="Relationship" required error={errors.relationship}>
                                        <select className={selCls('relationship')} {...bind('relationship')}><option value="">Select relationship</option>{RELATIONSHIPS.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}</select>
                                    </Field>
                                </div>
                                <div className="col-md-6">
                                    <Field id="pf-maritalStatus" label="Marital status">
                                        <select className="form-select" {...bind('maritalStatus')}><option value="">Not provided</option>{MARITAL_STATUSES.map((m) => <option key={m} value={m}>{m}</option>)}</select>
                                    </Field>
                                </div>
                                <div className="col-12">
                                    <label className={cx('pm-switch', form.isPrimaryIntent && 'on')} htmlFor="pf-primary">
                                        <input id="pf-primary" type="checkbox" checked={form.isPrimaryIntent} onChange={(e) => togglePrimaryAll(e.target.checked)} />
                                        <span><strong>Primary guardian for all linked students</strong><span className="pm-hint d-block">A student has one primary guardian. Choosing this replaces the current primary guardian of each linked student. You can also set this per student in the next step.</span></span>
                                    </label>
                                    {errors.primary && <div className="pm-error" role="alert"><AlertTriangle size={13} />{errors.primary}</div>}
                                </div>
                                <div className="col-12"><Field id="pf-relationshipNotes" label="Relationship notes"><textarea rows={3} className="form-control" {...bind('relationshipNotes')} /></Field></div>
                            </div>
                        )}

                        {section === 'students' && (
                            <>
                                <p className="pm-muted mb-3">Link existing students only. No new student is created. A student can have several parents or guardians, and a parent can have several students.</p>
                                {errors.students && <div className="pm-alert mb-3" role="alert"><AlertTriangle size={18} /><div>{errors.students}</div></div>}
                                <PickerList items={available} onPick={addLink} placeholder="Search students by name, ID or grade" emptyText={students.length === links.length ? 'Every student is already linked.' : 'No students match your search.'} />
                                <h3 className="pm-serif mt-4 mb-2" style={{ fontSize: '1rem' }}>Linked students ({links.length})</h3>
                                {links.length === 0 && <div className="pm-alert info"><Info size={18} /><div>No students linked yet. You can save the parent now and link students later.</div></div>}
                                {links.map((l) => {
                                    const s = studentMap.get(l.studentId);
                                    if (!s) return null;
                                    const other = otherPrimary(l.studentId);
                                    const note = l.isPrimary && other ? `${other.fullName} is the current primary guardian and will be replaced.`
                                        : (!l.isPrimary && !other ? 'No other primary guardian exists, so this parent will be set as primary.' : '');
                                    return (
                                        <div key={l.studentId} className="pm-linked-row">
                                            <div className="who">
                                                <Avatar name={s.fullName} src={s.photoUrl} size={38} />
                                                <div><strong>{s.fullName}</strong><small>{s.id}, {gradeLabel(s)}</small></div>
                                            </div>
                                            <select className="form-select form-select-sm" value={l.relationship} onChange={(e) => patchLink(l.studentId, { relationship: e.target.value })} aria-label={`Relationship to ${s.fullName}`}>
                                                {RELATIONSHIPS.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
                                            </select>
                                            <button type="button" className={cx('pm-primary-toggle', l.isPrimary && 'on')} aria-pressed={l.isPrimary} onClick={() => patchLink(l.studentId, { isPrimary: !l.isPrimary })}>
                                                <Star size={13} />{l.isPrimary ? 'Primary' : 'Make primary'}
                                            </button>
                                            <button type="button" className="pm-icon-btn danger" onClick={() => removeLink(l.studentId)} aria-label={`Remove link to ${s.fullName}`}><X size={16} /></button>
                                            {note && <div className="pm-linked-note">{note}</div>}
                                        </div>
                                    );
                                })}
                            </>
                        )}

                        {section === 'emergency' && (
                            <div className="row g-3">
                                <div className="col-md-6"><Field id="pf-emergencyName" label="Contact name"><input className="form-control" {...bind('emergencyName')} /></Field></div>
                                <div className="col-md-6"><Field id="pf-emergencyRelationship" label="Relationship to parent"><input className="form-control" {...bind('emergencyRelationship')} placeholder="Spouse, sibling, neighbour" /></Field></div>
                                <div className="col-md-6"><Field id="pf-emergencyPhone" label="Phone number" error={errors.emergencyPhone}><input type="tel" className={cls('emergencyPhone')} {...bind('emergencyPhone')} /></Field></div>
                                <div className="col-md-6"><Field id="pf-emergencyAddress" label="Address"><input className="form-control" {...bind('emergencyAddress')} /></Field></div>
                            </div>
                        )}

                        {section === 'extra' && (
                            <div className="row g-3">
                                <div className="col-md-4"><Field id="pf-registrationDate" label="Registration date" required error={errors.registrationDate}><input type="date" className={cls('registrationDate')} {...bind('registrationDate')} /></Field></div>
                                <div className="col-md-4">
                                    <Field id="pf-status" label="Parent status" required error={errors.status}>
                                        <select className={selCls('status')} {...bind('status')}>{STATUSES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}</select>
                                    </Field>
                                </div>
                                <div className="col-md-4">
                                    <Field id="pf-communicationPreference" label="Preferred contact method">
                                        <select className="form-select" {...bind('communicationPreference')}>{COMMUNICATION_PREFERENCES.map((c) => <option key={c} value={c}>{c}</option>)}</select>
                                    </Field>
                                </div>
                                <div className="col-12"><Field id="pf-notes" label="Notes"><textarea rows={4} className="form-control" {...bind('notes')} /></Field></div>
                            </div>
                        )}
                    </div>
                </div>
                <div className="pm-ov-foot">
                    <button type="button" className="pm-btn pm-btn-soft spacer" onClick={onClose}>Cancel</button>
                    {idx > 0 && <button type="button" className="pm-btn pm-btn-soft" onClick={() => setSection(FORM_SECTIONS[idx - 1].key)}><ArrowLeft size={15} />Back</button>}
                    {idx < FORM_SECTIONS.length - 1 && <button type="button" className="pm-btn pm-btn-teal" onClick={() => setSection(FORM_SECTIONS[idx + 1].key)}>Next<ArrowRight size={15} /></button>}
                    <button type="submit" className="pm-btn pm-btn-primary"><Save size={16} />{editingId ? 'Save changes' : 'Save parent'}</button>
                </div>
            </form>
        </>
    );
}

/* ========================== relationship manager ========================= */

function RelationshipManager({ session, onClose, ...rest }) {
    const held = useHeld(session);
    return (
        <Overlay open={Boolean(session)} onClose={onClose} size="xl" label="Family relationships">
            {held && <RelationshipBody key={held.nonce} session={held} onClose={onClose} {...rest} />}
        </Overlay>
    );
}

function RelationshipBody({ session, onClose, enriched, students, guardiansByStudent, actions }) {
    const [tab, setTab] = useState(session.tab || 'parent');
    const [parentId, setParentId] = useState(session.tab === 'student' ? null : session.id || null);
    const [studentId, setStudentId] = useState(session.tab === 'student' ? session.id || null : null);
    const [q, setQ] = useState('');
    const [pending, setPending] = useState(null);
    const [rel, setRel] = useState('guardian');
    const [primary, setPrimary] = useState(false);
    const [confirming, setConfirming] = useState('');
    const addRef = useRef(null);

    useEffect(() => {
        if (!session.focusAdd) return undefined;
        const t = setTimeout(() => { if (addRef.current) addRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' }); }, 450);
        return () => clearTimeout(t);
    }, [session.focusAdd]);

    const sortedParents = useMemo(() => [...enriched].sort((a, b) => a.fullName.localeCompare(b.fullName)), [enriched]);
    const sortedStudents = useMemo(() => [...students].sort((a, b) => a.fullName.localeCompare(b.fullName)), [students]);
    const activeParent = sortedParents.find((p) => p.id === parentId) || (tab === 'parent' ? sortedParents[0] : null);
    const activeStudent = sortedStudents.find((s) => s.id === studentId) || (tab === 'student' ? sortedStudents[0] : null);

    const needle = q.trim().toLowerCase();
    const parentList = sortedParents.filter((p) => !needle || `${p.fullName} ${p.id}`.toLowerCase().includes(needle));
    const studentList = sortedStudents.filter((s) => !needle || `${s.fullName} ${s.id}`.toLowerCase().includes(needle));

    const switchTab = (t) => { setTab(t); setQ(''); setPending(null); setConfirming(''); };
    const guardiansOf = (sid) => guardiansByStudent.get(sid) || [];

    const doLink = (pid, sid) => {
        const res = actions.link(pid, sid, rel, primary);
        if (res.ok) { setPending(null); setPrimary(false); }
    };
    const doUnlink = (pid, sid) => { actions.unlink(pid, sid); setConfirming(''); };

    const linkedStudentIds = new Set(activeParent ? activeParent.children.map((c) => c.student.id) : []);
    const studentOptions = students.filter((s) => !linkedStudentIds.has(s.id)).map(studentItem);
    const linkedParentIds = new Set(activeStudent ? guardiansOf(activeStudent.id).map((g) => g.parent.id) : []);
    const parentOptions = enriched.filter((p) => p.status !== 'archived' && !linkedParentIds.has(p.id)).map(parentItem);

    const controls = (pid, sid, link, key) => (
        <div className="pm-tree-actions">
            <select className="form-select form-select-sm" style={{ width: 'auto' }} value={link.relationship} aria-label="Relationship type"
                onChange={(e) => actions.setRel(pid, sid, e.target.value)}>
                {RELATIONSHIPS.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
            </select>
            {link.isPrimary
                ? <span className="pm-primary-toggle on"><Star size={13} />Primary</span>
                : <button type="button" className="pm-primary-toggle" onClick={() => actions.setPrimary(pid, sid)}><Star size={13} />Make primary</button>}
            {confirming === key ? (
                <>
                    <button type="button" className="pm-btn pm-btn-danger pm-btn-sm" onClick={() => doUnlink(pid, sid)}><Unlink size={13} />Remove link</button>
                    <button type="button" className="pm-btn pm-btn-soft pm-btn-sm" onClick={() => setConfirming('')}>Keep</button>
                </>
            ) : (
                <button type="button" className="pm-icon-btn danger" onClick={() => setConfirming(key)} aria-label="Remove this relationship"><Unlink size={16} /></button>
            )}
        </div>
    );

    const addControls = (name, onLink) => (
        <div className="pm-add-controls">
            <span><strong>{name}</strong> as</span>
            <select className="form-select form-select-sm" style={{ width: 'auto' }} value={rel} onChange={(e) => setRel(e.target.value)} aria-label="Relationship type">
                {RELATIONSHIPS.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
            </select>
            <label className="d-flex align-items-center gap-2" style={{ fontSize: '0.85rem' }}>
                <input type="checkbox" checked={primary} onChange={(e) => setPrimary(e.target.checked)} style={{ accentColor: '#0d9488' }} />Primary guardian
            </label>
            <button type="button" className="pm-btn pm-btn-primary pm-btn-sm" onClick={onLink}><Link2 size={14} />Link</button>
            <button type="button" className="pm-btn pm-btn-soft pm-btn-sm" onClick={() => setPending(null)}>Cancel</button>
        </div>
    );

    return (
        <>
            <OverlayHead icon={Network} title="Family relationships" subtitle="See who is connected to whom, and change links, relationship types and primary guardians." onClose={onClose} />
            <div className="pm-form-tabs" role="tablist">
                <button type="button" role="tab" aria-selected={tab === 'parent'} className={cx('pm-tab', tab === 'parent' && 'active')} onClick={() => switchTab('parent')}><Users size={15} />By parent</button>
                <button type="button" role="tab" aria-selected={tab === 'student'} className={cx('pm-tab', tab === 'student' && 'active')} onClick={() => switchTab('student')}><GraduationCap size={15} />By student</button>
            </div>
            <div className="pm-manager">
                <aside className="pm-side">
                    <div className="pm-picker-search" style={{ position: 'relative' }}>
                        <Search size={16} style={{ position: 'absolute', left: '0.8rem', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
                        <input className="form-control" style={{ border: 0, borderRadius: 0, paddingLeft: '2.4rem' }} placeholder={tab === 'parent' ? 'Find a parent' : 'Find a student'} aria-label="Search list" value={q} onChange={(e) => setQ(e.target.value)} />
                    </div>
                    <div className="pm-side-list">
                        {tab === 'parent' && parentList.map((p) => (
                            <button key={p.id} type="button" className={cx('pm-side-item', activeParent && activeParent.id === p.id && 'active')} onClick={() => { setParentId(p.id); setPending(null); setConfirming(''); }}>
                                <Avatar name={p.fullName} src={p.photoUrl} size={36} />
                                <span className="grow"><strong>{p.fullName}</strong><small>{REL_LABEL[p.relationship]}{p.status === 'archived' ? ', archived' : ''}</small></span>
                                <span className="pm-side-count">{p.childCount}</span>
                            </button>
                        ))}
                        {tab === 'student' && studentList.map((s) => (
                            <button key={s.id} type="button" className={cx('pm-side-item', activeStudent && activeStudent.id === s.id && 'active')} onClick={() => { setStudentId(s.id); setPending(null); setConfirming(''); }}>
                                <Avatar name={s.fullName} src={s.photoUrl} size={36} />
                                <span className="grow"><strong>{s.fullName}</strong><small>{gradeLabel(s)}</small></span>
                                <span className="pm-side-count">{guardiansOf(s.id).length}</span>
                            </button>
                        ))}
                        {((tab === 'parent' && !parentList.length) || (tab === 'student' && !studentList.length)) && <div className="pm-picker-empty">Nothing matches your search.</div>}
                    </div>
                </aside>

                <div className="pm-main">
                    {tab === 'parent' && activeParent && (
                        <div className="pm-tree" key={`p-${activeParent.id}`}>
                            <div className="pm-tree-root">
                                <Avatar name={activeParent.fullName} src={activeParent.photoUrl} size={48} />
                                <div><strong>{activeParent.fullName}</strong><small>{REL_LABEL[activeParent.relationship]}, {activeParent.id}</small></div>
                            </div>
                            {activeParent.children.length ? (
                                <ul className="pm-tree-branches">
                                    {activeParent.children.map((c, i) => {
                                        const others = guardiansOf(c.student.id).filter((g) => g.parent.id !== activeParent.id);
                                        return (
                                            <li key={c.student.id} style={{ '--i': i }}>
                                                <div className="pm-tree-node">
                                                    <div className="who">
                                                        <Avatar name={c.student.fullName} src={c.student.photoUrl} size={40} />
                                                        <div>
                                                            <strong>{c.student.fullName}</strong>
                                                            <small>{c.student.id}, {gradeLabel(c.student)}</small>
                                                            {others.length > 0 && <small className="d-block">Also linked: {others.map((g) => `${g.parent.fullName} (${REL_LABEL[g.link.relationship]})`).join(', ')}</small>}
                                                        </div>
                                                    </div>
                                                    {controls(activeParent.id, c.student.id, c.link, `${activeParent.id}|${c.student.id}`)}
                                                </div>
                                            </li>
                                        );
                                    })}
                                </ul>
                            ) : <div className="pm-alert info mt-3"><Info size={18} /><div>{activeParent.fullName} has no linked students yet.</div></div>}
                            <div className="pm-add-box" ref={addRef}>
                                <h4><Link2 size={16} />Link another student</h4>
                                {!pending
                                    ? <PickerList items={studentOptions} onPick={(i) => { setPending(i); setPrimary(false); setRel(activeParent.relationship || 'guardian'); }} placeholder="Search students by name or ID" emptyText="Every student is already linked to this parent." />
                                    : addControls(pending.name, () => doLink(activeParent.id, pending.id))}
                            </div>
                        </div>
                    )}

                    {tab === 'student' && activeStudent && (
                        <div className="pm-tree" key={`s-${activeStudent.id}`}>
                            <div className="pm-tree-root">
                                <Avatar name={activeStudent.fullName} src={activeStudent.photoUrl} size={48} />
                                <div><strong>{activeStudent.fullName}</strong><small>{activeStudent.id}, {gradeLabel(activeStudent)}</small></div>
                            </div>
                            {guardiansOf(activeStudent.id).length ? (
                                <ul className="pm-tree-branches">
                                    {guardiansOf(activeStudent.id).map((g, i) => (
                                        <li key={g.parent.id} style={{ '--i': i }}>
                                            <div className="pm-tree-node">
                                                <div className="who">
                                                    <Avatar name={g.parent.fullName} src={g.parent.photoUrl} size={40} />
                                                    <div><strong>{g.parent.fullName}</strong><small>{g.parent.id}, {g.parent.phone}</small></div>
                                                </div>
                                                {controls(g.parent.id, activeStudent.id, g.link, `${g.parent.id}|${activeStudent.id}`)}
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            ) : <div className="pm-alert warn mt-3"><AlertTriangle size={18} /><div>No guardian is linked to this student. Link a parent below.</div></div>}
                            <div className="pm-add-box" ref={addRef}>
                                <h4><UserPlus size={16} />Link a parent or guardian</h4>
                                {!pending
                                    ? <PickerList items={parentOptions} onPick={(i) => { setPending(i); setPrimary(guardiansOf(activeStudent.id).length === 0); setRel(enriched.find((p) => p.id === i.id).relationship || 'guardian'); }} placeholder="Search parents by name, ID, phone or email" emptyText="Every active parent is already linked to this student." />
                                    : addControls(pending.name, () => doLink(pending.id, activeStudent.id))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
            <div className="pm-ov-foot"><button type="button" className="pm-btn pm-btn-primary" onClick={onClose}>Done</button></div>
        </>
    );
}

/* ================================ dialogs ================================ */

function ConfirmBody({ c, onCancel, onConfirm }) {
    const [typed, setTyped] = useState('');
    const blocked = c.requireText && typed.trim() !== c.requireText;
    const Icon = c.tone === 'info' ? Info : AlertTriangle;
    return (
        <>
            <div className={cx('pm-confirm', `tone-${c.tone || 'danger'}`)}>
                <div className="ico"><Icon size={26} /></div>
                <h2>{c.title}</h2>
                <div className="body">{c.body}</div>
                {c.requireText && (
                    <div className="typed">
                        <label className="pm-label" htmlFor="pm-confirm-text">Type <strong>{c.requireText}</strong> to confirm</label>
                        <input id="pm-confirm-text" className="form-control" value={typed} onChange={(e) => setTyped(e.target.value)} autoComplete="off" />
                    </div>
                )}
            </div>
            <div className="pm-ov-foot" style={{ border: 0, background: 'transparent', justifyContent: 'center', paddingTop: '1.2rem' }}>
                <button type="button" className="pm-btn pm-btn-soft" onClick={onCancel}>Cancel</button>
                {c.altLabel && <button type="button" className="pm-btn pm-btn-teal" onClick={c.onAlt}>{c.altLabel}</button>}
                <button type="button" className={cx('pm-btn', c.tone === 'warning' ? 'pm-btn-warn' : 'pm-btn-danger')} disabled={blocked} onClick={onConfirm}>{c.confirmLabel}</button>
            </div>
        </>
    );
}

function ConfirmDialog({ config, onCancel, onConfirm }) {
    const c = useHeld(config);
    return (
        <Overlay open={Boolean(config)} onClose={onCancel} size="sm" label={c ? c.title : 'Confirm'}>
            {c && <ConfirmBody key={c.id} c={c} onCancel={onCancel} onConfirm={onConfirm} />}
        </Overlay>
    );
}

function ExportBody({ onClose, enriched, filtered, selectedIds, onExport }) {
    const [scope, setScope] = useState(selectedIds.size ? 'selected' : 'filtered');
    const [rel, setRel] = useState('father');
    const [sidChoice, setSidChoice] = useState('');

    const studentOptions = useMemo(() => {
        const m = new Map();
        enriched.forEach((p) => p.children.forEach((c) => m.set(c.student.id, c.student)));
        return [...m.values()].sort((a, b) => a.fullName.localeCompare(b.fullName));
    }, [enriched]);
    const sid = sidChoice || (studentOptions[0] ? studentOptions[0].id : '');

    const records = useMemo(() => {
        switch (scope) {
            case 'all': return enriched;
            case 'filtered': return filtered;
            case 'selected': return enriched.filter((p) => selectedIds.has(p.id));
            case 'relationship': return enriched.filter((p) => p.relationship === rel);
            case 'student': return enriched.filter((p) => p.children.some((c) => c.student.id === sid));
            default: return [];
        }
    }, [scope, rel, sid, enriched, filtered, selectedIds]);

    const opt = (key, title, desc, count, disabled, extra) => (
        <label key={key} className={cx('pm-option', scope === key && 'on', disabled && 'disabled')}>
            <input type="radio" name="export-scope" checked={scope === key} disabled={disabled} onChange={() => setScope(key)} />
            <span style={{ flex: 1 }}>
                <strong>{title}</strong><span className="pm-hint d-block">{desc}</span>
                {scope === key && extra}
            </span>
            <span className="count">{count}</span>
        </label>
    );

    return (
        <>
            <OverlayHead icon={Download} title="Export parents to CSV" subtitle="Choose which records go into the report." onClose={onClose} />
            <div className="pm-ov-body">
                {opt('filtered', 'Current results', 'Parents that match your search and filters.', filtered.length)}
                {opt('selected', 'Selected parents', 'Only the parents you ticked.', selectedIds.size, selectedIds.size === 0)}
                {opt('all', 'All parents', 'Every parent record, including archived.', enriched.length)}
                {opt('relationship', 'By relationship', 'Fathers, mothers, guardians or others.', enriched.filter((p) => p.relationship === rel).length, false,
                    <select className="form-select form-select-sm mt-2" value={rel} onChange={(e) => setRel(e.target.value)} aria-label="Relationship">{RELATIONSHIPS.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}</select>)}
                {opt('student', 'Parents of one student', 'Every parent or guardian linked to a student.', studentOptions.length ? enriched.filter((p) => p.children.some((c) => c.student.id === sid)).length : 0, studentOptions.length === 0,
                    <select className="form-select form-select-sm mt-2" value={sid} onChange={(e) => setSidChoice(e.target.value)} aria-label="Student">{studentOptions.map((s) => <option key={s.id} value={s.id}>{s.fullName} ({s.id})</option>)}</select>)}
            </div>
            <div className="pm-ov-foot">
                <button type="button" className="pm-btn pm-btn-soft" onClick={onClose}>Cancel</button>
                <button type="button" className="pm-btn pm-btn-primary" disabled={records.length === 0} onClick={() => { onExport(records); onClose(); }}>
                    <Download size={16} />Download {records.length} {records.length === 1 ? 'parent' : 'parents'}
                </button>
            </div>
        </>
    );
}

function ExportDialog({ open, onClose, ...rest }) {
    return (
        <Overlay open={open} onClose={onClose} size="md" label="Export parents">
            <ExportBody onClose={onClose} {...rest} />
        </Overlay>
    );
}

/* ================================== page ================================== */

const FILTER_LABELS = {
    relationship: (v) => `Relationship: ${REL_LABEL[v]}`,
    gender: (v) => `Gender: ${v}`,
    status: (v) => `Status: ${STATUS_LABEL[v]}`,
    children: (v) => `Children: ${{ none: 'none', 1: 'one', 2: 'two', '3plus': 'three or more' }[v]}`,
    primary: (v) => (v === 'primary' ? 'Primary guardians' : 'Not primary'),
    dateFrom: (v) => `From ${fmtDate(v)}`,
    dateTo: (v) => `Until ${fmtDate(v)}`,
};

function Crumb({ to, children }) {
    return to ? <Link to={to}>{children}</Link> : <span>{children}</span>;
}

export default function ManageParents({ dashboardPath, userManagementPath }) {
    const [searchParams] = useSearchParams();
    const { toasts, push, dismiss } = useToasts();

    const [snapshot, setSnapshot] = useState(null);
    const [loading, setLoading] = useState(true);
    const [loadError, setLoadError] = useState(null);
    const [resetArmed, setResetArmed] = useState(false);

    const [view, setView] = useState('grid');
    const [filters, setFilters] = useState({ ...EMPTY_FILTERS, query: searchParams.get('q') || '' });
    const [showFilters, setShowFilters] = useState(false);
    const [sort, setSort] = useState({ key: 'name', dir: 'asc' });
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(12);
    const [selectedRaw, setSelected] = useState(() => new Set());

    const [profileId, setProfileId] = useState(null);
    const [previewStudentId, setPreviewStudentId] = useState(null);
    const [formSession, setFormSession] = useState(null);
    const [managerSession, setManagerSession] = useState(null);
    const [confirm, setConfirm] = useState(null);
    const [exportOpen, setExportOpen] = useState(false);
    const [seq, setSeq] = useState(0);

    /* ------------------------------ data layer ----------------------------- */
    const reload = useCallback(() => {
        try { setSnapshot(getSnapshot()); setLoadError(null); } catch (err) { setLoadError(err); }
    }, []);

    useEffect(() => {
        const t = setTimeout(() => { reload(); setLoading(false); }, 380);
        return () => clearTimeout(t);
    }, [reload]);

    const handleError = useCallback((err) => {
        if (err instanceof ParentValidationError) push('warning', 'Check the details', err.message);
        else if (err instanceof ParentStorageError) push('danger', 'Storage error', err.message);
        else push('danger', 'Something went wrong', err && err.message ? err.message : 'Please try again.');
    }, [push]);

    /** Every service call goes through here, so a future async API only needs `await` added. */
    const run = useCallback((action, onSuccess) => {
        try {
            const result = action();
            reload();
            if (onSuccess) onSuccess(result);
            return { ok: true, result };
        } catch (err) {
            handleError(err);
            return { ok: false, error: err };
        }
    }, [reload, handleError]);

    const enriched = useMemo(() => enrichParents(snapshot), [snapshot]);
    const students = useMemo(() => (snapshot ? snapshot.students : []), [snapshot]);
    const stats = useMemo(() => getParentStatistics(snapshot), [snapshot]);
    const studentMap = useMemo(() => new Map(students.map((s) => [s.id, s])), [students]);
    const parentMap = useMemo(() => new Map(enriched.map((p) => [p.id, p])), [enriched]);

    const selected = useMemo(() => new Set([...selectedRaw].filter((id) => parentMap.has(id))), [selectedRaw, parentMap]);

    const guardiansByStudent = useMemo(() => {
        const m = new Map();
        enriched.forEach((p) => p.children.forEach((c) => {
            if (!m.has(c.student.id)) m.set(c.student.id, []);
            m.get(c.student.id).push({ parent: p, link: c.link });
        }));
        m.forEach((list) => list.sort((a, b) => Number(b.link.isPrimary) - Number(a.link.isPrimary)));
        return m;
    }, [enriched]);

    const filtered = useMemo(() => filterParents(enriched, filters), [enriched, filters]);
    const sorted = useMemo(() => sortParents(filtered, sort.key, sort.dir), [filtered, sort]);
    const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));
    const safePage = Math.min(page, totalPages);
    const pageRows = useMemo(() => sorted.slice((safePage - 1) * pageSize, safePage * pageSize), [sorted, safePage, pageSize]);


    /* ------------------------------- filters ------------------------------- */
    const setFilter = (k, v) => { setFilters((f) => ({ ...f, [k]: v })); setPage(1); };
    const activeChips = Object.keys(FILTER_LABELS).filter((k) => filters[k] !== EMPTY_FILTERS[k]);
    const filterCount = activeChips.length;
    const clearAll = () => { setFilters({ ...EMPTY_FILTERS }); setPage(1); };
    const hasAnyFilter = filterCount > 0 || filters.query.trim() !== '';

    /* ------------------------------ selection ------------------------------ */
    const toggleOne = (id) => setSelected((s) => { const n = new Set(s); if (n.has(id)) n.delete(id); else n.add(id); return n; });
    const allOnPage = pageRows.length > 0 && pageRows.every((p) => selected.has(p.id));
    const someOnPage = pageRows.some((p) => selected.has(p.id));
    const toggleAllPage = () => setSelected((s) => {
        const n = new Set(s);
        if (allOnPage) pageRows.forEach((p) => n.delete(p.id)); else pageRows.forEach((p) => n.add(p.id));
        return n;
    });
    const clearSelection = () => setSelected(new Set());

    const onSort = (key) => setSort((s) => (s.key === key ? { key, dir: s.dir === 'asc' ? 'desc' : 'asc' } : { key, dir: 'asc' }));

    /* ------------------------------- actions ------------------------------- */
    const openAdd = () => {
        setSeq(seq + 1);
        setFormSession({ parentId: null, nonce: seq + 1, initial: { form: { ...EMPTY_FORM, registrationDate: todayISO() }, links: [] } });
    };
    const openEdit = (id) => {
        const p = parentMap.get(id);
        if (!p) return;
        setSeq(seq + 1);
        setProfileId(null);
        setFormSession({
            parentId: id,
            nonce: seq + 1,
            initial: { form: formFromParent(p), links: p.children.map((c) => ({ studentId: c.student.id, relationship: c.link.relationship, isPrimary: c.link.isPrimary })) },
        });
    };
    const showConfirm = (cfg) => { setSeq(seq + 1); setConfirm({ ...cfg, id: seq + 1 }); };
    const openManager = (opts) => { setSeq(seq + 1); setProfileId(null); setManagerSession({ ...opts, nonce: seq + 1 }); };

    const saveParent = (payload, links, editingId) => {
        try {
            const rec = editingId ? updateParent(editingId, payload, links) : addParent(payload, links);
            reload();
            push('success', editingId ? 'Parent updated successfully' : 'Parent added successfully', `${rec.fullName} (${rec.id})`);
            setFormSession(null);
            return { ok: true };
        } catch (err) {
            if (err instanceof ParentValidationError) {
                push('warning', 'Please fix the highlighted fields', err.message);
                return { ok: false, errors: err.errors };
            }
            handleError(err);
            return { ok: false, errors: {} };
        }
    };

    const changeStatus = (p, status) => run(() => changeParentStatus(p.id, status),
        () => push('success', 'Parent status changed', `${p.fullName} is now ${STATUS_LABEL[status].toLowerCase()}.`));

    const impactList = (p) => p.children.filter((c) => c.link.isPrimary).map((c) => c.student.fullName);

    const askArchive = (list) => {
        const ids = list.map((p) => p.id);
        const kids = list.reduce((n, p) => n + p.childCount, 0);
        const primaries = list.flatMap(impactList);
        showConfirm({
            title: list.length === 1 ? `Archive ${list[0].fullName}?` : `Archive ${list.length} parents?`,
            tone: 'warning',
            confirmLabel: 'Archive',
            body: (
                <>
                    <p>Archived parents leave the main directory but are kept. You can restore them at any time.</p>
                    <ul>
                        <li><strong>{kids}</strong> student {kids === 1 ? 'link stays' : 'links stay'} in place.</li>
                        <li>Student records are <strong>not changed or deleted</strong>.</li>
                        {primaries.length > 0 && <li>Primary guardian for: {primaries.join(', ')}. Consider choosing another primary guardian.</li>}
                    </ul>
                </>
            ),
            onConfirm: () => run(() => bulkChangeParentStatus(ids, 'archived'), () => {
                push('success', list.length === 1 ? 'Parent archived successfully' : `${list.length} parents archived successfully`, 'Linked students were not changed.');
                setSelected((s) => { const n = new Set(s); ids.forEach((id) => n.delete(id)); return n; });
            }),
        });
    };

    const askDelete = (p) => {
        const lines = p.children.map((c) => {
            if (!c.link.isPrimary) return null;
            const others = (guardiansByStudent.get(c.student.id) || []).filter((g) => g.parent.id !== p.id);
            return others.length ? `${c.student.fullName}: ${others[0].parent.fullName} becomes the primary guardian.` : `${c.student.fullName}: will have no guardian.`;
        }).filter(Boolean);
        showConfirm({
            title: `Delete ${p.fullName}?`,
            tone: 'danger',
            confirmLabel: 'Delete parent',
            requireText: 'DELETE',
            altLabel: p.status === 'archived' ? '' : 'Archive instead',
            onAlt: () => { setConfirm(null); askArchive([p]); },
            body: (
                <>
                    <p>This permanently removes the parent profile <strong>{p.id}</strong>. It cannot be undone.</p>
                    <ul>
                        <li><strong>{p.childCount}</strong> student {p.childCount === 1 ? 'link is' : 'links are'} removed.</li>
                        <li>Student records are <strong>preserved</strong>.</li>
                        {lines.map((l) => <li key={l}>{l}</li>)}
                    </ul>
                    <p>Archiving keeps the history and is usually the safer choice.</p>
                </>
            ),
            onConfirm: () => run(() => deleteParent(p.id), (r) => {
                push('success', 'Parent deleted', `${p.fullName} and ${r.removedLinks} student ${r.removedLinks === 1 ? 'link were' : 'links were'} removed. Students were not changed.`);
                setProfileId((cur) => (cur === p.id ? null : cur));
            }),
        });
    };

    const runConfirm = () => {
        const fn = confirm && confirm.onConfirm;
        setConfirm(null);
        if (fn) fn();
    };

    const bulkStatus = (status) => {
        const ids = [...selected];
        run(() => bulkChangeParentStatus(ids, status), () => push('success', 'Parent status changed', `${ids.length} ${ids.length === 1 ? 'parent is' : 'parents are'} now ${STATUS_LABEL[status].toLowerCase()}.`));
    };

    const doExport = (records) => run(() => exportParentsToCSV(records),
        (r) => push('success', 'Parents exported successfully', `${r.count} ${r.count === 1 ? 'record' : 'records'} saved as ${r.filename}.`));

    const relActions = {
        link: (pid, sid, rel, isPrimary) => run(() => linkStudentToParent(pid, sid, rel, isPrimary),
            () => push('success', 'Student linked successfully', `${studentMap.get(sid)?.fullName} is linked to ${parentMap.get(pid)?.fullName}.`)),
        unlink: (pid, sid) => run(() => unlinkStudentFromParent(pid, sid),
            () => push('success', 'Student unlinked successfully', `${studentMap.get(sid)?.fullName} is no longer linked to ${parentMap.get(pid)?.fullName}.`)),
        setRel: (pid, sid, rel) => run(() => updateLinkRelationship(pid, sid, rel),
            () => push('success', 'Relationship updated', `${parentMap.get(pid)?.fullName} is now ${REL_LABEL[rel].toLowerCase()} of ${studentMap.get(sid)?.fullName}.`)),
        setPrimary: (pid, sid) => run(() => setPrimaryGuardian(pid, sid),
            () => push('success', 'Primary guardian updated', `${parentMap.get(pid)?.fullName} is now the primary guardian of ${studentMap.get(sid)?.fullName}.`)),
    };

    const menuFor = (p) => [
        { key: 'view', label: 'View profile', icon: Eye, onClick: () => setProfileId(p.id) },
        { key: 'edit', label: 'Edit parent', icon: Pencil, onClick: () => openEdit(p.id) },
        { key: 'link', label: 'Link student', icon: Link2, onClick: () => openManager({ tab: 'parent', id: p.id, focusAdd: true }) },
        { key: 'manage', label: 'Manage relationships', icon: Network, onClick: () => openManager({ tab: 'parent', id: p.id }) },
        { divider: true },
        p.status === 'active'
            ? { key: 'deact', label: 'Mark as inactive', icon: Power, onClick: () => changeStatus(p, 'inactive') }
            : { key: 'act', label: p.status === 'archived' ? 'Restore as active' : 'Mark as active', icon: p.status === 'archived' ? ArchiveRestore : UserCheck, onClick: () => changeStatus(p, 'active') },
        p.status !== 'archived' && { key: 'arch', label: 'Archive parent', icon: Archive, onClick: () => askArchive([p]) },
        { divider: true },
        { key: 'del', label: 'Delete parent', icon: Trash2, danger: true, onClick: () => askDelete(p) },
    ].filter(Boolean);

    const resetStorage = () => {
        try {
            const backup = backupAndResetStorageKey(loadError.key);
            push('info', 'Storage reset', `The old data was backed up under "${backup}".`);
            setResetArmed(false);
            reload();
        } catch (err) { handleError(err); }
    };

    /* -------------------------------- render ------------------------------- */
    const profileParent = profileId ? parentMap.get(profileId) || null : null;
    const previewStudent = previewStudentId ? studentMap.get(previewStudentId) || null : null;

    return (
        <div className="pm-root pm-page">
            <header className="pm-header">
                <nav className="pm-crumbs" aria-label="Breadcrumb">
                    <Crumb to={dashboardPath}>Dashboard</Crumb><ChevronRight size={13} />
                    <Crumb to={userManagementPath}>User Management</Crumb><ChevronRight size={13} />
                    <strong aria-current="page">Parents</strong>
                </nav>
                <div className="pm-header-main">
                    <div>
                        <h1 className="pm-title">Parent &amp; Guardian Management</h1>
                        <p className="pm-subtitle">Manage parent profiles, family relationships, and student guardianship information in one place.</p>
                        <div className="pm-header-chips">
                            <span className="pm-chip"><Calendar size={14} />Academic year {getAcademicYearLabel()}</span>
                            <span className="pm-chip"><Home size={14} />{stats.families} registered {stats.families === 1 ? 'family' : 'families'}</span>
                        </div>
                    </div>
                    <div className="pm-header-actions">
                        <button type="button" className="pm-btn pm-btn-primary" onClick={openAdd} disabled={Boolean(loadError)}><UserPlus size={17} />Add new parent</button>
                        <button type="button" className="pm-btn pm-btn-ghost" onClick={() => openManager({ tab: 'parent' })} disabled={!snapshot}><Network size={17} />Family relationships</button>
                        <button type="button" className="pm-btn pm-btn-ghost" onClick={() => setExportOpen(true)} disabled={!snapshot}><Download size={17} />Export parents</button>
                    </div>
                </div>
            </header>

            {loadError && (
                <div className="pm-alert pm-rise" role="alert">
                    <AlertTriangle size={20} />
                    <div>
                        <strong>Parent data could not be loaded</strong>
                        <p>{loadError.message}</p>
                        <p style={{ fontSize: '0.84rem' }}>Nothing was changed or deleted. Fix the stored data, or back it up and start fresh.</p>
                        <div className="actions">
                            <button type="button" className="pm-btn pm-btn-soft pm-btn-sm" onClick={reload}>Try again</button>
                            {loadError.key && loadError.key !== STORAGE_KEYS.students && (resetArmed
                                ? (
                                    <>
                                        <button type="button" className="pm-btn pm-btn-danger pm-btn-sm" onClick={resetStorage}>Yes, back up and reset</button>
                                        <button type="button" className="pm-btn pm-btn-soft pm-btn-sm" onClick={() => setResetArmed(false)}>Cancel</button>
                                    </>
                                )
                                : <button type="button" className="pm-btn pm-btn-soft pm-btn-sm" onClick={() => setResetArmed(true)}>Back up and reset this data</button>)}
                        </div>
                    </div>
                </div>
            )}

            {!loadError && (
                <>
                    {snapshot && snapshot.studentSource === 'sample' && (
                        <div className="pm-alert info mb-3 pm-rise" style={{ '--i': 1 }}>
                            <Info size={18} />
                            <div>No student registry was found under <code>{STORAGE_KEYS.students}</code>, so demo students are shown for linking. Nothing is saved to the student registry.</div>
                        </div>
                    )}

                    {/* ------------------------------ stats ------------------------------ */}
                    {loading || !snapshot ? (
                        <div className="pm-stats" aria-hidden="true">{[0, 1, 2, 3, 4].map((i) => <div key={i} className="pm-skel short" />)}</div>
                    ) : (
                        <section className="pm-stats" aria-label="Statistics">
                            <StatCard index={0} icon={Users} label="Total parents" value={stats.total} tone="blue" support={`${stats.families} ${stats.families === 1 ? 'family' : 'families'}${stats.archived ? `, ${stats.archived} archived` : ''}`} />
                            <StatCard index={1} icon={UserCheck} label="Active parents" value={stats.active} tone="green" progress={stats.activeRate} support={`${stats.activeRate}% active, ${stats.inactive} inactive`} />
                            <StatCard index={2} icon={ShieldCheck} label="Guardians" value={stats.guardians} tone="amber" progress={stats.total ? Math.round((stats.guardians / stats.total) * 100) : 0} support={`${stats.fathers} fathers, ${stats.mothers} mothers`} />
                            <StatCard index={3} icon={GraduationCap} label="Linked students" value={stats.linkedStudents} tone="teal" progress={stats.coverage} support={`of ${stats.totalStudents} students, ${stats.unlinkedStudents} without a guardian`} />
                            <StatCard index={4} icon={Clock} label="Recently registered" value={stats.recent} tone="navy" support={stats.latestName ? `Latest: ${stats.latestName}` : 'None in the last 30 days'} />
                        </section>
                    )}

                    {/* ----------------------------- toolbar ----------------------------- */}
                    <section className="pm-panel pm-toolbar pm-rise" style={{ '--i': 3 }} aria-label="Search and filters">
                        <div className="pm-toolbar-row">
                            <div className="pm-search">
                                <Search size={18} />
                                <input type="search" className="form-control" placeholder="Search by parent, ID, phone, email or student" aria-label="Search parents" value={filters.query} onChange={(e) => setFilter('query', e.target.value)} />
                                {filters.query && <button type="button" className="pm-icon-btn pm-clear" onClick={() => setFilter('query', '')} aria-label="Clear search"><X size={16} /></button>}
                            </div>
                            <button type="button" className={cx('pm-btn', showFilters ? 'pm-btn-teal' : 'pm-btn-soft')} aria-expanded={showFilters} aria-controls="pm-filter-panel" onClick={() => setShowFilters((v) => !v)}>
                                <SlidersHorizontal size={16} />Filters{filterCount > 0 && <span className="pm-badge-count">{filterCount}</span>}
                            </button>
                            <div className="d-flex gap-1 align-items-center">
                                <select className="form-select" style={{ width: 'auto' }} value={sort.key} onChange={(e) => setSort((s) => ({ ...s, key: e.target.value }))} aria-label="Sort parents by">
                                    {SORT_OPTIONS.map((o) => <option key={o.value} value={o.value}>Sort: {o.label}</option>)}
                                </select>
                                <button type="button" className="pm-icon-btn" onClick={() => setSort((s) => ({ ...s, dir: s.dir === 'asc' ? 'desc' : 'asc' }))} aria-label={`Sort direction: ${sort.dir === 'asc' ? 'ascending' : 'descending'}`} title={sort.dir === 'asc' ? 'Ascending' : 'Descending'}>
                                    <ChevronDown size={18} style={{ transform: sort.dir === 'desc' ? 'rotate(180deg)' : 'none', transition: 'transform .25s' }} />
                                </button>
                            </div>
                            <div className="pm-seg" role="group" aria-label="Directory view">
                                <button type="button" className={cx('pm-seg-btn', view === 'grid' && 'active')} aria-pressed={view === 'grid'} onClick={() => setView('grid')}><LayoutGrid size={15} />Cards</button>
                                <button type="button" className={cx('pm-seg-btn', view === 'list' && 'active')} aria-pressed={view === 'list'} onClick={() => setView('list')}><List size={15} />Table</button>
                            </div>
                        </div>

                        <div id="pm-filter-panel" className={cx('pm-collapse', showFilters && 'open')}>
                            <div>
                                <div className="pm-filter-grid">
                                    <div><label htmlFor="f-rel">Relationship</label>
                                        <select id="f-rel" className="form-select" value={filters.relationship} onChange={(e) => setFilter('relationship', e.target.value)}>
                                            <option value="all">All relationships</option>{RELATIONSHIPS.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
                                        </select></div>
                                    <div><label htmlFor="f-gen">Gender</label>
                                        <select id="f-gen" className="form-select" value={filters.gender} onChange={(e) => setFilter('gender', e.target.value)}>
                                            <option value="all">All genders</option>{GENDERS.map((g) => <option key={g} value={g}>{g}</option>)}
                                        </select></div>
                                    <div><label htmlFor="f-st">Registration status</label>
                                        <select id="f-st" className="form-select" value={filters.status} onChange={(e) => setFilter('status', e.target.value)}>
                                            <option value="all">All except archived</option>{STATUSES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
                                        </select></div>
                                    <div><label htmlFor="f-ch">Linked children</label>
                                        <select id="f-ch" className="form-select" value={filters.children} onChange={(e) => setFilter('children', e.target.value)}>
                                            <option value="all">Any number</option><option value="none">None</option><option value="1">One</option><option value="2">Two</option><option value="3plus">Three or more</option>
                                        </select></div>
                                    <div><label htmlFor="f-pg">Primary guardian</label>
                                        <select id="f-pg" className="form-select" value={filters.primary} onChange={(e) => setFilter('primary', e.target.value)}>
                                            <option value="all">Any</option><option value="primary">Primary guardians</option><option value="not-primary">Not primary</option>
                                        </select></div>
                                    <div><label htmlFor="f-from">Registered from</label><input id="f-from" type="date" className="form-control" value={filters.dateFrom} max={filters.dateTo || undefined} onChange={(e) => setFilter('dateFrom', e.target.value)} /></div>
                                    <div><label htmlFor="f-to">Registered until</label><input id="f-to" type="date" className="form-control" value={filters.dateTo} min={filters.dateFrom || undefined} onChange={(e) => setFilter('dateTo', e.target.value)} /></div>
                                </div>
                            </div>
                        </div>

                        {(activeChips.length > 0 || filters.query) && (
                            <div className="pm-chips" aria-label="Active filters">
                                {filters.query && <button type="button" className="pm-filter-chip" onClick={() => setFilter('query', '')}>Search: “{filters.query}” <X size={13} /></button>}
                                {activeChips.map((k) => <button key={k} type="button" className="pm-filter-chip" onClick={() => setFilter(k, EMPTY_FILTERS[k])}>{FILTER_LABELS[k](filters[k])} <X size={13} /></button>)}
                                <button type="button" className="pm-link-btn" onClick={clearAll}>Clear all filters</button>
                            </div>
                        )}
                        <p className="pm-results mt-2 mb-0" aria-live="polite">
                            {loading ? 'Loading parents…' : `${sorted.length} ${sorted.length === 1 ? 'parent' : 'parents'}${hasAnyFilter ? ` match your filters (of ${enriched.filter((p) => p.status !== 'archived').length})` : ''}`}
                        </p>
                    </section>

                    {/* ---------------------------- bulk actions ------------------------- */}
                    {selected.size > 0 && (
                        <div className="pm-bulk" role="region" aria-label="Bulk actions">
                            <strong>{selected.size} selected</strong>
                            <button type="button" className="pm-btn pm-btn-sm" onClick={() => doExport(enriched.filter((p) => selected.has(p.id)))}><Download size={14} />Export</button>
                            <button type="button" className="pm-btn pm-btn-sm" onClick={() => bulkStatus('active')}><UserCheck size={14} />Activate</button>
                            <button type="button" className="pm-btn pm-btn-sm" onClick={() => bulkStatus('inactive')}><Power size={14} />Deactivate</button>
                            <button type="button" className="pm-btn pm-btn-sm" onClick={() => askArchive(enriched.filter((p) => selected.has(p.id)))}><Archive size={14} />Archive</button>
                            <button type="button" className="pm-btn pm-btn-sm" onClick={clearSelection}><X size={14} />Clear selection</button>
                        </div>
                    )}

                    {/* ----------------------------- directory --------------------------- */}
                    <section aria-label="Parent directory">
                        {loading || !snapshot ? (
                            <>
                                <div className="pm-loading-note"><span className="pm-spinner" />Loading parent directory…</div>
                                <div className="pm-grid" aria-hidden="true">{[0, 1, 2, 3, 4, 5].map((i) => <div key={i} className="pm-skel" />)}</div>
                            </>
                        ) : enriched.length === 0 ? (
                            <div className="pm-panel pm-empty">
                                <div className="pm-empty-icon"><Users size={32} /></div>
                                <h3>No parents registered yet</h3>
                                <p>Add the first parent or guardian, then link them to the students they look after.</p>
                                <button type="button" className="pm-btn pm-btn-primary" onClick={openAdd}><UserPlus size={16} />Add new parent</button>
                            </div>
                        ) : sorted.length === 0 ? (
                            <div className="pm-panel pm-empty">
                                <div className="pm-empty-icon"><Search size={30} /></div>
                                <h3>No parents match your search</h3>
                                <p>Try a different name, ID, phone number or student, or remove some filters.</p>
                                <button type="button" className="pm-btn pm-btn-soft" onClick={clearAll}>Clear all filters</button>
                            </div>
                        ) : (
                            <div key={view} className="pm-view">
                                {view === 'grid' ? (
                                    <>
                                        <div className="d-flex align-items-center gap-2 mb-2 ps-1">
                                            <Checkbox checked={allOnPage} indeterminate={someOnPage} onChange={toggleAllPage} label="Select all parents on this page" />
                                            <span className="pm-muted" style={{ fontSize: '0.84rem' }}>Select all on this page</span>
                                        </div>
                                        <div className="pm-grid">
                                            {pageRows.map((p, i) => (
                                                <ParentCard
                                                    key={p.id}
                                                    p={p}
                                                    index={i}
                                                    selected={selected.has(p.id)}
                                                    onToggle={toggleOne}
                                                    onView={setProfileId}
                                                    onLink={(id) => openManager({ tab: 'parent', id, focusAdd: true })}
                                                    items={menuFor(p)}
                                                />
                                            ))}
                                        </div>
                                    </>
                                ) : (
                                    <div className="pm-panel">
                                        <ParentTable rows={pageRows} selected={selected} onToggle={toggleOne} onToggleAll={toggleAllPage} allOnPage={allOnPage} someOnPage={someOnPage} sort={sort} onSort={onSort} onView={setProfileId} menuFor={menuFor} />
                                    </div>
                                )}
                                <Pagination page={safePage} totalPages={totalPages} pageSize={pageSize} total={sorted.length} onPage={setPage} onSize={(n) => { setPageSize(n); setPage(1); }} />
                            </div>
                        )}
                    </section>
                </>
            )}

            {/* ------------------------------ overlays ------------------------------ */}
            <ProfileOffcanvas
                open={Boolean(profileParent)}
                parent={profileParent}
                onClose={() => setProfileId(null)}
                onEdit={openEdit}
                onManage={(id) => openManager({ tab: 'parent', id })}
                onStudent={setPreviewStudentId}
                onToast={push}
            />
            <StudentPreview
                open={Boolean(previewStudent)}
                student={previewStudent}
                guardians={previewStudent ? guardiansByStudent.get(previewStudent.id) || [] : []}
                onClose={() => setPreviewStudentId(null)}
            />
            <ParentFormModal session={formSession} students={students} guardiansByStudent={guardiansByStudent} onClose={() => setFormSession(null)} onSubmit={saveParent} />
            <RelationshipManager session={managerSession} onClose={() => setManagerSession(null)} enriched={enriched} students={students} guardiansByStudent={guardiansByStudent} actions={relActions} />
            <ExportDialog open={exportOpen} onClose={() => setExportOpen(false)} enriched={enriched} filtered={sorted} selectedIds={selected} onExport={doExport} />
            <ConfirmDialog config={confirm} onCancel={() => setConfirm(null)} onConfirm={runConfirm} />
            <ToastStack toasts={toasts} dismiss={dismiss} />
        </div>
    );
}