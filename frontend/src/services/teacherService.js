// Frontend-only teacher service backed by localStorage (key: "sms_teachers").
// All functions that touch storage are async so they can be replaced by Express/MySQL
// API calls later without changing the React component.
import {
  SAMPLE_TEACHERS,
  TEACHER_STATUSES,
  EMPLOYMENT_TYPES,
  QUALIFICATIONS,
} from "../data/teacherSampleData";

export const STORAGE_KEY = "sms_teachers";

export class TeacherStorageError extends Error {
  constructor(message, { corrupted = false } = {}) {
    super(message);
    this.name = "TeacherStorageError";
    this.corrupted = corrupted;
  }
}

export class TeacherValidationError extends Error {
  constructor(errors) {
    super("Please correct the highlighted fields.");
    this.name = "TeacherValidationError";
    this.errors = errors;
  }
}

const delay = (ms = 200) => new Promise((resolve) => setTimeout(resolve, ms));
const clone = (value) => JSON.parse(JSON.stringify(value));
const nowIso = () => new Date().toISOString();
const todayStr = () => new Date().toISOString().slice(0, 10);

/* ------------------------------ low-level storage ------------------------------ */

const isUsableRecord = (r) =>
  r &&
  typeof r === "object" &&
  typeof r.id === "string" &&
  r.id.trim() !== "" &&
  typeof r.firstName === "string" &&
  typeof r.lastName === "string";

function writeAll(list) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  } catch {
    throw new TeacherStorageError(
      "Could not save teacher data. Browser storage may be full or blocked.",
    );
  }
}

function readAll() {
  let raw;
  try {
    raw = localStorage.getItem(STORAGE_KEY);
  } catch {
    throw new TeacherStorageError(
      "Browser storage is not available. Check your browser privacy settings.",
    );
  }
  if (raw === null) {
    // First run only: the key does not exist yet. Existing data is never replaced.
    const seeded = clone(SAMPLE_TEACHERS);
    writeAll(seeded);
    return seeded;
  }
  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new TeacherStorageError(
      "Saved teacher data is corrupted and could not be read.",
      { corrupted: true },
    );
  }
  if (!Array.isArray(parsed) || !parsed.every(isUsableRecord)) {
    throw new TeacherStorageError(
      "Saved teacher data has an unexpected format.",
      { corrupted: true },
    );
  }
  return parsed;
}

/** Backs up the unreadable data under a new key, then restores the sample data. */
export async function resetCorruptedStorage() {
  await delay();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw !== null)
      localStorage.setItem(`${STORAGE_KEY}_backup_${Date.now()}`, raw);
  } catch {
    throw new TeacherStorageError(
      "Could not back up the corrupted data, so it was left untouched.",
    );
  }
  writeAll(clone(SAMPLE_TEACHERS));
  return clone(SAMPLE_TEACHERS);
}

/** Loads the demo teachers, but only when there are no teacher records at all. */
export async function restoreSampleTeachers() {
  await delay();
  if (readAll().length > 0)
    throw new TeacherStorageError(
      "Teacher records already exist, so sample data was not added.",
    );
  writeAll(clone(SAMPLE_TEACHERS));
  return clone(SAMPLE_TEACHERS);
}

/* ------------------------------ validation helpers ------------------------------ */

const PHONE_RE = /^(\+251|0)?[79]\d{8}$/;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const ID_RE = /^[A-Za-z0-9-]{4,24}$/;
const cleanPhone = (v) => String(v ?? "").replace(/[\s()-]/g, "");
const toNumber = (v) =>
  v === "" || v === null || v === undefined ? "" : Number(v);

export function calculateAge(dateStr, ref = new Date()) {
  if (!dateStr) return null;
  const d = new Date(`${dateStr}T00:00:00`);
  if (Number.isNaN(d.getTime())) return null;
  let age = ref.getFullYear() - d.getFullYear();
  if (
    ref.getMonth() < d.getMonth() ||
    (ref.getMonth() === d.getMonth() && ref.getDate() < d.getDate())
  )
    age -= 1;
  return age;
}

