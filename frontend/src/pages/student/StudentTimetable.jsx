
import   { useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  CalendarDays,
  Clock,
  MapPin,
  User,
  Search,
  BookOpen,
  GraduationCap,
  CalendarCheck,
  ChevronLeft,
  ChevronRight,
//   Coffee,
  Laptop,
} from "lucide-react";
import "./StudentTimetable.css";

const days = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

const timetable = [
  {
    id: 1,
    day: "Monday",
    start: "08:00",
    end: "09:00",
    subject: "Web Development",
    teacher: "Mr. Daniel",
    room: "Room 101",
    type: "Lecture",
    color: "blue",
  },
  {
    id: 2,
    day: "Monday",
    start: "09:00",
    end: "10:00",
    subject: "Database Systems",
    teacher: "Mrs. Hana",
    room: "Room 203",
    type: "Lecture",
    color: "purple",
  },
  {
    id: 3,
    day: "Monday",
    start: "10:30",
    end: "12:00",
    subject: "Data Structures",
    teacher: "Mr. Samuel",
    room: "Computer Lab 1",
    type: "Practical",
    color: "orange",
  },
  {
    id: 4,
    day: "Tuesday",
    start: "08:00",
    end: "09:30",
    subject: "Computer Networks",
    teacher: "Mrs. Selam",
    room: "Room 105",
    type: "Lecture",
    color: "green",
  },
  {
    id: 5,
    day: "Tuesday",
    start: "10:00",
    end: "11:00",
    subject: "Java Programming",
    teacher: "Mr. Daniel",
    room: "Computer Lab 2",
    type: "Practical",
    color: "blue",
  },
  {
    id: 6,
    day: "Wednesday",
    start: "08:00",
    end: "09:00",
    subject: "Database Systems",
    teacher: "Mrs. Hana",
    room: "Room 203",
    type: "Lecture",
    color: "purple",
  },
  {
    id: 7,
    day: "Wednesday",
    start: "09:30",
    end: "11:00",
    subject: "Web Development",
    teacher: "Mr. Daniel",
    room: "Computer Lab 1",
    type: "Practical",
    color: "blue",
  },
  {
    id: 8,
    day: "Thursday",
    start: "08:00",
    end: "09:30",
    subject: "Data Structures",
    teacher: "Mr. Samuel",
    room: "Room 102",
    type: "Lecture",
    color: "orange",
  },
  {
    id: 9,
    day: "Thursday",
    start: "10:00",
    end: "11:00",
    subject: "Computer Networks",
    teacher: "Mrs. Selam",
    room: "Computer Lab 2",
    type: "Practical",
    color: "green",
  },
  {
    id: 10,
    day: "Friday",
    start: "08:00",
    end: "09:00",
    subject: "Java Programming",
    teacher: "Mr. Daniel",
    room: "Room 104",
    type: "Lecture",
    color: "blue",
  },
  {
    id: 11,
    day: "Friday",
    start: "09:30",
    end: "11:00",
    subject: "Database Systems",
    teacher: "Mrs. Hana",
    room: "Computer Lab 1",
    type: "Practical",
    color: "purple",
  },
  {
    id: 12,
    day: "Saturday",
    start: "08:00",
    end: "09:00",
    subject: "Web Development",
    teacher: "Mr. Daniel",
    room: "Room 101",
    type: "Tutorial",
    color: "blue",
  },
];

const timeSlots = [
  "08:00",
  "09:00",
  "10:00",
  "11:00",
  "12:00",
  "13:00",
  "14:00",
];

function formatTime(time) {
  const [hour, minute] = time.split(":").map(Number);
  const period = hour >= 12 ? "PM" : "AM";
  const displayHour = hour % 12 || 12;
  return `${displayHour}:${String(minute).padStart(2, "0")} ${period}`;
}

