// Frontend-only staff service backed by localStorage (key: "sms_staff").
// STAFF = NON-TEACHING employees only. Teachers are stored by the separate Teachers module.
// Every storage function is async so it can be swapped for Express/MySQL API calls later.
import {
  SAMPLE_STAFF,
  DEPARTMENTS,
  EMPLOYMENT_TYPES,
  STAFF_STATUSES,
  QUALIFICATIONS,
} from "../data/staffSampleData";

export const STORAGE_KEY = "sms_staff";
const HISTORY_LIMIT = 100;

export class StaffStorageError extends Error {
  constructor(message, { corrupted = false } = {}) {
    super(message);
    this.name = "StaffStorageError";
    this.corrupted = corrupted;
  }
}

export class StaffValidationError extends Error {
  constructor(errors) {
    super("Please correct the highlighted fields.");
    this.name = "StaffValidationError";
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
    throw new StaffStorageError(
      "Could not save staff data. Browser storage may be full or blocked.",
    );
  }
}

function readAll() {
  let raw;
  try {
    raw = localStorage.getItem(STORAGE_KEY);
  } catch {
    throw new StaffStorageError(
      "Browser storage is not available. Check your browser privacy settings.",
    );
  }
  if (raw === null) {
    // First run only: the key does not exist yet. Existing data is never replaced.
    const seeded = clone(SAMPLE_STAFF);
    writeAll(seeded);
    return seeded;
  }
  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new StaffStorageError(
      "Saved staff data is corrupted and could not be read.",
      { corrupted: true },
    );
  }
  if (!Array.isArray(parsed) || !parsed.every(isUsableRecord)) {
    throw new StaffStorageError("Saved staff data has an unexpected format.", {
      corrupted: true,
    });
  }
  return parsed;
}

/** Backs up unreadable data under a new key, then restores the sample data. */
export async function resetCorruptedStorage() {
  await delay();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw !== null)
      localStorage.setItem(`${STORAGE_KEY}_backup_${Date.now()}`, raw);
  } catch {
    throw new StaffStorageError(
      "Could not back up the corrupted data, so it was left untouched.",
    );
  }
  writeAll(clone(SAMPLE_STAFF));
  return clone(SAMPLE_STAFF);
}

/** Loads demo employees, but only when there are no staff records at all. */
export async function restoreSampleStaff() {
  await delay();
  if (readAll().length > 0)
    throw new StaffStorageError(
      "Staff records already exist, so sample data was not added.",
    );
  writeAll(clone(SAMPLE_STAFF));
  return clone(SAMPLE_STAFF);
}

/* ------------------------------ validation ------------------------------ */

const PHONE_RE = /^(\+251|0)?[79]\d{8}$/;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const ID_RE = /^[A-Za-z0-9-]{4,24}$/;
const TEACHER_TITLE_RE = /\b(teacher|instructor|lecturer)\b/i;
const cleanPhone = (v) => String(v ?? "").replace(/[\s()-]/g, "");
const toNumber = (v) =>
  v === "" || v === null || v === undefined ? "" : Number(v);
const validDate = (s) =>
  /^\d{4}-\d{2}-\d{2}$/.test(s) &&
  !Number.isNaN(new Date(`${s}T00:00:00`).getTime());

export function calculateAge(dateStr, ref = new Date()) {
  if (!validDate(dateStr)) return null;
  const d = new Date(`${dateStr}T00:00:00`);
  let age = ref.getFullYear() - d.getFullYear();
  if (
    ref.getMonth() < d.getMonth() ||
    (ref.getMonth() === d.getMonth() && ref.getDate() < d.getDate())
  )
    age -= 1;
  return age;
}

export function normalizeStaffInput(input) {
  const out = { ...input };
  Object.keys(out).forEach((k) => {
    if (typeof out[k] === "string") out[k] = out[k].trim();
  });
  out.phone = cleanPhone(out.phone);
  out.emergencyPhone = cleanPhone(out.emergencyPhone);
  out.graduationYear = toNumber(out.graduationYear);
  out.salary = toNumber(out.salary);
  return out;
}

