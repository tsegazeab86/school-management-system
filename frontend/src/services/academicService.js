/**
 * academicService.js
 * ---------------------------------------------------------------------------
 * All business rules for Grades & Sections live here. The React page only
 * calls these functions. Every function is synchronous and uses localStorage;
 * to move to Express/MySQL, make each one `async` and call your API instead,
 * keeping the same names, inputs, and thrown AcademicError behaviour.
 *
 * localStorage keys (document these in your project):
 *   sms_academic_years              academic years
 *   sms_academic_grades             grades (one record per grade per year)
 *   sms_academic_sections           sections (belong to one grade + one year)
 *   sms_academic_classrooms         classrooms / rooms
 *   sms_academic_enrollments        student-to-section enrollment records
 *   sms_academic_demo_students      DEMO student registry (replace, see below)
 *   sms_academic_demo_teachers      DEMO teacher registry (replace, see below)
 *   sms_academic_meta               { demo: boolean }
 *
 * Students and teachers are NOT copied into grades/sections. Sections hold
 * only teacher IDs; enrollments hold only student IDs. Replace getStudents()
 * and getTeachers() below with your real Students/Teachers services.
 */

import {
  DEFAULT_ACADEMIC_YEARS,
  buildDemoAcademicData,
} from '../data/academicSampleData';

/* ------------------------------------------------------------------------- */
/* Constants                                                                  */
/* ------------------------------------------------------------------------- */

export const STORAGE_KEYS = Object.freeze({
  years: 'sms_academic_years',
  grades: 'sms_academic_grades',
  sections: 'sms_academic_sections',
  classrooms: 'sms_academic_classrooms',
  enrollments: 'sms_academic_enrollments',
  students: 'sms_academic_demo_students',
  teachers: 'sms_academic_demo_teachers',
  meta: 'sms_academic_meta',
});

const K = STORAGE_KEYS;
const DATA_KEYS = ['years', 'grades', 'sections', 'classrooms', 'enrollments', 'students', 'teachers'];

export const GRADE_NAMES = Array.from({ length: 12 }, (_, i) => `Grade ${i + 1}`);
export const GRADE_STATUSES = ['active', 'archived'];
export const SECTION_STATUSES = ['active', 'inactive', 'archived'];
export const ROOM_TYPES = [
  'Standard Classroom',
  'Computer Laboratory',
  'Science Laboratory',
  'Library Room',
  'Multipurpose Room',
];
export const ROOM_AVAILABILITY = ['available', 'maintenance'];

/** School policy switches. Change here if your school allows these. */
export const POLICY = Object.freeze({
  allowTeacherMultipleSections: false, // one class teacher per active section per year
  allowSharedClassrooms: false, // one active section per room per year
});

export class AcademicError extends Error {
  constructor(message, errors = {}) {
    super(message);
    this.name = 'AcademicError';
    this.errors = errors; // { fieldName: 'message' }
  }
}

function throwIfErrors(errors) {
  const keys = Object.keys(errors);
  if (keys.length) throw new AcademicError(errors[keys[0]], errors);
}

/* ------------------------------------------------------------------------- */
/* Small helpers                                                              */
/* ------------------------------------------------------------------------- */

const nowIso = () => new Date().toISOString();
const todayStr = () => nowIso().slice(0, 10);
const str = (v) => (v === undefined || v === null ? '' : String(v).trim());
const idOrNull = (v) => str(v) || null;
const pad2 = (n) => String(n).padStart(2, '0');

export const percent = (part, whole) =>
  whole > 0 ? Math.round((part / whole) * 1000) / 10 : 0;

function nextId(prefix, list, width = 3) {
  const re = new RegExp(`^${prefix}-(\\d+)$`);
  let max = 0;
  list.forEach((r) => {
    const m = String(r.id).match(re);
    if (m) max = Math.max(max, parseInt(m[1], 10));
  });
  return `${prefix}-${String(max + 1).padStart(width, '0')}`;
}

/* ------------------------------------------------------------------------- */
/* Storage                                                                    */
/* ------------------------------------------------------------------------- */

function storageAvailable() {
  try {
    return typeof window !== 'undefined' && !!window.localStorage;
  } catch {
    return false;
  }
}

function readRaw(key) {
  try {
    const raw = window.localStorage.getItem(key);
    if (raw === null) return { status: 'missing', data: [] };
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return { status: 'invalid', data: [] };
    return {
      status: 'ok',
      data: parsed.filter((r) => r && typeof r === 'object' && r.id),
    };
  } catch {
    return { status: 'invalid', data: [] };
  }
}

function readList(key) {
  return readRaw(key).data;
}

function writeList(key, list) {
  try {
    window.localStorage.setItem(key, JSON.stringify(list));
  } catch {
    throw new AcademicError(
      'Could not save to browser storage. Storage may be full or disabled.'
    );
  }
}

function backupInvalid(key) {
  try {
    const raw = window.localStorage.getItem(key);
    if (raw !== null) window.localStorage.setItem(`${key}__corrupt_backup`, raw);
  } catch {
    /* best effort only */
  }
}

let ready = false;

/**
 * Seeds demo data ONLY on a fresh install (no usable data under any module
 * key). If some keys exist, missing/corrupt ones become empty lists (years get
 * the defaults) and existing data is never touched. Corrupt values are copied
 * to "<key>__corrupt_backup" before being replaced.
 */
