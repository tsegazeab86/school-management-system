
import {
  Users, GraduationCap, BriefcaseBusiness,
  UserRound, BookOpen, School, UserPlus,
  ClipboardList, Activity, Bell, TrendingUp,
  CalendarDays, ArrowUpRight, Clock
} from "lucide-react";
import "../../styles/admin/AdminDashboard.css";



const statistics = [
  { title: "Total Students", value: "1,250", change: "+12%", icon: GraduationCap, color: "purple" },
  { title: "Total Teachers", value: "85", change: "+5%", icon: Users, color: "blue" },
  { title: "Total Staff", value: "32", change: "+3%", icon: BriefcaseBusiness, color: "orange" },
  { title: "Total Parents", value: "980", change: "+8%", icon: UserRound, color: "green" },
  { title: "Total Classes", value: "36", change: "+2", icon: School, color: "pink" },
  { title: "Total Subjects", value: "24", change: "+4", icon: BookOpen, color: "cyan" },
];

const activities = [
  { title: "New student registered", person: "Abebe Kebede", time: "10 minutes ago" },
  { title: "Teacher account created", person: "Martha Tadesse", time: "35 minutes ago" },
  { title: "New class added", person: "Grade 10 - Section A", time: "1 hour ago" },
  { title: "Parent information updated", person: "Dawit Getachew", time: "2 hours ago" },
];

const notifications = [
  "5 new student registrations need review.",
  "Academic year 2026 registration is active.",
  "3 pending account requests require attention.",
];

function AdminDashboard() {
  return (
    <div className="admin-dashboard">

      <div className="admin-welcome">
        <div>
          <span className="admin-eyebrow">ADMINISTRATION OVERVIEW</span>
          <h1>Welcome back, Administrator!</h1>
          <p>Here is what's happening in your school today.</p>
        </div>
        <div className="admin-welcome-date">
          <CalendarDays size={18} />
          Academic Year 2026
        </div>
      </div>

      <div className="admin-stats-grid">
        {statistics.map((item) => {
          const Icon = item.icon;
          return (
            <div className="admin-stat-card" key={item.title}>
              <div className={`admin-stat-icon ${item.color}`}>
                <Icon size={23} />
              </div>
              <div className="admin-stat-info">
                <span>{item.title}</span>
                <h2>{item.value}</h2>
                <small><TrendingUp size={13} /> {item.change} from last month</small>
              </div>
              <ArrowUpRight className="admin-stat-arrow" size={18} />
            </div>
          );
        })}
      </div>

      <div className="admin-overview-grid">

        <section className="admin-panel">
          <div className="admin-panel-heading">
            <div>
              <h3>New Registrations</h3>
              <p>Recent student registration overview</p>
            </div>
            <UserPlus size={21} />
          </div>

          <div className="admin-registration-number">
            <strong>48</strong>
            <span>New registrations this month</span>
          </div>

          <div className="admin-progress-list">
            <div>
              <span>Grade 1–4</span>
              <strong>18 students</strong>
            </div>
            <div className="admin-progress-track">
              <div style={{ width: "75%" }} />
            </div>

            <div>
              <span>Grade 5–8</span>
              <strong>20 students</strong>
            </div>
            <div className="admin-progress-track">
              <div style={{ width: "85%" }} />
            </div>

            <div>
              <span>Grade 9–12</span>
              <strong>10 students</strong>
            </div>
            <div className="admin-progress-track">
              <div style={{ width: "45%" }} />
            </div>
          </div>
        </section>

        <section className="admin-panel">
          <div className="admin-panel-heading">
            <div>
              <h3>Pending Requests</h3>
              <p>Requests waiting for administrator review</p>
            </div>
            <ClipboardList size={21} />
          </div>

          <div className="admin-pending-list">
            <div>
              <span className="admin-pending-icon orange"><UserPlus /></span>
              <div><strong>Student Admissions</strong><small>5 requests</small></div>
              <b>05</b>
            </div>
            <div>
              <span className="admin-pending-icon blue"><Users /></span>
              <div><strong>Teacher Accounts</strong><small>2 requests</small></div>
              <b>02</b>
            </div>
            <div>
              <span className="admin-pending-icon purple"><ClipboardList /></span>
              <div><strong>Transfer Requests</strong><small>3 requests</small></div>
              <b>03</b>
            </div>
          </div>
        </section>

      </div>

      <div className="admin-overview-grid">

        <section className="admin-panel">
          <div className="admin-panel-heading">
            <div>
              <h3>Recent System Activities</h3>
              <p>Latest actions performed in the system</p>
            </div>
            <Activity size={21} />
          </div>

          <div className="admin-activity-list">
            {activities.map((activity, index) => (
              <div className="admin-activity-item" key={index}>
                <span className="admin-activity-dot" />
                <div>
                  <strong>{activity.title}</strong>
                  <p>{activity.person}</p>
                  <small><Clock size={12} /> {activity.time}</small>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="admin-panel">
          <div className="admin-panel-heading">
            <div>
              <h3>Notifications</h3>
              <p>Important school updates</p>
            </div>
            <Bell size={21} />
          </div>

          <div className="admin-notification-list">
            {notifications.map((notice, index) => (
              <div className="admin-notification-item" key={index}>
                <span className="admin-notification-dot" />
                <p>{notice}</p>
              </div>
            ))}
          </div>

          <div className="admin-academic-summary">
            <span>Current Academic Year</span>
            <h3>2026 / 2027</h3>
            <small>School year is currently active</small>
          </div>
        </section>

      </div>

    </div>
  );
}

export default AdminDashboard;
