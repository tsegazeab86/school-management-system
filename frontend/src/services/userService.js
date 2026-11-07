/**
 * userService.js
 * Location: frontend/src/services/userService.js
 *
 * User ACCOUNT management (login identities + access), kept separate from profiles.
 *
 *  - Accounts live in `sms_users`. Profiles (students / teachers / staff / parents) are READ-ONLY here;
 *    an account stores only { profileType, profileId } and never copies or creates profile data.
 *  - Roles + permission defaults come from userSampleData.js. Edited permission sets are stored in
 *    `sms_role_permissions`. THIS IS NOT SECURITY: the backend must enforce authorization.
 *  - Passwords are never created, stored, displayed or logged here. Credentials / invitations / password
 *    resets need a backend. This service only records local, clearly labelled requests.
 *  - Every mutation takes an `actor` (the signed-in admin). Replace getCurrentActor() with your AuthContext user.
 *  - Audit events go to `sms_user_audit_log` (local demo log) and to an optional sink: setAuditSink(fn).
 *
 * Every function is synchronous and easy to replace with API calls (the UI awaits them).
 */

import {
  ROLES, ROLE_GROUPS, PERMISSION_MODULES, PERMISSION_ACTIONS, ALL_PERMISSION_KEYS,
  buildDefaultRolePermissions, buildSampleUsers, DEMO_PROFILES,
} from '../data/userSampleData';

export { ROLES, ROLE_GROUPS, PERMISSION_MODULES, PERMISSION_ACTIONS };

/* ------------------------------------------------------------------ */
/* Constants                                                           */
/* ------------------------------------------------------------------ */

export const STORAGE_KEYS = Object.freeze({
  USERS: 'sms_users',
  ROLE_PERMS: 'sms_role_permissions',
  AUDIT: 'sms_user_audit_log',
  SEEDED: 'sms_users_seeded',
  ACTOR: 'sms_current_user', // optional: { id, name, role/roleId } written by your login flow
});

/** Adjust these keys if your profile modules store data elsewhere. Profiles are only ever READ. */
export const PROFILE_SOURCES = Object.freeze({
  student: 'sms_students',
  teacher: 'sms_teachers',
  staff: 'sms_staff',
  parent: 'sms_parents',
});

export const USER_STATUSES = ['Active', 'Pending', 'Suspended', 'Inactive'];
export const PROFILE_TYPES = ['student', 'teacher', 'staff', 'parent'];
export const PROFILE_TYPE_LABELS = { student: 'Student', teacher: 'Teacher', staff: 'Staff', parent: 'Parent' };

export const AUDIT_ACTIONS = Object.freeze({
  user_created: 'User created',
  user_updated: 'User updated',
  role_changed: 'Role changed',
  permission_changed: 'Permission changed',
  account_activated: 'Account activated',
  account_deactivated: 'Account deactivated',
  account_suspended: 'Account suspended',
  account_reactivated: 'Account reactivated',
  profile_linked: 'Profile linked',
  profile_unlinked: 'Profile unlinked',
  password_reset_requested: 'Password reset requested',
  account_deleted: 'Account deleted',
});

export class UserServiceError extends Error {
  constructor(message, { code = 'ERROR', errors = {}, cause } = {}) {
    super(message);
    this.name = 'UserServiceError';
    this.code = code;
    this.errors = errors;
    this.cause = cause;
  }
}

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