export function initializeAcademicData() {
  if (!storageAvailable()) {
    throw new AcademicError('Browser storage is unavailable, so Grades & Sections cannot load.');
  }
  const status = {};
  DATA_KEYS.forEach((name) => {
    status[name] = readRaw(K[name]).status;
  });
  const fresh = DATA_KEYS.every((name) => status[name] !== 'ok');

  if (fresh) {
    const demo = buildDemoAcademicData();
    DATA_KEYS.forEach((name) => {
      if (status[name] === 'invalid') backupInvalid(K[name]);
      writeList(K[name], demo[name]);
    });
    window.localStorage.setItem(K.meta, JSON.stringify({ demo: true }));
  } else {
    DATA_KEYS.forEach((name) => {
      if (status[name] === 'ok') return;
      if (status[name] === 'invalid') backupInvalid(K[name]);
      writeList(K[name], name === 'years' ? DEFAULT_ACADEMIC_YEARS : []);
    });
  }
  ready = true;
}

function ensureReady() {
  if (!ready) initializeAcademicData();
}

export function isDemoData() {
  ensureReady();
  try {
    const meta = JSON.parse(window.localStorage.getItem(K.meta) || '{}');
    return !!meta.demo;
  } catch {
    return false;
  }
}

/* ------------------------------------------------------------------------- */
/* Registries: students and teachers (replace with your real services)       */
/* ------------------------------------------------------------------------- */

/** Replace with your real students service. Needs: id, name, gender, status, gradeLevel (optional). */
export function getStudents() {
  ensureReady();
  return readList(K.students);
}

/** Replace with your real teachers service. Needs: id, name, status, phone/email (optional). */
export function getTeachers() {
  ensureReady();
  return readList(K.teachers);
}

/* ------------------------------------------------------------------------- */
/* Academic years                                                             */
/* ------------------------------------------------------------------------- */

export function getAcademicYears() {
  ensureReady();
  return readList(K.years);
}

export function addAcademicYear(name) {
  ensureReady();
  const years = readList(K.years);
  const value = str(name);
  const m = value.match(/^(\d{4})\/(\d{4})$/);
  if (!m) throw new AcademicError('Use the format 2027/2028.', { name: 'Use the format 2027/2028.' });
  if (Number(m[2]) !== Number(m[1]) + 1) {
    throw new AcademicError('The second year must follow the first (for example 2027/2028).', {
      name: 'The second year must follow the first (for example 2027/2028).',
    });
  }
  if (years.some((y) => y.name === value)) {
    throw new AcademicError(`Academic year ${value} already exists.`, {
      name: `Academic year ${value} already exists.`,
    });
  }
  const year = { id: `AY-${m[1]}-${m[2]}`, name: value, status: 'inactive' };
  writeList(K.years, [...years, year].sort((a, b) => a.name.localeCompare(b.name)));
  return year;
}

export function setActiveAcademicYear(id) {
  ensureReady();
  const years = readList(K.years);
  const target = years.find((y) => y.id === id);
  if (!target) throw new AcademicError('Academic year not found.');
  if (target.status === 'archived') {
    throw new AcademicError('Restore this archived year before making it active.');
  }
  // Only the "active" marker moves. No grades, sections or enrollments change.
  writeList(
    K.years,
    years.map((y) => {
      if (y.id === id) return { ...y, status: 'active' };
      return y.status === 'active' ? { ...y, status: 'inactive' } : y;
    })
  );
  return { ...target, status: 'active' };
}

export function archiveAcademicYear(id) {
  ensureReady();
  const years = readList(K.years);
  const target = years.find((y) => y.id === id);
  if (!target) throw new AcademicError('Academic year not found.');
  if (target.status === 'active') {
    throw new AcademicError('The active academic year cannot be archived. Activate another year first.');
  }
  writeList(K.years, years.map((y) => (y.id === id ? { ...y, status: 'archived' } : y)));
}

export function restoreAcademicYear(id) {
  ensureReady();
  const years = readList(K.years);
  if (!years.some((y) => y.id === id)) throw new AcademicError('Academic year not found.');
  writeList(K.years, years.map((y) => (y.id === id && y.status === 'archived' ? { ...y, status: 'inactive' } : y)));
}

/**
 * Preview of copying structure (grades + non-archived sections) between years.
 * Copies NO students/enrollments, teachers or classrooms (those must be
 * assigned again for the new year, which avoids silent conflicts).
 */
export function previewCopyStructure(fromYear, toYear) {
  ensureReady();
  const years = readList(K.years);
  if (!fromYear || !toYear) throw new AcademicError('Choose both a source and a target year.');
  if (fromYear === toYear) throw new AcademicError('Source and target years must be different.');
  const target = years.find((y) => y.name === toYear);
  if (!years.some((y) => y.name === fromYear) || !target) throw new AcademicError('Academic year not found.');
  if (target.status === 'archived') throw new AcademicError('The target year is archived. Restore it first.');

  const grades = readList(K.grades);
  const sections = readList(K.sections);
  const srcGrades = grades.filter((g) => g.academicYear === fromYear && g.status !== 'archived');
  const tgtGrades = grades.filter((g) => g.academicYear === toYear);

  const gradesToCreate = [];
  const gradesExisting = [];
  const sectionsToCreate = [];
  const sectionsSkipped = [];

  srcGrades.forEach((g) => {
    const match = tgtGrades.find((t) => t.name === g.name);
    if (match) gradesExisting.push(g.name);
    else gradesToCreate.push(g.name);

    sections
      .filter((s) => s.gradeId === g.id && s.status !== 'archived')
      .forEach((s) => {
        const exists =
          match && sections.some((t) => t.gradeId === match.id && t.academicYear === toYear && t.name === s.name);
        const item = { grade: g.name, section: s.name, capacity: s.capacity };
        if (exists) sectionsSkipped.push(item);
        else sectionsToCreate.push(item);
      });
  });

  return { fromYear, toYear, gradesToCreate, gradesExisting, sectionsToCreate, sectionsSkipped };
}

