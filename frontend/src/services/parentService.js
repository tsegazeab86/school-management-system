/**
 * parentService.js
 * ---------------------------------------------------------------------------
 * All Parent Management business logic lives here. The UI never touches
 * localStorage directly.
 *
 * STORAGE
 *   sms_parents          -> array of parent records            (shared with your existing parent storage)
 *   sms_parent_students  -> array of parent<->student links    (many-to-many)
 *   sms_students         -> READ ONLY. Your existing student registry. Never written here.
 *
 * DESIGN RULES
 *   - One parent registry: this service reads/writes `sms_parents`. It does not create a second one.
 *   - Existing records are never overwritten. Unknown fields on existing records are preserved.
 *   - Demo data is seeded only when `sms_parents` is missing or empty.
 *   - Corrupted storage is NEVER hidden: a ParentStorageError is thrown and the UI shows it.
 *   - Deleting a parent never deletes students. Only that parent's links are removed.
 *
 * BACKEND MIGRATION
 *   Every exported function is a thin boundary. To move to Express/MySQL, keep the
 *   signatures and replace the bodies with fetch() calls (and make them async).
 *   See the notes at the bottom of this file.
 */

import {
  SAMPLE_STUDENTS,
  SAMPLE_PARENT_LINKS,
  buildSampleParents,
} from "../data/parentSampleData";

/* ------------------------------- Constants -------------------------------- */

export const STORAGE_KEYS = Object.freeze({
  parents: "sms_parents",
  links: "sms_parent_students",
  students: "sms_students", // existing student registry. If yours uses another key, change it here only.
});

export const RELATIONSHIPS = [
  { value: "father", label: "Father" },
  { value: "mother", label: "Mother" },
  { value: "guardian", label: "Guardian" },
  { value: "other", label: "Other" },
];

export const STATUSES = [
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
  { value: "archived", label: "Archived" },
];

export const GENDERS = ["Male", "Female"];
export const MARITAL_STATUSES = [
  "Married",
  "Single",
  "Divorced",
  "Widowed",
  "Separated",
];
export const COMMUNICATION_PREFERENCES = [
  "Phone call",
  "SMS",
  "Email",
  "In person",
];

export const SORT_OPTIONS = [
  { value: "name", label: "Name" },
  { value: "id", label: "Parent ID" },
  { value: "registrationDate", label: "Registration date" },
  { value: "childCount", label: "Linked students" },
  { value: "relationship", label: "Relationship" },
  { value: "status", label: "Status" },
];

/* -------------------------------- Errors ---------------------------------- */

export class ParentStorageError extends Error {
  constructor(message, { key = null, cause = null, raw = null } = {}) {
    super(message);
    this.name = "ParentStorageError";
    this.key = key;
    this.cause = cause;
    this.raw = raw;
  }
}

export class ParentValidationError extends Error {
  /** @param {Record<string,string>} errors field -> message. `_form` is a general message. */
  constructor(errors) {
    super(Object.values(errors)[0] || "Validation failed.");
    this.name = "ParentValidationError";
    this.errors = errors;
  }
}

/* ------------------------------ Small helpers ----------------------------- */

export const todayISO = () => new Date().toISOString().slice(0, 10);
const nowISO = () => new Date().toISOString();

export const getFullName = (p) =>
  [p?.firstName, p?.middleName, p?.lastName]
    .map((s) => String(s || "").trim())
    .filter(Boolean)
    .join(" ");

/** Ethiopian academic year starts in September. */
export function getAcademicYearLabel(date = new Date()) {
  const y = date.getMonth() >= 8 ? date.getFullYear() : date.getFullYear() - 1;
  return `${y}/${String((y + 1) % 100).padStart(2, "0")}`;
}

/** "+251 911 234 567", "0911234567", "251911234567" -> "0911234567" */
export function normalizePhone(value) {
  let v = String(value || "").replace(/[^\d+]/g, "");
  if (v.startsWith("+251")) v = `0${v.slice(4)}`;
  else if (v.startsWith("251") && v.length === 12) v = `0${v.slice(3)}`;
  return v;
}

/** Number suitable for a tel: link, e.g. +251911234567 */
export function toDialable(value) {
  const n = normalizePhone(value);
  return /^0\d{9}$/.test(n)
    ? `+251${n.slice(1)}`
    : String(value || "").replace(/[^\d+]/g, "");
}

