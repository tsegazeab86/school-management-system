/**
 * academicYearService.js
 * ---------------------------------------------------------------------------
 * Academic Years Management business logic.
 *
 * IMPORTANT — shared storage contract
 * The project already owns the academic-year key `sms_academic_years`
 * (see academicService.js, used by Grades & Sections). This module reuses the
 * SAME key and keeps the same core record fields (`id`, `name`, `status` where
 * status is one of `active`, `inactive`, `archived`). Extra fields add dates,
 * calendars, terms, descriptions and an activity trail without breaking the
 * existing Grades & Sections module.
 *
 * To connect the module to Express/MySQL later, replace each synchronous
 * storage read/write with an API call while keeping the exported function
 * names and the same validation error shape (AcademicYearError.errors).
 */

import { buildAcademicYearSampleData } from '../data/academicYearSampleData';
import { initializeAcademicData } from './academicService';

export const ACADEMIC_YEAR_STORAGE_KEY = 'sms_academic_years';
export const CALENDAR_SYSTEMS = Object.freeze(['BOTH', 'EC', 'GC']);
export const TERM_STATUSES = Object.freeze(['upcoming', 'active', 'completed']);
export const DISPLAY_STATUSES = Object.freeze([
  'current',
  'upcoming',
  'completed',
  'draft',
  'archived',
]);

/** School policy switches for this module. */
export const ACADEMIC_YEAR_POLICY = Object.freeze({
  preventOverlappingPeriods: true,
  maximumTerms: 8,
});

/**
 * Sample data is only written when the shared academic-year key has no usable
 * records. Set VITE_DISABLE_ACADEMIC_YEAR_SAMPLE=true (or flip this constant)
 * once the backend provides real data.
 */
export const SAMPLE_DATA_ENABLED =
  !(
    typeof import.meta !== 'undefined' &&
    import.meta.env &&
    import.meta.env.VITE_DISABLE_ACADEMIC_YEAR_SAMPLE === 'true'
  );

const DAY_MS = 24 * 60 * 60 * 1000;
const RAW_KEYS = Object.freeze({
  grades: 'sms_academic_grades',
  sections: 'sms_academic_sections',
  enrollments: 'sms_academic_enrollments',
});

export class AcademicYearError extends Error {
  constructor(message, errors = {}) {
    super(message);
    this.name = 'AcademicYearError';
    this.errors = errors;
  }
}

/* ------------------------------------------------------------------------- */
/* Small helpers                                                              */
/* ------------------------------------------------------------------------- */

const nowIso = () => new Date().toISOString();