export function copyAcademicStructure(fromYear, toYear) {
  const preview = previewCopyStructure(fromYear, toYear);
  const grades = readList(K.grades);
  const sections = readList(K.sections);
  const srcGrades = grades.filter((g) => g.academicYear === fromYear && g.status !== 'archived');
  const stamp = nowIso();
  let createdGrades = 0;
  let createdSections = 0;

  srcGrades.forEach((g) => {
    let target = grades.find((t) => t.academicYear === toYear && t.name === g.name);
    if (!target) {
      target = {
        id: nextId('GRD', grades),
        name: g.name,
        number: g.number,
        code: g.code,
        description: g.description,
        academicYear: toYear,
        status: 'active',
        notes: '',
        createdAt: stamp,
        updatedAt: stamp,
      };
      grades.push(target);
      createdGrades += 1;
    }
    sections
      .filter((s) => s.gradeId === g.id && s.status !== 'archived')
      .forEach((s) => {
        const dup = sections.some((t) => t.gradeId === target.id && t.academicYear === toYear && t.name === s.name);
        if (dup) return;
        sections.push({
          id: nextId('SEC', sections),
          gradeId: target.id,
          name: s.name,
          code: `G${pad2(target.number)}-${s.name}`,
          academicYear: toYear,
          status: 'active',
          classroomId: null,
          classTeacherId: null,
          assistantTeacherId: null,
          capacity: s.capacity,
          enrollmentOpen: true,
          notes: '',
          createdAt: stamp,
          updatedAt: stamp,
        });
        createdSections += 1;
      });
  });

  writeList(K.grades, grades);
  writeList(K.sections, sections);
  return { createdGrades, createdSections, preview };
}

/* ------------------------------------------------------------------------- */
/* Grades                                                                     */
/* ------------------------------------------------------------------------- */

export function getGrades(academicYear) {
  ensureReady();
  const list = readList(K.grades);
  return academicYear ? list.filter((g) => g.academicYear === academicYear) : list;
}

export function getGradeById(id) {
  return getGrades().find((g) => g.id === id) || null;
}

function normalizeGrade(data) {
  return {
    name: str(data.name),
    code: str(data.code).toUpperCase(),
    description: str(data.description),
    academicYear: str(data.academicYear),
    status: str(data.status) || 'active',
    notes: str(data.notes),
  };
}

function validateGrade(clean, grades, years, selfId, isNew) {
  const errors = {};
  if (!clean.name) errors.name = 'Grade name is required.';
  else if (!GRADE_NAMES.includes(clean.name)) errors.name = 'Choose a grade from Grade 1 to Grade 12.';

  if (!clean.academicYear) errors.academicYear = 'Academic year is required.';
  else {
    const year = years.find((y) => y.name === clean.academicYear);
    if (!year) errors.academicYear = 'Academic year does not exist.';
    else if (isNew && year.status === 'archived') errors.academicYear = 'Archived academic years cannot receive new grades.';
  }

  if (!GRADE_STATUSES.includes(clean.status)) errors.status = 'Choose a valid status.';

  if (!errors.name && !errors.academicYear) {
    const dup = grades.find((g) => g.id !== selfId && g.academicYear === clean.academicYear && g.name === clean.name);
    if (dup) errors.name = `${clean.name} already exists in ${clean.academicYear}.`;
  }
  if (clean.code && !errors.academicYear) {
    const dup = grades.find((g) => g.id !== selfId && g.academicYear === clean.academicYear && String(g.code).toUpperCase() === clean.code);
    if (dup) errors.code = `Grade code ${clean.code} is already used in ${clean.academicYear}.`;
  }
  throwIfErrors(errors);
}

export function addGrade(data) {
  ensureReady();
  const grades = readList(K.grades);
  const years = readList(K.years);
  const clean = normalizeGrade(data);
  const number = parseInt(clean.name.replace('Grade ', ''), 10) || 0;
  if (!clean.code && number) clean.code = `G${pad2(number)}`;
  validateGrade(clean, grades, years, null, true);
  const stamp = nowIso();
  const grade = { id: nextId('GRD', grades), ...clean, number, createdAt: stamp, updatedAt: stamp };
  writeList(K.grades, [...grades, grade]);
  return grade;
}

export function updateGrade(id, updatedData) {
  ensureReady();
  const grades = readList(K.grades);
  const existing = grades.find((g) => g.id === id);
  if (!existing) throw new AcademicError('Grade not found.');
  const years = readList(K.years);
  const clean = normalizeGrade({ ...existing, ...updatedData });
  validateGrade(clean, grades, years, id, false);

  const sections = readList(K.sections);
  if (clean.academicYear !== existing.academicYear && sections.some((s) => s.gradeId === id)) {
    throw new AcademicError('This grade has sections, so its academic year cannot be changed.', {
      academicYear: 'This grade has sections, so its academic year cannot be changed.',
    });
  }
  const number = parseInt(clean.name.replace('Grade ', ''), 10) || existing.number;
  const updated = { ...existing, ...clean, number, updatedAt: nowIso() };
  writeList(K.grades, grades.map((g) => (g.id === id ? updated : g)));
  return updated;
}

/** Archiving keeps every record (including enrollments) for history. */
export function archiveGrade(id) {
  ensureReady();
  const grades = readList(K.grades);
  if (!grades.some((g) => g.id === id)) throw new AcademicError('Grade not found.');
  const stamp = nowIso();
  writeList(K.grades, grades.map((g) => (g.id === id ? { ...g, status: 'archived', updatedAt: stamp } : g)));
  writeList(
    K.sections,
    readList(K.sections).map((s) =>
      s.gradeId === id && s.status !== 'archived' ? { ...s, status: 'archived', enrollmentOpen: false, updatedAt: stamp } : s
    )
  );
}

