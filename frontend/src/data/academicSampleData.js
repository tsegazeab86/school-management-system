/**
 * academicSampleData.js
 * ---------------------------------------------------------------------------
 * DEMONSTRATION DATA ONLY. Nothing in this file is a real student, teacher,
 * classroom or enrollment record.
 *
 * - Fully deterministic: the same data is produced on every call (seeded
 *   pseudo-random numbers, fixed timestamps, stable IDs such as GRD-001,
 *   SEC-001, ROOM-001, ENR-00001).
 * - No React and no storage access here. academicService.js decides whether
 *   this data is ever written (only on a fresh install, never over real data).
 */

export const DEMO_ACADEMIC_YEAR = '2026/2027';

export const DEFAULT_ACADEMIC_YEARS = [
  { id: 'AY-2024-2025', name: '2024/2025', status: 'archived' },
  { id: 'AY-2025-2026', name: '2025/2026', status: 'archived' },
  { id: 'AY-2026-2027', name: '2026/2027', status: 'active' },
];

const CREATED_AT = '2026-08-25T08:00:00.000Z';

const MALE_NAMES = [
  'Abebe', 'Dawit', 'Biruk', 'Yonas', 'Henok', 'Samuel', 'Kaleb', 'Mikias',
  'Natnael', 'Eyob', 'Tewodros', 'Getachew', 'Bereket', 'Fitsum', 'Hailu',
  'Kidus', 'Lemma', 'Mulugeta', 'Nahom', 'Robel', 'Solomon', 'Tadesse',
  'Yared', 'Zelalem',
];

const FEMALE_NAMES = [
  'Selam', 'Hana', 'Meron', 'Tigist', 'Bethlehem', 'Marta', 'Rahel', 'Saba',
  'Sara', 'Tsion', 'Eden', 'Liya', 'Mekdes', 'Hiwot', 'Kidist', 'Aster',
  'Feven', 'Helina', 'Lidya', 'Mahlet', 'Netsanet', 'Rediet', 'Winta', 'Bezawit',
];

const FAMILY_NAMES = [
  'Kebede', 'Alemu', 'Tesfaye', 'Bekele', 'Tadesse', 'Girma', 'Haile',
  'Mengistu', 'Assefa', 'Desta', 'Wolde', 'Negash', 'Abera', 'Gebre',
  'Tilahun', 'Worku', 'Yohannes', 'Lemma', 'Mulat', 'Hailu', 'Amare',
  'Berhanu', 'Demeke', 'Eshetu', 'Fikre', 'Getachew', 'Jemal', 'Mekonnen',
  'Seyoum', 'Zewdu',
];

const SUBJECTS = [
  'Mathematics', 'English', 'Amharic', 'Physics', 'Chemistry', 'Biology',
  'Civics', 'History', 'Geography', 'ICT', 'Physical Education', 'Afan Oromo',
];