export function getTodayIso(date = new Date()) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
    2,
    '0'
  )}-${String(date.getDate()).padStart(2, '0')}`;
}

const str = (value) => (value === undefined || value === null ? '' : String(value).trim());
const clone = (value) => JSON.parse(JSON.stringify(value));

export function isValidDate(value) {
  const text = str(value);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(text)) return false;
  const [year, month, day] = text.split('-').map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  );
}

function parseDay(value) {
  return Date.parse(`${value}T00:00:00Z`);
}

function rangesOverlap(a, b) {
  if (!isValidDate(a.startDate) || !isValidDate(a.endDate)) return false;
  if (!isValidDate(b.startDate) || !isValidDate(b.endDate)) return false;
  return a.startDate <= b.endDate && b.startDate <= a.endDate;
}

function sortTerms(terms) {
  return [...terms].sort((a, b) => {
    const aStart = a.startDate || '9999-12-31';
    const bStart = b.startDate || '9999-12-31';
    return aStart.localeCompare(bStart) || (a.name || '').localeCompare(b.name || '');
  });
}

function sortYears(years) {
  return [...years].sort((a, b) =>
    String(a.name || '').localeCompare(String(b.name || ''), undefined, {
      numeric: true,
    })
  );
}

function slugId(text) {
  return String(text)
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 20);
}

function makeYearId(name, list) {
  const match = String(name).match(/(\d{4})\D+(\d{4})/);
  const base = match
    ? `AY-${match[1]}-${match[2]}`
    : `AY-${slugId(name) || 'YEAR'}`;
  let id = base;
  let suffix = 2;
  while (list.some((year) => year.id === id)) {
    id = `${base}-${suffix}`;
    suffix += 1;
  }
  return id;
}

function nextTermId(yearId, existingIds) {
  let index = 1;
  while (existingIds.has(`${yearId}-T${index}`)) index += 1;
  return `${yearId}-T${index}`;
}

function shiftDate(value, days) {
  if (!isValidDate(value) || !Number.isFinite(days)) return '';
  return new Date(parseDay(value) + days * DAY_MS).toISOString().slice(0, 10);
}

function shiftYears(value, years) {
  if (!isValidDate(value)) return '';
  const date = new Date(parseDay(value));
  date.setUTCFullYear(date.getUTCFullYear() + years);
  return date.toISOString().slice(0, 10);
}

function dayDelta(from, to) {
  if (!isValidDate(from) || !isValidDate(to)) return 0;
  return Math.round((parseDay(to) - parseDay(from)) / DAY_MS);
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

function readState() {
  try {
    const raw = window.localStorage.getItem(ACADEMIC_YEAR_STORAGE_KEY);
    if (raw === null) return { status: 'missing', data: [] };
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return { status: 'invalid', data: [] };
    return {
      status: 'ok',
      data: parsed.filter((record) => record && typeof record === 'object' && record.id),
    };
  } catch {
    return { status: 'invalid', data: [] };
  }
}

function writeYears(list) {
  try {
    window.localStorage.setItem(
      ACADEMIC_YEAR_STORAGE_KEY,
      JSON.stringify(sortYears(list))
    );
  } catch {
    throw new AcademicYearError(
      'Could not save academic years. Browser storage may be full or disabled.'
    );
  }
}

function backupInvalid() {
  try {
    const raw = window.localStorage.getItem(ACADEMIC_YEAR_STORAGE_KEY);
    if (raw !== null) {
      window.localStorage.setItem(`${ACADEMIC_YEAR_STORAGE_KEY}__corrupt_backup`, raw);
    }
  } catch {
    /* best effort only */
  }
}

function readAcademicKey(key) {
  try {
    const raw = window.localStorage.getItem(key);
    if (raw === null) return null;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

/**
 * When the whole academic workspace is empty, let the existing Grades &
 * Sections service seed its own demo grades/sections so both modules stay
 * coherent. This never runs when any academic module data already exists.
 */
function ensureDemoDependencies() {
  try {
    const otherKeys = [
      RAW_KEYS.grades,
      RAW_KEYS.sections,
      RAW_KEYS.enrollments,
      'sms_academic_classrooms',
      'sms_academic_demo_students',
      'sms_academic_demo_teachers',
      'sms_academic_meta',
    ];
    const hasOtherData = otherKeys.some(
      (key) => window.localStorage.getItem(key) !== null
    );
    if (!hasOtherData) initializeAcademicData();
  } catch {
    /* Demo dependencies are optional; academic years can still initialize. */
  }
}

let ready = false;

/**
 * Seeds illustrative academic years ONLY when the shared key is missing,
 * empty or corrupt. Existing administrator data is never overwritten.
 */
export function initializeAcademicYears() {
  if (!storageAvailable()) {
    throw new AcademicYearError(
      'Browser storage is unavailable, so academic years cannot load.'
    );
  }

  const state = readState();
  if (state.status === 'ok' && state.data.length > 0) {
    ready = true;
    return { seeded: false, count: state.data.length };
  }

  if (state.status === 'invalid') backupInvalid();

  if (!SAMPLE_DATA_ENABLED) {
    ready = true;
    return { seeded: false, count: 0 };
  }

  // Remove an empty/invalid key so the existing academic demo (if enabled) can
  // seed normally, then replace only the year list with the richer sample.
  try {
    window.localStorage.removeItem(ACADEMIC_YEAR_STORAGE_KEY);
  } catch {
    /* best effort only */
  }
  ensureDemoDependencies();

  const sample = buildAcademicYearSampleData();
  writeYears(sample);
  ready = true;
  return { seeded: true, count: sample.length };
}

function ensureReady() {
  if (!ready) initializeAcademicYears();
}

/* ------------------------------------------------------------------------- */
/* Normalisation                                                              */
/* ------------------------------------------------------------------------- */

function normalizeTerm(raw, yearId, index) {
  const term = raw && typeof raw === 'object' ? raw : {};
  return {
    ...term,
    id: str(term.id) || `${yearId}-T${index + 1}`,
    name: str(term.name) || `Term ${index + 1}`,
    startDate: str(term.startDate),
    endDate: str(term.endDate),
    description: str(term.description),
    status: TERM_STATUSES.includes(term.status) ? term.status : 'upcoming',
  };
}

export function normalizeAcademicYear(raw) {
  const record = raw && typeof raw === 'object' ? raw : {};
  const status =
    record.status === 'archived'
      ? 'archived'
      : record.status === 'active'
        ? 'active'
        : 'inactive';
  const id = str(record.id);
  const terms = Array.isArray(record.terms)
    ? record.terms
        .filter((term) => term && typeof term === 'object')
        .map((term, index) => normalizeTerm(term, id, index))
    : [];

  return {
    ...record,
    id,
    name: str(record.name),
    status,
    isDraft: !!record.isDraft,
    ecYear: str(record.ecYear),
    gcYear: str(record.gcYear),
    calendarSystem: CALENDAR_SYSTEMS.includes(record.calendarSystem)
      ? record.calendarSystem
      : 'BOTH',
    description: str(record.description),
    startDate: str(record.startDate),
    endDate: str(record.endDate),
    registrationStartDate: str(record.registrationStartDate),
    registrationEndDate: str(record.registrationEndDate),
    terms,
    createdAt: record.createdAt || null,
    updatedAt: record.updatedAt || record.createdAt || null,
    archivedAt: record.archivedAt || null,
    activity: Array.isArray(record.activity)
      ? record.activity.filter((entry) => entry && typeof entry === 'object')
      : [],
  };
}

/* ------------------------------------------------------------------------- */
/* Reads                                                                      */
/* ------------------------------------------------------------------------- */

export function getAcademicYears() {
  ensureReady();
  return sortYears(readState().data.map(normalizeAcademicYear));
}

export function getAcademicYearById(id) {
  ensureReady();
  const found = readState().data
    .map(normalizeAcademicYear)
    .find((year) => year.id === id);
  return found || null;
}

export function getYearStartYear(year) {
  if (!year) return null;
  const fromDate = String(year.startDate || '').match(/^(\d{4})-/);
  if (fromDate) return Number(fromDate[1]);
  const fromGc = String(year.gcYear || '').match(/(\d{4})/);
  if (fromGc) return Number(fromGc[1]);
  const fromEc = String(year.ecYear || '').match(/(\d{4})/);
  if (fromEc) return Number(fromEc[1]);
  const fromName = String(year.name || '').match(/(\d{4})/);
  return fromName ? Number(fromName[1]) : null;
}

export function getAcademicYearStatus(year, today = getTodayIso()) {
  if (!year) return 'draft';
  if (year.status === 'archived') return 'archived';
  if (year.status === 'active') return 'current';
  if (year.isDraft) return 'draft';
  if (!isValidDate(year.startDate) || !isValidDate(year.endDate)) return 'draft';
  if (today > year.endDate) return 'completed';
  return 'upcoming';
}

export function getTermStatus(term, today = getTodayIso()) {
  if (!term || !isValidDate(term.startDate) || !isValidDate(term.endDate)) {
    return TERM_STATUSES.includes(term?.status) ? term.status : 'upcoming';
  }
  if (today < term.startDate) return 'upcoming';
  if (today > term.endDate) return 'completed';
  return 'active';
}

export function getCurrentTerm(year, today = getTodayIso()) {
  if (!year) return null;
  const terms = sortTerms(
    (year.terms || []).filter(
      (term) => isValidDate(term.startDate) && isValidDate(term.endDate)
    )
  );
  if (!terms.length) return null;

  const active = terms.find(
    (term) => today >= term.startDate && today <= term.endDate
  );
  if (active) return { ...active, derivedStatus: 'active' };

  const next = terms.find((term) => today < term.startDate);
  if (next) return { ...next, derivedStatus: 'upcoming' };

  return { ...terms[terms.length - 1], derivedStatus: 'completed' };
}

export function getAcademicYearProgress(year, today = getTodayIso()) {
  if (
    !year ||
    !isValidDate(year.startDate) ||
    !isValidDate(year.endDate) ||
    year.endDate <= year.startDate
  ) {
    return {
      available: false,
      percent: 0,
      daysTotal: 0,
      daysElapsed: 0,
      daysRemaining: 0,
      phase: 'unknown',
    };
  }

  const start = parseDay(year.startDate);
  const end = parseDay(year.endDate);
  const now = parseDay(today);
  const daysTotal = Math.max(1, Math.round((end - start) / DAY_MS) + 1);
  const rawElapsed = Math.round((now - start) / DAY_MS);
  const daysElapsed = Math.min(daysTotal, Math.max(0, rawElapsed));
  const daysRemaining = Math.max(0, daysTotal - daysElapsed);
  const percent = Math.round((daysElapsed / daysTotal) * 100);
  const phase = today < year.startDate ? 'upcoming' : today > year.endDate ? 'completed' : 'active';

  return {
    available: true,
    percent: Math.min(100, Math.max(0, percent)),
    daysTotal,
    daysElapsed,
    daysRemaining,
    phase,
  };
}

export function getAcademicYearStats(years = getAcademicYears()) {
  const list = Array.isArray(years) ? years : [];
  const decorated = list.map((year) => ({
    year,
    status: getAcademicYearStatus(year),
  }));

  const current = decorated.find((item) => item.status === 'current')?.year || null;
  const upcoming =
    decorated
      .filter((item) => item.status === 'upcoming')
      .map((item) => item.year)
      .sort((a, b) =>
        (a.startDate || '9999-12-31').localeCompare(b.startDate || '9999-12-31')
      )[0] || null;

  const countByStatus = (status) =>
    decorated.filter((item) => item.status === status).length;

  return {
    total: list.length,
    current,
    currentTerm: current ? getCurrentTerm(current) : null,
    upcoming,
    totalTerms: list.reduce((sum, year) => sum + (year.terms?.length || 0), 0),
    counts: {
      current: countByStatus('current'),
      upcoming: countByStatus('upcoming'),
      completed: countByStatus('completed'),
      draft: countByStatus('draft'),
      archived: countByStatus('archived'),
    },
  };
}

export function getLinkedSummary(yearName) {
  const gradesRaw = readAcademicKey(RAW_KEYS.grades);
  const sectionsRaw = readAcademicKey(RAW_KEYS.sections);
  const enrollmentsRaw = readAcademicKey(RAW_KEYS.enrollments);

  const grades = gradesRaw
    ? gradesRaw.filter(
        (grade) =>
          grade &&
          grade.academicYear === yearName &&
          grade.status !== 'archived'
      ).length
    : null;
  const sections = sectionsRaw
    ? sectionsRaw.filter(
        (section) =>
          section &&
          section.academicYear === yearName &&
          section.status !== 'archived'
      ).length
    : null;

  let students = null;
  if (enrollmentsRaw) {
    const activeEnrollments = enrollmentsRaw.filter(
      (enrollment) =>
        enrollment &&
        enrollment.academicYear === yearName &&
        enrollment.status === 'active'
    );
    students = new Set(
      activeEnrollments.map((enrollment) => enrollment.studentId)
    ).size;
  }

  return {
    grades,
    sections,
    students,
    subjects: null,
    teachers: null,
    timetable: null,
    hasAny: [grades, sections, students].some(
      (value) => typeof value === 'number'
    ),
  };
}

export function getDeletionBlockers(year) {
  if (!year) return [];
  const blockers = [];

  const grades = (readAcademicKey(RAW_KEYS.grades) || []).filter(
    (grade) => grade && grade.academicYear === year.name
  );
  const sections = (readAcademicKey(RAW_KEYS.sections) || []).filter(
    (section) => section && section.academicYear === year.name
  );
  const enrollments = (readAcademicKey(RAW_KEYS.enrollments) || []).filter(
    (enrollment) => enrollment && enrollment.academicYear === year.name
  );

  if (grades.length) {
    blockers.push(
      `${grades.length} grade record${grades.length === 1 ? '' : 's'} in Grades & Sections`
    );
  }
  if (sections.length) {
    blockers.push(
      `${sections.length} section record${sections.length === 1 ? '' : 's'} in Grades & Sections`
    );
  }
  if (enrollments.length) {
    blockers.push(
      `${enrollments.length} student enrollment record${
        enrollments.length === 1 ? '' : 's'
      }`
    );
  }

  return blockers;
}

export function getCalendarEvents(year) {
  if (!year) return [];
  const events = [];
  const push = (date, label, type) => {
    if (isValidDate(date)) events.push({ date, label, type });
  };

  push(year.registrationStartDate, 'Registration opens', 'registration');
  push(year.registrationEndDate, 'Registration closes', 'registration');
  push(year.startDate, 'Academic year starts', 'year');
  push(year.endDate, 'Academic year ends', 'year');

  (year.terms || []).forEach((term) => {
    push(term.startDate, `${term.name || 'Term'} starts`, 'term');
    push(term.endDate, `${term.name || 'Term'} ends`, 'term');
  });

  return events.sort(
    (a, b) => a.date.localeCompare(b.date) || a.label.localeCompare(b.label)
  );
}

/* ------------------------------------------------------------------------- */
/* Validation                                                                 */
/* ------------------------------------------------------------------------- */

function termIssues(term, year, selfTermId, allTerms, options = {}) {
  const lenient = !!options.lenient;
  const errors = {};
  const start = str(term.startDate);
  const end = str(term.endDate);
  const yearStart = str(year.startDate);
  const yearEnd = str(year.endDate);

  if (!str(term.name)) errors.name = 'Term name is required.';

  if (!lenient || start) {
    if (!start) errors.startDate = 'Start date is required.';
    else if (!isValidDate(start)) errors.startDate = 'Enter a valid start date.';
  }
  if (!lenient || end) {
    if (!end) errors.endDate = 'End date is required.';
    else if (!isValidDate(end)) errors.endDate = 'Enter a valid end date.';
  }

  if (
    start &&
    end &&
    isValidDate(start) &&
    isValidDate(end) &&
    end <= start
  ) {
    errors.endDate = 'Term end date must be after its start date.';
  }

  if (start && isValidDate(start) && isValidDate(yearStart) && start < yearStart) {
    errors.startDate = `Term cannot start before the academic year (${yearStart}).`;
  }
  if (end && isValidDate(end) && isValidDate(yearEnd) && end > yearEnd) {
    errors.endDate = `Term cannot end after the academic year (${yearEnd}).`;
  }

  if (!errors.startDate && !errors.endDate) {
    (allTerms || []).forEach((other) => {
      if (!other || other.id === selfTermId) return;
      if (rangesOverlap({ startDate: start, endDate: end }, other)) {
        errors.startDate = `This term overlaps “${other.name || 'another term'}”.`;
      }
    });
  }

  return errors;
}

export function validateTermForYear(term, year, selfTermId = null) {
  const allTerms = [...(year?.terms || [])];
  const candidateId = selfTermId || term.id || '__new-term__';
  if (!allTerms.some((item) => item.id === candidateId)) {
    allTerms.push({ ...term, id: candidateId });
  }
  return termIssues(term, year || {}, candidateId, allTerms);
}

function assertValid(errors) {
  const keys = Object.keys(errors || {});
  if (!keys.length) return;
  const first = errors[keys[0]];
  const message =
    typeof first === 'string' ? first : 'Please review the highlighted fields.';
  throw new AcademicYearError(message, errors);
}

export function validateAcademicYear(data, selfId = null, options = {}) {
  const draft = !!options.draft;
  const errors = {};
  const name = str(data.name);

  if (!name) {
    errors.name = 'Academic year name is required.';
  } else {
    const duplicate = getAcademicYears().find(
      (year) =>
        year.id !== selfId && year.name.toLowerCase() === name.toLowerCase()
    );
    if (duplicate) {
      errors.name = 'An academic year with this name already exists.';
    }
  }

  const calendarSystem = CALENDAR_SYSTEMS.includes(data.calendarSystem)
    ? data.calendarSystem
    : 'BOTH';
  if (!CALENDAR_SYSTEMS.includes(data.calendarSystem)) {
    errors.calendarSystem = 'Choose a calendar system.';
  }
  if (
    (calendarSystem === 'EC' || calendarSystem === 'BOTH') &&
    !str(data.ecYear)
  ) {
    errors.ecYear = 'Ethiopian calendar year is required.';
  }
  if (
    (calendarSystem === 'GC' || calendarSystem === 'BOTH') &&
    !str(data.gcYear)
  ) {
    errors.gcYear = 'Gregorian calendar year is required.';
  }

  const start = str(data.startDate);
  const end = str(data.endDate);
  const registrationStart = str(data.registrationStartDate);
  const registrationEnd = str(data.registrationEndDate);

  if (!draft) {
    if (!start) errors.startDate = 'Start date is required.';
    else if (!isValidDate(start)) errors.startDate = 'Enter a valid start date.';
    if (!end) errors.endDate = 'End date is required.';
    else if (!isValidDate(end)) errors.endDate = 'Enter a valid end date.';
  } else {
    if (start && !isValidDate(start)) errors.startDate = 'Enter a valid start date.';
    if (end && !isValidDate(end)) errors.endDate = 'Enter a valid end date.';
  }

  if (start && end && isValidDate(start) && isValidDate(end) && end <= start) {
    errors.endDate = 'End date must be after the start date.';
  }

  if (registrationStart && !isValidDate(registrationStart)) {
    errors.registrationStartDate = 'Enter a valid registration start date.';
  }
  if (registrationEnd && !isValidDate(registrationEnd)) {
    errors.registrationEndDate = 'Enter a valid registration end date.';
  }
  if (
    registrationStart &&
    registrationEnd &&
    isValidDate(registrationStart) &&
    isValidDate(registrationEnd) &&
    registrationEnd < registrationStart
  ) {
    errors.registrationEndDate =
      'Registration end date must be on or after the registration start date.';
  }
  if (
    registrationEnd &&
    end &&
    isValidDate(registrationEnd) &&
    isValidDate(end) &&
    registrationEnd > end
  ) {
    errors.registrationEndDate =
      'Registration cannot end after the academic year ends.';
  }
  if (
    registrationStart &&
    end &&
    isValidDate(registrationStart) &&
    isValidDate(end) &&
    registrationStart > end
  ) {
    errors.registrationStartDate =
      'Registration must start before the academic year ends.';
  }

  const terms = Array.isArray(data.terms) ? data.terms : [];
  const termErrors = {};
  terms.forEach((term) => {
    const issues = termIssues(
      term,
      { startDate: start, endDate: end },
      term.id,
      terms,
      { lenient: draft }
    );
    if (Object.keys(issues).length) termErrors[term.id] = issues;
  });
  if (Object.keys(termErrors).length) errors.terms = termErrors;

  if (
    !draft &&
    !errors.startDate &&
    !errors.endDate &&
    start &&
    end &&
    ACADEMIC_YEAR_POLICY.preventOverlappingPeriods
  ) {
    const overlap = getAcademicYears().find(
      (year) =>
        year.id !== selfId &&
        year.status !== 'archived' &&
        !year.isDraft &&
        isValidDate(year.startDate) &&
        isValidDate(year.endDate) &&
        start < year.endDate &&
        end > year.startDate
    );
    if (overlap) {
      errors.startDate = `This period overlaps ${overlap.name}. Adjust the dates or archive the other year.`;
    }
  }

  return errors;
}

/* ------------------------------------------------------------------------- */
/* Activity trail                                                             */
/* ------------------------------------------------------------------------- */

function addActivity(year, action, description) {
  const entry = {
    id: `ACT-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    action,
    description,
    at: nowIso(),
  };
  return [entry, ...(Array.isArray(year.activity) ? year.activity : [])].slice(0, 60);
}

