/**
 * parentSampleData.js
 * ---------------------------------------------------------------------------
 * Demo data for the Parent Management module.
 *
 * - Kept separate from the service and the UI on purpose.
 * - Nothing in this file touches localStorage. parentService.initializeParentStorage()
 *   decides if and when to seed, and only does so when no usable parent records exist.
 * - SAMPLE_STUDENTS is a read-only fallback used ONLY when your real student registry
 *   (localStorage key `sms_students`) is empty. It is never written to storage, so it can
 *   never create duplicate student records.
 * - Parent IDs are stable (PAR-2026-0001 ...). Student IDs are stable (STU-2026-0001 ...).
 */

const isoDaysAgo = (days) => {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString().slice(0, 10);
};

/* ------------------------------ Students ---------------------------------- */

export const SAMPLE_STUDENTS = [
  { id: 'STU-2026-0001', firstName: 'Dawit', middleName: 'Abebe', lastName: 'Kebede', gender: 'Male', grade: '5', section: 'A' },
  { id: 'STU-2026-0002', firstName: 'Tigist', middleName: 'Abebe', lastName: 'Kebede', gender: 'Female', grade: '8', section: 'B' },
  { id: 'STU-2026-0003', firstName: 'Meron', middleName: 'Dawit', lastName: 'Bekele', gender: 'Female', grade: '3', section: 'A' },
  { id: 'STU-2026-0004', firstName: 'Yosef', middleName: 'Dawit', lastName: 'Bekele', gender: 'Male', grade: '6', section: 'C' },
  { id: 'STU-2026-0005', firstName: 'Bisrat', middleName: 'Natnael', lastName: 'Getachew', gender: 'Male', grade: '9', section: 'A' },
  { id: 'STU-2026-0006', firstName: 'Eyerusalem', middleName: 'Samuel', lastName: 'Girma', gender: 'Female', grade: '4', section: 'B' },
  { id: 'STU-2026-0007', firstName: 'Kalkidan', middleName: 'Samuel', lastName: 'Girma', gender: 'Female', grade: '10', section: 'A' },
  { id: 'STU-2026-0008', firstName: 'Mihret', middleName: 'Dereje', lastName: 'Alemu', gender: 'Female', grade: '7', section: 'B' },
  { id: 'STU-2026-0009', firstName: 'Nahom', middleName: 'Fikadu', lastName: 'Mekonnen', gender: 'Male', grade: '2', section: 'A' },
  { id: 'STU-2026-0010', firstName: 'Yididya', middleName: 'Henok', lastName: 'Fikru', gender: 'Male', grade: '11', section: 'B' },
  { id: 'STU-2026-0011', firstName: 'Surafel', middleName: 'Henok', lastName: 'Fikru', gender: 'Male', grade: '5', section: 'C' },
  { id: 'STU-2026-0012', firstName: 'Lidya', middleName: 'Bereket', lastName: 'Assefa', gender: 'Female', grade: '1', section: 'A' },
  { id: 'STU-2026-0013', firstName: 'Biruk', middleName: 'Bereket', lastName: 'Assefa', gender: 'Male', grade: '12', section: 'B' },
  { id: 'STU-2026-0014', firstName: 'Selam', middleName: 'Mulugeta', lastName: 'Kassahun', gender: 'Female', grade: '6', section: 'A' },
  { id: 'STU-2026-0015', firstName: 'Kidus', middleName: 'Mulugeta', lastName: 'Kassahun', gender: 'Male', grade: '3', section: 'B' },
  // Intentionally left without a guardian, so linking can be tried straight away.
  { id: 'STU-2026-0016', firstName: 'Abigiya', middleName: 'Tesfaye', lastName: 'Hailu', gender: 'Female', grade: '4', section: 'A' },
  { id: 'STU-2026-0017', firstName: 'Eliyas', middleName: 'Worku', lastName: 'Demissie', gender: 'Male', grade: '8', section: 'A' },
];

/* ------------------------------- Parents ---------------------------------- */

const parentId = (n) => `PAR-2026-${String(n).padStart(4, '0')}`;

const emergency = (name, relationship, phone, address) => ({ name, relationship, phone, address });