const isObj = (v) => v !== null && typeof v === 'object' && !Array.isArray(v);
const str = (v) => (v === null || v === undefined ? '' : String(v));
const trim = (v) => str(v).trim();
const nowISO = () => new Date().toISOString();
const newId = (p) => `${p}_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
const roleById = (id) => ROLES.find((r) => r.id === id) || null;
export const getRoles = () => ROLES;
export const getRole = roleById;
export const getUserFullName = (u) => [u?.firstName, u?.middleName, u?.lastName].map(trim).filter(Boolean).join(' ');

export const toDateInputValue = (d = new Date()) => {
  const p = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
};

/* ------------------------------------------------------------------ */
/* Storage                                                             */
/* ------------------------------------------------------------------ */

function readArray(key) {
  let raw;
  try { raw = window.localStorage.getItem(key); } catch (cause) {
    throw new UserServiceError(`Browser storage is not accessible (${key}).`, { code: 'STORAGE_UNAVAILABLE', cause });
  }
  if (raw === null || raw === '') return null;
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) throw new Error('Expected a JSON array.');
    return parsed;
  } catch (cause) {
    throw new UserServiceError(
      `Stored data in "${key}" is corrupted. It was NOT modified or replaced with sample data. Inspect it in DevTools > Application > Local Storage.`,
      { code: 'STORAGE_CORRUPTED', cause },
    );
  }
}

function writeArray(key, value) {
  try { window.localStorage.setItem(key, JSON.stringify(value)); } catch (cause) {
    throw new UserServiceError(`Could not save to browser storage (${key}). It may be full or blocked.`, { code: 'STORAGE_WRITE_FAILED', cause });
  }
}

/* ------------------------------------------------------------------ */
/* Normalisation                                                       */
/* ------------------------------------------------------------------ */

const SENSITIVE = /^(password|passwordhash|password_hash|passwd|token|accesstoken|refreshtoken|secret|twofactorsecret|otp)$/i;

const ROLE_ALIASES = {
  admin: 'administrator', superadmin: 'super_admin', super_administrator: 'super_admin', vice: 'vice_principal',
  laboratory_technician: 'lab_technician', lab_tech: 'lab_technician', hr: 'hr_officer', hr_manager: 'hr_officer', staff: 'other_staff',
};

export function normalizeRoleId(raw) {
  const v = trim(raw?.roleId || raw?.role).toLowerCase().replace(/[\s-]+/g, '_');
  if (roleById(v)) return v;
  if (ROLE_ALIASES[v]) return ROLE_ALIASES[v];
  const byName = ROLES.find((r) => r.name.toLowerCase().replace(/[\s-]+/g, '_') === v);
  return byName ? byName.id : 'other_staff';
}

export function normalizeUser(raw, index = 0) {
  const r = isObj(raw) ? raw : {};
  let firstName = trim(r.firstName);
  let middleName = trim(r.middleName);
  let lastName = trim(r.lastName);
  if (!firstName && !lastName) {
    const parts = trim(r.fullName || r.name).split(/\s+/).filter(Boolean);
    firstName = parts[0] || '';
    lastName = parts.length > 1 ? parts[parts.length - 1] : '';
    middleName = parts.slice(1, -1).join(' ');
  }
  const status = USER_STATUSES.find((s) => s.toLowerCase() === trim(r.status).toLowerCase()) || (r.isActive === false ? 'Inactive' : 'Active');
  const profileType = PROFILE_TYPES.includes(trim(r.profileType)) ? trim(r.profileType) : '';
  const hasSecret = Boolean(r.password || r.passwordHash || r.password_hash);
  return {
    ...r,
    id: trim(r.id || r._id) || trim(r.username) || `legacy-user-${index}`,
    userId: trim(r.userId),
    firstName, middleName, lastName,
    username: trim(r.username),
    email: trim(r.email),
    phone: trim(r.phone || r.phoneNumber),
    roleId: normalizeRoleId(r),
    status,
    profileType,
    profileId: profileType ? trim(r.profileId) : '',
    createdAt: trim(r.createdAt),
    updatedAt: trim(r.updatedAt),
    lastLoginAt: trim(r.lastLoginAt || r.lastLogin),
    createdBy: trim(r.createdBy),
    updatedBy: trim(r.updatedBy),
    notes: trim(r.notes),
    passwordStatus: trim(r.passwordStatus) || (hasSecret ? 'set' : 'not_set'),
  };
}

/** Removes secrets before anything reaches the UI. */
function toPublic(u) {
  const out = {};
  Object.keys(u).forEach((k) => { if (!SENSITIVE.test(k)) out[k] = u[k]; });
  out.fullName = getUserFullName(u);
  return out;
}

function readUsers() {
  return (readArray(STORAGE_KEYS.USERS) || []).map(normalizeUser);
}

/* ------------------------------------------------------------------ */
/* Profiles (read-only)                                                */
/* ------------------------------------------------------------------ */

function normalizeProfile(type, raw, index) {
  const r = isObj(raw) ? raw : {};
  const id = trim(r.id || r._id || r.studentId || r.teacherId || r.staffId || r.parentId || r.employeeId);
  if (!id) return null;
  let first = trim(r.firstName), middle = trim(r.middleName), last = trim(r.lastName);
  if (!first && !last) {
    const parts = trim(r.fullName || r.name).split(/\s+/).filter(Boolean);
    first = parts[0] || `Profile ${index + 1}`;
    last = parts.length > 1 ? parts[parts.length - 1] : '';
    middle = parts.slice(1, -1).join(' ');
  }
  const display = trim(r.studentId || r.teacherId || r.staffId || r.employeeId || r.parentId || r.id) || id;
  let detail = '';
  if (type === 'student') {
    const g = trim(r.grade ?? r.gradeLevel ?? r.class ?? r.className);
    const s = trim(r.section);
    detail = g || s ? `${/^\d+$/.test(g) ? `Grade ${g}` : g}${s}` : '';
  } else if (type === 'parent') detail = trim(r.relationship);
  else detail = trim(r.department || r.subject || r.position || r.designation);
  return { type, id, profileId: display, firstName: first, middleName: middle, lastName: last, fullName: [first, middle, last].filter(Boolean).join(' '), detail, isDemo: false };
}

/** Real profiles when the source key has records; otherwise in-memory demo profiles (clearly flagged). */
export function getProfiles() {
  const out = {};
  PROFILE_TYPES.forEach((type) => {
    const raw = readArray(PROFILE_SOURCES[type]);
    const list = (raw || []).map((r, i) => normalizeProfile(type, r, i)).filter(Boolean);
    out[type] = list.length ? list : DEMO_PROFILES[type];
  });
  return out;
}

/* ------------------------------------------------------------------ */
/* Roles & permissions                                                 */
/* ------------------------------------------------------------------ */

const VALID_KEYS = new Set(ALL_PERMISSION_KEYS);

export function getRolePermissions() {
  const map = buildDefaultRolePermissions();
  (readArray(STORAGE_KEYS.ROLE_PERMS) || []).forEach((r) => {
    if (r && map[r.roleId] && Array.isArray(r.permissions)) map[r.roleId] = r.permissions.filter((k) => VALID_KEYS.has(k));
  });
  map.super_admin = [...ALL_PERMISSION_KEYS];
  return map;
}

const hasPermission = (rolePermissions, roleId, key) => (rolePermissions[roleId] || []).includes(key);

/** Roles this actor may assign (never above their own level unless Super Admin). */
export function getAssignableRoles(actor) {
  const actorRole = roleById(actor?.roleId);
  if (!actorRole) return [];
  if (actorRole.id === 'super_admin') return ROLES;
  return ROLES.filter((r) => r.level < actorRole.level);
}

/* ------------------------------------------------------------------ */
/* Actor + guards (advisory - the backend must enforce for real)       */
/* ------------------------------------------------------------------ */

export const DEMO_ACTOR = Object.freeze({ id: 'demo-actor', name: 'Demo Super Admin', roleId: 'super_admin', isDemo: true });

/** Replace with your AuthContext user: pass `currentUser` to <ManageUsers /> instead. */
export function getCurrentActor() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEYS.ACTOR);
    if (raw) {
      const a = JSON.parse(raw);
      if (isObj(a) && (a.id || a.username)) {
        return { id: trim(a.id || a.username), name: trim(a.name || getUserFullName(a) || a.username), roleId: normalizeRoleId(a), isDemo: false };
      }
    }
  } catch (e) { /* fall through to demo actor */ }
  return DEMO_ACTOR;
}

const ACTION_PERMISSION = {
  view: 'users.read', create: 'users.create', edit: 'users.update', change_role: 'users.update', change_status: 'users.update',
  link_profile: 'users.update', reset_password: 'users.update', delete: 'users.delete',
};

function activeSuperAdmins(users) {
  return users.filter((u) => u.roleId === 'super_admin' && u.status === 'Active');
}

/**
 * Returns { allowed, reason }. `ctx` = { users, rolePermissions }.
 * Rules: permission to act, no acting on equal/higher roles, no self-lockout,
 * and the last active Super Admin cannot be deleted, suspended, deactivated or demoted.
 */
export function checkUserAction(actor, action, target, ctx, newStatus) {
  const deny = (reason) => ({ allowed: false, reason });
  const actorRole = roleById(actor?.roleId);
  if (!actorRole) return deny('Your role is not recognised.');
  const perm = ACTION_PERMISSION[action];
  if (perm && !hasPermission(ctx.rolePermissions, actor.roleId, perm)) return deny(`Your role lacks the "${perm}" permission.`);
  if (action === 'create' || action === 'view' || !target) return { allowed: true, reason: '' };

  const targetRole = roleById(target.roleId);
  if (actorRole.id !== 'super_admin' && targetRole && targetRole.level >= actorRole.level) {
    return deny('You cannot manage accounts with a role equal to or above your own.');
  }
  const self = actor.id && actor.id === target.id;
  const destructive = action === 'delete' || action === 'change_role' || (action === 'change_status' && newStatus && newStatus !== 'Active' && newStatus !== 'Pending');
  if (self && (action === 'delete' || (action === 'change_status' && newStatus && newStatus !== 'Active'))) return deny('You cannot delete, suspend or deactivate your own account.');
  if (self && action === 'change_role') return deny('You cannot change your own role.');
  if (destructive && target.roleId === 'super_admin' && target.status === 'Active') {
    const others = activeSuperAdmins(ctx.users).filter((u) => u.id !== target.id);
    if (!others.length) return deny('This is the last active Super Admin. Create or activate another Super Admin first.');
  }
  return { allowed: true, reason: '' };
}

function assertAllowed(actor, action, target, ctx, newStatus) {
  const r = checkUserAction(actor, action, target, ctx, newStatus);
  if (!r.allowed) throw new UserServiceError(r.reason, { code: 'FORBIDDEN' });
}

const ctxNow = () => ({ users: readUsers(), rolePermissions: getRolePermissions() });

function assertRoleAssignable(actor, roleId) {
  if (!roleById(roleId)) throw new UserServiceError('Select a valid role.', { code: 'VALIDATION', errors: { roleId: 'Select a valid role.' } });
  if (!getAssignableRoles(actor).some((r) => r.id === roleId)) {
    throw new UserServiceError('You cannot assign a role at or above your own authority.', { code: 'FORBIDDEN', errors: { roleId: 'You cannot assign this role.' } });
  }
}

/* ------------------------------------------------------------------ */
/* Audit log                                                           */
/* ------------------------------------------------------------------ */

let auditSink = null;
/** Integration point: setAuditSink((event) => auditApi.post(event)). Errors in the sink never break the UI. */
export function setAuditSink(fn) { auditSink = typeof fn === 'function' ? fn : null; }

function redact(v) {
  if (Array.isArray(v)) return v.map(redact);
  if (isObj(v)) {
    const o = {};
    Object.keys(v).forEach((k) => { o[k] = SENSITIVE.test(k) ? '[redacted]' : redact(v[k]); });
    return o;
  }
  return v;
}

function appendAudit(actor, action, target, description, previousValue = null, newValue = null) {
  const event = {
    id: newId('aud'), timestamp: nowISO(),
    actorId: actor?.id || '', actorName: actor?.name || 'Unknown',
    action, targetUserId: target?.id || '', targetName: target ? getUserFullName(target) : '',
    description, previousValue: redact(previousValue), newValue: redact(newValue),
  };
  const log = readArray(STORAGE_KEYS.AUDIT) || [];
  writeArray(STORAGE_KEYS.AUDIT, [event, ...log].slice(0, 500));
  if (auditSink) { try { auditSink(event); } catch (e) { /* sink failures are non-fatal */ } }
  return event;
}

export function getAuditLog() {
  return (readArray(STORAGE_KEYS.AUDIT) || []).filter(isObj);
}
 
export function initializeUserData() {
  const existing = readArray(STORAGE_KEYS.USERS);
  let seeded = false;
  try { seeded = window.localStorage.getItem(STORAGE_KEYS.SEEDED) === '1'; } catch (e) { seeded = true; }
  if ((existing === null || existing.length === 0) && !seeded) {
    writeArray(STORAGE_KEYS.USERS, buildSampleUsers(new Date()));
    try { window.localStorage.setItem(STORAGE_KEYS.SEEDED, '1'); } catch (e) { /* non-fatal */ }
    return { seeded: true };
  }
  return { seeded: false };
}

export function getUsers() { return readUsers().map(toPublic); }
export function getUserById(id) { const u = readUsers().find((x) => x.id === id || x.userId === id); return u ? toPublic(u) : null; }

export function getSnapshot() {
  return {
    users: getUsers(),
    profiles: getProfiles(),
    rolePermissions: getRolePermissions(),
    audit: getAuditLog(),
    loadedAt: nowISO(),
  };
}

/* ------------------------------------------------------------------ */
/* Validation                                                          */
/* ------------------------------------------------------------------ */

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const USERNAME_RE = /^[a-z0-9][a-z0-9._-]{2,29}$/;
const cleanPhone = (v) => str(v).replace(/[\s\-().]/g, '');
export const isValidPhone = (v) => /^(\+251|251|0)?[79]\d{8}$/.test(cleanPhone(v)) || /^(\+251|251|0)?[1-5]\d{8}$/.test(cleanPhone(v));

function validateUser(d, { excludeId = null, users, profiles }) {
  const e = {};
  if (!trim(d.firstName)) e.firstName = 'First name is required.';
  if (!trim(d.lastName)) e.lastName = 'Last name is required.';
  const username = trim(d.username).toLowerCase();
  if (!username) e.username = 'Username is required.';
  else if (!USERNAME_RE.test(username)) e.username = 'Use 3-30 lowercase letters, numbers, dots, dashes or underscores.';
  else if (users.some((u) => u.id !== excludeId && u.username.toLowerCase() === username)) e.username = 'This username is already taken.';
  if (!trim(d.email)) e.email = 'Email is required.';
  else if (!EMAIL_RE.test(trim(d.email))) e.email = 'Enter a valid email address.';
  else if (users.some((u) => u.id !== excludeId && u.email.toLowerCase() === trim(d.email).toLowerCase())) e.email = 'This email is already used by another account.';
  if (trim(d.phone) && !isValidPhone(d.phone)) e.phone = 'Enter a valid Ethiopian phone number (e.g. +251 911 234 567).';
  if (!roleById(trim(d.roleId))) e.roleId = 'Select a valid role.';
  if (!USER_STATUSES.includes(trim(d.status))) e.status = 'Select a valid status.';

  const type = trim(d.profileType);
  const pid = trim(d.profileId);
  if (type || pid) {
    const role = roleById(trim(d.roleId));
    if (!PROFILE_TYPES.includes(type)) e.profileType = 'Select a valid profile type.';
    else if (!pid) e.profileId = 'Select the profile to link.';
    else if (role && !role.profileTypes.includes(type)) e.profileType = `${role.name} accounts can only link to: ${role.profileTypes.map((t) => PROFILE_TYPE_LABELS[t]).join(', ')}.`;
    else if (!(profiles[type] || []).some((p) => p.id === pid)) e.profileId = 'That profile does not exist. Choose an existing profile.';
    else {
      const holder = users.find((u) => u.id !== excludeId && u.profileType === type && u.profileId === pid);
      if (holder) e.profileId = `This profile is already linked to account "${holder.username}".`;
    }
  }
  return e;
}

const vErr = (errors, msg = 'Please correct the highlighted fields.') => new UserServiceError(msg, { code: 'VALIDATION', errors });

/* ------------------------------------------------------------------ */
/* Mutations                                                           */
/* ------------------------------------------------------------------ */

const EDITABLE = ['firstName', 'middleName', 'lastName', 'username', 'email', 'phone', 'roleId', 'status', 'profileType', 'profileId', 'notes'];
const pick = (d) => { const o = {}; EDITABLE.forEach((k) => { if (d[k] !== undefined) o[k] = trim(d[k]); }); if (o.username) o.username = o.username.toLowerCase(); return o; };

function nextUserId(users) {
  const year = new Date().getFullYear();
  let max = 0;
  users.forEach((u) => { const m = /^USR-(\d{4})-(\d+)$/.exec(u.userId || ''); if (m && Number(m[1]) === year) max = Math.max(max, Number(m[2])); });
  return `USR-${year}-${String(max + 1).padStart(4, '0')}`;
}

const statusAuditAction = (from, to) => {
  if (to === 'Suspended') return 'account_suspended';
  if (to === 'Inactive') return 'account_deactivated';
  if (to === 'Active') return from === 'Pending' ? 'account_activated' : 'account_reactivated';
  return 'user_updated';
};

/**
 * Creates an ACCOUNT only. `profileType/profileId` must reference an existing profile - no profile is created.
 * No password is accepted or stored. setupMode: 'invitation' (queued, nothing is emailed) | 'later'.
 */
export function addUser(data, actor, { setupMode = 'later' } = {}) {
  const ctx = ctxNow();
  assertAllowed(actor, 'create', null, ctx);
  const profiles = getProfiles();
  const clean = pick(data);
  const errors = validateUser(clean, { users: ctx.users, profiles });
  if (Object.keys(errors).length) throw vErr(errors);
  assertRoleAssignable(actor, clean.roleId);

  const now = nowISO();
  const record = normalizeUser({
    ...clean,
    id: newId('usr'), userId: nextUserId(ctx.users),
    passwordStatus: setupMode === 'invitation' ? 'invitation_pending' : 'not_set',
    createdAt: now, updatedAt: now, lastLoginAt: '', createdBy: actor.name, updatedBy: actor.name,
  }, ctx.users.length);
  const stored = readArray(STORAGE_KEYS.USERS) || [];
  writeArray(STORAGE_KEYS.USERS, [...stored, record]);
  appendAudit(actor, 'user_created', record, `Account "${record.username}" created with role ${roleById(record.roleId).name}.`, null, { role: record.roleId, status: record.status, profile: record.profileType ? `${record.profileType}:${record.profileId}` : null });
  if (record.profileType) appendAudit(actor, 'profile_linked', record, `Linked to ${PROFILE_TYPE_LABELS[record.profileType]} profile ${record.profileId}.`, null, { profileType: record.profileType, profileId: record.profileId });
  return toPublic(record);
}

export function updateUser(id, data, actor) {
  const ctx = ctxNow();
  const profiles = getProfiles();
  const raw = readArray(STORAGE_KEYS.USERS) || [];
  const idx = ctx.users.findIndex((u) => u.id === id);
  if (idx < 0) throw new UserServiceError('Account not found.', { code: 'NOT_FOUND' });
  const before = ctx.users[idx];
  const changes = pick(data);
  const merged = { ...before, ...changes };
  if (merged.profileType === '') merged.profileId = '';

  const errors = validateUser(merged, { excludeId: id, users: ctx.users, profiles });
  if (Object.keys(errors).length) throw vErr(errors);

  const roleChanged = merged.roleId !== before.roleId;
  const statusChanged = merged.status !== before.status;
  const profileChanged = merged.profileType !== before.profileType || merged.profileId !== before.profileId;
  const basicFields = ['firstName', 'middleName', 'lastName', 'username', 'email', 'phone', 'notes'].filter((k) => merged[k] !== before[k]);

  if (basicFields.length) assertAllowed(actor, 'edit', before, ctx);
  if (roleChanged) { assertAllowed(actor, 'change_role', before, ctx); assertRoleAssignable(actor, merged.roleId); }
  if (statusChanged) assertAllowed(actor, 'change_status', before, ctx, merged.status);
  if (profileChanged) assertAllowed(actor, 'link_profile', before, ctx);
  if (!basicFields.length && !roleChanged && !statusChanged && !profileChanged) return toPublic(before);

  const next = { ...before, ...changes, profileId: merged.profileId, updatedAt: nowISO(), updatedBy: actor.name };
  // Preserve every untouched legacy field (including any secrets) by merging into the stored record.
  const storedIdx = raw.findIndex((r, i) => normalizeUser(r, i).id === id);
  const updatedRaw = { ...(raw[storedIdx] || {}), ...next };
  const list = raw.slice();
  list[storedIdx] = updatedRaw;
  writeArray(STORAGE_KEYS.USERS, list);

  if (basicFields.length) appendAudit(actor, 'user_updated', next, `Updated ${basicFields.join(', ')}.`, Object.fromEntries(basicFields.map((k) => [k, before[k]])), Object.fromEntries(basicFields.map((k) => [k, next[k]])));
  if (roleChanged) appendAudit(actor, 'role_changed', next, `Role changed from ${roleById(before.roleId)?.name} to ${roleById(next.roleId)?.name}.`, { role: before.roleId }, { role: next.roleId });
  if (statusChanged) appendAudit(actor, statusAuditAction(before.status, next.status), next, `Status changed from ${before.status} to ${next.status}.`, { status: before.status }, { status: next.status });
  if (profileChanged) {
    if (before.profileType) appendAudit(actor, 'profile_unlinked', next, `Unlinked ${PROFILE_TYPE_LABELS[before.profileType]} profile ${before.profileId}.`, { profileType: before.profileType, profileId: before.profileId }, null);
    if (next.profileType) appendAudit(actor, 'profile_linked', next, `Linked to ${PROFILE_TYPE_LABELS[next.profileType]} profile ${next.profileId}.`, null, { profileType: next.profileType, profileId: next.profileId });
  }
  return toPublic(next);
}

export const changeUserRole = (id, roleId, actor) => updateUser(id, { roleId }, actor);
export const changeUserStatus = (id, status, actor) => updateUser(id, { status }, actor);
export const linkProfile = (id, profileType, profileId, actor) => updateUser(id, { profileType, profileId }, actor);
export const unlinkProfile = (id, actor) => updateUser(id, { profileType: '', profileId: '' }, actor);

function bulk(ids, actor, fn) {
  const changed = [];
  const skipped = [];
  ids.forEach((id) => {
    try { fn(id); changed.push(id); } catch (err) {
      const u = readUsers().find((x) => x.id === id);
      skipped.push({ id, name: u ? getUserFullName(u) : id, reason: err.message });
    }
  });
  return { changed, skipped };
}

/** Every account is checked individually, so bulk actions can never bypass the rules above. */
export const bulkChangeStatus = (ids, status, actor) => bulk(ids, actor, (id) => changeUserStatus(id, status, actor));
export const bulkChangeRole = (ids, roleId, actor) => bulk(ids, actor, (id) => changeUserRole(id, roleId, actor));

/**
 * DEMO ONLY: records a password-reset request locally. No email is sent and no password is changed.
 * Connect this to your backend (POST /auth/password-reset) to make it real.
 */
export function requestPasswordReset(id, actor) {
  const ctx = ctxNow();
  const user = ctx.users.find((u) => u.id === id);
  if (!user) throw new UserServiceError('Account not found.', { code: 'NOT_FOUND' });
  assertAllowed(actor, 'reset_password', user, ctx);
  return appendAudit(actor, 'password_reset_requested', user, 'Password reset requested (recorded locally; no email sent, no password changed).', null, null);
}

/** Deletes the ACCOUNT only. Student / teacher / staff / parent profiles and relationships are untouched. */
export function deleteUser(id, actor) {
  const ctx = ctxNow();
  const user = ctx.users.find((u) => u.id === id);
  if (!user) throw new UserServiceError('Account not found.', { code: 'NOT_FOUND' });
  assertAllowed(actor, 'delete', user, ctx);
  const raw = readArray(STORAGE_KEYS.USERS) || [];
  writeArray(STORAGE_KEYS.USERS, raw.filter((r, i) => normalizeUser(r, i).id !== id));
  appendAudit(actor, 'account_deleted', user, `Account "${user.username}" deleted. Linked profile (if any) was not touched.`, { username: user.username, role: user.roleId, profile: user.profileType ? `${user.profileType}:${user.profileId}` : null }, null);
  return toPublic(user);
}

/** Saves a role's permission set with anti-escalation rules. Frontend-only until your backend stores it. */
export function saveRolePermissions(roleId, permissionKeys, actor) {
  const role = roleById(roleId);
  if (!role) throw new UserServiceError('Role not found.', { code: 'NOT_FOUND' });
  const rp = getRolePermissions();
  const actorRole = roleById(actor?.roleId);
  if (role.id === 'super_admin') throw new UserServiceError('The Super Admin role is protected and always has every permission.', { code: 'FORBIDDEN' });
  if (!actorRole || !hasPermission(rp, actor.roleId, 'users.manage')) throw new UserServiceError('Your role lacks the "users.manage" permission.', { code: 'FORBIDDEN' });
  if (actorRole.id !== 'super_admin' && role.level >= actorRole.level) throw new UserServiceError('You cannot edit a role equal to or above your own.', { code: 'FORBIDDEN' });

  const next = [...new Set(permissionKeys)].filter((k) => VALID_KEYS.has(k));
  const prev = rp[roleId] || [];
  const added = next.filter((k) => !prev.includes(k));
  const removed = prev.filter((k) => !next.includes(k));
  const own = new Set(rp[actor.roleId] || []);
  const beyond = added.filter((k) => !own.has(k));
  if (beyond.length) throw new UserServiceError(`You cannot grant permissions you do not hold yourself (${beyond.slice(0, 3).join(', ')}${beyond.length > 3 ? '...' : ''}).`, { code: 'FORBIDDEN' });
  if (!added.length && !removed.length) return next;

  const stored = (readArray(STORAGE_KEYS.ROLE_PERMS) || []).filter((r) => r && r.roleId !== roleId);
  writeArray(STORAGE_KEYS.ROLE_PERMS, [...stored, { roleId, permissions: next, updatedAt: nowISO(), updatedBy: actor.name }]);
  appendAudit(actor, 'permission_changed', null, `Permissions for ${role.name} changed (+${added.length} / -${removed.length}).`, { role: roleId, removed }, { role: roleId, added });
  return next;
}

/* ------------------------------------------------------------------ */
/* Statistics (always calculated from the real dataset)                */
/* ------------------------------------------------------------------ */

export function getUserStatistics(snapshot = getSnapshot()) {
  const users = snapshot.users;
  const total = users.length;
  const byStatus = Object.fromEntries(USER_STATUSES.map((s) => [s, users.filter((u) => u.status === s).length]));
  const byRole = Object.fromEntries(ROLES.map((r) => [r.id, users.filter((u) => u.roleId === r.id).length]));
  const linked = users.filter((u) => u.profileType && u.profileId).length;
  const incomplete = users.filter((u) => !u.phone || !u.email || !u.profileType).length;
  const pct = (n) => (total ? Math.round((n / total) * 100) : 0);
  const recent = (action) => snapshot.audit.filter((a) => a.action === action).slice(0, 5);
  return {
    total, byStatus, byRole,
    active: byStatus.Active, pending: byStatus.Pending, suspended: byStatus.Suspended, inactive: byStatus.Inactive,
    linked, unlinked: total - linked, incomplete,
    activePct: pct(byStatus.Active), pendingPct: pct(byStatus.Pending), suspendedPct: pct(byStatus.Suspended), unlinkedPct: pct(total - linked),
    recentRoleChanges: recent('role_changed'),
    recentStatusChanges: snapshot.audit.filter((a) => ['account_activated', 'account_deactivated', 'account_suspended', 'account_reactivated'].includes(a.action)).slice(0, 5),
    recentSecurityEvents: snapshot.audit.filter((a) => ['password_reset_requested', 'account_deleted', 'permission_changed'].includes(a.action)).slice(0, 5),
  };
}

/* ------------------------------------------------------------------ */
/* Search / CSV                                                        */
/* ------------------------------------------------------------------ */

export function matchesUserQuery(user, query) {
  const q = trim(query).toLowerCase();
  if (!q) return true;
  const hay = [user.fullName, user.username, user.email, user.phone, user.userId].map((v) => str(v).toLowerCase()).join(' | ');
  if (hay.includes(q)) return true;
  const digits = q.replace(/\D/g, '');
  return digits.length >= 3 && str(user.phone).replace(/\D/g, '').includes(digits);
}

function csvCell(value) {
  let s = str(value);
  if (/^[=@\t\r]/.test(s) || (/^[+-]/.test(s) && !/^[+-]?[\d\s()-]+$/.test(s))) s = `'${s}`;
  return /[",\r\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

/** Never includes passwords, tokens or any secret field. */
export function exportUsersToCSV(users, profiles = getProfiles()) {
  const head = ['User ID', 'Full Name', 'Username', 'Email', 'Phone', 'Role', 'Status', 'Linked Profile Type', 'Linked Profile ID', 'Last Login', 'Created'];
  const lines = [head.map(csvCell).join(',')];
  users.forEach((u) => {
    const p = u.profileType ? (profiles[u.profileType] || []).find((x) => x.id === u.profileId) : null;
    lines.push([u.userId, u.fullName || getUserFullName(u), u.username, u.email, u.phone, roleById(u.roleId)?.name || u.roleId, u.status,
      u.profileType ? PROFILE_TYPE_LABELS[u.profileType] : '', p ? p.profileId : u.profileId, u.lastLoginAt, u.createdAt].map(csvCell).join(','));
  });
  return lines.join('\r\n');
}

export const buildReportFilename = (scope = '') => {
  const tag = trim(scope).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  return `school-user-accounts-${tag ? `${tag}-` : ''}${toDateInputValue()}.csv`;
};

export function downloadCSV(csv, filename) {
  try {
    const url = URL.createObjectURL(new Blob(['\uFEFF', csv], { type: 'text/csv;charset=utf-8;' }));
    const a = document.createElement('a');
    a.href = url; a.download = filename;
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  } catch (cause) {
    throw new UserServiceError('The CSV file could not be created in this browser.', { code: 'EXPORT_FAILED', cause });
  }
}