const PHONE_RE = /^0\d{9}$/;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const isValidPhone = (v) => PHONE_RE.test(normalizePhone(v));
const linkIdOf = (parentId, studentId) => `LNK-${parentId}-${studentId}`;

const normalizeRelationship = (value) => {
  const v = String(value || "")
    .trim()
    .toLowerCase();
  return RELATIONSHIPS.some((r) => r.value === v) ? v : "other";
};

const normalizeStatus = (value) => {
  const v = String(value || "")
    .trim()
    .toLowerCase();
  return STATUSES.some((s) => s.value === v) ? v : "active";
};

/* -------------------------- Raw storage (explicit) ------------------------ */

function readStored(key) {
  let raw;
  try {
    raw = window.localStorage.getItem(key);
  } catch (cause) {
    throw new ParentStorageError(
      `Browser storage is blocked or unavailable (${key}).`,
      { key, cause },
    );
  }
  if (raw === null) return { exists: false, value: null, raw: null };
  try {
    return { exists: true, value: JSON.parse(raw), raw };
  } catch (cause) {
    throw new ParentStorageError(
      `The data saved under "${key}" is not valid JSON, so it was not loaded.`,
      { key, cause, raw },
    );
  }
}

function writeStored(key, value) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch (cause) {
    throw new ParentStorageError(
      `Could not save "${key}". Storage may be full or blocked.`,
      { key, cause },
    );
  }
}

function readArray(key) {
  const { exists, value, raw } = readStored(key);
  if (exists && !Array.isArray(value)) {
    throw new ParentStorageError(
      `The data saved under "${key}" should be a list but is not.`,
      { key, raw },
    );
  }
  return { exists, list: exists ? value : [] };
}

function restoreRaw(key, raw) {
  try {
    if (raw === null) window.localStorage.removeItem(key);
    else window.localStorage.setItem(key, raw);
  } catch (e) {
    e.message = `Could not restore "${key}" to its previous state. ${e.message}`;
    /* best effort   */
  }
}

/** Writes parents and/or links; if the second write fails, restores the first. */
function commit({ parents, links }) {
  const before = {
    parents: window.localStorage.getItem(STORAGE_KEYS.parents),
    links: window.localStorage.getItem(STORAGE_KEYS.links),
  };
  try {
    if (parents) writeStored(STORAGE_KEYS.parents, parents);
    if (links) writeStored(STORAGE_KEYS.links, links);
  } catch (err) {
    restoreRaw(STORAGE_KEYS.parents, before.parents);
    restoreRaw(STORAGE_KEYS.links, before.links);
    throw err;
  }
}

/**
 * Explicit recovery for corrupted storage: copies the raw text to a backup key,
 * then removes the broken key. Only call this after the administrator confirms.
 */
export function backupAndResetStorageKey(key) {
  if (
    !Object.values(STORAGE_KEYS).includes(key) ||
    key === STORAGE_KEYS.students
  ) {
    throw new ParentStorageError(
      "This storage key cannot be reset from the Parent module.",
      { key },
    );
  }
  const raw = window.localStorage.getItem(key);
  const backupKey = `${key}__corrupt_backup_${Date.now()}`;
  if (raw !== null) writeStored(backupKey, { rawText: raw });
  window.localStorage.removeItem(key);
  return backupKey;
}

/* -------------------------------- Students -------------------------------- */

export function normalizeStudent(raw) {
  if (!raw || typeof raw !== "object") return null;
  const id = String(raw.id ?? raw.studentId ?? raw.student_id ?? "").trim();
  if (!id) return null;
  let firstName = raw.firstName ?? raw.first_name ?? "";
  let middleName = raw.middleName ?? raw.middle_name ?? "";
  let lastName = raw.lastName ?? raw.last_name ?? "";
  if (!firstName && !lastName) {
    const parts = String(raw.fullName ?? raw.name ?? "")
      .trim()
      .split(/\s+/)
      .filter(Boolean);
    const rest = parts.slice(1);
    firstName = parts[0] || "";
    lastName = rest.pop() || "";
    middleName = rest.join(" ");
  }
  const student = {
    id,
    firstName: String(firstName),
    middleName: String(middleName),
    lastName: String(lastName),
    gender: raw.gender || "",
    grade: String(raw.grade ?? raw.gradeLevel ?? raw.class ?? ""),
    section: String(raw.section ?? ""),
    photoUrl: raw.photoUrl || raw.photo || "",
  };
  student.fullName = getFullName(student) || id;
  return student;
}

