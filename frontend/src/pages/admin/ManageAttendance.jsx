import { useState, useEffect, useMemo, useCallback } from "react";
import {
    Users, UserCheck, UserX, ShieldQuestion, BadgeCheck, GraduationCap,
    Briefcase, FileClock, Search, ChevronUp, ChevronDown, X, Check, Eye,
    Download, AlertTriangle, CalendarDays, Inbox, RefreshCw, Info,
} from "lucide-react";
import '../../styles/admin/AttendanceManagement.css';

const API_BASE = "";
const ENDPOINTS = {
    read: { teachers: null, students: null, staff: null, corrections: null },
    write: { verify: null, reject: null, review: null },
};

// Adapt to how your app stores the logged-in user and token.
const getCurrentUser = () => {
    try { return JSON.parse(localStorage.getItem("user")) || null; } catch { return null; }
};
const request = async (url, options = {}) => {
    const token = localStorage.getItem("token");
    const res = await fetch(API_BASE + url, {
        headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        ...options,
    });
    if (!res.ok) throw new Error(`Request failed (${res.status})`);
    return res.json();
};
const toList = (r) => (Array.isArray(r) ? r : r?.data ?? []);

/* ------------------------------------------------------------------
   2. CONFIG
------------------------------------------------------------------- */
const KEYS = ["teachers", "students", "staff", "corrections"];
const col = (key, label, badge = false) => ({ key, label, badge });
const TABS = {
    teachers: {
        label: "Teacher Attendance", icon: Users,
        cols: [col("name", "Teacher"), col("teacherId", "ID"), col("department", "Department"), col("date", "Date"),
        col("checkIn", "Check-in"), col("checkOut", "Check-out"), col("status", "Status", true),
        col("verification", "Verification", true), col("verifiedBy", "Verified by")],
        filters: [["status", "Status"], ["verification", "Verification"], ["department", "Department"]],
    },
    students: {
        label: "Student Attendance", icon: GraduationCap,
        cols: [col("name", "Student"), col("studentId", "ID"), col("grade", "Grade"), col("section", "Section"),
        col("subject", "Subject"), col("period", "Period"), col("teacher", "Teacher"), col("date", "Date"),
        col("status", "Status", true), col("remarks", "Remarks")],
        filters: [["grade", "Grade"], ["section", "Section"], ["subject", "Subject"], ["period", "Period"], ["status", "Status"]],
    },
    staff: {
        label: "Staff Attendance", icon: Briefcase,
        cols: [col("name", "Staff"), col("staffId", "ID"), col("position", "Position"), col("department", "Department"),
        col("date", "Date"), col("checkIn", "Check-in"), col("checkOut", "Check-out"), col("status", "Status", true)],
        filters: [["status", "Status"], ["department", "Department"], ["position", "Position"]],
    },
    verification: {
        label: "Attendance Verification", icon: ShieldQuestion,
        cols: [col("name", "Teacher"), col("teacherId", "ID"), col("department", "Department"), col("date", "Date"),
        col("checkIn", "Check-in"), col("verification", "Verification", true)],
        filters: [["department", "Department"]],
    },
    corrections: {
        label: "Correction Requests", icon: FileClock,
        cols: [col("requester", "Requester"), col("type", "Type"), col("date", "Attendance date"),
        col("originalStatus", "Original", true), col("requestedStatus", "Requested", true),
        col("reason", "Reason"), col("requestDate", "Requested on"), col("status", "Request", true)],
        filters: [["type", "Type"], ["status", "Request status"]],
    },
};
const TONE = {
    present: "ok", verified: "ok", approved: "ok",
    late: "warn", "pending verification": "warn", pending: "warn",
    absent: "bad", rejected: "bad", excused: "info", "incomplete check-out": "muted",
};
const PENDING_VERIFICATION = "Pending Verification";
const HERE = ["Present", "Late"];