export function canDeleteGrade(id) {
  ensureReady();
  const grade = readList(K.grades).find((g) => g.id === id);
  if (!grade) return { ok: false, reason: 'Grade not found.' };
  const sections = readList(K.sections).filter((s) => s.gradeId === id);
  const ids = new Set(sections.map((s) => s.id));
  const enrollmentCount = readList(K.enrollments).filter((e) => ids.has(e.sectionId)).length;
  const activeSections = sections.filter((s) => s.status !== 'archived').length;
  if (activeSections > 0) {
    return {
      ok: false,
      reason: `${grade.name} still has ${activeSections} active ${activeSections === 1 ? 'section' : 'sections'}.`,
      activeSections,
      enrollmentCount,
    };
  }
  if (enrollmentCount > 0) {
    return {
      ok: false,
      reason: `${grade.name} has enrollment history (${enrollmentCount} records) that must be preserved.`,
      activeSections,
      enrollmentCount,
    };
  }
  return { ok: true, reason: '', activeSections, enrollmentCount };
}

export function deleteGrade(id) {
  ensureReady();
  const check = canDeleteGrade(id);
  if (!check.ok) throw new AcademicError(`${check.reason} Archive it instead to keep history.`);
  // Only empty, archived sections can remain at this point; remove them with the grade.
  writeList(K.sections, readList(K.sections).filter((s) => s.gradeId !== id));
  writeList(K.grades, readList(K.grades).filter((g) => g.id !== id));
}

/* ------------------------------------------------------------------------- */
/* Classrooms                                                                 */
/* ------------------------------------------------------------------------- */

export function getClassrooms() {
  ensureReady();
  return readList(K.classrooms);
}

function normalizeClassroom(data) {
  return {
    name: str(data.name),
    building: str(data.building),
    floor: data.floor === '' || data.floor === undefined || data.floor === null ? '' : Number(data.floor),
    type: str(data.type) || 'Standard Classroom',
    capacity: data.capacity === '' || data.capacity === undefined ? '' : Number(data.capacity),
    availability: str(data.availability) || 'available',
  };
}

function validateClassroom(clean, rooms, selfId) {
  const errors = {};
  if (!clean.name) errors.name = 'Room name or number is required.';
  else if (rooms.some((r) => r.id !== selfId && r.name.toLowerCase() === clean.name.toLowerCase() && r.building === clean.building)) {
    errors.name = 'A room with this name already exists in that building.';
  }
  if (!clean.building) errors.building = 'Building is required.';
  if (!Number.isInteger(clean.floor) || clean.floor < 0 || clean.floor > 30) errors.floor = 'Floor must be a whole number from 0 (ground) upward.';
  if (!ROOM_TYPES.includes(clean.type)) errors.type = 'Choose a valid room type.';
  if (!Number.isInteger(clean.capacity) || clean.capacity < 1 || clean.capacity > 500) errors.capacity = 'Capacity must be a whole number from 1 to 500.';
  if (!ROOM_AVAILABILITY.includes(clean.availability)) errors.availability = 'Choose a valid availability.';
  throwIfErrors(errors);
}

export function addClassroom(data) {
  ensureReady();
  const rooms = readList(K.classrooms);
  const clean = normalizeClassroom(data);
  validateClassroom(clean, rooms, null);
  const room = { id: nextId('ROOM', rooms), ...clean };
  writeList(K.classrooms, [...rooms, room]);
  return room;
}

export function updateClassroom(id, data) {
  ensureReady();
  const rooms = readList(K.classrooms);
  const existing = rooms.find((r) => r.id === id);
  if (!existing) throw new AcademicError('Classroom not found.');
  const clean = normalizeClassroom({ ...existing, ...data });
  validateClassroom(clean, rooms, id);

  const assigned = readList(K.sections).filter((s) => s.classroomId === id && s.status === 'active');
  const tooBig = assigned.find((s) => s.capacity > clean.capacity);
  if (tooBig) {
    throw new AcademicError(`Section ${tooBig.code || tooBig.name} needs ${tooBig.capacity} seats, so capacity cannot drop below that.`, {
      capacity: `Section ${tooBig.code || tooBig.name} needs ${tooBig.capacity} seats, so capacity cannot drop below that.`,
    });
  }
  if (clean.availability === 'maintenance' && assigned.length) {
    throw new AcademicError('Move the active section out of this room before marking it under maintenance.', {
      availability: 'Move the active section out of this room before marking it under maintenance.',
    });
  }
  const updated = { ...existing, ...clean };
  writeList(K.classrooms, rooms.map((r) => (r.id === id ? updated : r)));
  return updated;
}

export function assignClassroom(sectionId, classroomId) {
  return updateSection(sectionId, { classroomId: classroomId || null });
}

export function assignClassTeacher(sectionId, teacherId) {
  return updateSection(sectionId, { classTeacherId: teacherId || null });
}

/* ------------------------------------------------------------------------- */
/* Enrollment helpers                                                         */
/* ------------------------------------------------------------------------- */

export function getEnrollments(academicYear) {
  ensureReady();
  const list = readList(K.enrollments);
  return academicYear ? list.filter((e) => e.academicYear === academicYear) : list;
}

function countActiveBySection(list) {
  const counts = {};
  list.forEach((e) => {
    if (e.status === 'active') counts[e.sectionId] = (counts[e.sectionId] || 0) + 1;
  });
  return counts;
}

const activeEnrolled = (enrollments, sectionId) =>
  enrollments.filter((e) => e.sectionId === sectionId && e.status === 'active').length;

/* ------------------------------------------------------------------------- */
/* Sections                                                                   */
/* ------------------------------------------------------------------------- */

export function getSections(academicYear) {
  ensureReady();
  const list = readList(K.sections);
  return academicYear ? list.filter((s) => s.academicYear === academicYear) : list;
}

export function getSectionsByGrade(gradeId) {
  return getSections().filter((s) => s.gradeId === gradeId);
}

export function getSectionById(id) {
  return getSections().find((s) => s.id === id) || null;
}