/** Trims text, normalises phone numbers and converts numeric fields. */
export function normalizeTeacherInput(input) {
  const out = { ...input };
  Object.keys(out).forEach((k) => {
    if (typeof out[k] === "string") out[k] = out[k].trim();
  });
  out.phone = cleanPhone(out.phone);
  out.emergencyPhone = cleanPhone(out.emergencyPhone);
  out.experienceYears = toNumber(out.experienceYears);
  out.graduationYear = toNumber(out.graduationYear);
  out.salary = toNumber(out.salary);
  return out;
}

/**
 * Returns an object of field -> message. Empty object means valid.
 * existing: all current teachers (for duplicate-ID checks). currentId: the record being edited.
 */
export function validateTeacher(
  data,
  existing = [],
  { currentId = null } = {},
) {
  const e = {};
  const need = (key, msg) => {
    if (data[key] === "" || data[key] === null || data[key] === undefined)
      e[key] = msg;
  };
  const year = new Date().getFullYear();

  need("firstName", "First name is required.");
  need("lastName", "Last name is required.");
  need("gender", "Select a gender.");
  need("dateOfBirth", "Date of birth is required.");
  need("phone", "Phone number is required.");
  need("email", "Email is required.");
  need("id", "Teacher ID is required.");
  need("department", "Select a department.");
  need("subject", "Select a subject specialization.");
  need("employmentType", "Select an employment type.");
  need("status", "Select an employment status.");
  need("joiningDate", "Joining date is required.");
  need("experienceYears", "Years of experience is required.");
  need("qualification", "Select the highest qualification.");
  need("institution", "Institution is required.");
  need("graduationYear", "Graduation year is required.");

  if (data.gender && !["Male", "Female"].includes(data.gender))
    e.gender = "Select a valid gender.";
  if (data.employmentType && !EMPLOYMENT_TYPES.includes(data.employmentType))
    e.employmentType = "Select a valid employment type.";
  if (data.status && !TEACHER_STATUSES.includes(data.status))
    e.status = "Select a valid status.";
  if (data.qualification && !QUALIFICATIONS.includes(data.qualification))
    e.qualification = "Select a valid qualification.";

  if (data.id && !e.id) {
    if (!ID_RE.test(data.id)) e.id = "Use 4-24 letters, numbers or hyphens.";
    else if (
      existing.some(
        (t) =>
          t.id.toLowerCase() === data.id.toLowerCase() && t.id !== currentId,
      )
    )
      e.id = "This Teacher ID already exists.";
  }
  if (data.email && !e.email && !EMAIL_RE.test(data.email))
    e.email = "Enter a valid email address.";
  if (data.phone && !e.phone && !PHONE_RE.test(data.phone))
    e.phone = "Use an Ethiopian number, e.g. 0912345678.";
  if (data.emergencyPhone && !PHONE_RE.test(data.emergencyPhone))
    e.emergencyPhone = "Enter a valid phone number.";
  if (data.emergencyName && !data.emergencyPhone)
    e.emergencyPhone = "Add a phone number for the emergency contact.";
  if (data.photoUrl && !/^https?:\/\/\S+$/i.test(data.photoUrl))
    e.photoUrl = "Enter a full URL starting with http:// or https://";

  if (data.dateOfBirth && !e.dateOfBirth) {
    const age = calculateAge(data.dateOfBirth);
    if (age === null) e.dateOfBirth = "Enter a valid date.";
    else if (data.dateOfBirth > todayStr())
      e.dateOfBirth = "Date of birth cannot be in the future.";
    else if (age < 18 || age > 75)
      e.dateOfBirth = "Teacher must be between 18 and 75 years old.";
  }
  if (data.joiningDate && !e.joiningDate) {
    const j = new Date(`${data.joiningDate}T00:00:00`);
    if (Number.isNaN(j.getTime())) e.joiningDate = "Enter a valid date.";
    else if (
      data.joiningDate >
      new Date(Date.now() + 366 * 864e5).toISOString().slice(0, 10)
    )
      e.joiningDate = "Joining date is too far in the future.";
    else if (
      data.dateOfBirth &&
      !e.dateOfBirth &&
      calculateAge(data.dateOfBirth, j) < 18
    )
      e.joiningDate = "Teacher must be at least 18 on the joining date.";
  }
  if (data.experienceYears !== "" && !e.experienceYears) {
    if (
      !Number.isFinite(data.experienceYears) ||
      data.experienceYears < 0 ||
      data.experienceYears > 50
    )
      e.experienceYears = "Enter a number between 0 and 50.";
  }
  if (data.graduationYear !== "" && !e.graduationYear) {
    const birthYear = data.dateOfBirth
      ? Number(data.dateOfBirth.slice(0, 4))
      : 1950;
    if (
      !Number.isInteger(data.graduationYear) ||
      data.graduationYear < Math.max(1960, birthYear + 17) ||
      data.graduationYear > year
    )
      e.graduationYear = `Enter a valid year (up to ${year}).`;
  }
  if (data.salary !== "" && data.salary !== undefined && data.salary !== null) {
    if (
      !Number.isFinite(data.salary) ||
      data.salary < 0 ||
      data.salary > 1000000
    )
      e.salary = "Enter a valid amount (0 - 1,000,000).";
  }
  return e;
}