/* ------------------------------------------------------------------------- */
/* Writes                                                                     */
/* ------------------------------------------------------------------------- */

function prepareYear(data, { id, existing, asDraft }) {
  const usedTermIds = new Set();
  const terms = (Array.isArray(data.terms) ? data.terms : []).map((term) => {
    let termId = str(term.id);
    if (!termId || usedTermIds.has(termId)) {
      termId = nextTermId(id, usedTermIds);
    }
    usedTermIds.add(termId);
    return normalizeTerm({ ...term, id: termId }, id, usedTermIds.size - 1);
  });

  return {
    ...(existing || {}),
    id,
    name: str(data.name),
    status: existing ? existing.status : 'inactive',
    isDraft: asDraft ?? !!data.isDraft,
    ecYear: str(data.ecYear),
    gcYear: str(data.gcYear),
    calendarSystem: CALENDAR_SYSTEMS.includes(data.calendarSystem)
      ? data.calendarSystem
      : 'BOTH',
    description: str(data.description),
    startDate: str(data.startDate),
    endDate: str(data.endDate),
    registrationStartDate: str(data.registrationStartDate),
    registrationEndDate: str(data.registrationEndDate),
    terms: sortTerms(terms),
    createdAt: existing?.createdAt || nowIso(),
    updatedAt: nowIso(),
    archivedAt: existing?.archivedAt || null,
    activity: existing?.activity || [],
  };
}