/** Read-only. Real registry first; the bundled demo students only when the registry is empty. */
export function getStudents() {
  const { list } = readArray(STORAGE_KEYS.students);
  const real = list.map(normalizeStudent).filter(Boolean);
  if (real.length) return real;
  return SAMPLE_STUDENTS.map(normalizeStudent);
}

export function getStudentSource() {
  const { list } = readArray(STORAGE_KEYS.students);
  return list.map(normalizeStudent).filter(Boolean).length
    ? "registry"
    : "sample";
}

/* -------------------------------- Parents --------------------------------- */

export function normalizeParent(raw) {
  if (!raw || typeof raw !== "object") return null;
  const id = String(raw.id ?? raw.parentId ?? "").trim();
  if (!id) return null;
  const ec =
    raw.emergencyContact && typeof raw.emergencyContact === "object"
      ? raw.emergencyContact
      : {};
  const parent = {
    ...raw, // keep unknown fields from an existing parentStorage.js implementation
    id,
    firstName: String(raw.firstName ?? raw.first_name ?? "").trim(),
    middleName: String(raw.middleName ?? raw.middle_name ?? "").trim(),
    lastName: String(raw.lastName ?? raw.last_name ?? "").trim(),
    gender: raw.gender || "",
    dateOfBirth: raw.dateOfBirth || "",
    phone: String(raw.phone ?? "").trim(),
    altPhone: String(raw.altPhone ?? "").trim(),
    email: String(raw.email ?? "").trim(),
    address: String(raw.address ?? "").trim(),
    city: String(raw.city ?? "").trim(),
    occupation: String(raw.occupation ?? "").trim(),
    photoUrl: String(raw.photoUrl ?? "").trim(),
    relationship: normalizeRelationship(raw.relationship),
    relationshipNotes: String(raw.relationshipNotes ?? ""),
    maritalStatus: raw.maritalStatus || "",
    communicationPreference: raw.communicationPreference || "",
    lastContactDate: raw.lastContactDate || "",
    emergencyContact: {
      name: String(ec.name ?? ""),
      relationship: String(ec.relationship ?? ""),
      phone: String(ec.phone ?? ""),
      address: String(ec.address ?? ""),
    },
    registrationDate:
      raw.registrationDate ||
      String(raw.createdAt || "").slice(0, 10) ||
      todayISO(),
    status: normalizeStatus(raw.status),
    notes: String(raw.notes ?? ""),
    createdAt: raw.createdAt || nowISO(),
    updatedAt: raw.updatedAt || raw.createdAt || nowISO(),
  };
  parent.fullName = getFullName(parent) || parent.id;
  return parent;
}

function loadParents() {
  const { list } = readArray(STORAGE_KEYS.parents);
  const seen = new Set();
  const out = [];
  list.forEach((r) => {
    const p = normalizeParent(r);
    if (p && !seen.has(p.id)) {
      seen.add(p.id);
      out.push(p);
    }
  });
  return out;
}

function loadLinks() {
  const { list } = readArray(STORAGE_KEYS.links);
  const seen = new Set();
  const out = [];
  list.forEach((l) => {
    if (!l || !l.parentId || !l.studentId) return;
    const key = `${l.parentId}|${l.studentId}`;
    if (seen.has(key)) return; // a duplicate parent-student link is never kept
    seen.add(key);
    out.push({
      id: l.id || linkIdOf(l.parentId, l.studentId),
      parentId: String(l.parentId),
      studentId: String(l.studentId),
      relationship: normalizeRelationship(l.relationship),
      isPrimary: Boolean(l.isPrimary),
      createdAt: l.createdAt || nowISO(),
    });
  });
  return out;
}