/**
 * Returns FRESH parent records every call (so the stored copy is never shared by reference).
 */
export const buildSampleParents = () => {
  const now = new Date().toISOString();
  const base = (n, o) => ({
    id: parentId(n),
    middleName: '',
    altPhone: '',
    dateOfBirth: '',
    maritalStatus: 'Married',
    photoUrl: '',
    relationshipNotes: '',
    notes: '',
    communicationPreference: 'Phone call',
    lastContactDate: '',
    status: 'active',
    createdAt: now,
    updatedAt: now,
    ...o,
  });

  return [
    base(1, {
      firstName: 'Abebe', middleName: '', lastName: 'Kebede', gender: 'Male', relationship: 'father',
      phone: '+251 911 234 567', altPhone: '+251 116 612 345', email: 'abebe.kebede@gmail.com',
      address: 'Bole Sub-city, Woreda 03', city: 'Addis Ababa', occupation: 'Civil Engineer',
      dateOfBirth: '1982-04-12', registrationDate: '2025-09-02', lastContactDate: isoDaysAgo(9),
      communicationPreference: 'Email',
      emergencyContact: emergency('Hana Tesfaye', 'Spouse', '+251 922 345 678', 'Bole Sub-city, Addis Ababa'),
      notes: 'Prefers meetings after 5:00 PM.',
    }),
    base(2, {
      firstName: 'Hana', middleName: '', lastName: 'Tesfaye', gender: 'Female', relationship: 'mother',
      phone: '+251 922 345 678', email: 'hana.tesfaye@yahoo.com',
      address: 'Bole Sub-city, Woreda 03', city: 'Addis Ababa', occupation: 'Primary School Teacher',
      dateOfBirth: '1985-11-23', registrationDate: '2025-09-02', lastContactDate: isoDaysAgo(21),
      emergencyContact: emergency('Abebe Kebede', 'Spouse', '+251 911 234 567', 'Bole Sub-city, Addis Ababa'),
    }),
    base(3, {
      firstName: 'Dawit', middleName: '', lastName: 'Bekele', gender: 'Male', relationship: 'father',
      phone: '+251 913 456 789', email: 'dawit.bekele@outlook.com',
      address: 'Kirkos Sub-city, Woreda 09', city: 'Addis Ababa', occupation: 'Accountant',
      dateOfBirth: '1979-02-08', registrationDate: '2025-09-05', lastContactDate: isoDaysAgo(34),
      communicationPreference: 'SMS',
      emergencyContact: emergency('Selamawit Alemu', 'Spouse', '+251 944 567 890', 'Kirkos Sub-city, Addis Ababa'),
    }),
    base(4, {
      firstName: 'Selamawit', middleName: '', lastName: 'Alemu', gender: 'Female', relationship: 'mother',
      phone: '+251 944 567 890', email: 'selamawit.alemu@gmail.com',
      address: 'Kirkos Sub-city, Woreda 09', city: 'Addis Ababa', occupation: 'Nurse',
      dateOfBirth: '1983-07-30', registrationDate: '2025-09-05', lastContactDate: isoDaysAgo(34),
      emergencyContact: emergency('Dawit Bekele', 'Spouse', '+251 913 456 789', 'Kirkos Sub-city, Addis Ababa'),
    }),
    base(5, {
      firstName: 'Natnael', middleName: '', lastName: 'Getachew', gender: 'Male', relationship: 'father',
      phone: '+251 911 678 901', email: 'natnael.getachew@gmail.com',
      address: 'Yeka Sub-city, Woreda 07', city: 'Addis Ababa', occupation: 'Business Owner',
      dateOfBirth: '1976-09-15', registrationDate: '2025-10-11', lastContactDate: isoDaysAgo(60),
      emergencyContact: emergency('Meron Worku', 'Spouse', '+251 925 789 012', 'Yeka Sub-city, Addis Ababa'),
    }),
    base(6, {
      firstName: 'Meron', middleName: '', lastName: 'Worku', gender: 'Female', relationship: 'mother',
      phone: '0925789012', email: 'meron.worku@gmail.com',
      address: 'Yeka Sub-city, Woreda 07', city: 'Addis Ababa', occupation: 'Pharmacist',
      dateOfBirth: '1981-01-19', registrationDate: '2025-10-11', status: 'inactive',
      emergencyContact: emergency('Natnael Getachew', 'Spouse', '+251 911 678 901', 'Yeka Sub-city, Addis Ababa'),
      notes: 'Temporarily abroad. Contact the father for urgent matters.',
    }),
    base(7, {
      firstName: 'Samuel', middleName: '', lastName: 'Girma', gender: 'Male', relationship: 'father',
      phone: '+251 966 890 123', email: 'samuel.girma@gmail.com',
      address: 'Arada Sub-city, Woreda 05', city: 'Addis Ababa', occupation: 'Logistics Manager',
      dateOfBirth: '1978-06-03', registrationDate: '2025-09-12', lastContactDate: isoDaysAgo(15),
      emergencyContact: emergency('Bethlehem Tadesse', 'Spouse', '+251 977 901 234', 'Arada Sub-city, Addis Ababa'),
    }),
    base(8, {
      firstName: 'Bethlehem', middleName: '', lastName: 'Tadesse', gender: 'Female', relationship: 'mother',
      phone: '+251 977 901 234', email: 'bethlehem.tadesse@yahoo.com',
      address: 'Arada Sub-city, Woreda 05', city: 'Addis Ababa', occupation: 'Bank Officer',
      dateOfBirth: '1984-12-27', registrationDate: '2025-09-12', lastContactDate: isoDaysAgo(15),
      communicationPreference: 'Email',
      emergencyContact: emergency('Samuel Girma', 'Spouse', '+251 966 890 123', 'Arada Sub-city, Addis Ababa'),
      notes: 'Primary contact for the family.',
    }),
    base(9, {
      firstName: 'Yonas', middleName: '', lastName: 'Abebe', gender: 'Male', relationship: 'guardian',
      phone: '+251 918 012 345', email: 'yonas.abebe@gmail.com',
      address: 'Gulele Sub-city, Woreda 02', city: 'Addis Ababa', occupation: 'Lawyer',
      dateOfBirth: '1974-03-21', maritalStatus: 'Married', registrationDate: isoDaysAgo(18),
      relationshipNotes: 'Maternal uncle. Legal guardian since 2024.',
      emergencyContact: emergency('Tsion Haile', 'Spouse', '+251 931 222 118', 'Gulele Sub-city, Addis Ababa'),
    }),
    base(10, {
      firstName: 'Rahel', middleName: '', lastName: 'Mekonnen', gender: 'Female', relationship: 'mother',
      phone: '+251 929 123 456', email: 'rahel.mekonnen@gmail.com',
      address: 'Lideta Sub-city, Woreda 06', city: 'Addis Ababa', occupation: 'Tailor',
      dateOfBirth: '1988-05-09', maritalStatus: 'Single', registrationDate: '2025-11-03', lastContactDate: isoDaysAgo(5),
      communicationPreference: 'SMS',
      emergencyContact: emergency('Almaz Zewdu', 'Sister', '+251 912 700 441', 'Lideta Sub-city, Addis Ababa'),
    }),
    base(11, {
      firstName: 'Henok', middleName: '', lastName: 'Fikru', gender: 'Male', relationship: 'father',
      phone: '+251 911 234 098', email: 'henok.fikru@gmail.com',
      address: 'Bahir Dar, Kebele 11', city: 'Bahir Dar', occupation: 'Agricultural Officer',
      dateOfBirth: '1977-10-14', registrationDate: '2025-09-20', lastContactDate: isoDaysAgo(40),
      emergencyContact: emergency('Eden Mulatu', 'Spouse', '0935345109', 'Bahir Dar, Kebele 11'),
    }),
    base(12, {
      firstName: 'Eden', middleName: '', lastName: 'Mulatu', gender: 'Female', relationship: 'mother',
      phone: '0935345109', email: 'eden.mulatu@yahoo.com',
      address: 'Bahir Dar, Kebele 11', city: 'Bahir Dar', occupation: 'Midwife',
      dateOfBirth: '1982-08-02', registrationDate: '2025-09-20', status: 'inactive',
      emergencyContact: emergency('Henok Fikru', 'Spouse', '+251 911 234 098', 'Bahir Dar, Kebele 11'),
    }),
    base(13, {
      firstName: 'Bereket', middleName: '', lastName: 'Assefa', gender: 'Male', relationship: 'father',
      phone: '+251 946 345 210', email: 'bereket.assefa@gmail.com',
      address: 'Nifas Silk-Lafto, Woreda 04', city: 'Addis Ababa', occupation: 'Software Developer',
      dateOfBirth: '1986-01-25', registrationDate: isoDaysAgo(45), lastContactDate: isoDaysAgo(12),
      communicationPreference: 'Email',
      emergencyContact: emergency('Liya Solomon', 'Spouse', '+251 958 112 304', 'Nifas Silk-Lafto, Addis Ababa'),
    }),
    base(14, {
      firstName: 'Liya', middleName: '', lastName: 'Solomon', gender: 'Female', relationship: 'mother',
      phone: '+251 958 112 304', email: 'liya.solomon@outlook.com',
      address: 'Nifas Silk-Lafto, Woreda 04', city: 'Addis Ababa', occupation: 'Architect',
      dateOfBirth: '1988-04-17', registrationDate: isoDaysAgo(45), lastContactDate: isoDaysAgo(12),
      emergencyContact: emergency('Bereket Assefa', 'Spouse', '+251 946 345 210', 'Nifas Silk-Lafto, Addis Ababa'),
    }),
    base(15, {
      firstName: 'Daniel', middleName: '', lastName: 'Kassahun', gender: 'Male', relationship: 'guardian',
      phone: '+251 912 456 321', altPhone: '+251 116 450 077', email: 'daniel.kassahun@gmail.com',
      address: 'Kolfe Keranio, Woreda 10', city: 'Addis Ababa', occupation: 'Government Employee',
      dateOfBirth: '1971-12-06', maritalStatus: 'Married', registrationDate: isoDaysAgo(6),
      relationshipNotes: 'Paternal uncle. Guardian after the death of both parents.',
      emergencyContact: emergency('Mulu Eshete', 'Spouse', '+251 913 009 884', 'Kolfe Keranio, Addis Ababa'),
    }),
  ];
};