function mulberry32(seed) {
  let a = seed >>> 0;
  return function next() {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const pad = (n, width) => String(n).padStart(width, '0');
const slug = (s) => s.toLowerCase().replace(/[^a-z]/g, '');

function gradeDescription(n) {
  if (n <= 4) return 'Lower primary: foundational literacy and numeracy.';
  if (n <= 8) return 'Upper primary: broadening subject areas.';
  if (n <= 10) return 'General secondary education.';
  return 'Preparatory programme leading to national examinations.';
}

// Sections per grade. Grade 12 also gets an archived Section C as an example.
const SECTION_PLAN = [3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 2, 3];
const SECTION_LETTERS = ['A', 'B', 'C'];

export function buildDemoAcademicData() {
  const rand = mulberry32(20262027);
  const digit = () => Math.floor(rand() * 10);
  const phone = () =>
    `+251 9${digit()}${digit()} ${digit()}${digit()}${digit()} ${digit()}${digit()}${digit()}`;

  // ---- Teachers (demo registry) -------------------------------------------
  const teachers = Array.from({ length: 42 }, (_, i) => {
    const female = i % 2 === 1;
    const first = (female ? FEMALE_NAMES : MALE_NAMES)[(i * 5 + 2) % 24];
    const middle = FAMILY_NAMES[(i * 7 + 3) % 30];
    let last = FAMILY_NAMES[(i * 11 + 8) % 30];
    if (last === middle) last = FAMILY_NAMES[(i * 11 + 9) % 30];
    return {
      id: `TCH-2026-${pad(i + 1, 4)}`,
      name: `${first} ${middle} ${last}`,
      gender: female ? 'Female' : 'Male',
      subject: SUBJECTS[i % SUBJECTS.length],
      phone: phone(),
      email: `${slug(first)}.${slug(middle)}@school.example`,
      status: 'active',
    };
  });

  // ---- Grades --------------------------------------------------------------
  const grades = Array.from({ length: 12 }, (_, i) => {
    const n = i + 1;
    return {
      id: `GRD-${pad(n, 3)}`,
      name: `Grade ${n}`,
      number: n,
      code: `G${pad(n, 2)}`,
      description: gradeDescription(n),
      academicYear: DEMO_ACADEMIC_YEAR,
      status: 'active',
      notes: '',
      createdAt: CREATED_AT,
      updatedAt: CREATED_AT,
    };
  });

  // ---- Sections, classrooms, students, enrollments ------------------------
  const sections = [];
  const students = [];
  const enrollments = [];
  let studentSeq = 0;
  let enrollmentSeq = 0;
  let k = 0;

  const makeStudent = (gradeLevel) => {
    studentSeq += 1;
    const i = studentSeq;
    const female = i % 2 === 0;
    const first = (female ? FEMALE_NAMES : MALE_NAMES)[(i * 3 + 1) % 24];
    const middle = FAMILY_NAMES[(i * 7 + 5) % 30];
    let last = FAMILY_NAMES[(i * 11 + 2) % 30];
    if (last === middle) last = FAMILY_NAMES[(i * 11 + 3) % 30];
    const student = {
      id: `STU-2026-${pad(i, 4)}`,
      name: `${first} ${middle} ${last}`,
      gender: female ? 'Female' : 'Male',
      gradeLevel,
      status: 'active',
    };
    students.push(student);
    return student;
  };

  grades.forEach((grade) => {
    const n = grade.number;
    const count = SECTION_PLAN[n - 1];
    const baseCapacity = n <= 4 ? 40 : n <= 8 ? 45 : n <= 10 ? 48 : 50;

    for (let si = 0; si < count; si += 1) {
      k += 1;
      const archived = n === 12 && si === 2;
      const capacity = baseCapacity - (si === 2 ? 5 : 0);
      sections.push({
        id: `SEC-${pad(k, 3)}`,
        gradeId: grade.id,
        name: SECTION_LETTERS[si],
        code: `G${pad(n, 2)}-${SECTION_LETTERS[si]}`,
        academicYear: DEMO_ACADEMIC_YEAR,
        status: archived ? 'archived' : 'active',
        classroomId: archived ? null : `ROOM-${pad(k, 3)}`,
        classTeacherId: archived ? null : teachers[k - 1].id,
        assistantTeacherId:
          !archived && k % 5 === 0 ? teachers[34 + ((k / 5 - 1) % 8)].id : null,
        capacity,
        enrollmentOpen: !archived,
        notes: archived ? 'Closed after the 2025/2026 restructuring (demo example).' : '',
        createdAt: CREATED_AT,
        updatedAt: CREATED_AT,
      });

      if (archived) continue;

      let ratio = 0.62 + rand() * 0.35;
      if (k === 3) ratio = 1; // one full section
      if (k === 14) ratio = 0.2; // one nearly empty section
      const enrolled = Math.min(capacity, Math.round(capacity * ratio));
      for (let e = 0; e < enrolled; e += 1) {
        const student = makeStudent(n);
        enrollmentSeq += 1;
        enrollments.push({
          id: `ENR-${pad(enrollmentSeq, 5)}`,
          studentId: student.id,
          sectionId: `SEC-${pad(k, 3)}`,
          academicYear: DEMO_ACADEMIC_YEAR,
          enrolledAt: `2026-09-${pad(8 + Math.floor(rand() * 12), 2)}`,
          status: 'active',
          endedAt: null,
        });
      }
    }
  });

  // Students who are not enrolled in any section yet.
  for (let u = 0; u < 45; u += 1) makeStudent(1 + Math.floor(rand() * 12));

  // ---- Classrooms ----------------------------------------------------------
  const sectionByRoom = {};
  sections.forEach((s) => {
    if (s.classroomId) sectionByRoom[s.classroomId] = s;
  });

  const classrooms = [];
  for (let r = 1; r <= 38; r += 1) {
    const id = `ROOM-${pad(r, 3)}`;
    const blockIndex = (r - 1) % 14;
    const section = sectionByRoom[id];
    classrooms.push({
      id,
      name: `Room ${r}`,
      building: r <= 14 ? 'Block A' : r <= 28 ? 'Block B' : 'Block C',
      floor: Math.floor(blockIndex / 5),
      type: 'Standard Classroom',
      capacity: section ? section.capacity + (r % 3 === 0 ? 0 : 5) : 40,
      availability: r === 37 ? 'maintenance' : 'available',
    });
  }
  [
    ['Computer Laboratory 1', 'Block D', 0, 'Computer Laboratory', 40],
    ['Computer Laboratory 2', 'Block D', 0, 'Computer Laboratory', 40],
    ['Physics Laboratory', 'Science Block', 1, 'Science Laboratory', 45],
    ['Chemistry Laboratory', 'Science Block', 1, 'Science Laboratory', 45],
    ['Biology Laboratory', 'Science Block', 1, 'Science Laboratory', 45],
    ['Library Reading Room', 'Block D', 1, 'Library Room', 80],
    ['Multipurpose Hall', 'Main Hall', 0, 'Multipurpose Room', 200],
  ].forEach(([name, building, floor, type, capacity], idx) => {
    classrooms.push({
      id: `ROOM-${pad(39 + idx, 3)}`,
      name,
      building,
      floor,
      type,
      capacity,
      availability: 'available',
    });
  });

  return {
    years: DEFAULT_ACADEMIC_YEARS,
    grades,
    sections,
    classrooms,
    enrollments,
    students,
    teachers,
  };
}