function normalizeSection(data) {
  const cap = data.capacity;
  return {
    name: str(data.name).toUpperCase(),
    code: str(data.code).toUpperCase(),
    gradeId: str(data.gradeId),
    academicYear: str(data.academicYear),
    status: str(data.status) || 'active',
    classroomId: idOrNull(data.classroomId),
    classTeacherId: idOrNull(data.classTeacherId),
    assistantTeacherId: idOrNull(data.assistantTeacherId),
    capacity: cap === '' || cap === undefined || cap === null ? '' : Number(cap),
    enrollmentOpen: data.enrollmentOpen === undefined ? true : !!data.enrollmentOpen,
    notes: str(data.notes),
  };
}

function sectionLabel(section, grades) {
  const grade = grades.find((g) => g.id === section.gradeId);
  return `${grade ? grade.name : 'Grade'} Section ${section.name}`;
}

function validateSection(clean, selfId, isNew) {
  const grades = readList(K.grades);
  const sections = readList(K.sections);
  const years = readList(K.years);
  const rooms = readList(K.classrooms);
  const teachers = readList(K.teachers);
  const enrollments = readList(K.enrollments);
  const errors = {};

  if (!clean.name) errors.name = 'Section name is required.';
  else if (!/^[A-Z0-9]{1,3}$/.test(clean.name)) errors.name = 'Use 1 to 3 letters or digits, for example A.';

  const grade = grades.find((g) => g.id === clean.gradeId);
  if (!clean.gradeId) errors.gradeId = 'Parent grade is required.';
  else if (!grade) errors.gradeId = 'The selected grade does not exist.';

  const year = years.find((y) => y.name === clean.academicYear);
  if (!clean.academicYear) errors.academicYear = 'Academic year is required.';
  else if (!year) errors.academicYear = 'Academic year does not exist.';
  else if (isNew && year.status === 'archived') errors.academicYear = 'Archived academic years cannot receive new sections.';

  if (grade && year && grade.academicYear !== clean.academicYear) {
    errors.gradeId = `${grade.name} belongs to ${grade.academicYear}, not ${clean.academicYear}.`;
  }
  if (!SECTION_STATUSES.includes(clean.status)) errors.status = 'Choose a valid status.';

  if (!Number.isInteger(clean.capacity) || clean.capacity < 1) errors.capacity = 'Capacity must be a positive whole number.';
  else if (clean.capacity > 200) errors.capacity = 'Capacity above 200 is not supported.';
  else if (selfId) {
    const enrolled = activeEnrolled(enrollments, selfId);
    if (clean.capacity < enrolled) errors.capacity = `${enrolled} students are enrolled, so capacity cannot be lower than ${enrolled}.`;
  }

  if (!errors.name && !errors.gradeId && !errors.academicYear) {
    const dup = sections.find((s) => s.id !== selfId && s.gradeId === clean.gradeId && s.academicYear === clean.academicYear && s.name === clean.name);
    if (dup) errors.name = `Section ${clean.name} already exists in ${grade.name} for ${clean.academicYear}.`;
  }
  if (clean.code && !errors.academicYear) {
    const dup = sections.find((s) => s.id !== selfId && s.academicYear === clean.academicYear && String(s.code).toUpperCase() === clean.code);
    if (dup) errors.code = `Section code ${clean.code} is already used in ${clean.academicYear}.`;
  }

  const live = clean.status === 'active';
  const others = sections.filter((s) => s.id !== selfId && s.academicYear === clean.academicYear && s.status === 'active');

  if (clean.classroomId) {
    const room = rooms.find((r) => r.id === clean.classroomId);
    if (!room) errors.classroomId = 'The selected classroom does not exist.';
    else {
      if (live && room.availability === 'maintenance') errors.classroomId = `${room.name} is under maintenance.`;
      else if (Number.isInteger(clean.capacity) && clean.capacity > room.capacity) {
        errors.classroomId = `${room.name} seats ${room.capacity}, which is below this section's capacity of ${clean.capacity}.`;
      } else if (live && !POLICY.allowSharedClassrooms) {
        const clash = others.find((s) => s.classroomId === room.id);
        if (clash) errors.classroomId = `${room.name} is already assigned to ${sectionLabel(clash, grades)}.`;
      }
    }
  }

  if (clean.classTeacherId) {
    const teacher = teachers.find((t) => t.id === clean.classTeacherId);
    if (!teacher) errors.classTeacherId = 'The selected teacher does not exist.';
    else {
      if (teacher.status && teacher.status !== 'active') errors.classTeacherId = `${teacher.name} is not an active teacher.`;
      else if (live && !POLICY.allowTeacherMultipleSections) {
        const clash = others.find((s) => s.classTeacherId === teacher.id);
        if (clash) errors.classTeacherId = `${teacher.name} is already class teacher of ${sectionLabel(clash, grades)}.`;
      }
    }
  }

  if (clean.assistantTeacherId) {
    if (!teachers.some((t) => t.id === clean.assistantTeacherId)) errors.assistantTeacherId = 'The selected assistant teacher does not exist.';
    else if (clean.assistantTeacherId === clean.classTeacherId) errors.assistantTeacherId = 'The assistant teacher must be different from the class teacher.';
  }

  throwIfErrors(errors);
  return { grade };
}

export function addSection(section) {
  ensureReady();
  const clean = normalizeSection(section);
  const { grade } = validateSection(clean, null, true);
  const sections = readList(K.sections);
  if (!clean.code) clean.code = `G${pad2(grade.number)}-${clean.name}`;
  // Re-check generated code uniqueness.
  if (sections.some((s) => s.academicYear === clean.academicYear && String(s.code).toUpperCase() === clean.code)) {
    throw new AcademicError(`Section code ${clean.code} is already used in ${clean.academicYear}.`, {
      code: `Section code ${clean.code} is already used in ${clean.academicYear}.`,
    });
  }
  const stamp = nowIso();
  const created = { id: nextId('SEC', sections), ...clean, createdAt: stamp, updatedAt: stamp };
  writeList(K.sections, [...sections, created]);
  return created;
}