const today = () => new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 10);
const stamp = () => new Date().toLocaleString();
const labelOf = (k) => k.replace(/([A-Z])/g, " $1").replace(/^./, (s) => s.toUpperCase());

/* ------------------------------------------------------------------
   3. SMALL COMPONENTS
------------------------------------------------------------------- */
const Badge = ({ value }) =>
    value ? <span className={`attendance-badge tone-${TONE[String(value).toLowerCase()] || "muted"}`}>{value}</span>
        : <span className="attendance-muted">—</span>;

function Modal({ title, onClose, children, footer }) {
    useEffect(() => {
        const onKey = (e) => e.key === "Escape" && onClose();
        document.addEventListener("keydown", onKey);
        return () => document.removeEventListener("keydown", onKey);
    }, [onClose]);
    return (
        <div className="attendance-overlay" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
            <div className="attendance-modal" role="dialog" aria-modal="true" aria-label={title}>
                <div className="attendance-modal-head">
                    <h3>{title}</h3>
                    <button className="attendance-icon-btn" onClick={onClose} aria-label="Close"><X size={16} /></button>
                </div>
                <div className="attendance-modal-body">{children}</div>
                {footer && <div className="attendance-modal-foot">{footer}</div>}
            </div>
        </div>
    );
}

function ConfirmDialog({ cfg, onClose }) {
    const [reason, setReason] = useState("");
    const [busy, setBusy] = useState(false);
    const blocked = cfg.needsReason && !reason.trim();
    const go = async () => { setBusy(true); await cfg.run(reason.trim()); setBusy(false); onClose(); };
    return (
        <Modal title={cfg.title} onClose={onClose} footer={
            <>
                <button className="attendance-btn ghost" onClick={onClose}>Cancel</button>
                <button className={`attendance-btn ${cfg.tone}`} disabled={blocked || busy} onClick={go}>{cfg.label}</button>
            </>}>
            <p>{cfg.message}</p>
            {cfg.needsReason && (
                <label className="attendance-field">
                    {cfg.reasonLabel || "Reason (required)"}
                    <textarea rows={3} value={reason} onChange={(e) => setReason(e.target.value)} autoFocus />
                </label>
            )}
        </Modal>
    );
}

function Details({ row, onClose }) {
    const entries = Object.entries(row).filter(([k, v]) => k !== "id" && k !== "history" && v !== null && v !== "");
    return (
        <Modal title="Attendance details" onClose={onClose}>
            <dl className="attendance-detail-grid">
                {entries.map(([k, v]) => (
                    <div key={k}><dt>{labelOf(k)}</dt><dd>{TONE[String(v).toLowerCase()] ? <Badge value={v} /> : String(v)}</dd></div>
                ))}
            </dl>
            <h4 className="attendance-subhead">History</h4>
            {row.history?.length ? (
                <ul className="attendance-history">
                    {row.history.map((h, i) => (
                        <li key={i}><strong>{h.action}</strong> by {h.by} · {h.at}{h.note ? <em> — {h.note}</em> : null}</li>
                    ))}
                </ul>
            ) : <p className="attendance-muted">No recorded changes. Original values are never overwritten.</p>}
        </Modal>
    );
}

