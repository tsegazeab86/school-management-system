import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import * as Lucide from 'lucide-react';
import '../../styles/admin/ManageSubjects.css';
import * as svc from '../../services/subjectService';

const { BookOpen, Plus, Download, Upload, Search, LayoutGrid, List, X, Eye, Pencil, Copy, Archive, Trash2, Power, Users, GraduationCap, Layers, CheckCircle2, Library, Award } = Lucide;
const GRADES = Array.from({ length: 12 }, (_, i) => i + 1);
const ICONS = ['BookOpen', 'Calculator', 'Atom', 'FlaskConical', 'Dna', 'Monitor', 'Landmark', 'Globe', 'Scale', 'Sprout', 'Palette', 'Dumbbell', 'Languages'];
const Icon = ({ name, ...p }) => { const C = Lucide[name] || BookOpen; return <C {...p} />; };
const EMPTY = { name: '', code: '', category: 'Core', description: '', icon: 'BookOpen', color: '#2563EB', status: 'Active', curriculumType: 'National', creditHours: 2, weeklyPeriods: 3, annualPeriods: 102, assessmentType: 'Continuous + Final', passingMark: 50, maxMark: 100, grades: [], objectives: [], topics: [] };

function download(name, text) {
  const url = URL.createObjectURL(new Blob([text], { type: 'text/csv;charset=utf-8' }));
  const a = Object.assign(document.createElement('a'), { href: url, download: name });
  a.click(); URL.revokeObjectURL(url);
}

function Modal({ title, onClose, children, wide, side }) {
  const ref = useRef(null);
  useEffect(() => {
    const k = (e) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', k);
    ref.current?.focus();
    return () => document.removeEventListener('keydown', k);
  }, [onClose]);
  return (
    <div className="sm-backdrop" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className={`sm-panel ${wide ? 'wide' : ''} ${side ? 'side' : ''}`} role="dialog" aria-modal="true" aria-label={title} tabIndex={-1} ref={ref}>
        <div className="sm-panel-head"><h2>{title}</h2><button className="sm-icon-btn" aria-label="Close" title="Close" onClick={onClose}><X size={18} /></button></div>
        <div className="sm-panel-body">{children}</div>
      </div>
    </div>
  );
}