export function updateSection(id, updatedData) {
  ensureReady();
  const sections = readList(K.sections);
  const existing = sections.find((s) => s.id === id);
  if (!existing) throw new AcademicError('Section not found.');
  const clean = normalizeSection({ ...existing, ...updatedData });

  const enrolled = activeEnrolled(readList(K.enrollments), id);
  if (enrolled > 0 && (clean.gradeId !== existing.gradeId || clean.academicYear !== existing.academicYear)) {
    throw new AcademicError('Students are enrolled in this section, so its grade and academic year cannot be changed.', {
      gradeId: 'Students are enrolled, so the grade cannot be changed.',
    });
  }
  const { grade } = validateSection(clean, id, false);
  if (!clean.code && grade) clean.code = `G${pad2(grade.number)}-${clean.name}`;
  const updated = { ...existing, ...clean, updatedAt: nowIso() };
  writeList(K.sections, sections.map((s) => (s.id === id ? updated : s)));
  return updated;
}

/** Archiving keeps the section, its enrollments, teacher and room references for history. */
export function archiveSection(id) {
  ensureReady();
  const sections = readList(K.sections);
  const existing = sections.find((s) => s.id === id);
  if (!existing) throw new AcademicError('Section not found.');
  const updated = { ...existing, status: 'archived', enrollmentOpen: false, updatedAt: nowIso() };
  writeList(K.sections, sections.map((s) => (s.id === id ? updated : s)));
  return updated;
}

export function canDeleteSection(id) {
  ensureReady();
  const section = readList(K.sections).find((s) => s.id === id);
  if (!section) return { ok: false, reason: 'Section not found.' };
  const records = readList(K.enrollments).filter((e) => e.sectionId === id);
  const enrolled = records.filter((e) => e.status === 'active').length;
  if (enrolled > 0) {
    return { ok: false, reason: `Section ${section.name} has ${enrolled} enrolled ${enrolled === 1 ? 'student' : 'students'}.`, enrolled };
  }
  if (records.length > 0) {
    return { ok: false, reason: `Section ${section.name} has enrollment history that must be preserved.`, enrolled };
  }
  return { ok: true, reason: '', enrolled };
}

export function deleteSection(id) {
  ensureReady();
  const check = canDeleteSection(id);
  if (!check.ok) throw new AcademicError(`${check.reason} Archive it instead to keep history.`);
  writeList(K.sections, readList(K.sections).filter((s) => s.id !== id));
}

/* ------------------------------------------------------------------------- */
/* Enrollment                                                                 */
/* ------------------------------------------------------------------------- */

function checkEnrollTarget(section, academicYear, enrollments, years, grades) {
  if (!section) throw new AcademicError('Section not found.');
  if (section.status !== 'active') throw new AcademicError(`${sectionLabel(section, grades)} is not active.`);
  if (!section.enrollmentOpen) throw new AcademicError(`Enrollment is closed for ${sectionLabel(section, grades)}.`);
  if (section.academicYear !== academicYear) {
    throw new AcademicError(`That section belongs to ${section.academicYear}, not ${academicYear}.`);
  }
  const year = years.find((y) => y.name === academicYear);
  if (!year) throw new AcademicError('Academic year not found.');
  if (year.status === 'archived') throw new AcademicError(`${academicYear} is archived and cannot be changed.`);
  if (activeEnrolled(enrollments, section.id) >= section.capacity) {
    throw new AcademicError(`${sectionLabel(section, grades)} is full (${section.capacity} of ${section.capacity} seats used).`);
  }
}

export function enrollStudent(studentId, sectionId, academicYear) {
  ensureReady();
  const student = readList(K.students).find((s) => s.id === studentId);
  if (!student) throw new AcademicError('Student not found in the student registry.');
  if (student.status && student.status !== 'active') throw new AcademicError(`${student.name} is not an active student.`);

  const grades = readList(K.grades);
  const enrollments = readList(K.enrollments);
  const section = readList(K.sections).find((s) => s.id === sectionId);
  checkEnrollTarget(section, academicYear, enrollments, readList(K.years), grades);

  const current = enrollments.find((e) => e.studentId === studentId && e.academicYear === academicYear && e.status === 'active');
  if (current) {
    const cs = readList(K.sections).find((s) => s.id === current.sectionId);
    throw new AcademicError(`${student.name} is already enrolled in ${cs ? sectionLabel(cs, grades) : 'another section'} for ${academicYear}. Use Move instead.`);
  }
  const record = {
    id: nextId('ENR', enrollments, 5),
    studentId,
    sectionId,
    academicYear,
    enrolledAt: todayStr(),
    status: 'active',
    endedAt: null,
  };
  writeList(K.enrollments, [...enrollments, record]);
  return record;
}

export function moveStudent(studentId, sectionId, academicYear) {
  ensureReady();
  const grades = readList(K.grades);
  const enrollments = readList(K.enrollments);
  const current = enrollments.find((e) => e.studentId === studentId && e.academicYear === academicYear && e.status === 'active');
  if (!current) throw new AcademicError('This student has no active enrollment to move. Enroll them instead.');
  if (current.sectionId === sectionId) throw new AcademicError('The student is already in that section.');

  const section = readList(K.sections).find((s) => s.id === sectionId);
  checkEnrollTarget(section, academicYear, enrollments, readList(K.years), grades);

  const stamp = todayStr();
  const record = {
    id: nextId('ENR', enrollments, 5),
    studentId,
    sectionId,
    academicYear,
    enrolledAt: stamp,
    status: 'active',
    endedAt: null,
    movedFrom: current.sectionId,
  };
  writeList(
    K.enrollments,
    [...enrollments.map((e) => (e.id === current.id ? { ...e, status: 'moved', endedAt: stamp } : e)), record]
  );
  return record;
}