function StudentTimetable() {
  const [selectedDay, setSelectedDay] = useState("All");
  const [search, setSearch] = useState("");
  const [selectedClass, setSelectedClass] = useState(null);
  const [weekOffset, setWeekOffset] = useState(0);

  const filteredClasses = useMemo(() => {
    return timetable.filter((item) => {
      const matchesDay =
        selectedDay === "All" || item.day === selectedDay;

      const term = search.toLowerCase();
      const matchesSearch =
        item.subject.toLowerCase().includes(term) ||
        item.teacher.toLowerCase().includes(term) ||
        item.room.toLowerCase().includes(term);

      return matchesDay && matchesSearch;
    });
  }, [selectedDay, search]);

  const totalClasses = timetable.length;
  const practicalClasses = timetable.filter(
    (item) => item.type === "Practical"
  ).length;

  const selectedDayClasses = selectedDay === "All"
    ? timetable.length
    : timetable.filter((item) => item.day === selectedDay).length;

  const todayName = new Date().toLocaleDateString("en-US", {
    weekday: "long",
  });

  const todayClasses = timetable.filter(
    (item) => item.day === todayName
  );

  const getWeekLabel = () => {
    const current = new Date();
    current.setDate(current.getDate() + weekOffset * 7);
    return current.toLocaleDateString("en-US", {
      month: "long",
      year: "numeric",
    });
  };

  return (
    <div className="student-timetable">
      {/* Header */}
      <motion.div
        className="st-header"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div>
          <span className="st-eyebrow">STUDENT PORTAL</span>
          <h1>My Timetable</h1>
          <p>Plan your week and stay organized with your class schedule.</p>
        </div>

        <div className="st-header-icon">
          <CalendarDays size={36} />
        </div>
      </motion.div>

      {/* Statistics */}
      <div className="st-stats">
        <motion.div className="st-stat-card" whileHover={{ y: -5 }}>
          <div className="st-stat-icon st-blue">
            <BookOpen size={22} />
          </div>
          <div>
            <span>Weekly Classes</span>
            <h2>{totalClasses}</h2>
          </div>
        </motion.div>

        <motion.div className="st-stat-card" whileHover={{ y: -5 }}>
          <div className="st-stat-icon st-purple">
            <Laptop size={22} />
          </div>
          <div>
            <span>Practical Classes</span>
            <h2>{practicalClasses}</h2>
          </div>
        </motion.div>

        <motion.div className="st-stat-card" whileHover={{ y: -5 }}>
          <div className="st-stat-icon st-green">
            <CalendarCheck size={22} />
          </div>
          <div>
            <span>Today's Classes</span>
            <h2>{todayClasses.length}</h2>
          </div>
        </motion.div>

        <motion.div className="st-stat-card" whileHover={{ y: -5 }}>
          <div className="st-stat-icon st-orange">
            <GraduationCap size={22} />
          </div>
          <div>
            <span>Selected Day</span>
            <h2>{selectedDayClasses}</h2>
          </div>
        </motion.div>
      </div>

      {/* Today overview */}
      <div className="st-today-panel">
        <div className="st-today-icon">
          <CalendarCheck size={24} />
        </div>
        <div>
          <span>TODAY'S SCHEDULE</span>
          <h3>{todayName}</h3>
          <p>
            {todayClasses.length
              ? `${todayClasses.length} classes scheduled for today.`
              : "No classes scheduled for today."}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="st-toolbar">
        <div className="st-search">
          <Search size={19} />
          <input
            type="text"
            placeholder="Search subject, teacher, or room..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <select
          className="st-day-select"
          value={selectedDay}
          onChange={(e) => setSelectedDay(e.target.value)}
        >
          <option value="All">All Days</option>
          {days.map((day) => (
            <option key={day} value={day}>{day}</option>
          ))}
        </select>
      </div>

      {/* Week heading */}
      <div className="st-week-heading">
        <div>
          <h2>Weekly Class Schedule</h2>
          <p>Click any class to see more information.</p>
        </div>

        <div className="st-week-controls">
          <button onClick={() => setWeekOffset((value) => value - 1)}>
            <ChevronLeft size={18} />
          </button>
          <span>{getWeekLabel()}</span>
          <button onClick={() => setWeekOffset((value) => value + 1)}>
            <ChevronRight size={18} />
          </button>
          <button
            className="st-current-week"
            onClick={() => setWeekOffset(0)}
          >
            This Week
          </button>
        </div>
      </div>

      {/* Timetable grid */}
      <div className="st-table-wrapper">
        <div className="st-table">
          <div className="st-time-column">
            <div className="st-day-heading">TIME</div>
            {timeSlots.map((time) => (
              <div className="st-time-cell" key={time}>
                {formatTime(time)}
              </div>
            ))}
          </div>

          {days
            .filter((day) => selectedDay === "All" || selectedDay === day)
            .map((day) => (
              <div className="st-day-column" key={day}>
                <div className="st-day-heading">{day.slice(0, 3).toUpperCase()}</div>

                {timeSlots.map((time) => {
                  const classItem = filteredClasses.find(
                    (item) =>
                      item.day === day &&
                      item.start === time
                  );

                  return (
                    <div className="st-slot" key={`${day}-${time}`}>
                      {classItem && (
                        <motion.button
                          className={`st-class-card st-${classItem.color}`}
                          whileHover={{ scale: 1.03 }}
                          onClick={() => setSelectedClass(classItem)}
                        >
                          <strong>{classItem.subject}</strong>
                          <span>{formatTime(classItem.start)}</span>
                          <small>{classItem.room}</small>
                        </motion.button>
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
        </div>
      </div>

      {/* Class list */}
      <div className="st-list-section">
        <div className="st-week-heading">
          <div>
            <h2>Class Details</h2>
            <p>{filteredClasses.length} classes found</p>
          </div>
        </div>

        <div className="st-class-list">
          {filteredClasses.map((item) => (
            <motion.button
              key={item.id}
              className="st-list-item"
              whileHover={{ x: 5 }}
              onClick={() => setSelectedClass(item)}
            >
              <div className={`st-list-color st-${item.color}`} />
              <div className="st-list-main">
                <strong>{item.subject}</strong>
                <span>{item.day} · {item.teacher}</span>
              </div>
              <div className="st-list-time">
                <Clock size={15} />
                {formatTime(item.start)} – {formatTime(item.end)}
              </div>
              <div className="st-list-room">
                <MapPin size={15} />
                {item.room}
              </div>
            </motion.button>
          ))}

          {filteredClasses.length === 0 && (
            <div className="st-empty">
              <Search size={30} />
              <h3>No classes found</h3>
              <p>Try another day or search term.</p>
            </div>
          )}
        </div>
      </div>

      {/* Class detail modal */}
      {selectedClass && (
        <div
          className="st-modal-overlay"
          onClick={() => setSelectedClass(null)}
        >
          <motion.div
            className="st-modal"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="st-modal-close"
              onClick={() => setSelectedClass(null)}
            >
              ×
            </button>

            <span className="st-modal-label">CLASS INFORMATION</span>
            <h2>{selectedClass.subject}</h2>

            <div className="st-modal-detail">
              <User size={19} />
              <div>
                <span>Teacher</span>
                <strong>{selectedClass.teacher}</strong>
              </div>
            </div>

            <div className="st-modal-detail">
              <CalendarDays size={19} />
              <div>
                <span>Day</span>
                <strong>{selectedClass.day}</strong>
              </div>
            </div>

            <div className="st-modal-detail">
              <Clock size={19} />
              <div>
                <span>Class Time</span>
                <strong>
                  {formatTime(selectedClass.start)} – {formatTime(selectedClass.end)}
                </strong>
              </div>
            </div>

            <div className="st-modal-detail">
              <MapPin size={19} />
              <div>
                <span>Classroom</span>
                <strong>{selectedClass.room}</strong>
              </div>
            </div>

            <div className="st-modal-detail">
              <BookOpen size={19} />
              <div>
                <span>Class Type</span>
                <strong>{selectedClass.type}</strong>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}

export default StudentTimetable;