/** Idempotent. Seeds demo data only if there are no usable parent records. */
export function initializeParentStorage() {
  const parents = readArray(STORAGE_KEYS.parents);
  const links = readArray(STORAGE_KEYS.links);
  const usable = parents.list.some((r) => normalizeParent(r));
  let seeded = false;

  if (!usable) {
    writeStored(STORAGE_KEYS.parents, buildSampleParents());
    seeded = true;
  }
  if (!links.exists || (seeded && links.list.length === 0)) {
    let seedLinks = [];
    if (seeded) {
      const studentIds = new Set(getStudents().map((s) => s.id));
      const stamp = nowISO();
      seedLinks = SAMPLE_PARENT_LINKS.filter(([, sid]) =>
        studentIds.has(sid),
      ).map(([parentId, studentId, relationship, isPrimary]) => ({
        id: linkIdOf(parentId, studentId),
        parentId,
        studentId,
        relationship,
        isPrimary,
        createdAt: stamp,
      }));
    }
    writeStored(STORAGE_KEYS.links, seedLinks);
  }
  return { seeded };
}

export function getParents() {
  initializeParentStorage();
  return loadParents();
}

export function getParentById(id) {
  return getParents().find((p) => p.id === id) || null;
}

function nextParentId(parents) {
  const year = new Date().getFullYear();
  const prefix = `PAR-${year}-`;
  const max = parents.reduce((m, p) => {
    if (!p.id.startsWith(prefix)) return m;
    const n = parseInt(p.id.slice(prefix.length), 10);
    return Number.isFinite(n) ? Math.max(m, n) : m;
  }, 0);
  return `${prefix}${String(max + 1).padStart(4, "0")}`;
}

/* ------------------------------- Validation ------------------------------- */

export function validateParent(data) {
  const e = {};
  const req = (key, label) => {
    if (!String(data[key] ?? "").trim()) e[key] = `${label} is required.`;
  };
  req("firstName", "First name");
  req("lastName", "Last name");
  req("gender", "Gender");
  req("relationship", "Relationship");
  req("phone", "Phone number");
  req("registrationDate", "Registration date");
  req("status", "Status");

  if (data.phone && !e.phone && !isValidPhone(data.phone)) {
    e.phone =
      "Enter a valid Ethiopian number, for example +251 911 234 567 or 0911234567.";
  }
  if (data.altPhone && !isValidPhone(data.altPhone))
    e.altPhone = "Enter a valid Ethiopian number or leave this blank.";
  if (data.email && !EMAIL_RE.test(String(data.email).trim()))
    e.email = "Enter a valid email address, for example name@example.com.";
  const ecPhone = data.emergencyContact?.phone;
  if (ecPhone && !isValidPhone(ecPhone))
    e.emergencyPhone = "Enter a valid Ethiopian number or leave this blank.";
  if (data.dateOfBirth && data.dateOfBirth > todayISO())
    e.dateOfBirth = "Date of birth cannot be in the future.";
  if (
    data.photoUrl &&
    !/^(https?:\/\/|data:image\/)/i.test(String(data.photoUrl).trim())
  ) {
    e.photoUrl = "Use a link that starts with http:// or https://.";
  }
  if (
    data.relationship &&
    !RELATIONSHIPS.some((r) => r.value === data.relationship)
  )
    e.relationship = "Choose a relationship.";
  return e;
}

function findDuplicate(candidate, parents, ignoreId = null) {
  const errors = {};
  const email = String(candidate.email || "")
    .trim()
    .toLowerCase();
  const phone = normalizePhone(candidate.phone);
  const name = getFullName(candidate).toLowerCase();
  parents.forEach((p) => {
    if (p.id === ignoreId) return;
    if (email && p.email.toLowerCase() === email)
      errors.email = `This email is already used by ${p.fullName} (${p.id}).`;
    if (phone && normalizePhone(p.phone) === phone)
      errors.phone = `This phone number is already used by ${p.fullName} (${p.id}).`;
    if (
      name &&
      p.fullName.toLowerCase() === name &&
      candidate.dateOfBirth &&
      p.dateOfBirth === candidate.dateOfBirth
    ) {
      errors.firstName = `${p.fullName} (${p.id}) already exists with the same date of birth.`;
    }
  });
  return errors;
}

function validateLinkInputs(links, students) {
  const ids = new Set();
  const known = new Set(students.map((s) => s.id));
  links.forEach((l) => {
    if (!known.has(l.studentId))
      throw new ParentValidationError({
        students: `Student ${l.studentId} was not found in the student registry.`,
      });
    if (ids.has(l.studentId))
      throw new ParentValidationError({
        students:
          "The same student is linked twice. Remove the duplicate link.",
      });
    ids.add(l.studentId);
  });
}