export function createAcademicYear(data, options = {}) {
  ensureReady();
  const asDraft = !!options.asDraft;
  const list = getAcademicYears();
  const errors = validateAcademicYear(
    { ...data, isDraft: asDraft },
    null,
    { draft: asDraft }
  );
  assertValid(errors);

  const id = makeYearId(data.name, list);
  const year = prepareYear(data, { id, asDraft });
  year.activity = addActivity(
    {},
    'created',
    asDraft ? 'Draft academic year created.' : 'Academic year created.'
  );

  writeYears([...list, year]);
  return normalizeAcademicYear(year);
}

export function updateAcademicYear(id, data, options = {}) {
  ensureReady();
  const list = getAcademicYears();
  const existing = list.find((year) => year.id === id);
  if (!existing) throw new AcademicYearError('Academic year not found.');
  if (existing.status === 'archived') {
    throw new AcademicYearError(
      'Archived academic years are read-only. Restore it before editing.'
    );
  }

  const asDraft = options.asDraft ?? existing.isDraft;
  if (existing.status === 'active' && asDraft) {
    throw new AcademicYearError(
      'The current academic year cannot be saved as a draft.'
    );
  }

  const errors = validateAcademicYear(
    { ...data, isDraft: asDraft },
    id,
    { draft: asDraft }
  );
  assertValid(errors);

  const updated = prepareYear(data, { id, existing, asDraft });
  updated.activity = addActivity(
    existing,
    'updated',
    'Academic year details updated.'
  );

  writeYears(list.map((year) => (year.id === id ? updated : year)));
  return normalizeAcademicYear(updated);
}

