import   { useState } from "react";
import {
  BookOpen,
  BookPlus,
  Users,
  AlertTriangle,
  RotateCcw,
  TrendingUp,
  Search,
  Clock,
  ArrowUpRight,
  Library,
} from "lucide-react";
import "./LibrarianDashboard.css";

// Sample activity data
const initialActivities = [
  {
    id: 1,
    title: "New Book Added",
    description: "Clean Code was added to the library.",
    time: "10 minutes ago",
    type: "book",
  },
  {
    id: 2,
    title: "Book Issued",
    description: "A student borrowed a Mathematics book.",
    time: "30 minutes ago",
    type: "issue",
  },
  {
    id: 3,
    title: "Book Returned",
    description: "A student returned a Science book.",
    time: "1 hour ago",
    type: "return",
  },
  {
    id: 4,
    title: "Overdue Book",
    description: "A student has an overdue History book.",
    time: "2 hours ago",
    type: "overdue",
  },
];

function LibrarianDashboard() {
  const [activities, setActivities] = useState(initialActivities);
  const [search, setSearch] = useState("");

  // Filter activities based on search
  const filteredActivities = activities.filter((activity) =>
    `${activity.title} ${activity.description}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  // Dashboard statistics
  const stats = [
    {
      title: "Total Books",
      value: "2,450",
      change: "+12 this month",
      icon: BookOpen,
      color: "purple",
    },
    {
      title: "Issued Books",
      value: "385",
      change: "Currently borrowed",
      icon: BookPlus,
      color: "blue",
    },
    {
      title: "Available Books",
      value: "1,920",
      change: "Ready to borrow",
      icon: Library,
      color: "green",
    },
    {
      title: "Overdue Books",
      value: "45",
      change: "Requires attention",
      icon: AlertTriangle,
      color: "orange",
    },
  ];

  const getActivityIcon = (type) => {
    switch (type) {
      case "book":
        return <BookPlus size={19} />;
      case "issue":
        return <BookOpen size={19} />;
      case "return":
        return <RotateCcw size={19} />;
      case "overdue":
        return <AlertTriangle size={19} />;
      default:
        return <Clock size={19} />;
    }
  };

  const getActivityClass = (type) => {
    switch (type) {
      case "book":
        return "activity-purple";
      case "issue":
        return "activity-blue";
      case "return":
        return "activity-green";
      case "overdue":
        return "activity-orange";
      default:
        return "";
    }
  };

  // Example function to add an activity
  const addActivity = () => {
    const newActivity = {
      id: Date.now(),
      title: "New Activity",
      description: "A new library activity was recorded.",
      time: "Just now",
      type: "book",
    };

    setActivities((previousActivities) => [
      newActivity,
      ...previousActivities,
    ]);
  };

  return (
    <div className="librarian-dashboard">
      {/* Header */}
      <div className="librarian-header">
        <div>
          <span className="librarian-subtitle">LIBRARY MANAGEMENT</span>
          <h1>Librarian Dashboard</h1>
          <p>Welcome back! Here is your library overview.</p>
        </div>

        <button className="librarian-add-btn" onClick={addActivity}>
          <BookPlus size={18} />
          Add Activity
        </button>
      </div>

      {/* Statistics */}
      <div className="librarian-stats">
        {stats.map((stat, index) => {
          const Icon = stat.icon;

          return (
            <div className="librarian-stat-card" key={index}>
              <div className={`librarian-stat-icon ${stat.color}`}>
                <Icon size={24} />
              </div>

              <div>
                <p>{stat.title}</p>
                <h2>{stat.value}</h2>
                <span>{stat.change}</span>
              </div>

              <ArrowUpRight className="librarian-stat-arrow" size={20} />
            </div>
          );
        })}
      </div>

      {/* Main Content */}
      <div className="librarian-dashboard-grid">
        {/* Activities */}
        <section className="librarian-panel">
          <div className="librarian-panel-header">
            <div>
              <h2>Recent Activities</h2>
              <p>Latest library operations</p>
            </div>

            <TrendingUp size={22} />
          </div>

          {/* Search */}
          <div className="librarian-search">
            <Search size={18} />

            <input
              type="text"
              placeholder="Search activities..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>

          {/* Activity List */}
          <div className="librarian-activity-list">
            {filteredActivities.length > 0 ? (
              filteredActivities.map((activity) => (
                <div className="librarian-activity" key={activity.id}>
                  <div
                    className={`librarian-activity-icon ${getActivityClass(
                      activity.type
                    )}`}
                  >
                    {getActivityIcon(activity.type)}
                  </div>

                  <div className="librarian-activity-info">
                    <h4>{activity.title}</h4>
                    <p>{activity.description}</p>
                    <span>
                      <Clock size={13} />
                      {activity.time}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="librarian-empty">
                <Search size={30} />
                <p>No activities found.</p>
              </div>
            )}
          </div>
        </section>

        {/* Quick Actions */}
        <section className="librarian-panel">
          <div className="librarian-panel-header">
            <div>
              <h2>Quick Actions</h2>
              <p>Frequently used operations</p>
            </div>
            <Users size={22} />
          </div>

          <div className="librarian-quick-actions">
            <button>
              <BookPlus size={21} />
              <span>
                <strong>Manage Books</strong>
                <small>Add and update library books</small>
              </span>
              <ArrowUpRight size={18} />
            </button>

            <button>
              <BookOpen size={21} />
              <span>
                <strong>Issue Books</strong>
                <small>Issue books to students</small>
              </span>
              <ArrowUpRight size={18} />
            </button>

            <button>
              <RotateCcw size={21} />
              <span>
                <strong>Return Books</strong>
                <small>Process returned books</small>
              </span>
              <ArrowUpRight size={18} />
            </button>

            <button>
              <AlertTriangle size={21} />
              <span>
                <strong>Overdue Books</strong>
                <small>Check overdue records</small>
              </span>
              <ArrowUpRight size={18} />
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}

export default LibrarianDashboard;