/* --------------------------- Link rules (pure) ---------------------------- */

/** Guarantees exactly one primary guardian for each listed student that has at least one link. */
function ensurePrimary(links, studentIds) {
  const next = links.map((l) => ({ ...l }));
  [...new Set(studentIds)].forEach((sid) => {
    const group = next.filter((l) => l.studentId === sid);
    if (!group.length) return;
    const primaries = group.filter((l) => l.isPrimary);
    if (primaries.length === 0) {
      group.sort((a, b) =>
        String(a.createdAt).localeCompare(String(b.createdAt)),
      );
      group[0].isPrimary = true;
    } else if (primaries.length > 1) {
      primaries.slice(1).forEach((l) => {
        l.isPrimary = false;
      });
    }
  });
  return next;
}

function applyLink(links, { parentId, studentId, relationship, isPrimary }) {
  if (links.some((l) => l.parentId === parentId && l.studentId === studentId)) {
    throw new ParentValidationError({
      _form: "This student is already linked to this parent.",
    });
  }
  const next = links.map((l) =>
    isPrimary && l.studentId === studentId ? { ...l, isPrimary: false } : l,
  );
  next.push({
    id: linkIdOf(parentId, studentId),
    parentId,
    studentId,
    relationship: normalizeRelationship(relationship),
    isPrimary: Boolean(isPrimary),
    createdAt: nowISO(),
  });
  return ensurePrimary(next, [studentId]);
}

/* ------------------------------ Parent CRUD ------------------------------- */

/**
 * @param {object} parent  parent fields (id optional)
 * @param {Array<{studentId, relationship, isPrimary}>} links  optional student links
 */
export function addParent(parent, links = []) {
  initializeParentStorage();
  const parents = loadParents();
  const candidate = normalizeParent({ ...parent, id: "pending" });
  const errors = { ...validateParent(candidate) };
  Object.entries(findDuplicate(candidate, parents)).forEach(([k, v]) => {
    if (!errors[k]) errors[k] = v;
  });
  if (Object.keys(errors).length) throw new ParentValidationError(errors);
  validateLinkInputs(links, getStudents());

  const stamp = nowISO();
  const record = {
    ...candidate,
    id: nextParentId(parents),
    createdAt: stamp,
    updatedAt: stamp,
  };
  delete record.fullName;
  let nextLinks = loadLinks();
  links.forEach((l) => {
    nextLinks = applyLink(nextLinks, { parentId: record.id, ...l });
  });
  commit({ parents: [...parents, record], links: nextLinks });
  return normalizeParent(record);
}

export function updateParent(id, updatedData, links) {
  initializeParentStorage();
  const parents = loadParents();
  const idx = parents.findIndex((p) => p.id === id);
  if (idx === -1)
    throw new ParentValidationError({ _form: `Parent ${id} was not found.` });

  const merged = normalizeParent({
    ...parents[idx],
    ...updatedData,
    id,
    updatedAt: nowISO(),
  });
  const errors = { ...validateParent(merged) };
  Object.entries(findDuplicate(merged, parents, id)).forEach(([k, v]) => {
    if (!errors[k]) errors[k] = v;
  });
  if (Object.keys(errors).length) throw new ParentValidationError(errors);

  let allLinks = loadLinks();
  if (Array.isArray(links)) {
    validateLinkInputs(links, getStudents());
    const before = allLinks.filter((l) => l.parentId === id);
    const keep = new Map(before.map((l) => [l.studentId, l]));
    const affected = [
      ...before.map((l) => l.studentId),
      ...links.map((l) => l.studentId),
    ];
    let next = allLinks.filter((l) => l.parentId !== id);
    links.forEach((l) => {
      next = applyLink(next, { parentId: id, ...l });
      const old = keep.get(l.studentId);
      if (old)
        next = next.map((x) =>
          x.parentId === id && x.studentId === l.studentId
            ? { ...x, createdAt: old.createdAt }
            : x,
        );
    });
    allLinks = ensurePrimary(next, affected);
  }

  const record = { ...merged };
  delete record.fullName;
  const nextParents = parents.map((p, i) => {
    if (i !== idx) return p;
    return record;
  });
  commit({
    parents: nextParents,
    links: Array.isArray(links) ? allLinks : undefined,
  });
  return normalizeParent(record);
}

