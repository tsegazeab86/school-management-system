/**
 * userSampleData.js
 * Location: frontend/src/data/userSampleData.js
 *
 * DEMONSTRATION DATA ONLY. All people below are fictional.
 *  - ROLES / PERMISSION_MODULES / default permissions are the frontend role catalogue.
 *    Real authorization MUST be enforced by your backend; this is only a UI contract.
 *  - SAMPLE_USERS are seeded only when the `sms_users` storage key is missing/empty.
 *  - DEMO_PROFILES are an in-memory fallback used ONLY to display/link demo accounts when
 *    your real profile storage (students / teachers / staff / parents) is empty.
 *    They are never written to storage, so no profile records are ever created.
 */

export const ROLE_GROUPS = [
  { id: "system", label: "System Administration" },
  { id: "leadership", label: "Academic Leadership" },
  { id: "academic", label: "Academic" },
  { id: "family", label: "Family" },
  { id: "operations", label: "Operations" },
];

/** level = authority rank used for anti-escalation checks (higher = more authority). */
export const ROLES = [
  {
    id: "super_admin",
    name: "Super Admin",
    group: "system",
    level: 100,
    protected: true,
    profileTypes: ["staff"],
    description:
      "Full control of the system, all roles and all settings. Protected role: the last active Super Admin can never be removed or demoted.",
  },
  {
    id: "administrator",
    name: "Administrator",
    group: "system",
    level: 80,
    protected: true,
    profileTypes: ["staff"],
    description:
      "Runs day-to-day school administration and user accounts, without access to system-level settings.",
  },
  {
    id: "principal",
    name: "Principal",
    group: "leadership",
    level: 70,
    protected: false,
    profileTypes: ["staff", "teacher"],
    description:
      "Oversees academic and operational performance of the whole school.",
  },
  {
    id: "vice_principal",
    name: "Vice Principal",
    group: "leadership",
    level: 60,
    protected: false,
    profileTypes: ["staff", "teacher"],
    description:
      "Supports the Principal with academics, attendance and discipline.",
  },
  {
    id: "registrar",
    name: "Registrar",
    group: "leadership",
    level: 50,
    protected: false,
    profileTypes: ["staff"],
    description: "Maintains student admission, enrolment and family records.",
  },
  {
    id: "hr_officer",
    name: "HR Officer",
    group: "operations",
    level: 40,
    protected: false,
    profileTypes: ["staff"],
    description: "Manages teacher and staff employment records.",
  },
  {
    id: "accountant",
    name: "Accountant",
    group: "operations",
    level: 40,
    protected: false,
    profileTypes: ["staff"],
    description: "Manages fees, payments and financial reports.",
  },
  {
    id: "librarian",
    name: "Librarian",
    group: "operations",
    level: 30,
    protected: false,
    profileTypes: ["staff"],
    description: "Manages library catalogue, loans and returns.",
  },
  {
    id: "lab_technician",
    name: "Laboratory Technician",
    group: "operations",
    level: 30,
    protected: false,
    profileTypes: ["staff"],
    description: "Manages laboratory equipment and practical sessions.",
  },
  {
    id: "other_staff",
    name: "Other Staff",
    group: "operations",
    level: 20,
    protected: false,
    profileTypes: ["staff"],
    description: "Configurable role for other authorized school employees.",
  },
  {
    id: "teacher",
    name: "Teacher",
    group: "academic",
    level: 20,
    protected: false,
    profileTypes: ["teacher"],
    description: "Takes attendance, records marks and manages own classes.",
  },
  {
    id: "student",
    name: "Student",
    group: "academic",
    level: 10,
    protected: false,
    profileTypes: ["student"],
    description: "Views own timetable, results and attendance.",
  },
  {
    id: "parent",
    name: "Parent",
    group: "family",
    level: 10,
    protected: false,
    profileTypes: ["parent"],
    description: "Views linked children's progress, attendance and fees.",
  },
];

export const PERMISSION_MODULES = [
  { key: "dashboard", label: "Dashboard access" },
  { key: "students", label: "Student management" },
  { key: "teachers", label: "Teacher management" },
  { key: "staff", label: "Staff management" },
  { key: "parents", label: "Parent management" },
  { key: "attendance", label: "Attendance management" },
  { key: "classes", label: "Class management" },
  { key: "subjects", label: "Subject management" },
  { key: "exams", label: "Examination management" },
  { key: "grades", label: "Grade management" },
  { key: "finance", label: "Finance management" },
  { key: "library", label: "Library management" },
  { key: "laboratory", label: "Laboratory management" },
  { key: "reports", label: "Reports" },
  { key: "users", label: "User management" },
  { key: "system_settings", label: "System settings" },
  { key: "audit_logs", label: "Audit logs" },
];

