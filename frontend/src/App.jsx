
import { lazy, Suspense } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";

// Home and Authentication
import Home from "./pages/Home";
import Login from "./pages/auth/Login";
// import Signup from "./pages/auth/Signup";
import MainLayout from "./layouts/MainLayout";

// Registrar
const RegistrarRolePage = lazy(() => import("./pages/registrar/RegistrarRolePage"));

// Admin Pages
const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard"));
const ManageStudents = lazy(() => import("./pages/admin/ManageStudents"));
const ManageTeachers = lazy(() => import("./pages/admin/ManageTeachers"));
const ManageClasses = lazy(() => import("./pages/admin/ManageClasses"));
const ManageSubjects = lazy(() => import("./pages/admin/ManageSubjects"));
const ManageUsers = lazy(() => import("./pages/admin/ManageUsers"));
const AdminReports = lazy(() => import("./pages/admin/AdminReports"));
const ManageStaff = lazy(() => import("./pages/admin/ManageStaff"));
const AttendanceManagement = lazy(() => import("./pages/admin/ManageAttendance"));
const SystemSettings = lazy(() => import("./pages/admin/SystemSettings"));
const ManageParents = lazy(() => import("./pages/admin/ManageParents"));
const AcademicYears = lazy(() => import("./pages/admin/AcademicYears"));

// Teacher Pages
const TeacherDashboard = lazy(() => import("./pages/teacher/TeacherDashboard"));
const TeacherAssignments = lazy(() => import("./pages/teacher/Assignments"));
const TeacherAttendance = lazy(() => import("./pages/teacher/Attendance"));
const TeacherExams = lazy(() => import("./pages/teacher/Exams"));
const TeacherGrades = lazy(() => import("./pages/teacher/Grades"));
const MyClasses = lazy(() => import("./pages/teacher/MyClasses"));
const MyStudents = lazy(() => import("./pages/teacher/MyStudents"));
const LearningMaterials = lazy(() => import("./pages/teacher/LearningMaterials"));
const Announcements = lazy(() => import("./pages/teacher/Announcements"));
const TeacherReports = lazy(() => import("./pages/teacher/TeacherReports"));
const Messages = lazy(() => import("./pages/teacher/Messages"));

// Student Pages
const StudentDashboard = lazy(() => import("./pages/student/StudentDashboard"));
const StudentAttendance = lazy(() => import("./pages/student/StudentAttendance"));
const StudentResults = lazy(() => import("./pages/student/StudentResults"));
const StudentAssignments = lazy(() => import("./pages/student/StudentAssignments"));
const StudentMaterials = lazy(() => import("./pages/student/StudentMaterials"));
const StudentTimetable = lazy(() => import("./pages/student/StudentTimetable"));
const StudentAnnouncements = lazy(() => import("./pages/student/StudentAnnouncements"));
const StudentMessages = lazy(() => import("./pages/student/StudentMessages"));
const StudentProfile = lazy(() => import("./pages/student/StudentProfile"));
const StudentFees = lazy(() => import("./pages/student/StudentFees"));
const ApplyAdmission = lazy(
  () => import("./pages/admission/ApplyAdmission")
);
const ForgotPassword = lazy(
  () => import("./pages/auth/ForgotPassword")
);
// Parent Pages
const ParentDashboard = lazy(() => import("./pages/parent/ParentDashboard"));
const ParentChildren = lazy(() => import("./pages/parent/ParentChildren"));
const ParentAttendance = lazy(() => import("./pages/parent/ParentAttendance"));
const ParentResults = lazy(() => import("./pages/parent/ParentResults"));
const ParentAssignments = lazy(() => import("./pages/parent/ParentAssignments"));
const ParentTimetable = lazy(() => import("./pages/parent/ParentTimetable"));
const ParentFees = lazy(() => import("./pages/parent/ParentFees"));
const ParentAnnouncements = lazy(() => import("./pages/parent/ParentAnnouncements"));
const ParentMessages = lazy(() => import("./pages/parent/ParentMessages"));
const ParentReports = lazy(() => import("./pages/parent/ParentReports"));