/** Removes the parent and ONLY that parent's links. Student records are untouched. */
export function deleteParent(id) {
  const parents = loadParents();
  if (!parents.some((p) => p.id === id))
    throw new ParentValidationError({ _form: `Parent ${id} was not found.` });
  const links = loadLinks();
  const removed = links.filter((l) => l.parentId === id);
  const remaining = ensurePrimary(
    links.filter((l) => l.parentId !== id),
    removed.map((l) => l.studentId),
  );
  commit({ parents: parents.filter((p) => p.id !== id), links: remaining });
  return {
    removedLinks: removed.length,
    affectedStudents: removed.map((l) => l.studentId),
  };
}

export function changeParentStatus(id, status) {
  return bulkChangeParentStatus([id], status)[0];
}

export function archiveParent(id) {
  return changeParentStatus(id, "archived");
}

export function bulkChangeParentStatus(ids, status) {
  if (!STATUSES.some((s) => s.value === status))
    throw new ParentValidationError({ _form: "Unknown status." });
  const set = new Set(ids);
  const parents = loadParents();
  const stamp = nowISO();
  let changed = 0;
  const next = parents.map((p) => {
    if (!set.has(p.id)) return p;
    changed += 1;
    const r = { ...p, status, updatedAt: stamp };
    delete r.fullName;
    return r;
  });
  if (!changed)
    throw new ParentValidationError({
      _form: "No matching parents were found.",
    });
  commit({ parents: next });
  return next.filter((p) => set.has(p.id)).map(normalizeParent);
}

/* ------------------------- Parent <-> student links ----------------------- */

export function linkStudentToParent(
  parentId,
  studentId,
  relationship = "guardian",
  isPrimary = false,
) {
  if (!loadParents().some((p) => p.id === parentId))
    throw new ParentValidationError({ _form: "Parent not found." });
  if (!getStudents().some((s) => s.id === studentId))
    throw new ParentValidationError({
      _form: "Student not found in the student registry.",
    });
  commit({
    links: applyLink(loadLinks(), {
      parentId,
      studentId,
      relationship,
      isPrimary,
    }),
  });
}

export function unlinkStudentFromParent(parentId, studentId) {
  const links = loadLinks();
  if (
    !links.some((l) => l.parentId === parentId && l.studentId === studentId)
  ) {
    throw new ParentValidationError({
      _form: "That relationship no longer exists.",
    });
  }
  commit({
    links: ensurePrimary(
      links.filter(
        (l) => !(l.parentId === parentId && l.studentId === studentId),
      ),
      [studentId],
    ),
  });
}

export function updateLinkRelationship(parentId, studentId, relationship) {
  const links = loadLinks();
  if (
    !links.some((l) => l.parentId === parentId && l.studentId === studentId)
  ) {
    throw new ParentValidationError({
      _form: "That relationship no longer exists.",
    });
  }
  commit({
    links: links.map((l) =>
      l.parentId === parentId && l.studentId === studentId
        ? { ...l, relationship: normalizeRelationship(relationship) }
        : l,
    ),
  });
}

/** Makes this parent the single primary guardian of the student. */
export function setPrimaryGuardian(parentId, studentId) {
  const links = loadLinks();
  if (
    !links.some((l) => l.parentId === parentId && l.studentId === studentId)
  ) {
    throw new ParentValidationError({
      _form:
        "Link the student to this parent before choosing a primary guardian.",
    });
  }
  commit({
    links: links.map((l) =>
      l.studentId === studentId
        ? { ...l, isPrimary: l.parentId === parentId }
        : l,
    ),
  });
}

export function getParentStudents(parentId) {
  const students = new Map(getStudents().map((s) => [s.id, s]));
  return loadLinks()
    .filter((l) => l.parentId === parentId && students.has(l.studentId))
    .map((link) => ({ student: students.get(link.studentId), link }));
}

export function getStudentParents(studentId) {
  const parents = new Map(loadParents().map((p) => [p.id, p]));
  return loadLinks()
    .filter((l) => l.studentId === studentId && parents.has(l.parentId))
    .map((link) => ({ parent: parents.get(link.parentId), link }));
}

/* -------------------------- Snapshot + derived data ----------------------- */