export const PERMISSION_ACTIONS = [
  "read",
  "create",
  "update",
  "delete",
  "manage",
];

export const ALL_PERMISSION_KEYS = PERMISSION_MODULES.flatMap((m) =>
  PERMISSION_ACTIONS.map((a) => `${m.key}.${a}`),
);

const keys = (mods, actions = PERMISSION_ACTIONS) =>
  mods.flatMap((m) => actions.map((a) => `${m}.${a}`));
const ALL_MODS = PERMISSION_MODULES.map((m) => m.key);
const RW = ["read", "create", "update"];

/** Default permission sets (a starting point for your backend role definitions). */
export function buildDefaultRolePermissions() {
  return {
    super_admin: [...ALL_PERMISSION_KEYS],
    administrator: [
      ...keys(
        ALL_MODS.filter((m) => !["system_settings", "audit_logs"].includes(m)),
      ),
      ...keys(["system_settings", "audit_logs"], ["read"]),
    ],
    principal: [
      ...keys(ALL_MODS, ["read"]),
      ...keys(["grades", "exams", "reports"], ["update", "manage"]),
    ],
    vice_principal: [
      ...keys(
        ALL_MODS.filter(
          (m) =>
            !["finance", "system_settings", "users", "audit_logs"].includes(m),
        ),
        ["read"],
      ),
      ...keys(
        ["attendance", "classes", "exams"],
        ["create", "update", "manage"],
      ),
    ],
    registrar: [
      ...keys(["students", "parents"]),
      ...keys(["dashboard", "attendance", "reports", "subjects"], ["read"]),
      ...keys(["classes"], ["read", "update"]),
    ],
    hr_officer: [
      ...keys(["staff", "teachers"]),
      ...keys(["dashboard", "reports"], ["read"]),
    ],
    accountant: [
      ...keys(["finance"]),
      ...keys(["dashboard", "students", "reports"], ["read"]),
    ],
    librarian: [
      ...keys(["library"]),
      ...keys(["dashboard", "students"], ["read"]),
    ],
    lab_technician: [
      ...keys(["laboratory"]),
      ...keys(["dashboard", "subjects"], ["read"]),
    ],
    other_staff: keys(["dashboard"], ["read"]),
    teacher: [
      ...keys(
        ["dashboard", "students", "classes", "subjects", "reports"],
        ["read"],
      ),
      ...keys(["attendance", "exams", "grades"], RW),
    ],
    student: keys(
      ["dashboard", "grades", "attendance", "subjects", "exams", "library"],
      ["read"],
    ),
    parent: keys(["dashboard", "grades", "attendance", "finance"], ["read"]),
  };
}

/* ------------------------------------------------------------------ */
/* Demo profiles (in-memory fallback only, never persisted)            */
/* ------------------------------------------------------------------ */

const prof = (type, id, firstName, middleName, lastName, detail) => ({
  type,
  id,
  profileId: id,
  firstName,
  middleName,
  lastName,
  fullName: [firstName, middleName, lastName].filter(Boolean).join(" "),
  detail,
  isDemo: true,
});

