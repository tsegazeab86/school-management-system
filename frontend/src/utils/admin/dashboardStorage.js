/**
 * ====================================================================
 * EDUMANAGE ADMIN DASHBOARD CENTRAL STORAGE SERVICE
 * ====================================================================
 * Manages dashboard metrics, charts, activities, events, and notifications.
 * Sources data from existing local collections (e.g., sms_parents, user auth)
 * and falls back to a curated Grade 1–12 sample dataset with clear demo labels.
 */

const DASHBOARD_STORAGE_KEY = "sms_admin_dashboard_data_v1";

// Curated default dataset representing an active Grade 1–12 school
const DEFAULT_DASHBOARD_DATA = {
  isDemoData: true,
  academicYear: "2026 / 2027",
  currentSemester: "Semester 1 (Week 10)",
  lastUpdated: new Date().toISOString(),

  // Key performance statistics
  stats: {
    students: {
      value: 1248,
      label: "Total Students",
      trend: "+8.4%",
      trendPeriod: "vs last academic year",
      trendType: "positive",
      subLabel: "Grades 1 to 12 enrolled",
      path: "/admin/students",
    },
    teachers: {
      value: 84,
      label: "Total Teachers",
      trend: "+4.2%",
      trendPeriod: "vs last academic year",
      trendType: "positive",
      subLabel: "Active instructional faculty",
      path: "/admin/teachers",
    },
    staff: {
      value: 36,
      label: "Total Staff",
      trend: "+2",
      trendPeriod: "new this month",
      trendType: "neutral",
      subLabel: "Administrative & support personnel",
      path: "/admin/staff",
    },
    parents: {
      value: 982,
      label: "Total Parents",
      trend: "+7.1%",
      trendPeriod: "registered accounts",
      trendType: "positive",
      subLabel: "Verified guardian portals",
      path: "/admin/parents",
    },
    classes: {
      value: 36,
      label: "Total Classes",
      trend: "12 Grades",
      trendPeriod: "3 sections per grade",
      trendType: "neutral",
      subLabel: "Classrooms currently in session",
      path: "/admin/classes",
    },
    subjects: {
      value: 28,
      label: "Total Subjects",
      trend: "100%",
      trendPeriod: "curriculum assigned",
      trendType: "positive",
      subLabel: "Core & elective curriculum",
      path: "/admin/subjects",
    },
  },

  // Monthly enrollment growth data across the academic calendar
  enrollmentTrend: [
    { month: "Sep", students: 1120, capacity: 1300 },
    { month: "Oct", students: 1165, capacity: 1300 },
    { month: "Nov", students: 1198, capacity: 1300 },
    { month: "Dec", students: 1210, capacity: 1300 },
    { month: "Jan", students: 1225, capacity: 1300 },
    { month: "Feb", students: 1238, capacity: 1300 },
    { month: "Mar", students: 1248, capacity: 1300 },
  ],

  // Attendance performance over recent weeks
  attendanceOverview: [
    { week: "Week 5", present: 94.2, absent: 3.8, late: 2.0 },
    { week: "Week 6", present: 93.6, absent: 4.1, late: 2.3 },
    { week: "Week 7", present: 95.1, absent: 3.2, late: 1.7 },
    { week: "Week 8", present: 92.8, absent: 4.9, late: 2.3 },
    { week: "Week 9", present: 94.7, absent: 3.5, late: 1.8 },
    { week: "Week 10", present: 95.4, absent: 3.1, late: 1.5 },
  ],

  // Student distribution across Grades 1–12
  gradeDistribution: [
    { grade: "Gr 1", students: 104 },
    { grade: "Gr 2", students: 98 },
    { grade: "Gr 3", students: 102 },
    { grade: "Gr 4", students: 106 },
    { grade: "Gr 5", students: 110 },
    { grade: "Gr 6", students: 108 },
    { grade: "Gr 7", students: 105 },
    { grade: "Gr 8", students: 102 },
    { grade: "Gr 9", students: 112 },
    { grade: "Gr 10", students: 105 },
    { grade: "Gr 11", students: 98 },
    { grade: "Gr 12", students: 98 },
  ],

  // Gender breakdown
  genderDistribution: [
    { name: "Boys", value: 642, color: "#2563eb", percentage: "51.4%" },
    { name: "Girls", value: 606, color: "#7c3aed", percentage: "48.6%" },
  ],

  // Recent administrative activities
  recentActivities: [
    {
      id: "act-1",
      title: "New student enrolled in Grade 10-A",
      actor: "Registrar Office",
      role: "Registrar",
      time: "15 minutes ago",
      type: "student",
      badge: "Admission",
    },
    {
      id: "act-2",
      title: "Mathematics curriculum assigned to Mr. Abebe Kebede",
      actor: "Vice Principal",
      role: "Academic Head",
      time: "42 minutes ago",
      type: "academic",
      badge: "Curriculum",
    },
    {
      id: "act-3",
      title: "Semester 1 Midterm Exam Timetable published",
      actor: "Examination Committee",
      role: "Examinations",
      time: "2 hours ago",
      type: "exam",
      badge: "Exam",
    },
    {
      id: "act-4",
      title: "Grade 9 Section B room reassigned to Room 204",
      actor: "Administrator",
      role: "Admin",
      time: "3 hours ago",
      type: "system",
      badge: "Facility",
    },
    {
      id: "act-5",
      title: "Monthly tuition fee clearance report generated",
      actor: "Finance Office",
      role: "Accountant",
      time: "5 hours ago",
      type: "finance",
      badge: "Finance",
    },
    {
      id: "act-6",
      title: "Parent portal contact information updated for STU-2026-042",
      actor: "Dawit Getachew",
      role: "Parent",
      time: "Yesterday",
      type: "parent",
      badge: "Portal",
    },
  ],

  // Upcoming school events and examinations
  upcomingEvents: [
    {
      id: "evt-1",
      title: "Semester 1 Midterm Examinations",
      date: "Nov 12 - Nov 18, 2026",
      shortDate: "NOV 12",
      time: "08:30 AM - 12:30 PM",
      location: "Main Examination Hall (Grades 7–12)",
      category: "Examinations",
      badgeColor: "danger",
    },
    {
      id: "evt-2",
      title: "Annual Parent-Teacher Association (PTA) General Meeting",
      date: "Nov 22, 2026",
      shortDate: "NOV 22",
      time: "09:00 AM - 01:00 PM",
      location: "School Auditorium",
      category: "Community",
      badgeColor: "primary",
    },
    {
      id: "evt-3",
      title: "Inter-School STEM & Science Fair 2026",
      date: "Dec 05, 2026",
      shortDate: "DEC 05",
      time: "10:00 AM - 04:00 PM",
      location: "Science Complex & Library",
      category: "Academic",
      badgeColor: "warning",
    },
    {
      id: "evt-4",
      title: "National Public Holiday (School Closed)",
      date: "Dec 12, 2026",
      shortDate: "DEC 12",
      time: "Full Day",
      location: "Campus-wide",
      category: "Holiday",
      badgeColor: "neutral",
    },
  ],

  // Recent student & teacher registrations
  recentRegistrations: [
    {
      id: "reg-1",
      name: "Bethlehem Tadesse",
      regId: "STU-2026-104",
      role: "Student",
      gradeOrDept: "Grade 10 - Section A",
      date: "Nov 02, 2026",
      status: "Active",
    },
    {
      id: "reg-2",
      name: "Martha Alemu",
      regId: "TCH-2026-042",
      role: "Teacher",
      gradeOrDept: "Biology & General Science",
      date: "Oct 31, 2026",
      status: "Active",
    },
    {
      id: "reg-3",
      name: "Dawit Bekele",
      regId: "STU-2026-103",
      role: "Student",
      gradeOrDept: "Grade 9 - Section C",
      date: "Oct 29, 2026",
      status: "Active",
    },
    {
      id: "reg-4",
      name: "Selamawit Girma",
      regId: "STU-2026-102",
      role: "Student",
      gradeOrDept: "Grade 11 - Natural Science",
      date: "Oct 28, 2026",
      status: "Active",
    },
    {
      id: "reg-5",
      name: "Yohannes Haile",
      regId: "TCH-2026-041",
      role: "Teacher",
      gradeOrDept: "History & Civics",
      date: "Oct 26, 2026",
      status: "Pending Review",
    },
  ],

  // Notifications and system alerts
  notifications: [
    {
      id: "notif-1",
      title: "5 New Student Admissions Pending Review",
      description: "Applications submitted via registrar require administrative approval before enrollment.",
      time: "20 minutes ago",
      unread: true,
      category: "Admissions",
      urgency: "high",
    },
    {
      id: "notif-2",
      title: "Grade 11 Chemistry Teacher Unassigned",
      description: "Section B requires teacher assignment before the start of next week's lab sessions.",
      time: "1 hour ago",
      unread: true,
      category: "Academic",
      urgency: "medium",
    },
    {
      id: "notif-3",
      title: "Scheduled Automated Database Backup Complete",
      description: "Daily snapshot saved to secure cloud storage (Size: 42.8 MB, Status: OK).",
      time: "4 hours ago",
      unread: false,
      category: "System",
      urgency: "low",
    },
    {
      id: "notif-4",
      title: "3 Staff Leave Requests Awaiting Authorization",
      description: "Support staff submissions for next week require departmental sign-off.",
      time: "Yesterday",
      unread: true,
      category: "Staff",
      urgency: "medium",
    },
  ],
};