export function deleteAcademicYear(id) {
  ensureReady();
  const list = getAcademicYears();
  const target = list.find((year) => year.id === id);
  if (!target) throw new AcademicYearError('Academic year not found.');
  if (target.status === 'active') {
    throw new AcademicYearError(
      'The current academic year cannot be deleted. Set another year as current first.'
    );
  }

  const blockers = getDeletionBlockers(target);
  if (blockers.length) {
    throw new AcademicYearError(
      `Cannot delete ${target.name}: dependent academic records exist.`,
      { dependencies: blockers }
    );
  }

  writeYears(list.filter((year) => year.id !== id));
  return true;
}

export function archiveAcademicYear(id) {
  ensureReady();
  const list = getAcademicYears();
  const target = list.find((year) => year.id === id);
  if (!target) throw new AcademicYearError('Academic year not found.');
  if (target.status === 'active') {
    throw new AcademicYearError(
      'The current academic year cannot be archived. Activate another year first.'
    );
  }
  if (target.isDraft) {
    throw new AcademicYearError(
      'Draft years cannot be archived. Delete the draft instead.'
    );
  }

  const progress = getAcademicYearProgress(target);
  if (progress.available && progress.phase !== 'completed') {
    throw new AcademicYearError(
      'Only completed academic years can be archived.'
    );
  }

  const archived = {
    ...target,
    status: 'archived',
    archivedAt: nowIso(),
    updatedAt: nowIso(),
    activity: addActivity(target, 'archived', 'Academic year archived.'),
  };
  writeYears(list.map((year) => (year.id === id ? archived : year)));
  return normalizeAcademicYear(archived);
}