export function generateTeacherId(list, year = new Date().getFullYear()) {
  const prefix = `TCH-${year}-`;
  const max = list
    .filter((t) => t.id.startsWith(prefix))
    .reduce(
      (m, t) => Math.max(m, parseInt(t.id.slice(prefix.length), 10) || 0),
      0,
    );
  return `${prefix}${String(max + 1).padStart(4, "0")}`;
}

/* ------------------------------ public CRUD API ------------------------------ */

export async function getTeachers() {
  await delay();
  return readAll();
}

export async function getTeacherById(id) {
  await delay(80);
  const found = readAll().find((t) => t.id === id);
  if (!found) throw new TeacherStorageError("Teacher not found.");
  return found;
}

export async function addTeacher(teacher) {
  await delay(300);
  const list = readAll();
  const data = normalizeTeacherInput(teacher);
  if (!data.id) data.id = generateTeacherId(list);
  const errors = validateTeacher(data, list);
  if (Object.keys(errors).length) throw new TeacherValidationError(errors);
  const stamp = nowIso();
  const record = {
    ...data,
    archived: false,
    createdAt: stamp,
    updatedAt: stamp,
  };
  writeAll([record, ...list]);
  return record;
}

export async function updateTeacher(id, updatedData) {
  await delay(300);
  const list = readAll();
  const index = list.findIndex((t) => t.id === id);
  if (index === -1)
    throw new TeacherStorageError(
      "Teacher not found. It may have been deleted.",
    );
  const merged = normalizeTeacherInput({ ...list[index], ...updatedData, id });
  const errors = validateTeacher(merged, list, { currentId: id });
  if (Object.keys(errors).length) throw new TeacherValidationError(errors);
  const record = { ...merged, updatedAt: nowIso() };
  list[index] = record;
  writeAll(list);
  return record;
}

export async function changeTeacherStatus(id, status) {
  if (!TEACHER_STATUSES.includes(status))
    throw new TeacherStorageError("Invalid status.");
  await delay(200);
  const list = readAll();
  const index = list.findIndex((t) => t.id === id);
  if (index === -1) throw new TeacherStorageError("Teacher not found.");
  list[index] = { ...list[index], status, updatedAt: nowIso() };
  writeAll(list);
  return list[index];
}