/* ------------------------------------------------------------------
   4. PAGE
------------------------------------------------------------------- */
export default function Attendance() {
    const me = useMemo(getCurrentUser, []);
    const myId = me ? String(me.teacherId ?? me.id ?? me.userId ?? "") : "";
    const myName = me?.name || me?.fullName || "Attendance Officer";
    const connected = Object.values(ENDPOINTS.read).some(Boolean);

    const [data, setData] = useState({ teachers: [], students: [], staff: [], corrections: [] });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [tab, setTab] = useState("teachers");
    const [search, setSearch] = useState("");
    const [date, setDate] = useState(today());
    const [filters, setFilters] = useState({});
    const [sort, setSort] = useState({ key: null, dir: "asc" });
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [detail, setDetail] = useState(null);
    const [confirm, setConfirm] = useState(null);
    const [toast, setToast] = useState(null);

    const load = useCallback(async () => {
        setLoading(true); setError("");
        try {
            const entries = await Promise.all(KEYS.map(async (k) =>
                [k, ENDPOINTS.read[k] ? toList(await request(ENDPOINTS.read[k])) : []]));
            setData(Object.fromEntries(entries));
        } catch (e) {
            setError(e.message || "Could not load attendance data.");
        } finally { setLoading(false); }
    }, []);
    useEffect(() => { load(); }, [load]);
    useEffect(() => { setPage(1); }, [tab, search, date, filters, pageSize]);
    useEffect(() => {
        if (!toast) return undefined;
        const t = setTimeout(() => setToast(null), 4500);
        return () => clearTimeout(t);
    }, [toast]);

    const cfg = TABS[tab];
    const base = useMemo(() => (tab === "verification"
        ? data.teachers.filter((r) => r.verification === PENDING_VERIFICATION) : data[tab]), [tab, data]);
    const options = useMemo(() => Object.fromEntries(cfg.filters.map(([k]) =>
        [k, [...new Set(base.map((r) => r[k]).filter(Boolean))].sort()])), [base, cfg]);

    const rows = useMemo(() => {
        const q = search.trim().toLowerCase();
        let out = base.filter((r) =>
            (!date || r.date === date || tab === "corrections" && !r.date) &&
            cfg.filters.every(([k]) => !filters[k] || r[k] === filters[k]) &&
            (!q || cfg.cols.some((c) => String(r[c.key] ?? "").toLowerCase().includes(q))));
        if (sort.key) {
            out = [...out].sort((a, b) =>
                String(a[sort.key] ?? "").localeCompare(String(b[sort.key] ?? ""), undefined, { numeric: true }) *
                (sort.dir === "asc" ? 1 : -1));
        }
        return out;
    }, [base, search, date, filters, sort, cfg, tab]);

    const pages = Math.max(1, Math.ceil(rows.length / pageSize));
    const current = Math.min(page, pages);
    const pageRows = rows.slice((current - 1) * pageSize, current * pageSize);

    /* ---- summary cards (computed only from loaded data) ---- */
    const d = date || today();
    const onDay = (a) => a.filter((r) => r.date === d);
    const tD = onDay(data.teachers), sD = onDay(data.students), fD = onDay(data.staff);
    const pendingCorr = data.corrections.filter((r) => r.status === "Pending").length;
    const pendingVer = tD.filter((r) => r.verification === PENDING_VERIFICATION).length;
    const cards = [
        { label: "Total teachers", value: new Set(data.teachers.map((r) => r.teacherId)).size, desc: "Registered in records", icon: Users, tone: "navy", tab: "teachers" },
        { label: "Teachers present", value: tD.filter((r) => HERE.includes(r.status)).length, desc: `Present or late on ${d}`, icon: UserCheck, tone: "ok", tab: "teachers" },
        { label: "Teachers absent", value: tD.filter((r) => r.status === "Absent").length, desc: `Marked absent on ${d}`, icon: UserX, tone: "bad", tab: "teachers" },
        { label: "Pending verification", value: pendingVer, desc: "Awaiting officer check", icon: ShieldQuestion, tone: "warn", tab: "verification" },
        { label: "Verified attendance", value: tD.filter((r) => r.verification === "Verified").length, desc: "Presence confirmed", icon: BadgeCheck, tone: "ok", tab: "teachers" },
        { label: "Total students", value: new Set(data.students.map((r) => r.studentId)).size, desc: "Across all grades", icon: GraduationCap, tone: "navy", tab: "students" },
        { label: "Students present", value: sD.filter((r) => HERE.includes(r.status)).length, desc: "Period records, present or late", icon: UserCheck, tone: "ok", tab: "students" },
        { label: "Students absent", value: sD.filter((r) => r.status === "Absent").length, desc: "Period records marked absent", icon: UserX, tone: "bad", tab: "students" },
        { label: "Staff present", value: fD.filter((r) => HERE.includes(r.status)).length, desc: `Present or late on ${d}`, icon: Briefcase, tone: "info", tab: "staff" },
        { label: "Pending corrections", value: pendingCorr, desc: "Waiting for review", icon: FileClock, tone: "warn", tab: "corrections" },
    ];

    /* ---- actions ---- */
    const notify = (tone, msg) => setToast({ tone, msg });
    const isSelf = (r) => !!myId && String(r.teacherId) === myId;
    const patchRow = (key, id, fn) => setData((s) => ({ ...s, [key]: s[key].map((r) => (r.id === id ? fn(r) : r)) }));

    const act = async (kind, key, row, body, patch, action) => {
        try {
            const url = ENDPOINTS.write[kind];
            if (url) await request(`${url}/${row.id}`, { method: "POST", body: JSON.stringify(body) });
            const entry = { action, by: myName, at: stamp(), note: body.reason || body.note || "" };
            patchRow(key, row.id, (r) => ({ ...r, ...patch, history: [...(r.history || []), entry] }));
            if (kind === "review" && body.approve) {
                const target = { Teacher: "teachers", Student: "students", Staff: "staff" }[row.type];
                if (target && row.recordId != null) {
                    patchRow(target, row.recordId, (r) => ({
                        ...r, status: row.requestedStatus,
                        history: [...(r.history || []), { action: `Status ${r.status} → ${row.requestedStatus} (correction #${row.id})`, by: myName, at: stamp(), note: body.note }],
                    }));
                }
            }
            if (url) notify("ok", "Saved.");
            else notify("warn", "Changed on this screen only. The backend is not connected, so nothing was saved.");
        } catch (e) {
            notify("bad", e.message || "The action failed. Nothing was changed.");
        }
    };

    const askVerify = (r) => {
        if (isSelf(r)) return notify("bad", "You cannot verify your own attendance.");
        if (r.verification !== PENDING_VERIFICATION) return notify("bad", "This record is not pending verification.");
        setConfirm({
            title: "Verify physical presence?", tone: "ok", label: "Verify presence",
            message: `Confirm that you saw ${r.name} at school on ${r.date}. This is recorded in the audit history.`,
            run: () => act("verify", "teachers", r, {}, { verification: "Verified", verifiedBy: myName }, "Verified"),
        });
    };
    const askReject = (r) => {
        if (isSelf(r)) return notify("bad", "You cannot reject your own attendance.");
        setConfirm({
            title: "Reject this attendance?", tone: "bad", label: "Reject attendance", needsReason: true,
            message: `${r.name}'s check-in on ${r.date} will be marked Rejected. The original record stays in history.`,
            run: (reason) => act("reject", "teachers", r, { reason }, { verification: "Rejected", verifiedBy: myName, rejectionReason: reason }, "Rejected"),
        });
    };
    const askReview = (r, approve) => setConfirm({
        title: approve ? "Approve correction?" : "Reject correction?", tone: approve ? "ok" : "bad",
        label: approve ? "Approve" : "Reject", needsReason: true, reasonLabel: "Review note (required)",
        message: approve
            ? `${r.requester}'s status changes from ${r.originalStatus} to ${r.requestedStatus}. The original value is kept in history.`
            : `${r.requester}'s request will be rejected. The attendance record stays unchanged.`,
        run: (note) => act("review", "corrections", r, { approve, note },
            { status: approve ? "Approved" : "Rejected", reviewNote: note, reviewedBy: myName }, approve ? "Approved" : "Rejected"),
    });

    const switchTab = (k) => { setTab(k); setFilters({}); setSort({ key: null, dir: "asc" }); };
    const toggleSort = (key) => setSort((s) => (s.key === key ? { key, dir: s.dir === "asc" ? "desc" : "asc" } : { key, dir: "asc" }));

    const exportCsv = () => {
        const q = (v) => `"${String(v ?? "").replace(/"/g, '""')}"`;
        const csv = [cfg.cols.map((c) => q(c.label)).join(","), ...rows.map((r) => cfg.cols.map((c) => q(r[c.key])).join(","))].join("\n");
        const a = document.createElement("a");
        a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
        a.download = `attendance-${tab}-${date || "all-dates"}.csv`;
        a.click();
        URL.revokeObjectURL(a.href);
    };

    const tabCount = { verification: data.teachers.filter((r) => r.verification === PENDING_VERIFICATION).length, corrections: pendingCorr };
    const longDate = new Date().toLocaleDateString(undefined, { weekday: "long", year: "numeric", month: "long", day: "numeric" });

    return (
        <div className="attendance-page">
            <header className="attendance-header">
                <div>
                    <h1>Attendance Management</h1>
                    <p>Review teacher, student and staff attendance, verify presence, and handle corrections.</p>
                    <span className="attendance-today"><CalendarDays size={14} /> Today is {longDate}</span>
                </div>
                <div className="attendance-header-tools">
                    <label className="attendance-search">
                        <Search size={16} />
                        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search name, ID or status" aria-label="Search attendance" />
                    </label>
                    <label className="attendance-date">
                        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} aria-label="Filter by date" />
                    </label>
                    {date && <button className="attendance-btn ghost" onClick={() => setDate("")}>All dates</button>}
                    <button className="attendance-icon-btn" onClick={load} title="Reload data" aria-label="Reload data"><RefreshCw size={16} /></button>
                </div>
            </header>

            {!connected && (
                <div className="attendance-banner info" role="status">
                    <Info size={18} />
                    <span>No backend is connected, so no records are shown. Set your routes in <code>ENDPOINTS</code> at the top of <code>Attendance.jsx</code>. Actions work on this screen only until write routes are set.</span>
                </div>
            )}
            {error && (
                <div className="attendance-banner bad" role="alert">
                    <AlertTriangle size={18} /><span>{error}</span>
                    <button className="attendance-btn ghost sm" onClick={load}>Try again</button>
                </div>
            )}

            <section className="attendance-cards" aria-label="Attendance summary">
                {cards.map((c) => (
                    <button key={c.label} className={`attendance-card tone-${c.tone}`} onClick={() => switchTab(c.tab)}>
                        <span className="attendance-card-icon"><c.icon size={18} /></span>
                        <span className="attendance-card-value">{loading ? "…" : connected ? c.value : "—"}</span>
                        <span className="attendance-card-label">{c.label}</span>
                        <span className="attendance-card-desc">{c.desc}</span>
                    </button>
                ))}
            </section>

            <nav className="attendance-tabs" role="tablist" aria-label="Attendance categories">
                {Object.entries(TABS).map(([k, t]) => (
                    <button key={k} role="tab" aria-selected={tab === k} className={`attendance-tab ${tab === k ? "active" : ""}`} onClick={() => switchTab(k)}>
                        <t.icon size={16} /> {t.label}
                        {tabCount[k] > 0 && <span className="attendance-count">{tabCount[k]}</span>}
                    </button>
                ))}
            </nav>

            <section className="attendance-panel">
                <div className="attendance-filters">
                    {cfg.filters.map(([k, label]) => (
                        <label key={k} className="attendance-select">
                            <span>{label}</span>
                            <select value={filters[k] || ""} onChange={(e) => setFilters((f) => ({ ...f, [k]: e.target.value }))}>
                                <option value="">All</option>
                                {options[k].map((o) => <option key={o} value={o}>{o}</option>)}
                            </select>
                        </label>
                    ))}
                    {(Object.values(filters).some(Boolean) || search) && (
                        <button className="attendance-btn ghost sm" onClick={() => { setFilters({}); setSearch(""); }}>Clear filters</button>
                    )}
                    <button className="attendance-btn primary sm attendance-export" onClick={exportCsv} disabled={!rows.length}>
                        <Download size={14} /> Export CSV
                    </button>
                </div>

                <div className="attendance-table-wrap">
                    <table className="attendance-table">
                        <thead>
                            <tr>
                                {cfg.cols.map((c) => (
                                    <th key={c.key} aria-sort={sort.key === c.key ? (sort.dir === "asc" ? "ascending" : "descending") : "none"}>
                                        <button className="attendance-th-btn" onClick={() => toggleSort(c.key)}>
                                            {c.label}
                                            {sort.key === c.key && (sort.dir === "asc" ? <ChevronUp size={14} /> : <ChevronDown size={14} />)}
                                        </button>
                                    </th>
                                ))}
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading && Array.from({ length: 5 }).map((_, i) => (
                                <tr key={i} className="attendance-skeleton">
                                    {Array.from({ length: cfg.cols.length + 1 }).map((__, j) => <td key={j}><span /></td>)}
                                </tr>
                            ))}
                            {!loading && pageRows.map((r, i) => (
                                <tr key={r.id ?? i}>
                                    {cfg.cols.map((c) => (
                                        <td key={c.key} className={c.key === "reason" ? "attendance-reason" : ""} data-label={c.label}>
                                            {c.badge ? <Badge value={r[c.key]} /> : (r[c.key] ?? "—")}
                                        </td>
                                    ))}
                                    <td className="attendance-actions" data-label="Actions">
                                        <button className="attendance-icon-btn" title="View details" aria-label="View details" onClick={() => setDetail(r)}><Eye size={16} /></button>
                                        {tab === "verification" && (
                                            <>
                                                <button className="attendance-btn ok sm" disabled={isSelf(r)} title={isSelf(r) ? "You cannot verify your own attendance" : "Verify presence"} onClick={() => askVerify(r)}><Check size={14} /> Verify</button>
                                                <button className="attendance-btn bad sm" disabled={isSelf(r)} title={isSelf(r) ? "You cannot reject your own attendance" : "Reject attendance"} onClick={() => askReject(r)}><X size={14} /> Reject</button>
                                            </>
                                        )}
                                        {tab === "corrections" && r.status === "Pending" && (
                                            <>
                                                <button className="attendance-btn ok sm" onClick={() => askReview(r, true)}><Check size={14} /> Approve</button>
                                                <button className="attendance-btn bad sm" onClick={() => askReview(r, false)}><X size={14} /> Reject</button>
                                            </>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {!loading && rows.length === 0 && (
                        <div className="attendance-empty">
                            <Inbox size={28} />
                            <strong>{base.length === 0 ? "No records yet" : "No records match these filters"}</strong>
                            <span>
                                {base.length === 0
                                    ? (connected ? "This category has no attendance records." : "Connect a backend route for this category to see records here.")
                                    : "Try another date, clear the filters, or change your search."}
                            </span>
                        </div>
                    )}
                </div>

                <footer className="attendance-pagination">
                    <span>{rows.length} record{rows.length === 1 ? "" : "s"}</span>
                    <label className="attendance-select inline">
                        <span>Rows</span>
                        <select value={pageSize} onChange={(e) => setPageSize(Number(e.target.value))}>
                            {[10, 25, 50].map((n) => <option key={n} value={n}>{n}</option>)}
                        </select>
                    </label>
                    <div className="attendance-pager">
                        <button className="attendance-btn ghost sm" disabled={current <= 1} onClick={() => setPage(current - 1)}>Previous</button>
                        <span>Page {current} of {pages}</span>
                        <button className="attendance-btn ghost sm" disabled={current >= pages} onClick={() => setPage(current + 1)}>Next</button>
                    </div>
                </footer>
            </section>

            {detail && <Details row={detail} onClose={() => setDetail(null)} />}
            {confirm && <ConfirmDialog cfg={confirm} onClose={() => setConfirm(null)} />}
            {toast && <div className={`attendance-toast tone-${toast.tone}`} role="status">{toast.msg}</div>}
        </div>
    );
}