// Accountant Pages
const AccountantDashboard = lazy(() => import("./pages/accountant/AccountantDashboard"));
const AccountantStudentFees = lazy(() => import("./pages/accountant/AccountantStudentFees"));
const Payments = lazy(() => import("./pages/accountant/Payments"));
const Receipts = lazy(() => import("./pages/accountant/Receipts"));
const Expenses = lazy(() => import("./pages/accountant/Expenses"));
const Income = lazy(() => import("./pages/accountant/Income"));
const OverdueFees = lazy(() => import("./pages/accountant/OverdueFees"));
const FinancialReports = lazy(() => import("./pages/accountant/FinancialReports"));
const AccountantMessages = lazy(() => import("./pages/accountant/AccountantMessages"));
const AccountantProfile = lazy(() => import("./pages/accountant/AccountantProfile"));

// Librarian Pages
const LibrarianDashboard = lazy(() => import("./pages/librarian/LibrarianDashboard"));
const ManageBooks = lazy(() => import("./pages/librarian/ManageBooks"));
const IssueBooks = lazy(() => import("./pages/librarian/IssueBooks"));
const ReturnBooks = lazy(() => import("./pages/librarian/ReturnBooks"));
const OverdueBooks = lazy(() => import("./pages/librarian/OverdueBooks"));
const BookCategories = lazy(() => import("./pages/librarian/BookCategories"));
const LibraryReports = lazy(() => import("./pages/librarian/LibraryReports"));
const LibrarianMessages = lazy(() => import("./pages/librarian/LibrarianMessages"));
const LibrarianProfileSettings = lazy(() => import("./pages/librarian/ProfileSettings"));