/** Returns { field: message }. An empty object means the record is valid. */
export function validateStaff(data, existing = [], { currentId = null } = {}) {
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
  need("id", "Employee ID is required.");
  need("department", "Select a department.");
  need("jobTitle", "Job title is required.");
  need("employmentType", "Select an employment type.");
  need("status", "Select an employment status.");
  need("joiningDate", "Joining date is required.");
  need("qualification", "Select the highest qualification.");

  if (data.gender && !["Male", "Female"].includes(data.gender))
    e.gender = "Select a valid gender.";
  if (data.department && !DEPARTMENTS.includes(data.department))
    e.department = "Select a valid department.";
  if (data.employmentType && !EMPLOYMENT_TYPES.includes(data.employmentType))
    e.employmentType = "Select a valid employment type.";
  if (data.status && !STAFF_STATUSES.includes(data.status))
    e.status = "Select a valid status.";
  if (data.qualification && !QUALIFICATIONS.includes(data.qualification))
    e.qualification = "Select a valid qualification.";

  if (data.jobTitle && !e.jobTitle) {
    if (data.jobTitle.length > 60)
      e.jobTitle = "Job title is too long (60 characters max).";
    else if (TEACHER_TITLE_RE.test(data.jobTitle))
      e.jobTitle = "Teaching roles belong in Teachers Management, not Staff.";
  }
  if (data.id && !e.id) {
    if (!ID_RE.test(data.id)) e.id = "Use 4-24 letters, numbers or hyphens.";
    else if (
      existing.some(
        (s) =>
          s.id.toLowerCase() === data.id.toLowerCase() && s.id !== currentId,
      )
    )
      e.id = "This Employee ID already exists.";
  }
  if (data.email && !EMAIL_RE.test(data.email))
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
    else if (age < 18 || age > 70)
      e.dateOfBirth = "Employee must be between 18 and 70 years old.";
  }
  if (data.joiningDate && !e.joiningDate) {
    if (!validDate(data.joiningDate)) e.joiningDate = "Enter a valid date.";
    else if (
      data.joiningDate >
      new Date(Date.now() + 366 * 864e5).toISOString().slice(0, 10)
    )
      e.joiningDate = "Joining date is too far in the future.";
    else if (
      data.dateOfBirth &&
      !e.dateOfBirth &&
      calculateAge(data.dateOfBirth, new Date(`${data.joiningDate}T00:00:00`)) <
        18
    )
      e.joiningDate = "Employee must be at least 18 on the joining date.";
  }
  if (data.graduationYear !== "" && data.graduationYear !== undefined) {
    const birthYear = data.dateOfBirth
      ? Number(data.dateOfBirth.slice(0, 4))
      : 1950;
    if (
      !Number.isInteger(data.graduationYear) ||
      data.graduationYear < Math.max(1960, birthYear + 14) ||
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

  // contract dates
  if (data.contractStart && !validDate(data.contractStart))
    e.contractStart = "Enter a valid date.";
  if (data.contractEnd && !validDate(data.contractEnd))
    e.contractEnd = "Enter a valid date.";
  if (data.employmentType === "Contract") {
    if (!data.contractStart)
      e.contractStart =
        e.contractStart ||
        "Contract start date is required for contract staff.";
    if (!data.contractEnd)
      e.contractEnd =
        e.contractEnd || "Contract end date is required for contract staff.";
  }
  if (
    data.contractStart &&
    data.contractEnd &&
    !e.contractStart &&
    !e.contractEnd &&
    data.contractEnd < data.contractStart
  )
    e.contractEnd = "Contract end must be on or after the start date.";

  return e;
}

export function generateStaffId(list, year = new Date().getFullYear()) {
  const prefix = `STF-${year}-`;
  const max = list
    .filter((s) => s.id.startsWith(prefix))
    .reduce(
      (m, s) => Math.max(m, parseInt(s.id.slice(prefix.length), 10) || 0),
      0,
    );
  return `${prefix}${String(max + 1).padStart(4, "0")}`;
}

/* ------------------------------ history ------------------------------ */

const withHistory = (record, ...actions) => ({
  ...record,
  history: [
    ...(Array.isArray(record.history) ? record.history : []),
    ...actions.map((action) => ({ at: nowIso(), action })),
  ].slice(-HISTORY_LIMIT),
});

function describeChanges(before, after) {
  const notes = [];
  if (before.status !== after.status)
    notes.push(`Status changed: ${before.status} to ${after.status}`);
  if (before.department !== after.department)
    notes.push(
      `Department changed: ${before.department} to ${after.department}`,
    );
  if (before.jobTitle !== after.jobTitle)
    notes.push(`Job title changed: ${before.jobTitle} to ${after.jobTitle}`);
  if (before.employmentType !== after.employmentType)
    notes.push(
      `Employment type changed: ${before.employmentType} to ${after.employmentType}`,
    );
  return notes;
}

/* ------------------------------ public CRUD API ------------------------------ */

export async function getStaff() {
  await delay();
  return readAll();
}

export async function getStaffById(id) {
  await delay(80);
  const found = readAll().find((s) => s.id === id);
  if (!found) throw new StaffStorageError("Employee not found.");
  return found;
}

export async function addStaff(employee) {
  await delay(300);
  const list = readAll();
  const data = normalizeStaffInput(employee);
  if (!data.id) data.id = generateStaffId(list);
  const errors = validateStaff(data, list);
  if (Object.keys(errors).length) throw new StaffValidationError(errors);
  const stamp = nowIso();
  const record = withHistory(
    {
      ...data,
      archived: false,
      history: [],
      createdAt: stamp,
      updatedAt: stamp,
    },
    `Joined as ${data.jobTitle} (${data.department})`,
  );
  writeAll([record, ...list]);
  return record;
}

export async function updateStaff(id, updatedData) {
  await delay(300);
  const list = readAll();
  const index = list.findIndex((s) => s.id === id);
  if (index === -1)
    throw new StaffStorageError(
      "Employee not found. The record may have been deleted.",
    );
  const before = list[index];
  const merged = normalizeStaffInput({
    ...before,
    ...updatedData,
    id,
    history: before.history,
  });
  const errors = validateStaff(merged, list, { currentId: id });
  if (Object.keys(errors).length) throw new StaffValidationError(errors);
  const record = withHistory(
    { ...merged, updatedAt: nowIso() },
    ...describeChanges(before, merged),
  );
  list[index] = record;
  writeAll(list);
  return record;
}

export async function changeStaffStatus(id, status) {
  if (!STAFF_STATUSES.includes(status))
    throw new StaffStorageError("Invalid status.");
  await delay(200);
  const list = readAll();
  const index = list.findIndex((s) => s.id === id);
  if (index === -1) throw new StaffStorageError("Employee not found.");
  const before = list[index];
  list[index] = withHistory(
    { ...before, status, updatedAt: nowIso() },
    `Status changed: ${before.status} to ${status}`,
  );
  writeAll(list);
  return list[index];
}

export async function archiveStaff(id) {
  await delay(200);
  const list = readAll();
  const index = list.findIndex((s) => s.id === id);
  if (index === -1) throw new StaffStorageError("Employee not found.");
  list[index] = withHistory(
    { ...list[index], archived: true, updatedAt: nowIso() },
    "Archived",
  );
  writeAll(list);
  return list[index];
}

export async function restoreStaff(id) {
  await delay(200);
  const list = readAll();
  const index = list.findIndex((s) => s.id === id);
  if (index === -1) throw new StaffStorageError("Employee not found.");
  list[index] = withHistory(
    { ...list[index], archived: false, updatedAt: nowIso() },
    "Restored from archive",
  );
  writeAll(list);
  return list[index];
}

export async function deleteStaff(id) {
  await delay(250);
  const list = readAll();
  if (!list.some((s) => s.id === id))
    throw new StaffStorageError("Employee not found.");
  writeAll(list.filter((s) => s.id !== id));
}

export async function bulkChangeStatus(ids, status) {
  if (!STAFF_STATUSES.includes(status))
    throw new StaffStorageError("Invalid status.");
  await delay(250);
  const set = new Set(ids);
  let count = 0;
  const next = readAll().map((s) => {
    if (!set.has(s.id) || s.archived || s.status === status) return s;
    count += 1;
    return withHistory(
      { ...s, status, updatedAt: nowIso() },
      `Status changed: ${s.status} to ${status}`,
    );
  });
  writeAll(next);
  return count;
}

export async function bulkArchive(ids) {
  await delay(250);
  const set = new Set(ids);
  let count = 0;
  const next = readAll().map((s) => {
    if (!set.has(s.id) || s.archived) return s;
    count += 1;
    return withHistory(
      { ...s, archived: true, updatedAt: nowIso() },
      "Archived",
    );
  });
  writeAll(next);
  return count;
}

/* ------------------------------ analytics ------------------------------ */

/** Pure calculation over the given list; archived employees are excluded. */
export function getStaffStatistics(staff = readAll()) {
  const live = staff.filter((s) => !s.archived);
  const cutoff = new Date(Date.now() - 90 * 864e5).toISOString().slice(0, 10);
  const today = todayStr();
  const staffed = new Set(live.map((s) => s.department).filter(Boolean));
  return {
    total: live.length,
    active: live.filter((s) => s.status === "Active").length,
    onLeave: live.filter((s) => s.status === "On Leave").length,
    inactive: live.filter((s) => s.status === "Inactive").length,
    newHires: live.filter(
      (s) => s.joiningDate >= cutoff && s.joiningDate <= today,
    ).length,
    departmentsStaffed: staffed.size,
    departmentsTotal: DEPARTMENTS.length,
    male: live.filter((s) => s.gender === "Male").length,
    female: live.filter((s) => s.gender === "Female").length,
    fullTime: live.filter((s) => s.employmentType === "Full-time").length,
    partTime: live.filter((s) => s.employmentType === "Part-time").length,
    contract: live.filter((s) => s.employmentType === "Contract").length,
    archived: staff.length - live.length,
  };
}

/** Headcount per department (archived excluded), largest first. */
export function getDepartmentDistribution(staff = readAll()) {
  const live = staff.filter((s) => !s.archived);
  const known = [
    ...new Set([
      ...DEPARTMENTS,
      ...live.map((s) => s.department).filter(Boolean),
    ]),
  ];
  return known
    .map((department) => {
      const count = live.filter((s) => s.department === department).length;
      return {
        department,
        count,
        percent: live.length ? Math.round((count / live.length) * 100) : 0,
      };
    })
    .sort(
      (a, b) => b.count - a.count || a.department.localeCompare(b.department),
    );
}

/* ------------------------------ CSV export ------------------------------ */

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

/** Salary and other sensitive administrative fields are deliberately NOT exported. */
export function buildStaffCsv(records) {
  const header = [
    "Employee ID",
    "Full Name",
    "Department",
    "Job Title",
    "Gender",
    "Email",
    "Phone",
    "Employment Type",
    "Joining Date",
    "Employment Status",
    "Archived",
  ];
  const rows = records.map((s) => [
    s.id,
    [s.firstName, s.middleName, s.lastName].filter(Boolean).join(" "),
    s.department,
    s.jobTitle,
    s.gender,
    s.email,
    s.phone,
    s.employmentType,
    s.joiningDate,
    s.status,
    s.archived ? "Yes" : "No",
  ]);
  return [header, ...rows].map((r) => r.map(csvCell).join(",")).join("\r\n");
}

/** Builds a CSV and triggers a download. Returns the number of exported rows. */
export function exportStaffToCSV(
  records,
  filename = `school-workforce-report-${new Date().getFullYear()}.csv`,
) {
  if (!Array.isArray(records) || records.length === 0)
    throw new Error("There are no employees to export.");
  const blob = new Blob(["\uFEFF", buildStaffCsv(records)], {
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
  return records.length;
}
