
import { useState } from "react";
import {
    CalendarDays,
    Clock,
    BookOpen,
    UserRound,
    MapPin,
    ChevronLeft,
    ChevronRight,
    GraduationCap,
    Coffee,
    School,
    CalendarCheck,
    Sparkles,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import "./ParentTimetable.css";

const timetableData = {
    "Abebe Tadesse": {
        grade: "Grade 10 - Section A",
        schedule: {
            Monday: [
                { time: "08:00 - 09:00", subject: "Mathematics", teacher: "Mr. Daniel", room: "Room 101" },
                { time: "09:00 - 10:00", subject: "English", teacher: "Mrs. Sara", room: "Room 102" },
                { time: "10:30 - 11:30", subject: "Physics", teacher: "Mr. Michael", room: "Lab 1" },
                { time: "11:30 - 12:30", subject: "Biology", teacher: "Mrs. Hana", room: "Room 104" },
                { time: "14:00 - 15:00", subject: "Chemistry", teacher: "Mr. Samuel", room: "Lab 2" },
            ],
            Tuesday: [
                { time: "08:00 - 09:00", subject: "English", teacher: "Mrs. Sara", room: "Room 102" },
                { time: "09:00 - 10:00", subject: "Mathematics", teacher: "Mr. Daniel", room: "Room 101" },
                { time: "10:30 - 11:30", subject: "History", teacher: "Mr. Bekele", room: "Room 105" },
                { time: "11:30 - 12:30", subject: "Physics", teacher: "Mr. Michael", room: "Lab 1" },
                { time: "14:00 - 15:00", subject: "ICT", teacher: "Mrs. Meron", room: "Computer Lab" },
            ],
            Wednesday: [
                { time: "08:00 - 09:00", subject: "Biology", teacher: "Mrs. Hana", room: "Room 104" },
                { time: "09:00 - 10:00", subject: "Chemistry", teacher: "Mr. Samuel", room: "Lab 2" },
                { time: "10:30 - 11:30", subject: "Mathematics", teacher: "Mr. Daniel", room: "Room 101" },
                { time: "11:30 - 12:30", subject: "English", teacher: "Mrs. Sara", room: "Room 102" },
                { time: "14:00 - 15:00", subject: "Physical Education", teacher: "Mr. Yonas", room: "Playground" },
            ],
            Thursday: [
                { time: "08:00 - 09:00", subject: "Physics", teacher: "Mr. Michael", room: "Lab 1" },
                { time: "09:00 - 10:00", subject: "History", teacher: "Mr. Bekele", room: "Room 105" },
                { time: "10:30 - 11:30", subject: "ICT", teacher: "Mrs. Meron", room: "Computer Lab" },
                { time: "11:30 - 12:30", subject: "Mathematics", teacher: "Mr. Daniel", room: "Room 101" },
                { time: "14:00 - 15:00", subject: "English", teacher: "Mrs. Sara", room: "Room 102" },
            ],
            Friday: [
                { time: "08:00 - 09:00", subject: "Chemistry", teacher: "Mr. Samuel", room: "Lab 2" },
                { time: "09:00 - 10:00", subject: "Biology", teacher: "Mrs. Hana", room: "Room 104" },
                { time: "10:30 - 11:30", subject: "English", teacher: "Mrs. Sara", room: "Room 102" },
                { time: "11:30 - 12:30", subject: "History", teacher: "Mr. Bekele", room: "Room 105" },
                { time: "14:00 - 15:00", subject: "Physical Education", teacher: "Mr. Yonas", room: "Playground" },
            ],
        },
    },

    "Hana Tadesse": {
        grade: "Grade 7 - Section B",
        schedule: {
            Monday: [
                { time: "08:00 - 09:00", subject: "Mathematics", teacher: "Mr. Dawit", room: "Room 201" },
                { time: "09:00 - 10:00", subject: "Amharic", teacher: "Mr. Getachew", room: "Room 202" },
                { time: "10:30 - 11:30", subject: "Science", teacher: "Mrs. Almaz", room: "Lab 3" },
                { time: "11:30 - 12:30", subject: "English", teacher: "Mrs. Rahel", room: "Room 203" },
                { time: "14:00 - 15:00", subject: "Art", teacher: "Mrs. Selam", room: "Room 204" },
            ],
            Tuesday: [
                { time: "08:00 - 09:00", subject: "English", teacher: "Mrs. Rahel", room: "Room 203" },
                { time: "09:00 - 10:00", subject: "Mathematics", teacher: "Mr. Dawit", room: "Room 201" },
                { time: "10:30 - 11:30", subject: "History", teacher: "Mr. Elias", room: "Room 205" },
                { time: "11:30 - 12:30", subject: "Science", teacher: "Mrs. Almaz", room: "Lab 3" },
                { time: "14:00 - 15:00", subject: "ICT", teacher: "Mr. Henok", room: "Computer Lab" },
            ],
            Wednesday: [
                { time: "08:00 - 09:00", subject: "Amharic", teacher: "Mr. Getachew", room: "Room 202" },
                { time: "09:00 - 10:00", subject: "Science", teacher: "Mrs. Almaz", room: "Lab 3" },
                { time: "10:30 - 11:30", subject: "Mathematics", teacher: "Mr. Dawit", room: "Room 201" },
                { time: "11:30 - 12:30", subject: "English", teacher: "Mrs. Rahel", room: "Room 203" },
                { time: "14:00 - 15:00", subject: "Physical Education", teacher: "Mr. Yared", room: "Playground" },
            ],
            Thursday: [
                { time: "08:00 - 09:00", subject: "Science", teacher: "Mrs. Almaz", room: "Lab 3" },
                { time: "09:00 - 10:00", subject: "History", teacher: "Mr. Elias", room: "Room 205" },
                { time: "10:30 - 11:30", subject: "ICT", teacher: "Mr. Henok", room: "Computer Lab" },
                { time: "11:30 - 12:30", subject: "Mathematics", teacher: "Mr. Dawit", room: "Room 201" },
                { time: "14:00 - 15:00", subject: "Amharic", teacher: "Mr. Getachew", room: "Room 202" },
            ],
            Friday: [
                { time: "08:00 - 09:00", subject: "English", teacher: "Mrs. Rahel", room: "Room 203" },
                { time: "09:00 - 10:00", subject: "Science", teacher: "Mrs. Almaz", room: "Lab 3" },
                { time: "10:30 - 11:30", subject: "Art", teacher: "Mrs. Selam", room: "Room 204" },
                { time: "11:30 - 12:30", subject: "Amharic", teacher: "Mr. Getachew", room: "Room 202" },
                { time: "14:00 - 15:00", subject: "Physical Education", teacher: "Mr. Yared", room: "Playground" },
            ],
        },
    },
};

const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

const subjectColors = {
    Mathematics: "math",
    English: "english",
    Physics: "physics",
    Biology: "biology",
    Chemistry: "chemistry",
    History: "history",
    ICT: "ict",
    Science: "science",
    Amharic: "amharic",
    Art: "art",
    "Physical Education": "sports",
};

function ParentTimetable() {
    const [selectedChild, setSelectedChild] = useState("Abebe Tadesse");
    const [selectedDay, setSelectedDay] = useState("Monday");

    const child = timetableData[selectedChild];
    const classes = child.schedule[selectedDay] || [];

    const totalClasses = Object.values(child.schedule).reduce(
        (total, dayClasses) => total + dayClasses.length,
        0
    );

    const totalSubjects = new Set(
        Object.values(child.schedule)
            .flat()
            .map((item) => item.subject)
    ).size;

    return (
        <div className="parent-timetable-page container-fluid">
            {/* Hero Header */}
            <motion.div
                className="pt-hero"
                initial={{ opacity: 0, y: -25 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
            >
                <div className="pt-hero-content">
                    <span className="pt-hero-label">
                        <Sparkles size={15} /> WEEKLY LEARNING PLAN
                    </span>
                    <h2>Class Timetable</h2>
                    <p>
                        Stay connected with your child's weekly school schedule and
                        classroom activities.
                    </p>

                    <div className="pt-hero-student">
                        <div className="pt-student-avatar">
                            <GraduationCap size={25} />
                        </div>
                        <div>
                            <strong>{selectedChild}</strong>
                            <span>{child.grade}</span>
                        </div>
                    </div>
                </div>

                <div className="pt-hero-decoration">
                    <CalendarDays size={115} strokeWidth={1} />
                </div>
            </motion.div>

            {/* Child Selection */}
            <div className="pt-child-selector">
                <div>
                    <span className="pt-section-label">SELECT CHILD</span>
                    <h4>Whose timetable would you like to view?</h4>
                </div>

                <div className="pt-child-buttons">
                    {Object.keys(timetableData).map((name) => (
                        <button
                            key={name}
                            className={`pt-child-button ${selectedChild === name ? "active" : ""
                                }`}
                            onClick={() => {
                                setSelectedChild(name);
                                setSelectedDay("Monday");
                            }}
                        >
                            <UserRound size={17} />
                            {name}
                        </button>
                    ))}
                </div>
            </div>

            {/* Statistics */}
            <div className="row g-4 pt-stat-row">
                <div className="col-12 col-sm-6 col-xl-4">
                    <motion.div className="pt-stat-card" whileHover={{ y: -7 }}>
                        <div className="pt-stat-icon purple">
                            <CalendarCheck size={25} />
                        </div>
                        <div>
                            <span>School Days</span>
                            <h3>{days.length}</h3>
                            <small>Monday to Friday</small>
                        </div>
                    </motion.div>
                </div>

                <div className="col-12 col-sm-6 col-xl-4">
                    <motion.div className="pt-stat-card" whileHover={{ y: -7 }}>
                        <div className="pt-stat-icon blue">
                            <BookOpen size={25} />
                        </div>
                        <div>
                            <span>Weekly Classes</span>
                            <h3>{totalClasses}</h3>
                            <small>Lessons per week</small>
                        </div>
                    </motion.div>
                </div>

                <div className="col-12 col-sm-6 col-xl-4">
                    <motion.div className="pt-stat-card" whileHover={{ y: -7 }}>
                        <div className="pt-stat-icon orange">
                            <GraduationCap size={25} />
                        </div>
                        <div>
                            <span>Total Subjects</span>
                            <h3>{totalSubjects}</h3>
                            <small>Different subjects</small>
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* Day Navigation */}
            <div className="pt-schedule-heading">
                <div>
                    <span className="pt-section-label">WEEKLY SCHEDULE</span>
                    <h3>Class Schedule</h3>
                    <p>Select a day to view its classes.</p>
                </div>
            </div>

            <div className="pt-day-navigation">
                <button
                    className="pt-day-arrow"
                    onClick={() => {
                        const index = days.indexOf(selectedDay);
                        setSelectedDay(days[Math.max(0, index - 1)]);
                    }}
                    disabled={selectedDay === days[0]}
                    aria-label="Previous day"
                >
                    <ChevronLeft size={20} />
                </button>

                <div className="pt-day-tabs">
                    {days.map((day, index) => (
                        <button
                            key={day}
                            className={`pt-day-tab ${selectedDay === day ? "active" : ""}`}
                            onClick={() => setSelectedDay(day)}
                        >
                            <span className="pt-day-number">0{index + 1}</span>
                            <strong>{day}</strong>
                        </button>
                    ))}
                </div>

                <button
                    className="pt-day-arrow"
                    onClick={() => {
                        const index = days.indexOf(selectedDay);
                        setSelectedDay(days[Math.min(days.length - 1, index + 1)]);
                    }}
                    disabled={selectedDay === days[days.length - 1]}
                    aria-label="Next day"
                >
                    <ChevronRight size={20} />
                </button>
            </div>

            {/* Selected Day */}
            <AnimatePresence mode="wait">
                <motion.div
                    key={`${selectedChild}-${selectedDay}`}
                    className="pt-class-list"
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                >
                    <div className="pt-list-header">
                        <div>
                            <h4>{selectedDay}</h4>
                            <p>{child.grade} · {classes.length} scheduled classes</p>
                        </div>
                        <span className="pt-live-label">
                            <span /> Weekly timetable
                        </span>
                    </div>

                    {classes.map((item, index) => (
                        <motion.div
                            key={`${item.time}-${item.subject}`}
                            className="pt-class-card"
                            initial={{ opacity: 0, x: -15 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.07 }}
                            whileHover={{ x: 5, scale: 1.005 }}
                        >
                            <div className="pt-time-column">
                                <Clock size={16} />
                                <strong>{item.time}</strong>
                            </div>

                            <div className="pt-class-color-line" />

                            <div className="pt-subject-icon">
                                <BookOpen size={22} />
                            </div>

                            <div className="pt-class-information">
                                <span
                                    className={`pt-subject-tag ${subjectColors[item.subject] || "default"
                                        }`}
                                >
                                    {item.subject}
                                </span>
                                <h5>{item.subject}</h5>
                                <div className="pt-class-details">
                                    <span>
                                        <UserRound size={14} /> {item.teacher}
                                    </span>
                                    <span>
                                        <MapPin size={14} /> {item.room}
                                    </span>
                                </div>
                            </div>

                            <div className="pt-class-number">
                                {String(index + 1).padStart(2, "0")}
                            </div>
                        </motion.div>
                    ))}

                    {/* Break Information */}
                    <div className="pt-break-card">
                        <Coffee size={20} />
                        <div>
                            <strong>Break Time</strong>
                            <span>10:00 - 10:30 · Morning break</span>
                        </div>
                    </div>
                </motion.div>
            </AnimatePresence>

            {/* Timetable Information */}
            <div className="pt-information-card">
                <div className="pt-information-icon">
                    <School size={23} />
                </div>
                <div>
                    <h5>Timetable Information</h5>
                    <p>
                        This timetable is provided for viewing purposes. For changes to
                        class schedules, please contact the school administration or the
                        child's class teacher.
                    </p>
                </div>
            </div>
        </div>
    );
}

export default ParentTimetable;