function RolePage() {
  const location = useLocation();

  const role = location.pathname.split("/")[1];
  const page = location.pathname.split("/")[2] || "dashboard";

  // ================= LIBRARIAN ROUTES =================

  if (role === "librarian" && page === "dashboard") {
    return <LibrarianDashboard />;
  }

  if (role === "librarian" && page === "books") {
    return <ManageBooks />;
  }

  if (role === "librarian" && page === "issue") {
    return <IssueBooks />;
  }

  if (role === "librarian" && page === "return") {
    return <ReturnBooks />;
  }

  if (role === "librarian" && page === "overdue") {
    return <OverdueBooks />;
  }

  if (role === "librarian" && page === "categories") {
    return <BookCategories />;
  }

  if (role === "librarian" && page === "reports") {
    return <LibraryReports />;
  }

  if (role === "librarian" && page === "messages") {
    return <LibrarianMessages />;
  }

  if (role === "librarian" && page === "profile") {
    return <LibrarianProfileSettings />;
  }

  // ================= ACCOUNTANT ROUTES =================

  if (role === "accountant" && page === "dashboard") {
    return <AccountantDashboard />;
  }

  if (role === "accountant" && page === "fees") {
    return <AccountantStudentFees />;
  }

  if (role === "accountant" && page === "payments") {
    return <Payments />;
  }

  if (role === "accountant" && page === "receipts") {
    return <Receipts />;
  }

  if (role === "accountant" && page === "expenses") {
    return <Expenses />;
  }

  if (role === "accountant" && page === "income") {
    return <Income />;
  }

  if (role === "accountant" && page === "overdue") {
    return <OverdueFees />;
  }

  if (role === "accountant" && page === "reports") {
    return <FinancialReports />;
  }

  if (role === "accountant" && page === "messages") {
    return <AccountantMessages />;
  }

  if (role === "accountant" && page === "profile") {
    return <AccountantProfile />;
  }

  // ================= PARENT ROUTES =================

  if (role === "parent" && page === "dashboard") {
    return <ParentDashboard />;
  }

  if (role === "parent" && page === "children") {
    return <ParentChildren />;
  }

  if (role === "parent" && page === "attendance") {
    return <ParentAttendance />;
  }

  if (role === "parent" && page === "results") {
    return <ParentResults />;
  }

  if (role === "parent" && page === "assignments") {
    return <ParentAssignments />;
  }

  if (role === "parent" && page === "timetable") {
    return <ParentTimetable />;
  }

  if (role === "parent" && page === "fees") {
    return <ParentFees />;
  }

  if (role === "parent" && page === "announcements") {
    return <ParentAnnouncements />;
  }

  if (role === "parent" && page === "messages") {
    return <ParentMessages />;
  }

  if (role === "parent" && page === "reports") {
    return <ParentReports />;
  }
  // ================= ADMIN ROUTES =================

  if (role === "admin" && page === "dashboard") {
    return <AdminDashboard />;
  }

  if (role === "admin" && page === "users") {
    return <ManageUsers />;
  }

  if (role === "admin" && page === "students") {
    return <ManageStudents />;
  }

  if (role === "admin" && page === "attendance") {
    return <AttendanceManagement />;
  }
  if (role === "admin" && page === "teachers") {
    return <ManageTeachers />;
  }

  if (role === "admin" && page === "classes") {
    return <ManageClasses />;
  }
  if (role === "admin" && page === "staff") {
    return <ManageStaff />;
  }
  if (role === "admin" && page === "subjects") {
    return <ManageSubjects />;
  }
  if (role === "admin" && page === "parents") {
    return <ManageParents />;
  }
  if (role === "admin" && page === "academic-years") {
    return <AcademicYears />;
  }
  if (role === "admin" && page === "reports") {
    return <AdminReports />;
  }

  if (role === "admin" && page === "settings") {
    return <SystemSettings />;
  }
  // ================= TEACHER ROUTES =================

  if (role === "teacher" && page === "dashboard") {
    return <TeacherDashboard />;
  }

  if (role === "teacher" && page === "attendance") {
    return <TeacherAttendance />;
  }

  if (role === "teacher" && page === "grades") {
    return <TeacherGrades />;
  }

  if (role === "teacher" && page === "materials") {
    return <LearningMaterials />;
  }

  if (role === "teacher" && page === "messages") {
    return <Messages />;
  }

  if (role === "teacher" && page === "assignments") {
    return <TeacherAssignments />;
  }

  if (role === "teacher" && page === "exams") {
    return <TeacherExams />;
  }

  if (role === "teacher" && page === "my-classes") {
    return <MyClasses />;
  }

  if (role === "teacher" && page === "students") {
    return <MyStudents />;
  }

  if (role === "teacher" && page === "announcements") {
    return <Announcements />;
  }

  if (role === "teacher" && page === "reports") {
    return <TeacherReports />;
  }

  // ================= STUDENT ROUTES =================

  if (role === "student" && page === "dashboard") {
    return <StudentDashboard />;
  }

  if (role === "student" && page === "attendance") {
    return <StudentAttendance />;
  }

  if (role === "student" && page === "results") {
    return <StudentResults />;
  }

  if (role === "student" && page === "assignments") {
    return <StudentAssignments />;
  }

  if (role === "student" && page === "announcements") {
    return <StudentAnnouncements />;
  }

  if (role === "student" && page === "materials") {
    return <StudentMaterials />;
  }

  if (role === "student" && page === "timetable") {
    return <StudentTimetable />;
  }

  if (role === "student" && page === "messages") {
    return <StudentMessages />;
  }

  if (role === "student" && page === "profile") {
    return <StudentProfile />;
  }

  if (role === "student" && page === "fees") {
    return <StudentFees />;
  }

  // ================= DEFAULT PAGE =================

  const title = page
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

  return (
    <div>
      <h2>{title}</h2>
      <p>
        Welcome to the {role} section of the School Management System.
      </p>
      <p>This page will be developed in the next steps.</p>
    </div>
  );
}
// ================= MAIN APP =================

function App() {
  return (
    <BrowserRouter>
      <Suspense
        fallback={
          <div className="loading-screen">
            Loading...
          </div>
        }
      >
        <Routes>
          {/* Public Pages */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          {/* <Route path="/signup" element={<Signup />} /> */}

          {/* Admission Application Page */}
          <Route
            path="/admission"
            element={<ApplyAdmission />}
          />

          {/* Registrar Pages */}
          <Route
            path="/registrar/*"
            element={<RegistrarRolePage />}
          />

          {/* Role-Based Dashboard Pages */}
          <Route path="/:role/*" element={<MainLayout />}>
            <Route index element={<RolePage />} />
            <Route path="*" element={<RolePage />} />
          </Route>
          <Route path="/forgot-password" element={<ForgotPassword />} />
          {/* Not Found */}
          <Route
            path="*"
            element={
              <div style={{ textAlign: "center", padding: "80px 20px" }}>
                <h1>404 - Page Not Found</h1>
                <p>The page you are looking for does not exist.</p>
                <a href="/">Return Home</a>
              </div>
            }
          />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

export default App;