export async function archiveTeacher(id) {
  await delay(200);
  const list = readAll();
  const index = list.findIndex((t) => t.id === id);
  if (index === -1) throw new TeacherStorageError("Teacher not found.");
  list[index] = { ...list[index], archived: true, updatedAt: nowIso() };
  writeAll(list);
  return list[index];
}

export async function restoreTeacher(id) {
  await delay(200);
  const list = readAll();
  const index = list.findIndex((t) => t.id === id);
  if (index === -1) throw new TeacherStorageError("Teacher not found.");
  list[index] = { ...list[index], archived: false, updatedAt: nowIso() };
  writeAll(list);
  return list[index];
}

export async function deleteTeacher(id) {
  await delay(250);
  const list = readAll();
  if (!list.some((t) => t.id === id))
    throw new TeacherStorageError("Teacher not found.");
  writeAll(list.filter((t) => t.id !== id));
}

export async function bulkChangeStatus(ids, status) {
  if (!TEACHER_STATUSES.includes(status))
    throw new TeacherStorageError("Invalid status.");
  await delay(250);
  const set = new Set(ids);
  const stamp = nowIso();
  let count = 0;
  const next = readAll().map((t) => {
    if (!set.has(t.id) || t.archived) return t;
    count += 1;
    return { ...t, status, updatedAt: stamp };
  });
  writeAll(next);
  return count;
}

export async function bulkArchive(ids) {
  await delay(250);
  const set = new Set(ids);
  const stamp = nowIso();
  let count = 0;
  const next = readAll().map((t) => {
    if (!set.has(t.id) || t.archived) return t;
    count += 1;
    return { ...t, archived: true, updatedAt: stamp };
  });
  writeAll(next);
  return count;
}

/* ------------------------------ statistics + export ------------------------------ */

/** Pure calculation over the given list (archived teachers are excluded). */
export function getTeacherStatistics(teachers = readAll()) {
  const live = teachers.filter((t) => !t.archived);
  return {
    total: live.length,
    active: live.filter((t) => t.status === "Active").length,
    onLeave: live.filter((t) => t.status === "On Leave").length,
    inactive: live.filter((t) => t.status === "Inactive").length,
    male: live.filter((t) => t.gender === "Male").length,
    female: live.filter((t) => t.gender === "Female").length,
    archived: teachers.length - live.length,
  };
}

const csvCell = (value) => {
  let text = String(value ?? "");
  // Neutralise spreadsheet formula injection while keeping normal phone numbers intact.
  if (
    /^[=@\t\r]/.test(text) ||
    (/^[+-]/.test(text) && !/^[+-]?[\d\s()-]+$/.test(text))
  )
    text = `'${text}`;
  return `"${text.replace(/"/g, '""')}"`;
};

export function buildTeachersCsv(teachers) {
  const header = [
    "Teacher ID",
    "Full Name",
    "Gender",
    "Email",
    "Phone",
    "Department",
    "Subject",
    "Qualification",
    "Experience (years)",
    "Joining Date",
    "Employment Type",
    "Employment Status",
    "Archived",
  ];
  const rows = teachers.map((t) => [
    t.id,
    [t.firstName, t.middleName, t.lastName].filter(Boolean).join(" "),
    t.gender,
    t.email,
    t.phone,
    t.department,
    t.subject,
    t.qualification,
    t.experienceYears,
    t.joiningDate,
    t.employmentType,
    t.status,
    t.archived ? "Yes" : "No",
  ]);
  return [header, ...rows].map((r) => r.map(csvCell).join(",")).join("\r\n");
}

/** Builds a CSV and triggers a browser download. Returns the number of exported rows. */
export function exportTeachersToCSV(
  teachers,
  filename = `teachers-report-${new Date().getFullYear()}.csv`,
) {
  if (!Array.isArray(teachers) || teachers.length === 0)
    throw new Error("There are no teachers to export.");
  const blob = new Blob(["\uFEFF", buildTeachersCsv(teachers)], {
    type: "text/csv;charset=utf-8;",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  return teachers.length;
}