export const DEMO_PROFILES = {
  staff: [
    prof(
      "staff",
      "STF-2026-0001",
      "Abebe",
      "Kebede",
      "Tesfaye",
      "Administration Office",
    ),
    prof("staff", "STF-2026-0002", "Biruk", "", "Tadesse", "Finance Office"),
    prof("staff", "STF-2026-0003", "Meron", "", "Bekele", "Registrar Office"),
    prof("staff", "STF-2026-0004", "Tigist", "", "Hailu", "Library"),
    prof(
      "staff",
      "STF-2026-0005",
      "Yared",
      "",
      "Mengistu",
      "Science Laboratory",
    ),
    prof(
      "staff",
      "STF-2026-0006",
      "Almaz",
      "Wolde",
      "Haile",
      "Administration Office",
    ),
    prof("staff", "STF-2026-0007", "Mulu", "", "Gebre", "Human Resources"),
    prof(
      "staff",
      "STF-2026-0008",
      "Tesfaye",
      "",
      "Lemma",
      "Principal's Office",
    ),
    prof(
      "staff",
      "STF-2026-0009",
      "Genet",
      "",
      "Assefa",
      "Vice Principal's Office",
    ),
    prof("staff", "STF-2026-0010", "Kidist", "", "Mulatu", "Front Desk"),
  ],
  teacher: [
    prof(
      "teacher",
      "TCH-2026-0001",
      "Selam",
      "Getachew",
      "Alemu",
      "Mathematics Department",
    ),
    prof(
      "teacher",
      "TCH-2026-0002",
      "Henok",
      "",
      "Fikru",
      "Natural Science Department",
    ),
    prof(
      "teacher",
      "TCH-2026-0003",
      "Liya",
      "",
      "Solomon",
      "Languages Department",
    ),
    prof(
      "teacher",
      "TCH-2026-0004",
      "Samuel",
      "",
      "Girma",
      "Social Science Department",
    ),
  ],
  student: [
    prof("student", "STU-2026-0001", "Dawit", "Abebe", "Kebede", "Grade 5A"),
    prof("student", "STU-2026-0002", "Hana", "Abebe", "Kebede", "Grade 8B"),
    prof("student", "STU-2026-0003", "Kaleb", "", "Tadesse", "Grade 3B"),
    prof("student", "STU-2026-0004", "Ruth", "", "Dawit", "Grade 1A"),
  ],
  parent: [
    prof("parent", "PAR-2026-0001", "Mulugeta", "", "Alemu", "Father"),
    prof("parent", "PAR-2026-0002", "Rahel", "", "Mekonnen", "Mother"),
    prof("parent", "PAR-2026-0003", "Bethlehem", "", "Tadesse", "Mother"),
  ],
};

/* ------------------------------------------------------------------ */
/* Demo users                                                          */
/* ------------------------------------------------------------------ */

const ago = (now, hours) =>
  new Date(now.getTime() - hours * 3600 * 1000).toISOString();