export function removeStudentFromSection(studentId, academicYear) {
  ensureReady();
  const enrollments = readList(K.enrollments);
  const current = enrollments.find((e) => e.studentId === studentId && e.academicYear === academicYear && e.status === 'active');
  if (!current) throw new AcademicError('This student has no active enrollment for that year.');
  const year = readList(K.years).find((y) => y.name === academicYear);
  if (year && year.status === 'archived') throw new AcademicError(`${academicYear} is archived and cannot be changed.`);
  writeList(K.enrollments, enrollments.map((e) => (e.id === current.id ? { ...e, status: 'removed', endedAt: todayStr() } : e)));
}

/** Active enrollments of one year joined with student, section and grade details. */
export function getEnrollmentRows(academicYear) {
  ensureReady();
  const students = new Map(readList(K.students).map((s) => [s.id, s]));
  const sections = new Map(readList(K.sections).map((s) => [s.id, s]));
  const grades = new Map(readList(K.grades).map((g) => [g.id, g]));
  return readList(K.enrollments)
    .filter((e) => e.academicYear === academicYear && e.status === 'active')
    .map((e) => {
      const student = students.get(e.studentId);
      const section = sections.get(e.sectionId);
      const grade = section ? grades.get(section.gradeId) : null;
      return {
        enrollmentId: e.id,
        studentId: e.studentId,
        studentName: student ? student.name : `Unknown student (${e.studentId})`,
        gender: student ? student.gender || '' : '',
        sectionId: e.sectionId,
        sectionName: section ? section.name : '',
        gradeId: grade ? grade.id : '',
        gradeName: grade ? grade.name : '',
        gradeNumber: grade ? grade.number : 0,
        enrolledAt: e.enrolledAt,
      };
    });
}

/** Active students that have no active enrollment in the given year. */
export function getUnenrolledStudents(academicYear) {
  ensureReady();
  const enrolled = new Set(
    readList(K.enrollments)
      .filter((e) => e.academicYear === academicYear && e.status === 'active')
      .map((e) => e.studentId)
  );
  return readList(K.students).filter((s) => (!s.status || s.status === 'active') && !enrolled.has(s.id));
}

export function getSectionStudents(sectionId) {
  ensureReady();
  const students = new Map(readList(K.students).map((s) => [s.id, s]));
  return readList(K.enrollments)
    .filter((e) => e.sectionId === sectionId && e.status === 'active')
    .map((e) => {
      const st = students.get(e.studentId);
      return {
        enrollmentId: e.id,
        studentId: e.studentId,
        name: st ? st.name : `Unknown student (${e.studentId})`,
        gender: st ? st.gender || '' : '',
        enrolledAt: e.enrolledAt,
        status: 'Enrolled',
      };
    })
    .sort((a, b) => a.name.localeCompare(b.name));
}

/* ------------------------------------------------------------------------- */
/* Statistics (always derived from sections + enrollment records)             */
/* ------------------------------------------------------------------------- */

export function getAllStats(academicYear) {
  ensureReady();
  const grades = readList(K.grades).filter((g) => g.academicYear === academicYear);
  const sections = readList(K.sections).filter((s) => s.academicYear === academicYear);
  const yearEnrollments = readList(K.enrollments).filter((e) => e.academicYear === academicYear);
  const counts = countActiveBySection(yearEnrollments);

  const sectionStats = {};
  sections.forEach((s) => {
    const enrolled = counts[s.id] || 0;
    sectionStats[s.id] = {
      sectionId: s.id,
      enrolled,
      capacity: s.capacity,
      available: Math.max(s.capacity - enrolled, 0),
      occupancy: percent(enrolled, s.capacity),
    };
  });

  const gradeStats = {};
  grades.forEach((g) => {
    const mine = sections.filter((s) => s.gradeId === g.id);
    const live = mine.filter((s) => s.status !== 'archived');
    const active = live.filter((s) => s.status === 'active');
    const enrolled = live.reduce((n, s) => n + sectionStats[s.id].enrolled, 0);
    const capacity = live.reduce((n, s) => n + s.capacity, 0);
    gradeStats[g.id] = {
      gradeId: g.id,
      sectionCount: live.length,
      archivedSectionCount: mine.length - live.length,
      enrolled,
      capacity,
      available: Math.max(capacity - enrolled, 0),
      occupancy: percent(enrolled, capacity),
      classTeacherCount: new Set(active.map((s) => s.classTeacherId).filter(Boolean)).size,
      classroomCount: new Set(active.map((s) => s.classroomId).filter(Boolean)).size,
    };
  });

  const live = sections.filter((s) => s.status !== 'archived');
  const totalEnrolled = live.reduce((n, s) => n + sectionStats[s.id].enrolled, 0);
  const totalCapacity = live.reduce((n, s) => n + s.capacity, 0);
  const enrolledStudentIds = new Set(yearEnrollments.filter((e) => e.status === 'active').map((e) => e.studentId));
  const unassignedStudents = readList(K.students).filter(
    (s) => (!s.status || s.status === 'active') && !enrolledStudentIds.has(s.id)
  ).length;

  return {
    overall: {
      totalGrades: grades.filter((g) => g.status !== 'archived').length,
      totalSections: live.length,
      totalStudents: totalEnrolled,
      totalCapacity,
      availableSeats: live.reduce((n, s) => n + sectionStats[s.id].available, 0),
      classroomsAssigned: new Set(live.filter((s) => s.status === 'active').map((s) => s.classroomId).filter(Boolean)).size,
      sectionsWithoutClassroom: live.filter((s) => s.status === 'active' && !s.classroomId).length,
      averageOccupancy: percent(totalEnrolled, totalCapacity),
      unassignedStudents,
    },
    grades: gradeStats,
    sections: sectionStats,
  };
}

export function getAcademicStatistics(academicYear) {
  return getAllStats(academicYear).overall;
}