function SubjectForm({ initial, onSave, onCancel }) {
  const [f, setF] = useState(initial);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const dirty = JSON.stringify(f) !== JSON.stringify(initial);
  const set = (k, v) => setF((p) => ({ ...p, [k]: v }));
  const field = (k, label, type = 'text', extra = {}) => (
    <div className="col-md-6">
      <label className="form-label" htmlFor={`f-${k}`}>{label}</label>
      <input id={`f-${k}`} type={type} className={`form-control ${errors[k] ? 'is-invalid' : ''}`} value={f[k]} onChange={(e) => set(k, type === 'number' ? Number(e.target.value) : e.target.value)} {...extra} />
      {errors[k] && <div className="invalid-feedback">{errors[k]}</div>}
    </div>
  );
  const submit = async (e) => {
    e.preventDefault();
    const errs = svc.validateSubject(f, initial.id);
    setErrors(errs);
    if (Object.keys(errs).length) return;
    setSaving(true);
    await new Promise((r) => setTimeout(r, 300));
    try { onSave(f); } catch (er) { setErrors(er.errors || {}); setSaving(false); }
  };
  const close = () => (!dirty || window.confirm('Discard unsaved changes?')) && onCancel();
  return (
    <Modal title={initial.id ? 'Edit Subject' : 'Add New Subject'} onClose={close} wide>
      <form onSubmit={submit} noValidate>
        <h3 className="sm-sec">Basic information</h3>
        <div className="row g-3">
          {field('name', 'Subject name *')}
          {field('code', 'Subject code *', 'text', { maxLength: 8 })}
          <div className="col-md-4"><label className="form-label" htmlFor="f-cat">Category *</label>
            <select id="f-cat" className="form-select" value={f.category} onChange={(e) => set('category', e.target.value)}><option>Core</option><option>Elective</option></select></div>
          <div className="col-md-4"><label className="form-label" htmlFor="f-st">Status</label>
            <select id="f-st" className="form-select" value={f.status} onChange={(e) => set('status', e.target.value)}><option>Active</option><option>Inactive</option><option>Archived</option></select></div>
          <div className="col-md-4"><label className="form-label" htmlFor="f-col">Color</label>
            <input id="f-col" type="color" className="form-control form-control-color w-100" value={f.color} onChange={(e) => set('color', e.target.value)} /></div>
          <div className="col-12"><label className="form-label">Icon</label>
            <div className="d-flex flex-wrap gap-2">{ICONS.map((n) => (
              <button type="button" key={n} aria-label={n} aria-pressed={f.icon === n} className={`sm-icon-pick ${f.icon === n ? 'on' : ''}`} onClick={() => set('icon', n)}><Icon name={n} size={18} /></button>))}</div></div>
          <div className="col-12"><label className="form-label" htmlFor="f-desc">Description</label>
            <textarea id="f-desc" rows={2} className="form-control" value={f.description} onChange={(e) => set('description', e.target.value)} /></div>
        </div>
        <h3 className="sm-sec">Academic configuration</h3>
        <div className="row g-3">
          <div className="col-md-6"><label className="form-label" htmlFor="f-cur">Curriculum type</label>
            <select id="f-cur" className="form-select" value={f.curriculumType} onChange={(e) => set('curriculumType', e.target.value)}><option>National</option><option>Private</option><option>International</option></select></div>
          {field('assessmentType', 'Assessment type')}
          {field('creditHours', 'Credit hours', 'number', { min: 0 })}
          {field('weeklyPeriods', 'Weekly periods', 'number', { min: 0 })}
          {field('annualPeriods', 'Annual periods', 'number', { min: 0 })}
          {field('passingMark', 'Passing mark', 'number', { min: 0 })}
          {field('maxMark', 'Maximum mark', 'number', { min: 1 })}
        </div>
        <h3 className="sm-sec">Grade assignment *</h3>
        <div className="d-flex flex-wrap gap-2" role="group" aria-label="Grades">
          {GRADES.map((g) => (
            <button type="button" key={g} aria-pressed={f.grades.includes(g)} className={`sm-chip ${f.grades.includes(g) ? 'on' : ''}`}
              onClick={() => set('grades', f.grades.includes(g) ? f.grades.filter((x) => x !== g) : [...f.grades, g].sort((a, b) => a - b))}>Grade {g}</button>))}
        </div>
        {errors.grades && <div className="text-danger small mt-1">{errors.grades}</div>}
        <p className="text-muted small mt-2">Sections are assigned from the subject details after saving, so only valid grade-section pairs can be chosen.</p>
        <div className="d-flex justify-content-end gap-2 mt-4">
          <button type="button" className="btn btn-light" onClick={close}>Cancel</button>
          <button className="btn btn-primary sm-btn" disabled={saving}>{saving ? 'Saving…' : 'Save subject'}</button>
        </div>
      </form>
    </Modal>
  );
}