export function restoreAcademicYear(id) {
  ensureReady();
  const list = getAcademicYears();
  const target = list.find((year) => year.id === id);
  if (!target) throw new AcademicYearError('Academic year not found.');
  if (target.status !== 'archived') {
    throw new AcademicYearError('Only archived academic years can be restored.');
  }

  const restored = {
    ...target,
    status: 'inactive',
    archivedAt: null,
    updatedAt: nowIso(),
    activity: addActivity(target, 'restored', 'Academic year restored from archive.'),
  };
  writeYears(list.map((year) => (year.id === id ? restored : year)));
  return normalizeAcademicYear(restored);
}

export function setCurrentAcademicYear(id) {
  ensureReady();
  const list = getAcademicYears();
  const target = list.find((year) => year.id === id);
  if (!target) throw new AcademicYearError('Academic year not found.');
  if (target.status === 'archived') {
    throw new AcademicYearError(
      'Restore this archived year before making it current.'
    );
  }
  if (target.isDraft) {
    throw new AcademicYearError(
      'Save the draft as an academic year before making it current.'
    );
  }
  if (target.status === 'active') return target;

  const updated = list.map((year) => {
    if (year.id === id) {
      return {
        ...year,
        status: 'active',
        isDraft: false,
        updatedAt: nowIso(),
        activity: addActivity(
          year,
          'current',
          'Set as the current academic year.'
        ),
      };
    }
    if (year.status === 'active') {
      return {
        ...year,
        status: 'inactive',
        updatedAt: nowIso(),
        activity: addActivity(
          year,
          'current',
          'Marked as not current after another year was activated.'
        ),
      };
    }
    return year;
  });

  writeYears(updated);
  return normalizeAcademicYear(updated.find((year) => year.id === id));
}