/**
 * Retrieve current dashboard data from localStorage or initialize with curated defaults.
 * Integrates with existing collections (e.g., sms_parents) when present.
 */
export function getDashboardData() {
  try {
    const raw = localStorage.getItem(DASHBOARD_STORAGE_KEY);
    let data = raw ? JSON.parse(raw) : null;

    if (!data || !data.stats) {
      data = DEFAULT_DASHBOARD_DATA;
      localStorage.setItem(DASHBOARD_STORAGE_KEY, JSON.stringify(data));
    }

    // Integrate with real project collections if available
    try {
      const storedParents = JSON.parse(localStorage.getItem("sms_parents"));
      if (Array.isArray(storedParents) && storedParents.length > 0) {
        data.stats.parents.value = storedParents.length;
        data.stats.parents.subLabel = "Loaded from registrar parent database";
      }
    } catch {
      // Fallback to default
    }

    return data;
  } catch (error) {
    console.error("Error reading dashboard data from storage:", error);
    return DEFAULT_DASHBOARD_DATA;
  }
}

/**
 * Persist updated dashboard data to localStorage and dispatch custom update event.
 */
export function saveDashboardData(data) {
  try {
    const payload = {
      ...data,
      lastUpdated: new Date().toISOString(),
    };
    localStorage.setItem(DASHBOARD_STORAGE_KEY, JSON.stringify(payload));
    window.dispatchEvent(new Event("adminDashboardUpdated"));
    return payload;
  } catch (error) {
    console.error("Error saving dashboard data:", error);
    return data;
  }
}