/** One consistent read of everything the page needs. */
export function getSnapshot() {
  initializeParentStorage();
  return {
    parents: loadParents(),
    links: loadLinks(),
    students: getStudents(),
    studentSource: getStudentSource(),
  };
}

/** Adds fullName, children[], childCount, isPrimaryGuardian and a search index to each parent. */
export function enrichParents(snapshot) {
  if (!snapshot) return [];
  const studentMap = new Map(snapshot.students.map((s) => [s.id, s]));
  const byParent = new Map();
  snapshot.links.forEach((link) => {
    const student = studentMap.get(link.studentId);
    if (!student) return;
    if (!byParent.has(link.parentId)) byParent.set(link.parentId, []);
    byParent.get(link.parentId).push({ student, link });
  });
  return snapshot.parents.map((p) => {
    const children = (byParent.get(p.id) || []).sort((a, b) =>
      a.student.fullName.localeCompare(b.student.fullName),
    );
    const phones = [p.phone, p.altPhone].filter(Boolean);
    const text = [
      p.fullName,
      p.id,
      p.email,
      p.phone,
      p.altPhone,
      ...children.map((c) => `${c.student.fullName} ${c.student.id}`),
    ]
      .join(" ")
      .toLowerCase();
    const digits = phones
      .map(
        (ph) =>
          `${normalizePhone(ph)} ${normalizePhone(ph).replace(/^0/, "251")}`,
      )
      .join(" ");
    return {
      ...p,
      children,
      childCount: children.length,
      isPrimaryGuardian: children.some((c) => c.link.isPrimary),
      _text: text,
      _digits: digits,
    };
  });
}

export const EMPTY_FILTERS = Object.freeze({
  query: "",
  relationship: "all",
  gender: "all",
  status: "all",
  children: "all",
  primary: "all",
  dateFrom: "",
  dateTo: "",
});

export function filterParents(enriched, f = EMPTY_FILTERS) {
  const q = String(f.query || "")
    .trim()
    .toLowerCase();
  const qDigits = q.replace(/[\s\-()+]/g, "");
  return enriched.filter((p) => {
    if (f.status === "all" ? p.status === "archived" : p.status !== f.status)
      return false;
    if (f.relationship !== "all" && p.relationship !== f.relationship)
      return false;
    if (f.gender !== "all" && p.gender !== f.gender) return false;
    if (f.primary === "primary" && !p.isPrimaryGuardian) return false;
    if (f.primary === "not-primary" && p.isPrimaryGuardian) return false;
    if (f.children === "none" && p.childCount !== 0) return false;
    if (f.children === "1" && p.childCount !== 1) return false;
    if (f.children === "2" && p.childCount !== 2) return false;
    if (f.children === "3plus" && p.childCount < 3) return false;
    if (f.dateFrom && (p.registrationDate || "") < f.dateFrom) return false;
    if (f.dateTo && (p.registrationDate || "") > f.dateTo) return false;
    if (q) {
      const hit =
        p._text.includes(q) ||
        (qDigits.length >= 3 &&
          /^\d+$/.test(qDigits) &&
          p._digits.includes(qDigits.replace(/^251/, "0")));
      if (!hit) return false;
    }
    return true;
  });
}

export function sortParents(list, key = "name", dir = "asc") {
  const m = dir === "desc" ? -1 : 1;
  const value = (p) => {
    switch (key) {
      case "id":
        return p.id;
      case "phone":
        return normalizePhone(p.phone);
      case "email":
        return (p.email || "").toLowerCase();
      case "childCount":
        return p.childCount;
      case "registrationDate":
        return p.registrationDate || "";
      case "relationship":
        return p.relationship;
      case "status":
        return p.status;
      default:
        return p.fullName.toLowerCase();
    }
  };
  return [...list].sort((a, b) => {
    const x = value(a);
    const y = value(b);
    const c =
      typeof x === "number" && typeof y === "number"
        ? x - y
        : String(x).localeCompare(String(y), undefined, { numeric: true });
    return (c || a.id.localeCompare(b.id)) * m;
  });
}

/** Search by name, ID, phone, email, student name or student ID. */
export function searchParents(query, snapshot = getSnapshot()) {
  return filterParents(enrichParents(snapshot), {
    ...EMPTY_FILTERS,
    status: "all",
    query,
  });
}

/* -------------------------------- Statistics ------------------------------ */