export function duplicateAcademicYear(id, newData = {}) {
  ensureReady();
  const list = getAcademicYears();
  const source = list.find((year) => year.id === id);
  if (!source) throw new AcademicYearError('Academic year not found.');

  const delta = dayDelta(source.startDate, newData.startDate);
  const terms = (source.terms || [])
    .map((term) => ({
      ...term,
      id: '',
      startDate: shiftDate(term.startDate, delta),
      endDate: shiftDate(term.endDate, delta),
    }))
    .filter((term) => term.startDate && term.endDate);

  const candidate = { ...newData, terms, isDraft: true };
  const errors = validateAcademicYear(candidate, null, { draft: false });
  assertValid(errors);

  const newId = makeYearId(candidate.name, list);
  const year = prepareYear(candidate, { id: newId, asDraft: true });
  year.activity = addActivity(
    {},
    'duplicated',
    `Created by duplicating ${source.name}. Terms and calendar structure copied; no students or records copied.`
  );

  writeYears([...list, year]);
  return normalizeAcademicYear(year);
}

export function getDuplicateDefaults(source) {
  if (!source) return {};

  const list = getAcademicYears();
  const sourceStart = getYearStartYear(source);
  const baseStart = sourceStart || new Date().getFullYear();
  const protectedYears = list.filter(
    (year) => year.id !== source.id && year.status !== 'archived'
  );

  let nextStart = baseStart + 1;
  for (let attempt = 0; attempt < 40; attempt += 1) {
    const candidateName = `${nextStart}/${nextStart + 1}`;
    const candidateStart = `${nextStart}-09-11`;
    const candidateEnd = `${nextStart + 1}-06-30`;
    const nameTaken = list.some((year) => year.name === candidateName);
    const periodTaken = protectedYears.some(
      (year) =>
        isValidDate(year.startDate) &&
        isValidDate(year.endDate) &&
        candidateStart < year.endDate &&
        candidateEnd > year.startDate
    );
    if (!nameTaken && !periodTaken) break;
    nextStart += 1;
  }

  const shift = nextStart - baseStart;
  const ecMatch = String(source.ecYear || '').match(/(\d{4})/);
  const nextEc = ecMatch ? Number(ecMatch[1]) + shift : null;

  return {
    name: `${nextStart}/${nextStart + 1}`,
    ecYear: nextEc ? `${nextEc} E.C.` : '',
    gcYear: `${nextStart}/${nextStart + 1} G.C.`,
    calendarSystem: source.calendarSystem || 'BOTH',
    description: `Copy of ${source.name}.`,
    startDate: shiftYears(source.startDate, shift),
    endDate: shiftYears(source.endDate, shift),
    registrationStartDate: shiftYears(source.registrationStartDate, shift),
    registrationEndDate: shiftYears(source.registrationEndDate, shift),
    isDraft: true,
  };
}

/* ------------------------------------------------------------------------- */
/* Term management                                                            */
/* ------------------------------------------------------------------------- */