/**
 * Mark a single notification as read by ID.
 */
export function markNotificationAsRead(id) {
  const current = getDashboardData();
  const updatedNotifs = current.notifications.map((item) =>
    item.id === id ? { ...item, unread: false } : item
  );
  return saveDashboardData({ ...current, notifications: updatedNotifs });
}

/**
 * Mark all notifications as read.
 */
export function markAllNotificationsAsRead() {
  const current = getDashboardData();
  const updatedNotifs = current.notifications.map((item) => ({
    ...item,
    unread: false,
  }));
  return saveDashboardData({ ...current, notifications: updatedNotifs });
}

/**
 * Dismiss a notification from the list.
 */
export function dismissNotification(id) {
  const current = getDashboardData();
  const updatedNotifs = current.notifications.filter((item) => item.id !== id);
  return saveDashboardData({ ...current, notifications: updatedNotifs });
}

/**
 * Retrieve authenticated administrator details from login storage (if available).
 */
export function getAuthenticatedAdmin() {
  try {
    const rawUser =
      localStorage.getItem("user") || sessionStorage.getItem("user");
    if (rawUser) {
      const user = JSON.parse(rawUser);
      return {
        name: user.name || user.fullName || "Administrator",
        email: user.email || "admin@school.com",
        role: user.role || "School Administrator",
        initials: (user.name || "Administrator")
          .split(" ")
          .map((n) => n[0])
          .slice(0, 2)
          .join("")
          .toUpperCase(),
      };
    }
  } catch {
    // Return default fallback
  }

  return {
    name: "Administrator",
    email: "admin@edumanage.edu",
    role: "School Administrator",
    initials: "SA",
  };
}