export function getParentStatistics(snapshot) {
  const empty = {
    total: 0,
    active: 0,
    inactive: 0,
    archived: 0,
    guardians: 0,
    fathers: 0,
    mothers: 0,
    linkedStudents: 0,
    totalStudents: 0,
    unlinkedStudents: 0,
    recent: 0,
    latestName: "",
    families: 0,
    activeRate: 0,
    coverage: 0,
  };
  if (!snapshot) return empty;

  // De-duplicate by ID so a repeated record is never counted twice.
  const unique = [...new Map(snapshot.parents.map((p) => [p.id, p])).values()];
  const live = unique.filter((p) => p.status !== "archived");
  const liveIds = new Set(live.map((p) => p.id));
  const studentIds = new Set(snapshot.students.map((s) => s.id));

  const linkedSet = new Set();
  snapshot.links.forEach((l) => {
    if (liveIds.has(l.parentId) && studentIds.has(l.studentId))
      linkedSet.add(l.studentId);
  });

  // Families = connected groups of parents who share at least one student.
  const root = new Map(live.map((p) => [p.id, p.id]));
  const find = (x) => {
    let r = x;
    while (root.get(r) !== r) r = root.get(r);
    root.set(x, r);
    return r;
  };
  const firstParentOfStudent = new Map();
  snapshot.links.forEach((l) => {
    if (!liveIds.has(l.parentId)) return;
    const seen = firstParentOfStudent.get(l.studentId);
    if (!seen) firstParentOfStudent.set(l.studentId, l.parentId);
    else root.set(find(l.parentId), find(seen));
  });
  const families = new Set(live.map((p) => find(p.id))).size;

  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - 30);
  const cutoffISO = cutoff.toISOString().slice(0, 10);
  const recentList = live
    .filter((p) => (p.registrationDate || "") >= cutoffISO)
    .sort((a, b) => b.registrationDate.localeCompare(a.registrationDate));

  const active = live.filter((p) => p.status === "active").length;
  return {
    total: live.length,
    active,
    inactive: live.filter((p) => p.status === "inactive").length,
    archived: unique.length - live.length,
    guardians: live.filter((p) => p.relationship === "guardian").length,
    fathers: live.filter((p) => p.relationship === "father").length,
    mothers: live.filter((p) => p.relationship === "mother").length,
    linkedStudents: linkedSet.size,
    totalStudents: studentIds.size,
    unlinkedStudents: studentIds.size - linkedSet.size,
    recent: recentList.length,
    latestName: recentList[0]?.fullName || "",
    families,
    activeRate: live.length ? Math.round((active / live.length) * 100) : 0,
    coverage: studentIds.size
      ? Math.round((linkedSet.size / studentIds.size) * 100)
      : 0,
  };
}

/* ------------------------------------ CSV --------------------------------- */

const csvCell = (value) => {
  let s = String(value ?? "");
  if (/^[=@]/.test(s)) s = `'${s}`; // blocks spreadsheet formula injection
  return /[",\r\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};

export function getExportFilename(date = new Date()) {
  return `school-parent-report-${date.getFullYear()}.csv`;
}

export function buildParentsCSV(records) {
  const rel = (v) => RELATIONSHIPS.find((r) => r.value === v)?.label || v;
  const header = [
    "Parent ID",
    "Full Name",
    "Relationship",
    "Phone",
    "Email",
    "Occupation",
    "Linked Students",
    "Registration Date",
    "Status",
  ];
  const rows = records.map((p) => [
    p.id,
    p.fullName || getFullName(p),
    rel(p.relationship),
    p.phone,
    p.email,
    p.occupation,
    (p.children || [])
      .map((c) => `${c.student.fullName} (${c.student.id})`)
      .join("; "),
    p.registrationDate,
    p.status,
  ]);
  return [header, ...rows].map((r) => r.map(csvCell).join(",")).join("\r\n");
}

/** `records` are enriched parents (see enrichParents). Triggers a browser download. */
export function exportParentsToCSV(
  records,
  { filename = getExportFilename() } = {},
) {
  if (!records || !records.length)
    throw new ParentValidationError({
      _form: "There are no parents to export.",
    });
  const blob = new Blob([`\uFEFF${buildParentsCSV(records)}`], {
    type: "text/csv;charset=utf-8;",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  return { filename, count: records.length };
}