export function addTerm(yearId, termData) {
  ensureReady();
  const list = getAcademicYears();
  const year = list.find((item) => item.id === yearId);
  if (!year) throw new AcademicYearError('Academic year not found.');
  if (year.status === 'archived') {
    throw new AcademicYearError(
      'Archived academic years are read-only. Restore it before editing terms.'
    );
  }
  if ((year.terms?.length || 0) >= ACADEMIC_YEAR_POLICY.maximumTerms) {
    throw new AcademicYearError(
      `An academic year can contain at most ${ACADEMIC_YEAR_POLICY.maximumTerms} terms.`
    );
  }

  const used = new Set((year.terms || []).map((term) => term.id));
  const term = normalizeTerm(
    { ...termData, id: str(termData.id) || nextTermId(year.id, used) },
    year.id,
    used.size
  );
  const errors = termIssues(
    term,
    year,
    term.id,
    [...(year.terms || []), term]
  );
  assertValid(errors);

  const updated = {
    ...year,
    terms: sortTerms([...(year.terms || []), term]),
    updatedAt: nowIso(),
    activity: addActivity(year, 'term-added', `Term “${term.name}” added.`),
  };
  writeYears(list.map((item) => (item.id === yearId ? updated : item)));
  return normalizeAcademicYear(updated);
}

export function updateTerm(yearId, termId, termData) {
  ensureReady();
  const list = getAcademicYears();
  const year = list.find((item) => item.id === yearId);
  if (!year) throw new AcademicYearError('Academic year not found.');
  if (year.status === 'archived') {
    throw new AcademicYearError(
      'Archived academic years are read-only. Restore it before editing terms.'
    );
  }
  const existing = (year.terms || []).find((term) => term.id === termId);
  if (!existing) throw new AcademicYearError('Term not found.');

  const candidate = normalizeTerm(
    { ...existing, ...termData, id: termId },
    year.id,
    0
  );
  const errors = termIssues(candidate, year, termId, year.terms || []);
  assertValid(errors);

  const updated = {
    ...year,
    terms: sortTerms(
      (year.terms || []).map((term) => (term.id === termId ? candidate : term))
    ),
    updatedAt: nowIso(),
    activity: addActivity(
      year,
      'term-updated',
      `Term “${candidate.name}” updated.`
    ),
  };
  writeYears(list.map((item) => (item.id === yearId ? updated : item)));
  return normalizeAcademicYear(updated);
}

export function removeTerm(yearId, termId) {
  ensureReady();
  const list = getAcademicYears();
  const year = list.find((item) => item.id === yearId);
  if (!year) throw new AcademicYearError('Academic year not found.');
  if (year.status === 'archived') {
    throw new AcademicYearError(
      'Archived academic years are read-only. Restore it before editing terms.'
    );
  }
  const existing = (year.terms || []).find((term) => term.id === termId);
  if (!existing) throw new AcademicYearError('Term not found.');

  const updated = {
    ...year,
    terms: (year.terms || []).filter((term) => term.id !== termId),
    updatedAt: nowIso(),
    activity: addActivity(year, 'term-removed', `Term “${existing.name}” removed.`),
  };
  writeYears(list.map((item) => (item.id === yearId ? updated : item)));
  return normalizeAcademicYear(updated);
}

/* ------------------------------------------------------------------------- */
/* Export                                                                     */
/* ------------------------------------------------------------------------- */

function csvEscape(value) {
  const text = value === undefined || value === null ? '' : String(value);
  return /[",\r\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

export function exportAcademicYears(records = getAcademicYears()) {
  const headers = [
    'Academic Year',
    'Ethiopian Calendar',
    'Gregorian Calendar',
    'Calendar System',
    'Start Date',
    'End Date',
    'Registration Start',
    'Registration End',
    'Terms',
    'Current Term',
    'Status',
    'Description',
    'Created At',
  ];

  const rows = records.map((year) => {
    const currentTerm = getCurrentTerm(year);
    return [
      year.name,
      year.ecYear,
      year.gcYear,
      year.calendarSystem,
      year.startDate,
      year.endDate,
      year.registrationStartDate,
      year.registrationEndDate,
      (year.terms || []).map((term) => term.name).join('; '),
      currentTerm ? currentTerm.name : '',
      getAcademicYearStatus(year),
      year.description,
      year.createdAt || '',
    ];
  });

  return [headers, ...rows]
    .map((row) => row.map(csvEscape).join(','))
    .join('\r\n');
}

export function downloadCsv(filename, csv) {
  if (typeof document === 'undefined') return;
  const blob = new Blob([`\ufeff${csv}`], {
    type: 'text/csv;charset=utf-8;',
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.style.display = 'none';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/** Exposed for tests / future integrations that need a deep copy. */
export function cloneAcademicYear(year) {
  return clone(year);
}