/* --------------------- Parent <-> Student relationships -------------------- */
/**
 * [parentId, studentId, relationship, isPrimary]
 * Many-to-many: one parent has several children, and several students have two guardians.
 * Exactly one primary guardian per student.
 */
export const SAMPLE_PARENT_LINKS = [
  [parentId(1), 'STU-2026-0001', 'father', true],
  [parentId(2), 'STU-2026-0001', 'mother', false],
  [parentId(1), 'STU-2026-0002', 'father', true],
  [parentId(2), 'STU-2026-0002', 'mother', false],
  [parentId(3), 'STU-2026-0003', 'father', true],
  [parentId(4), 'STU-2026-0003', 'mother', false],
  [parentId(3), 'STU-2026-0004', 'father', true],
  [parentId(4), 'STU-2026-0004', 'mother', false],
  [parentId(5), 'STU-2026-0005', 'father', true],
  [parentId(6), 'STU-2026-0005', 'mother', false],
  [parentId(7), 'STU-2026-0006', 'father', false],
  [parentId(8), 'STU-2026-0006', 'mother', true],
  [parentId(7), 'STU-2026-0007', 'father', false],
  [parentId(8), 'STU-2026-0007', 'mother', true],
  [parentId(9), 'STU-2026-0008', 'guardian', true],
  [parentId(10), 'STU-2026-0009', 'mother', true],
  [parentId(11), 'STU-2026-0010', 'father', true],
  [parentId(12), 'STU-2026-0010', 'mother', false],
  [parentId(11), 'STU-2026-0011', 'father', true],
  [parentId(12), 'STU-2026-0011', 'mother', false],
  [parentId(13), 'STU-2026-0012', 'father', true],
  [parentId(14), 'STU-2026-0012', 'mother', false],
  [parentId(13), 'STU-2026-0013', 'father', true],
  [parentId(14), 'STU-2026-0013', 'mother', false],
  [parentId(15), 'STU-2026-0014', 'guardian', true],
  [parentId(15), 'STU-2026-0015', 'guardian', true],
];