function Details({ id, onClose, notify, refresh }) {
  const [tab, setTab] = useState('Overview');
  const [v, setV] = useState(0);
  const bump = () => { setV((x) => x + 1); refresh(); };
  const s = svc.getSubjectById(id);
  const asg = useMemo(() => svc.getSubjectAssignments(id), [id, v]); // eslint-disable-line react-hooks/exhaustive-deps
  const teachers = svc.getExistingTeachers();
  const [sec, setSec] = useState({ grade: '', section: '' });
  const [tf, setTf] = useState({ grade: '', section: '', teacherId: '', periods: 2, year: '2026/27' });
  const [newGrade, setNewGrade] = useState('');
  const run = (fn, ok) => { try { fn(); notify(ok); bump(); } catch (e) { notify(e.message, 'danger'); } };
  if (!s) return null;
  const TABS = ['Overview', 'Assignments', 'Teachers', 'Curriculum', 'Assessment', 'History'];
  return (
    <Modal title={`${s.name} (${s.code})`} onClose={onClose} side>
      <div className="sm-tabs" role="tablist">{TABS.map((t) => <button key={t} role="tab" aria-selected={tab === t} className={tab === t ? 'on' : ''} onClick={() => setTab(t)}>{t}</button>)}</div>
      {tab === 'Overview' && (<div className="sm-kv">
        {[['Category', s.category], ['Status', s.status], ['Credit hours', s.creditHours], ['Weekly periods', s.weeklyPeriods], ['Total grades', s.grades.length], ['Total sections', asg.sections.length], ['Assigned teachers', new Set(asg.teachers.map((t) => t.teacherId)).size]].map(([k, val]) => <div key={k}><span>{k}</span><b>{val}</b></div>)}
        <p className="mt-3 mb-0">{s.description || 'No description.'}</p></div>)}
      {tab === 'Assignments' && (<>
        <div className="d-flex gap-2 mb-3">
          <select className="form-select" aria-label="Add grade" value={newGrade} onChange={(e) => setNewGrade(e.target.value)}><option value="">Add grade…</option>{GRADES.filter((g) => !s.grades.includes(g)).map((g) => <option key={g} value={g}>Grade {g}</option>)}</select>
          <button className="btn btn-primary" disabled={!newGrade} onClick={() => { run(() => svc.assignSubjectToGrade({ subjectId: id, grade: Number(newGrade) }), 'Grade assigned'); setNewGrade(''); }}>Add</button>
        </div>
        <div className="d-flex gap-2 mb-3">
          <select className="form-select" aria-label="Grade" value={sec.grade} onChange={(e) => setSec({ grade: e.target.value, section: '' })}><option value="">Grade…</option>{s.grades.map((g) => <option key={g} value={g}>Grade {g}</option>)}</select>
          <select className="form-select" aria-label="Section" value={sec.section} disabled={!sec.grade} onChange={(e) => setSec({ ...sec, section: e.target.value })}><option value="">Section…</option>{sec.grade && svc.getSectionsForGrade(sec.grade).map((x) => <option key={x}>{x}</option>)}</select>
          <button className="btn btn-primary" disabled={!sec.section} onClick={() => run(() => svc.assignSubjectToSection({ subjectId: id, grade: Number(sec.grade), section: sec.section }), 'Section assigned')}>Assign</button>
        </div>
        {s.grades.map((g) => (<div key={g} className="sm-row">
          <b>Grade {g}</b>
          <span className="flex-fill">{asg.sections.filter((r) => r.grade === g).map((r) => (
            <span key={r.id} className="sm-tag">Section {r.section}<button aria-label={`Remove section ${r.section}`} onClick={() => run(() => svc.removeSectionAssignment(r.id), 'Section removed')}><X size={12} /></button></span>)) || null}
            {!asg.sections.some((r) => r.grade === g) && <em className="text-muted small">No sections</em>}</span>
          <button className="sm-icon-btn" title="Remove grade" aria-label={`Remove grade ${g}`} onClick={() => window.confirm(`Remove Grade ${g}? Its section and teacher assignments are removed too.`) && run(() => svc.removeGradeAssignment({ subjectId: id, grade: g }), 'Grade removed')}><Trash2 size={15} /></button></div>))}
      </>)}
      {tab === 'Teachers' && (<>
        {!teachers.length && <div className="alert alert-warning small">No existing teacher records were found. Check <code>EXISTING_TEACHERS_KEY</code> in subjectService.js.</div>}
        <div className="row g-2 mb-3">
          <div className="col-6"><select className="form-select" aria-label="Grade" value={tf.grade} onChange={(e) => setTf({ ...tf, grade: e.target.value, section: '' })}><option value="">Grade…</option>{[...new Set(asg.sections.map((r) => r.grade))].map((g) => <option key={g} value={g}>Grade {g}</option>)}</select></div>
          <div className="col-6"><select className="form-select" aria-label="Section" value={tf.section} onChange={(e) => setTf({ ...tf, section: e.target.value })}><option value="">Section…</option>{asg.sections.filter((r) => String(r.grade) === tf.grade).map((r) => <option key={r.id}>{r.section}</option>)}</select></div>
          <div className="col-12"><select className="form-select" aria-label="Teacher" value={tf.teacherId} onChange={(e) => setTf({ ...tf, teacherId: e.target.value })}><option value="">Teacher…</option>{teachers.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}</select></div>
          <div className="col-6"><input type="number" min="1" className="form-control" aria-label="Weekly periods" value={tf.periods} onChange={(e) => setTf({ ...tf, periods: e.target.value })} /></div>
          <div className="col-6"><input className="form-control" aria-label="Academic year" value={tf.year} onChange={(e) => setTf({ ...tf, year: e.target.value })} /></div>
          <div className="col-12"><button className="btn btn-primary w-100" disabled={!tf.section || !tf.teacherId} onClick={() => run(() => svc.assignTeacherToSubject({ subjectId: id, ...tf, grade: Number(tf.grade) }), 'Teacher assigned')}>Assign teacher</button></div>
        </div>
        {asg.teachers.map((t) => (<div key={t.id} className="sm-row"><span className="flex-fill"><b>{t.teacher?.name || 'Missing teacher record'}</b><br /><small className="text-muted">ID {t.teacherId} · Grade {t.grade}-{t.section} · {t.periods} periods · {t.year}</small></span>
          <button className="sm-icon-btn" aria-label="Remove assignment" title="Remove" onClick={() => run(() => svc.removeTeacherAssignment(t.id), 'Assignment removed')}><Trash2 size={15} /></button></div>))}
        {!asg.teachers.length && <p className="text-muted">No teachers assigned yet.</p>}
      </>)}
      {tab === 'Curriculum' && (<div>
        <p><b>Curriculum type:</b> {s.curriculumType}</p><p>{s.description}</p>
        <p className="text-muted small">Learning objectives and topics are not populated for sample data and are not official curriculum content.</p>
        <label className="form-label" htmlFor="obj">Learning objectives (one per line)</label>
        <textarea id="obj" rows={3} className="form-control mb-2" defaultValue={(s.objectives || []).join('\n')} onBlur={(e) => svc.updateSubject(id, { objectives: e.target.value.split('\n').filter(Boolean) })} />
        <label className="form-label" htmlFor="top">Topics / units (one per line)</label>
        <textarea id="top" rows={3} className="form-control" defaultValue={(s.topics || []).join('\n')} onBlur={(e) => svc.updateSubject(id, { topics: e.target.value.split('\n').filter(Boolean) })} />
      </div>)}
      {tab === 'Assessment' && (<div className="sm-kv">{[['Assessment type', s.assessmentType], ['Passing mark', s.passingMark], ['Maximum mark', s.maxMark], ['Annual periods', s.annualPeriods]].map(([k, val]) => <div key={k}><span>{k}</span><b>{val}</b></div>)}</div>)}
      {tab === 'History' && ([...(s.history || [])].reverse().map((h, i) => <div key={i} className="sm-row"><span className="flex-fill">{h.action}</span><small className="text-muted">{new Date(h.at).toLocaleString()}</small></div>))}
    </Modal>
  );
}