export function getGradeStatistics(gradeId) {
  const grade = getGradeById(gradeId);
  if (!grade) return null;
  return getAllStats(grade.academicYear).grades[gradeId] || null;
}

export function getSectionStatistics(sectionId) {
  const section = getSectionById(sectionId);
  if (!section) return null;
  const base = getAllStats(section.academicYear).sections[sectionId];
  return { ...base, students: getSectionStudents(sectionId) };
}

/* ------------------------------------------------------------------------- */
/* Snapshot for the page                                                      */
/* ------------------------------------------------------------------------- */

export function getAcademicSnapshot() {
  ensureReady();
  return {
    years: readList(K.years),
    grades: readList(K.grades),
    sections: readList(K.sections),
    classrooms: readList(K.classrooms),
    teachers: readList(K.teachers),
    demo: isDemoData(),
  };
}

/* ------------------------------------------------------------------------- */
/* CSV reports                                                                */
/* ------------------------------------------------------------------------- */

function csvCell(value) {
  let text = value === null || value === undefined ? '' : String(value);
  // Neutralise spreadsheet formula injection.
  if (/^[=+\-@\t\r]/.test(text) && Number.isNaN(Number(text))) text = `'${text}`;
  if (/[",\r\n]/.test(text)) text = `"${text.replace(/"/g, '""')}"`;
  return text;
}

export function buildCsv(rows, columns) {
  const head = columns.map((c) => csvCell(c.label)).join(',');
  const body = rows.map((row) => columns.map((c) => csvCell(row[c.key])).join(','));
  return [head, ...body].join('\r\n');
}

export function downloadCsv(filename, csv) {
  const blob = new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

const REPORT_COLUMNS = {
  grade: [
    { key: 'grade', label: 'Grade' },
    { key: 'academicYear', label: 'Academic Year' },
    { key: 'sections', label: 'Sections' },
    { key: 'students', label: 'Students' },
    { key: 'capacity', label: 'Total Capacity' },
    { key: 'available', label: 'Available Seats' },
    { key: 'occupancy', label: 'Occupancy %' },
  ],
  section: [
    { key: 'id', label: 'Section ID' },
    { key: 'section', label: 'Section' },
    { key: 'grade', label: 'Grade' },
    { key: 'academicYear', label: 'Academic Year' },
    { key: 'classroom', label: 'Classroom' },
    { key: 'classTeacher', label: 'Class Teacher' },
    { key: 'students', label: 'Students' },
    { key: 'capacity', label: 'Capacity' },
    { key: 'available', label: 'Available Seats' },
    { key: 'status', label: 'Status' },
  ],
  enrollment: [
    { key: 'studentId', label: 'Student ID' },
    { key: 'studentName', label: 'Student Name' },
    { key: 'grade', label: 'Grade' },
    { key: 'section', label: 'Section' },
    { key: 'academicYear', label: 'Academic Year' },
    { key: 'enrolledAt', label: 'Enrollment Date' },
  ],
};

/**
 * kind: 'grade' | 'section' | 'enrollment'
 * options.gradeIds / options.sectionIds: restrict to these records (null = all in the year)
 * Returns { filename, csv, count }.
 */
export function generateReport(kind, academicYear, options = {}) {
  ensureReady();
  const stats = getAllStats(academicYear);
  const grades = readList(K.grades).filter((g) => g.academicYear === academicYear);
  const gradeMap = new Map(grades.map((g) => [g.id, g]));
  const sections = readList(K.sections).filter((s) => s.academicYear === academicYear);
  const rooms = new Map(readList(K.classrooms).map((r) => [r.id, r]));
  const teachers = new Map(readList(K.teachers).map((t) => [t.id, t]));
  const safeYear = academicYear.replace('/', '-');
  let rows = [];

  if (kind === 'grade') {
    const ids = options.gradeIds ? new Set(options.gradeIds) : null;
    rows = grades
      .filter((g) => !ids || ids.has(g.id))
      .sort((a, b) => a.number - b.number)
      .map((g) => {
        const st = stats.grades[g.id];
        return {
          grade: g.name,
          academicYear,
          sections: st.sectionCount,
          students: st.enrolled,
          capacity: st.capacity,
          available: st.available,
          occupancy: st.occupancy,
        };
      });
  } else if (kind === 'section') {
    const ids = options.sectionIds ? new Set(options.sectionIds) : null;
    rows = sections
      .filter((s) => !ids || ids.has(s.id))
      .sort((a, b) => (gradeMap.get(a.gradeId)?.number || 0) - (gradeMap.get(b.gradeId)?.number || 0) || a.name.localeCompare(b.name))
      .map((s) => {
        const st = stats.sections[s.id];
        return {
          id: s.id,
          section: s.name,
          grade: gradeMap.get(s.gradeId)?.name || '',
          academicYear,
          classroom: rooms.get(s.classroomId)?.name || '',
          classTeacher: teachers.get(s.classTeacherId)?.name || '',
          students: st.enrolled,
          capacity: s.capacity,
          available: st.available,
          status: s.status,
        };
      });
  } else if (kind === 'enrollment') {
    const ids = options.sectionIds ? new Set(options.sectionIds) : null;
    rows = getEnrollmentRows(academicYear)
      .filter((r) => !ids || ids.has(r.sectionId))
      .sort((a, b) => a.gradeNumber - b.gradeNumber || a.sectionName.localeCompare(b.sectionName) || a.studentName.localeCompare(b.studentName))
      .map((r) => ({
        studentId: r.studentId,
        studentName: r.studentName,
        grade: r.gradeName,
        section: r.sectionName,
        academicYear,
        enrolledAt: r.enrolledAt,
      }));
  } else {
    throw new AcademicError('Unknown report type.');
  }

  return {
    filename: `${kind}-report-${safeYear}-${todayStr()}.csv`,
    csv: buildCsv(rows, REPORT_COLUMNS[kind]),
    count: rows.length,
  };
} 