export function buildSampleUsers(now = new Date()) {
  const u = (n, o) => ({
    id: `usr-seed-${String(n).padStart(3, "0")}`,
    userId: `USR-2026-${String(n).padStart(4, "0")}`,
    middleName: "",
    phone: "",
    profileType: "",
    profileId: "",
    notes: "",
    lastLoginAt: "",
    passwordStatus: "set",
    createdBy: "System (demo data)",
    updatedBy: "System (demo data)",
    isDemo: true,
    ...o,
    createdAt: o.createdAt || ago(now, 24 * 200),
    updatedAt: o.updatedAt || ago(now, 24 * 10),
  });
  return [
    u(1, {
      firstName: "Abebe",
      middleName: "Kebede",
      lastName: "Tesfaye",
      username: "abebe.k",
      email: "abebe.kebede@school.example",
      phone: "+251 911 234 501",
      roleId: "super_admin",
      status: "Active",
      profileType: "staff",
      profileId: "STF-2026-0001",
      lastLoginAt: ago(now, 2),
      createdAt: ago(now, 24 * 400),
    }),
    u(2, {
      firstName: "Almaz",
      middleName: "Wolde",
      lastName: "Haile",
      username: "almaz.w",
      email: "almaz.wolde@school.example",
      phone: "+251 912 330 118",
      roleId: "administrator",
      status: "Active",
      profileType: "staff",
      profileId: "STF-2026-0006",
      lastLoginAt: ago(now, 6),
      createdAt: ago(now, 24 * 300),
    }),
    u(3, {
      firstName: "Tesfaye",
      lastName: "Lemma",
      username: "tesfaye.l",
      email: "tesfaye.lemma@school.example",
      phone: "+251 913 551 770",
      roleId: "principal",
      status: "Active",
      profileType: "staff",
      profileId: "STF-2026-0008",
      lastLoginAt: ago(now, 26),
      createdAt: ago(now, 24 * 380),
    }),
    u(4, {
      firstName: "Genet",
      lastName: "Assefa",
      username: "genet.a",
      email: "genet.assefa@school.example",
      phone: "+251 914 208 365",
      roleId: "vice_principal",
      status: "Active",
      profileType: "staff",
      profileId: "STF-2026-0009",
      lastLoginAt: ago(now, 50),
      createdAt: ago(now, 24 * 350),
    }),
    u(5, {
      firstName: "Meron",
      lastName: "Bekele",
      username: "meron.b",
      email: "meron.bekele@school.example",
      phone: "+251 922 417 093",
      roleId: "registrar",
      status: "Active",
      profileType: "staff",
      profileId: "STF-2026-0003",
      lastLoginAt: ago(now, 5),
      createdAt: ago(now, 24 * 290),
    }),
    u(6, {
      firstName: "Biruk",
      lastName: "Tadesse",
      username: "biruk.t",
      email: "biruk.tadesse@school.example",
      phone: "+251 921 774 662",
      roleId: "accountant",
      status: "Active",
      profileType: "staff",
      profileId: "STF-2026-0002",
      lastLoginAt: ago(now, 30),
      createdAt: ago(now, 24 * 260),
    }),
    u(7, {
      firstName: "Tigist",
      lastName: "Hailu",
      username: "tigist.h",
      email: "tigist.hailu@school.example",
      phone: "+251 931 620 845",
      roleId: "librarian",
      status: "Active",
      profileType: "staff",
      profileId: "STF-2026-0004",
      lastLoginAt: ago(now, 72),
      createdAt: ago(now, 24 * 240),
    }),
    u(8, {
      firstName: "Yared",
      lastName: "Mengistu",
      username: "yared.m",
      email: "yared.mengistu@school.example",
      phone: "+251 944 118 207",
      roleId: "lab_technician",
      status: "Active",
      profileType: "staff",
      profileId: "STF-2026-0005",
      lastLoginAt: ago(now, 120),
      createdAt: ago(now, 24 * 220),
    }),
    u(9, {
      firstName: "Mulu",
      lastName: "Gebre",
      username: "mulu.g",
      email: "mulu.gebre@school.example",
      phone: "+251 918 905 441",
      roleId: "hr_officer",
      status: "Active",
      profileType: "staff",
      profileId: "STF-2026-0007",
      lastLoginAt: ago(now, 200),
      createdAt: ago(now, 24 * 210),
    }),
    u(10, {
      firstName: "Selam",
      middleName: "Getachew",
      lastName: "Alemu",
      username: "selam.g",
      email: "selam.getachew@school.example",
      phone: "+251 911 862 304",
      roleId: "teacher",
      status: "Active",
      profileType: "teacher",
      profileId: "TCH-2026-0001",
      lastLoginAt: ago(now, 4),
      createdAt: ago(now, 24 * 180),
    }),
    u(11, {
      firstName: "Henok",
      lastName: "Fikru",
      username: "henok.f",
      email: "henok.fikru@school.example",
      phone: "+251 912 440 876",
      roleId: "teacher",
      status: "Suspended",
      profileType: "teacher",
      profileId: "TCH-2026-0002",
      lastLoginAt: ago(now, 24 * 45),
      notes: "Suspended pending HR review (demo note).",
      createdAt: ago(now, 24 * 170),
    }),
    u(12, {
      firstName: "Dawit",
      middleName: "Abebe",
      lastName: "Kebede",
      username: "dawit.a",
      email: "dawit.abebe@student.example",
      roleId: "student",
      status: "Active",
      profileType: "student",
      profileId: "STU-2026-0001",
      lastLoginAt: ago(now, 8),
      createdAt: ago(now, 24 * 120),
    }),
    u(13, {
      firstName: "Hana",
      middleName: "Abebe",
      lastName: "Kebede",
      username: "hana.a",
      email: "hana.abebe@student.example",
      roleId: "student",
      status: "Pending",
      profileType: "student",
      profileId: "STU-2026-0002",
      passwordStatus: "invitation_pending",
      createdAt: ago(now, 24 * 3),
    }),
    u(14, {
      firstName: "Mulugeta",
      lastName: "Alemu",
      username: "mulugeta.a",
      email: "mulugeta.alemu@family.example",
      phone: "+251 925 301 876",
      roleId: "parent",
      status: "Pending",
      profileType: "parent",
      profileId: "PAR-2026-0001",
      passwordStatus: "invitation_pending",
      createdAt: ago(now, 24 * 2),
    }),
    u(15, {
      firstName: "Rahel",
      lastName: "Mekonnen",
      username: "rahel.m",
      email: "rahel.mekonnen@family.example",
      phone: "+251 911 508 129",
      roleId: "parent",
      status: "Active",
      profileType: "parent",
      profileId: "PAR-2026-0002",
      lastLoginAt: ago(now, 15),
      createdAt: ago(now, 24 * 90),
    }),
    u(16, {
      firstName: "Liya",
      lastName: "Solomon",
      username: "liya.s",
      email: "liya.solomon@school.example",
      roleId: "teacher",
      status: "Active",
      lastLoginAt: ago(now, 90),
      notes: "Profile not linked yet (demo).",
      createdAt: ago(now, 24 * 60),
    }),
    u(17, {
      firstName: "Kaleb",
      lastName: "Tadesse",
      username: "kaleb.t",
      email: "kaleb.tadesse@student.example",
      roleId: "student",
      status: "Inactive",
      lastLoginAt: ago(now, 24 * 120),
      createdAt: ago(now, 24 * 150),
    }),
  ];
}