function ImportModal({ onClose, onDone, notify }) {
  const [rows, setRows] = useState(null);
  const ok = rows?.filter((r) => !r.errors.length).length || 0;
  return (
    <Modal title="Import subjects (CSV)" onClose={onClose} wide>
      <p className="small text-muted">Columns: code, name, category (Core/Elective), grades (e.g. 9;10), weeklyPeriods, creditHours, status, description.</p>
      <input type="file" accept=".csv,text/csv" className="form-control mb-3" aria-label="CSV file" onChange={async (e) => { const f = e.target.files[0]; if (f) setRows(svc.previewImport(await f.text())); }} />
      {rows && (<>
        <div className="table-responsive"><table className="table table-sm"><thead><tr><th>Line</th><th>Code</th><th>Name</th><th>Result</th></tr></thead><tbody>
          {rows.map((r) => <tr key={r.line}><td>{r.line}</td><td>{r.rec.code}</td><td>{r.rec.name}</td><td className={r.errors.length ? 'text-danger' : 'text-success'}>{r.errors.join('; ') || 'Ready'}</td></tr>)}</tbody></table></div>
        <div className="d-flex justify-content-end gap-2"><button className="btn btn-light" onClick={onClose}>Cancel import</button>
          <button className="btn btn-primary" disabled={!ok} onClick={() => { const n = svc.commitImport(rows); notify(`${n} subject(s) imported`); onDone(); }}>Import {ok} valid row(s)</button></div></>)}
    </Modal>
  );
}

