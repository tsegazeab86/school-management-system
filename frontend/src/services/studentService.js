 
import { SAMPLE_STUDENTS } from "../data/sampleStudents";

const STORAGE_KEY = "sms_students";

const delay = (ms = 250) => new Promise((r) => setTimeout(r, ms));

function read() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (raw === null) {
    // First run only: seed demo data. Never overwrites existing records.
    localStorage.setItem(STORAGE_KEY, JSON.stringify(SAMPLE_STUDENTS));
    return [...SAMPLE_STUDENTS];
  }
  const parsed = JSON.parse(raw);
  if (!Array.isArray(parsed)) throw new Error("Stored student data is corrupted.");
  return parsed;
}

function write(list) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
}

export function generateStudentId(list, year = new Date().getFullYear()) {
  const prefix = `STU-${year}-`;
  const max = list
    .filter((s) => s.id.startsWith(prefix))
    .reduce((m, s) => Math.max(m, parseInt(s.id.slice(prefix.length), 10) || 0), 0);
  return `${prefix}${String(max + 1).padStart(4, "0")}`;
}

export async function getStudents() {
  await delay();
  return read();
}

export async function createStudent(data) {
  await delay(300);
  const list = read();
  const id = data.id && data.id.trim() ? data.id.trim() : generateStudentId(list);
  if (list.some((s) => s.id.toLowerCase() === id.toLowerCase())) {
    throw new Error(`Student ID ${id} already exists.`);
  }
  const student = { ...data, id };
  write([student, ...list]);
  return student;
}

export async function updateStudent(id, changes) {
  await delay(300);
  const list = read();
  const idx = list.findIndex((s) => s.id === id);
  if (idx === -1) throw new Error("Student not found.");
  const updated = { ...list[idx], ...changes, id };
  list[idx] = updated;
  write(list);
  return updated;
}

export async function updateStudentsStatus(ids, status) {
  await delay(300);
  const set = new Set(ids);
  write(read().map((s) => (set.has(s.id) ? { ...s, status } : s)));
}

export async function deleteStudent(id) {
  await delay(300);
  write(read().filter((s) => s.id !== id));
}