export default function ManageSubjects() {
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('table');
  const [q, setQ] = useState('');
  const [fl, setFl] = useState({ category: '', grade: '', section: '', status: '', teacher: '', curriculum: '' });
  const [sort, setSort] = useState('az');
  const [page, setPage] = useState(1);
  const [size, setSize] = useState(10);
  const [sel, setSel] = useState([]);
  const [form, setForm] = useState(null);
  const [detail, setDetail] = useState(null);
  const [importing, setImporting] = useState(false);
  const [toast, setToast] = useState(null);
  const [tick, setTick] = useState(0);

  const refresh = useCallback(() => { setSubjects(svc.getSubjects()); setTick((t) => t + 1); }, []);
  useEffect(() => { const t = setTimeout(() => { refresh(); setLoading(false); }, 350); return () => clearTimeout(t); }, [refresh]);
  const notify = (msg, type = 'success') => { setToast({ msg, type }); setTimeout(() => setToast(null), 3000); };

  const stats = useMemo(() => svc.getSubjectStats(), [subjects, tick]); // eslint-disable-line react-hooks/exhaustive-deps
  const teachersBySubject = useMemo(() => {
    const m = {}; subjects.forEach((s) => { m[s.id] = svc.getTeacherAssignments(s.id); }); return m;
  }, [subjects, tick]); // eslint-disable-line react-hooks/exhaustive-deps
  const sectionsBySubject = useMemo(() => {
    const m = {}; subjects.forEach((s) => { m[s.id] = svc.getSectionAssignments(s.id); }); return m;
  }, [subjects, tick]); // eslint-disable-line react-hooks/exhaustive-deps
  const teacherOptions = svc.getExistingTeachers();

  const filtered = useMemo(() => {
    const n = q.trim().toLowerCase();
    const list = subjects.filter((s) =>
      (!n || [s.name, s.code, s.description].some((x) => (x || '').toLowerCase().includes(n))) &&
      (!fl.category || s.category === fl.category) &&
      (!fl.grade || s.grades.includes(Number(fl.grade))) &&
      (!fl.section || sectionsBySubject[s.id]?.some((r) => r.section === fl.section)) &&
      (!fl.status || s.status === fl.status) &&
      (!fl.teacher || teachersBySubject[s.id]?.some((t) => t.teacherId === fl.teacher)) &&
      (!fl.curriculum || s.curriculumType === fl.curriculum));
    const by = { az: (a, b) => a.name.localeCompare(b.name), za: (a, b) => b.name.localeCompare(a.name), new: (a, b) => b.createdAt.localeCompare(a.createdAt), old: (a, b) => a.createdAt.localeCompare(b.createdAt), grades: (a, b) => b.grades.length - a.grades.length, teachers: (a, b) => (teachersBySubject[b.id]?.length || 0) - (teachersBySubject[a.id]?.length || 0) };
    return [...list].sort(by[sort]);
  }, [subjects, q, fl, sort, teachersBySubject, sectionsBySubject]);

  const pages = Math.max(1, Math.ceil(filtered.length / size));
  const cur = Math.min(page, pages);
  const rows = filtered.slice((cur - 1) * size, cur * size);
  const activeFilters = Object.entries(fl).filter(([, v]) => v);
  const clear = () => { setQ(''); setFl({ category: '', grade: '', section: '', status: '', teacher: '', curriculum: '' }); setPage(1); };
  const setF = (k, v) => { setFl({ ...fl, [k]: v }); setPage(1); };

  const confirmDelete = (ids) => {
    const blocked = ids.filter((id) => { const d = svc.getSubjectDependencies(id); return d.sections || d.teachers; });
    if (blocked.length) {
      if (window.confirm(`${blocked.length} subject(s) have section/teacher assignments and cannot be deleted. Archive them instead?`)) { blocked.forEach(svc.archiveSubject); notify('Archived instead of deleted'); refresh(); }
      ids = ids.filter((i) => !blocked.includes(i));
      if (!ids.length) return;
    }
    if (window.confirm(`Permanently delete ${ids.length} subject(s)? This cannot be undone.`)) { ids.forEach(svc.deleteSubject); setSel([]); notify('Deleted'); refresh(); }
  };
  const bulkStatus = (st) => { sel.forEach((id) => svc.updateSubjectStatus(id, st)); notify(`${sel.length} subject(s) set to ${st}`); setSel([]); refresh(); };
  const exportList = (list, name) => { download(name, svc.exportSubjects(list)); notify('CSV exported'); };
  const toggleAll = () => setSel(rows.every((r) => sel.includes(r.id)) ? sel.filter((i) => !rows.some((r) => r.id === i)) : [...new Set([...sel, ...rows.map((r) => r.id)])]);
  const save = (data) => { if (data.id) { svc.updateSubject(data.id, data); notify('Subject updated'); } else { svc.createSubject(data); notify('Subject created'); } setForm(null); refresh(); };

  const Actions = ({ s }) => (
    <div className="sm-actions">
      <button className="sm-icon-btn" title="View details" aria-label="View details" onClick={() => setDetail(s.id)}><Eye size={16} /></button>
      <button className="sm-icon-btn" title="Edit" aria-label="Edit" onClick={() => setForm(s)}><Pencil size={16} /></button>
      <button className="sm-icon-btn" title="Assign grades, sections & teachers" aria-label="Assign" onClick={() => setDetail(s.id)}><Users size={16} /></button>
      <button className="sm-icon-btn" title="Duplicate" aria-label="Duplicate" onClick={() => { svc.duplicateSubject(s.id); notify('Subject duplicated'); refresh(); }}><Copy size={16} /></button>
      <button className="sm-icon-btn" title={s.status === 'Active' ? 'Deactivate' : 'Activate'} aria-label="Toggle status" onClick={() => { svc.updateSubjectStatus(s.id, s.status === 'Active' ? 'Inactive' : 'Active'); refresh(); }}><Power size={16} /></button>
      <button className="sm-icon-btn" title="Archive" aria-label="Archive" onClick={() => { svc.archiveSubject(s.id); notify('Subject archived'); refresh(); }}><Archive size={16} /></button>
      <button className="sm-icon-btn danger" title="Delete" aria-label="Delete" onClick={() => confirmDelete([s.id])}><Trash2 size={16} /></button>
    </div>
  );
  const Badge = ({ s }) => <span className={`sm-badge ${s.status.toLowerCase()}`}>{s.status}</span>;

  const kpis = [['Total Subjects', stats.total, 'All records', Library], ['Active Subjects', stats.active, 'Currently taught', CheckCircle2], ['Core Subjects', stats.core, 'Mandatory', Award], ['Elective Subjects', stats.elective, 'Optional', Layers], ['Assigned Teachers', stats.teachers, 'Distinct teachers', Users], ['Grades Covered', stats.grades, 'Out of 12', GraduationCap]];

  return (
    <div className="sm-page">
      <header className="sm-hero">
        <span className="sm-orb o1" /><span className="sm-orb o2" />
        <BookOpen className="sm-deco d1" size={90} aria-hidden /><GraduationCap className="sm-deco d2" size={70} aria-hidden />
        <nav className="sm-crumb" aria-label="Breadcrumb">Dashboard / Academic Management / Subjects</nav>
        <div className="d-flex flex-wrap justify-content-between align-items-end gap-3">
          <div><h1>Subjects Management</h1><p>Organize subjects, curriculum, and academic assignments.</p><span className="sm-total">{stats.total} total subjects</span></div>
          <div className="d-flex flex-wrap gap-2">
            <button className="btn sm-btn-light" onClick={() => exportList(subjects, 'subjects.csv')}><Download size={16} /> Export Subjects</button>
            <button className="btn sm-btn-light" onClick={() => setImporting(true)}><Upload size={16} /> Import CSV</button>
            <button className="btn sm-btn-white" onClick={() => setForm(EMPTY)}><Plus size={16} /> Add New Subject</button>
          </div>
        </div>
      </header>

      <section className="sm-kpis">{kpis.map(([l, v, d, I]) => (
        <div className="sm-kpi" key={l}>{loading ? <div className="sm-skel" /> : (<><div className="sm-kpi-ic"><I size={20} /></div><div><small>{l}</small><strong>{v}</strong><span>{d}</span></div></>)}</div>))}</section>

      <section className="sm-card">
        <div className="sm-toolbar">
          <div className="sm-search"><Search size={16} aria-hidden /><input aria-label="Search subjects" placeholder="Search name, code or description" value={q} onChange={(e) => { setQ(e.target.value); setPage(1); }} /></div>
          <select aria-label="Sort" className="form-select" value={sort} onChange={(e) => setSort(e.target.value)}>
            <option value="az">Name A–Z</option><option value="za">Name Z–A</option><option value="new">Newest</option><option value="old">Oldest</option><option value="grades">Most grades</option><option value="teachers">Most teachers</option></select>
          <div className="btn-group" role="group" aria-label="View">
            <button className={`btn btn-outline-primary ${view === 'table' ? 'active' : ''}`} aria-label="Table view" title="Table view" onClick={() => setView('table')}><List size={16} /></button>
            <button className={`btn btn-outline-primary ${view === 'grid' ? 'active' : ''}`} aria-label="Grid view" title="Grid view" onClick={() => setView('grid')}><LayoutGrid size={16} /></button></div>
        </div>
        <div className="sm-filters">
          <select aria-label="Category" className="form-select" value={fl.category} onChange={(e) => setF('category', e.target.value)}><option value="">Category</option><option>Core</option><option>Elective</option></select>
          <select aria-label="Grade" className="form-select" value={fl.grade} onChange={(e) => setF('grade', e.target.value)}><option value="">Grade</option>{GRADES.map((g) => <option key={g} value={g}>Grade {g}</option>)}</select>
          <select aria-label="Section" className="form-select" value={fl.section} onChange={(e) => setF('section', e.target.value)}><option value="">Section</option>{['A', 'B', 'C', 'D'].map((x) => <option key={x}>{x}</option>)}</select>
          <select aria-label="Status" className="form-select" value={fl.status} onChange={(e) => setF('status', e.target.value)}><option value="">Status</option><option>Active</option><option>Inactive</option><option>Archived</option></select>
          <select aria-label="Teacher" className="form-select" value={fl.teacher} onChange={(e) => setF('teacher', e.target.value)}><option value="">Teacher</option>{teacherOptions.map((t) => <option key={t.id} value={String(t.id)}>{t.name}</option>)}</select>
          <select aria-label="Curriculum" className="form-select" value={fl.curriculum} onChange={(e) => setF('curriculum', e.target.value)}><option value="">Curriculum</option><option>National</option><option>Private</option><option>International</option></select>
        </div>
        <div className="sm-meta"><span>{filtered.length} result{filtered.length !== 1 && 's'}{activeFilters.length > 0 && ` · ${activeFilters.length} filter(s) active`}</span>
          {(activeFilters.length > 0 || q) && <button className="btn btn-link btn-sm p-0" onClick={clear}>Clear filters</button>}
          <button className="btn btn-link btn-sm p-0 ms-auto" onClick={() => exportList(filtered, 'subjects-filtered.csv')}>Export filtered</button></div>

        {sel.length > 0 && (<div className="sm-bulk" role="toolbar" aria-label="Bulk actions"><b>{sel.length} selected</b>
          <button className="btn btn-sm btn-light" onClick={() => bulkStatus('Active')}>Activate</button><button className="btn btn-sm btn-light" onClick={() => bulkStatus('Inactive')}>Deactivate</button>
          <button className="btn btn-sm btn-light" onClick={() => bulkStatus('Archived')}>Archive</button>
          <button className="btn btn-sm btn-light" onClick={() => exportList(subjects.filter((s) => sel.includes(s.id)), 'subjects-selected.csv')}>Export</button>
          <button className="btn btn-sm btn-danger" onClick={() => confirmDelete(sel)}>Delete</button></div>)}

        {loading ? <div className="p-4">{[1, 2, 3, 4].map((i) => <div key={i} className="sm-skel row-skel" />)}</div>
          : rows.length === 0 ? (<div className="sm-empty"><Library size={40} /><h3>No subjects found</h3><p>Try changing your search or filters, or add a new subject.</p><button className="btn btn-primary" onClick={clear}>Clear filters</button></div>)
            : view === 'table' ? (
              <div className="table-responsive sm-fade" key="t"><table className="table align-middle sm-table"><thead><tr>
                <th><input type="checkbox" className="form-check-input" aria-label="Select page" checked={rows.every((r) => sel.includes(r.id))} onChange={toggleAll} /></th>
                <th>Code</th><th>Subject</th><th>Category</th><th>Grades</th><th>Periods/wk</th><th>Credits</th><th>Teachers</th><th>Status</th><th>Actions</th></tr></thead><tbody>
                  {rows.map((s) => (<tr key={s.id}><td><input type="checkbox" className="form-check-input" aria-label={`Select ${s.name}`} checked={sel.includes(s.id)} onChange={() => setSel(sel.includes(s.id) ? sel.filter((i) => i !== s.id) : [...sel, s.id])} /></td>
                    <td><b>{s.code}</b></td><td><button className="sm-link" onClick={() => setDetail(s.id)}><span className="sm-dot" style={{ background: s.color }}><Icon name={s.icon} size={14} /></span>{s.name}</button></td>
                    <td><span className={`sm-cat ${s.category.toLowerCase()}`}>{s.category}</span></td><td>{s.grades.length > 3 ? `${s.grades[0]}–${s.grades[s.grades.length - 1]} (${s.grades.length})` : s.grades.join(', ')}</td>
                    <td>{s.weeklyPeriods}</td><td>{s.creditHours}</td><td>{teachersBySubject[s.id]?.length || 0}</td><td><Badge s={s} /></td><td><Actions s={s} /></td></tr>))}</tbody></table></div>)
              : (<div className="sm-grid sm-fade" key="g">{rows.map((s) => (
                <article key={s.id} className="sm-subcard" style={{ '--c': s.color }}>
                  <div className="d-flex justify-content-between"><span className="sm-dot lg" style={{ background: s.color }}><Icon name={s.icon} size={20} /></span><Badge s={s} /></div>
                  <h3>{s.name}</h3><small>{s.code} · <span className={`sm-cat ${s.category.toLowerCase()}`}>{s.category}</span></small>
                  <dl><div><dt>Grades</dt><dd>{s.grades.length}</dd></div><div><dt>Sections</dt><dd>{sectionsBySubject[s.id]?.length || 0}</dd></div><div><dt>Teachers</dt><dd>{teachersBySubject[s.id]?.length || 0}</dd></div><div><dt>Periods</dt><dd>{s.weeklyPeriods}</dd></div></dl>
                  <Actions s={s} /></article>))}</div>)}

        <div className="sm-pager">
          <label className="small text-muted">Rows <select aria-label="Page size" className="form-select form-select-sm d-inline-block w-auto ms-1" value={size} onChange={(e) => { setSize(Number(e.target.value)); setPage(1); }}>{[5, 10, 20, 50].map((n) => <option key={n}>{n}</option>)}</select></label>
          <div className="btn-group"><button className="btn btn-sm btn-outline-secondary" disabled={cur === 1} onClick={() => setPage(cur - 1)}>Prev</button><span className="btn btn-sm disabled">{cur} / {pages}</span><button className="btn btn-sm btn-outline-secondary" disabled={cur === pages} onClick={() => setPage(cur + 1)}>Next</button></div></div>
      </section>

      {form && <SubjectForm initial={form} onSave={save} onCancel={() => setForm(null)} />}
      {detail && <Details id={detail} onClose={() => setDetail(null)} notify={notify} refresh={refresh} />}
      {importing && <ImportModal onClose={() => setImporting(false)} onDone={() => { setImporting(false); refresh(); }} notify={notify} />}
      {toast && <div className={`sm-toast ${toast.type}`} role="status">{toast.msg}</div>}
    </div>
  );
}